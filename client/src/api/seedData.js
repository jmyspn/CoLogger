// Starting data for DEMO MODE ONLY (mockApi.js).
//
// The real application gets its sample data from server/db/seed.sql. This file
// holds the same invented collections so the GitHub Pages demo looks the same.
// It is written to the browser's storage once, the first time demo mode runs,
// and never again: after that, whatever the visitor adds, edits or deletes is
// what they see.

export const DEMO_EMAIL = 'demo@cologger.test'
export const DEMO_PASSWORD = 'cologger-demo'

export const seedCollections = [
  { key: 'keyboards', name: 'Mechanical Keyboards', description: 'My mechanical and Hall Effect keyboard collection.', daysAgo: 30 },
  { key: 'sneakers', name: 'Sneakers', description: 'Everyday runners and a few pairs I keep clean.', daysAgo: 20 },
  { key: 'cards', name: 'Trading Cards', description: 'Graded and raw cards worth keeping sleeved.', daysAgo: 10 },
]

export const seedItems = [
  { collection: 'keyboards', name: 'MCHOSE Ace 68', estimatedValue: 4500, currency: 'PHP', purchasePrice: 4000, acquiredDate: '2026-09-01', acquiredFrom: 'Local Store', condition: 'Like New', notes: 'One of my favorite Hall Effect keyboards.', isFavorite: true, daysAgo: 9 },
  { collection: 'keyboards', name: 'Wooting 60HE', estimatedValue: 10000, currency: 'PHP', purchasePrice: 11500, acquiredDate: '2025-06-14', acquiredFrom: 'Wooting online store', condition: 'Good', notes: 'Rapid trigger is the reason I bought it.', isFavorite: false, daysAgo: 8 },
  { collection: 'keyboards', name: 'Keychron Q1', estimatedValue: 7500, currency: 'PHP', purchasePrice: 9000, acquiredDate: '2024-11-02', acquiredFrom: 'Shopee', condition: 'Good', notes: 'Gasket mount, aluminium case. Lubed stabilisers.', isFavorite: false, daysAgo: 7 },
  { collection: 'sneakers', name: 'Adidas Ultraboost', estimatedValue: 7000, currency: 'PHP', purchasePrice: 9500, acquiredDate: '2025-12-15', acquiredFrom: 'Adidas Store', condition: 'Like New', notes: 'Core black colourway. Worn twice.', isFavorite: false, daysAgo: 6 },
  { collection: 'sneakers', name: 'Nike Air Force 1', estimatedValue: 4500, currency: 'PHP', purchasePrice: 5495, acquiredDate: '2025-03-08', acquiredFrom: 'Nike Store', condition: 'Good', notes: 'Triple white. Creasing on the toe box.', isFavorite: false, daysAgo: 5 },
  { collection: 'cards', name: 'Charizard Holo (Base Set)', estimatedValue: 350, currency: 'USD', purchasePrice: 120, acquiredDate: '2019-07-20', acquiredFrom: 'Card show', condition: 'Fair', notes: 'Unlimited print. Light whitening on the back edges.', isFavorite: true, daysAgo: 4 },
  { collection: 'cards', name: 'Blue-Eyes White Dragon (LOB)', estimatedValue: 80, currency: 'USD', purchasePrice: 45, acquiredDate: '2021-02-11', acquiredFrom: 'Local game store', condition: 'Good', notes: '', isFavorite: false, daysAgo: 3 },
  { collection: 'cards', name: 'Pikachu Promo', estimatedValue: 15, currency: 'USD', purchasePrice: 5, acquiredDate: '2022-08-30', acquiredFrom: 'Trade with a friend', condition: 'Like New', notes: 'Kept in a top loader.', isFavorite: false, daysAgo: 2 },
]
