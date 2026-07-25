/* =========================================================================
   PRAYKI · App-Logik
   - Hash-basiertes Routing (SPA, keine Framework-Abhängigkeiten)
   - Warenkorb mit localStorage-Persistenz
   - Warenkorb-Drawer, Größenauswahl, Kasse
   ========================================================================= */

'use strict';

/* ----------------------------- Warenkorb --------------------------------- */

const CART_KEY = 'prayki_cart_v1';

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

  /** Fügt ein Produkt in einer bestimmten Größe hinzu (respektiert maxOrder). */
  add(productId, size) {
    const product = getProduct(productId);
    if (!product) return { ok: false, message: 'Produkt nicht gefunden.' };
    if (!size) return { ok: false, message: 'Bitte wähle eine Größe.' };

    const line = this.items.find(
      (i) => i.id === productId && i.size === size
    );
    const currentQty = line ? line.qty : 0;

    if (product.maxOrder && currentQty + 1 > product.maxOrder) {
      return {
        ok: false,
        message: `Von diesem Produkt sind nur noch ${product.maxOrder} Stück bestellbar.`,
      };
    }

    if (line) {
      line.qty += 1;
    } else {
      this.items.push({ id: productId, size, qty: 1 });
    }
    this.save();
    return { ok: true, message: `${product.name} (${size}) hinzugefügt.` };
  },

  setQty(productId, size, qty) {
    const product = getProduct(productId);
    const line = this.items.find(
      (i) => i.id === productId && i.size === size
    );
    if (!line) return;
    let next = Math.max(0, qty);
    if (product && product.maxOrder) next = Math.min(next, product.maxOrder);
    if (next === 0) {
      this.remove(productId, size);
    } else {
      line.qty = next;
      this.save();
    }
  },

  remove(productId, size) {
    this.items = this.items.filter(
      (i) => !(i.id === productId && i.size === size)
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
  return `
    <article class="card">
      <a class="card__media" href="#/produkt/${p.id}" aria-label="${p.name} ansehen">
        ${p.badge ? `<span class="card__flag">Fast ausverkauft</span>` : ''}
        <div class="card__art">${productMedia(p)}</div>
      </a>
      <div class="card__body">
        <h3 class="card__title">${p.name}</h3>
        <p class="card__meta">${p.color} · ${p.sizes.length > 1
          ? p.sizes[0] + '–' + p.sizes[p.sizes.length - 1]
          : 'Größe ' + p.sizes[0]}</p>
        <div class="card__foot">
          <span class="card__price">${formatPrice(p.price)}</span>
          <a class="btn btn--sm" href="#/produkt/${p.id}">Jetzt kaufen</a>
        </div>
      </div>
    </article>`;
}

function viewHome() {
  const featured = PRODUCTS.map(productCard).join('');
  return `
    <section class="hero">
      <div class="hero__art">${hoodieSVG({ id: 'hero' })}</div>
      <div class="hero__inner">
        <p class="hero__eyebrow">Prayki · Est. Streetwear</p>
        <h1 class="hero__title">PRAYKI –<br>Minimal Streetwear.</h1>
        <p class="hero__subtitle">Schlichte Designs. Höchste Qualität.</p>
        <a class="btn btn--lg" href="#/shop">Jetzt shoppen</a>
      </div>
      <span class="hero__scroll">Scroll</span>
    </section>

    <section class="section">
      <div class="section__head">
        <h2 class="section__title">Kollektion</h2>
        <a class="section__link" href="#/shop">Alle ansehen</a>
      </div>
      <div class="grid">${featured}</div>
    </section>

    <section class="promo">
      <div class="promo__inner">
        <h2 class="promo__title">Weniger. Aber besser.</h2>
        <p class="promo__text">
          Drei Hoodies. Ein Anspruch. Prayki steht für reduzierte Designs,
          erstklassige Materialien und einen zeitlosen, monochromen Look –
          gemacht für die Straße, gedacht für den Alltag.
        </p>
        <a class="btn btn--ghost" href="#/shop">Zur Kollektion</a>
      </div>
    </section>`;
}

function viewShop() {
  return `
    <section class="section section--top">
      <div class="page-head">
        <p class="page-head__eyebrow">Shop</p>
        <h1 class="page-head__title">Die Kollektion</h1>
        <p class="page-head__text">Drei Hoodies in reinem Schwarz. Wähle deinen Stil.</p>
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
                    data-go="${i}" aria-label="Bild ${i + 1} anzeigen"></button>`
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
                aria-label="Vorheriges Bild">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
               stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
               stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
        </button>
        <button class="gallery__arrow gallery__arrow--next" data-dir="1"
                aria-label="Nächstes Bild">
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

  return `
    <section class="pdp">
      <a class="pdp__back" href="#/shop">← Zurück zum Shop</a>
      <div class="pdp__grid">
        <div class="pdp__media">
          ${p.badge ? `<span class="pdp__flag">Fast ausverkauft</span>` : ''}
          ${p.images && p.images.length ? galleryMarkup(p) : `<div class="pdp__art">${p.art()}</div>`}
        </div>

        <div class="pdp__info">
          ${p.badge ? `<p class="stock-alert">${p.badge}</p>` : ''}
          <h1 class="pdp__title">${p.name}</h1>
          <p class="pdp__price">${formatPrice(p.price)}</p>
          <p class="pdp__desc">${p.description}</p>

          <div class="pdp__row">
            <span class="pdp__label">Farbe</span>
            <span class="swatch" title="Schwarz"></span>
            <span class="pdp__value">${p.color}</span>
          </div>

          <div class="pdp__row pdp__row--col">
            <span class="pdp__label">Größe</span>
            <div class="sizes" role="group" aria-label="Größe wählen">${sizes}</div>
          </div>

          <button class="btn btn--lg btn--full" id="add-to-cart"
                  data-id="${p.id}">In den Warenkorb</button>

          <ul class="pdp__usp">
            <li>Premium-Baumwollmix, angenehm weich</li>
            <li>Unisex-Schnitt, modernes Streetwear-Design</li>
            <li>Versandfertig in 1–2 Werktagen</li>
          </ul>
        </div>
      </div>
    </section>`;
}

function viewContact() {
  return `
    <section class="section section--top prose">
      <div class="page-head">
        <p class="page-head__eyebrow">Kontakt</p>
        <h1 class="page-head__title">Sag Hallo</h1>
        <p class="page-head__text">
          Fragen zu Bestellung, Größen oder Versand? Wir sind für dich da.
        </p>
      </div>

      <div class="contact">
        <div class="contact__info">
          <p><span class="contact__label">E-Mail</span>peer.thye@icloud.com</p>
          <p><span class="contact__label">Instagram</span>@prayki</p>
        </div>

        <form class="contact__form" id="contact-form" novalidate>
          <label class="field">
            <span>Name</span>
            <input type="text" name="name" required autocomplete="name">
          </label>
          <label class="field">
            <span>E-Mail</span>
            <input type="email" name="email" required autocomplete="email">
          </label>
          <label class="field">
            <span>Nachricht</span>
            <textarea name="message" rows="5" required></textarea>
          </label>
          <button class="btn btn--lg" type="submit">Nachricht senden</button>
        </form>
      </div>
    </section>`;
}

function viewCheckout() {
  const lines = Cart.detailed();
  if (!lines.length) {
    return `
      <section class="section section--top empty">
        <h1 class="empty__title">Dein Warenkorb ist leer</h1>
        <p class="empty__text">Füge zuerst einen Hoodie hinzu, um zur Kasse zu gehen.</p>
        <a class="btn btn--lg" href="#/shop">Zum Shop</a>
      </section>`;
  }

  const summary = lines
    .map(
      (l) => `
      <div class="sum__line">
        <span>${l.qty}× ${l.product.name} · ${l.size}</span>
        <span>${formatPrice(l.lineTotal)}</span>
      </div>`
    )
    .join('');

  return `
    <section class="section section--top checkout">
      <div class="page-head">
        <p class="page-head__eyebrow">Kasse</p>
        <h1 class="page-head__title">Bestellung abschließen</h1>
      </div>

      <div class="checkout__grid">
        <form class="checkout__form" id="checkout-form" novalidate>
          <fieldset class="fieldset">
            <legend>Kontakt</legend>
            <label class="field"><span>E-Mail</span>
              <input type="email" name="email" required autocomplete="email"></label>
          </fieldset>
          <fieldset class="fieldset">
            <legend>Lieferadresse</legend>
            <div class="field-row">
              <label class="field"><span>Vorname</span>
                <input type="text" name="firstname" required></label>
              <label class="field"><span>Nachname</span>
                <input type="text" name="lastname" required></label>
            </div>
            <label class="field"><span>Straße & Hausnummer</span>
              <input type="text" name="street" required></label>
            <div class="field-row">
              <label class="field"><span>PLZ</span>
                <input type="text" name="zip" required></label>
              <label class="field"><span>Ort</span>
                <input type="text" name="city" required></label>
            </div>
          </fieldset>
          <button class="btn btn--lg btn--full" type="submit">Kauf abschließen</button>
        </form>

        <aside class="sum">
          <h2 class="sum__title">Übersicht</h2>
          ${summary}
          <div class="sum__line sum__line--row">
            <span>Versand</span><span>Kostenlos</span>
          </div>
          <div class="sum__total">
            <span>Gesamt</span><span>${formatPrice(Cart.total())}</span>
          </div>
        </aside>
      </div>
    </section>`;
}

function viewOrderConfirmed(orderId) {
  return `
    <section class="section section--top empty">
      <div class="check-icon">✓</div>
      <h1 class="empty__title">Danke für deine Bestellung!</h1>
      <p class="empty__text">
        Deine Bestellung <strong>#${orderId}</strong> wurde erfolgreich
        aufgegeben. Eine Bestätigung ist unterwegs zu dir.
      </p>
      <a class="btn btn--lg" href="#/shop">Weiter shoppen</a>
    </section>`;
}

function viewNotFound() {
  return `
    <section class="section section--top empty">
      <h1 class="empty__title">Seite nicht gefunden</h1>
      <p class="empty__text">Diese Seite existiert leider nicht.</p>
      <a class="btn btn--lg" href="#/">Zur Startseite</a>
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
        <p>Dein Warenkorb ist leer.</p>
        <a class="btn btn--ghost" href="#/shop" data-close-cart>Zum Shop</a>
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
            <p class="citem__meta">Größe ${l.size} · ${formatPrice(l.product.price)}</p>
            <div class="qty" data-id="${l.id}" data-size="${l.size}">
              <button class="qty__btn" data-act="dec" aria-label="Weniger">−</button>
              <span class="qty__num">${l.qty}</span>
              <button class="qty__btn" data-act="inc" aria-label="Mehr">+</button>
            </div>
          </div>
          <div class="citem__right">
            <span class="citem__total">${formatPrice(l.lineTotal)}</span>
            <button class="citem__remove" data-remove
              data-id="${l.id}" data-size="${l.size}" aria-label="Entfernen">Entfernen</button>
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

    const add = $('#add-to-cart');
    if (add) {
      add.addEventListener('click', () => {
        const active = $('.size.is-active');
        const res = Cart.add(add.dataset.id, active ? active.dataset.size : null);
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
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        toast('Bitte fülle alle Felder aus.', 'err');
        return;
      }
      form.reset();
      toast('Danke! Deine Nachricht wurde gesendet.');
    });
  }

  if (name === 'checkout') {
    const form = $('#checkout-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!form.checkValidity()) {
          toast('Bitte fülle alle Pflichtfelder aus.', 'err');
          form.reportValidity();
          return;
        }
        const orderId = Math.floor(100000 + Math.random() * 899999);
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
      Cart.remove(remove.dataset.id, remove.dataset.size);
      renderCartDrawer();
      if (location.hash === '#/kasse') render();
      return;
    }

    const qtyBtn = e.target.closest('.qty__btn');
    if (qtyBtn) {
      const wrap = qtyBtn.closest('.qty');
      const line = Cart.items.find(
        (i) => i.id === wrap.dataset.id && i.size === wrap.dataset.size
      );
      if (!line) return;
      const delta = qtyBtn.dataset.act === 'inc' ? 1 : -1;
      const before = line.qty;
      Cart.setQty(wrap.dataset.id, wrap.dataset.size, line.qty + delta);
      const after =
        Cart.items.find(
          (i) => i.id === wrap.dataset.id && i.size === wrap.dataset.size
        )?.qty ?? 0;
      if (delta > 0 && after === before) {
        const p = getProduct(wrap.dataset.id);
        toast(`Nur noch ${p.maxOrder} Stück bestellbar.`, 'err');
      }
      renderCartDrawer();
      if (location.hash === '#/kasse') render();
      return;
    }
  });

  // „Zur Kasse" aus dem Drawer
  $('#cart-checkout').addEventListener('click', () => {
    closeCart();
    navigate('#/kasse');
  });

  // Mobile-Navigation
  $('#nav-toggle').addEventListener('click', () => {
    $('#site-nav').classList.toggle('is-open');
    $('#nav-toggle').classList.toggle('is-open');
  });

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
  render();

  // Jahr im Footer
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', init);
