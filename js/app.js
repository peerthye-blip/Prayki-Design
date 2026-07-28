/* =========================================================================
   MARLINÉA · App-Logik
   - Hash-basiertes Routing (SPA, keine Framework-Abhängigkeiten)
   - Warenkorb mit localStorage-Persistenz
   - Warenkorb-Drawer, Größenauswahl, Kasse
   ========================================================================= */

'use strict';

/* ----------------------------- Warenkorb --------------------------------- */

const CART_KEY = 'marlinea_cart_v1';

/* Endpoint der Serverless-Funktion, die E-Mails über Resend verschickt.
   Auf dem deployten Host same-origin unter /api/send-email erreichbar.
   (Ohne Backend – z. B. in der Artifact-Vorschau – greift ein mailto-Fallback.) */
const EMAIL_ENDPOINT = '/api/send-email';
const CHECKOUT_ENDPOINT = '/api/create-checkout-session';
const ORDER_ENDPOINT = '/api/order-complete';
const CONTACT_MAIL = 'peer.thye@icloud.com';

/* ============================ Sprache (i18n) ============================= */

const LANG_KEY = 'marlinea_lang';
let LANG = 'de';
try {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === 'de' || saved === 'en') LANG = saved;
  else if ((navigator.language || '').toLowerCase().startsWith('en')) LANG = 'en';
} catch (_) {}

