// Rough POC quoting engine. Runs in the browser (client proposal page) and in Node (agent door).
// Everything here is illustrative: one fictional venue, hard-coded rules, naive parsing.

export const VENUE = {
  name: "Alder & Vine",
  room: "The Back Room",
  neighborhood: "Lower East Side, NYC",
  capacity: { seated: 48, standing: 70 },
  menus: [
    { id: "family", name: "Family-style", perHead: 85, blurb: "Shared plates down the table. Three mains, four sides, dessert." },
    { id: "plated", name: "Three-course plated", perHead: 110, blurb: "Choice of two per course, pre-selected. Bread service, coffee." },
    { id: "tasting", name: "Chef's tasting", perHead: 165, blurb: "Six courses, single menu, kitchen's call. 42 seats max." , maxGuests: 42 },
  ],
  beverage: [
    { id: "consumption", name: "Bar on consumption", perHead: 0, blurb: "Billed as poured; estimate shown, not committed." , estimatePerHead: 38 },
    { id: "beerwine", name: "Beer & wine, 3 hours", perHead: 45, blurb: "House selections, two reds, two whites, sparkling." },
    { id: "fullbar", name: "Full bar, 3 hours", perHead: 65, blurb: "Spirits, two signature cocktails, beer, wine." },
    { id: "pairing", name: "Wine pairing", perHead: 75, blurb: "One pour per course, sommelier-led.", requires: ["plated", "tasting"] },
  ],
  addons: [
    { id: "av", name: "Screen + AV", flat: 250 },
    { id: "cake", name: "Custom cake", perHead: 8 },
    { id: "flowers", name: "Table florals", flat: 350 },
    { id: "extend", name: "Extend by one hour", flat: 600 },
    { id: "printed", name: "Printed menus + place cards", perHead: 3 },
  ],
  // Food & beverage minimums, before service and tax.
  minimums: { friSat: 6000, sunThu: 3500, lunch: 2000 },
  roomFee: 500, // waived when the F&B minimum is met
  serviceRate: 0.2,
  taxRate: 0.08875,
  depositRate: 0.25,
  holdHours: 48,
  // Dates the room is already booked (YYYY-MM-DD). Rough demo data.
  blocked: ["2026-10-02", "2026-10-03", "2026-10-09", "2026-10-17", "2026-10-24", "2026-10-31"],
  // Above this pre-tax total the owner approves before a hold is confirmed.
  ownerApprovalAbove: 5000,
};

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Turn a messy free-text request into a structured one. Deliberately naive. */
const WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, "a couple of": 2, "a few": 3 };

