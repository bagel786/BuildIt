// Community service — uses Supabase when configured, localStorage otherwise
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const USE_SUPABASE = !!(SUPABASE_URL && SUPABASE_KEY);
const supabase = USE_SUPABASE ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const STORAGE_KEY = 'buildit-community-v5'; // bumped to v5 — added gradeBands to seed posts
const LIKED_KEY = 'buildit-liked';

function loadLikedSet() {
  try { return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || '[]')); }
  catch { return new Set(); }
}

function saveLikedSet(set) {
  try { localStorage.setItem(LIKED_KEY, JSON.stringify([...set])); } catch {}
}

const SEED_POSTS = [
  {
    id: 'seed-1', studentName: 'Maya R.', projectTitle: 'Soccer-Powered Catapult', category: 'engineering',
    caption: 'Mine launched a paper ball over 2 meters! Adjusting the rubber band tension was the key. Took 3 tries to get it right.',
    gradeBands: ['k2', '35', '68'],
    photo: '/mock/catapult.svg', likes: 23, likedBy: [], createdAt: Date.now() - 2 * 86400000,
    projectData: {
      hook: 'Build a catapult that converts the snap of a rubber band into a powerful arc — the same physics that launched boulders in medieval warfare. You\'ll tune the launch angle and tension to send a paper ball flying across the room.',
      stemConcepts: ['Potential energy', 'Projectile motion', 'Mechanical advantage'],
      materials: ['10 popsicle sticks (free – craft box or dollar store)', '5 rubber bands (free – at home)', '1 plastic spoon (free – at home)', 'Masking tape (free – at home)', '1 small paper cup (free – at home)', 'Ruler for measuring launch distance'],
      steps: [
        'Step 1 – Build the Base Frame: Stack 5 popsicle sticks flat on top of each other and wrap a rubber band tightly around each end so they form a thick, rigid bundle. This bundle is your catapult\'s spine — the thicker it is, the less it flexes when tension builds up, which keeps your launches consistent. Set it flat on the table and make sure it doesn\'t bend when you press the middle.',
        'Step 2 – Create the Throwing Arm: Take a single popsicle stick and tape the plastic spoon firmly to one end with 3 tight wraps of masking tape, bowl-side up. The spoon is your launch cup — it needs to be absolutely rigid against the stick or your projectile will wobble off-course. Wiggle it to test; if it moves, add more tape.',
        'Step 3 – Assemble the Catapult: Place the arm stick perpendicular across the top of your base bundle, about 2cm from one end. Lash it on with two rubber bands crossed in an X pattern — this creates the pivot point. The short end (no spoon) should stick out about 3cm past the bundle. The long spoon end should be able to swing freely up and down.',
        'Step 4 – Add the Launch Tension: Stretch one rubber band from the short end of the arm stick down and under the base bundle, then back up and hook it on the other side. This is your power source — when you push the spoon end down and let go, the stored elastic energy releases instantly and flings the arm upward. Test a few slow pushes to feel the resistance.',
        'Step 5 – Load, Fire, and Measure: Crumple a small piece of paper into a tight ball and place it in the spoon. Pull the spoon end down to the table, hold the base firmly with one hand, and release. Mark where it lands with a piece of tape and measure the distance with your ruler. Try adjusting the rubber band on the arm tighter or looser to see how it changes the range.',
      ],
      estimatedCost: '$0–$2', estimatedTime: '30–45 minutes',
    },
  },
  {
    id: 'seed-2', studentName: 'Carlos M.', projectTitle: 'Mini Solar Oven', category: 'science',
    caption: 'Melted chocolate in under 20 minutes using only sunlight and foil! My mom was so surprised.',
    gradeBands: ['35', '68', '912'],
    photo: '/mock/solar-oven.svg', likes: 41, likedBy: [], createdAt: Date.now() - 5 * 86400000,
    projectData: {
      hook: 'Turn a cardboard box into an oven that reaches 65°C using nothing but sunlight — no electricity, no fire. You\'ll harness the greenhouse effect, the same process that warms planets, to melt chocolate and cook s\'mores.',
      stemConcepts: ['Greenhouse effect', 'Thermal radiation', 'Reflection and absorption'],
      materials: ['1 cardboard box with a lid (shoebox works great – free)', 'Aluminum foil (free – kitchen drawer)', 'Black construction paper (free – craft supplies)', 'Plastic wrap or clear plastic bag (free – kitchen)', 'Tape (free – at home)', 'Small piece of dark chocolate or marshmallow to test', 'Ruler and pencil'],
      steps: [
        'Step 1 – Prep the Box Interior: Line the inside bottom and all four inner walls of the box completely with aluminum foil, shiny side out. Press it flat and tape every edge so there are no gaps — any exposed cardboard absorbs heat instead of reflecting it. The foil turns your box into a parabolic reflector, bouncing incoming sunlight toward the center where your food will sit.',
        'Step 2 – Add the Black Absorber: Cut a piece of black construction paper to fit the bottom of the box and place it on top of the foil lining. Black surfaces absorb nearly all wavelengths of light and convert them to heat, while the shiny foil walls funnel extra light onto it. This is the same reason asphalt gets burning hot in summer while light-colored concrete stays cooler.',
        'Step 3 – Cut and Angle the Lid Reflector: Score the lid of the box so it can be propped open at a 45-degree angle. Line the inside face of the lid with foil, shiny side out. When you angle it toward the sun, it acts as a secondary mirror that redirects sunlight that would otherwise miss the box down into the cooking chamber, boosting your temperature significantly.',
        'Step 4 – Seal with a Greenhouse Layer: Stretch plastic wrap tightly across the opening of the box (the top where the lid was) and tape it securely on all sides so no air can escape. This transparent seal lets sunlight in but traps the infrared heat the black paper radiates back — exactly how a greenhouse works. Even on a moderately sunny day, you\'ll see condensation form inside within minutes.',
        'Step 5 – Cook and Measure: Place your chocolate piece on a small square of foil on the black paper, close the plastic wrap, and angle your reflector lid toward the sun. Check every 5 minutes — the chocolate should begin softening in 10–15 minutes and be fully melted by 20 minutes on a sunny day. Try timing it at different hours to see how sun angle affects cooking speed.',
      ],
      estimatedCost: '$0', estimatedTime: '45–60 minutes',
    },
  },
  {
    id: 'seed-3', studentName: 'Priya K.', projectTitle: 'Cardboard Robo-Hand', category: 'engineering',
    caption: 'My robo-hand can pick up a juice box! Used fishing line instead of string — way stronger.',
    gradeBands: ['35', '68', '912'],
    photo: '/mock/robo-hand.svg', likes: 67, likedBy: [], createdAt: Date.now() - 86400000,
    projectData: {
      hook: 'Build a working robotic hand from cardboard and fishing line that you control with your own fingers — the same tendon-and-pulley mechanism that makes your real fingers curl. You\'ll feel the direct connection between engineering and biology.',
      stemConcepts: ['Pulleys and tension', 'Biomimicry', 'Mechanical linkage'],
      materials: ['1 large piece of cardboard (cereal box thickness – free)', 'Fishing line or strong thread — 1 meter (dollar store, ~$1)', 'Drinking straws — 5 (free – kitchen)', 'Tape (free – at home)', 'Scissors', 'Pen for tracing', 'Hole punch or sharp pencil'],
      steps: [
        'Step 1 – Trace and Cut the Hand: Place your hand flat on the cardboard with fingers spread naturally and trace around it with a pen, making each finger about 1.5cm wide so they\'re strong enough to hold shape. Cut it out carefully — the overall hand shape doesn\'t need to be perfect, but each finger needs clean, even sides so it doesn\'t twist when pulled. Cut out a matching palm piece you\'ll attach later.',
        'Step 2 – Score the Finger Joints: Using a ruler and the dull side of your scissors, press firmly across each finger at two evenly spaced points to create fold lines — these become your knuckle joints. Score on the same side you\'ll be pulling from. The cardboard fibers weaken along the score line and create a natural hinge, just like the connective tissue between your own finger bones.',
        'Step 3 – Thread the Tendons: Cut 5 pieces of fishing line, each about 20cm long. For each finger, cut two 1cm pieces of straw and tape one at the base and one in the middle of the finger, flat against the surface. Thread the fishing line through both straw loops — the straws act as tendon sheaths, guiding the line so it pulls the finger straight rather than pulling sideways.',
        'Step 4 – Attach to the Palm and Wrist Controller: Tape all the finger bases firmly to your palm piece. Gather all 5 fishing lines and run them down through a final straw taped to the wrist area. Tie each line to a small stick or popsicle stick that you\'ll hold in your other hand as the controller. When you pull individual lines, the matching finger curls — you can pick up objects by pulling all 5 at once.',
        'Step 5 – Test the Grip: Hold the wrist of your robo-hand with one hand and use the other to pull the control lines. Try picking up a paper cup, a pencil, then something heavier like a juice box. If a finger collapses instead of curling, reinforce the score lines with a small piece of tape on the back side. Fine-tune which fingers you pull together for different grip shapes.',
      ],
      estimatedCost: '$0–$1', estimatedTime: '45–60 minutes',
    },
  },
  {
    id: 'seed-4', studentName: 'Jordan L.', projectTitle: 'Music Visualizer LEDs', category: 'technology',
    caption: 'Connected an Arduino to LEDs that pulse with music. Took 2 weekends but totally worth it.',
    gradeBands: ['68', '912'],
    photo: '/mock/music-leds.svg', likes: 89, likedBy: [], createdAt: Date.now() - 3 * 86400000,
    projectData: {
      hook: 'Wire up an Arduino so that LEDs flash and pulse in real time with any music you play — no special software, just a microphone, a few components, and code. You\'ll learn how analog sound waves become digital numbers your microcontroller can act on.',
      stemConcepts: ['Analog-to-digital conversion', 'Sound waves and amplitude', 'Microcontroller programming'],
      materials: ['Arduino Uno — electronics store or Amazon, ~$12', 'Small electret microphone module (KY-038) — Amazon, ~$3', '5 LEDs, any color (pack of 100) — Amazon, ~$2', '5 × 220-ohm resistors — Amazon, ~$2', 'Jumper wires, assorted — Amazon, ~$4', 'USB-A to USB-B cable (comes with most Arduino kits)', 'Laptop with Arduino IDE installed (free download)'],
      steps: [
        'Step 1 – Install Arduino IDE and Set Up the Board: Download the Arduino IDE from arduino.cc (free) and install it on your laptop. Plug in your Arduino Uno via USB — the power LED should glow red immediately. In the IDE, go to Tools → Board → Arduino Uno, then Tools → Port and select the port that appeared when you plugged it in. Upload the built-in Blink example (File → Examples → 01.Basics → Blink) to confirm everything works — the onboard LED should blink once per second.',
        'Step 2 – Wire the Microphone Module: The KY-038 microphone module has three pins: VCC, GND, and AO (analog output). Connect VCC to the Arduino\'s 5V pin, GND to any GND pin, and AO to the Arduino\'s A0 pin using jumper wires. The module converts sound pressure into a voltage between 0V and 5V — louder sounds create bigger voltage swings, which the Arduino reads as higher numbers between 0 and 1023.',
        'Step 3 – Wire the LEDs with Resistors: Push 5 LEDs into your breadboard with the longer leg (positive) in one row and the shorter leg (negative) in another. Connect a 220-ohm resistor between each LED\'s negative leg and the ground rail. Then connect the positive leg of each LED to Arduino digital pins 8, 9, 10, 11, and 12 with jumper wires. The resistors limit current so you don\'t burn out the LEDs — without them, they\'d draw too much and fail instantly.',
        'Step 4 – Write the Visualizer Code: In the Arduino IDE, type this program: read the microphone on A0 every loop, map the value to a 0–5 range, and turn on that many LEDs. A quiet room reads around 500; a loud clap jumps to 900+. Use digitalW rite to turn each LED on or off based on the mapped sound level. Upload it, play music from your phone near the mic, and watch the LEDs respond — louder music lights up more LEDs.',
        'Step 5 – Tune the Sensitivity: If the LEDs barely react, add a small delay of 10 milliseconds between reads so the Arduino samples more consistently. If they\'re always fully lit, add an offset that subtracts the ambient noise floor from each reading. Try holding the mic closer to a speaker, then farther away, and note how the LED count changes — you\'re directly observing how amplitude (loudness) affects signal voltage in a circuit.',
      ],
      estimatedCost: '$20–$25', estimatedTime: '3–4 hours over a weekend',
    },
  },
  {
    id: 'seed-5', studentName: 'Aisha T.', projectTitle: 'Plant Growth Tracker', category: 'science',
    caption: 'My bean plant grew 3cm in one week! Made a graph comparing window vs shade plants.',
    gradeBands: ['k2', '35', '68'],
    photo: '/mock/plant-tracker.svg', likes: 34, likedBy: [], createdAt: Date.now() - 7 * 86400000,
    projectData: {
      hook: 'Run a real controlled experiment comparing how different light conditions affect plant growth speed — the same type of experiment botanists use to study photosynthesis. You\'ll collect daily data, graph it, and discover what light actually does inside a leaf.',
      stemConcepts: ['Photosynthesis', 'Controlled variables', 'Data collection and graphing'],
      materials: ['6 bean or radish seeds (dollar store seed packet, ~$1)', '3 plastic cups (free – kitchen)', 'Potting soil or cotton balls (free – at home)', 'Ruler (free – at home)', 'Graph paper and pencil (free – school supplies)', 'Masking tape and marker for labeling', 'Water'],
      steps: [
        'Step 1 – Set Up Your Controlled Experiment: Fill three cups with equal amounts of potting soil — exactly 3/4 full each. Plant 2 seeds in each cup at the same depth (1cm down, poke a hole with a pencil). Label them: "Full Sun," "Partial Shade," and "No Light" with masking tape. Everything else — soil amount, seed type, water amount — must stay identical across all three cups. The only thing you\'re changing is light, which makes light your independent variable.',
        'Step 2 – Place Cups in Different Light Conditions: Put "Full Sun" on a south-facing windowsill that gets at least 6 hours of direct sun. Put "Partial Shade" near a window but behind a sheer curtain or in a corner that gets bright indirect light. Put "No Light" inside a closed cabinet or cardboard box. Water all three with exactly the same amount — about 2 tablespoons each — at the same time every day.',
        'Step 3 – Record Daily Measurements: Each morning at the same time, measure the height of the tallest sprout in each cup from the soil surface to the tip of the highest leaf, in millimeters. Write it in a table with the date, cup name, and height. On days where nothing has sprouted yet, write 0mm. Consistent timing matters — plants actually grow at slightly different rates during the day vs. night, so measuring at the same time removes that variable.',
        'Step 4 – Graph Your Results: After 7 days, draw a line graph with days (1–7) on the X-axis and height in mm on the Y-axis. Plot all three cups on the same graph using different colored pencils. You\'ll likely see the full sun plant growing steepest — photosynthesis produces glucose that fuels cell growth, and more light means more glucose produced per hour. The no-light plant may sprout but will look pale and thin, a condition called etiolation.',
        'Step 5 – Analyze and Conclude: Look at your graph and calculate the average daily growth rate for each cup by dividing final height by 7. Write two sentences: one describing what happened and one explaining why based on photosynthesis. Then extend the experiment — what would happen if you put the no-light plant back in the sun? Move it and track the recovery over another 3 days to see if plants can "catch up" after light deprivation.',
      ],
      estimatedCost: '$1', estimatedTime: '30 minutes setup, 5 minutes/day for 1 week',
    },
  },
  {
    id: 'seed-6', studentName: 'Finn O.', projectTitle: 'Marble Run Math Machine', category: 'math',
    caption: 'Made a machine that counts marbles using gravity — can track up to 99! My teacher loved it.',
    gradeBands: ['k2', '35'],
    photo: '/mock/marble-run.svg', likes: 28, likedBy: [], createdAt: Date.now() - 4 * 86400000,
    projectData: {
      hook: 'Build a gravity-powered counting machine from cardboard tubes that automatically sorts marbles into groups of 10 — teaching place value the same way an abacus does, but with rolling marbles instead of beads.',
      stemConcepts: ['Place value and base-10', 'Gravity and momentum', 'Mechanical sorting'],
      materials: ['4 paper towel or toilet paper rolls (free – recycling bin)', '1 large cereal box (free – recycling bin)', 'Tape (free – at home)', 'Scissors', '20+ marbles (dollar store, ~$2)', 'Markers for labeling', 'Small plastic cups or sections cut from egg carton'],
      steps: [
        'Step 1 – Build the Main Ramp Channel: Cut a paper towel roll in half lengthwise to create an open half-pipe channel. Tape it diagonally across the inside of your cereal box at about a 30-degree angle — steep enough for marbles to roll freely but shallow enough to count each one as it passes. Test the angle by dropping one marble in the top: it should roll smoothly and not bounce out. This ramp is your input funnel.',
        'Step 2 – Create the Ones Counter: At the bottom of your ramp, place a small cup labeled "Ones" to catch marbles as they arrive. Cut small notches in the side of the cup at 10 equal intervals so you can see the marble level. Each marble that drops in represents one unit — you\'re essentially creating a tally counter. When the cup fills to 10, you\'ll manually transfer them to the next section, which is how place value physically works.',
        'Step 3 – Build the Tens Overflow Chute: Cut a second half-pipe from a toilet paper roll and position it at the lip of the Ones cup so that when 10 marbles accumulate, you roll them out and down this chute into a "Tens" cup below. Label the Tens cup clearly. This physical transfer moment is the most important part of the machine — it makes the abstract concept of "carrying the 1" into something you can see and feel happening.',
        'Step 4 – Add a Hundreds Section: If your box is tall enough, add a third cup at the very bottom labeled "Hundreds" using the same overflow logic. Now you have a three-column place-value machine. Drop 10 marbles in slowly one at a time, count aloud as each hits the Ones cup, then transfer — the marble that tips you from 9 to 10 triggers a carry that physically moves marbles between columns, just like a number rolling over on an odometer.',
        'Step 5 – Run Counting Experiments: Drop marbles in one at a time and practice reading the three-cup display as a number: 2 in Hundreds + 3 in Tens + 7 in Ones = 237. Time how long it takes a friend to drop in 50 marbles vs. you counting by tens on paper — the machine is usually faster. Try starting with a number already in the cups and adding more to practice addition with carrying. Record your highest count before marbles start missing the cups.',
      ],
      estimatedCost: '$0–$2', estimatedTime: '45–60 minutes',
    },
  },
];

