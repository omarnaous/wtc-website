-- Live client websites are shown as previews of the real site (a desktop and a phone screenshot) and open the site.
-- Everything else in the portfolio (concept builds, motion work) opens on Instagram: ig_url is the reel's own link,
-- and while it's empty the card opens the Appify profile.
ALTER TABLE projects ADD COLUMN preview TEXT;
ALTER TABLE projects ADD COLUMN ig_url TEXT;
ALTER TABLE motion ADD COLUMN ig_url TEXT;

UPDATE projects SET preview = '/media/sites/watch-trade-chronicles.webp', sort = 1 WHERE slug = 'watch-trade-chronicles';

INSERT INTO projects (slug, kind, title, client, category, status, summary, description, live_url, preview, aspect, sort) VALUES
 ('follies-dapres-midi', 'website', 'Follies d''Après-Midi', 'Follies d''Après-Midi', 'E-commerce', 'live',
  'An online boutique for a Beirut luxury prêt-à-porter label: ready-to-wear, jewellery and accessories, made in Lebanon.',
  'The website and online boutique for Follies d''Après-Midi, a Beirut label that designs and produces luxury prêt-à-porter in limited quantities in Lebanon. The house is told floor by floor, with the boutique, accessories, the lookbook and where to find them.',
  'https://folliesdapresmidi.com', '/media/sites/follies-dapres-midi.webp', '16/10', 2),
 ('myriam-kayali-art', 'website', 'Myriam Kayali Art', 'Myriam Kayali', 'Artist portfolio', 'live',
  'A website for a Beirut painter: her collection, prints and painting commissions.',
  'The website of Myriam Kayali, a Lebanese artist based in Beirut whose contemporary paintings are rooted in memory, place and everyday rituals. Visitors can browse the collection, buy prints and commission a painting.',
  'https://www.myriamkay.art', '/media/sites/myriam-kayali-art.webp', '16/10', 3),
 ('panna-king', 'website', 'Panna King', 'Coach Kassem', 'Online academy', 'live',
  'A street football academy for Coach Kassem: training programs, challenges and student accounts, in English and Arabic.',
  'The website and online academy for Panna King, where Coach Kassem teaches street football. Students pick a training program, take on challenges and sign in to their account, in English or Arabic.',
  'https://www.pannaking.com/en', '/media/sites/panna-king.webp', '16/10', 4);

UPDATE projects SET sort = 5 WHERE slug = 'firnlight';
UPDATE projects SET sort = 6 WHERE slug = 'oddball';
UPDATE projects SET sort = 7 WHERE slug = 'valmora';
UPDATE projects SET sort = 8 WHERE slug = 'earshot';
UPDATE projects SET sort = 9 WHERE slug = 'darebni-ai';