const I18N = {
  de: {
    'meta.title': 'Marlinéa – Minimal Streetwear',
    'nav.home': 'Startseite', 'nav.shop': 'Shop', 'nav.contact': 'Kontakt',
    'aria.openCart': 'Warenkorb öffnen', 'aria.close': 'Schließen', 'aria.menu': 'Menü öffnen',
    'aria.logo': 'Marlinéa Startseite', 'aria.lang': 'Sprache wählen',
    'drawer.title': 'Warenkorb', 'drawer.total': 'Gesamtsumme', 'drawer.checkout': 'Zur Kasse',
    'drawer.empty': 'Dein Warenkorb ist leer.', 'drawer.toShop': 'Zum Shop',
    'footer.tagline': 'Minimal Streetwear. Schlichte Designs. Höchste Qualität.',
    'footer.rights': 'Alle Rechte vorbehalten.', 'footer.palette': 'Schwarz · Weiß · Grau',
    'hero.eyebrow': 'Marlinéa · Est. Streetwear', 'hero.subtitle': 'Schlichte Designs. Höchste Qualität.',
    'hero.cta': 'Jetzt shoppen', 'hero.scroll': 'Scroll',
    'home.collection': 'Kollektion', 'home.viewAll': 'Alle ansehen',
    'promo.title': 'Weniger. Aber besser.',
    'promo.text': 'Ein Hoodie. Ein Anspruch. Marlinéa steht für reduzierte Designs, erstklassige Materialien und einen zeitlosen, monochromen Look – gemacht für die Straße, gedacht für den Alltag.',
    'promo.cta': 'Zur Kollektion',
    'card.buy': 'Jetzt kaufen', 'flag.almostSold': 'Fast ausverkauft', 'card.colors': '{n} Farben', 'card.size': 'Größe {s}',
    'shop.eyebrow': 'Shop', 'shop.title': 'Die Kollektion', 'shop.text': 'Unsere Essentials. Monochrome Töne, klare Linien.',
    'pdp.back': '← Zurück zum Shop', 'pdp.color': 'Farbe', 'pdp.size': 'Größe', 'pdp.add': 'In den Warenkorb',
    'pdp.selColor': 'Farbe wählen', 'pdp.selSize': 'Größe wählen',
    'stock.alert': '🔥 Nur noch {n} bestellbar – Schnell bestellen!',
    'gallery.prev': 'Vorheriges Bild', 'gallery.next': 'Nächstes Bild', 'gallery.show': 'Bild {n} anzeigen',
    'cart.less': 'Weniger', 'cart.more': 'Mehr', 'cart.remove': 'Entfernen', 'cart.metaSize': 'Größe',
    'checkout.eyebrow': 'Kasse', 'checkout.title': 'Bestellung abschließen', 'checkout.contact': 'Kontakt',
    'checkout.address': 'Lieferadresse', 'checkout.email': 'E-Mail', 'checkout.firstname': 'Vorname',
    'checkout.lastname': 'Nachname', 'checkout.street': 'Straße & Hausnummer', 'checkout.zip': 'PLZ',
    'checkout.city': 'Ort', 'checkout.submit': 'Kauf abschließen', 'checkout.summary': 'Übersicht',
    'checkout.shipping': 'Versand', 'checkout.free': 'Kostenlos', 'checkout.total': 'Gesamt',
    'checkout.emptyTitle': 'Dein Warenkorb ist leer', 'checkout.emptyText': 'Füge zuerst etwas hinzu, um zur Kasse zu gehen.',
    'checkout.redirect': 'Weiterleitung …', 'checkout.confirming': 'Zahlung wird bestätigt …',
    'order.thanks': 'Danke für deine Bestellung!',
    'order.text': 'Deine Bestellung <strong>#{id}</strong> wurde erfolgreich aufgegeben. Eine Bestätigung ist unterwegs zu dir.',
    'order.continue': 'Weiter shoppen',
    'contact.eyebrow': 'Kontakt', 'contact.title': 'Sag Hallo',
    'contact.text': 'Fragen zu Bestellung, Größen oder Versand? Wir sind für dich da.',
    'contact.email': 'E-Mail', 'contact.instagram': 'Instagram', 'contact.name': 'Name',
    'contact.message': 'Nachricht', 'contact.send': 'Nachricht senden', 'contact.sending': 'Wird gesendet …',
    'notfound.title': 'Seite nicht gefunden', 'notfound.text': 'Diese Seite existiert leider nicht.', 'notfound.home': 'Zur Startseite',
    'color.heather': 'Hellgrau meliert', 'color.white': 'Weiß', 'color.black': 'Schwarz',
    'desc.wing-hoodie': 'Hochwertiger Hoodie aus angenehmem Stoff mit modernem Streetwear-Design.',
    'desc.tshirt': 'Hochwertiges T-Shirt aus angenehmem Stoff mit modernem Streetwear-Design.',
    'toast.pickSize': 'Bitte wähle eine Größe.', 'toast.notFound': 'Produkt nicht gefunden.',
    'toast.added': '{name} ({size} · {color}) hinzugefügt.',
    'toast.maxOrder': 'Von diesem Produkt sind nur noch {n} Stück bestellbar.',
    'toast.maxShort': 'Nur noch {n} Stück bestellbar.',
    'toast.fillFields': 'Bitte fülle alle Felder aus.', 'toast.fillRequired': 'Bitte fülle alle Pflichtfelder aus.',
    'toast.sent': 'Danke! Deine Nachricht wurde gesendet.', 'toast.mailOpen': 'Öffne dein E-Mail-Programm …',
    'toast.canceled': 'Zahlung abgebrochen – dein Warenkorb ist noch da.',
  },
  en: {
    'meta.title': 'Marlinéa – Minimal Streetwear',
    'nav.home': 'Home', 'nav.shop': 'Shop', 'nav.contact': 'Contact',
    'aria.openCart': 'Open cart', 'aria.close': 'Close', 'aria.menu': 'Open menu',
    'aria.logo': 'Marlinéa home', 'aria.lang': 'Select language',
    'drawer.title': 'Cart', 'drawer.total': 'Total', 'drawer.checkout': 'Checkout',
    'drawer.empty': 'Your cart is empty.', 'drawer.toShop': 'To the shop',
    'footer.tagline': 'Minimal streetwear. Simple designs. Highest quality.',
    'footer.rights': 'All rights reserved.', 'footer.palette': 'Black · White · Grey',
    'hero.eyebrow': 'Marlinéa · Est. Streetwear', 'hero.subtitle': 'Simple designs. Highest quality.',
    'hero.cta': 'Shop now', 'hero.scroll': 'Scroll',
    'home.collection': 'Collection', 'home.viewAll': 'View all',
    'promo.title': 'Less. But better.',
    'promo.text': 'One hoodie. One standard. Marlinéa stands for reduced designs, premium materials and a timeless, monochrome look – made for the street, designed for everyday.',
    'promo.cta': 'View collection',
    'card.buy': 'Buy now', 'flag.almostSold': 'Almost sold out', 'card.colors': '{n} colours', 'card.size': 'Size {s}',
    'shop.eyebrow': 'Shop', 'shop.title': 'The collection', 'shop.text': 'Our essentials. Monochrome tones, clean lines.',
    'pdp.back': '← Back to shop', 'pdp.color': 'Colour', 'pdp.size': 'Size', 'pdp.add': 'Add to cart',
    'pdp.selColor': 'Choose colour', 'pdp.selSize': 'Choose size',
    'stock.alert': '🔥 Only {n} left – order fast!',
    'gallery.prev': 'Previous image', 'gallery.next': 'Next image', 'gallery.show': 'Show image {n}',
    'cart.less': 'Less', 'cart.more': 'More', 'cart.remove': 'Remove', 'cart.metaSize': 'Size',
    'checkout.eyebrow': 'Checkout', 'checkout.title': 'Complete order', 'checkout.contact': 'Contact',
    'checkout.address': 'Delivery address', 'checkout.email': 'Email', 'checkout.firstname': 'First name',
    'checkout.lastname': 'Last name', 'checkout.street': 'Street & number', 'checkout.zip': 'Postal code',
    'checkout.city': 'City', 'checkout.submit': 'Complete purchase', 'checkout.summary': 'Summary',
    'checkout.shipping': 'Shipping', 'checkout.free': 'Free', 'checkout.total': 'Total',
    'checkout.emptyTitle': 'Your cart is empty', 'checkout.emptyText': 'Add something first to check out.',
    'checkout.redirect': 'Redirecting …', 'checkout.confirming': 'Confirming payment …',
    'order.thanks': 'Thank you for your order!',
    'order.text': 'Your order <strong>#{id}</strong> was placed successfully. A confirmation is on its way to you.',
    'order.continue': 'Continue shopping',
    'contact.eyebrow': 'Contact', 'contact.title': 'Say hello',
    'contact.text': "Questions about your order, sizes or shipping? We're here for you.",
    'contact.email': 'Email', 'contact.instagram': 'Instagram', 'contact.name': 'Name',
    'contact.message': 'Message', 'contact.send': 'Send message', 'contact.sending': 'Sending …',
    'notfound.title': 'Page not found', 'notfound.text': "This page doesn't exist.", 'notfound.home': 'To home',
    'color.heather': 'Heather grey', 'color.white': 'White', 'color.black': 'Black',
    'desc.wing-hoodie': 'Premium hoodie made from comfortable fabric with a modern streetwear design.',
    'desc.tshirt': 'Premium T-shirt made from comfortable fabric with a modern streetwear design.',
    'toast.pickSize': 'Please select a size.', 'toast.notFound': 'Product not found.',
    'toast.added': '{name} ({size} · {color}) added.',
    'toast.maxOrder': 'Only {n} of this item can be ordered.',
    'toast.maxShort': 'Only {n} left.',
    'toast.fillFields': 'Please fill in all fields.', 'toast.fillRequired': 'Please fill in all required fields.',
    'toast.sent': 'Thanks! Your message has been sent.', 'toast.mailOpen': 'Opening your email app …',
    'toast.canceled': 'Payment canceled – your cart is still here.',
  },
};