function loadLocal() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    // first load — seed with example posts
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS));
    return SEED_POSTS;
  } catch { return SEED_POSTS; }
}

function saveLocal(posts) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); } catch {}
}

export async function fetchPosts(category = 'all', grade = null) {
  if (USE_SUPABASE) {
    let query = supabase
      .from('community_posts')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });
    if (category !== 'all') query = query.eq('category', category);
    const { data, error } = await query;
    if (error) throw error;
    const liked = loadLikedSet();
    const sessionId = localStorage.getItem('buildit-session');
    return data.map(p => ({
      id: p.id,
      studentName: p.student_name,
      projectTitle: p.project_title,
      category: p.category,
      caption: p.caption,
      photo: p.photo_url,
      likes: p.likes,
      likedBy: liked.has(p.id) && sessionId ? [sessionId] : [],
      createdAt: new Date(p.created_at).getTime(),
    }));
  }

  let posts = loadLocal();
  if (category !== 'all') posts = posts.filter(p => p.category === category);

  // Grade filtering: if grade provided, prefer grade-matched posts; fall back to all if none match
  if (grade) {
    const gradeFiltered = posts.filter(p => !p.gradeBands || p.gradeBands.includes(grade));
    if (gradeFiltered.length > 0) posts = gradeFiltered;
  }

  return [...posts].sort((a, b) => b.createdAt - a.createdAt);
}

