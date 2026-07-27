/* =========================================================================
   PRAYKI · Server-seitiger Produktkatalog (maßgebliche Preise)
   -------------------------------------------------------------------------
   Preise NIE aus dem Frontend übernehmen (manipulierbar). Stripe-Beträge
   werden ausschließlich aus diesem Katalog gebildet. Beträge in Cent, EUR.
   ========================================================================= */

module.exports = {
  'kinder-hoodie': { name: 'Kinder Hoodie', price: 5000, maxOrder: null },
  'erwachsenen-hoodie': { name: 'Erwachsenen Hoodie', price: 6000, maxOrder: null },
  'wing-hoodie': { name: 'Wing Hoodie', price: 5500, maxOrder: 2 },
};
