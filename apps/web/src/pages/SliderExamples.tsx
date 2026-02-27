import { useState, useRef } from 'react'
import SEO from '../components/SEO'

const SLIDER_CARDS = [
  { id: 1, title: 'Rezidențial', image: '/images/home/slider-apple/slide1-baterii-rezidential.jpg', color: 'from-emerald-600/80' },
  { id: 2, title: 'Industrial', image: '/images/home/slider-apple/slide2-baterii-industrial.jpg', color: 'from-amber-700/80' },
  { id: 3, title: 'Medical', image: '/images/home/slider-apple/slide3-baterii-medical.jpg', color: 'from-sky-600/80' },
  { id: 4, title: 'Instalatori', image: '/images/home/slider-apple/slide4-instalatori.jpg', color: 'from-slate-700/80' },
]

/* ── Example 1: Viewport-based height (min-h-[min(360px, 45vh)]) ── */
function SliderExample1() {
  const [active, setActive] = useState(0)
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-600">1. Viewport-based height (min-h-[min(360px, 45vh)])</h3>
      <div className="relative rounded-xl overflow-hidden min-h-[min(360px,45vh)] bg-zinc-300">
        {SLIDER_CARDS.map((card, i) => (
          <div
            key={card.id}
            className={`absolute inset-0 transition-opacity duration-500 ${active === i ? 'opacity-100 z-10' : 'opacity-0'}`}
          >
            <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-t ${card.color} to-transparent`} />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white text-lg font-bold drop-shadow-lg">{card.title}</p>
            </div>
          </div>
        ))}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {SLIDER_CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`size-2 rounded-full transition-colors ${active === i ? 'bg-white' : 'bg-white/50'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Example 2: Aspect ratio 4:3 ── */
function SliderExample2() {
  const [active, setActive] = useState(0)
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-600">2. Aspect ratio 4:3</h3>
      <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-zinc-300">
        {SLIDER_CARDS.map((card, i) => (
          <div
            key={card.id}
            className={`absolute inset-0 transition-opacity duration-500 ${active === i ? 'opacity-100 z-10' : 'opacity-0'}`}
          >
            <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-t ${card.color} to-transparent`} />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white text-lg font-bold drop-shadow-lg">{card.title}</p>
            </div>
          </div>
        ))}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {SLIDER_CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`size-2 rounded-full transition-colors ${active === i ? 'bg-white' : 'bg-white/50'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Example 3: Fixed min-height (280px) – current approach ── */
function SliderExample3() {
  const [active, setActive] = useState(0)
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-600">3. Fixed min-height (min-h-[280px])</h3>
      <div className="relative rounded-xl overflow-hidden min-h-[280px] bg-zinc-300">
        {SLIDER_CARDS.map((card, i) => (
          <div
            key={card.id}
            className={`absolute inset-0 transition-opacity duration-500 ${active === i ? 'opacity-100 z-10' : 'opacity-0'}`}
          >
            <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-t ${card.color} to-transparent`} />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white text-lg font-bold drop-shadow-lg">{card.title}</p>
            </div>
          </div>
        ))}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {SLIDER_CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`size-2 rounded-full transition-colors ${active === i ? 'bg-white' : 'bg-white/50'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Example 4: Horizontal scroll snap (cards) ── */
function SliderExample4() {
  const scrollRef = useRef<HTMLDivElement>(null)
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-600">4. Horizontal scroll snap (swipe cards)</h3>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-5 px-5 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {SLIDER_CARDS.map((card) => (
          <div
            key={card.id}
            className="relative flex-shrink-0 w-[85vw] max-w-[340px] aspect-[4/3] rounded-xl overflow-hidden snap-center bg-zinc-300"
          >
            <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-t ${card.color} to-transparent`} />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white text-lg font-bold drop-shadow-lg">{card.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SliderExamples() {
  return (
    <>
      <SEO title="Slider Examples – Mobile" description="Demo page for mobile slider layouts" />
      <div className="max-w-content mx-auto px-5 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mobile Slider Examples</h1>
        <p className="text-gray-600 text-sm mb-8">
          Resize your browser or use DevTools device mode to see how each slider behaves on mobile viewports.
        </p>

        {/* Mobile viewport frame (max 430px to simulate phone) */}
        <div className="max-w-[430px] mx-auto space-y-10 border border-gray-200 rounded-2xl p-5 bg-gray-50/50">
          <SliderExample1 />
          <SliderExample2 />
          <SliderExample3 />
          <SliderExample4 />
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Summary</h2>
          <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
            <li><strong>Example 1</strong>: Scales with viewport (45vh), caps at 360px – good for varied screen heights</li>
            <li><strong>Example 2</strong>: Fixed 4:3 ratio – consistent proportions across devices</li>
            <li><strong>Example 3</strong>: Fixed 280px min – current homepage approach</li>
            <li><strong>Example 4</strong>: Horizontal swipe cards – native-feeling scroll</li>
          </ul>
        </div>
      </div>
    </>
  )
}
