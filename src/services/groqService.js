const TEXT_MODEL = 'llama-3.3-70b-versatile';
// Groq decommissioned the llama-3.2 vision previews; Llama 4 Scout is the supported multimodal model
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

const GRADE_LABELS = {
  k: 'Kindergarten',
  '1': '1st Grade', '2': '2nd Grade', '3': '3rd Grade', '4': '4th Grade',
  '5': '5th Grade', '6': '6th Grade', '7': '7th Grade', '8': '8th Grade',
  '9': '9th Grade', '10': '10th Grade', '11': '11th Grade', '12': '12th Grade',
  k2: 'K through 2nd Grade',
  '35': '3rd through 5th Grade',
  '68': '6th through 8th Grade',
  '912': '9th through 12th Grade',
};

const BUDGET_LABELS = {
  free: 'Free (use materials at home)',
  low: 'Under $10',
  medium: '$10–$50',
};

const TIME_LABELS = {
  short: '15–30 minutes',
  medium: '1–2 hours',
  long: 'Weekend project',
  extended: '1–2 weeks',
};

const STEM_LABELS = {
  science: 'Science', technology: 'Technology', engineering: 'Engineering',
  math: 'Math', biology: 'Biology', chemistry: 'Chemistry', physics: 'Physics',
  computerScience: 'Computer Science', robotics: 'Robotics', astronomy: 'Astronomy',
  environmental: 'Environmental Science', electronics: 'Electronics',
};

// Challenge tier by grade band — injected into the generation prompt so
// project ambition scales with age instead of defaulting to easy builds
function gradeTier(grade) {
  const g = String(grade);
  if (['9', '10', '11', '12', '912'].includes(g)) return 'high';
  if (['6', '7', '8', '68'].includes(g)) return 'middle';
  if (['3', '4', '5', '35'].includes(g)) return 'upper';
  return 'lower';
}

const TIER_RULES = {
  lower: {
    steps: 6,
    note: 'This is a young student (K–2): keep builds simple, single-concept, and quick to assemble — success within the first session matters most.',
  },
  upper: {
    steps: 6,
    note: 'This student is in upper elementary (3–5): builds should have a few interacting parts and at least one moment where they tweak or adjust something to make it work better.',
  },
  middle: {
    steps: 7,
    note: 'This is a middle schooler (6–8): do NOT suggest simple crafts. Every project needs a real engineering or experimental challenge — a mechanism with multiple interacting parts, a variable to measure and tune, or a design they must iterate on when the first attempt underperforms. It should take genuine problem-solving to get working well.',
  },
  high: {
    steps: 8,
    note: 'This is a high schooler (9–12): projects must be genuinely challenging — multi-system builds, quantitative measurement and analysis (collect real data, calculate something meaningful from it), optimization across trade-offs, or battery-powered breadboard electronics where relevant. A project an elementary student could complete is an automatic failure. The student should expect their first attempt to need debugging and iteration, and the finished result should be impressive enough to show off.',
  },
};

function resolveLang(language) {
  if (!language || language === 'en' || language === 'English') return 'English';
  const lower = language.toLowerCase();
  if (lower === 'es' || lower.includes('spanish') || lower.includes('español') || lower.includes('espanol'))
    return 'Spanish (Castilian Spanish — NOT Portuguese, NOT any other language)';
  return language; // full string like 'French', 'Japanese', etc.
}

// All Groq calls go through the server proxy so the API key never reaches the browser
async function chatCompletion(params) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function newProjectId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `proj-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function wrapError(err) {
  if (err.status === 429) return new Error('RATE_LIMIT');
  if (err.status === 401) return new Error('API_KEY_MISSING');
  if (err.message?.includes('network') || err.name === 'TypeError') return new Error('NETWORK_ERROR');
  return new Error('API_ERROR');
}

// ── Generate projects from student profile ──────────────────────────────────
export async function generateProjects(studentData, language) {
  const { name, grade, stemInterests, personalInterests, budget, timeAvailable, complexity, completedCount = 0 } = studentData;
  const lang = resolveLang(language);
  const gradeLabel = GRADE_LABELS[grade] || grade;
  const budgetLabel = BUDGET_LABELS[budget] || budget;
  const timeLabel = TIME_LABELS[timeAvailable] || timeAvailable;
  const stemLabels = stemInterests.map((k) => STEM_LABELS[k] || k).join(', ');
  const tier = TIER_RULES[gradeTier(grade)];
  const complexityNote = completedCount > 0
    ? `${complexity} (student has completed ${completedCount} project(s), increase challenge slightly)`
    : complexity;

  const system = `You are BuildIt, a creative STEM mentor for K-12 students. Generate personalized, hands-on maker-space projects.

