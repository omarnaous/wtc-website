-- DeHXgu8I4IL (posted 5 Oct, 13:56 UTC, half an hour after logo reveal v2) is the logo reveal, and the "Meet appify"
-- cover belongs to it, not to the "Ideas, appified." kinetic type reel, which goes back to its own frame and the profile.
UPDATE motion SET ig_url = 'https://www.instagram.com/reel/DeHXgu8I4IL/', poster = '/media/ig/logo-reveal.webp' WHERE slug = 'logo-reveal';
UPDATE motion SET ig_url = NULL, poster = '/media/ideas-appified.webp' WHERE slug = 'ideas-appified';
