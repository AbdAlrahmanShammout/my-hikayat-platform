export const DEMO_CATALOG = {
  readerEmail: 'abdshammout.97@gmail.com',
  publisherName: 'Hikayat Press',
  aboutMission:
    'My Hikayat is a reading home for children from about age six, and for the families who read with them. We publish warm stories of cities, kitchens, seas, and night skies — in a catalog that stays honest about what a reader can open.',
  authors: [
    {
      email: 'author@example.com',
      displayName: 'Lina Al-Masri',
      role: 'author' as const,
    },
    {
      email: 'nour.haddad@example.com',
      displayName: 'Nour Haddad',
      role: 'author' as const,
    },
    {
      email: 'yusuf.rahman@example.com',
      displayName: 'Yusuf Rahman',
      role: 'author' as const,
    },
    {
      email: 'amina.elkhatib@example.com',
      displayName: 'Amina El-Khatib',
      role: 'author' as const,
    },
    {
      email: 'sara.nour@example.com',
      displayName: 'Sara Nour',
      role: 'author' as const,
    },
  ],
  books: [
    {
      slug: 'the-olive-lantern',
      title: 'The Olive Lantern',
      authorEmail: 'author@example.com',
      authorName: 'Lina Al-Masri',
      categorySlugs: ['picture-books', 'children-s'],
      bookType: 'picture_book' as const,
      layoutType: 'fixed_layout' as const,
      publishedAt: '2026-03-12T10:00:00.000Z',
      cover: { r: 196, g: 92, b: 38 },
      description:
        'On the last evening of harvest, a small lantern made from an olive tin lights the path between the grove and home. A quiet picture book about patience, grandparents, and the first dark of autumn.',
      chapters: [
        {
          title: 'The tin that learned to glow',
          contentText:
            'Mira found the empty olive tin under the press. It still smelled of salt and leaves. Her grandfather punched a crescent of holes in the lid, set a candle inside, and said the grove would remember the way home if they asked kindly.',
        },
      ],
    },
    {
      slug: 'amina-and-the-night-market',
      title: 'Amina and the Night Market',
      authorEmail: 'nour.haddad@example.com',
      authorName: 'Nour Haddad',
      categorySlugs: ['children-s', 'fiction'],
      bookType: 'standard_chapter' as const,
      layoutType: 'reflowable' as const,
      publishedAt: '2026-04-02T10:00:00.000Z',
      cover: { r: 46, g: 88, b: 110 },
      description:
        'Amina is allowed to stay out until the spice stalls close — if she can keep her little brother from bargaining for a drum he cannot carry. A city story full of cardamom, alley cats, and one honest mistake.',
      chapters: [
        {
          title: 'Before the lamps',
          contentText:
            'The market did not begin when the sun left. It began when Amina’s mother counted three coins into her palm and said, “Hold your brother’s sleeve.” The stones were still warm. Someone was already roasting corn.',
        },
        {
          title: 'The drum that walked',
          contentText:
            'Yasin did not buy the drum. He followed it. The seller had tied it to a cart, and every bump made a proud little thump. Amina bargained for roasted chickpeas instead, then looked down and found an empty sleeve.',
        },
        {
          title: 'The lane of copper',
          contentText:
            'She found him sitting under a hanging tray of pots, tapping a lid with one finger, trying to make the same sound. He was not lost. He was composing. Amina sat beside him until the chickpeas were gone, then they walked home with both sleeves occupied.',
        },
      ],
    },
    {
      slug: 'the-date-palm-that-would-not-sleep',
      title: 'The Date Palm That Would Not Sleep',
      authorEmail: 'yusuf.rahman@example.com',
      authorName: 'Yusuf Rahman',
      categorySlugs: ['picture-books'],
      bookType: 'picture_book' as const,
      layoutType: 'fixed_layout' as const,
      publishedAt: '2026-04-18T10:00:00.000Z',
      cover: { r: 120, g: 140, b: 64 },
      description:
        'A courtyard palm stays awake to count the stars, until a child teaches it the usefulness of rest. Gentle, funny, and built for reading aloud on a slow night.',
      chapters: [
        {
          title: 'Leaves against the moon',
          contentText:
            'The palm insisted it had work. “If I sleep,” it whispered, “the stars will lose their places.” Layla brought a blanket for the roots and counted with it until the numbers grew soft. In the morning the stars were exactly where they had been.',
        },
      ],
    },
    {
      slug: 'letters-from-the-old-souq',
      title: 'Letters from the Old Souq',
      authorEmail: 'sara.nour@example.com',
      authorName: 'Sara Nour',
      categorySlugs: ['fiction', 'children-s'],
      bookType: 'standard_chapter' as const,
      layoutType: 'reflowable' as const,
      publishedAt: '2026-05-09T10:00:00.000Z',
      cover: { r: 168, g: 108, b: 52 },
      description:
        'When a shuttered perfume shop starts receiving letters addressed to a woman who left in 1968, two cousins decide to answer them — carefully, and only in the truth they can prove.',
      chapters: [
        {
          title: 'The box behind the scale',
          contentText:
            'The first envelope was the color of weak tea. Hadi found it while helping his uncle weigh sandalwood. The name on the front was written in a hand that lifted every letter, as if the writer were afraid of pressing too hard on the paper.',
        },
        {
          title: 'What we may say',
          contentText:
            'Leila made a rule: no inventions. If they did not know whether the garden still had jasmine, they would write, “We have not seen the garden.” The third letter arrived with a pressed petal that stained the page the color of evening.',
        },
        {
          title: 'A door left unlatched',
          contentText:
            'On Friday a woman in a grey coat asked for the shop by its old name. She did not want perfume. She wanted to know whether anyone had kept the letters. Hadi put the box on the counter and did not explain. Some stories prefer to introduce themselves.',
        },
      ],
    },
    {
      slug: 'how-rain-finds-the-wadi',
      title: 'How Rain Finds the Wadi',
      authorEmail: 'amina.elkhatib@example.com',
      authorName: 'Amina El-Khatib',
      categorySlugs: ['nonfiction', 'children-s'],
      bookType: 'standard_chapter' as const,
      layoutType: 'reflowable' as const,
      publishedAt: '2026-05-21T10:00:00.000Z',
      cover: { r: 72, g: 128, b: 148 },
      description:
        'A clear, kind explanation of clouds, dry riverbeds, and why a desert can bloom after one loud night of water. Written for curious readers who ask “but where does it go?”',
      chapters: [
        {
          title: 'A river that waits',
          contentText:
            'A wadi is a river that practices patience. Most days it is stone and dust and the memory of water. The banks remember anyway. You can see the memory in the way the gravel lies, all in one direction, like a crowd that once ran.',
        },
        {
          title: 'The cloud’s errand',
          contentText:
            'Warm air lifts invisible water from the sea. High up, the air grows thin and cold, and the water gathers into drops you can see. When the drops grow heavy they fall. Gravity does not need a map. The land is the map.',
        },
        {
          title: 'After the thunder',
          contentText:
            'By morning the wadi may already be quiet again. Seeds that waited under the crust take that as permission. This is not magic. It is a schedule written in soil, and it has been kept longer than any of our calendars.',
        },
      ],
    },
    {
      slug: 'the-star-map-of-jaffa',
      title: 'The Star Map of Jaffa',
      authorEmail: 'author@example.com',
      authorName: 'Lina Al-Masri',
      categorySlugs: ['fiction', 'children-s'],
      bookType: 'illustrated_chapter' as const,
      layoutType: 'reflowable' as const,
      publishedAt: '2026-06-04T10:00:00.000Z',
      cover: { r: 78, g: 98, b: 142 },
      description:
        'Rami inherits a port notebook whose constellations do not match any sky he knows — until he reads it from the orange groves instead of the harbor. A story about looking twice.',
      chapters: [
        {
          title: 'Ink the color of tide',
          contentText:
            'The notebook smelled of rope. Each page held a wheel of stars and a date. Rami took it to the roof and held it up. Nothing agreed. His aunt said, “Your grandfather did not always stand where you are standing.”',
        },
        {
          title: 'The grove’s ceiling',
          contentText:
            'Between the trees the sky came in pieces. That was the trick. The map was not a harbor chart. It was a way of walking without leaving the scent of blossom. When Rami aligned the torn circles, the path to the old well appeared as if it had been waiting for manners.',
        },
      ],
    },
    {
      slug: 'yasmins-first-eid-train',
      title: "Yasmin's First Eid Train",
      authorEmail: 'nour.haddad@example.com',
      authorName: 'Nour Haddad',
      categorySlugs: ['children-s', 'picture-books'],
      bookType: 'picture_book' as const,
      layoutType: 'fixed_layout' as const,
      publishedAt: '2026-06-16T10:00:00.000Z',
      cover: { r: 180, g: 72, b: 88 },
      description:
        'Yasmin rides the morning train in a new dress, carrying baklava that must not be sat on. A celebration story about neighbors, stations, and arriving a little crumbly anyway.',
      chapters: [
        {
          title: 'Platform four',
          contentText:
            'The box was tied with too much ribbon. Yasmin sat very straight. A boy across the aisle practiced saying Eid Mubarak to his reflection in the window. When the train lurched, the baklava learned a new shape, and nobody at the other end complained.',
        },
      ],
    },
    {
      slug: 'the-secret-library-of-acre',
      title: 'The Secret Library of Acre',
      authorEmail: 'sara.nour@example.com',
      authorName: 'Sara Nour',
      categorySlugs: ['young-adult', 'fiction'],
      bookType: 'standard_chapter' as const,
      layoutType: 'reflowable' as const,
      publishedAt: '2026-07-01T10:00:00.000Z',
      cover: { r: 92, g: 64, b: 96 },
      description:
        'A summer job in the old city becomes a hunt for a catalog that was never supposed to be digitized. For readers who like locked rooms, sea wind, and the ethics of what we keep.',
      chapters: [
        {
          title: 'Dust is a kind of ink',
          contentText:
            'The library hired Tala to scan visitor tickets, not mysteries. On the third day a drawer that should have held receipt books held a card catalog written in two hands, one of them in a hurry. The hurried hand had starred certain titles and left the rest unnamed.',
        },
        {
          title: 'Borrowers of the night',
          contentText:
            'The starred books were not missing. They were mis-shelved into architecture: behind a panel, under a stair, inside a window seat that faced the sea. Each one had a note: Read here. Do not take the salt air with you.',
        },
        {
          title: 'What the catalog owed',
          contentText:
            'Tala did not post the list. She repaired the drawer, labeled it Closed collection, and told the director the truth in a sentence short enough to survive a meeting. Some knowledge is a door. Some knowledge is a latch.',
        },
      ],
    },
    {
      slug: 'counting-camels-to-the-sea',
      title: 'Counting Camels to the Sea',
      authorEmail: 'yusuf.rahman@example.com',
      authorName: 'Yusuf Rahman',
      categorySlugs: ['picture-books', 'children-s'],
      bookType: 'picture_book' as const,
      layoutType: 'fixed_layout' as const,
      publishedAt: '2026-07-14T10:00:00.000Z',
      cover: { r: 212, g: 164, b: 88 },
      description:
        'One, two, three camels — and a child who keeps losing count because the coastline keeps offering better distractions. A counting book that refuses to be only arithmetic.',
      chapters: [
        {
          title: 'Four is a harbor',
          contentText:
            'Sami counted camels until a gull stole the number seven and would not give it back. His sister started over from the color of the water instead. By the time they reached the boats, they had invented a new kind of ten.',
        },
      ],
    },
    {
      slug: 'grandmothers-fig-cake',
      title: "Grandmother's Fig Cake",
      authorEmail: 'amina.elkhatib@example.com',
      authorName: 'Amina El-Khatib',
      categorySlugs: ['children-s', 'fiction'],
      bookType: 'standard_chapter' as const,
      layoutType: 'reflowable' as const,
      publishedAt: '2026-08-03T10:00:00.000Z',
      cover: { r: 140, g: 84, b: 64 },
      description:
        'The recipe is short. The argument about whether to grind the almonds is not. A kitchen story about measuring, memory, and the cousin who always licks the spoon too early.',
      chapters: [
        {
          title: 'The bowl that knows',
          contentText:
            'Teta did not use cups. She used the dent in the wooden bowl and the look of the batter when it remembered summer. Hana wrote numbers anyway, then crossed them out, then wrote “until it looks like Teta’s face when the cake is right.”',
        },
        {
          title: 'Almonds, decided',
          contentText:
            'They ground half and left half in pieces, which was a peace treaty. The kitchen filled with a smell that made the downstairs neighbor knock, not to complain, but to ask whether there would be edges. There are always edges.',
        },
      ],
    },
    {
      slug: 'the-compass-bird',
      title: 'The Compass Bird',
      authorEmail: 'author@example.com',
      authorName: 'Lina Al-Masri',
      categorySlugs: ['fiction', 'children-s'],
      bookType: 'standard_chapter' as const,
      layoutType: 'reflowable' as const,
      publishedAt: '2026-08-19T10:00:00.000Z',
      cover: { r: 48, g: 112, b: 96 },
      description:
        'A migrating hoopoe spends one night on a school roof and rearranges a boy’s idea of north. For readers who like maps, birds, and slightly stubborn science teachers.',
      chapters: [
        {
          title: 'A visitor with stripes',
          contentText:
            'Karim found the hoopoe at dawn, crest raised like a question. It did not want bread. It wanted the quiet side of the water tank. He sketched the beak in his homework margin and was marked down for “off-topic excellence.”',
        },
        {
          title: 'North is a habit',
          contentText:
            'Ms. Farah took the class to the roof with a compass that disagreed with the bird. “Both can be right,” she said, “if you admit what you are measuring.” Karim wrote that sentence twice: once for science, once for the walk home.',
        },
      ],
    },
    {
      slug: 'whispers-of-the-red-sea',
      title: 'Whispers of the Red Sea',
      authorEmail: 'sara.nour@example.com',
      authorName: 'Sara Nour',
      categorySlugs: ['young-adult', 'fiction'],
      bookType: 'standard_chapter' as const,
      layoutType: 'reflowable' as const,
      publishedAt: '2026-09-01T10:00:00.000Z',
      cover: { r: 176, g: 72, b: 64 },
      description:
        'Two sisters split a summer between a coral survey and a family rumor that will not stay on land. Sharp, sunlit, and unwilling to treat the sea as scenery.',
      chapters: [
        {
          title: 'Salt on the clipboard',
          contentText:
            'Dalia recorded anemones. Noor recorded who came to the pier after dark. Their uncle said the sea kept no secrets. The tide tables suggested otherwise. On the third evening the sisters swapped notebooks without announcing a treaty.',
        },
        {
          title: 'A rumor with gills',
          contentText:
            'The story was that a boat had gone out with more names than life jackets. Names are heavier. Dalia found a fragment of painted wood that matched no registered hull. She photographed it beside her ruler and felt, for the first time, that science could be a kind of witness.',
        },
        {
          title: 'What we bring back',
          contentText:
            'They told their mother only the part that could be measured. They told each other the rest on the walk where the road becomes gravel. The Red Sea kept moving, which is not the same as forgetting.',
        },
      ],
    },
  ],
  collections: [
    {
      title: 'Bedtime Hikayat',
      description: 'Quiet lanterns, palms, and kitchen stories for the last half hour of the day.',
      accentColor: '#C45C26',
      bookSlugs: [
        'the-olive-lantern',
        'the-date-palm-that-would-not-sleep',
        'grandmothers-fig-cake',
        'yasmins-first-eid-train',
      ],
    },
    {
      title: 'First Readers',
      description: 'Short chapters and counting pages for children who have just started reading alone.',
      accentColor: '#D4A458',
      bookSlugs: [
        'counting-camels-to-the-sea',
        'amina-and-the-night-market',
        'the-compass-bird',
        'how-rain-finds-the-wadi',
      ],
    },
    {
      title: 'Stories of Home',
      description: 'Markets, groves, ports, and the people who keep the keys.',
      accentColor: '#2E586E',
      bookSlugs: [
        'letters-from-the-old-souq',
        'the-star-map-of-jaffa',
        'the-secret-library-of-acre',
        'grandmothers-fig-cake',
      ],
    },
    {
      title: 'Young Explorers',
      description: 'Longer fiction for readers who want locked rooms, coral, and maps that argue back.',
      accentColor: '#5C4060',
      bookSlugs: [
        'the-secret-library-of-acre',
        'whispers-of-the-red-sea',
        'the-star-map-of-jaffa',
        'letters-from-the-old-souq',
      ],
    },
  ],
  continueReading: [
    { slug: 'letters-from-the-old-souq', spineIndex: 1, scrollOffset: 240 },
    { slug: 'the-olive-lantern', spreadIndex: 2, pageNumber: 3 },
    { slug: 'how-rain-finds-the-wadi', spineIndex: 0, scrollOffset: 80 },
  ],
} as const;