FEASIBILITY RULES — apply to every project, every grade level:
1. Every project must be 100% completable within the stated time and budget by a single student working alone at home.
2. The finished project must produce a REAL, TANGIBLE, SATISFYING outcome the student can hold, show, or demonstrate — not "a report", not "a presentation", not "a design document". Something physical or interactive that actually works.
3. Scale ambition to the grade band. Younger students get simple, fast wins. Older students (6–12) get projects with real engineering challenge: multiple interacting parts, variables to measure and tune, designs that need iteration to work well. A high schooler must never receive a project an 8-year-old could finish — complexity of thinking AND complexity of build should both grow with grade.
4. Never suggest projects that require lab equipment, school/makerspace facilities, industrial tools, or specialized software licenses to complete.
5. Every project must feel exciting and achievable for that grade — for younger students, "I can make this today"; for older students, "this will push me, and it'll be impressive when it works".

SAFETY RULES — non-negotiable, apply to every project:
1. NEVER require disassembling any electronic device, appliance, charger, toy, or gadget to extract components (no "remove wire from charger", "salvage LED from old toy", "strip cable", etc.).
2. NEVER involve mains/wall electricity, soldering, open flames, strong acids, bleach, or other hazardous chemicals.
3. All materials must be either (a) common household items students already have — cardboard, paper, tape, glue sticks, rubber bands, string, aluminum foil, plastic bottles, craft sticks, food items, fabric scraps, felt, scissors — OR (b) inexpensive store-bought components listed with where to buy and the approximate cost (e.g. "9V battery — craft or dollar store, ~$2").
4. If a project genuinely benefits from a small electronic component (LED, buzzer, small motor), list it as PURCHASE ONLY with store type and price — never as something to extract from an existing device.
5. Tools scale with age: grades K–5 use only regular scissors, a ruler, and a hole punch. Grades 6–8 may also use a low-temp hot glue gun and a screwdriver. Grades 9–12 may additionally use an X-Acto/craft knife, a multimeter, and battery-powered breadboard electronics (jumper wires, resistors, sensors — still NO soldering and NO mains power, ever).

HOW TO WRITE STEPS — this determines quality:
Each step is a natural, flowing paragraph of 90-130 words. Write like a knowledgeable older student sitting right next to them, guiding every single move. Rules:

1. Be surgically specific: exact measurements, exact quantities, exact technique (e.g. "cut a 25cm strip" not "cut a strip"; "press firmly for 10 seconds" not "press down").

2. Weave the science/engineering/math insight directly into the instruction — do NOT use labels like "STEM explanation:" or "Why it works:". Instead, blend it naturally: "...the copper foil strip carries current easily because electrons flow through metal the way water flows through a pipe, so a loose connection here means less light."

3. Include one concrete comparison, analogy, or real-world example woven into the prose — not tagged as "Example:" or "Tip:" — just part of the sentence naturally.

4. End the step with a brief, natural observation sentence that tells them what success looks like — never start it with "You'll know it worked when" — just describe it as they'll experience it: "The LED should glow steadily as soon as the circuit closes."

5. NEVER repeat a label pattern across steps. Each step should feel unique and conversational.

6. Do NOT write vague actions like "test your project" or "assemble the parts". Every verb must be specific and actionable.

LANGUAGE: You MUST write every single word of your JSON output in ${lang}. Do not mix in any other language.
Output ONLY a raw JSON object — no markdown, no code fences.`;

  const user = `Generate exactly 3 distinct STEM projects for this student:

Name: ${name}
Grade: ${gradeLabel}
STEM interests: ${stemLabels}
Hobbies & personal interests: ${personalInterests}
Budget: ${budgetLabel}
Time available: ${timeLabel}
Difficulty: ${complexityNote}

