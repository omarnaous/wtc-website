-- Checkout.
--
-- No new tables: an order placed on the site is the same shape as one taken
-- over WhatsApp, and `orders.channel` already tells them apart. This only
-- adjusts copy that stopped being true once the bag existed, and sets the
-- delivery charge the checkout quotes.

-- The button used to say "Reserve this piece", which was honest when it did
-- nothing. Only rewritten where it is still that exact text, so a shop that
-- has already reworded it is left alone.
UPDATE content_sections
   SET data = json_set(data, '$.buyLabel', 'Add to bag'),
       updated_at = datetime('now')
 WHERE key = 'productPage'
   AND json_extract(data, '$.buyLabel') = 'Reserve this piece';

-- Flat delivery fee in USD, and the order value above which it is waived.
-- freeOver = 0 turns the waiver off. Edited under Settings → Delivery.
INSERT INTO settings (key, value)
VALUES ('delivery', '{"fee":5,"freeOver":0}')
ON CONFLICT(key) DO NOTHING;
