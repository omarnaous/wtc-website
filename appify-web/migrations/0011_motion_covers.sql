-- Motion videos show the covers they were posted with on Instagram (from each reel project's covers/ folder).
-- The four without a saved cover (subscription-killer, logo-reveal, comparison, wtc-launch) keep their frame.
UPDATE motion SET poster = '/media/ig/showreel.webp' WHERE slug = 'showreel';
UPDATE motion SET poster = '/media/ig/photos-get-scrolled.webp' WHERE slug = 'photos-get-scrolled';
UPDATE motion SET poster = '/media/ig/lifetime.webp' WHERE slug = 'lifetime';
UPDATE motion SET poster = '/media/ig/ideas-appified.webp' WHERE slug = 'ideas-appified';
UPDATE motion SET poster = '/media/ig/balloon.webp' WHERE slug = 'balloon';
UPDATE motion SET poster = '/media/ig/ecommerce-chat.webp' WHERE slug = 'ecommerce-chat';
UPDATE motion SET poster = '/media/ig/meta-ads.webp' WHERE slug = 'meta-ads';
