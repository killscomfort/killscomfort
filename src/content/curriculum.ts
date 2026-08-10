// ============================================================
// KILLSCOMFORT ACADEMY — THE CHROMATIC WHEEL
// Full curriculum: 6 sectors / 27 lessons.
// Informed by the structure of university fundamentals programs
// (notation, keys, rhythm, meter, intervals, melody, chords,
// progressions, form + ear training) and production-school
// curricula (signal flow, arrangement, mixing, DJ performance),
// re-taught through one mapping: the circle of fifths as the
// color wheel, and its sacred geometry.
// ============================================================

export type Question = {
  q: string;
  options: string[];
  answer: number; // index
  why: string;    // shown after answering
};

export type Lesson = {
  slug: string;
  sector: number;
  title: string;
  tag: string;          // terminal-style eyebrow
  minutes: number;
  xp: number;
  free: boolean;
  focusKeys: string[];  // keys highlighted on the wheel
  geometry?: 'vesica' | 'dodecagram' | 'triangle' | 'square' | 'hexagon' | 'diameter' | 'flower' | 'phi' | 'chladni';
  content: string[];    // paragraphs; **bold** supported
  task: { intro: string; questions: Question[] };
};

export type Sector = {
  n: number;
  code: string;
  title: string;
  thesis: string;
  free: boolean;
};

export const SECTORS: Sector[] = [
  { n: 1, code: 'SECTOR.01', title: 'THE WHEEL', thesis: 'Twelve tones. Twelve hues. One circle.', free: true },
  { n: 2, code: 'SECTOR.02', title: 'SCALES & SHADES', thesis: 'Every key is a hue. Every scale is its family of shades.', free: true },
  { n: 3, code: 'SECTOR.03', title: 'CHORDS ARE COLOR MIXING', thesis: 'Stack tones like pigment. Geometry decides what you get.', free: false },
  { n: 4, code: 'SECTOR.04', title: 'PROGRESSIONS ARE PALETTES', thesis: 'A chord progression is a color scheme moving through time.', free: false },
  { n: 5, code: 'SECTOR.05', title: 'PRODUCTION IN COLOR', thesis: 'Write, sample, and mix in key — on purpose.', free: false },
  { n: 6, code: 'SECTOR.06', title: 'MIXING THE SPECTRUM', thesis: 'A mix is a light balance. Engineer the spectrum.', free: false },
];

