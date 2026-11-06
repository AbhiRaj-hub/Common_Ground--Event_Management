function at(daysFromNow, hour, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const CATEGORIES = [
  { id: "tech", label: "Tech" },
  { id: "business", label: "Business" },
  { id: "music", label: "Music & Dance" },
  { id: "debate", label: "Debate & Policy" },
  { id: "creative", label: "Creative" },
];

const EVENTS = [
  {
    id: "hacknova",
    title: "HackNova",
    category: "tech",
    start: at(10, 10),
    durationMin: 1440,
    venue: "Innovation Lab",
    price: 500,
    capacity: 80,
    registered: 52,
    featured: true,
    host: "Tech Club",
    tagline: "A 24-hour rapid prototyping hackathon. Idea to working demo by sunrise.",
    description:
      "Form a team, pick a problem and build a working prototype in 24 hours. Mentors are on hand for design, data and deployment questions, and teams demo to a panel of judges at the end. Meals and unlimited chai are included.",
    agenda: [
      { time: "10:00", item: "Kickoff and problem statements" },
      { time: "11:00", item: "Build time begins" },
      { time: "02:00", item: "Midnight mentor round" },
      { time: "09:00", item: "Final demos and awards" },
    ],
  },
  {
    id: "code-relay",
    title: "Code Relay",
    category: "tech",
    start: at(14, 10),
    durationMin: 240,
    venue: "Computer Lab A",
    price: 200,
    capacity: 60,
    registered: 31,
    featured: false,
    host: "Coding Society",
    tagline: "Multi-round team coding and bug-fixing sprint. Pass the baton, fix the build.",
    description:
      "Teams of three race through rounds of problem solving and debugging. Each round hands the codebase to the next teammate, so clear code and quick communication win as much as raw speed.",
    agenda: [
      { time: "10:00", item: "Round 1: algorithm sprint" },
      { time: "11:15", item: "Round 2: find and fix the bugs" },
      { time: "12:30", item: "Final relay" },
      { time: "13:30", item: "Results" },
    ],
  },
  {
    id: "robowars",
    title: "RoboWars",
    category: "tech",
    start: at(21, 11),
    durationMin: 360,
    venue: "Open Arena",
    price: 500,
    capacity: 32,
    registered: 19,
    featured: false,
    host: "Robotics Club",
    tagline: "Custom-built combat robots go head to head in an enclosed arena.",
    description:
      "Bring a robot you built yourself and fight it out in a knockout bracket inside a protected arena. Bots are weight-checked and safety-inspected before the first match. Spectators are welcome behind the barrier.",
    agenda: [
      { time: "11:00", item: "Weigh-in and safety inspection" },
      { time: "12:30", item: "Qualifying rounds" },
      { time: "15:00", item: "Knockout bracket" },
      { time: "16:30", item: "Final and prize ceremony" },
    ],
  },
  {
    id: "bytequest",
    title: "ByteQuest",
    category: "tech",
    start: at(17, 14),
    durationMin: 300,
    venue: "Computer Lab B",
    price: 200,
    capacity: 50,
    registered: 22,
    featured: false,
    host: "Cybersecurity Cell",
    tagline: "A Capture The Flag challenge in cybersecurity and network analysis.",
    description:
      "Solve puzzles across web, cryptography, forensics and packet analysis to capture flags and climb the live scoreboard. Beginners can team up with experienced players, and every challenge is legal, sandboxed and set up for this event.",
    agenda: [
      { time: "14:00", item: "Rules and platform walkthrough" },
      { time: "14:30", item: "Challenges go live" },
      { time: "18:30", item: "Scoreboard freezes" },
      { time: "19:00", item: "Solution walkthroughs" },
    ],
  },
  {
    id: "pitch-tank",
    title: "Pitch Tank",
    category: "business",
    start: at(12, 10),
    durationMin: 300,
    venue: "Seminar Hall",
    price: 200,
    capacity: 40,
    registered: 18,
    featured: true,
    host: "Entrepreneurship Cell",
    tagline: "Pitch your startup idea and defend your business model canvas.",
    description:
      "Present your idea in five minutes, then face questions from a panel of founders and investors. Teams are scored on the problem, the solution and how well the business model canvas holds together.",
    agenda: [
      { time: "10:00", item: "Briefing and canvas check-in" },
      { time: "10:30", item: "Pitches, five minutes each" },
      { time: "13:00", item: "Panel Q&A and scoring" },
      { time: "14:30", item: "Winners announced" },
    ],
  },
  {
    id: "battle-of-the-bands",
    title: "Battle of the Bands",
    category: "music",
    start: at(28, 17),
    durationMin: 240,
    venue: "Main Amphitheatre",
    price: 500,
    capacity: 300,
    registered: 188,
    featured: true,
    host: "Music Society",
    tagline: "Inter-college live bands compete on one big stage.",
    description:
      "Bands from colleges across the region play twenty-minute sets for a live audience and a judging panel. Original songs earn bonus points. Doors open at five and the crowd is half the show.",
    agenda: [
      { time: "17:00", item: "Doors open and sound checks" },
      { time: "18:00", item: "Band sets begin" },
      { time: "20:15", item: "Judges deliberate" },
      { time: "20:45", item: "Results and encore" },
    ],
  },
  {
    id: "footloose",
    title: "Footloose",
    category: "music",
    start: at(26, 15),
    durationMin: 210,
    venue: "Open Air Stage",
    price: 200,
    capacity: 120,
    registered: 64,
    featured: false,
    host: "Dance Club",
    tagline: "Solo and group choreography. Bring your best moves and your crew.",
    description:
      "Two categories: solo and group (up to eight dancers). Perform a routine of up to four minutes in any style, judged on choreography, technique and stage presence.",
    agenda: [
      { time: "15:00", item: "Registration and music check" },
      { time: "15:30", item: "Solo round" },
      { time: "16:45", item: "Group round" },
      { time: "18:00", item: "Awards" },
    ],
  },
  {
    id: "crescendo",
    title: "Crescendo",
    category: "music",
    start: at(8, 16),
    durationMin: 180,
    venue: "Mini Auditorium",
    price: 100,
    capacity: 30,
    registered: 30,
    featured: false,
    host: "Music Society",
    tagline: "An acoustic evening of solo and duet performances.",
    description:
      "No amplifiers, no effects, just voices and instruments. Perform solo or as a duet and let the song carry the room. This event is full, so keep an eye out for the next edition.",
    agenda: [
      { time: "16:00", item: "Sound check" },
      { time: "16:30", item: "Solo performances" },
      { time: "17:30", item: "Duet performances" },
      { time: "18:30", item: "Results" },
    ],
  },
  {
    id: "turncoat",
    title: "Turncoat",
    category: "debate",
    start: at(15, 11),
    durationMin: 180,
    venue: "Conference Hall",
    price: 100,
    capacity: 40,
    registered: 17,
    featured: false,
    host: "Debating Society",
    tagline: "A fast debate where you must switch sides halfway through.",
    description:
      "You are given a motion and a stance, then halfway through the round you are told to argue the opposite. The best speakers listen carefully, think fast and stay convincing on both sides.",
    agenda: [
      { time: "11:00", item: "Motion briefing" },
      { time: "11:30", item: "Round one: your stance" },
      { time: "12:15", item: "Switch! Round two: the other side" },
      { time: "13:30", item: "Judges' feedback" },
    ],
  },
  {
    id: "mun",
    title: "Model United Nations (MUN)",
    category: "debate",
    start: at(35, 9),
    durationMin: 480,
    venue: "Seminar Halls 1 to 3",
    price: 500,
    capacity: 150,
    registered: 73,
    featured: false,
    host: "MUN Society",
    tagline: "Multi-committee simulation of geopolitical policy and diplomacy.",
    description:
      "Represent a country, negotiate in committee and draft resolutions on pressing global issues. Multiple committees run in parallel, with chairs guiding debate and awarding best delegate in each.",
    agenda: [
      { time: "09:00", item: "Opening ceremony" },
      { time: "10:00", item: "Committee session one" },
      { time: "13:00", item: "Lunch and lobbying" },
      { time: "14:00", item: "Resolutions and closing" },
    ],
  },
  {
    id: "ad-mad",
    title: "Ad-Mad",
    category: "creative",
    start: at(19, 13),
    durationMin: 180,
    venue: "Media Room",
    price: 100,
    capacity: 60,
    registered: 26,
    featured: false,
    host: "Marketing Club",
    tagline: "A humorous and persuasive ad-creation contest.",
    description:
      "Get a product at random and sell it in two minutes, on stage, with props, jingles or whatever works. Judges score humour, persuasion and how well your pitch sticks.",
    agenda: [
      { time: "13:00", item: "Product draw" },
      { time: "13:30", item: "Prep time" },
      { time: "14:15", item: "Live ad performances" },
      { time: "15:45", item: "Results" },
    ],
  },
  {
    id: "lenscraft",
    title: "LensCraft",
    category: "creative",
    start: at(31, 10),
    durationMin: 420,
    venue: "Campus grounds",
    price: 100,
    capacity: 70,
    registered: 29,
    featured: false,
    host: "Photography Club",
    tagline: "Theme photography and short-film showcase, shot on campus.",
    description:
      "A theme is revealed at the start. Shoot your photographs or short film around campus within the time limit, then submit for a public screening and exhibition. Phones and cameras are both welcome.",
    agenda: [
      { time: "10:00", item: "Theme reveal" },
      { time: "10:30", item: "Shooting begins" },
      { time: "15:00", item: "Submissions close" },
      { time: "16:00", item: "Screening and awards" },
    ],
  },
];

const ART_PALETTES = {
  tech: ["#22382B", "#9CC3A0", "#E9F0E4"],
  business: ["#2E4A37", "#C98B4A", "#EFE6D2"],
  music: ["#5A3B26", "#D9A066", "#F6E9D5"],
  debate: ["#3B5B45", "#E3B778", "#F4EDDC"],
  creative: ["#6E8B5E", "#F0C98F", "#F7F1E1"],
};

function seededRandom(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function eventArt(ev) {
  const [base, accent, soft] = ART_PALETTES[ev.category] || ART_PALETTES.tech;
  const rand = seededRandom(ev.id);
  let shapes = "";
  for (let i = 0; i < 5; i++) {
    const color = i % 2 ? accent : soft;
    const opacity = (0.35 + rand() * 0.45).toFixed(2);
    const x = Math.round(rand() * 600);
    const y = Math.round(rand() * 400);
    if (i % 3 === 0) {
      shapes += `<circle cx="${x}" cy="${y}" r="${60 + Math.round(rand() * 110)}" fill="${color}" opacity="${opacity}"/>`;
    } else if (i % 3 === 1) {
      shapes += `<rect x="${x - 80}" y="${y - 50}" width="${120 + Math.round(rand() * 120)}" height="${80 + Math.round(rand() * 90)}" rx="36" fill="${color}" opacity="${opacity}" transform="rotate(${Math.round(rand() * 40 - 20)} ${x} ${y})"/>`;
    } else {
      shapes += `<path d="M${x - 90} ${y + 60} A90 90 0 0 1 ${x + 90} ${y + 60} Z" fill="${color}" opacity="${opacity}"/>`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice"><rect width="600" height="400" fill="${base}"/>${shapes}</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
