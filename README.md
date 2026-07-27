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

## E-Mail-Versand (Kontakt & Bestellungen)

Kontaktanfragen und Bestellungen werden per **Resend** an die in `MAIL_TO`
hinterlegte Adresse geschickt. Der Versand läuft über die Serverless-Funktion
`api/send-email.js` – der API-Key liegt **ausschließlich als Server-Umgebungs-
variable** vor, niemals im Frontend oder im Repo.

> ⚠️ **Sicherheit:** Der Resend-Key darf nie in Client-Code/HTML/JS stehen
> (die Seite ist öffentlich). Ausschließlich als Env-Variable im Hosting setzen.

### Deployment mit Vercel (empfohlen)

1. Repo mit Vercel verbinden (Framework-Preset: „Other" / statisch).
2. Unter **Settings → Environment Variables** setzen:
   - `RESEND_API_KEY` = dein Resend-Key
   - `MAIL_TO` = `peer.thye@icloud.com`
   - `MAIL_FROM` = `Prayki <onboarding@resend.dev>` (oder eigene verifizierte Domain)
3. Deployen. Die Funktion ist dann unter `/api/send-email` erreichbar; das
   Formular postet automatisch dorthin.

### Absender / eigene Domain

Ohne eigene Domain funktioniert der Resend-Testabsender `onboarding@resend.dev`
– er stellt allerdings **nur an die E-Mail-Adresse des Resend-Kontoinhabers**
zu. Für Versand an beliebige Adressen (und ein sauberes „Von: Prayki") in
Resend eine **eigene Domain verifizieren** und `MAIL_FROM` entsprechend setzen.

### Ohne Backend (z. B. reine statische Vorschau)

Ist kein `/api/send-email` erreichbar, öffnet das Kontaktformular als Fallback
das E-Mail-Programm des Besuchers (`mailto:`), damit die Nachricht dich
trotzdem erreicht. Für automatischen Versand ist die Serverless-Funktion nötig.

Lokale Vorlage der Variablen: siehe `.env.example` (echte Werte in `.env`,
wird von `.gitignore` ausgeschlossen).

## Bezahlung (Stripe)

Der Warenkorb-Button **„Zur Kasse"** erstellt eine **Stripe-Checkout-Session**
(`api/create-checkout-session.js`) und leitet zur gehosteten Stripe-Bezahlseite
weiter. Preise werden **serverseitig** aus `lib/catalog.js` gebildet (nie aus
dem Frontend). Nach erfolgreicher Zahlung kehrt der Kunde auf
`/?paid=<session_id>` zurück; `api/order-complete.js` prüft bei Stripe, dass
wirklich bezahlt wurde, schickt dir die Bestell-Mail und zeigt die Bestätigung.

> Ist **kein** `STRIPE_SECRET_KEY` gesetzt, fällt der Checkout automatisch auf
> den einfachen Ablauf (`#/kasse`, Bestellung nur per E-Mail) zurück.

### Einrichtung

1. Stripe-Account anlegen → **Developers → API keys**.
2. In Vercel unter **Environment Variables** setzen:
   - `STRIPE_SECRET_KEY` = `sk_test_…` (Test) bzw. `sk_live_…` (Live)
   - (Resend-Variablen wie oben bleiben bestehen)
3. **Redeploy**.
4. Testen mit Stripe-Testkarte `4242 4242 4242 4242`, beliebiges künftiges
   Ablaufdatum, beliebige CVC/PLZ.

Preise ändern: `lib/catalog.js` (Beträge in **Cent**). Für den Live-Betrieb
in Stripe auf **Live-Modus** wechseln und den Live-Key hinterlegen.
