/* =========================================================================
   PRAYKI · Produktdaten & Artwork
   Alle Produktbilder werden als monochrome Inline-SVGs erzeugt – keine
   externen Assets, dadurch extrem schnelle Ladezeiten und ein konsistenter,
   hochwertiger Look in Schwarz / Weiß / Grau.
   ========================================================================= */

/**
 * Erzeugt eine minimalistische Hoodie-Illustration als SVG-String.
 * @param {Object} opts
 * @param {string} opts.id      - eindeutige ID (für Gradient-Referenzen)
 * @param {boolean} opts.wings  - Flügel-Print auf der Brust anzeigen
 * @returns {string} SVG-Markup
 */
function hoodieSVG({ id = 'h', wings = false } = {}) {
  const gid = `grad-${id}`;
  const wingMark = wings
    ? `
      <g class="hoodie-wings" fill="#e9e9ec" opacity="0.9">
        <path d="M200 250
                 C 188 236, 168 232, 150 240
                 C 168 244, 178 252, 184 262
                 C 172 258, 158 260, 148 268
                 C 166 270, 178 278, 186 288
                 C 190 280, 196 268, 200 258 Z"/>
        <path d="M200 250
                 C 212 236, 232 232, 250 240
                 C 232 244, 222 252, 216 262
                 C 228 258, 242 260, 252 268
                 C 234 270, 222 278, 214 288
                 C 210 280, 204 268, 200 258 Z"/>
      </g>`
    : '';

  return `
  <svg class="hoodie-svg" viewBox="0 0 400 480" role="img" aria-label="Hoodie"
       xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0"   stop-color="#232326"/>
        <stop offset="0.55" stop-color="#161618"/>
        <stop offset="1"   stop-color="#0d0d0f"/>
      </linearGradient>
    </defs>

    <!-- Hauptsilhouette -->
    <path fill="url(#${gid})" stroke="#000" stroke-width="1.5"
      d="M30 300
         L110 150
         C120 96, 160 62, 200 60
         C240 62, 280 96, 290 150
         L370 300
         L370 344
         L292 214
         L288 440
         L112 440
         L108 214
         L30 344
         Z"/>

    <!-- Kapuzen-Innenraum -->
    <path fill="#2b2b2f" stroke="#000" stroke-width="1"
      d="M154 96
         C170 130, 230 130, 246 96
         C238 150, 162 150, 154 96 Z"/>

    <!-- Naht: Kapuze -->
    <path fill="none" stroke="#3a3a3f" stroke-width="1.4" stroke-linecap="round"
      d="M150 92 C168 128, 232 128, 250 92"/>

    <!-- Kängurutasche -->
    <path fill="none" stroke="#3a3a3f" stroke-width="1.4" stroke-linecap="round"
      d="M140 330 L140 386 L260 386 L260 330"/>
    <path fill="none" stroke="#3a3a3f" stroke-width="1.4" stroke-linecap="round"
      d="M140 330 C168 348, 232 348, 260 330"/>

    <!-- Kordeln -->
    <path fill="none" stroke="#d8d8dc" stroke-width="2.4" stroke-linecap="round"
      d="M188 128 L184 176"/>
    <path fill="none" stroke="#d8d8dc" stroke-width="2.4" stroke-linecap="round"
      d="M212 128 L216 176"/>
    <circle cx="184" cy="178" r="3.2" fill="#d8d8dc"/>
    <circle cx="216" cy="178" r="3.2" fill="#d8d8dc"/>

    <!-- Manschetten-Nähte -->
    <path fill="none" stroke="#3a3a3f" stroke-width="1.4" d="M36 330 L104 208"/>
    <path fill="none" stroke="#3a3a3f" stroke-width="1.4" d="M364 330 L296 208"/>

    ${wingMark}
  </svg>`;
}

/* Verfügbare Hoodie-Farben (Name + Swatch-Farbe). */
const HOODIE_COLORS = {
  heather: { key: 'heather', name: 'Hellgrau meliert', hex: '#c8c8cd', melange: true },
  black: { key: 'black', name: 'Schwarz', hex: '#141416' },
  white: { key: 'white', name: 'Weiß', hex: '#f4f4f2' },
};

/* Produktkatalog – aktuell ausschließlich diese drei Hoodies. */
const PRODUCTS = [
  {
    id: 'kinder-hoodie',
    name: 'Kinder Hoodie',
    price: 50,
    colors: [HOODIE_COLORS.white],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'Hochwertiger Hoodie aus angenehmem Stoff mit modernem Streetwear-Design.',
    art: () => hoodieSVG({ id: 'kinder' }),
    images:
      typeof HERO_IMAGE !== 'undefined' && typeof HOODIE_BACK_IMAGE !== 'undefined'
        ? [HERO_IMAGE, HOODIE_BACK_IMAGE]
        : null,
    badge: null,
    maxOrder: null,
  },
  {
    id: 'erwachsenen-hoodie',
    name: 'Erwachsenen Hoodie',
    price: 60,
    colors: [HOODIE_COLORS.white],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'Hochwertiger Hoodie aus angenehmem Stoff mit modernem Streetwear-Design.',
    art: () => hoodieSVG({ id: 'erwachsen' }),
    images:
      typeof HERO_IMAGE !== 'undefined' && typeof HOODIE_BACK_IMAGE !== 'undefined'
        ? [HERO_IMAGE, HOODIE_BACK_IMAGE]
        : null,
    badge: null,
    maxOrder: null,
  },
  {
    id: 'wing-hoodie',
    name: 'Wing Hoodie',
    price: 55,
    colors: [HOODIE_COLORS.heather],
    sizes: ['S'],
    description:
      'Hochwertiger Hoodie aus angenehmem Stoff mit modernem Streetwear-Design.',
    art: () => hoodieSVG({ id: 'wing', wings: true }),
    // Echte Produktfotos (aus js/wing-images.js) – ermöglichen die Bildergalerie
    images: typeof WING_IMAGES !== 'undefined' ? WING_IMAGES : null,
    badge: '🔥 Nur noch 2 bestellbar – Schnell bestellen!',
    maxOrder: 2,
  },
];

/** Findet ein Produkt anhand seiner ID. */
function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

/** Preis im deutschen Format (z. B. „50 €"). */
function formatPrice(value) {
  return `${value.toFixed(2).replace('.', ',')} €`;
}

/** Erstes Foto eines Produkts (falls vorhanden), sonst null. */
function primaryImage(p) {
  return p.images && p.images.length ? p.images[0] : null;
}

/** Vorschau-Markup: echtes Foto falls vorhanden, sonst SVG-Artwork. */
function productMedia(p) {
  const img = primaryImage(p);
  return img
    ? `<img class="product-photo" src="${img.src}" alt="${img.alt}" loading="lazy" decoding="async">`
    : p.art();
}
