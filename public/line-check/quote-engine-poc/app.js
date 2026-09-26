import { VENUE, parseRequest, recommend, quote, fmtDate, isAvailable } from "./engine.mjs";

const $ = (s, r = document) => r.querySelector(s);
const money = (n) => "$" + Math.round(n).toLocaleString();
// Local POC serves the agent door at /api/quote; the hosted copy sets the path in a meta tag.
const API = document.querySelector('meta[name="quote-api"]')?.content || "/api/quote";

// ---------- tabs ----------
const tabs = $("#tabs");
tabs.addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  show(b.dataset.view);
});
function show(v) {
  for (const b of tabs.querySelectorAll("button")) b.classList.toggle("on", b.dataset.view === v);
  for (const s of document.querySelectorAll(".view")) s.classList.toggle("on", s.id === "view-" + v);
  for (const id of ["client", "owner", "agent"]) $("#shape-" + id).classList.toggle("on", id === v);
  if (v === "owner") renderInbox();
}
show("client");

// ---------- 1 · client proposal ----------
let state = { req: null, sel: null, held: false };
const inbox = []; // proposals routed to the owner

$("#go").addEventListener("click", () => buildProposal($("#req").value));
$("#examples").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  $("#req").value = b.textContent; buildProposal(b.textContent);
});

function buildProposal(text) {
  const t0 = performance.now();
  const req = parseRequest(text);
  const rec = recommend(req);
  state = { req, sel: { menu: rec.menu, beverage: rec.beverage, addons: [] }, held: false, rec };
  renderParsed(req);
  renderProposal();
  $("#latency").textContent = `proposal in ${(performance.now() - t0).toFixed(0)} ms`;
}

function renderParsed(req) {
  const rows = [
    ["Guests", req.guests ?? `<span class="miss">not stated — assuming 20</span>`],
    ["Date", req.date ? fmtDate(req.date) : `<span class="miss">not stated</span>`],
    ["Meal", req.meal],
    ["Budget", req.budget ? money(req.budget) : "not stated"],
    ["Dietary", req.dietary.length ? req.dietary.map((d) => (d.count ? d.count + " × " : "") + d.label).join(", ") : "none mentioned"],
    ["Occasion", req.occasion ?? "—"],
  ];
  $("#parsed").innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
}