export const LESSONS: Lesson[] = [
  // ==================== SECTOR 01 — THE WHEEL ====================
  {
    slug: 'why-color', sector: 1, title: 'Sound Is Light, Slowed Down', tag: 'sig.01 // THE MAPPING',
    minutes: 6, xp: 50, free: true, focusKeys: ['C'], geometry: 'vesica',
    content: [
      "Sound and light are both **vibration**. Pitch is how fast air vibrates; color is how fast light vibrates. Double any frequency and you get the same note an octave higher — 261Hz is C, 523Hz is also C. Keep doubling a sound wave about forty times and you'd land in the frequency range of visible light. Sound is not literally color, but they are the same phenomenon at different speeds: repeating waves, organized by ratio.",
      "That's why this course maps the twelve musical keys onto the twelve hues of the color wheel. It's not decoration — it's a **memory engine**. Your visual brain is brilliant at judging color relationships instantly: you know red and orange belong together and red and cyan fight. Musical key relationships work exactly the same way, but they're invisible. Borrow your eyes, and harmony becomes something you can *see*.",
      "One rule governs the whole system: **neighbors agree, opposites collide**. Keys next to each other on the wheel share almost all their notes and blend smoothly, like analogous colors. Keys across the wheel share almost nothing and create maximum tension, like complementary colors. Every lesson from here is a consequence of that rule.",
    ],
    task: {
      intro: 'CALIBRATION CHECK // confirm the mapping is loaded.',
      questions: [
        { q: 'What happens to a note when you double its frequency?', options: ['It becomes a different note', 'It becomes the same note, one octave higher', 'It becomes its complementary key', 'It becomes twice as loud'], answer: 1, why: 'Doubling frequency = same pitch class, one octave up. This is the foundation of the whole octave system.' },
        { q: 'On the wheel, keys that sit next to each other…', options: ['clash with maximum tension', 'are unrelated', 'share almost all their notes and blend smoothly', 'are always minor keys'], answer: 2, why: 'Adjacent keys differ by only one note — the musical equivalent of analogous colors.' },
        { q: 'Why map keys to colors at all?', options: ['Because sound literally is color', 'To make harmony relationships visible and instant, like color relationships', 'Because DJs invented it', 'To replace learning theory'], answer: 1, why: "The mapping is a memory engine: your eyes already understand relationships your ears are still learning." },
      ],
    },
  },
  {
    slug: 'sacred-ratios', sector: 1, title: 'The First Instrument Was a Ratio', tag: 'sig.02 // PYTHAGORAS',
    minutes: 7, xp: 50, free: true, focusKeys: ['C', 'G'], geometry: 'vesica',
    content: [
      "Around 2,500 years ago, Pythagoras stretched a single string and divided it. Halve the string — **2:1** — and you hear the octave. Divide it two-thirds — **3:2** — and you hear the perfect fifth, the most stable interval after the octave. Simple whole-number ratios sound consonant; messy ratios sound tense. This was the first recorded discovery that music is **number made audible**, and it's the root of everything called sacred geometry in sound.",
      "The ancients pushed the idea to the cosmos: Plato and later Kepler described a *music of the spheres*, planetary orbits tuned like a great instrument. Take that as poetry or as physics-adjacent intuition — but the core observation survives every era: **harmony is geometry**. Two tones a fifth apart are two circles whose proportions lock together, like the vesica piscis — the lens formed where two equal circles overlap. Two identities, one shared space. That shared space is consonance.",
      "Our wheel is built from this ratio. Step by perfect fifth (3:2) twelve times and you visit every key exactly once before returning home. The 3:2 ratio *generates* the twelve-tone universe — which is why the circle of **fifths**, not the plain chromatic circle, is the true map of harmony. When you look at the wheel, you're looking at Pythagoras' string bent into a circle.",
    ],
    task: {
      intro: 'RATIO CHECK // number → sound.',
      questions: [
        { q: 'The ratio 3:2 produces which interval?', options: ['The octave', 'The perfect fifth', 'The tritone', 'The major third'], answer: 1, why: '3:2 is the perfect fifth — the generator interval of the entire circle of fifths.' },
        { q: 'Why do simple ratios matter?', options: ['They are louder', 'They sound consonant and stable to the ear', 'They are easier to play', 'They only matter in classical music'], answer: 1, why: 'Simple whole-number frequency ratios align wave peaks — the ear reads that alignment as consonance.' },
        { q: 'Stepping by perfect fifths twelve times from any key…', options: ['repeats the same 3 keys', 'visits every key once and returns home', 'goes up one octave', 'leaves the wheel'], answer: 1, why: 'The fifth generates all twelve keys — that closure is why the wheel is a perfect circle.' },
      ],
    },
  },
  {
    slug: 'the-twelve', sector: 1, title: 'Twelve Tones, Twelve Hues', tag: 'sig.03 // THE DODECAGON',
    minutes: 6, xp: 50, free: true, focusKeys: [], geometry: 'hexagon',
    content: [
      "Western music divides the octave into **twelve equal steps** — the chromatic scale: C, C♯, D, D♯, E, F, F♯, G, G♯, A, A♯, B, then C again. Not seven notes; seven is just the subset one key uses. Twelve is the full set of raw material, the same way the full color spectrum exists before a painter chooses a palette.",
      "Twelve is not arbitrary. It's the smallest number of equal divisions where stacked fifths (that 3:2 ratio) land back on their starting note almost perfectly. Twelve points on a circle form a **dodecagon** — a shape that hides every regular polygon inside it: triangles, squares, hexagons. Later you'll see those inscribed shapes ARE specific chords. The geometry isn't a metaphor sitting on top of the music. It *is* the music.",
      "So the full wheel = the full chromatic set = the full spectrum. A **key** is a choice: pick a home tone (a hue) and its seven-note family, and suddenly some notes are in-palette and the other five are outside colors you deploy deliberately. Fluency means knowing, at all times, which twelve-point positions are inside your palette and which aren't.",
    ],
    task: {
      intro: 'SET CHECK // the raw material.',
      questions: [
        { q: 'How many tones exist in the full chromatic set?', options: ['7', '8', '12', '24'], answer: 2, why: 'Twelve equal divisions of the octave — the complete raw material, like the full color spectrum.' },
        { q: 'A key is best described as…', options: ['all twelve notes at once', 'a chosen home tone plus its seven-note family — a palette', 'a genre', 'a tempo'], answer: 1, why: 'A key selects a palette from the full spectrum: seven in-palette tones, five outside colors.' },
        { q: 'Twelve points on a circle form a dodecagon. Why does that matter musically?', options: ['It looks cool', 'Regular shapes inscribed in it correspond to real chords', 'It sets the tempo', 'It does not'], answer: 1, why: 'Triangles, squares, and hexagons inscribed in the twelve points are actual chord structures — coming in Sector 03.' },
      ],
    },
  },
  {
    slug: 'reading-the-wheel', sector: 1, title: 'The Circle of Fifths Is a Star', tag: 'sig.04 // NAVIGATION',
    minutes: 8, xp: 50, free: true, focusKeys: ['C', 'G', 'F'], geometry: 'dodecagram',
    content: [
      "Arrange the twelve keys not chromatically but by **fifths** — C, G, D, A, E, B, F♯, D♭, A♭, E♭, B♭, F — and the circle becomes a map of *relatedness*. One step clockwise (C→G): you change exactly one note. One step counter-clockwise (C→F): one note the other way. Six steps away (C→F♯): almost nothing in common. Distance on this wheel **is** harmonic distance. That's the entire trick.",
      "Here's the sacred-geometry payoff: draw the chromatic circle (notes in pitch order), then connect every note to the note a fifth above it with a straight line, without lifting your pen. You trace a perfect **twelve-pointed star** — the dodecagram. The circle of fifths and the chromatic circle are the same twelve points; the star is the path harmony takes through them. Ancient geometers drew this figure for its own beauty. Musicians live inside it.",
      "Practice reading three things off the wheel instantly: **home** (your key), **neighbors** (the two keys one step away — your smoothest destinations), and **opposite** (six steps away — maximum tension). On our wheel these are literally: your hue, its analogous hues, and its complementary color. If you can read a color scheme, you can now read harmony.",
    ],
    task: {
      intro: 'NAVIGATION CHECK // read distance as relatedness.',
      questions: [
        { q: 'One clockwise step on the circle of fifths changes how many notes?', options: ['Zero', 'Exactly one', 'Six', 'All of them'], answer: 1, why: 'Adjacent keys differ by a single note — the closest possible relationship between two keys.' },
        { q: 'The key with maximum tension against C sits…', options: ['next to C', 'three steps away', 'directly across the wheel (F♯)', 'nowhere — all keys are equal'], answer: 2, why: 'Directly opposite = six fifths away = the tritone relationship = the complementary color.' },
        { q: 'Connecting every note to the note a fifth above traces…', options: ['a hexagon', 'a spiral', 'a twelve-pointed star (dodecagram)', 'a triangle'], answer: 2, why: 'The path of fifths through the chromatic circle draws the dodecagram — harmony’s own geometry.' },
      ],
    },
  },
  {
    slug: 'coltrane-circle', sector: 1, title: "Coltrane's Circle: History on the Wheel", tag: 'sig.05 // COLTRANE',
    minutes: 9, xp: 60, free: true, focusKeys: ['B', 'G', 'Eb'], geometry: 'triangle',
    content: [
      "In the early 1960s, **John Coltrane** drew a circle of tones that has become one of the most studied diagrams in jazz history — often called Coltrane's Circle or Tone Circle. It is not a different map from the circle of fifths you just learned. It is the *same twelve points*, covered in geometric overlays: stars, triangles, and interlocking paths. Coltrane was treating harmony the way this Academy does — as **shape you can see**, not only hear.",
      "That drawing sits next to his 1960 masterpiece ***Giant Steps***. The tune cycles home centers by **major thirds** — B → G → E♭ → B — an equilateral triangle on the chromatic circle. Three equal leaps of four semitones carve a closed loop with no \"easy\" neighbor-key glide; every landing is a new gravity well. Where the circle of fifths walks by one note at a time, Coltrane's triangle *jumps*. The ear feels the lift because the geometry is extreme on purpose.",
      "Coltrane was deep in spiritual study, physics, and sacred geometry while he practiced. The diagram is a historical receipt: a working musician used the wheel as a **laboratory**, not a classroom poster. When you highlight B, G, and E♭ on our Chromatic Wheel, you are standing inside the same architecture he mapped — neighbors for smooth travel, triangles for Giant Steps tension, the full dodecagon for the raw twelve. History lesson, then back to the grid: the past already proved this map is playable.",
    ],
    task: {
      intro: 'HISTORY CHECK // Coltrane on the wheel.',
      questions: [
        { q: "Coltrane's famous tone circle is best understood as…", options: ['a different tuning system that replaces the circle of fifths', 'the same twelve-tone wheel with geometric overlays he used as a practice map', 'a tempo chart for modal jazz', 'a brand logo'], answer: 1, why: 'Same twelve points — geometry drawn on top so relationships become visible, exactly like this Academy’s wheel.' },
        { q: 'Giant Steps cycles its key centers by…', options: ['perfect fifths only', 'major thirds — an equilateral triangle on the chromatic circle', 'chromatic half-steps', 'relative minors'], answer: 1, why: 'B–G–E♭ (and repeats) are four-semitone leaps: three equal sides, one closed triangle of homes.' },
        { q: 'Why does this history matter for producers and DJs?', options: ['It is only for saxophonists', 'It proves the wheel is a working tool musicians used to invent, not just memorize', 'Coltrane invented the twelve tones', 'It replaces learning rhythm'], answer: 1, why: 'Coltrane treated geometry as a lab for new movement — the same map you will use to write, sample, and mix.' },
      ],
    },
  },
  {
    slug: 'pulse-and-grid', sector: 1, title: 'Pulse & Grid', tag: 'sig.06 // TIME',
    minutes: 7, xp: 50, free: true, focusKeys: [], geometry: 'square',
    content: [
      "Color needs a canvas. In music, the canvas is **time**, and the grid stretched across it is meter. The pulse is the steady heartbeat (the BPM you already think in as a DJ). Meter groups pulses: **4/4** — four beats per bar — is the square frame nearly all club music is painted in. House and techno don't just use 4/4; they *are* 4/4, kick on every beat, a perfect square repeating forever.",
      "Subdivision is resolution. Split each beat in half for 8th notes, in quarters for 16ths — a finer and finer grid, like increasing the pixel density of your canvas. Swing pushes every second subdivision late, bending the square grid into something that breathes. **Rhythm is where a pattern sits on the grid; groove is how it leans against it.**",
      "Fluency task for the week: every track you hear, find the **1** — the downbeat that starts each bar — before you do anything else. Count 1-2-3-4 until it's automatic. Harmony tells you *what* colors; rhythm tells you *where* on the canvas they land. Producers who can't feel the 1 paint outside the frame without knowing it.",
    ],
    task: {
      intro: 'GRID CHECK // lock to the frame.',
      questions: [
        { q: '4/4 time means…', options: ['four bars per song', 'four beats per bar', 'a tempo of 44 BPM', 'four notes per chord'], answer: 1, why: 'Four beats grouped per bar — the square frame of club music.' },
        { q: 'Splitting each beat into four equal parts gives you…', options: ['whole notes', '8th notes', '16th notes', 'triplets'], answer: 2, why: '16ths are the quarter-split of the beat — the standard fine grid of drum programming.' },
        { q: 'Swing is…', options: ['a random timing error', 'delaying alternate subdivisions to make the grid lean and breathe', 'a chord type', 'playing without a grid'], answer: 1, why: 'Swing systematically pushes every second subdivision late — grid bent on purpose.' },
      ],
    },
  },

  // ==================== SECTOR 02 — SCALES & SHADES ====================
  {
    slug: 'major-scale', sector: 2, title: 'Building the Major Scale', tag: 'sig.07 // THE FORMULA',
    minutes: 8, xp: 60, free: true, focusKeys: ['C'], geometry: undefined,
    content: [
      "A scale is a key's **palette in order**. The major scale — the bright, resolved sound — is built from one formula: **W W H W W W H** (whole step, whole step, half step, whole, whole, whole, half). Start on C and apply it: C D E F G A B C. All white keys, no accidentals, which is why C major is the beginner's key — and why we place it at the top of the wheel at pure red, hue zero.",
      "The formula is portable. Start on G, apply W W H W W W H, and you get G A B C D E **F♯** G — one new note, one sharp. Start on F: F G A **B♭** C D E F — one flat. Every key is the *same shape* starting from a different point, the way every hue can produce the same family of tints and shades. Learn the shape once; own all twelve keys.",
      "Scale degrees matter more than note names. The 1 (tonic) is home — the hue itself. The 5 is its strongest ally. The 7 leans hungrily back toward home. When producers talk about 'the 5 of the key' they're using this portable language. From now on, think in degrees first, note names second.",
    ],
    task: {
      intro: 'FORMULA CHECK // one shape, twelve keys.',
      questions: [
        { q: 'The major scale formula is…', options: ['W H W H W H W', 'W W H W W W H', 'H H W W H W W', 'W W W H W W H'], answer: 1, why: 'Whole-whole-half-whole-whole-whole-half. One shape, portable to all twelve starting points.' },
        { q: 'G major contains which accidental?', options: ['B♭', 'F♯', 'C♯', 'None'], answer: 1, why: 'Applying the formula from G forces F♯ — the single note that separates G major from C major.' },
        { q: 'Scale degree 1 is called…', options: ['the dominant', 'the leading tone', 'the tonic — home', 'the octave'], answer: 2, why: 'The tonic is home base: the hue the whole palette is built around.' },
      ],
    },
  },
  {
    slug: 'intervals', sector: 2, title: 'Distance Is Contrast', tag: 'sig.08 // INTERVALS',
    minutes: 8, xp: 60, free: true, focusKeys: ['C', 'F♯'], geometry: 'diameter',
    content: [
      "An **interval** is the distance between two tones — and distance is contrast. Small, simple-ratio intervals (octave 2:1, fifth 3:2, fourth 4:3) are low-contrast: they blend like adjacent hues. Complex ratios (the minor second, the tritone) are high-contrast: they vibrate against each other like clashing colors. Neither is good or bad. **Consonance is rest; dissonance is energy.** Music is the traffic between them.",
      "Learn intervals as characters, not math: the **fifth** is stability (power chords are just roots and fifths). The **major third** is brightness, the **minor third** is shadow — the single semitone between them is the difference between a major and minor chord, a hue and its shade. The **tritone** — six semitones, the diameter of the wheel — is pure tension, the interval that demands resolution. Medieval theorists nicknamed it *diabolus in musica*; producers call it the sound of suspense.",
      "Train your ear with anchors: the fifth opens 'Star Wars'; the octave opens 'Somewhere Over the Rainbow'; the tritone opens 'The Simpsons' theme. Tap the wheel in this app and listen — every segment plays its tone, so the distance between any two segments is an interval you can hear *and* see as an angle. Angles are intervals. That's the geometry doing its job.",
    ],
    task: {
      intro: 'CONTRAST CHECK // hear the distance.',
      questions: [
        { q: 'The tritone spans…', options: ['half the wheel — the diameter', 'one wheel step', 'an octave', 'a third of the wheel'], answer: 0, why: 'Six semitones = directly across = the diameter = maximum harmonic contrast.' },
        { q: 'The difference between a major and minor third is…', options: ['a whole octave', 'one semitone', 'the tritone', 'nothing audible'], answer: 1, why: 'One semitone separates bright from shadowed — the smallest move with the biggest emotional swing.' },
        { q: 'Dissonance in music is best understood as…', options: ['a mistake', 'energy that seeks resolution', 'anything not in C major', 'a recording artifact'], answer: 1, why: 'Dissonance is fuel. Tension → release is the engine of every progression you will build.' },
      ],
    },
  },
  {
    slug: 'relative-minor', sector: 2, title: 'Shades: The Relative Minor', tag: 'sig.09 // LIGHT/DARK',
    minutes: 7, xp: 60, free: true, focusKeys: ['C'], geometry: undefined,
    content: [
      "Every hue has a shade. Every major key has a **relative minor**: a minor key built from the *exact same seven notes*, but with home moved to the 6th degree. C major and A minor share every note — same palette, different center of gravity. Same hue, darker value. On our wheel they occupy the same segment: the bright outer ring is the major, the dark inner ring is its relative minor.",
      "This is the most practically useful fact in dance music, because most club music lives in **minor keys**. When a track is in A minor, its full palette is the C major family — so everything you learned about C applies, just orbiting a darker sun. Switching a section between relative major and minor is a free mood shift: zero new notes, total change of light.",
      "Don't confuse *relative* with *parallel*. A minor is C major's relative (same notes, different home). C **minor** is C major's parallel (same home, three notes darkened). Relative = same palette re-centered. Parallel = same center re-painted. Both are tools; know which one you're reaching for.",
    ],
    task: {
      intro: 'SHADE CHECK // same pigment, less light.',
      questions: [
        { q: 'The relative minor of C major is…', options: ['C minor', 'E minor', 'A minor', 'G minor'], answer: 2, why: 'Built on the 6th degree: A minor shares all seven notes with C major.' },
        { q: 'A relative major/minor pair shares…', options: ['nothing', 'only the root note', 'every note — same palette, different home', 'only the fifth'], answer: 2, why: 'Identical palette, relocated center of gravity — the definition of relative keys.' },
        { q: 'C major vs C minor is an example of…', options: ['relative keys', 'parallel keys', 'enharmonic keys', 'the same key'], answer: 1, why: 'Same tonic, altered palette = parallel. Same palette, different tonic = relative.' },
      ],
    },
  },
  {
    slug: 'key-signatures', sector: 2, title: 'Reading Key Signatures', tag: 'sig.10 // THE CODE',
    minutes: 7, xp: 60, free: true, focusKeys: ['G', 'D', 'F', 'B♭'], geometry: undefined,
    content: [
      "Key signatures look like a cipher — clusters of sharps or flats at the start of written music — but the wheel decodes them instantly. **Each clockwise step from C adds one sharp. Each counter-clockwise step adds one flat.** C has none. G has one sharp. D has two. F has one flat, B♭ two. The number of accidentals is literally the key's distance from the top of the wheel.",
      "The accidentals even arrive in a fixed order — sharps: F♯ C♯ G♯ D♯ A♯ E♯ B♯; flats: the exact reverse — because each new key keeps the last key's alterations and adds one. Nothing to memorize note-by-note: the wheel position tells you *how many*, the fixed order tells you *which*.",
      "Producer's shortcut: your DAW and tools like Mixed In Key display keys constantly. When you see 'F♯ major / 6 sharps,' read it as a wheel coordinate: six steps from C, the far side, deep in the cool colors. A key signature is a **hue address**. You now read the address format.",
    ],
    task: {
      intro: 'DECODE CHECK // accidentals are coordinates.',
      questions: [
        { q: 'How many sharps does D major have?', options: ['One', 'Two', 'Three', 'None'], answer: 1, why: 'Two clockwise steps from C = two sharps (F♯ and C♯).' },
        { q: 'Moving counter-clockwise on the wheel adds…', options: ['sharps', 'flats', 'volume', 'tempo'], answer: 1, why: 'Counter-clockwise = the flat direction: F, B♭, E♭…' },
        { q: 'A key with 6 accidentals sits where on the wheel?', options: ['Next to C', 'Directly across from C', 'On C itself', 'Off the wheel'], answer: 1, why: 'Six accidentals = six steps = the opposite pole. Distance from C is the count of accidentals.' },
      ],
    },
  },

  // ==================== SECTOR 03 — CHORDS ARE COLOR MIXING ====================
  {
    slug: 'triads', sector: 3, title: 'Triads: Mixing Three Tones', tag: 'sig.11 // PIGMENT',
    minutes: 8, xp: 70, free: false, focusKeys: ['C'], geometry: 'triangle',
    content: [
      "A chord is tones **mixed like pigment** — sounded together so they fuse into one color. The basic unit is the triad: root, third, fifth. Stack in-palette thirds on each scale degree of a major key and you get its seven native chords, always in this pattern: **I major, ii minor, iii minor, IV major, V major, vi minor, vii° diminished**. Seven chords, free with every key. That's your paint set.",
      "The third you choose sets the light: a **major third** makes the chord bright, a **minor third** shades it. The fifth is the stabilizer — shrink it and you get the anxious **diminished** triad; stretch it and you get the dreamlike **augmented** triad. Four triad species: bright, shaded, compressed, expanded. Everything else is these plus extensions.",
      "Roman numerals are the portable names — uppercase major, lowercase minor. 'vi' means the same move in every key, the way 'complementary accent' means the same move in every palette. From here on, this course speaks Roman numerals; it's the language every session musician, ghost producer, and serious DJ shares.",
    ],
    task: {
      intro: 'MIX CHECK // three tones, one color.',
      questions: [
        { q: 'A basic triad consists of…', options: ['root, second, fourth', 'root, third, fifth', 'three random notes', 'root, fifth, octave'], answer: 1, why: 'Root + third + fifth: the minimal complete chord color.' },
        { q: 'What makes a triad minor instead of major?', options: ['A lower fifth', 'A lowered third', 'A louder root', 'A different key'], answer: 1, why: 'The third is the light switch: major third = bright, minor third = shade.' },
        { q: 'In any major key, the vi chord is…', options: ['major', 'minor', 'diminished', 'augmented'], answer: 1, why: 'The pattern is fixed in every key: I ii iii IV V vi vii° — the vi is always minor (and is the relative minor’s home chord).' },
      ],
    },
  },
  {
    slug: 'geometry-of-chords', sector: 3, title: 'The Geometry of Chords', tag: 'sig.12 // SACRED FORMS',
    minutes: 9, xp: 70, free: false, focusKeys: [], geometry: 'triangle',
    content: [
      "Place the twelve tones evenly on a circle and draw straight lines between chord tones. Chords become **shapes** — and the regular polygons of sacred geometry turn out to be real, playable sounds. The **augmented triad** divides the octave into three equal parts: a perfect equilateral triangle. The **diminished seventh** divides it into four: a perfect square. The **whole-tone scale** divides it into six: a hexagon. The **tritone** is the diameter itself.",
      "Here's the deep part: perfectly symmetrical shapes produce perfectly *ambiguous* sounds. An equilateral triangle has no 'top,' and an augmented triad has no home — spin it a third of a turn and it maps onto itself, so the ear can't tell which note is the root. Symmetry erases gravity. That's why augmented and diminished chords feel suspended, floating, unresolved — and why composers use them as **trapdoors between keys**: a shape with no home can enter any home. Coltrane's *Giant Steps* centers (B–G–E♭) are the same triangle idea applied to *key homes*, not just chord tones — history you already met in Sector 01.",
      "Ordinary major and minor triads are *slightly asymmetric* triangles — and that tiny asymmetry is exactly what gives them a root, a direction, a place on the wheel. Perfect symmetry is beautiful and rootless; broken symmetry is where music gets gravity. If you take one idea from sacred geometry into your sessions, take this: **the shape of a chord predicts how it behaves.**",
    ],
    task: {
      intro: 'FORM CHECK // shape predicts behavior.',
      questions: [
        { q: 'The augmented triad drawn on the chromatic circle forms…', options: ['a square', 'an equilateral triangle', 'a hexagon', 'a straight line'], answer: 1, why: 'It splits the octave into three equal 4-semitone parts — the perfect triangle.' },
        { q: 'Why do perfectly symmetrical chords sound ambiguous?', options: ['They are too quiet', 'Symmetry gives no note priority, so the ear finds no root', 'They use notes outside the twelve', 'They are always dissonant'], answer: 1, why: 'Rotate the shape and it maps onto itself — no top, no home, no gravity.' },
        { q: 'The diminished seventh chord inscribes which shape?', options: ['A triangle', 'A square', 'A pentagon', 'A circle'], answer: 1, why: 'Four notes, three semitones apart — the octave divided into four equal parts.' },
      ],
    },
  },
  {
    slug: 'chord-functions', sector: 3, title: 'Base, Support, Accent', tag: 'sig.13 // FUNCTION',
    minutes: 8, xp: 70, free: false, focusKeys: ['C', 'G', 'F'], geometry: undefined,
    content: [
      "Interior designers use the 60-30-10 rule: a dominant base color, a secondary support, a small sharp accent. Keys work the same way. Every chord in a key performs one of three **functions**: **Tonic** (home, rest — the I and its stand-ins iii and vi), **Subdominant** (motion away from home — IV and ii), and **Dominant** (tension demanding return — V and vii°). Base, support, accent.",
      "The dominant works because of physics, not convention: the V chord contains the **leading tone** (the 7th degree, one semitone below home) plus, in a V7, a built-in tritone — the diameter of the wheel embedded in the chord. That geometry aches to collapse inward to the tonic. Tension isn't a vibe; it's a shape under load.",
      "Hear the loop everywhere: home → away → tension → home. T → S → D → T. Verse-loops in house, four-chord pop, gospel turnarounds — all of it is this cycle wearing different clothes. When a section of your track feels aimless, diagnose it functionally: you probably painted support-on-support with no accent, or never left home at all.",
    ],
    task: {
      intro: 'FUNCTION CHECK // every chord has a job.',
      questions: [
        { q: 'The three harmonic functions are…', options: ['loud, soft, medium', 'tonic, subdominant, dominant', 'major, minor, diminished', 'intro, drop, outro'], answer: 1, why: 'Home, away, tension — base, support, accent. Every diatonic chord serves one.' },
        { q: 'Why does the V7 chord pull so hard toward home?', options: ['It is the loudest chord', 'It contains the leading tone and a tritone that resolve inward', 'Tradition only', 'It is always played first'], answer: 1, why: 'The embedded tritone + leading tone are geometry under load, collapsing to the tonic.' },
        { q: 'A section that feels aimless most likely…', options: ['has too many drums', 'lacks a dominant-function accent or never leaves home', 'is in the wrong tempo', 'needs more reverb'], answer: 1, why: 'Function diagnosis: without away-and-tension, home stops meaning anything.' },
      ],
    },
  },
  {
    slug: 'sevenths', sector: 3, title: 'Sevenths & Extensions: Tinting the Mix', tag: 'sig.14 // NUANCE',
    minutes: 8, xp: 70, free: false, focusKeys: ['C'], geometry: undefined,
    content: [
      "A triad is a flat color. Add the **seventh** — one more in-palette third on top — and the color gets depth: the maj7 is soft luxury (neo-soul, deep house pads), the dominant 7 is gritty pull (blues, funk bass stabs), the m7 is smoke (the default chord of lo-fi and R&B). Same base pigment, different **tint**.",
      "Keep stacking thirds and you get extensions — 9ths, 11ths, 13ths — each one a subtler glaze over the base color. The rule of taste: extensions add sophistication but blur the outline. A m9 pad sounds expensive; a m13 pad can sound like fog. In dense club mixes, triads and 7ths cut through; save tall extensions for sparse, atmospheric moments.",
      "Voicing is placement. The same chord can be stacked tight in one octave (**closed** — concentrated pigment) or spread wide (**open** — the same color diffused across the canvas). Producers voice chords the way designers kern type: invisibly, and it's everything. Try the same m7 closed in the left hand vs. spread across two octaves — same color, completely different weight.",
    ],
    task: {
      intro: 'TINT CHECK // depth without mud.',
      questions: [
        { q: 'A minor 7th chord is the signature color of…', options: ['power metal', 'lo-fi, R&B and smoky house', 'marching bands', 'none — it is unused'], answer: 1, why: 'The m7 is the default sophisticated shade of modern chill and club genres.' },
        { q: 'Extensions (9, 11, 13) generally…', options: ['make chords louder', 'add sophistication while blurring the outline', 'change the key', 'remove the root'], answer: 1, why: 'Each stacked third is another glaze — richer, softer-edged, easier to lose in a dense mix.' },
        { q: 'An open voicing is…', options: ['a chord with a wrong note', 'the same tones spread across a wide range', 'a chord played quietly', 'a chord without a fifth'], answer: 1, why: 'Same pigment, diffused across the canvas — different weight, identical color.' },
      ],
    },
  },
  {
    slug: 'borrowed-colors', sector: 3, title: 'Borrowed Colors', tag: 'sig.15 // INTERCHANGE',
    minutes: 8, xp: 70, free: false, focusKeys: ['C', 'E♭', 'A♭'], geometry: undefined,
    content: [
      "The seven diatonic chords are your palette — but nobody said you can't **borrow**. Modal interchange means grabbing a chord from the parallel key: writing in C major but pulling the ♭VI (A♭ major) or iv (F minor) from C *minor*. The borrowed chord lands like an accent color from outside the scheme: instantly noticeable, emotionally loaded, gone before it overstays.",
      "The classics: the **minor iv** in a major key (that bittersweet swell in countless bridges), the **♭VII** (the rock-and-house workhorse — hear it stomping in every 'I–♭VII–IV' anthem), the **♭VI–♭VII–I** run (the triumphant lift at the end of a build). Each borrowed chord darkens or brightens exactly one region of the palette while home stays fixed.",
      "Design principle, straight from color theory: an accent works *because it's rare*. One borrowed chord per section reads as intentional; four reads as a different key wearing a disguise. Borrow with a plan — mark the moment in your arrangement that deserves the outside color, and spend it there.",
    ],
    task: {
      intro: 'ACCENT CHECK // outside colors, deployed on purpose.',
      questions: [
        { q: 'Modal interchange borrows chords from…', options: ['a faster tempo', 'the parallel key', 'the relative key only', 'any random key'], answer: 1, why: 'Same tonic, opposite mode: C major borrows from C minor — same home, re-painted palette.' },
        { q: 'The ♭VII chord in a major key is…', options: ['diatonic', 'a beloved borrowed workhorse of rock and house', 'impossible to play', 'always avoided'], answer: 1, why: 'Borrowed from the parallel minor, it powers countless anthemic progressions.' },
        { q: 'Why should borrowed chords stay rare?', options: ['They are hard to play', 'An accent color works because of scarcity', 'They are out of tune', 'Copyright'], answer: 1, why: 'Scarcity is the accent’s power source — overuse and it stops being an accent.' },
      ],
    },
  },

  // ==================== SECTOR 04 — PROGRESSIONS ARE PALETTES ====================
  {
    slug: 'core-palettes', sector: 4, title: 'Core Palettes', tag: 'sig.16 // SCHEMES',
    minutes: 9, xp: 80, free: false, focusKeys: ['C', 'G', 'F'], geometry: undefined,
    content: [
      "A progression is a **color scheme in motion** — a repeating loop of functions. Four schemes cover an absurd share of modern music. **I–IV–V**: the primary triad scheme, blues to punk to festival house. **I–V–vi–IV**: the four-chord pop axis — bright, then a shadow, then lift. **vi–IV–I–V**: the same four chords rotated to start in shadow — the melancholic default of EDM and emotional house. **ii–V–I**: the jazz cadence, support→tension→home in its most elegant form.",
      "Rotation is a real technique: the same chord set starting from a different point is a different *mood* with identical materials — exactly like rotating a color scheme around the wheel. Before writing new chords, try rotating the loop you have. Many 'new sections' in professional tracks are rotations, not new palettes.",
      "Analyze before you create: take three tracks you DJ regularly, find each one's loop, and name it in Roman numerals. You'll discover most of your crate lives on two or three schemes — which tells you precisely what your audience's ears expect, and therefore precisely where a surprise will hit hardest.",
    ],
    task: {
      intro: 'SCHEME CHECK // name the loop.',
      questions: [
        { q: 'The famous four-chord pop progression is…', options: ['I–IV–V–IV', 'I–V–vi–IV', 'ii–V–I–vi', 'I–ii–iii–IV'], answer: 1, why: 'I–V–vi–IV: the axis progression behind an enormous share of modern hits.' },
        { q: 'vi–IV–I–V compared to I–V–vi–IV is…', options: ['a different key', 'the same chords rotated to start in shadow', 'unrelated', 'the relative minor scale'], answer: 1, why: 'Identical chord set, rotated starting point — same pigments, different emotional entry.' },
        { q: 'The ii–V–I is the signature cadence of…', options: ['jazz', 'drone metal', 'gregorian chant', 'dubstep only'], answer: 0, why: 'Support→tension→home in its most refined form — the grammatical period of jazz harmony.' },
      ],
    },
  },
  {
    slug: 'melody-over-harmony', sector: 4, title: 'Melody: The Brushstroke', tag: 'sig.17 // LINE',
    minutes: 9, xp: 80, free: false, focusKeys: ['C'], geometry: undefined,
    content: [
      "If chords are fields of color, melody is the **brushstroke across them**. The core skill is knowing, at every moment, whether your melody note is a **chord tone** (inside the color underneath — stable, consonant) or a **non-chord tone** (outside it — friction, motion). Strong melodies land chord tones on strong beats and use outside notes as passing motion between them: friction in transit, agreement on arrival.",
      "Great hooks are mostly *steps* with occasional *leaps*. Stepwise motion is a smooth stroke; a leap is a flick that catches the eye — and a leap followed by a step back in the opposite direction is the oldest satisfying gesture in melody. Contour is what people whistle: they remember the **shape** (rise, peak, fall) long after the exact notes blur.",
      "Repetition is not laziness; it's *form*. The strongest hook formula in club music is: state a short phrase, repeat it exactly, repeat it again with ONE change, then resolve. Same brushstroke three times, one deliberate variation. Your listener's brain gets the pattern-reward and the surprise-reward in a single bar of melody.",
    ],
    task: {
      intro: 'LINE CHECK // friction in transit, agreement on arrival.',
      questions: [
        { q: 'A chord tone in melody is…', options: ['any loud note', 'a note inside the chord currently underneath', 'the first note of the bar', 'a drum hit'], answer: 1, why: 'Inside the field of color = stable. Outside = motion. Knowing which is which is the core melodic skill.' },
        { q: 'Strong beats usually carry…', options: ['non-chord tones', 'chord tones', 'silence', 'random notes'], answer: 1, why: 'Agreement on arrival: land inside the color when the grid emphasizes the moment.' },
        { q: 'The classic hook formula is…', options: ['never repeat anything', 'repeat a phrase, then vary it once, then resolve', 'use all twelve notes', 'leap constantly'], answer: 1, why: 'Pattern-reward plus surprise-reward: repetition with one deliberate change.' },
      ],
    },
  },
  {
    slug: 'tension-complements', sector: 4, title: 'Tension: The Complementary Pair', tag: 'sig.18 // OPPOSITION',
    minutes: 8, xp: 80, free: false, focusKeys: ['C', 'F♯'], geometry: 'diameter',
    content: [
      "In color theory, complements — opposite hues — produce maximum vibration when adjacent. On our wheel, the complement of any key is the key a **tritone** away: the diameter, six steps, the far pole. C's complement is F♯. This is the axis of maximum harmonic tension, and controlling it is what separates producers who *build* energy from producers who just get louder.",
      "You've already met the tritone hiding inside every V7 chord — that's complementary tension in miniature, resolving inward every time a dominant lands on home. Scaled up, the tritone drives the **tritone substitution**: replace V7 with the dominant 7th a tritone away (in C: G7 → D♭7) and the resolution slides chromatically downhill instead of falling by fifth. Same tension, silkier release — the sound of sophisticated house and hip-hop chord flips.",
      "Use opposition architecturally. A breakdown that touches the complementary region — even one chord, even a single melodic F♯ over a C pedal — makes the return home feel like sunrise. Distance is the point: **the further you travel across the wheel, the more the arrival pays.** Just travel on purpose, and buy the return ticket before you leave.",
    ],
    task: {
      intro: 'OPPOSITION CHECK // maximum distance, maximum payoff.',
      questions: [
        { q: "The 'complementary key' of C on our wheel is…", options: ['G', 'A minor', 'F♯', 'F'], answer: 2, why: 'Six steps = the tritone = the diameter = the harmonic complement.' },
        { q: 'A tritone substitution replaces V7 with…', options: ['the IV chord', 'the dominant 7th a tritone away', 'silence', 'the relative minor'], answer: 1, why: 'G7 → D♭7 in C: identical tension core, chromatic sliding resolution.' },
        { q: 'Touching the far side of the wheel before a drop…', options: ['ruins the key', 'makes the return home land harder', 'changes the tempo', 'is impossible live'], answer: 1, why: 'Harmonic distance traveled = emotional payoff on arrival. Sunrise needs night.' },
      ],
    },
  },
  {
    slug: 'modulation', sector: 4, title: 'Modulation: Shifting the Palette', tag: 'sig.19 // TRAVEL',
    minutes: 9, xp: 80, free: false, focusKeys: ['C', 'G', 'A'], geometry: undefined,
    content: [
      "Modulation is repainting the room mid-song: moving the tonal center to a new key. The wheel makes the cost visible. **Neighbor moves** (one step: C→G) are nearly seamless — one note changes; the ear barely files a report. **Relative moves** (outer ring to inner ring) are free. **Far moves** (three-plus steps) are dramatic and need either a bridge or the confidence to just *cut*.",
      "The classic bridge is the **pivot chord** — a chord both keys share, entered as one function and exited as another. Am is vi in C and ii in G; hold it, flip its meaning, and you've walked through a door that exists in both rooms. Symmetrical chords from Sector 03 (diminished, augmented — the square and the triangle) are master keys: rootless shapes that open onto several keys at once.",
      "Modern club alternatives: the **direct cut** at a section boundary (energy jump, no apology — the pop 'truck driver' lift up a semitone or whole step is this), and the **DJ modulation**: since you already mix between tracks in neighboring keys, a well-planned transition *is* a modulation performed live. Producers plan key journeys inside a track; DJs plan them across a night. Same wheel, different timescale.",
    ],
    task: {
      intro: 'TRAVEL CHECK // move the center on purpose.',
      questions: [
        { q: 'The smoothest modulations move…', options: ['across the wheel', 'to a neighboring key', 'down an octave', 'to a random key'], answer: 1, why: 'One wheel step = one changed note = minimal friction.' },
        { q: 'A pivot chord works because…', options: ['it is loud', 'it exists in both keys with different functions', 'it contains all twelve notes', 'it has no third'], answer: 1, why: 'A shared chord is a door standing in two rooms — enter as vi, exit as ii.' },
        { q: 'Why are diminished and augmented chords useful for key changes?', options: ['They are the loudest chords', 'Their symmetry makes them rootless — they open onto several keys', 'They only exist in C', 'They are easy to play'], answer: 1, why: 'Perfect geometric symmetry = no fixed home = a master-key trapdoor between keys.' },
      ],
    },
  },

  // ==================== SECTOR 05 — PRODUCTION IN COLOR ====================
  {
    slug: 'writing-in-key', sector: 5, title: 'Writing in Key', tag: 'sig.20 // SESSION',
    minutes: 10, xp: 90, free: false, focusKeys: ['A'], geometry: undefined,
    content: [
      "Open your DAW. Pick a hue — say A minor — and commit the session to it: set the DAW's scale highlighting, name the project with the key, and build everything inside that palette. **Bassline first** in club music: roots and fifths of your progression on the grid from Sector 01, chord tones on the strong beats. The bass is the underpainting; every layer above must agree with it or the whole canvas muddies.",
      "Layer with intention: pads carry the chord color (your m7s and m9s from Sector 03), the hook rides on top using the melody rules from Sector 04, and every synth line — arps, stabs, counter-melodies — draws from the same seven-note palette. When something sounds 'off,' don't reach for effects: solo it against the bass and find the non-palette note. Ninety percent of 'my track sounds amateur' is one uncommitted pixel.",
      "**Task — your first canvas:** produce an 8-bar loop in any minor key: bassline (roots/fifths), one chord layer (7th chords), one melodic hook (repeat, repeat-varied, resolve). Keep every note in-palette except ONE deliberate outside note placed where you want the ear to snag. Bounce it. This loop is the seed of everything in the next lessons.",
    ],
    task: {
      intro: 'SESSION CHECK // commit to the hue.',
      questions: [
        { q: 'In club production, which layer is the underpainting?', options: ['The hi-hats', 'The bassline', 'The vocal', 'The FX'], answer: 1, why: 'Everything above must agree with the bass — it defines the harmonic ground.' },
        { q: "When a layer sounds 'off,' first…", options: ['add reverb', 'solo it against the bass and hunt the out-of-palette note', 'turn it down', 'change the tempo'], answer: 1, why: 'Most amateur-sounding moments are a single uncommitted note, not a mixing problem.' },
        { q: 'The one deliberate outside note in your loop exists to…', options: ['fix a mistake', 'snag the ear on purpose', 'change the key permanently', 'test your speakers'], answer: 1, why: 'A controlled accent — the production-scale version of the borrowed color.' },
      ],
    },
  },
  {
    slug: 'sample-keying', sector: 5, title: 'Keying Samples', tag: 'sig.21 // CRATE',
    minutes: 9, xp: 90, free: false, focusKeys: ['E♭', 'B♭', 'A♭'], geometry: undefined,
    content: [
      "Every sample arrives wearing a hue. Before it enters your session, **identify its key** — by ear against a keyboard (find the note that feels like home, then test major vs. minor third), or with detection tools, which you should treat as a first opinion, not gospel: verify by ear, because detectors routinely confuse relative majors and minors (same palette, remember — same pixels, different center).",
      "Then place it on the wheel relative to your session key. **Same key**: drop it in. **Neighbor or relative**: light repitch (±1–2 semitones) or use it as a pre-chorus color shift. **Far across the wheel**: either repitch it home — small shifts age better than large; beyond ±3 semitones, timbre visibly smears — or *keep* the clash deliberately for one bar as a complementary accent. The crime is not the clash; it's the accidental clash.",
      "Layering rule from the color wheel: stack samples whose keys are **analogous** (within one step) and they'll fuse like glazes; stack keys three-plus steps apart and you get vibrating mud no EQ can fix — because the problem is harmonic, not spectral. When a layered drop feels 'dirty' in a bad way, check the wheel before you check the mixer.",
    ],
    task: {
      intro: 'CRATE CHECK // no accidental clashes.',
      questions: [
        { q: 'Key detection software should be treated as…', options: ['always correct', 'a first opinion to verify by ear', 'useless', 'only for techno'], answer: 1, why: 'Detectors frequently swap relative major/minor — same notes, different home. Your ear casts the deciding vote.' },
        { q: 'Large repitches (beyond ±3 semitones) tend to…', options: ['improve the sample', 'audibly smear the timbre', 'change the tempo', 'have no effect'], answer: 1, why: 'Pitch-shifting artifacts grow with distance — small moves age better.' },
        { q: 'Two layered samples in keys 4 steps apart will…', options: ['fuse like glazes', 'produce harmonic mud EQ cannot fix', 'auto-correct each other', 'sound louder'], answer: 1, why: 'The clash is harmonic, not spectral — the fix is the wheel, not the mixer.' },
      ],
    },
  },
  {
    slug: 'harmonic-mixing', sector: 5, title: 'Harmonic Mixing: The DJ Wheel', tag: 'sig.22 // THE BOOTH',
    minutes: 10, xp: 90, free: false, focusKeys: ['A', 'E', 'D'], geometry: 'dodecagram',
    content: [
      "Here's the secret hiding in plain sight: the **Camelot wheel** — the harmonic mixing system serious DJs live by — *is the circle of fifths with numbers on it*. 8A/8B, 9A/9B… the numbers walk around our wheel; A is the inner ring (minor), B is the outer (major). You've spent five sectors learning the full theory behind the tool. Now the tool is transparent: it's this course's wheel wearing club clothing.",
      "The classic moves, now with reasons: **±1 hour** (one wheel step) mixes smoothly because the keys differ by one note — analogous colors. **Inner↔outer at the same hour** is the relative major/minor switch — same palette, mood flip, zero friction. **+2 hours** is the 'energy boost': two steps clockwise brightens the harmonic center twice, felt as lift. **+7 hours / the diagonal**: you now know that's tritone territory — near-maximum clash, playable only as a deliberate statement across a clean break, never in a blended mix.",
      "But you've surpassed the numbers. You know *why* the ♭VII stomps, why the relative switch is free, what a symmetric chord in the outgoing track lets you get away with, and how a whole night can be plotted as a **journey around the wheel** — warm hues early, a travel across cool territory at peak, home for the sunrise. That's not track-matching. That's composing at the timescale of a room.",
    ],
    task: {
      intro: 'BOOTH CHECK // the tool made transparent.',
      questions: [
        { q: 'The Camelot wheel is…', options: ['unrelated to music theory', 'the circle of fifths renumbered for the booth', 'a tempo chart', 'a lighting rig'], answer: 1, why: 'Numbered hours = wheel positions; A/B rings = relative minor/major. Same map.' },
        { q: 'Mixing +1 on the wheel is smooth because…', options: ['tempos match', 'the two keys differ by exactly one note', 'both tracks are minor', 'the crowd cannot hear keys'], answer: 1, why: 'One wheel step = one changed note = analogous colors blending.' },
        { q: "The '+2 energy boost' works by…", options: ['raising the volume', 'stepping the harmonic center clockwise twice — brighter, felt as lift', 'doubling the BPM', 'adding sharps to the melody live'], answer: 1, why: 'Two fifths clockwise = brightening the hue of the room, experienced as an energy raise.' },
      ],
    },
  },
  {
    slug: 'form-arrangement', sector: 5, title: 'Form & the Golden Section', tag: 'sig.23 // ARCHITECTURE',
    minutes: 10, xp: 90, free: false, focusKeys: [], geometry: 'phi',
    content: [
      "Zoom out from the loop: **arrangement** is composition at the scale of the whole canvas. Club structures are built from 8- and 16-bar blocks — intro, build, drop, break, build, drop, outro — because DJs need predictable seams to mix across. Within that grid, energy is the real subject: every block either adds color (layers in) or removes it (layers out). Sketch your track as a brightness curve before you arrange a single region.",
      "Now the geometry: the **golden ratio**, φ ≈ 0.618 — the proportion the ancients built into temples and that keeps surfacing in seed spirals and shell curves. Composers from Debussy to Tool have (deliberately or not) placed climaxes near the golden section of a piece, and analysts keep finding main drops and final choruses landing around 60–66% of a track's runtime rather than dead center. Treat φ as a *design heuristic*, not a law of nature: a climax placed just past the middle feels earned rather than symmetrical — arrival with room to descend.",
      "**Task — the golden build:** take your 8-bar loop from lesson 19 and arrange a full track skeleton: place your biggest moment at roughly 62% of the runtime, plot the brightness curve rising into it, and make the final section a controlled fade of palette back to a single hue. Structure is the largest brushstroke you own.",
    ],
    task: {
      intro: 'ARCHITECTURE CHECK // energy is the subject.',
      questions: [
        { q: 'Club tracks build in 8/16-bar blocks because…', options: ['computers require it', 'DJs need predictable seams to mix across', 'it is a legal standard', 'shorter blocks are impossible'], answer: 1, why: 'The grid at architectural scale: predictable structure is a courtesy to the booth.' },
        { q: 'The golden section suggests placing the climax around…', options: ['the exact middle', 'the first bar', 'roughly 62% of the runtime', 'the final second'], answer: 2, why: 'Just past center: arrival that feels earned, with room left to descend. A heuristic, not a law.' },
        { q: 'Before arranging regions, you should sketch…', options: ['the artwork', 'the brightness/energy curve of the whole track', 'the tracklist', 'the mastering chain'], answer: 1, why: 'Arrangement is energy design; the curve is the plan, the regions are execution.' },
      ],
    },
  },

  // ==================== SECTOR 06 — MIXING THE SPECTRUM ====================
  {
    slug: 'frequency-temperature', sector: 6, title: 'The Temperature of Frequency', tag: 'sig.24 // SPECTRUM',
    minutes: 9, xp: 100, free: false, focusKeys: [], geometry: undefined,
    content: [
      "The color mapping has one more octave to climb: the **frequency spectrum of a mix** behaves like temperature in an image. Sub and bass (20–250Hz) are the warm, heavy reds and ambers — physical, felt in the chest. Mids (250Hz–4kHz) are the greens and yellows where almost everything lives — vocals, synth bodies, snare crack. Highs (4k–20kHz) are the cool blues and violets: air, shimmer, distance. A mix is **white light**: all temperatures present, none shouting.",
      "Your ears are not flat. Human hearing is most sensitive in the upper mids (~2–5kHz — evolution tuned us to voices and alarms) and needs far more energy to perceive deep lows at quiet volumes. Practical consequences: harshness lives at 2–5kHz because that's where ears magnify; bass that bangs loud disappears quiet; and mixes judged only at high volume lie to you. Check your temperature balance at whisper level — that's where the truth is.",
      "Diagnosis vocabulary, in color: a **muddy** mix is too warm (energy pooled at 200–500Hz); a **harsh** mix is over-lit (2–5kHz glare); a **thin** mix is all cool light and no warmth; a **dull** mix has no blue at all. Learn to hear a mix as a temperature image and problems localize themselves before you touch a knob.",
    ],
    task: {
      intro: 'SPECTRUM CHECK // hear temperature.',
      questions: [
        { q: 'In the temperature mapping, sub-bass corresponds to…', options: ['cool blues', 'warm deep reds — physical heat', 'green mids', 'white light'], answer: 1, why: 'Low frequencies are the warm, felt-in-the-chest end of the mix image.' },
        { q: 'Human hearing is most sensitive around…', options: ['20–50Hz', '2–5kHz', '15–20kHz', 'all frequencies equally'], answer: 1, why: 'The upper-mid presence region — which is exactly why harshness lives there.' },
        { q: "A 'muddy' mix in temperature terms is…", options: ['over-lit with highs', 'too warm — energy pooled in the low-mids', 'perfectly balanced', 'too quiet'], answer: 1, why: '200–500Hz pooling = warmth turned to murk. Name the temperature, find the fix.' },
      ],
    },
  },
  {
    slug: 'eq-color-balance', sector: 6, title: 'EQ Is Color Balance', tag: 'sig.25 // CARVING',
    minutes: 10, xp: 100, free: false, focusKeys: [], geometry: undefined,
    content: [
      "EQ is not an effect; it's **color correction**. Every element in your mix occupies a region of the spectrum-image, and two elements occupying the same region don't add — they *mask*, smearing into brown the way over-mixed paint does. The masking pairs every engineer fights: kick vs. bass (both warm reds), vocal vs. synth pads (both midfield greens), hats vs. cymbal wash (competing blues).",
      "The professional move is **complementary carving**: where two elements overlap, cut one where you boost the other. Duck 2–3dB from the bass at the kick's thump (say 60–80Hz) and boost the kick a touch there; carve a vocal-shaped notch in the pads around 1–3kHz. Small reciprocal moves — 2dB, wide — beat dramatic surgery. You're not making anything 'better'; you're assigning each element its own region of the canvas.",
      "Two disciplines to make permanent: **cut before boost** (removing murk beats adding glare — subtractive color stays clean), and **high-pass ruthlessly**: everything that isn't kick or bass almost certainly carries useless sub-warmth; roll it off and watch the low end turn from brown sludge to deep transparent red. A great mix isn't bright or bassy. It's *separated* — every color visible at once.",
    ],
    task: {
      intro: 'BALANCE CHECK // separation over decoration.',
      questions: [
        { q: 'Frequency masking happens when…', options: ['a track is too quiet', 'two elements occupy the same spectral region and smear', 'the tempo drifts', 'you use too many colors'], answer: 1, why: 'Same region = mud, like over-mixed pigment. Separation is the cure.' },
        { q: 'Complementary carving means…', options: ['boosting everything', 'cutting one element where you boost its rival', 'deleting one element', 'copying EQ settings'], answer: 1, why: 'Reciprocal small moves assign each element its own region of the canvas.' },
        { q: "The 'cut before boost' discipline works because…", options: ['boosts are illegal', 'removing murk stays cleaner than adding glare', 'cutting is louder', 'plugins prefer it'], answer: 1, why: 'Subtractive correction preserves headroom and clarity; additive glare compounds.' },
      ],
    },
  },
  {
    slug: 'effects-atmosphere', sector: 6, title: 'Effects Are Atmosphere', tag: 'sig.26 // DEPTH OF FIELD',
    minutes: 10, xp: 100, free: false, focusKeys: [], geometry: undefined,
    content: [
      "If EQ is color balance, effects are the **photographic qualities** of the image. **Compression is contrast**: it shrinks the gap between loud and quiet, pushing everything toward the midtones — punchy and present at best, flat and lifeless when crushed. Use it like a photographer uses contrast: enough to make the subject pop, never so much that the shadows die.",
      "**Reverb is depth of field.** Dry signals sit at the lens; wet signals recede. This is how a two-dimensional stereo file fakes a third dimension: lead vocal dry and close, pads washed and distant, drums in a tight room between. The classic amateur tell is everything equally wet — an image with infinite focus, which reads as no focus. Choose what's close. **Delay** is the patterned echo — rhythm-locked repetition, geometry in time rather than space.",
      "**Saturation is, literally, saturation**: harmonic distortion adds overtones that read as richness and warmth, intensifying the existing color of a sound the way boosting saturation intensifies a photo. A touch on the bass makes warmth audible on small speakers; a touch on the master glues the palette. And like photo saturation, past a threshold it tips from vivid into cartoon. Atmosphere is a budget — spend it where the story is.",
    ],
    task: {
      intro: 'ATMOSPHERE CHECK // spend depth on purpose.',
      questions: [
        { q: 'In the image mapping, compression corresponds to…', options: ['hue', 'contrast', 'resolution', 'frame rate'], answer: 1, why: 'It narrows the loud/quiet gap — the dynamic contrast of the sonic image.' },
        { q: 'Reverb creates…', options: ['pitch', 'depth of field — close vs. distant placement', 'tempo', 'stereo width only'], answer: 1, why: 'Dry = at the lens; wet = receded. Depth is faked with wetness, and focus means choosing.' },
        { q: 'Everything drenched in equal reverb reads as…', options: ['professional polish', 'no focus at all', 'more expensive', 'mono'], answer: 1, why: 'Infinite focus is no focus — the classic amateur atmosphere tell.' },
      ],
    },
  },
  {
    slug: 'cymatics-and-space', sector: 6, title: 'Cymatics & the Stereo Canvas', tag: 'sig.27 // FINAL FORM',
    minutes: 10, xp: 100, free: false, focusKeys: [], geometry: 'chladni',
    content: [
      "One last piece of sacred geometry — the one you can watch. **Cymatics**: scatter sand on a metal plate, bow its edge, and the sand leaps into symmetric geometric patterns — Chladni figures — that reorganize as the pitch changes. Higher tones, more intricate mandalas. It's the course's thesis made physical: sound doesn't *resemble* geometry; vibration literally **arranges matter into form**. The wheel you've studied is one more Chladni plate, drawn in keys.",
      "Now finish the canvas: the **stereo field** is its width. Low frequencies live center (club systems sum bass to mono; wide subs collapse into phase problems on the floor); leads and vocals anchor the middle; pads, hats, and FX spread toward the edges. Picture the mix as a triangle — wide and cool at the top, narrowing to a single warm point of bass at the bottom. That triangle *is* the geometry of a professional club mix.",
      "You've completed the wheel. You can read a key signature as a coordinate, a chord as a shape, a progression as a palette, a DJ set as a journey, a mix as balanced light. The mapping was never decoration — it was a second nervous system for hearing. **Final task:** finish the track you seeded in Sector 05, mix it with the spectrum disciplines from this sector, and play it loud. Then come back to the wheel and see if it looks different. It will.",
    ],
    task: {
      intro: 'FINAL CHECK // full spectrum.',
      questions: [
        { q: 'Chladni figures demonstrate that…', options: ['sand is musical', 'vibration physically organizes matter into geometric patterns', 'plates are instruments', 'geometry is only a metaphor'], answer: 1, why: 'Cymatics is the visible proof-of-concept: frequency creates form.' },
        { q: 'Bass frequencies belong in the center of the stereo field because…', options: ['tradition', 'club systems sum lows to mono and wide bass causes phase collapse', 'they sound cooler there', 'stereo does not exist below 1kHz'], answer: 1, why: 'The floor hears mono bass; keep the warm point of the triangle center-bottom.' },
        { q: 'The professional stereo image resembles…', options: ['a square', 'a triangle — wide highs narrowing to centered bass', 'a straight line', 'a circle'], answer: 1, why: 'Wide cool top, single warm anchor at the bottom: the geometry of a club-ready mix.' },
      ],
    },
  },
];

export const lessonBySlug = (slug: string) => LESSONS.find((l) => l.slug === slug);
export const lessonsInSector = (n: number) => LESSONS.filter((l) => l.sector === n).sort((a, b) => LESSONS.indexOf(a) - LESSONS.indexOf(b));
export const nextLesson = (slug: string) => {
  const i = LESSONS.findIndex((l) => l.slug === slug);
  return i >= 0 && i < LESSONS.length - 1 ? LESSONS[i + 1] : null;
};
export const TOTAL_XP = LESSONS.reduce((s, l) => s + l.xp, 0);