export async function createPost({ studentName, projectTitle, category, caption, photo, projectData }) {
  if (USE_SUPABASE) {
    let photoUrl = null;
    if (photo) {
      const filename = `${Date.now()}.jpg`;
      const blob = await (await fetch(`data:image/jpeg;base64,${photo}`)).blob();
      const { error: uploadErr } = await supabase.storage
        .from('community-photos')
        .upload(filename, blob, { contentType: 'image/jpeg' });
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('community-photos').getPublicUrl(filename);
        photoUrl = urlData.publicUrl;
      }
    }
    const { data, error } = await supabase.from('community_posts').insert({
      student_name: studentName,
      project_title: projectTitle,
      category,
      caption,
      photo_url: photoUrl,
      project_data: projectData || null,
      likes: 0,
      approved: true,
    }).select().single();
    if (error) throw error;
    return data;
  }

  const posts = loadLocal();
  const newPost = {
    id: `post-${Date.now()}`,
    studentName,
    projectTitle,
    category,
    caption,
    photo: photo ? `data:image/jpeg;base64,${photo}` : null,
    projectData: projectData || null,
    likes: 0,
    likedBy: [],
    createdAt: Date.now(),
  };
  saveLocal([newPost, ...posts]);
  return newPost;
}

// ── Ideas ────────────────────────────────────────────────────────────────────

