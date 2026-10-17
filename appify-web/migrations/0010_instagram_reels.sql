-- The concept websites open their own Instagram reels, with the reels' own covers as thumbnails (from each reel
-- project's covers/ folder). The series on Instagram is Animated website 01-04: Oddball, Valmora, Earshot, NAÏADE.
UPDATE projects SET ig_url = 'https://www.instagram.com/reel/Deb6Qg5ogMC/', poster = '/media/ig/oddball.webp', sort = 5 WHERE slug = 'oddball';
UPDATE projects SET ig_url = 'https://www.instagram.com/reel/Decs39DIY51/', poster = '/media/ig/valmora.webp', sort = 6 WHERE slug = 'valmora';
UPDATE projects SET ig_url = 'https://www.instagram.com/reel/Ded_d4NI6AZ/', poster = '/media/ig/earshot.webp', sort = 7 WHERE slug = 'earshot';
INSERT INTO projects (slug, kind, title, client, category, status, summary, description, ig_url, poster, aspect, sort) VALUES
 ('naiade', 'website', 'NAÏADE', 'Concept brand', 'Animated website', 'concept',
  'A concept jewelry house: an animated website that walks through each piece as you scroll.',
  'Animated website 04 in our series: a jewelry house where every piece gets its own moment on the page as you scroll. NAÏADE is a concept brand; its pieces, prices and imagery are fictional.',
  'https://www.instagram.com/reel/DeflqSJomM3/', '/media/ig/naiade.webp', '9/16', 8);
-- Firnlight isn't part of the Instagram series; it comes off the site (published = 0 keeps it, ready to bring back).
UPDATE projects SET published = 0 WHERE slug = 'firnlight';