function renderProposal() {
  const { req, sel } = state;
  const q = quote(req, sel);
  const root = $("#proposal");
  if (state.held) { root.innerHTML = heldView(q); return; }

  const menuOpts = VENUE.menus.map((m) => {
    const off = m.maxGuests && q.guests > m.maxGuests;
    return `<div class="opt ${sel.menu === m.id ? "on" : ""} ${off ? "off" : ""}" data-menu="${m.id}">
      <b>${m.name}</b><span class="price">${money(m.perHead)} / guest</span><small>${m.blurb}</small></div>`;
  }).join("");
  const bevOpts = VENUE.beverage.map((b) => {
    const off = b.requires && !b.requires.includes(sel.menu);
    return `<div class="opt ${sel.beverage === b.id ? "on" : ""} ${off ? "off" : ""}" data-bev="${b.id}">
      <b>${b.name}</b><span class="price">${b.perHead ? money(b.perHead) + " / guest" : "est. " + money(b.estimatePerHead) + " / guest"}</span><small>${b.blurb}${off ? " Needs a plated or tasting menu." : ""}</small></div>`;
  }).join("");
  const addonOpts = VENUE.addons.map((a) => {
    const on = sel.addons.includes(a.id);
    return `<label class="${on ? "on" : ""}"><input type="checkbox" data-addon="${a.id}" ${on ? "checked" : ""}> ${a.name} <span class="mono" style="font-size:12px;color:var(--muted)">${a.flat ? money(a.flat) : money(a.perHead) + "/guest"}</span></label>`;
  }).join("");

  const lines = q.lines.map((l) => `<tr><td>${l.label}${l.estimate ? ` <span class="est">estimate</span>` : ""}</td><td>${money(l.amount)}</td></tr>`).join("");
  const flags = q.flags.map((f) => `<div class="flag ${f.level}">${f.text}</div>`).join("");

  const dateBlock = q.available
    ? `<div class="hold"><b>${fmtDate(q.date)}</b> · ${q.room} · ${q.guests} guests<br><span style="color:var(--ink-2)">Hold the date for ${q.holdHours} hours with a ${money(q.deposit)} deposit (25%). ${q.needsOwner ? "The owner confirms within the hour." : "Confirmed instantly."}</span></div>
       <button class="btn" id="hold">${q.needsOwner ? "Request hold + pay deposit" : "Hold the date + pay deposit"}</button>`
    : `<div class="hold"><b>${q.date ? fmtDate(q.date) : "No date yet"}</b> · ${q.date ? "The Back Room is booked that evening." : "Tell us a date to check the room."}
        ${q.alternatives.length ? `<div class="alts">Open nearby: ${q.alternatives.map((d) => `<button data-date="${d}">${fmtDate(d)}</button>`).join("")}</div>` : ""}</div>
       <button class="btn" disabled>Pick a date to hold</button>`;

  root.innerHTML = `
  <div class="proposal">
    <div class="head">
      <div><h2>Your proposal</h2><div class="sub">${req.occasion ? cap(req.occasion) + " · " : ""}${q.guests} guests · ${q.date ? fmtDate(q.date) : "date TBD"} · ${req.meal}</div></div>
      <div class="venue"><b>${VENUE.name}</b><br>${VENUE.room} · ${VENUE.neighborhood}<br>seats ${VENUE.capacity.seated} · standing ${VENUE.capacity.standing}</div>
    </div>
    <div class="sec"><h4>Guests</h4><div class="guests"><input type="number" id="guests" value="${q.guests}" min="2" max="90"> <span style="color:var(--ink-2);font-size:14px">Change it and everything reprices.</span></div></div>
    <div class="sec"><h4>Menu</h4><div class="opts" id="menus">${menuOpts}</div></div>
    <div class="sec"><h4>Drinks</h4><div class="opts" id="bevs">${bevOpts}</div></div>
    <div class="sec"><h4>Add-ons</h4><div class="addons" id="addons">${addonOpts}</div></div>
    <div class="sec"><h4>Price</h4>
      <table class="lines"><tbody>${lines}
        <tr class="sub"><td>Subtotal</td><td>${money(q.subtotal)}</td></tr>
        <tr class="sub"><td>Service 20%</td><td>${money(q.service)}</td></tr>
        <tr class="sub"><td>NYC sales tax 8.875%</td><td>${money(q.tax)}</td></tr>
        <tr class="tot"><td>Total</td><td>${money(q.total)}</td></tr>
      </tbody></table>
      <div class="flags">${flags}</div>
    </div>
    <div class="book">${dateBlock}</div>
  </div>`;

  // wire up
  $("#guests").addEventListener("change", (e) => { state.req = { ...state.req, guests: Math.max(2, +e.target.value || 2) }; renderProposal(); });
  $("#menus").addEventListener("click", (e) => {
    const o = e.target.closest(".opt"); if (!o || o.classList.contains("off")) return;
    state.sel.menu = o.dataset.menu;
    const bev = VENUE.beverage.find((b) => b.id === state.sel.beverage);
    if (bev?.requires && !bev.requires.includes(state.sel.menu)) state.sel.beverage = "beerwine";
    renderProposal();
  });
  $("#bevs").addEventListener("click", (e) => {
    const o = e.target.closest(".opt"); if (!o || o.classList.contains("off")) return;
    state.sel.beverage = o.dataset.bev; renderProposal();
  });
  $("#addons").addEventListener("change", (e) => {
    const id = e.target.dataset.addon; if (!id) return;
    state.sel.addons = e.target.checked ? [...state.sel.addons, id] : state.sel.addons.filter((x) => x !== id);
    renderProposal();
  });
  root.querySelectorAll(".alts button").forEach((b) => b.addEventListener("click", () => { state.req = { ...state.req, date: b.dataset.date }; renderProposal(); }));
  const hold = $("#hold");
  if (hold) hold.addEventListener("click", () => {
    state.held = true;
    inbox.unshift({ id: "p" + Date.now(), q, req: state.req, sel: { ...state.sel }, status: q.needsOwner ? "pending" : "auto", at: new Date() });
    renderProposal();
  });
}