const IDEAS_KEY = 'buildit-community-ideas-v2'; // v2 — added gradeBands + 2 new K-5 seed ideas
const IDEAS_LIKED_KEY = 'buildit-ideas-liked';

const SEED_IDEAS = [
  { id: 'idea-1', studentName: 'Alex K.', ideaDescription: 'I love solar energy and want to build something that uses sunlight to power a small device.', ideaTitle: 'Solar-Powered USB Charger', category: 'technology', gradeBands: ['68', '912'], projectData: null, likes: 15, likedBy: [], createdAt: Date.now() - 86400000 },
  { id: 'idea-2', studentName: 'Sofia B.', ideaDescription: 'I always forget to water my plants. I want to build something that waters them automatically when the soil gets dry.', ideaTitle: 'Auto Plant Waterer', category: 'engineering', gradeBands: ['68', '912'], projectData: null, likes: 31, likedBy: [], createdAt: Date.now() - 2 * 86400000 },
  { id: 'idea-3', studentName: 'Marcus T.', ideaDescription: 'I want to build a working pinball machine using only cardboard — rubber band bumpers, a spring launcher, and scoring holes.', ideaTitle: 'Cardboard Pinball Machine', category: 'engineering', gradeBands: ['35', '68', '912'], projectData: null, likes: 22, likedBy: [], createdAt: Date.now() - 3 * 86400000 },
  { id: 'idea-4', studentName: 'Lily C.', ideaDescription: 'I want to make floor tiles that play different musical notes when you step on them, like a walk-on piano!', ideaTitle: 'Walk-On Musical Tiles', category: 'technology', gradeBands: ['68', '912'], projectData: null, likes: 44, likedBy: [], createdAt: Date.now() - 4 * 86400000 },
  { id: 'idea-5', studentName: 'David M.', ideaDescription: 'Can you move water uphill using only gravity and a tube? I want to build a gravity-powered siphon pump and test how high it can lift water.', ideaTitle: 'Gravity Siphon Pump', category: 'science', gradeBands: ['35', '68', '912'], projectData: null, likes: 18, likedBy: [], createdAt: Date.now() - 5 * 86400000 },
  { id: 'idea-6', studentName: 'Riya P.', ideaDescription: 'I want to test which bridge design is strongest — arch, beam, or truss — using only identical sheets of paper and coin weights.', ideaTitle: 'Paper Bridge Strength Showdown', category: 'engineering', gradeBands: ['35', '68', '912'], projectData: null, likes: 27, likedBy: [], createdAt: Date.now() - 6 * 86400000 },
  { id: 'idea-7', studentName: 'Jamie L.', ideaDescription: 'I want to build a tower out of spaghetti and marshmallows and see how tall I can make it before it falls.', ideaTitle: 'Spaghetti Tower Challenge', category: 'engineering', gradeBands: ['k2', '35'], projectData: null, likes: 19, likedBy: [], createdAt: Date.now() - 7 * 86400000 },
  { id: 'idea-8', studentName: 'Nora S.', ideaDescription: 'I want to make a volcano that actually erupts using baking soda and vinegar and decorate it like a real one.', ideaTitle: 'Erupting Baking Soda Volcano', category: 'science', gradeBands: ['k2', '35'], projectData: null, likes: 35, likedBy: [], createdAt: Date.now() - 8 * 86400000 },
];