export function parseRequest(text, today = new Date("2026-09-26T12:00:00")) {
  let t = text.toLowerCase();
  for (const [w, n] of Object.entries(WORDS)) t = t.replace(new RegExp(`\\b${w}\\b(?=\\s+(?:of them|are|guests|people|vegetarians?|vegans?|gluten|gf|nut|kosher|halal|dairy))`, "g"), String(n));
  const out = { raw: text, guests: null, budget: null, date: null, meal: "dinner", dietary: [], occasion: null, unknowns: [] };

  const g = t.match(/(?:for|party of|group of)\s+(\d{1,3})\b/) || t.match(/(\d{1,3})\s*(?:people|guests|ppl|pax|heads?|of us|persons?)\b/);
  if (g) out.guests = parseInt(g[1], 10);
  else out.unknowns.push("guests");

  const b = t.match(/\$\s?([\d,]+(?:\.\d+)?)\s*(k)?\b/)
    || t.match(/budget\s*(?:of|around|about|is|~)?\s*\$?([\d,]+(?:\.\d+)?)\s*(k)?\b/)
    || t.match(/\b([\d,]+(?:\.\d+)?)\s*(k)\s*(?:budget|total|all in|all-in|max|tops)?\b/);
  if (b) {
    let n = parseFloat(b[1].replace(/,/g, ""));
    if (b[2] === "k") n *= 1000;
    out.budget = n;
  }

  // Stated preferences win over the budget heuristic.
  out.prefs = {};
  if (/tasting/.test(t)) out.prefs.menu = "tasting";
  else if (/family[\s-]?style|shared plates/.test(t)) out.prefs.menu = "family";
  else if (/plated|three[\s-]course|3[\s-]course/.test(t)) out.prefs.menu = "plated";
  if (/pairing/.test(t)) out.prefs.beverage = "pairing";
  else if (/full bar|open bar|cocktails/.test(t)) out.prefs.beverage = "fullbar";
  else if (/beer (and|&|\+) wine|wine (and|&|\+) beer/.test(t)) out.prefs.beverage = "beerwine";
  else if (/on consumption|cash bar|drinks separate/.test(t)) out.prefs.beverage = "consumption";

  if (/\blunch\b|\bbrunch\b|\bnoon\b|\b1[12]\s*(am|pm)\b/.test(t)) out.meal = "lunch";

  const diet = [
    ["gluten-free", /gluten[\s-]?free|\bgf\b|celiac/], ["vegan", /\bvegan/], ["vegetarian", /\bvegetarian|\bveg\b/],
    ["nut allergy", /\bnut/], ["dairy-free", /dairy[\s-]?free|lactose/], ["kosher-style", /\bkosher/], ["halal", /\bhalal/], ["pescatarian", /pescatarian/],
  ];
  for (const [label, re] of diet) {
    const m = t.match(new RegExp(`(\\d{1,2})\\s*(?:x\\s*|of (?:them|us|whom)\\s*(?:are|is)?\\s*|are\\s*|guests?\\s*(?:are|who are)?\\s*)?(?:${re.source})`));
    if (re.test(t)) out.dietary.push({ label, count: m ? parseInt(m[1], 10) : null });
  }

  const occ = t.match(/birthday|anniversary|rehearsal|wedding|holiday party|offsite|off-site|team dinner|client dinner|launch|retirement|graduation|engagement/);
  if (occ) out.occasion = occ[0];

  out.date = parseDate(t, today);
  if (!out.date) out.unknowns.push("date");
  return out;
}