/** Übersetzt einen Schlüssel; {var}-Platzhalter werden ersetzt. */
function t(key, vars) {
  let s = (I18N[LANG] && I18N[LANG][key]) || I18N.de[key] || key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
}

/** Lokalisierter Farbname zu einem Farb-Key ('white' -> „Weiß"/„White"). */
function colorName(key) {
  return t('color.' + key);
}

/** Preis lokalisiert: DE „55,00 €", EN „€55.00". */
function formatPrice(value) {
  return LANG === 'en'
    ? '€' + value.toFixed(2)
    : value.toFixed(2).replace('.', ',') + ' €';
}

/** Setzt die Sprache, speichert sie und rendert alles neu. */
function setLang(lang) {
  if (lang !== 'de' && lang !== 'en') return;
  LANG = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
  document.documentElement.lang = lang;
  document.title = t('meta.title');
  applyStaticI18n();
  updateLangToggle();
  render();
  renderCartDrawer();
}

/** Übersetzt die statischen Bereiche (Header, Footer, Drawer) via data-i18n. */
function applyStaticI18n() {
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
}

/** Markiert den aktiven Sprach-Button. */
function updateLangToggle() {
  $$('#lang-toggle [data-lang]').forEach((b) =>
    b.classList.toggle('is-active', b.dataset.lang === LANG)
  );
}

const Cart = {
  items: [],

  load() {
    try {
      this.items = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (_) {
      this.items = [];
    }
  },

  save() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(this.items));
    } catch (_) {
      /* Speicher nicht verfügbar (z. B. Sandbox) – Warenkorb bleibt zur Laufzeit erhalten */
    }
  },

  /** Fügt ein Produkt in Größe + Farbe hinzu (respektiert maxOrder). */
  add(productId, size, color) {
    const product = getProduct(productId);
    if (!product) return { ok: false, message: t('toast.notFound') };
    if (!size) return { ok: false, message: t('toast.pickSize') };
    if (!color) color = product.colors[0].key; // color = stabiler Farb-Key

    const line = this.items.find(
      (i) => i.id === productId && i.size === size && i.color === color
    );
    const currentQty = line ? line.qty : 0;

    if (product.maxOrder && currentQty + 1 > product.maxOrder) {
      return { ok: false, message: t('toast.maxOrder', { n: product.maxOrder }) };
    }

    if (line) {
      line.qty += 1;
    } else {
      this.items.push({ id: productId, size, color, qty: 1 });
    }
    this.save();
    return {
      ok: true,
      message: t('toast.added', { name: product.name, size, color: colorName(color) }),
    };
  },

  setQty(productId, size, color, qty) {
    const product = getProduct(productId);
    const line = this.items.find(
      (i) => i.id === productId && i.size === size && i.color === color
    );
    if (!line) return;
    let next = Math.max(0, qty);
    if (product && product.maxOrder) next = Math.min(next, product.maxOrder);
    if (next === 0) {
      this.remove(productId, size, color);
    } else {
      line.qty = next;
      this.save();
    }
  },

  remove(productId, size, color) {
    this.items = this.items.filter(
      (i) => !(i.id === productId && i.size === size && i.color === color)
    );
    this.save();
  },

  clear() {
    this.items = [];
    this.save();
  },

  count() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  total() {
    return this.items.reduce((sum, i) => {
      const p = getProduct(i.id);
      return sum + (p ? p.price * i.qty : 0);
    }, 0);
  },

  /** Angereicherte Warenkorbzeilen inkl. Produktdaten. */
  detailed() {
    return this.items
      .map((i) => {
        const p = getProduct(i.id);
        return p ? { ...i, product: p, lineTotal: p.price * i.qty } : null;
      })
      .filter(Boolean);
  },
};