function loadLocalIdeas() {
  try {
    const stored = localStorage.getItem(IDEAS_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(IDEAS_KEY, JSON.stringify(SEED_IDEAS));
    return SEED_IDEAS;
  } catch { return SEED_IDEAS; }
}

function saveLocalIdeas(ideas) {
  try { localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas)); } catch {}
}

function loadIdeasLikedSet() {
  try { return new Set(JSON.parse(localStorage.getItem(IDEAS_LIKED_KEY) || '[]')); }
  catch { return new Set(); }
}

function saveIdeasLikedSet(set) {
  try { localStorage.setItem(IDEAS_LIKED_KEY, JSON.stringify([...set])); } catch {}
}

export async function fetchIdeas(category = 'all', grade = null) {
  let ideas = loadLocalIdeas();
  if (category !== 'all') ideas = ideas.filter(i => i.category === category);

  // Grade filtering: prefer grade-matched ideas; fall back to all if none match
  if (grade) {
    const gradeFiltered = ideas.filter(i => !i.gradeBands || i.gradeBands.includes(grade));
    if (gradeFiltered.length > 0) ideas = gradeFiltered;
  }

  return [...ideas].sort((a, b) => b.createdAt - a.createdAt);
}

export function updateIdeaProjectData(ideaId, projectData) {
  const ideas = loadLocalIdeas();
  const updated = ideas.map(i => i.id === ideaId ? { ...i, projectData } : i);
  saveLocalIdeas(updated);
}

