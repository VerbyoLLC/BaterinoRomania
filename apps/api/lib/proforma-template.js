/**
 * HTML proforma — design sistem (DM Serif / Sans / Mono). Randat la PDF cu Puppeteer
 * și încărcat în R2 la `orders/<orderId>/` (același prefix ca factura / PDF-uri comandă).
 */

const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

/** Telefon principal Baterino Energy SRL — folosit pe proformă dacă lipsește telefonul din DB / `BATERINO_OFFICE_PHONE`. */
const BATERINO_FALLBACK_MAIN_PHONE = "+40770106374";

function resolveBaterinoMainPhone(sup) {
  const fromSup = String(sup?.phone ?? "").trim();
  if (fromSup) return fromSup;
  const fromEnv = String(process.env.BATERINO_OFFICE_PHONE ?? "").trim();
  if (fromEnv) return fromEnv;
  return BATERINO_FALLBACK_MAIN_PHONE;
}

/**
 * Încarcă logo-ul Baterino o singură dată per proces și îl întoarce ca data URL
 * (PDF-ul rămâne self-contained — Puppeteer nu trebuie să facă HTTP fetch în render).
 * Suportă SVG (preferat) sau PNG. Dacă fișierul lipsește, întoarce `null`.
 */
function loadBaterinoLogoDataUrl() {
  const candidates = [
    process.env.BATERINO_LOGO_FILE,
    path.resolve(
      __dirname,
      "..",
      "..",
      "web",
      "public",
      "images",
      "shared",
      "baterino-logo-black.svg",
    ),
  ].filter(Boolean);
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue;
      const buf = fs.readFileSync(p);
      const ext = path.extname(p).toLowerCase();
      const mime =
        ext === ".svg"
          ? "image/svg+xml"
          : ext === ".png"
            ? "image/png"
            : ext === ".jpg" || ext === ".jpeg"
              ? "image/jpeg"
              : "application/octet-stream";
      return `data:${mime};base64,${buf.toString("base64")}`;
    } catch {
      // try next candidate
    }
  }
  return null;
}

let _baterinoLogoDataUrl = null;
let _baterinoLogoLoaded = false;
function getBaterinoLogoDataUrl() {
  if (!_baterinoLogoLoaded) {
    _baterinoLogoDataUrl = loadBaterinoLogoDataUrl();
    _baterinoLogoLoaded = true;
  }
  return _baterinoLogoDataUrl;
}

