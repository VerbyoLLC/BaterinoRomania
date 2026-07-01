import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthToken } from '../../lib/api'
import {
  buildDonutSegments,
  DEFAULT_PRICE_CALC_INPUTS,
  eur,
  nf,
  priceCalcBanner,
  priceCalcNote,
  priceCalcSlices,
  priceCalcStats,
  resolvePriceCalc,
  ron,
  type PriceCalcChannel,
  type PriceCalcInputs,
  type PriceCalcMode,
} from '../../lib/priceCalculator'
import {
  createPriceCalcScenario,
  readPriceCalcScenarios,
  writePriceCalcScenarios,
  type PriceCalcScenario,
} from '../../lib/priceCalculatorScenarios'
import './admin-price-calculator.css'

type FieldKey = keyof PriceCalcInputs

const CHANNELS: { id: PriceCalcChannel; title: string; sub: string }[] = [
  { id: 'full', title: 'Full chain', sub: 'Dist → Inst → client' },
  { id: 'direct', title: 'Direct', sub: 'you → client' },
  { id: 'installer', title: 'Via installer', sub: 'you → inst → client' },
  { id: 'distributor', title: 'Via distributor', sub: 'you → dist → client' },
]

function numInput(
  key: FieldKey,
  value: number,
  onChange: (key: FieldKey, raw: string) => void,
  opts: { unit: string; disabled?: boolean; computed?: boolean; step?: number },
) {
  return (
    <div className="pc-inwrap">
      <input
        type="number"
        id={key}
        value={Number.isFinite(value) ? value : ''}
        step={opts.step ?? (key === 'fx' ? 0.01 : key === 'vat' || key === 'dinst' || key === 'ddist' ? 1 : 25)}
        disabled={opts.disabled}
        className={opts.computed ? 'pc-computed' : undefined}
        onChange={(e) => onChange(key, e.target.value)}
      />
      <span className="pc-unit">{opts.unit}</span>
    </div>
  )
}