function parseDate(t, today) {
  const iso = t.match(/\b(20\d\d)-(\d\d)-(\d\d)\b/);
  if (iso) return iso[0];
  const md = t.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/);
  if (md) {
    const y = today.getFullYear();
    const d = new Date(y, MONTHS.indexOf(md[1]), parseInt(md[2], 10));
    if (d < today) d.setFullYear(y + 1);
    return ymd(d);
  }
  const slash = t.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (slash) {
    const y = slash[3] ? (slash[3].length === 2 ? 2000 + +slash[3] : +slash[3]) : today.getFullYear();
    const d = new Date(y, +slash[1] - 1, +slash[2]);
    if (!slash[3] && d < today) d.setFullYear(y + 1);
    return ymd(d);
  }
  const wd = t.match(/\b(next|this)?\s*(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  if (wd) {
    const target = WEEKDAYS.indexOf(wd[2]);
    const d = new Date(today);
    let delta = (target - d.getDay() + 7) % 7;
    if (delta === 0) delta = 7;
    if (wd[1] === "next" && delta < 7) delta += 7; // "next friday" = the one after this coming one
    d.setDate(d.getDate() + delta);
    return ymd(d);
  }
  if (/\btomorrow\b/.test(t)) { const d = new Date(today); d.setDate(d.getDate() + 1); return ymd(d); }
  return null;
}

export function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function fmtDate(s) {
  if (!s) return "date TBD";
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function isAvailable(date, venue = VENUE) {
  return !!date && !venue.blocked.includes(date);
}

export function alternatives(date, venue = VENUE, n = 2) {
  if (!date) return [];
  const [y, m, d] = date.split("-").map(Number);
  const base = new Date(y, m - 1, d);
  const out = [];
  for (let k = 1; k <= 8 && out.length < n; k++) {
    const c = new Date(base); c.setDate(base.getDate() + (k % 2 ? -1 : 1) * Math.ceil(k / 2)); // -1, +1, -2, +2 …
    const s = ymd(c);
    if (c > new Date("2026-09-26") && isAvailable(s, venue)) out.push(s);
  }
  // also the same weekday next week
  const nw = new Date(base); nw.setDate(base.getDate() + 7);
  if (isAvailable(ymd(nw), venue) && !out.includes(ymd(nw))) out.push(ymd(nw));
  return out.slice(0, n + 1);
}

function minimumFor(date, meal, venue) {
  if (meal === "lunch") return venue.minimums.lunch;
  if (!date) return venue.minimums.sunThu;
  const [y, m, d] = date.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day === 5 || day === 6 ? venue.minimums.friSat : venue.minimums.sunThu;
}

/** Pick the richest menu + beverage that fits the budget, else sensible defaults. */
export function recommend(req, venue = VENUE) {
  const guests = req.guests || 20;
  const prefs = req.prefs || {};
  const candidates = [];
  for (const menu of venue.menus) {
    if (menu.maxGuests && guests > menu.maxGuests && prefs.menu !== menu.id) continue;
    if (prefs.menu && prefs.menu !== menu.id) continue;
    for (const bev of venue.beverage) {
      if (bev.requires && !bev.requires.includes(menu.id)) continue;
      if (prefs.beverage && prefs.beverage !== bev.id) continue;
      const q = quote({ ...req, guests }, { menu: menu.id, beverage: bev.id, addons: [] }, venue);
      candidates.push({ menu: menu.id, beverage: bev.id, total: q.total, base: menu.perHead + (bev.perHead || bev.estimatePerHead) });
    }
  }
  // Richest first; when the room minimum makes totals tie, richer per-head still ranks first.
  candidates.sort((a, b) => b.total - a.total || b.base - a.base);
  if (!candidates.length) return { menu: "plated", beverage: "beerwine", fitsBudget: null };
  const stated = !!(prefs.menu || prefs.beverage);
  if (req.budget) {
    // Richest option inside the budget; otherwise the cheapest one that honours stated preferences.
    const fit = candidates.find((c) => c.total <= req.budget);
    if (fit) return { menu: fit.menu, beverage: fit.beverage, fitsBudget: true, stated };
    const cheapest = candidates[candidates.length - 1];
    return { menu: cheapest.menu, beverage: cheapest.beverage, fitsBudget: false, stated };
  }
  if (stated) { const c = candidates[0]; return { menu: c.menu, beverage: c.beverage, fitsBudget: null, stated }; }
  const def = candidates.find((c) => c.menu === "plated" && c.beverage === "beerwine") || candidates[0];
  return { menu: def.menu, beverage: def.beverage, fitsBudget: null, stated };
}

/** The proposal: line items, totals, minimum handling, deposit, hold, approval routing. */
export function quote(req, sel, venue = VENUE) {
  const guests = req.guests || 20;
  const menu = venue.menus.find((m) => m.id === sel.menu) || venue.menus[1];
  const bev = venue.beverage.find((b) => b.id === sel.beverage) || venue.beverage[0];
  const lines = [];
  const flags = [];

  lines.push({ label: `${menu.name} · ${guests} × $${menu.perHead}`, amount: menu.perHead * guests, kind: "food" });
  if (bev.perHead > 0) lines.push({ label: `${bev.name} · ${guests} × $${bev.perHead}`, amount: bev.perHead * guests, kind: "bev" });
  else lines.push({ label: `${bev.name} · est. ${guests} × $${bev.estimatePerHead}`, amount: bev.estimatePerHead * guests, kind: "bev", estimate: true });

  for (const id of sel.addons || []) {
    const a = venue.addons.find((x) => x.id === id);
    if (!a) continue;
    const amount = a.flat ?? a.perHead * guests;
    lines.push({ label: a.flat ? a.name : `${a.name} · ${guests} × $${a.perHead}`, amount, kind: "addon" });
  }

  const fb = lines.filter((l) => l.kind !== "addon").reduce((s, l) => s + l.amount, 0);
  const addons = lines.filter((l) => l.kind === "addon").reduce((s, l) => s + l.amount, 0);
  const minimum = minimumFor(req.date, req.meal, venue);
  let minimumShortfall = 0;
  if (fb < minimum) {
    minimumShortfall = minimum - fb;
    lines.push({ label: `Room minimum top-up (${req.meal === "lunch" ? "lunch" : "evening"} minimum $${minimum.toLocaleString()})`, amount: minimumShortfall, kind: "minimum" });
    flags.push({ level: "info", text: `Food & beverage comes to $${fb.toLocaleString()}, under the $${minimum.toLocaleString()} minimum for this slot. The difference is added as a top-up; adding guests or a beverage package usually clears it.` });
  } else {
    flags.push({ level: "ok", text: `Room fee waived — the $${minimum.toLocaleString()} minimum is met.` });
  }
  const subtotal = fb + addons + minimumShortfall;
  const service = Math.round(subtotal * venue.serviceRate);
  const tax = Math.round((subtotal + service) * venue.taxRate);
  const total = subtotal + service + tax;
  const deposit = Math.round(total * venue.depositRate);

  if (guests > venue.capacity.seated) flags.push({ level: "warn", text: `${guests} guests exceeds the room's ${venue.capacity.seated} seated. Standing reception up to ${venue.capacity.standing} is possible — this needs the owner.` });
  if (menu.maxGuests && guests > menu.maxGuests) flags.push({ level: "warn", text: `${menu.name} is capped at ${menu.maxGuests} guests.` });
  if (req.budget && total > req.budget) flags.push({ level: "warn", text: `Total is $${(total - req.budget).toLocaleString()} over the $${req.budget.toLocaleString()} budget mentioned.` });
  if (req.budget && total <= req.budget) flags.push({ level: "ok", text: `Fits the $${req.budget.toLocaleString()} budget with $${(req.budget - total).toLocaleString()} to spare.` });
  for (const d of req.dietary || []) flags.push({ level: "info", text: `${d.count ? d.count + " × " : ""}${d.label}: accommodated at no charge, noted for the kitchen.` });

  const available = isAvailable(req.date, venue);
  const needsOwner = subtotal > venue.ownerApprovalAbove || guests > venue.capacity.seated;

  return {
    venue: venue.name, room: venue.room, guests, date: req.date, available, alternatives: available ? [] : alternatives(req.date, venue),
    menu, beverage: bev, lines, fb, minimum, minimumShortfall, subtotal, service, tax, total, deposit,
    holdHours: venue.holdHours, needsOwner, flags,
  };
}

/** Agent-door shape: what an Instinct/Muse-style caller would send and get back. */
export function agentQuote(body, venue = VENUE) {
  const req = body.request_text ? parseRequest(body.request_text) : {
    guests: body.guests, budget: body.budget_usd ?? null, date: body.date ?? null, meal: body.meal ?? "dinner",
    dietary: (body.dietary || []).map((d) => (typeof d === "string" ? { label: d, count: null } : d)), occasion: body.occasion ?? null, unknowns: [],
  };
  const rec = recommend(req, venue);
  const q = quote(req, { menu: rec.menu, beverage: rec.beverage, addons: [] }, venue);
  return {
    protocol: "quote/0.1-draft",
    business: { name: venue.name, room: venue.room, location: venue.neighborhood },
    request: { guests: q.guests, date: q.date, meal: req.meal, budget_usd: req.budget, dietary: req.dietary.map((d) => d.label), unknowns: req.unknowns },
    availability: { date: q.date, available: q.available, alternatives: q.alternatives },
    offer: {
      offer_id: "off_" + Math.random().toString(36).slice(2, 10),
      menu: { id: q.menu.id, name: q.menu.name, per_head_usd: q.menu.perHead },
      beverage: { id: q.beverage.id, name: q.beverage.name, per_head_usd: q.beverage.perHead },
      lines: q.lines.map((l) => ({ label: l.label, amount_usd: l.amount, estimate: !!l.estimate })),
      subtotal_usd: q.subtotal, service_usd: q.service, tax_usd: q.tax, total_usd: q.total,
      fits_budget: rec.fitsBudget,
    },
    actions: {
      hold: { available: q.available, hold_hours: q.holdHours, deposit_usd: q.deposit, requires_owner_approval: q.needsOwner },
      alternatives_endpoint: "/api/quote (POST with a different date)",
    },
    notes: q.flags.map((f) => f.text),
  };
}
