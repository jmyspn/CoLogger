-- Sample collections and items for the demo account.
--
-- Do not run this file directly: run `npm run db:seed`, which calls db/seed.js.
-- seed.js empties every table first (TRUNCATE), creates the demo user with a
-- properly bcrypt-hashed password, and then runs this file. The TRUNCATE is
-- correct on your laptop and catastrophic against a live database, so check
-- which DATABASE_URL is loaded before seeding.
--
-- All data here is invented. Collections are looked up by name rather than by
-- a hardcoded id, so the file does not depend on SERIAL values.

INSERT INTO collections (user_id, name, description, created_at) VALUES
  ((SELECT id FROM users WHERE email = 'demo@cologger.test'),
   'Mechanical Keyboards', 'My mechanical and Hall Effect keyboard collection.',
   now() - interval '30 days'),
  ((SELECT id FROM users WHERE email = 'demo@cologger.test'),
   'Sneakers', 'Everyday runners and a few pairs I keep clean.',
   now() - interval '20 days'),
  ((SELECT id FROM users WHERE email = 'demo@cologger.test'),
   'Trading Cards', 'Graded and raw cards worth keeping sleeved.',
   now() - interval '10 days');

INSERT INTO items (collection_id, name, estimated_value, currency, purchase_price,
                   acquired_date, acquired_from, condition, notes, is_favorite, created_at)
SELECT c.id, v.name, v.estimated_value, v.currency, v.purchase_price,
       v.acquired_date::date, v.acquired_from, v.condition, v.notes, v.is_favorite,
       now() - v.age::interval
FROM (VALUES
  ('Mechanical Keyboards', 'MCHOSE Ace 68', 4500, 'PHP', 4000, '2026-09-01', 'Local Store',
   'Like New', 'One of my favorite Hall Effect keyboards.', true, '9 days'),
  ('Mechanical Keyboards', 'Wooting 60HE', 10000, 'PHP', 11500, '2025-06-14', 'Wooting online store',
   'Good', 'Rapid trigger is the reason I bought it.', false, '8 days'),
  ('Mechanical Keyboards', 'Keychron Q1', 7500, 'PHP', 9000, '2024-11-02', 'Shopee',
   'Good', 'Gasket mount, aluminium case. Lubed stabilisers.', false, '7 days'),
  ('Sneakers', 'Adidas Ultraboost', 7000, 'PHP', 9500, '2025-12-15', 'Adidas Store',
   'Like New', 'Core black colourway. Worn twice.', false, '6 days'),
  ('Sneakers', 'Nike Air Force 1', 4500, 'PHP', 5495, '2025-03-08', 'Nike Store',
   'Good', 'Triple white. Creasing on the toe box.', false, '5 days'),
  ('Trading Cards', 'Charizard Holo (Base Set)', 350, 'USD', 120, '2019-07-20', 'Card show',
   'Fair', 'Unlimited print. Light whitening on the back edges.', true, '4 days'),
  ('Trading Cards', 'Blue-Eyes White Dragon (LOB)', 80, 'USD', 45, '2021-02-11', 'Local game store',
   'Good', '', false, '3 days'),
  ('Trading Cards', 'Pikachu Promo', 15, 'USD', 5, '2022-08-30', 'Trade with a friend',
   'Like New', 'Kept in a top loader.', false, '2 days')
) AS v(collection_name, name, estimated_value, currency, purchase_price, acquired_date,
       acquired_from, condition, notes, is_favorite, age)
JOIN collections c
  ON c.name = v.collection_name
 AND c.user_id = (SELECT id FROM users WHERE email = 'demo@cologger.test');
