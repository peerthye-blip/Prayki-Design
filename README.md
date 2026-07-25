# PRAYKI — Minimal Streetwear

Eine moderne, minimalistische E-Commerce-Website für die Modemarke **Prayki**.
Luxuriöser, monochromer Streetwear-Look in **Schwarz · Weiß · Grau**.

## Highlights

- **Reines Vanilla-Setup** — HTML, CSS und JavaScript, kein Build-Schritt, keine
  Abhängigkeiten. Dadurch extrem schnelle Ladezeiten.
- **Single-Page-App** mit Hash-Routing (Startseite, Shop, Produktseite, Über,
  Kontakt, Kasse).
- **Warenkorb** mit `localStorage`-Persistenz: hinzufügen, Menge ändern,
  entfernen, Gesamtsumme, Kasse.
- **Voll responsive** für Smartphone, Tablet und Desktop.
- **Eigene, monochrome SVG-Artworks** für die Hoodies — keine externen Bilder.
- Barrierearm: `prefers-reduced-motion`, Tastatur-Fokuszustände, ARIA-Labels.

## Struktur

```
.
├── index.html          # App-Shell: Header, Footer, Warenkorb-Drawer
├── css/
│   └── styles.css      # Komplettes Design-System (monochrom)
├── js/
│   ├── products.js     # Produktdaten + SVG-Artwork-Generator
│   └── app.js          # Router, Warenkorb, Views, Interaktionen
└── assets/
    └── favicon.svg
```

## Sortiment

| Produkt              | Preis | Größen              | Besonderheit                         |
|----------------------|-------|---------------------|--------------------------------------|
| Kinder Hoodie        | 50 €  | XS · S · M · L · XL  | Schwarz                              |
| Erwachsenen Hoodie   | 60 €  | XS · S · M · L · XL  | Schwarz                              |
| Wing Hoodie          | 55 €  | nur S               | 🔥 Nur noch 2 bestellbar (fast ausverkauft) |

## Lokal starten

Einfach `index.html` im Browser öffnen — oder ein kleiner Server:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Erweiterbar

Neue Produkte lassen sich durch einen weiteren Eintrag im Array `PRODUCTS`
in `js/products.js` hinzufügen — Shop, Produktseite und Warenkorb übernehmen
das Produkt automatisch.