Requirements:
- Each project must directly tie into one of ${name}'s personal hobbies in a real, meaningful way
- Span different STEM categories across the 3 projects
- FEASIBILITY: every project must be completable alone at home within the stated time/budget and produce a real, physical or interactive outcome
- SAFETY: follow all SAFETY RULES — household items only or clearly labeled purchasable items; NEVER disassembling devices
- Materials must be exact and specific (e.g. "2 AA batteries — dollar store, ~$2" or "30cm × 10cm cardboard piece from any cereal box")
- If a material needs to be purchased, append "— [store type], ~$[price]" to the item name
- Steps must follow the HOW TO WRITE STEPS rules above — exactly ${tier.steps} detailed teaching paragraphs per project, no vague bullets
- CHALLENGE LEVEL: ${tier.note}

Return this exact JSON (no extra fields, no markdown):
{
  "projects": [
    {
      "title": "Catchy project title that mentions the hobby",
      "hook": "2 exciting sentences connecting their hobby to what they'll build and the surprising STEM concept behind it",
      "stemConcepts": ["concept1", "concept2", "concept3"],
      "materials": ["specific item with exact quantity (free – at home)", "purchasable item with quantity (~$X – buy online)", "..."],
      "shoppingList": [
        {
          "name": "Display name of item to purchase",
          "estimatedCost": "~$X",
          "searchQuery": "specific Amazon search terms to find a reliable budget version of this item"
        }
      ],
      "steps": [
        "Step 1 – [Short descriptive title]: [Full natural teaching paragraph — specific action + embedded explanation + analogy or example + natural success observation. No labels. 90-130 words.]",
${Array.from({ length: tier.steps - 1 }, (_, i) => `        "Step ${i + 2} – [Short descriptive title]: ..."`).join(',\n')}
      ],
      "levelUp": "One sentence challenge that meaningfully extends or remixes the project",
      "estimatedCost": "$X–$X",
      "estimatedTime": "X–X minutes",
      "category": "science | technology | engineering | math | art",
      "gradeLevel": "${gradeLabel}",
      "youtubeSearchQuery": "specific YouTube search query to find a real tutorial for a similar hands-on project (NOT this exact project — just a real similar one a student could watch for inspiration)"
    }
  ]
}

shoppingList rules:
- Include ONLY items that must be purchased (not household items the student already has)
- searchQuery must be specific enough to return good budget results on Amazon (e.g. "LED lights 5mm assorted pack 100pcs electronics" not just "LED")
- Bias toward reliable brands and kits that give good value — not the absolute cheapest, not the most expensive
- If the project needs zero purchased items, return an empty shoppingList array []`;

  try {
    const completion = await chatCompletion({
      model: TEXT_MODEL,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      temperature: 0.9,
      max_tokens: 8000,
      response_format: { type: 'json_object' },
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) throw new Error('PARSE_ERROR');

    let parsed;
    try { parsed = JSON.parse(text); }
    catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('PARSE_ERROR');
      parsed = JSON.parse(m[0]);
    }

    if (!parsed.projects?.length) throw new Error('PARSE_ERROR');
    return parsed.projects.map((p) => ({ ...p, id: newProjectId() }));
  } catch (err) {
    if (err.message === 'PARSE_ERROR') throw err;
    throw wrapError(err);
  }
}

// ── Translate existing projects to another language (preserves ids) ─────────
export async function translateProjects(projects, language) {  const lang = resolveLang(language);
  const stripped = projects.map(({ id, savedAt, ...rest }) => rest);

  try {
    const completion = await chatCompletion({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate every human-readable string value in the JSON the user provides into ${lang}. Keep the JSON structure, keys, and array lengths exactly the same. Do not translate keys, URLs, or the "searchQuery" / "youtubeSearchQuery" values (keep those in English so search still works). Keep numbers, prices, and measurements unchanged. Output ONLY the raw translated JSON object — no markdown, no commentary.`,
        },
        { role: 'user', content: JSON.stringify({ projects: stripped }) },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 8000,
      temperature: 0.2,
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    if (!parsed.projects?.length || parsed.projects.length !== projects.length) throw new Error('PARSE_ERROR');
    // reattach original ids so saved/completed state survives translation
    return parsed.projects.map((p, i) => ({ ...projects[i], ...p, id: projects[i].id }));
  } catch (err) {
    if (err.message === 'PARSE_ERROR') throw err;
    throw wrapError(err);
  }
}