/* --------------------------- Hilfsfunktionen ----------------------------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function navigate(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

/* Kleiner, dezenter Toast für Feedback. */
let toastTimer;
function toast(message, type = 'ok') {
  let el = $('#toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.dataset.type = type;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
}

/* ------------------------------ Views ------------------------------------ */

function productCard(p) {
  const colorLabel = p.colors.length > 1
    ? t('card.colors', { n: p.colors.length })
    : colorName(p.colors[0].key);
  const sizeLabel = p.sizes.length > 1
    ? p.sizes[0] + '–' + p.sizes[p.sizes.length - 1]
    : t('card.size', { s: p.sizes[0] });
  return `
    <article class="card">
      <a class="card__media" href="#/produkt/${p.id}" aria-label="${p.name}">
        ${p.badge ? `<span class="card__flag">${t('flag.almostSold')}</span>` : ''}
        <div class="card__art">${productMedia(p)}</div>
      </a>
      <div class="card__body">
        <h3 class="card__title">${p.name}</h3>
        <p class="card__meta">${colorLabel} · ${sizeLabel}</p>
        <div class="card__foot">
          <span class="card__price">${formatPrice(p.price)}</span>
          <a class="btn btn--sm" href="#/produkt/${p.id}">${t('card.buy')}</a>
        </div>
      </div>
    </article>`;
}

function viewHome() {
  const featured = PRODUCTS.map(productCard).join('');
  return `
    <section class="hero">
      <div class="hero__inner">
        <p class="hero__eyebrow">${t('hero.eyebrow')}</p>
        <h1 class="hero__title">MARLINÉA-DESIGN</h1>
        <p class="hero__subtitle">${t('hero.subtitle')}</p>
        <a class="btn btn--lg" href="#/shop">${t('hero.cta')}</a>
      </div>
      <span class="hero__scroll">${t('hero.scroll')}</span>
    </section>

    <section class="section">
      <div class="section__head">
        <h2 class="section__title">${t('home.collection')}</h2>
        <a class="section__link" href="#/shop">${t('home.viewAll')}</a>
      </div>
      <div class="grid">${featured}</div>
    </section>

    <section class="promo">
      <div class="promo__inner">
        <h2 class="promo__title">${t('promo.title')}</h2>
        <p class="promo__text">${t('promo.text')}</p>
        <a class="btn btn--ghost" href="#/shop">${t('promo.cta')}</a>
      </div>
    </section>`;
}

function viewShop() {
  return `
    <section class="section section--top">
      <div class="page-head">
        <p class="page-head__eyebrow">${t('shop.eyebrow')}</p>
        <h1 class="page-head__title">${t('shop.title')}</h1>
        <p class="page-head__text">${t('shop.text')}</p>
      </div>
      <div class="grid">${PRODUCTS.map(productCard).join('')}</div>
    </section>`;
}

/** Baut die Bildergalerie (Track + Pfeile + Punkte) für ein Produkt mit Fotos. */
function galleryMarkup(p) {
  const slides = p.images
    .map(
      (im, i) => `
        <img class="gallery__img" src="${im.src}" alt="${im.alt}"
             draggable="false" ${i === 0 ? '' : 'loading="lazy"'} decoding="async">`
    )
    .join('');

  const dots = p.images
    .map(
      (_, i) => `<button class="gallery__dot ${i === 0 ? 'is-active' : ''}"
                    data-go="${i}" aria-label="${t('gallery.show', { n: i + 1 })}"></button>`
    )
    .join('');

  const multi = p.images.length > 1;

  return `
    <div class="gallery" data-index="0" data-count="${p.images.length}">
      <div class="gallery__track">${slides}</div>
      ${
        multi
          ? `
        <button class="gallery__arrow gallery__arrow--prev" data-dir="-1"
                aria-label="${t('gallery.prev')}">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
               stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
               stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
        </button>
        <button class="gallery__arrow gallery__arrow--next" data-dir="1"
                aria-label="${t('gallery.next')}">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
               stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
               stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>
        </button>
        <div class="gallery__dots">${dots}</div>
        <span class="gallery__counter"><span data-current>1</span> / ${p.images.length}</span>`
          : ''
      }
    </div>`;
}

/** Verschiebt die Galerie auf einen (umlaufenden) Index. */
function galleryGoTo(gallery, index) {
  const count = Number(gallery.dataset.count);
  const next = ((index % count) + count) % count;
  gallery.dataset.index = String(next);
  const track = $('.gallery__track', gallery);
  track.style.transform = `translateX(-${next * 100}%)`;
  $$('.gallery__dot', gallery).forEach((d, i) =>
    d.classList.toggle('is-active', i === next)
  );
  const cur = $('[data-current]', gallery);
  if (cur) cur.textContent = String(next + 1);
}

function viewProduct(id) {
  const p = getProduct(id);
  if (!p) return viewNotFound();

  const sizes = p.sizes
    .map(
      (s, i) =>
        `<button type="button" class="size ${i === 0 ? 'is-active' : ''}"
           data-size="${s}">${s}</button>`
    )
    .join('');

  const colors = p.colors
    .map(
      (c, i) =>
        `<button type="button" class="swatch-btn ${i === 0 ? 'is-active' : ''}"
           data-color="${c.key}" title="${colorName(c.key)}" aria-label="${colorName(c.key)}">
           <span class="swatch-dot ${c.melange ? 'swatch-dot--melange' : ''}"
             style="--sw:${c.hex}"></span>
         </button>`
    )
    .join('');

  return `
    <section class="pdp">
      <a class="pdp__back" href="#/shop">${t('pdp.back')}</a>
      <div class="pdp__grid">
        <div class="pdp__media">
          ${p.badge ? `<span class="pdp__flag">${t('flag.almostSold')}</span>` : ''}
          ${p.images && p.images.length ? galleryMarkup(p) : `<div class="pdp__art">${p.art()}</div>`}
        </div>

        <div class="pdp__info">
          ${p.badge ? `<p class="stock-alert">${t('stock.alert', { n: p.maxOrder })}</p>` : ''}
          <h1 class="pdp__title">${p.name}</h1>
          <p class="pdp__price">${formatPrice(p.price)}</p>
          <p class="pdp__desc">${t('desc.' + p.id)}</p>

          <div class="pdp__row pdp__row--col">
            <span class="pdp__label">${t('pdp.color')} — <span class="pdp__value" data-color-name>${colorName(p.colors[0].key)}</span></span>
            <div class="swatches" role="group" aria-label="${t('pdp.selColor')}">${colors}</div>
          </div>

          <div class="pdp__row pdp__row--col">
            <span class="pdp__label">${t('pdp.size')}</span>
            <div class="sizes" role="group" aria-label="${t('pdp.selSize')}">${sizes}</div>
          </div>

          <button class="btn btn--lg btn--full" id="add-to-cart"
                  data-id="${p.id}">${t('pdp.add')}</button>
        </div>
      </div>
    </section>`;
}

function viewContact() {
  return `
    <section class="section section--top prose">
      <div class="page-head">
        <p class="page-head__eyebrow">${t('contact.eyebrow')}</p>
        <h1 class="page-head__title">${t('contact.title')}</h1>
        <p class="page-head__text">${t('contact.text')}</p>
      </div>

      <div class="contact">
        <div class="contact__info">
          <p><span class="contact__label">${t('contact.email')}</span>peer.thye@icloud.com</p>
          <p><span class="contact__label">${t('contact.instagram')}</span><a class="contact__link" href="https://www.instagram.com/marlinea.official/" target="_blank" rel="noopener noreferrer">@marlinea.official</a></p>
        </div>

        <form class="contact__form" id="contact-form" novalidate>
          <label class="field">
            <span>${t('contact.name')}</span>
            <input type="text" name="name" required autocomplete="name">
          </label>
          <label class="field">
            <span>${t('contact.email')}</span>
            <input type="email" name="email" required autocomplete="email">
          </label>
          <label class="field">
            <span>${t('contact.message')}</span>
            <textarea name="message" rows="5" required></textarea>
          </label>
          <button class="btn btn--lg" type="submit">${t('contact.send')}</button>
        </form>
      </div>
    </section>`;
}

function viewCheckout() {
  const lines = Cart.detailed();
  if (!lines.length) {
    return `
      <section class="section section--top empty">
        <h1 class="empty__title">${t('checkout.emptyTitle')}</h1>
        <p class="empty__text">${t('checkout.emptyText')}</p>
        <a class="btn btn--lg" href="#/shop">${t('drawer.toShop')}</a>
      </section>`;
  }

  const summary = lines
    .map(
      (l) => `
      <div class="sum__line">
        <span>${l.qty}× ${l.product.name} · ${l.size} · ${colorName(l.color)}</span>
        <span>${formatPrice(l.lineTotal)}</span>
      </div>`
    )
    .join('');

  return `
    <section class="section section--top checkout">
      <div class="page-head">
        <p class="page-head__eyebrow">${t('checkout.eyebrow')}</p>
        <h1 class="page-head__title">${t('checkout.title')}</h1>
      </div>

      <div class="checkout__grid">
        <form class="checkout__form" id="checkout-form" novalidate>
          <fieldset class="fieldset">
            <legend>${t('checkout.contact')}</legend>
            <label class="field"><span>${t('checkout.email')}</span>
              <input type="email" name="email" required autocomplete="email"></label>
          </fieldset>
          <fieldset class="fieldset">
            <legend>${t('checkout.address')}</legend>
            <div class="field-row">
              <label class="field"><span>${t('checkout.firstname')}</span>
                <input type="text" name="firstname" required></label>
              <label class="field"><span>${t('checkout.lastname')}</span>
                <input type="text" name="lastname" required></label>
            </div>
            <label class="field"><span>${t('checkout.street')}</span>
              <input type="text" name="street" required></label>
            <div class="field-row">
              <label class="field"><span>${t('checkout.zip')}</span>
                <input type="text" name="zip" required></label>
              <label class="field"><span>${t('checkout.city')}</span>
                <input type="text" name="city" required></label>
            </div>
          </fieldset>
          <button class="btn btn--lg btn--full" type="submit">${t('checkout.submit')}</button>
        </form>

        <aside class="sum">
          <h2 class="sum__title">${t('checkout.summary')}</h2>
          ${summary}
          <div class="sum__line sum__line--row">
            <span>${t('checkout.shipping')}</span><span>${t('checkout.free')}</span>
          </div>
          <div class="sum__total">
            <span>${t('checkout.total')}</span><span>${formatPrice(Cart.total())}</span>
          </div>
        </aside>
      </div>
    </section>`;
}

function viewOrderConfirmed(orderId) {
  return `
    <section class="section section--top empty">
      <div class="check-icon">✓</div>
      <h1 class="empty__title">${t('order.thanks')}</h1>
      <p class="empty__text">${t('order.text', { id: orderId })}</p>
      <a class="btn btn--lg" href="#/shop">${t('order.continue')}</a>
    </section>`;
}

function viewNotFound() {
  return `
    <section class="section section--top empty">
      <h1 class="empty__title">${t('notfound.title')}</h1>
      <p class="empty__text">${t('notfound.text')}</p>
      <a class="btn btn--lg" href="#/">${t('notfound.home')}</a>
    </section>`;
}

/* ---------------------------- Warenkorb-Drawer --------------------------- */

function renderCartDrawer() {
  const lines = Cart.detailed();
  const body = $('#cart-body');
  const foot = $('#cart-foot');

  if (!lines.length) {
    body.innerHTML = `
      <div class="drawer__empty">
        <p>${t('drawer.empty')}</p>
        <a class="btn btn--ghost" href="#/shop" data-close-cart>${t('drawer.toShop')}</a>
      </div>`;
    foot.hidden = true;
  } else {
    body.innerHTML = lines
      .map(
        (l) => `
        <div class="citem">
          <div class="citem__art">${productMedia(l.product)}</div>
          <div class="citem__info">
            <p class="citem__name">${l.product.name}</p>
            <p class="citem__meta">${t('cart.metaSize')} ${l.size} · ${colorName(l.color)} · ${formatPrice(l.product.price)}</p>
            <div class="qty" data-id="${l.id}" data-size="${l.size}" data-color="${l.color}">
              <button class="qty__btn" data-act="dec" aria-label="${t('cart.less')}">−</button>
              <span class="qty__num">${l.qty}</span>
              <button class="qty__btn" data-act="inc" aria-label="${t('cart.more')}">+</button>
            </div>
          </div>
          <div class="citem__right">
            <span class="citem__total">${formatPrice(l.lineTotal)}</span>
            <button class="citem__remove" data-remove
              data-id="${l.id}" data-size="${l.size}" data-color="${l.color}"
              aria-label="${t('cart.remove')}">${t('cart.remove')}</button>
          </div>
        </div>`
      )
      .join('');
    foot.hidden = false;
    $('#cart-total').textContent = formatPrice(Cart.total());
  }
  updateCartBadge();
}

function updateCartBadge() {
  const n = Cart.count();
  $$('.cart-count').forEach((el) => {
    el.textContent = n;
    el.classList.toggle('is-visible', n > 0);
  });
}

function openCart() {
  renderCartDrawer();
  $('#drawer').classList.add('is-open');
  $('#overlay').classList.add('is-visible');
  document.body.classList.add('no-scroll');
}

function closeCart() {
  $('#drawer').classList.remove('is-open');
  $('#overlay').classList.remove('is-visible');
  document.body.classList.remove('no-scroll');
}

/* --------------------------- Stripe-Checkout ----------------------------- */

/* Erstellt eine Stripe-Checkout-Session und leitet dorthin weiter.
   Ohne Stripe-Backend (501/Netzwerkfehler) fällt es auf den einfachen
   Checkout (#/kasse, Bestellung nur per E-Mail) zurück. */
async function startCheckout() {
  if (!Cart.items.length) return;
  // color -> lokalisierter Name für ein schönes Label auf der Stripe-Seite
  const items = Cart.items.map(({ id, size, color, qty }) => ({ id, size, color: colorName(color), qty }));
  const btn = $('#cart-checkout');
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = t('checkout.redirect');
  try {
    const r = await fetch(CHECKOUT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (r.status === 501) {
      closeCart();
      navigate('#/kasse');
      return;
    }
    if (!r.ok) throw new Error('checkout');
    const data = await r.json();
    if (!data.url) throw new Error('no url');
    window.location.href = data.url; // -> gehostete Stripe-Bezahlseite
  } catch (_) {
    closeCart();
    navigate('#/kasse');
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
}

/* Nach Rückkehr von Stripe: Zahlung serverseitig bestätigen + Bestätigung zeigen. */
async function confirmPaidOrder(sessionId) {
  const main = $('#app');
  $('#site-header').classList.remove('header--hero');
  main.dataset.route = 'confirmed';
  main.innerHTML =
    `<section class="section section--top empty"><h1 class="empty__title">${t('checkout.confirming')}</h1></section>`;
  try {
    const r = await fetch(`${ORDER_ENDPOINT}?session_id=${encodeURIComponent(sessionId)}`);
    const data = await r.json();
    if (!r.ok || !data.ok) throw new Error('confirm');
    Cart.clear();
    updateCartBadge();
    main.innerHTML = viewOrderConfirmed(data.order.id);
  } catch (_) {
    Cart.clear();
    updateCartBadge();
    main.innerHTML = viewOrderConfirmed('—');
  }
}

/* ------------------------------- Router ---------------------------------- */

const routes = [
  { re: /^#?\/?$/, view: viewHome, name: 'home' },
  { re: /^#\/shop$/, view: viewShop, name: 'shop' },
  { re: /^#\/produkt\/([\w-]+)$/, view: (m) => viewProduct(m[1]), name: 'product' },
  { re: /^#\/kontakt$/, view: viewContact, name: 'contact' },
  { re: /^#\/kasse$/, view: viewCheckout, name: 'checkout' },
];

function render() {
  const hash = location.hash || '#/';
  let html = viewNotFound();
  let name = 'notfound';

  for (const r of routes) {
    const m = hash.match(r.re);
    if (m) {
      html = typeof r.view === 'function' ? r.view(m) : r.view;
      name = r.name;
      break;
    }
  }

  const main = $('#app');
  main.innerHTML = html;
  main.dataset.route = name;

  // Header hell über dem dunklen Hero, sonst dunkel
  $('#site-header').classList.toggle('header--hero', name === 'home');

  // Aktiven Navigationslink markieren
  $$('[data-nav]').forEach((a) => {
    a.classList.toggle('is-active', a.getAttribute('href') === hash);
  });

  bindViewEvents(name);
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  closeMobileNav();
}

/* Bindet View-spezifische Interaktionen nach jedem Render. */
function bindViewEvents(name) {
  if (name === 'product') {
    // Bildergalerie: Pfeile, Punkte, Tastatur
    const gallery = $('.gallery');
    if (gallery) {
      gallery.addEventListener('click', (e) => {
        const arrow = e.target.closest('.gallery__arrow');
        if (arrow) {
          galleryGoTo(gallery, Number(gallery.dataset.index) + Number(arrow.dataset.dir));
          return;
        }
        const dot = e.target.closest('.gallery__dot');
        if (dot) galleryGoTo(gallery, Number(dot.dataset.go));
      });
      gallery.tabIndex = 0;
      gallery.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft')
          galleryGoTo(gallery, Number(gallery.dataset.index) - 1);
        else if (e.key === 'ArrowRight')
          galleryGoTo(gallery, Number(gallery.dataset.index) + 1);
      });
    }

    const sizes = $$('.size');
    sizes.forEach((btn) =>
      btn.addEventListener('click', () => {
        sizes.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      })
    );

    const swatches = $$('.swatch-btn');
    const colorNameEl = $('[data-color-name]');
    swatches.forEach((btn) =>
      btn.addEventListener('click', () => {
        swatches.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        if (colorNameEl) colorNameEl.textContent = colorName(btn.dataset.color);
      })
    );

    const add = $('#add-to-cart');
    if (add) {
      add.addEventListener('click', () => {
        const activeSize = $('.size.is-active');
        const activeColor = $('.swatch-btn.is-active');
        const res = Cart.add(
          add.dataset.id,
          activeSize ? activeSize.dataset.size : null,
          activeColor ? activeColor.dataset.color : null
        );
        toast(res.message, res.ok ? 'ok' : 'err');
        if (res.ok) {
          updateCartBadge();
          openCart();
        }
      });
    }
  }

  if (name === 'contact') {
    const form = $('#contact-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        toast(t('toast.fillFields'), 'err');
        form.reportValidity();
        return;
      }
      const fd = new FormData(form);
      const payload = {
        type: 'contact',
        name: (fd.get('name') || '').toString().trim(),
        email: (fd.get('email') || '').toString().trim(),
        message: (fd.get('message') || '').toString().trim(),
      };
      const btn = form.querySelector('button[type="submit"]');
      const label = btn.textContent;
      btn.disabled = true;
      btn.textContent = t('contact.sending');
      try {
        const r = await fetch(EMAIL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!r.ok) throw new Error('endpoint');
        form.reset();
        toast(t('toast.sent'));
      } catch (_) {
        // Fallback ohne Backend: E-Mail-Programm mit vorausgefüllter Nachricht öffnen
        const subject = encodeURIComponent('Marlinéa');
        const bodyTxt = encodeURIComponent(
          `Name: ${payload.name}\nE-Mail: ${payload.email}\n\n${payload.message}`
        );
        window.location.href = `mailto:${CONTACT_MAIL}?subject=${subject}&body=${bodyTxt}`;
        toast(t('toast.mailOpen'));
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  }

  if (name === 'checkout') {
    const form = $('#checkout-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!form.checkValidity()) {
          toast(t('toast.fillRequired'), 'err');
          form.reportValidity();
          return;
        }
        const orderId = Math.floor(100000 + Math.random() * 899999);

        // Bestelldetails per E-Mail an den Shop schicken (best effort)
        const fd = new FormData(form);
        const order = {
          id: orderId,
          customer: {
            name: `${fd.get('firstname') || ''} ${fd.get('lastname') || ''}`.trim(),
            email: (fd.get('email') || '').toString().trim(),
            address: `${fd.get('street') || ''}, ${fd.get('zip') || ''} ${
              fd.get('city') || ''
            }`.trim(),
          },
          items: Cart.detailed().map((l) => ({
            qty: l.qty,
            name: l.product.name,
            size: l.size,
            color: colorName(l.color),
            lineTotal: formatPrice(l.lineTotal),
          })),
          total: formatPrice(Cart.total()),
        };
        fetch(EMAIL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'order', order }),
        }).catch(() => {});

        Cart.clear();
        updateCartBadge();
        const main = $('#app');
        main.innerHTML = viewOrderConfirmed(orderId);
        main.dataset.route = 'confirmed';
      });
    }
  }
}

/* --------------------------- Globale Events ------------------------------ */

function bindGlobalEvents() {
  // Warenkorb öffnen
  $$('[data-open-cart]').forEach((el) =>
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    })
  );

  // Warenkorb schließen (Button, Overlay)
  $('#cart-close').addEventListener('click', closeCart);
  $('#overlay').addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });

  // Drawer-Interaktionen (Delegation)
  $('#drawer').addEventListener('click', (e) => {
    const closeLink = e.target.closest('[data-close-cart]');
    if (closeLink) {
      closeCart();
      return;
    }

    const remove = e.target.closest('[data-remove]');
    if (remove) {
      Cart.remove(remove.dataset.id, remove.dataset.size, remove.dataset.color);
      renderCartDrawer();
      if (location.hash === '#/kasse') render();
      return;
    }

    const qtyBtn = e.target.closest('.qty__btn');
    if (qtyBtn) {
      const wrap = qtyBtn.closest('.qty');
      const match = (i) =>
        i.id === wrap.dataset.id &&
        i.size === wrap.dataset.size &&
        i.color === wrap.dataset.color;
      const line = Cart.items.find(match);
      if (!line) return;
      const delta = qtyBtn.dataset.act === 'inc' ? 1 : -1;
      const before = line.qty;
      Cart.setQty(wrap.dataset.id, wrap.dataset.size, wrap.dataset.color, line.qty + delta);
      const after = Cart.items.find(match)?.qty ?? 0;
      if (delta > 0 && after === before) {
        const p = getProduct(wrap.dataset.id);
        toast(t('toast.maxShort', { n: p.maxOrder }), 'err');
      }
      renderCartDrawer();
      if (location.hash === '#/kasse') render();
      return;
    }
  });

  // „Zur Kasse" aus dem Drawer → Stripe Checkout (Fallback: einfacher Checkout)
  $('#cart-checkout').addEventListener('click', startCheckout);

  // Mobile-Navigation
  $('#nav-toggle').addEventListener('click', () => {
    $('#site-nav').classList.toggle('is-open');
    $('#nav-toggle').classList.toggle('is-open');
  });

  // Sprach-Umschalter (DE / EN)
  const langToggle = $('#lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', (e) => {
      const b = e.target.closest('[data-lang]');
      if (b) setLang(b.dataset.lang);
    });
  }

  // Header-Zustand beim Scrollen
  const header = $('#site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function closeMobileNav() {
  $('#site-nav')?.classList.remove('is-open');
  $('#nav-toggle')?.classList.remove('is-open');
}

/* ------------------------------- Init ------------------------------------ */

function init() {
  Cart.load();
  bindGlobalEvents();
  updateCartBadge();
  window.addEventListener('hashchange', render);

  // Sprache anwenden (statische Bereiche + Titel + Toggle)
  document.documentElement.lang = LANG;
  document.title = t('meta.title');
  applyStaticI18n();
  updateLangToggle();

  render();

  // Rückkehr von Stripe auswerten (?paid=... / ?canceled=1)
  const params = new URLSearchParams(location.search);
  if (params.get('paid')) {
    const sid = params.get('paid');
    history.replaceState({}, '', location.pathname);
    confirmPaidOrder(sid);
  } else if (params.get('canceled')) {
    history.replaceState({}, '', location.pathname);
    toast(t('toast.canceled'), 'err');
  }

  // Jahr im Footer
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', init);