/** Fallback dacă fișierul local nu e disponibil — folosește URL-ul public. */
function defaultProformaLogoUrl() {
  const base = String(
    process.env.FRONTEND_URL || process.env.BATERINO_ASSET_ORIGIN || "https://baterino.ro",
  )
    .trim()
    .replace(/\/$/, "");
  return `${base}/images/shared/baterino-logo-black.svg`;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Elimină fragmente gen „CAMERA 1” din adresă (afișare documente). */
function normalizeSupplierAddressForDisplay(addr) {
  let s = String(addr ?? "").trim();
  s = s.replace(/\s*,\s*CAMERA\s*1\b/gi, "");
  s = s.replace(/\bCAMERA\s*1\s*,?/gi, "");
  s = s.replace(/\s*,\s*,/g, ",").replace(/\s{2,}/g, " ").trim();
  return s;
}

/**
 * Extrage stradă / oraș / județ / cod poștal / țară dintr-un singur câmp text (furnizor).
 */
function parseSupplierAddressStructured(addr) {
  const normalized = normalizeSupplierAddressForDisplay(addr);
  if (!normalized) {
    return { streetLine: "", city: "", county: "", postal: "", country: "" };
  }

  let postal = "";
  let work = normalized.replace(/\s*,\s*,/g, ",").trim();
  const mPost = work.match(/\b(\d{6})\b/);
  if (mPost) {
    postal = mPost[1];
    work = work.replace(/\b\d{6}\b/, "").replace(/\s*,\s*,/g, ",").trim();
  }

  const segments = work
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  let country = "";
  let city = "";
  let county = "";
  const streetParts = [];

  for (const part of segments) {
    const p = part.trim();
    if (!p) continue;
    if (/^ROMANIA$/i.test(p)) {
      country = "România";
      continue;
    }
    if (/\bRom[aâ]nia\b/i.test(p) && p.length < 24) {
      country = "România";
      continue;
    }
    const mJud = p.match(/^\s*Jud\.?\s*(.+)$/iu);
    if (mJud) {
      county = mJud[1].trim();
      continue;
    }
    const orașIdx = p.search(/\bOraș\s+/iu);
    if (orașIdx >= 0) {
      const before = p.slice(0, orașIdx).trim().replace(/[\s,]+$/g, "");
      const afterOraș = p.slice(orașIdx).replace(/^\s*Oraș\s+/iu, "").trim();
      if (before) streetParts.push(before);
      if (afterOraș) city = afterOraș;
      continue;
    }
    streetParts.push(p);
  }

  const streetLine = streetParts.join(", ").replace(/^,\s*|,\s*$/g, "").trim();

  return {
    streetLine,
    city,
    county,
    postal,
    country: country || "",
  };
}

function mergeSupplierAddressFromEnv(parsed, sup) {
  const city =
    String(sup?.addressCity ?? "").trim() ||
    String(process.env.BATERINO_COMPANY_CITY ?? "").trim() ||
    parsed.city;
  const county =
    String(sup?.addressCounty ?? "").trim() ||
    String(process.env.BATERINO_COMPANY_COUNTY ?? "").trim() ||
    parsed.county;
  const postal =
    String(sup?.addressPostal ?? "").trim() ||
    String(process.env.BATERINO_COMPANY_POSTAL ?? "").trim() ||
    parsed.postal;
  const country =
    String(sup?.addressCountry ?? "").trim() ||
    String(process.env.BATERINO_COMPANY_COUNTRY ?? "").trim() ||
    parsed.country ||
    "România";
  const streetLine =
    String(sup?.addressStreet ?? "").trim() ||
    String(process.env.BATERINO_COMPANY_STREET ?? "").trim() ||
    parsed.streetLine;
  return { streetLine, city, county, postal, country };
}

/** Două rânduri: stradă apoi Județ · Oraș · Cod poștal · Țară (HTML escape). */
function formatPartyAddressTwoLinesHtml(parts) {
  const { streetLine, city, county, postal, country } = parts;
  const metaBits = [];
  if (county) metaBits.push(`Județ: ${escapeHtml(county)}`);
  if (city) metaBits.push(`Oraș: ${escapeHtml(city)}`);
  if (postal) metaBits.push(`Cod poștal: ${escapeHtml(postal)}`);
  if (country) metaBits.push(`Țară: ${escapeHtml(country)}`);
  const line2 = metaBits.join(" · ");
  const row1 = streetLine ? escapeHtml(streetLine) : "";
  if (!row1 && !line2) return "";
  const chunks = [];
  if (row1) chunks.push(`<div class="party-addr-row">${row1}</div>`);
  if (line2)
    chunks.push(`<div class="party-addr-row party-addr-meta">${line2}</div>`);
  return `<div class="party-address-two-lines">${chunks.join("")}</div>`;
}

/** Subsol beneficii: o linie — adresă · meta · Tel · support (dacă există). */
function formatBenefitsFooterContactLineHtml(address, sup, supportPhone) {
  const merged = mergeSupplierAddressFromEnv(
    parseSupplierAddressStructured(address),
    sup || {},
  );
  const bits = [];
  if (merged.streetLine) bits.push(escapeHtml(merged.streetLine));
  if (merged.county) bits.push(`Județ: ${escapeHtml(merged.county)}`);
  if (merged.city) bits.push(`Oraș: ${escapeHtml(merged.city)}`);
  const postalDisp = sanitizeRoPostalDisplay(merged.postal);
  if (postalDisp) bits.push(`Cod poștal: ${escapeHtml(postalDisp)}`);
  if (merged.country) bits.push(`Țară: ${escapeHtml(merged.country)}`);
  const tel = resolveBaterinoMainPhone(sup);
  if (tel) bits.push(`Tel.: ${escapeHtml(tel)}`);
  if (!bits.length) return escapeHtml("România");
  return bits.join(" · ");
}

/** Afișare cod poștal RO doar dacă are exact 6 cifre (evită numere lipite greșit în câmp). */
function sanitizeRoPostalDisplay(p) {
  const s = String(p ?? "").trim();
  return /^\d{6}$/.test(s) ? s : "";
}

/** Elimină cod poștal duplicat sau bucle lungi de cifre lipite greșit pe stradă (client). */
function cleanClientStreetLine(addr, postal) {
  let s = String(addr ?? "").trim();
  const p = String(postal ?? "").trim();
  if (p) {
    const esc = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    s = s.replace(new RegExp(`\\s*,?\\s*${esc}\\s*$`), "").trim();
  }
  s = s.replace(/\s*,\s*\d{8,}\s*$/u, "").trim();
  s = s.replace(/\s+(?:\+\d{1,3}\s*)?\d[\d\s]{10,}\s*$/u, "").trim();
  return s.replace(/^,\s*|,\s*$/g, "").trim();
}

function fmtMoney(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0.00";
  return x.toFixed(2);
}

/** Data calendaristică locală în format zz/ll/aaaa (proformă). */
function formatRoDateFromDate(d) {
  const x =
    d instanceof Date && !Number.isNaN(d.getTime()) ? d : new Date();
  const dd = String(x.getDate()).padStart(2, "0");
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const yyyy = x.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Data emiterii proformei și termen de plată: +30 zile față de emitere. */
function proformaIssueAndPaymentDueStrings(issueDate) {
  const issue =
    issueDate instanceof Date && !Number.isNaN(issueDate.getTime())
      ? issueDate
      : new Date();
  const due = new Date(
    issue.getFullYear(),
    issue.getMonth(),
    issue.getDate() + 30,
  );
  return {
    dateStr: formatRoDateFromDate(issue),
    paymentDueStr: formatRoDateFromDate(due),
  };
}

/**
 * Număr document proformă: același sufix ca la comanda `BTO-…`, cu seria `BTP` în antet.
 * ex. `BTO-20260511-A1B2C3D4` → `20260511-A1B2C3D4`.
 */
function proformaDocumentNumberFromOrderNumber(orderNumber) {
  const raw = String(orderNumber ?? "").trim();
  if (!raw) return "";
  if (/^BTO[-\s]/i.test(raw)) {
    const tail = raw.replace(/^BTO[-\s]+/i, "").trim();
    return tail || raw;
  }
  return raw;
}

function resolveProformaSeries(opts) {
  const fromOpts = String(opts?.proformaSeries ?? "").trim();
  if (fromOpts) return fromOpts;
  const fromEnv = String(process.env.BATERINO_PROFORMA_SERIA ?? "").trim();
  return fromEnv || "BTP";
}

/** Afișare RO: mii cu punct, zecimale cu virgulă (ex. 1.254,30). */
function fmtMoneyRo(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0,00";
  const parts = x.toFixed(2).split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${intPart},${parts[1]}`;
}

function fmtQty(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0";
  if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x));
  return fmtMoneyRo(x);
}

function shortBrandName(full) {
  const t = String(full ?? "").trim();
  if (!t) return "Baterino";
  const s = t.replace(/\s+S\.?R\.?L\.?$/i, "").trim();
  return s || t;
}

function hostFromQrPayload(u) {
  const s = String(u ?? "").trim();
  if (!s) return "";
  try {
    return new URL(s).hostname || s.slice(0, 48);
  } catch {
    return s.slice(0, 48);
  }
}

/** Pagina 2 din proformă — beneficii pentru clienți (texte statice, RO). */
const PROFORMA_CLIENT_BENEFITS_BOXES = [
  {
    icon: "price",
    title: "Program de reduceri",
    text:
      "Reduceri pentru seniori, zone rurale, recomandări între clienți și alte programe active — conform termenilor fiecărui program.",
  },
  {
    icon: "inverter",
    title: "99% compatibilitate invertoare",
    text:
      "Funcționează cu aproape orice invertor din România. Verifică rapid marca ta pe baterino.ro — cel mai probabil ești deja acoperit.",
  },
  {
    icon: "support",
    title: "Service și suport tehnic în România",
    text:
      "O echipă reală, în România, gata să te ajute. Indiferent dacă ai o întrebare tehnică sau una legată de comandă, cineva îți răspunde — fără să fii dat de la un capăt la altul.",
  },
  {
    icon: "warranty",
    title: "10 ani garanție",
    text:
      "Cumperi o dată și dormi liniștit 10 ani. Certificat oficial de garanție, verificabil oricând online — pentru că merită să știi că ești protejat.",
  },
  {
    icon: "swap",
    title: "Baterino SWAP",
    text:
      "Dacă bateria ta are o problemă în perioada de garanție, nu rămâi fără curent. Îți punem la dispoziție o baterie de schimb pe toată perioada cât echipamentul tău se află în service — și o înlocuim definitiv conform condițiilor de garanție.",
  },
  {
    icon: "return",
    title: "Retur în 15 zile",
    text:
      "Nu ești sigur? Cumperi, testezi, și dacă nu e ce te așteptai — returnezi în 15 zile, fără discuții complicate.",
  },
  {
    icon: "officialLithtech",
    title: "Importatori și distribuitori oficiali LithTech",
    text:
      "Cumperi direct de la sursa autorizată. Baterino este importator și distribuitor oficial LithTech în România și Europa — fără intermediari, fără produse gri, cu trasabilitate completă de la fabrică până la tine.",
  },
  {
    icon: "verifiedDelivery",
    title: "Produse verificate înainte de livrare",
    text:
      "Fiecare baterie trece printr-un proces de verificare tehnică înainte de a ajunge pe piață. Nu livrăm ce primim — livrăm ce am testat. Documentație completă, conformitate europeană, zero surprize.",
  },
];

/**
 * Iconițe identice cu pagina Beneficii (`ClientBenefits.tsx`):
 * — lucide-react v1.7.0: Percent, Headphones, Shield, ArrowLeftRight, Undo2 (paths din `node_modules/lucide-react/dist/esm/icons/*.js`)
 * — compatibilitate: același desen ca `apps/web/public/images/shared/compatibility-icon.svg`
 * — Globe, BadgeCheck: lucide-react v1.7.0 (noi pe proformă)
 */
function proformaBenefitIconSvg(iconKey) {
  const st =
    'xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#1a3a5c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  switch (iconKey) {
    case "price":
      return `<svg ${st} width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`;
    case "warranty":
      return `<svg ${st} width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`;
    case "support":
      return `<svg ${st} width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>`;
    case "swap":
      return `<svg ${st} width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>`;
    case "return":
      return `<svg ${st} width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>`;
    case "inverter":
      return `<svg ${st} width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18a4.5 4.5 0 0 1 0-9a4.5 4.5 0 0 0 0-9"/><circle cx="12" cy="8" r="1.35"/><circle cx="12" cy="16" r="1.35"/></svg>`;
    case "officialLithtech":
      return `<svg ${st} width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;
    case "verifiedDelivery":
      return `<svg ${st} width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>`;
    default:
      return `<svg ${st} width="28" height="28" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`;
  }
}

function buildSupplierPartyDetailHtml(sup) {
  const lines = [];
  if (sup.regCom && String(sup.regCom).trim()) {
    lines.push(`<span>Reg. com.:</span> ${escapeHtml(sup.regCom)}`);
  }
  if (sup.cui) lines.push(`<span>CUI:</span> ${escapeHtml(sup.cui)}`);
  if (sup.address && String(sup.address).trim()) {
    const merged = mergeSupplierAddressFromEnv(
      parseSupplierAddressStructured(sup.address),
      sup,
    );
    const addrInner = formatPartyAddressTwoLinesHtml(merged);
    if (addrInner) {
      lines.push(
        `<div class="party-address-field"><span>Adresă:</span>${addrInner}</div>`,
      );
    }
  }
  lines.push(
    `<span>Tel.:</span> ${escapeHtml(resolveBaterinoMainPhone(sup))}`,
  );
  if (sup.email && String(sup.email).trim()) {
    lines.push(`<span>Email:</span> ${escapeHtml(sup.email)}`);
  }
  if (sup.web && String(sup.web).trim()) {
    lines.push(`<span>Web:</span> ${escapeHtml(sup.web)}`);
  }
  return lines.length ? lines.join("<br>\n") : "—";
}

function buildClientPartyDetailHtml(cl) {
  const lines = [];
  if (cl.regCom && String(cl.regCom).trim()) {
    lines.push(`<span>Reg. com.:</span> ${escapeHtml(cl.regCom)}`);
  }
  if (cl.cui && String(cl.cui).trim() && cl.cui !== "—") {
    lines.push(`<span>CUI:</span> ${escapeHtml(cl.cui)}`);
  }
  const streetSrc = String(cl.addressStreet ?? cl.address ?? "").trim();
  const city = String(cl.city ?? "").trim();
  const county = String(cl.county ?? "").trim();
  const postalRaw = String(cl.postal ?? "").trim();
  const postal = sanitizeRoPostalDisplay(postalRaw);
  const country = String(cl.country ?? "").trim() || "România";
  if (streetSrc || city || county || postal || postalRaw) {
    const streetLine = cleanClientStreetLine(streetSrc, postalRaw);
    const addrInner = formatPartyAddressTwoLinesHtml({
      streetLine,
      city,
      county,
      postal,
      country,
    });
    if (addrInner) {
      lines.push(
        `<div class="party-address-field"><span>Adresă:</span>${addrInner}</div>`,
      );
    }
  }
  return lines.length ? lines.join("<br>\n") : "—";
}

/**
 * @param {object} params
 * @param {string} params.series
 * @param {string} params.number
 * @param {string} params.dateStr - dd/mm/yyyy
 * @param {number} params.vatRatePercent
 * @param {object} params.supplier
 * @param {object} params.client
 * @param {Array} params.lines
 * @param {string} params.paymentDueStr
 * @param {string} [params.note] - acceptat pentru compatibilitate; nu mai este randat
 * @param {string} [params.preparedBy]
 * @param {string} [params.orderReference]
 * @param {string} [params.qrUrl] - conținut QR (implicit: web furnizor sau FRONTEND_URL)
 * @param {string} [params.footerInvoicingLine] - primul rând din footer (lăsat gol = omis)
 * @returns {Promise<string>}
 */
async function buildProformaHtml(params) {
  const {
    series,
    number,
    dateStr,
    vatRatePercent,
    supplier,
    client,
    lines,
    paymentDueStr,
    preparedBy = "",
    orderReference = "",
    qrUrl: qrUrlParam = null,
    footerInvoicingLine: footerInvoicingLineParam = null,
    logoUrl: logoUrlParam = null,
  } = params;

  const sup = supplier || {};
  const cl = client || {};
  const brandShort = escapeHtml(shortBrandName(sup.name));

  const logoSrc = logoUrlParam
    ? String(logoUrlParam).trim()
    : getBaterinoLogoDataUrl() || defaultProformaLogoUrl();
  const logoMarkup = logoSrc
    ? `<img class="brand-logo" src="${escapeHtml(logoSrc)}" alt="${brandShort}">`
    : `<span class="brand-fallback">${brandShort}</span>`;
  const docRef = orderReference || number || "—";
  const vatStr = escapeHtml(String(vatRatePercent));
  const metaLine2 = orderReference
    ? `Cotă TVA: ${vatStr}% &nbsp;·&nbsp; Referință comandă: ${escapeHtml(orderReference)}`
    : `Cotă TVA: ${vatStr}%`;

  let totalExcl = 0;
  let totalVat = 0;
  let totalIncl = 0;
  for (const L of lines) {
    totalExcl += Number(L.lineTotalExcl) || 0;
    totalVat += Number(L.lineVat) || 0;
    totalIncl += (Number(L.lineTotalExcl) || 0) + (Number(L.lineVat) || 0);
  }

  const lineRows = (Array.isArray(lines) ? lines : [])
    .map(
      (L) => `
        <tr>
          <td class="nr center">${escapeHtml(String(L.index))}</td>
          <td>${escapeHtml(L.name)}</td>
          <td class="center">${escapeHtml(L.um)}</td>
          <td class="center">${escapeHtml(fmtQty(L.qty))}</td>
          <td class="right">${escapeHtml(fmtMoneyRo(L.unitPriceExcl))}</td>
          <td class="right">${escapeHtml(fmtMoneyRo(L.lineTotalExcl))}</td>
          <td class="right">${escapeHtml(fmtMoneyRo(L.lineVat))}</td>
        </tr>`,
    )
    .join("");

  const emptyRow =
    '<tr class="empty-row"><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
  const emptyRows = emptyRow;

  /**
   * QR encodează numărul comenzii (referință plată) ca să poată fi scanat
   * și copiat în descrierea transferului. Când nu există order reference,
   * facem fallback la web-ul furnizorului.
   */
  const qrPayload =
    (qrUrlParam && String(qrUrlParam).trim()) ||
    (orderReference && String(orderReference).trim()) ||
    (sup.web && String(sup.web).trim()) ||
    String(process.env.FRONTEND_URL || "https://baterino.ro")
      .trim()
      .replace(/\/$/, "");

  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 200,
      margin: 1,
      errorCorrectionLevel: "M",
    });
  } catch {
    qrDataUrl = "";
  }

  const benefitsAccountQrUrl = "https://baterino.ro";
  let benefitsSiteQrDataUrl = "";
  try {
    benefitsSiteQrDataUrl = await QRCode.toDataURL(benefitsAccountQrUrl, {
      width: 220,
      margin: 1,
      errorCorrectionLevel: "M",
    });
  } catch {
    benefitsSiteQrDataUrl = "";
  }

  /** Eticheta de jos: dacă QR-ul conține un URL afișăm hostname; altfel chiar payload-ul (ex. numărul comenzii). */
  const qrCaption = (() => {
    const t = String(qrPayload).trim();
    if (/^https?:\/\//i.test(t)) return hostFromQrPayload(t);
    return t.length > 28 ? `${t.slice(0, 25)}…` : t;
  })();
  const qrCaptionHtml = escapeHtml(qrCaption);
  const qrIsOrderRef =
    !!orderReference && String(qrPayload).trim() === String(orderReference).trim();
  const qrTopLabel = qrIsOrderRef ? "Scanează pentru număr comandă" : brandShort;

  const codDoc = escapeHtml(
    `${String(series).trim()}-${String(number).trim()}`.replace(/\s+/g, ""),
  );
  const footerLine1 =
    footerInvoicingLineParam != null && String(footerInvoicingLineParam).trim()
      ? escapeHtml(String(footerInvoicingLineParam).trim())
      : (() => {
          const env = String(
            process.env.BATERINO_PROFORMA_FOOTER_LINE1 || "",
          ).trim();
          return env ? escapeHtml(env) : "";
        })();

  const footerLeftParts = [];
  if (footerLine1) {
    footerLeftParts.push(
      `${footerLine1} &nbsp;·&nbsp; Cod document: ${codDoc}`,
    );
  } else {
    footerLeftParts.push(`Cod document: ${codDoc}`);
  }
  const cap = sup.capitalSocial && String(sup.capitalSocial).trim();
  const tailBits = [];
  if (cap) tailBits.push(`Capital social: ${escapeHtml(cap)}`);
  if (sup.email && String(sup.email).trim())
    tailBits.push(escapeHtml(sup.email));
  if (sup.web && String(sup.web).trim()) tailBits.push(escapeHtml(sup.web));
  if (tailBits.length) footerLeftParts.push(tailBits.join(" &nbsp;·&nbsp; "));
  const footerLeftHtml = footerLeftParts.join("<br>\n");

  const supplierBlock = buildSupplierPartyDetailHtml(sup);
  const clientBlock = buildClientPartyDetailHtml(cl);

  const benefitsFooterSupportPhone =
    String(sup.supportPhone || "").trim() ||
    String(process.env.BATERINO_SUPPORT_PHONE || "").trim();
  const benefitsFooterContactLineHtml = formatBenefitsFooterContactLineHtml(
    sup.address,
    sup,
    benefitsFooterSupportPhone,
  );

  const clientBenefitsBoxesHtml = PROFORMA_CLIENT_BENEFITS_BOXES.map(
    (b) => `
    <div class="benefit-box">
      <div class="benefit-icon" aria-hidden="true">${proformaBenefitIconSvg(b.icon)}</div>
      <h3>${escapeHtml(b.title)}</h3>
      <p>${escapeHtml(b.text)}</p>
    </div>`,
  ).join("");

  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Proformă – ${escapeHtml(sup.name || "—")}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --ink: #0e0e0e;
    --ink-mid: #444;
    --ink-soft: #888;
    --ink-faint: #bbb;
    --rule: #e0e0e0;
    --bg: #fafaf8;
    --paper: #ffffff;
    --accent: #1a3a5c;
    --mono: 'DM Mono', monospace;
    --serif: 'DM Serif Display', serif;
    --sans: 'DM Sans', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    font-family: var(--sans);
    color: var(--ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 40px 20px;
    gap: 40px;
  }

  .page {
    background: var(--paper);
    width: 794px;
    padding: 52px 56px 56px;
    box-shadow: 0 2px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
    position: relative;
  }

  .page::before, .page::after {
    content: '';
    position: absolute;
    width: 32px;
    height: 32px;
    border-color: var(--accent);
    border-style: solid;
  }
  .page::before { top: 18px; left: 18px; border-width: 2px 0 0 2px; }
  .page::after  { bottom: 18px; right: 18px; border-width: 0 2px 2px 0; }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 36px;
    gap: 24px;
  }

  .header-left { flex: 1; }

  .logo-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .brand-logo {
    height: 36px;
    width: auto;
    max-width: 220px;
    display: block;
    object-fit: contain;
  }

  .brand-fallback {
    font-family: var(--sans);
    font-weight: 600;
    font-size: 20px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink);
  }

  .doc-title {
    font-family: var(--serif);
    font-size: 28px;
    color: var(--ink);
    line-height: 1.1;
    margin-bottom: 8px;
  }

  .doc-meta {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--ink-mid);
    letter-spacing: 0.04em;
    border-left: 3px solid var(--accent);
    padding-left: 10px;
    line-height: 1.7;
  }

  .qr-block {

    display: flex;

    flex-direction: column;

    align-items: center;

    gap: 8px;

    flex-shrink: 0;

  }

  .qr-label {

    font-family: var(--mono);

    font-size: 8.5px;

    font-weight: 500;

    letter-spacing: 0.12em;

    text-transform: uppercase;

    color: var(--accent);

    text-align: center;

    max-width: 108px;

    word-break: break-word;

  }

  .qr-img {

    width: 100px; height: 100px;

    border: 1px solid var(--rule);

    padding: 5px;

    background: white;

    display: block;

    object-fit: contain;

  }

  .qr-fallback {

    width: 100px; height: 100px;

    border: 1px dashed var(--rule);

    font-size: 8px;

    color: var(--ink-soft);

    display: flex;

    align-items: center;

    justify-content: center;

    text-align: center;

    padding: 4px;

  }



  hr.rule {

    border: none;

    border-top: 1px solid var(--rule);

    margin: 0 0 28px;

  }



  .parties {

    display: grid;

    grid-template-columns: 1fr 1fr;

    gap: 16px;

    margin-bottom: 28px;

  }



  .party-card {

    border: none;

    background: #f7f7f7;

    border-radius: 14px;

    padding: 14px 16px;

  }



  .party-card-label {

    font-family: var(--mono);

    font-size: 8.5px;

    font-weight: 500;

    letter-spacing: 0.14em;

    text-transform: uppercase;

    color: var(--ink-soft);

    padding-bottom: 0;

    margin-bottom: 4px;

    border-bottom: none;

  }



  .party-name {

    font-family: var(--sans);

    font-weight: 600;

    font-size: 13px;

    color: var(--ink);

    margin-bottom: 6px;

  }

  .party-email {

    font-family: var(--sans);

    font-size: 10.5px;

    font-weight: 400;

    color: var(--ink-mid);

    margin-top: -2px;

    margin-bottom: 8px;

    line-height: 1.35;

    word-break: break-all;

  }



  .party-detail {

    font-size: 10.5px;

    color: var(--ink-mid);

    line-height: 1.65;

  }

  .party-detail span {

    color: var(--ink-soft);

    font-size: 9.5px;

  }

  .party-address-field span:first-child {

    color: var(--ink-soft);

    font-size: 9.5px;

  }

  .party-address-field {

    margin-top: 4px;

  }

  .party-address-two-lines {

    margin-top: 4px;

    font-size: 10.5px;

    color: var(--ink-mid);

    line-height: 1.5;

  }

  .party-address-two-lines .party-addr-row:first-child {

    font-weight: 500;

    color: var(--ink);

  }

  .party-address-two-lines .party-addr-meta {

    margin-top: 3px;

    font-size: 10px;

    color: var(--ink-mid);

  }



  .table-wrap { margin-bottom: 0; }



  table {

    width: 100%;

    border-collapse: collapse;

    font-size: 11px;

  }



  thead tr {

    background: var(--ink);

    color: white;

  }



  thead th {

    font-family: var(--mono);

    font-size: 8.5px;

    font-weight: 500;

    letter-spacing: 0.1em;

    text-transform: uppercase;

    padding: 10px 12px;

    text-align: left;

  }

  thead th.right { text-align: right; }

  thead th.center { text-align: center; }



  tbody tr {

    border-bottom: 1px solid var(--rule);

  }

  tbody tr:nth-child(even) { background: #fafafa; }



  tbody td {

    padding: 11px 12px;

    font-size: 11px;

    color: var(--ink-mid);

    vertical-align: top;

  }

  tbody td.right { text-align: right; font-family: var(--mono); font-size: 11px; color: var(--ink); }

  tbody td.center { text-align: center; }

  tbody td.nr { color: var(--ink-faint); font-family: var(--mono); font-size: 10px; }



  .empty-row td { padding: 8px 12px; color: transparent; border-bottom: 1px solid #f2f2f2; }



  .totals-row {

    display: flex;

    justify-content: flex-end;

    margin-top: 0;

    border-top: 2px solid var(--ink);

  }



  .totals-box {

    width: 320px;

    border: 1px solid var(--rule);

    border-top: none;

  }



  .total-line {

    display: flex;

    justify-content: space-between;

    align-items: center;

    padding: 9px 14px;

    border-bottom: 1px solid var(--rule);

    font-size: 11px;

  }

  .total-line:last-child { border-bottom: none; }



  .total-line .label {

    font-family: var(--mono);

    font-size: 9px;

    letter-spacing: 0.1em;

    text-transform: uppercase;

    color: var(--ink-soft);

  }

  .total-line .val {

    font-family: var(--mono);

    font-size: 12px;

    font-weight: 500;

    color: var(--ink);

  }



  .total-line.grand {

    background: var(--ink);

  }

  .total-line.grand .label { color: #aaa; }

  .total-line.grand .val { color: white; font-size: 14px; }



  .bottom-grid {

    display: grid;

    grid-template-columns: 1fr 1fr;

    gap: 16px;

    margin-top: 24px;

    margin-bottom: 28px;

  }



  .info-card {

    border: 1px solid var(--rule);

    padding: 14px 16px;

  }



  .info-card-label {

    font-family: var(--mono);

    font-size: 8.5px;

    font-weight: 500;

    letter-spacing: 0.14em;

    text-transform: uppercase;

    color: var(--ink-soft);

    padding-bottom: 8px;

    margin-bottom: 10px;

    border-bottom: 1px solid var(--rule);

  }



  .info-line {

    font-size: 10.5px;

    color: var(--ink-mid);

    line-height: 1.7;

  }

  .info-line b { font-weight: 600; color: var(--ink); }



  .sig-area {

    min-height: 60px;

    border-top: 1px solid var(--ink-faint);

    margin-top: 10px;

    padding-top: 5px;

    font-size: 8.5px;

    color: var(--ink-faint);

    font-style: italic;

  }



  .footer {

    border-top: 1px solid var(--rule);

    padding-top: 14px;

    display: flex;

    justify-content: space-between;

    align-items: center;

    gap: 12px;

  }



  .footer-text {

    font-size: 9px;

    color: var(--ink-faint);

    line-height: 1.6;

    font-style: italic;

  }



  .doc-id {

    font-family: var(--mono);

    font-size: 8.5px;

    color: var(--ink-faint);

    letter-spacing: 0.06em;

    white-space: nowrap;

    text-align: right;

  }

  /* —— Pagina 2: Beneficii clienți Baterino —— */

  .page.benefits-sheet {
    padding: 32px 42px 34px;
  }

  .page.benefits-sheet::before,
  .page.benefits-sheet::after {
    display: none;
  }

  .benefits-head {
    text-align: center;
    margin-bottom: 28px;
  }

  .benefits-logo-row {
    justify-content: center;
    margin-bottom: 14px;
  }

  .benefits-logo-row .brand-logo {
    height: 34px;
  }

  .benefits-title {
    font-family: var(--serif);
    font-size: 24px;
    font-weight: 400;
    color: var(--ink);
    line-height: 1.15;
  }

  .benefits-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .benefit-box {
    background: #f7f7f7;
    border: none;
    border-radius: 10px;
    padding: 16px 18px;
    min-height: 128px;
  }

  .benefit-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin-bottom: 10px;
    border-radius: 8px;
    background: #fff;
    border: none;
  }

  .benefit-icon svg {
    width: 26px;
    height: 26px;
  }

  .benefit-box h3 {
    font-family: var(--sans);
    font-size: 11.5px;
    font-weight: 600;
    color: var(--ink);
    margin: 0 0 6px 0;
    line-height: 1.28;
  }

  .benefit-box p {
    font-size: 9.5px;
    line-height: 1.42;
    color: var(--ink-mid);
    margin: 0;
  }

  .benefits-account-cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-top: 14px;
    padding: 22px 24px;
    background: #f7f7f7;
    border: none;
    border-radius: 10px;
    page-break-inside: avoid;
  }

  .benefits-account-cta-text {
    flex: 1;
    min-width: 0;
  }

  .benefits-account-cta-title {
    font-family: var(--sans);
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
    margin: 0 0 6px 0;
    line-height: 1.22;
    letter-spacing: -0.02em;
  }

  .benefits-account-cta-text p {
    font-size: 9.5px;
    line-height: 1.42;
    color: var(--ink-mid);
    margin: 0;
  }

  .benefits-account-cta-qr {
    flex-shrink: 0;
    text-align: center;
    width: 104px;
  }

  .benefits-account-cta-qr img {
    display: block;
    width: 104px;
    height: 104px;
    margin: 0 auto;
    border-radius: 4px;
    background: #fff;
  }

  .benefits-account-qr-caption {
    display: block;
    margin-top: 6px;
    font-size: 8.5px;
    color: var(--ink-soft);
    font-family: var(--sans);
    word-break: break-all;
  }

  .benefits-account-qr-fallback {
    display: block;
    font-size: 9px;
    color: var(--accent);
    word-break: break-all;
    max-width: 112px;
  }

  .benefits-company-footer {
    margin-top: 12px;
    padding-top: 10px;
    border-top: none;
    text-align: center;
    font-family: var(--sans);
    font-size: 8.25px;
    line-height: 1.45;
    color: var(--ink-mid);
    page-break-inside: avoid;
  }

  .benefits-company-name {
    font-weight: 600;
    color: var(--ink);
    font-size: 9px;
    margin: 0 0 5px 0;
  }

  .benefits-company-meta {
    margin: 0;
  }

  .benefits-company-single-line {
    white-space: normal;
    word-break: break-word;
  }



  @media print {

    body { background: white; padding: 0; gap: 0; flex-direction: column; }

    .page { box-shadow: none; width: 100%; }

    .benefits-sheet { page-break-before: always; break-before: page; }

  }

</style>

</head>

<body>



<div class="page">



  <div class="header">

    <div class="header-left">

      <div class="logo-row">
        ${logoMarkup}
      </div>

      <div class="doc-title">Proformă</div>

      <div class="doc-meta">

        Seria ${escapeHtml(series)} &nbsp;·&nbsp; Nr. ${escapeHtml(number)} &nbsp;·&nbsp; Data: ${escapeHtml(dateStr)}<br>

        ${metaLine2}

      </div>

    </div>

    <div class="qr-block">

      <div class="qr-label">${escapeHtml(qrTopLabel)}</div>

      ${
        qrDataUrl
          ? `<img class="qr-img" src="${qrDataUrl}" width="100" height="100" alt="QR cu numărul comenzii">`
          : `<div class="qr-fallback" role="img" aria-label="QR indisponibil">QR</div>`
      }

      <div class="qr-label">${qrCaptionHtml}</div>

    </div>

  </div>



  <hr class="rule">



  <div class="parties">

    <div class="party-card">

      <div class="party-card-label">Furnizor</div>

      <div class="party-name">${escapeHtml(sup.name || "—")}</div>

      <div class="party-detail">

        ${supplierBlock}

      </div>

    </div>

    <div class="party-card">

      <div class="party-card-label">Client</div>

      <div class="party-name">${escapeHtml(cl.name || "—")}</div>

      <div class="party-detail">

        ${clientBlock}

      </div>

      ${
        cl.email && String(cl.email).trim()
          ? `<div class="party-email">${escapeHtml(String(cl.email).trim())}</div>`
          : ""
      }

    </div>

  </div>



  <div class="table-wrap">

    <table>

      <thead>

        <tr>

          <th style="width:36px" class="center">Nr.</th>

          <th>Denumirea produselor sau a serviciilor</th>

          <th style="width:46px" class="center">U.M.</th>

          <th style="width:54px" class="center">Cant.</th>

          <th style="width:100px" class="right">Preț unitar<br>(fără TVA) Lei</th>

          <th style="width:90px" class="right">Valoare<br>Lei</th>

          <th style="width:90px" class="right">Valoare<br>TVA Lei</th>

        </tr>

      </thead>

      <tbody>

        ${lineRows}

        ${emptyRows}

      </tbody>

    </table>

  </div>



  <div class="totals-row">

    <div class="totals-box">

      <div class="total-line">

        <span class="label">Total (fără TVA)</span>

        <span class="val">${escapeHtml(fmtMoneyRo(totalExcl))} Lei</span>

      </div>

      <div class="total-line">

        <span class="label">TVA (${vatStr}%)</span>

        <span class="val">${escapeHtml(fmtMoneyRo(totalVat))} Lei</span>

      </div>

      <div class="total-line grand">

        <span class="label">Total de plată</span>

        <span class="val">${escapeHtml(fmtMoneyRo(totalIncl))} Lei</span>

      </div>

    </div>

  </div>



  <div class="bottom-grid">

    <div class="info-card">

      <div class="info-card-label">Informații suplimentare</div>

      <div class="info-line"><b>Termen de plată:</b> ${escapeHtml(paymentDueStr)}</div>

      <div class="info-line"><b>Tip document:</b> Proformă · Comandă ${escapeHtml(docRef)}</div>

      <div class="info-line"><b>Întocmit de:</b> ${escapeHtml(preparedBy || "—")}</div>

    </div>

    <div class="info-card">

      <div class="info-card-label">Cum achiți factura prin <span style="font-weight:700; color:var(--ink);">TRANSFER BANCAR</span>?</div>

      <div class="info-line"><b>Nume companie:</b> ${escapeHtml(sup.name || "—")}</div>

      <div class="info-line"><b>Cont bancar:</b> ${escapeHtml(sup.ibanRon || "—")}</div>

      <div class="info-line"><b>Nume bancă:</b> ${escapeHtml(sup.bankName || "—")}</div>

      <div class="info-line" style="margin-top:8px;">Menționează în descrierea transferului <b>numărul comenzii: ${escapeHtml(docRef)}</b>.</div>

    </div>

  </div>



  <div class="footer">

    <div class="footer-text">

      ${footerLeftHtml}

    </div>

    <div class="doc-id">

      SERIA ${escapeHtml(series)}<br>NR. ${escapeHtml(number)}<br>${escapeHtml(dateStr)}

    </div>

  </div>



</div>



<div class="page benefits-sheet">

  <div class="benefits-head">

    <div class="logo-row benefits-logo-row">

      ${logoMarkup}

    </div>

    <h2 class="benefits-title">Beneficiile de a fi client Baterino</h2>

  </div>

  <div class="benefits-grid">

    ${clientBenefitsBoxesHtml}

  </div>

  <div class="benefits-account-cta">

    <div class="benefits-account-cta-text">

      <h3 class="benefits-account-cta-title">Creează-ți un cont în platforma Baterino</h3>

      <p>Contul tău Baterino îți oferă acces complet la garanțiile produselor tale, istoricul comenzilor, programele de reduceri active și suportul tehnic dedicat — totul într-un singur loc, oricând ai nevoie, de pe orice dispozitiv.</p>

    </div>

    <div class="benefits-account-cta-qr">

      ${
        benefitsSiteQrDataUrl
          ? `<img class="benefits-account-qr-img" src="${benefitsSiteQrDataUrl}" width="104" height="104" alt="QR către baterino.ro">`
          : `<span class="benefits-account-qr-fallback">${escapeHtml(benefitsAccountQrUrl)}</span>`
      }

      <span class="benefits-account-qr-caption">baterino.ro</span>

    </div>

  </div>

  <div class="benefits-company-footer">

    <div class="benefits-company-name">${escapeHtml(sup.name || "—")}</div>

    <div class="benefits-company-meta benefits-company-single-line">${benefitsFooterContactLineHtml}</div>

  </div>

</div>



</body>

</html>`;
}

function numDecimal(v) {
  if (v == null || v === "") return 0;

  return parseFloat(String(v).replace(/\s/g, "").replace(",", ".")) || 0;
}

function accountCurrencyCode(acc) {
  const c = String(acc?.currency ?? "")
    .trim()

    .toUpperCase();

  if (c === "EUR" || c === "EURO") return "EUR";

  if (c === "USD") return "USD";

  return "RON";
}

function pickBankAccountByCurrency(accounts, code) {
  const list = Array.isArray(accounts)
    ? [...accounts].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    : [];

  const want = String(code).toUpperCase();

  const byField = list.find((a) => accountCurrencyCode(a) === want);

  if (byField) return byField;

  if (want === "RON") {
    return (
      list.find(
        (a) =>
          /RON/i.test(String(a.iban || "")) ||
          /RON/i.test(String(a.bankName || "")),
      ) || list[0]
    );
  }

  if (want === "EUR") {
    return list.find(
      (a) =>
        /EUR/i.test(String(a.iban || "")) ||
        /EUR/i.test(String(a.bankName || "")),
    );
  }

  if (want === "USD") {
    return list.find(
      (a) =>
        /USD/i.test(String(a.iban || "")) ||
        /USD|DOLLAR/i.test(String(a.bankName || "")),
    );
  }

  return undefined;
}

function mapGuestResidentialOrderToProforma(order, company, opts = {}) {
  const accounts = Array.isArray(company?.bankAccounts)
    ? [...company.bankAccounts].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      )
    : [];

  const ibanRonRow = pickBankAccountByCurrency(accounts, "RON") || accounts[0];

  const ibanEurRow = pickBankAccountByCurrency(accounts, "EUR");

  const ibanUsdRow = pickBankAccountByCurrency(accounts, "USD");

  const vatRate = numDecimal(order.vatPercent) || 21;

  const qty = Math.max(1, parseInt(String(order.quantity), 10) || 1);

  const unitIncl = numDecimal(order.unitPriceInclVat);

  const lineIncl = numDecimal(order.lineTotalInclVat) || unitIncl * qty;

  const unitExcl = unitIncl > 0 ? unitIncl / (1 + vatRate / 100) : 0;

  const lineExcl = unitExcl * qty;

  const lineVat = lineIncl - lineExcl;

  const issue =
    opts.proformaIssueDate != null
      ? new Date(opts.proformaIssueDate)
      : new Date();
  const { dateStr, paymentDueStr } = proformaIssueAndPaymentDueStrings(issue);

  const series = resolveProformaSeries(opts);

  const number =
    String(opts.proformaNumber ?? "").trim() ||
    proformaDocumentNumberFromOrderNumber(order.orderNumber) ||
    String(order.orderNumber ?? "").trim() ||
    order.id;

  const clientName = `${order.lastName || ""} ${order.firstName || ""}`.trim();
  const isCompanyBuyer = String(order.buyerType || "").toLowerCase() === "company";

  const supplier = {
    name: String(company?.name ?? "").trim(),

    regCom: opts.supplierRegCom || process.env.BATERINO_REG_COM || "",

    cui:
      company?.cui && String(company.cui).trim()
        ? `RO${String(company.cui).replace(/^RO/i, "").trim()}`
        : "—",

    address: company?.address || "",

    ibanRon: ibanRonRow?.iban || "",

    bankName: ibanRonRow?.bankName || "",

    ibanEur: ibanEurRow?.iban || "",

    bankEur: ibanEurRow?.bankName || "",

    ibanUsd: ibanUsdRow?.iban || "",

    bankUsd: ibanUsdRow?.bankName || "",

    email: opts.supplierEmail || process.env.BATERINO_OFFICE_EMAIL || "",

    web: opts.supplierWeb || process.env.BATERINO_WEB || "",

    capitalSocial:
      opts.supplierCapital || process.env.BATERINO_CAPITAL_SOCIAL || "",

    phone:
      String(opts?.supplierPhone ?? "").trim() ||
      String(process.env.BATERINO_OFFICE_PHONE ?? "").trim(),

    supportPhone:
      String(opts?.supplierSupportPhone ?? "").trim() ||
      String(process.env.BATERINO_SUPPORT_PHONE ?? "").trim(),
  };

  const buyerCui = isCompanyBuyer && order.companyCui
    ? `RO${String(order.companyCui).replace(/^RO/i, "").trim()}`
    : "";

  const client = isCompanyBuyer
    ? {
        name: String(order.companyName || "").trim() || clientName,
        email: order.email || "",
        regCom: "",
        cui: buyerCui,
        addressStreet: String(order.companyAddress || order.billAddress || "").trim(),
        city: String(order.companyCity || order.billCity || "").trim(),
        county: String(order.companyCounty || order.billCounty || "").trim(),
        postal: String(order.companyPostal || order.billPostal || "").trim(),
        country: "România",
      }
    : {
        name: clientName,
        email: order.email || "",
        regCom: "",
        cui: "",
        addressStreet: order.billAddress || "",
        city: order.billCity || "",
        county: order.billCounty || "",
        postal: order.billPostal || "",
        country: "România",
      };

  const lines = [
    {
      index: 1,

      name: order.productTitle || "Produs",

      um: "buc",

      qty,

      unitPriceExcl: unitExcl,

      lineTotalExcl: lineExcl,

      lineVat,
    },
  ];

  return {
    series,

    number,

    dateStr,

    vatRatePercent: vatRate,

    supplier,

    client,

    lines,

    paymentDueStr,

    orderReference: order.orderNumber || "",

    note: `Email: ${order.email}. Tel: +40 ${order.phone}`,

    preparedBy: String(company?.representativeName || "").trim() || "—",
  };
}

async function buildGuestOrderProformaHtml(order, company, opts) {
  return buildProformaHtml(
    mapGuestResidentialOrderToProforma(order, company, opts),
  );
}

function mapResidentialOrderToProforma(order, company, opts = {}) {
  const accounts = Array.isArray(company?.bankAccounts)
    ? [...company.bankAccounts].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      )
    : [];

  const ibanRonRow = pickBankAccountByCurrency(accounts, "RON") || accounts[0];

  const ibanEurRow = pickBankAccountByCurrency(accounts, "EUR");

  const ibanUsdRow = pickBankAccountByCurrency(accounts, "USD");

  const issue =
    opts.proformaIssueDate != null
      ? new Date(opts.proformaIssueDate)
      : new Date();
  const { dateStr, paymentDueStr } = proformaIssueAndPaymentDueStrings(issue);

  const series = resolveProformaSeries(opts);

  const number =
    String(opts.proformaNumber ?? "").trim() ||
    proformaDocumentNumberFromOrderNumber(order.orderNumber) ||
    String(order.orderNumber ?? "").trim() ||
    order.id;

  const clientName = `${order.lastName || ""} ${order.firstName || ""}`.trim();
  const isCompanyBuyer = String(order.buyerType || "").toLowerCase() === "company";

  const supplier = {
    name: String(company?.name ?? "").trim(),

    regCom: opts.supplierRegCom || process.env.BATERINO_REG_COM || "",

    cui:
      company?.cui && String(company.cui).trim()
        ? `RO${String(company.cui).replace(/^RO/i, "").trim()}`
        : "—",

    address: company?.address || "",

    ibanRon: ibanRonRow?.iban || "",

    bankName: ibanRonRow?.bankName || "",

    ibanEur: ibanEurRow?.iban || "",

    bankEur: ibanEurRow?.bankName || "",

    ibanUsd: ibanUsdRow?.iban || "",

    bankUsd: ibanUsdRow?.bankName || "",

    email: opts.supplierEmail || process.env.BATERINO_OFFICE_EMAIL || "",

    web: opts.supplierWeb || process.env.BATERINO_WEB || "",

    capitalSocial:
      opts.supplierCapital || process.env.BATERINO_CAPITAL_SOCIAL || "",

    phone:
      String(opts?.supplierPhone ?? "").trim() ||
      String(process.env.BATERINO_OFFICE_PHONE ?? "").trim(),

    supportPhone:
      String(opts?.supplierSupportPhone ?? "").trim() ||
      String(process.env.BATERINO_SUPPORT_PHONE ?? "").trim(),
  };

  const buyerCui = isCompanyBuyer && order.companyCui
    ? `RO${String(order.companyCui).replace(/^RO/i, "").trim()}`
    : "";

  const client = isCompanyBuyer
    ? {
        name: String(order.companyName || "").trim() || clientName,
        email: order.email || "",
        regCom: "",
        cui: buyerCui,
        addressStreet: String(order.companyAddress || order.billAddress || "").trim(),
        city: String(order.companyCity || order.billCity || "").trim(),
        county: String(order.companyCounty || order.billCounty || "").trim(),
        postal: String(order.companyPostal || order.billPostal || "").trim(),
        country: "România",
      }
    : {
        name: clientName,
        email: order.email || "",
        regCom: "",
        cui: "",
        addressStreet: order.billAddress || "",
        city: order.billCity || "",
        county: order.billCounty || "",
        postal: order.billPostal || "",
        country: "România",
      };

  const orderLines = Array.isArray(order.lines) ? order.lines : [];

  const lines = orderLines.map((L, idx) => {
    const vatRate = numDecimal(L.vatPercent) || 21;

    const qty = Math.max(1, parseInt(String(L.quantity), 10) || 1);

    let lineIncl = numDecimal(L.lineTotalInclVat);

    if (!lineIncl || lineIncl <= 0)
      lineIncl = numDecimal(L.unitPriceInclVat) * qty;

    const unitIncl = qty > 0 ? lineIncl / qty : numDecimal(L.unitPriceInclVat);

    const unitExcl = unitIncl > 0 ? unitIncl / (1 + vatRate / 100) : 0;

    const lineExcl = unitExcl * qty;

    const lineVat = Math.max(0, lineIncl - lineExcl);

    return {
      index: idx + 1,

      name: L.productTitle || "Produs",

      um: "buc",

      qty,

      unitPriceExcl: unitExcl,

      lineTotalExcl: lineExcl,

      lineVat,
    };
  });

  const headerVat =
    orderLines.length > 0 ? numDecimal(orderLines[0].vatPercent) || 21 : 21;

  return {
    series,

    number,

    dateStr,

    vatRatePercent: headerVat,

    supplier,

    client,

    lines,

    paymentDueStr,

    orderReference: order.orderNumber || "",

    note: `Email: ${order.email}. Tel: +40 ${order.phone}`,

    preparedBy: String(company?.representativeName || "").trim() || "—",
  };
}

async function buildResidentialOrderProformaHtml(order, company, opts) {
  return buildProformaHtml(mapResidentialOrderToProforma(order, company, opts));
}

/**

 * Previzualizare — furnizor din DB; client și linii fictive.

 * @param {object} company

 */

async function buildSampleProformaPreviewHtml(company) {
  const co = company && typeof company === "object" ? company : {};

  const fakeOrder = {
    id: "preview",

    createdAt: new Date("2026-04-01T12:00:00.000Z"),

    vatPercent: 21,

    quantity: 1,

    unitPriceInclVat: 58800,

    lineTotalInclVat: 58800,

    orderNumber: "BTO-20260401-PREVIEW",

    lastName: "Popescu",

    firstName: "Ion",

    billAddress: "Str. Clientului nr. 10",

    billCity: "București",

    billPostal: "010101",

    billCounty: "București",

    productTitle: "Sistem stocare energie BESS (exemplu catalog)",

    email: "client@exemplu.ro",

    phone: "721234567",
  };

  const base = mapGuestResidentialOrderToProforma(fakeOrder, co, {
    proformaIssueDate: new Date("2026-04-01T12:00:00.000Z"),

    supplierPhone: String(process.env.BATERINO_OFFICE_PHONE || "").trim(),

    supplierSupportPhone: String(process.env.BATERINO_SUPPORT_PHONE || "").trim(),
  });

  return buildProformaHtml({
    ...base,

    note:
      "Previzualizare șablon — client și produs exemplu; furnizor din Setări → Date companie. " +
      (base.note || ""),

    preparedBy: String(co?.representativeName || "").trim() || "—",
  });
}

module.exports = {
  escapeHtml,

  fmtMoney,

  buildProformaHtml,

  mapGuestResidentialOrderToProforma,

  buildGuestOrderProformaHtml,

  mapResidentialOrderToProforma,

  buildResidentialOrderProformaHtml,

  buildSampleProformaPreviewHtml,

  pickBankAccountByCurrency,

  proformaIssueAndPaymentDueStrings,
};