export async function createIdea({ studentName, ideaDescription, ideaTitle, category, projectData }) {
  const ideas = loadLocalIdeas();
  const newIdea = {
    id: `idea-${Date.now()}`,
    studentName,
    ideaDescription,
    ideaTitle,
    category,
    projectData: projectData || null,
    likes: 0,
    likedBy: [],
    createdAt: Date.now(),
  };
  saveLocalIdeas([newIdea, ...ideas]);
  return newIdea;
}

export async function toggleIdeaLike(ideaId, sessionId) {
  const ideas = loadLocalIdeas();
  const updated = ideas.map(i => {
    if (i.id !== ideaId) return i;
    const alreadyLiked = i.likedBy?.includes(sessionId);
    return {
      ...i,
      likes: alreadyLiked ? i.likes - 1 : i.likes + 1,
      likedBy: alreadyLiked
        ? i.likedBy.filter(id => id !== sessionId)
        : [...(i.likedBy || []), sessionId],
    };
  });
  saveLocalIdeas(updated);
  return updated.find(i => i.id === ideaId);
}

// ── Creations (posts) ─────────────────────────────────────────────────────────

export async function toggleLike(postId, sessionId) {
  if (USE_SUPABASE) {
    const liked = loadLikedSet();
    const alreadyLiked = liked.has(postId);
    const { data: post } = await supabase.from('community_posts').select('likes').eq('id', postId).single();
    const nextLikes = Math.max(0, (post?.likes || 0) + (alreadyLiked ? -1 : 1));
    const { error } = await supabase.from('community_posts').update({ likes: nextLikes }).eq('id', postId);
    if (error) throw error;
    if (alreadyLiked) liked.delete(postId); else liked.add(postId);
    saveLikedSet(liked);
    return;
  }

  const posts = loadLocal();
  const updated = posts.map(p => {
    if (p.id !== postId) return p;
    const alreadyLiked = p.likedBy?.includes(sessionId);
    return {
      ...p,
      likes: alreadyLiked ? p.likes - 1 : p.likes + 1,
      likedBy: alreadyLiked
        ? p.likedBy.filter(id => id !== sessionId)
        : [...(p.likedBy || []), sessionId],
    };
  });
  saveLocal(updated);
  return updated.find(p => p.id === postId);
}
