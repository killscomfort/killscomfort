-- KILLSCOMFORT ACADEMY // lesson seed (source of truth for XP + gating)
-- Run AFTER schema.sql
insert into public.lessons (slug, sector, sort, xp, is_free) values
('why-color',1,1,50,true),('sacred-ratios',1,2,50,true),('the-twelve',1,3,50,true),
('reading-the-wheel',1,4,50,true),('pulse-and-grid',1,5,50,true),
('major-scale',2,1,60,true),('intervals',2,2,60,true),('relative-minor',2,3,60,true),('key-signatures',2,4,60,true),
('triads',3,1,70,false),('geometry-of-chords',3,2,70,false),('chord-functions',3,3,70,false),
('sevenths',3,4,70,false),('borrowed-colors',3,5,70,false),
('core-palettes',4,1,80,false),('melody-over-harmony',4,2,80,false),
('tension-complements',4,3,80,false),('modulation',4,4,80,false),
('writing-in-key',5,1,90,false),('sample-keying',5,2,90,false),
('harmonic-mixing',5,3,90,false),('form-arrangement',5,4,90,false),
('frequency-temperature',6,1,100,false),('eq-color-balance',6,2,100,false),
('effects-atmosphere',6,3,100,false),('cymatics-and-space',6,4,100,false)
on conflict (slug) do update set sector=excluded.sector, sort=excluded.sort, xp=excluded.xp, is_free=excluded.is_free;
