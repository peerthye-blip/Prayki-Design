/* =========================================================================
   MARLINÉA · Server-seitiger Produktkatalog (maßgebliche Preise)
   -------------------------------------------------------------------------
   Preise NIE aus dem Frontend übernehmen (manipulierbar). Stripe-Beträge
   werden ausschließlich aus diesem Katalog gebildet. Beträge in Cent, EUR.
   ========================================================================= */

module.exports = {
  'wing-hoodie': { name: 'Wing Hoodie', price: 5500, maxOrder: 2 },
  'tshirt': { name: 'T-Shirt', price: 2500, maxOrder: null },
};