function heldView(q) {
  return `<div class="proposal"><div class="done">
    <h3>${q.needsOwner ? "Hold requested" : "Date held"}</h3>
    <p>${fmtDate(q.date)} · ${q.guests} guests · ${q.menu.name} · ${money(q.total)} total</p>
    <p style="color:var(--ink-2)">${q.needsOwner
      ? `This one is above the venue's auto-approve threshold, so the owner confirms — usually within the hour. Your ${money(q.deposit)} deposit is authorized, not charged, until then.`
      : `Deposit of ${money(q.deposit)} received. You have the room. A draft event order with your dietary notes just went to the kitchen.`}</p>
    <p><button class="btn ghost small" id="again">Start another request</button> &nbsp; <button class="btn small" id="to-owner">See the owner's side →</button></p>
  </div></div>`;
}
document.addEventListener("click", (e) => {
  if (e.target.id === "again") { state.held = false; renderProposal(); }
  if (e.target.id === "to-owner") show("owner");
});

// ---------- 2 · owner inbox ----------
function seedInbox() {
  const mk = (text, sel, minutesAgo, status = "pending") => {
    const req = parseRequest(text); const r = recommend(req);
    const s = { menu: sel?.menu ?? r.menu, beverage: sel?.beverage ?? r.beverage, addons: sel?.addons ?? [] };
    const q = quote(req, s);
    return { id: "s" + minutesAgo, q, req, sel: s, status, at: new Date(Date.now() - minutesAgo * 60000) };
  };
  inbox.push(
    mk("Rehearsal dinner, 46 guests, Saturday Oct 17, want the tasting menu with pairing, budget 12k", { menu: "plated", beverage: "pairing", addons: ["flowers", "printed"] }, 14),
    mk("Holiday party for 60 people, Dec 11, full bar, ~$9,000", { menu: "family", beverage: "fullbar" }, 41),
    mk("Can we do something for 12 next Tuesday, around $1,500, one nut allergy", null, 63, "auto"),
    mk("Team offsite lunch for 18 on Oct 14, a few vegetarians, no set budget", null, 120, "auto"),
  );
}
seedInbox();

function renderInbox() {
  const pending = inbox.filter((p) => p.status === "pending").length;
  $("#inbox-count").textContent = `${pending} need you · ${inbox.length - pending} handled by the engine`;
  $("#inbox").innerHTML = inbox.map((p) => {
    const q = p.q;
    const why = p.status === "pending" ? (q.guests > VENUE.capacity.seated ? "over seated capacity" : "over $5K auto-approve") : null;
    const decided = p.status !== "pending";
    return `<li class="${decided ? "decided" : ""}" data-id="${p.id}">
      <div class="row"><b>${q.guests} guests · ${q.date ? fmtDate(q.date).replace(/,.*/, "") + " " + q.date.slice(5).replace("-", "/") : "date TBD"}</b><span class="amt">${money(q.total)}</span></div>
      <div class="meta">${q.menu.name} · ${q.beverage.name}${p.req.dietary.length ? " · " + p.req.dietary.map((d) => d.label).join(", ") : ""} · deposit ${money(q.deposit)}</div>
      ${why ? `<span class="why">needs you: ${why}</span>` : `<span class="stamp">${p.status === "auto" ? "auto-held · deposit link sent" : p.status === "approved" ? "approved · client notified · event order drafted" : p.status === "declined" ? "declined · client told, alternatives offered" : "sent back with changes"}</span>`}
      <div class="acts"><button class="ok" data-act="approved">Approve</button><button class="tweak" data-act="adjusted">Adjust</button><button class="no" data-act="declined">Decline</button></div>
    </li>`;
  }).join("");
}
$("#inbox").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-act]"); if (!b) return;
  const li = b.closest("li"); const p = inbox.find((x) => x.id === li.dataset.id);
  p.status = b.dataset.act; renderInbox();
});

// ---------- 3 · agent door ----------
$("#agent-go").addEventListener("click", () => runAgent($("#agent-req").value));
$("#agent-text").addEventListener("click", () => {
  const body = JSON.stringify({ agent: "muse/0.9", intent: "private_dining.quote", request_text: $("#req").value }, null, 2);
  $("#agent-req").value = body; runAgent(body);
});

async function runAgent(bodyText) {
  const t0 = performance.now();
  let body;
  try { body = JSON.parse(bodyText); } catch { $("#agent-res").textContent = "request is not valid JSON"; return; }
  const res = await fetch(API, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  $("#agent-res").textContent = JSON.stringify(data, null, 2);
  $("#agent-latency").textContent = `${res.status} in ${(performance.now() - t0).toFixed(0)} ms`;
  renderTranscript(body, data);
}

function renderTranscript(body, d) {
  const ask = body.request_text || `Find me a private room for ${body.guests} on ${body.date ? fmtDate(body.date) : "a date"}${body.budget_usd ? ", about " + money(body.budget_usd) : ""}.`;
  const o = d.offer; const a = d.actions?.hold;
  let reply;
  if (d.error) reply = "I couldn't get a quote from them — the request was malformed.";
  else if (!d.availability.available) reply = `${d.business.name} is booked that night. They have ${d.availability.alternatives.map(fmtDate).join(" or ")} open — want me to price one of those?`;
  else reply = `${d.business.name} can do it: ${o.menu.name.toLowerCase()} with ${o.beverage.name.toLowerCase()} for ${d.request.guests}, ${money(o.total_usd)} all-in${o.fits_budget === false ? " — that's over your budget, I can ask for the family-style option" : o.fits_budget ? ", inside your budget" : ""}. They'll hold it for ${a.hold_hours} hours with a ${money(a.deposit_usd)} deposit${a.requires_owner_approval ? "; the owner has to confirm first" : ", confirmed instantly"}. Want me to hold it?`;
  $("#transcript").innerHTML = `
    <div class="m u">${ask}</div>
    <div class="m a sys">→ POST ${location.host}${API} · ${d.protocol ?? "error"}</div>
    <div class="m a">${reply}</div>`;
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// boot
buildProposal($("#req").value);