// ── Chat with AI mentor while building a project ────────────────────────────
export async function chatWithMentor(history, project, imageBase64 = null, language = 'en') {  const lang = resolveLang(language);
  const useVision = !!imageBase64;

  const system = `You are a friendly, encouraging STEM mentor helping a student build: "${project.title}".
Project summary: ${project.hook}
Materials: ${project.materials.join(', ')}
Steps: ${project.steps.map((s, i) => `${i + 1}. ${s}`).join(' | ')}

Respond ONLY in ${lang} — do not use any other language. Be warm, specific, and age-appropriate. Keep answers under 4 sentences unless explaining a step. If shown a photo, describe what you see and give concrete next-step guidance.`;

  const groqMessages = [
    { role: 'system', content: system },
    ...history.map((msg) => {
      if (msg.image && msg.role === 'user') {
        return {
          role: 'user',
          content: [
            { type: 'text', text: msg.content || 'What do you see in my photo? What should I do next?' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${msg.image}` } },
          ],
        };
      }
      return { role: msg.role, content: msg.content };
    }),
  ];

  try {
    const completion = await chatCompletion({
      model: useVision ? VISION_MODEL : TEXT_MODEL,
      messages: groqMessages,
      max_tokens: 512,
      temperature: 0.7,
    });
    return completion.choices[0].message.content.trim();
  } catch (err) {
    throw wrapError(err);
  }
}

// ── Generate projects from a photo or text description of materials ──────────
export async function generateFromMaterials(imageBase64 = null, textDescription = '', studentData, language) {  const lang = resolveLang(language);
  const gradeLabel = GRADE_LABELS[studentData?.grade] || 'student';
  const name = studentData?.name || 'the student';
  const tier = TIER_RULES[gradeTier(studentData?.grade)];

  let materialsList = textDescription.trim();

  // Step 1: vision pass to identify materials from photo
  if (imageBase64) {
    try {
      const vision = await chatCompletion({
        model: VISION_MODEL,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'List every physical material, object, and supply you can see in this image. Be specific and concise. Output only a comma-separated list, nothing else.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ],
        }],
        max_tokens: 200,
      });
      const identified = vision.choices[0].message.content.trim();
      materialsList = materialsList ? `${materialsList}, ${identified}` : identified;
    } catch (err) {
      if (!materialsList) throw wrapError(err);
      // if vision fails but we have text, continue with just text
    }
  }

  if (!materialsList) throw new Error('NO_MATERIALS');

  // Step 2: generate projects from identified materials
  try {
    const completion = await chatCompletion({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are BuildIt, a creative STEM mentor. Generate projects using ONLY the provided materials.

SAFETY RULES — non-negotiable:
1. NEVER suggest disassembling any electronic device, charger, appliance, or gadget to extract parts.
2. NEVER involve mains electricity, soldering, open flames, or hazardous chemicals.
3. Use only the materials as-is. If a material from the list would be unsafe to use (e.g. "phone charger"), treat it as decoration or skip it entirely and note why.

HOW TO WRITE STEPS:
Each step is a natural, flowing paragraph of 90-130 words. Write like a knowledgeable older student guiding every move. Be surgically specific (exact measurements, exact technique). Weave the science/math insight directly into the sentence — never use labels like "STEM explanation:", "Tip:", or "You'll know it worked when:". End each step with a brief natural observation of what success looks like. Every step must feel unique and conversational, not templated.
LANGUAGE: Write every single word of your JSON output in ${lang}. Do not mix in any other language. Output ONLY raw JSON, no markdown.`,
        },
        {
          role: 'user',
          content: `Generate exactly 3 creative STEM projects using ONLY these materials: ${materialsList}

Student: ${name}, Grade: ${gradeLabel}
CHALLENGE LEVEL: ${tier.note}

Return this JSON (exactly ${tier.steps} steps per project — detailed, natural teaching paragraphs, no label patterns):
{
  "detectedMaterials": ["material1", "material2"],
  "projects": [
    {
      "title": "Project title",
      "hook": "2 exciting sentences about what they'll build and the STEM concept behind it",
      "stemConcepts": ["concept1", "concept2"],
      "materials": ["only items from the provided list with exact quantities"],
      "shoppingList": [],
      "steps": [
        "Step 1 – [Short descriptive title]: [Full natural teaching paragraph — specific action, embedded explanation, analogy or example, natural success observation. No labels. 90-130 words.]",
${Array.from({ length: tier.steps - 1 }, (_, i) => `        "Step ${i + 2} – [Short descriptive title]: ..."`).join(',\n')}
      ],
      "levelUp": "Challenge extension that meaningfully extends or remixes the project",
      "estimatedCost": "$0",
      "estimatedTime": "X–X minutes",
      "category": "science | technology | engineering | math | art",
      "gradeLevel": "${gradeLabel}"
    }
  ]
}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 8000,
      temperature: 0.9,
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    return {
      detectedMaterials: parsed.detectedMaterials || materialsList.split(',').map(s => s.trim()),
      projects: (parsed.projects || []).map((p) => ({ ...p, id: newProjectId() })),
    };
  } catch (err) {
    throw wrapError(err);
  }
}

// ── Explain a STEM concept at the student's grade level ─────────────────────
export async function explainConcept(concept, gradeLabel, language) {  const lang = resolveLang(language);
  try {
    const completion = await chatCompletion({
      model: TEXT_MODEL,
      messages: [{
        role: 'user',
        content: `Explain the STEM concept "${concept}" for a ${gradeLabel} student. Write ENTIRELY in ${lang} — do not use any other language. Return ONLY this JSON:
{
  "explanation": "2-3 fun, clear sentences at their exact grade level — define any jargon",
  "realWorldExample": "One sentence connecting it to something they see or feel every day",
  "quickActivity": "One thing they can try RIGHT NOW in under 60 seconds with zero materials — something physical they can feel or observe instantly"
}`,
      }],
      response_format: { type: 'json_object' },
      max_tokens: 350,
      temperature: 0.7,
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (err) { throw wrapError(err); }
}

// ── Quick focused help for one specific build step ───────────────────────────
export async function getStepHelp(step, stepIndex, project, language, imageBase64 = null) {  const lang = resolveLang(language);
  const useVision = !!imageBase64;
  const userContent = useVision
    ? [
        { type: 'text', text: `I'm stuck on step ${stepIndex + 1}: "${step}". Look at my photo and tell me exactly what to do next.` },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
      ]
    : `I'm stuck on step ${stepIndex + 1}: "${step}". Give me one clear, simple tip to get unstuck. Be specific and encouraging.`;
  try {
    const completion = await chatCompletion({
      model: useVision ? VISION_MODEL : TEXT_MODEL,
      messages: [
        { role: 'system', content: `You are a hands-on STEM mentor. Student is building "${project.title}". Materials: ${project.materials.join(', ')}. Be specific, warm, max 4 sentences. Respond ONLY in ${lang} — do not use any other language.` },
        { role: 'user', content: userContent },
      ],
      max_tokens: 256,
      temperature: 0.7,
    });
    return completion.choices[0].message.content.trim();
  } catch (err) { throw wrapError(err); }
}

// ── Generate AI reflection summary after completing a project ────────────────
export async function generateReflection(answers, project, language) {  const lang = resolveLang(language);
  try {
    const completion = await chatCompletion({
      model: TEXT_MODEL,
      messages: [{
        role: 'user',
        content: `A student finished building "${project.title}" (concepts: ${project.stemConcepts?.join(', ')}).
Reflections:
1. What surprised you? "${answers[0]}"
2. What would you change? "${answers[1]}"
3. What next? "${answers[2]}"

Write an encouraging summary ENTIRELY in ${lang} — do not use any other language. Return ONLY this JSON:
{
  "summary": "2-3 sentences celebrating their specific accomplishment and growth",
  "keyLearning": "The single most important STEM insight from their answers (1 sentence)",
  "badge": "A fun specific achievement badge they earned (e.g. 'Catapult Champion', 'Solar Pioneer')",
  "encouragement": "One powerful sentence about their future as a maker"
}`,
      }],
      response_format: { type: 'json_object' },
      max_tokens: 400,
      temperature: 0.85,
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (err) { throw wrapError(err); }
}

// ── Moderate community post content before publishing ───────────────────────
export async function moderateContent(caption, projectTitle) {  try {
    const completion = await chatCompletion({
      model: TEXT_MODEL,
      messages: [{
        role: 'user',
        content: `Moderate this K-12 student community post (ages 5-18):
Project: "${projectTitle}"
Caption: "${caption}"

Is it appropriate? (no adult content, no violence, no personal info, no spam, no bullying)
Return ONLY: {"approved": true or false, "reason": "empty if approved, brief reason if not"}`,
      }],
      response_format: { type: 'json_object' },
      max_tokens: 80,
      temperature: 0,
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch {
    return { approved: true, reason: '' }; // fail open — don't block posts on moderation errors
  }
}