export default function AdminPriceCalculator() {
  const navigate = useNavigate()
  const [inputs, setInputs] = useState<PriceCalcInputs>(DEFAULT_PRICE_CALC_INPUTS)
  const [mode, setMode] = useState<PriceCalcMode>('rrp')
  const [channel, setChannel] = useState<PriceCalcChannel>('full')
  const [productTag, setProductTag] = useState('TR8500WX · RON native')
  const [scenarioName, setScenarioName] = useState('')
  const [scenarios, setScenarios] = useState<PriceCalcScenario[]>(() => readPriceCalcScenarios())
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null)
  const [scenarioMsg, setScenarioMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [scenariosOpen, setScenariosOpen] = useState(false)

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    writePriceCalcScenarios(scenarios)
  }, [scenarios])

  useEffect(() => {
    if (!scenariosOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setScenariosOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [scenariosOpen])

  const onField = (key: FieldKey, raw: string) => {
    const n = parseFloat(raw)
    setInputs((prev) => ({ ...prev, [key]: Number.isFinite(n) ? n : 0 }))
    setActiveScenarioId(null)
    setScenarioMsg(null)
  }

  const snapshotInputs = useCallback(
    (displayRrp: number, displayProfit: number): PriceCalcInputs => ({
      ...inputs,
      rrp: displayRrp,
      profit: displayProfit,
    }),
    [inputs],
  )

  const loadScenario = (scenario: PriceCalcScenario) => {
    setInputs(scenario.inputs)
    setMode(scenario.mode)
    setChannel(scenario.channel)
    if (scenario.productTag) setProductTag(scenario.productTag)
    setActiveScenarioId(scenario.id)
    setScenarioMsg({ kind: 'ok', text: `Loaded “${scenario.name}”.` })
  }

  const deleteScenario = (id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id))
    if (activeScenarioId === id) setActiveScenarioId(null)
    setScenarioMsg(null)
  }

  const { resolved, computedRrp, computedProfit } = useMemo(
    () => resolvePriceCalc(inputs, mode),
    [inputs, mode],
  )

  const displayRrp = mode === 'profit' ? computedRrp : inputs.rrp
  const displayProfit = mode === 'profit' ? inputs.profit : computedProfit

  const saveScenario = useCallback(() => {
    const name = scenarioName.trim()
    if (!name) {
      setScenarioMsg({ kind: 'err', text: 'Enter a scenario name before saving.' })
      return
    }
    const tag = productTag.trim() || 'RON native'
    const saved = createPriceCalcScenario({
      name,
      productTag: tag,
      inputs: snapshotInputs(displayRrp, displayProfit),
      mode,
      channel,
    })
    setScenarios((prev) => [saved, ...prev])
    setActiveScenarioId(saved.id)
    setScenarioName('')
    setScenarioMsg({ kind: 'ok', text: `Saved “${name}”.` })
  }, [
    scenarioName,
    productTag,
    snapshotInputs,
    displayRrp,
    displayProfit,
    mode,
    channel,
  ])

  const slices = useMemo(() => priceCalcSlices(resolved, channel), [resolved, channel])
  const { segments, invalid } = useMemo(
    () => buildDonutSegments(slices, resolved.rrpEx),
    [slices, resolved.rrpEx],
  )
  const banner = useMemo(() => priceCalcBanner(resolved, channel, mode), [resolved, channel, mode])
  const note = useMemo(() => priceCalcNote(resolved, channel, mode), [resolved, channel, mode])
  const stats = useMemo(() => priceCalcStats(resolved, channel), [resolved, channel])

  return (
    <div className="admin-price-calculator">
      <div className="pc-wrap">
        <div className="pc-head">
          <h1>Baterino price split</h1>
          <span className="pc-tag">{productTag}</span>
          <div className="pc-head-actions">
            <button
              type="button"
              className="pc-scenarios-trigger pc-scenarios-trigger-secondary"
              onClick={() => setScenariosOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={scenariosOpen}
            >
              Load scenario
              {scenarios.length > 0 ? (
                <span className="pc-scenarios-count pc-scenarios-count-muted">{scenarios.length}</span>
              ) : null}
            </button>
            <button
              type="button"
              className="pc-scenarios-trigger"
              onClick={() => setScenariosOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={scenariosOpen}
            >
              Save
            </button>
          </div>
        </div>
        <p className="pc-sub">
          Every figure is RON; euro shown beneath at your rate. The pie splits RRP ex-VAT by who keeps
          what in the chosen sales path.
        </p>

        <div className="pc-grid">
          <div className="pc-card">
            <div className="pc-modeswitch">
              <button
                type="button"
                className={mode === 'rrp' ? 'pc-on' : undefined}
                onClick={() => {
                  setMode('rrp')
                  setActiveScenarioId(null)
                  setScenarioMsg(null)
                }}
              >
                Build from RRP
                <small>profit is the leftover</small>
              </button>
              <button
                type="button"
                className={mode === 'profit' ? 'pc-on' : undefined}
                onClick={() => {
                  setMode('profit')
                  setActiveScenarioId(null)
                  setScenarioMsg(null)
                }}
              >
                Build from profit
                <small>profit is locked in</small>
              </button>
            </div>

            <div className="pc-group">
              <p className="pc-glabel">Prices · incl. VAT</p>
              <div className="pc-row">
                <label>
                  RRP{' '}
                  <small className={mode === 'rrp' ? 'pc-drv' : 'pc-drvtag'}>
                    {mode === 'profit' ? '· auto' : '· you set'}
                  </small>
                </label>
                {numInput('rrp', displayRrp, onField, {
                  unit: 'RON',
                  disabled: mode === 'profit',
                  computed: mode === 'profit',
                  step: 50,
                })}
              </div>
              <div className="pc-row">
                <label>
                  MAP <small className="pc-muted">(floor to advertise)</small>
                </label>
                {numInput('map', inputs.map, onField, { unit: 'RON', step: 50 })}
              </div>
              <div className="pc-row">
                <label>VAT</label>
                {numInput('vat', inputs.vat, onField, { unit: '%' })}
              </div>
            </div>

            <div className="pc-group">
              <p className="pc-glabel">Cost &amp; profit</p>
              <div className="pc-row">
                <label>Landed cost</label>
                {numInput('landed', inputs.landed, onField, { unit: 'RON' })}
              </div>
              <div className="pc-row">
                <label>
                  Baterino profit{' '}
                  <small className={mode === 'profit' ? 'pc-drv' : 'pc-drvtag'}>
                    {mode === 'profit' ? '· you set' : '· auto'}
                  </small>
                </label>
                {numInput('profit', displayProfit, onField, {
                  unit: 'RON',
                  disabled: mode === 'rrp',
                  computed: mode === 'rrp',
                })}
              </div>
              <div className="pc-row">
                <label>
                  Min floor <small className="pc-muted">(min profit ok)</small>
                </label>
                {numInput('cushion', inputs.cushion, onField, { unit: 'RON', step: 50 })}
              </div>
            </div>

            <div className="pc-group">
              <p className="pc-glabel">Discounts off RRP</p>
              <div className="pc-row">
                <label>Installer</label>
                {numInput('dinst', inputs.dinst, onField, { unit: '%' })}
              </div>
              <div className="pc-row">
                <label>
                  Distributor <small className="pc-muted">(lowest price)</small>
                </label>
                {numInput('ddist', inputs.ddist, onField, { unit: '%' })}
              </div>
            </div>

            <div className="pc-group">
              <p className="pc-glabel">Reference</p>
              <div className="pc-row">
                <label>EUR / RON</label>
                {numInput('fx', inputs.fx, onField, { unit: 'rate' })}
              </div>
            </div>
          </div>

          <div className="pc-card">
            <div className="pc-tabs">
              {CHANNELS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`pc-tab${channel === tab.id ? ' pc-on' : ''}`}
                  onClick={() => {
                    setChannel(tab.id)
                    setActiveScenarioId(null)
                    setScenarioMsg(null)
                  }}
                >
                  <b>{tab.title}</b>
                  {tab.sub}
                </button>
              ))}
            </div>

            <div className="pc-vizrow">
              <div className="pc-donutwrap">
                <svg viewBox="0 0 246 246" width="246" height="246" aria-hidden>
                  {invalid ? (
                    <circle
                      cx={123}
                      cy={123}
                      r={(110 + 66) / 2}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth={110 - 66}
                    />
                  ) : (
                    segments.map((seg, i) => (
                      <g key={i}>
                        <path d={seg.d} fill={seg.fill} stroke="#ffffff" strokeWidth={2.5} />
                        {seg.label ? (
                          <text
                            x={seg.label.x}
                            y={seg.label.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={13}
                            fontWeight={700}
                            fill="#fff"
                          >
                            {seg.label.text}
                          </text>
                        ) : null}
                      </g>
                    ))
                  )}
                </svg>
                <div className="pc-center">
                  <span className="pc-k">RRP ex-VAT</span>
                  <span className="pc-big">{nf(resolved.rrpEx)} RON</span>
                  <span className="pc-e">{eur(resolved.rrpEx, resolved.fx)}</span>
                </div>
              </div>

              <div className="pc-legend">
                {slices.map((x) => {
                  const total = resolved.rrpEx
                  const pc = total > 0 ? (x.v / total) * 100 : 0
                  return (
                    <div key={x.key} className="pc-leg">
                      <span className="pc-dot" style={{ background: x.c }} />
                      <span className="pc-nm">
                        {x.nm}
                        <small>{x.sub}</small>
                      </span>
                      <span className="pc-vl">
                        {x.v < 0 ? <span className="pc-val-bad">{ron(x.v)}</span> : ron(x.v)}
                        <small>{eur(x.v, resolved.fx)}</small>
                      </span>
                      <span className="pc-pc">{pc.toFixed(1)}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className={`pc-banner ${banner.kind === 'ok' ? 'pc-ok' : 'pc-bad'}`}>
              <span className="pc-ic">{banner.kind === 'ok' ? '✓' : '✕'}</span>
              <div dangerouslySetInnerHTML={{ __html: banner.html }} />
            </div>

            <div className="pc-strip">
              <div className="pc-stat">
                <div className="pc-l">Baterino profit · this path</div>
                <div className="pc-v">
                  {ron(stats.margin)} <small>{eur(stats.margin, resolved.fx)}</small>
                </div>
              </div>
              <div className="pc-stat">
                <div className="pc-l">Deepest safe distributor discount</div>
                <div className="pc-v">
                  {(stats.deepest > 0 ? stats.deepest.toFixed(1) : '0.0')}%{' '}
                  <small>now {(resolved.dd * 100).toFixed(0)}%</small>
                </div>
              </div>
              <div className="pc-stat">
                <div className="pc-l">Tightest cushion · sale to distributor</div>
                <div className="pc-v">
                  {ron(stats.tight)} <small>{eur(stats.tight, resolved.fx)}</small>
                </div>
              </div>
            </div>

            <p className="pc-note">{note}</p>
          </div>
        </div>
      </div>

      <div
        aria-hidden={!scenariosOpen}
        className={`pc-scenarios-backdrop${scenariosOpen ? ' pc-open' : ''}`}
        onClick={() => setScenariosOpen(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Saved scenarios"
        className={`pc-scenarios-drawer${scenariosOpen ? ' pc-open' : ''}`}
      >
        <div className="pc-scenarios-drawer-head">
          <div>
            <h2>Saved scenarios</h2>
            <p>Name and store calculator setups for quick recall.</p>
          </div>
          <button
            type="button"
            className="pc-scenarios-close"
            onClick={() => setScenariosOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="pc-scenarios-drawer-body">
          <p className="pc-glabel">Save current</p>
          <label className="sr-only" htmlFor="scenario-name">
            Scenario name
          </label>
          <input
            id="scenario-name"
            type="text"
            className="pc-scenario-name"
            placeholder="e.g. 16 kWh battery"
            value={scenarioName}
            onChange={(e) => {
              setScenarioName(e.target.value)
              setScenarioMsg(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveScenario()
            }}
          />
          <label className="sr-only" htmlFor="scenario-tag">
            Product tag
          </label>
          <input
            id="scenario-tag"
            type="text"
            className="pc-scenario-tag"
            placeholder="Product tag (optional)"
            value={productTag}
            onChange={(e) => {
              setProductTag(e.target.value)
              setActiveScenarioId(null)
              setScenarioMsg(null)
            }}
          />
          <button
            type="button"
            className="pc-save-btn"
            onClick={saveScenario}
            disabled={!scenarioName.trim()}
          >
            Save scenario
          </button>
          {scenarioMsg ? (
            <p className={`pc-scenario-msg${scenarioMsg.kind === 'err' ? ' pc-err' : ''}`}>
              {scenarioMsg.text}
            </p>
          ) : null}

          {scenarios.length === 0 ? (
            <p className="pc-scenario-empty">
              No saved scenarios yet. Set your inputs, name the case (e.g. 16 kWh battery), then
              click Save scenario.
            </p>
          ) : (
            <>
              <p className="pc-glabel pc-scenario-list-label">Saved</p>
              <div className="pc-scenario-list">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`pc-scenario-item${activeScenarioId === scenario.id ? ' pc-active' : ''}`}
                  >
                    <div className="pc-scenario-item-head">
                      <div>
                        <p className="pc-scenario-item-title">{scenario.name}</p>
                        {scenario.productTag ? (
                          <p className="pc-scenario-item-tag">{scenario.productTag}</p>
                        ) : null}
                      </div>
                    </div>
                    <p className="pc-scenario-item-meta">
                      RRP {nf(scenario.inputs.rrp)} RON · Landed {nf(scenario.inputs.landed)} RON
                      <br />
                      Profit {nf(scenario.inputs.profit)} RON ·{' '}
                      {scenario.mode === 'profit' ? 'From profit' : 'From RRP'}
                    </p>
                    <div className="pc-scenario-actions">
                      <button
                        type="button"
                        className="pc-load-btn"
                        onClick={() => {
                          loadScenario(scenario)
                          setScenariosOpen(false)
                        }}
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        className="pc-delete-btn"
                        onClick={() => deleteScenario(scenario.id)}
                        aria-label={`Delete ${scenario.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
