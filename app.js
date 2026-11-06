(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmtDay = new Intl.DateTimeFormat("en-US", { weekday: "short", day: "numeric", month: "short" });
  const fmtMonth = new Intl.DateTimeFormat("en-US", { month: "short" });
  const fmtTime = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
  const fmtLong = new Intl.DateTimeFormat("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const money = (n) => (n === 0 ? "Free" : "₹" + n.toLocaleString("en-IN"));
  const categoryLabel = (id) => (CATEGORIES.find((c) => c.id === id) || {}).label || id;
  const byId = (id) => EVENTS.find((e) => e.id === id);

  const ICON = {
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.5" fill="currentColor"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  };

  const STORE_KEY = "cg.registrations";
  let registrations = loadRegistrations();
  const filters = { query: "", category: "all" };

  function loadRegistrations() {
    try {
      const data = JSON.parse(localStorage.getItem(STORE_KEY));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
  function saveRegistrations() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(registrations)); } catch { /* storage unavailable: keep in memory */ }
  }

  const upcoming = () => EVENTS.filter((e) => e.start > new Date()).sort((a, b) => a.start - b.start);
  const spotsLeft = (ev) =>
    Math.max(0, ev.capacity - ev.registered - registrations.filter((r) => r.eventId === ev.id).length);
  const isRegistered = (eventId, email) =>
    registrations.some((r) => r.eventId === eventId && r.email.toLowerCase() === email.toLowerCase());

  function spotsLabel(ev) {
    const n = spotsLeft(ev);
    if (n === 0) return { text: "Sold out", cls: "full" };
    if (n <= 10) return { text: `Only ${n} spots left`, cls: "low" };
    return { text: `${n} spots left`, cls: "" };
  }

  function countdownHTML(ts) {
    return `<div class="countdown" data-countdown="${ts}" role="timer" aria-label="Time until event starts">
      <div><b data-u="d">0</b><span>days</span></div>
      <div><b data-u="h">0</b><span>hours</span></div>
      <div><b data-u="m">0</b><span>mins</span></div>
      <div><b data-u="s">0</b><span>secs</span></div>
    </div>`;
  }
  function tickCountdowns() {
    $$("[data-countdown]").forEach((el) => {
      const diff = Math.max(0, Number(el.dataset.countdown) - Date.now());
      const parts = {
        d: Math.floor(diff / 864e5),
        h: Math.floor((diff % 864e5) / 36e5),
        m: Math.floor((diff % 36e5) / 6e4),
        s: Math.floor((diff % 6e4) / 1e3),
      };
      for (const [u, v] of Object.entries(parts)) {
        const node = $(`[data-u="${u}"]`, el);
        const text = u === "d" ? String(v) : String(v).padStart(2, "0");
        if (node && node.textContent !== text) node.textContent = text;
      }
    });
  }

  function cardHTML(ev) {
    const spots = spotsLabel(ev);
    const soldOut = spotsLeft(ev) === 0;
    const src = ev.image || eventArt(ev);
    return `
    <article class="card" data-id="${ev.id}">
      <button class="card-media" type="button" data-open="${ev.id}" aria-label="View details for ${esc(ev.title)}">
        <img src="${src}" alt="" loading="lazy" width="600" height="400" />
        <span class="date-badge"><b>${ev.start.getDate()}</b><span>${fmtMonth.format(ev.start)}</span></span>
        <span class="tag">${esc(categoryLabel(ev.category))}</span>
      </button>
      <div class="card-body">
        <h3>${esc(ev.title)}</h3>
        <p class="tagline">${esc(ev.tagline)}</p>
        <ul class="card-meta">
          <li>${ICON.clock}<span>${fmtDay.format(ev.start)}, ${fmtTime.format(ev.start)}</span></li>
          <li>${ICON.pin}<span>${esc(ev.venue)}</span></li>
        </ul>
        <div class="card-foot">
          <div>
            <div class="price">${money(ev.price)}</div>
            <div class="spots ${spots.cls}">${spots.text}</div>
          </div>
          <div class="card-actions">
            <button class="btn btn-ghost btn-sm" type="button" data-open="${ev.id}">Details</button>
            <button class="btn btn-primary btn-sm" type="button" data-register="${ev.id}" ${soldOut ? "disabled" : ""}>${soldOut ? "Sold out" : "Register"}</button>
          </div>
        </div>
      </div>
    </article>`;
  }

  function renderHero() {
    const next = upcoming().find((e) => spotsLeft(e) > 0) || upcoming()[0];
    const box = $("#hero-next");
    if (!next) {
      box.innerHTML = `<p class="label">No upcoming events</p><h2>New dates are on the way</h2><p class="meta">Check back soon.</p>`;
      return;
    }
    box.innerHTML = `
      <p class="label">Next up</p>
      <h2>${esc(next.title)}</h2>
      <p class="meta">${fmtDay.format(next.start)}, ${fmtTime.format(next.start)} · ${esc(next.venue)}</p>
      ${countdownHTML(next.start.getTime())}
      <button class="btn btn-primary btn-block" type="button" data-register="${next.id}">Save my seat</button>`;
    tickCountdowns();
  }

  function renderFeatured() {
    const list = upcoming().filter((e) => e.featured).slice(0, 3);
    $("#featured-grid").innerHTML = list.map(cardHTML).join("");
  }

  function matches(ev) {
    const q = filters.query.trim().toLowerCase();
    const inCategory = filters.category === "all" || ev.category === filters.category;
    if (!inCategory) return false;
    if (!q) return true;
    return [ev.title, ev.tagline, ev.venue, ev.host, categoryLabel(ev.category)].join(" ").toLowerCase().includes(q);
  }

  function renderGrid() {
    const all = upcoming();
    const list = all.filter(matches);
    $("#result-count").textContent = `Showing ${list.length} of ${all.length} events`;
    $("#events-grid").innerHTML = list.length
      ? list.map(cardHTML).join("")
      : `<div class="empty">
           <h3>No events match your search</h3>
           <p>Try a different word or clear the filters to see everything.</p>
           <button class="btn btn-ghost" type="button" data-reset>Clear filters</button>
         </div>`;
  }

  function renderChips() {
    const all = upcoming();
    const chip = (id, label, count) =>
      `<button class="chip" type="button" data-cat="${id}" aria-pressed="${filters.category === id}">${label}<small>${count}</small></button>`;
    $("#chips").innerHTML =
      chip("all", "All", all.length) +
      CATEGORIES.map((c) => chip(c.id, c.label, all.filter((e) => e.category === c.id).length)).join("");
  }

  function renderSelect(selected = "") {
    const sel = $("#f-event");
    sel.innerHTML =
      `<option value="">Choose an event</option>` +
      upcoming()
        .map((e) => {
          const full = spotsLeft(e) === 0;
          return `<option value="${e.id}" ${full ? "disabled" : ""}>${esc(e.title)} (${fmtDay.format(e.start)})${full ? " - sold out" : ""}</option>`;
        })
        .join("");
    sel.value = selected;
  }

  function renderSummary() {
    const ev = byId($("#f-event").value);
    const box = $("#reg-summary");
    if (!ev) {
      box.innerHTML = `<div class="summary-empty"><p>Choose an event to see its date, venue and price here.</p></div>`;
      return;
    }
    const spots = spotsLabel(ev);
    box.innerHTML = `
      <div class="summary-card">
        <img src="${ev.image || eventArt(ev)}" alt="" />
        <div class="body">
          <h3>${esc(ev.title)}</h3>
          <p class="spots ${spots.cls}">${spots.text}</p>
          <dl>
            <dt>Date</dt><dd>${fmtLong.format(ev.start)}</dd>
            <dt>Time</dt><dd>${fmtTime.format(ev.start)}</dd>
            <dt>Venue</dt><dd>${esc(ev.venue)}</dd>
            <dt>Price</dt><dd>${money(ev.price)}</dd>
          </dl>
        </div>
      </div>`;
  }

  function renderMine() {
    const badge = $("#reg-count");
    badge.textContent = registrations.length;
    badge.hidden = registrations.length === 0;

    const list = $("#mine-list");
    if (!registrations.length) {
      list.innerHTML = `<div class="empty"><h3>No registrations yet</h3><p>When you save a seat, it will show up here.</p><a class="btn btn-primary" href="#events">Find an event</a></div>`;
      return;
    }
    list.innerHTML = registrations
      .slice()
      .sort((a, b) => (byId(a.eventId)?.start || 0) - (byId(b.eventId)?.start || 0))
      .map((r) => {
        const ev = byId(r.eventId);
        if (!ev) return "";
        return `<div class="mine-item">
          <div>
            <h3>${esc(ev.title)}</h3>
            <p>${fmtDay.format(ev.start)}, ${fmtTime.format(ev.start)} · ${esc(ev.venue)}</p>
            <p>${esc(r.name)} · Ref ${esc(r.id)}</p>
          </div>
          <div class="actions">
            <button class="btn btn-ghost btn-sm" type="button" data-ics="${r.id}">Add to calendar</button>
            <button class="btn btn-danger btn-sm" type="button" data-cancel="${r.id}">Cancel</button>
          </div>
        </div>`;
      })
      .join("");
  }

  function renderAll() {
    renderHero();
    renderFeatured();
    renderChips();
    renderGrid();
    renderMine();
  }

  const dialog = $("#detail");

  function openDetail(id) {
    const ev = byId(id);
    if (!ev) return;
    const spots = spotsLabel(ev);
    const soldOut = spotsLeft(ev) === 0;
    const end = new Date(ev.start.getTime() + ev.durationMin * 60000);
    $("#detail-body").innerHTML = `
      <div class="detail-media">
        <img src="${ev.image || eventArt(ev)}" alt="" />
        <button class="icon-btn close-btn" type="button" data-close aria-label="Close details">${ICON.close}</button>
      </div>
      <div class="detail-content">
        <p class="detail-cat">${esc(categoryLabel(ev.category))}</p>
        <h2 id="detail-title">${esc(ev.title)}</h2>
        <p>${esc(ev.description)}</p>
        <dl class="detail-facts">
          <div><dt>Date</dt><dd>${fmtLong.format(ev.start)}</dd></div>
          <div><dt>Time</dt><dd>${fmtTime.format(ev.start)} to ${end.toDateString() === ev.start.toDateString() ? fmtTime.format(end) : fmtDay.format(end) + ", " + fmtTime.format(end)}</dd></div>
          <div><dt>Venue</dt><dd>${esc(ev.venue)}</dd></div>
          <div><dt>Hosted by</dt><dd>${esc(ev.host)}</dd></div>
          <div><dt>Price</dt><dd>${money(ev.price)}</dd></div>
          <div><dt>Availability</dt><dd class="spots ${spots.cls}">${spots.text}</dd></div>
        </dl>
        <h3>Starts in</h3>
        ${countdownHTML(ev.start.getTime())}
        <h3>Agenda</h3>
        <ul class="agenda">${ev.agenda.map((a) => `<li><b>${esc(a.time)}</b><span>${esc(a.item)}</span></li>`).join("")}</ul>
        <div class="detail-actions">
          <button class="btn btn-primary" type="button" data-register="${ev.id}" ${soldOut ? "disabled" : ""}>${soldOut ? "Sold out" : "Register for this event"}</button>
          <button class="btn btn-ghost" type="button" data-close>Close</button>
        </div>
      </div>`;
    tickCountdowns();
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("modal-open");
    history.replaceState(null, "", "#event-" + id);
  }

  function closeDetail() {
    if (dialog.open) dialog.close();
  }
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    if (location.hash.startsWith("#event-")) history.replaceState(null, "", location.pathname + location.search);
  });
  dialog.addEventListener("click", (e) => {
    const r = dialog.getBoundingClientRect();
    const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if (outside) closeDetail();
  });

  const form = $("#reg-form");
  const confirmation = $("#confirmation");
  const fields = {
    name: $("#f-name"),
    email: $("#f-email"),
    phone: $("#f-phone"),
    event: $("#f-event"),
  };

  const validators = {
    name(v) {
      v = v.trim();
      if (!v) return "Enter your full name.";
      if (v.length < 2) return "Your name needs at least 2 characters.";
      if (v.length > 60) return "Keep your name under 60 characters.";
      if (!/^[\p{L}][\p{L}\p{M}\s.'-]*$/u.test(v)) return "Use letters only. Spaces, hyphens and apostrophes are fine.";
      return "";
    },
    email(v) {
      v = v.trim();
      if (!v) return "Enter your email address.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email, like name@example.com.";
      return "";
    },
    phone(v) {
      const digits = v.replace(/[\s\-().]/g, "");
      if (!digits) return "Enter your phone number.";
      if (!/^\+?\d{10,14}$/.test(digits)) return "Enter 10 to 14 digits, for example +91 98765 43210.";
      return "";
    },
    event(v) {
      if (!v) return "Choose the event you want to attend.";
      const ev = byId(v);
      if (!ev) return "That event is no longer available.";
      if (spotsLeft(ev) === 0) return "This event is sold out. Pick another one.";
      return "";
    },
  };

  function validateField(name) {
    const input = fields[name];
    let msg = validators[name](input.value);
    if (!msg && (name === "email" || name === "event") && fields.email.value && fields.event.value && !validators.email(fields.email.value)) {
      if (isRegistered(fields.event.value, fields.email.value.trim())) {
        msg = "This email is already registered for this event.";
        if (name === "event") { msg = ""; setError("email", "This email is already registered for this event."); return false; }
      }
    }
    setError(name, msg);
    return !msg;
  }

  function setError(name, msg) {
    const input = fields[name];
    const wrap = input.closest(".field");
    $("#e-" + name).textContent = msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    wrap.classList.toggle("valid", !msg && input.value.trim() !== "");
  }

  Object.keys(fields).forEach((name) => {
    fields[name].addEventListener("blur", () => validateField(name));
    fields[name].addEventListener("input", () => {
      if (fields[name].getAttribute("aria-invalid") === "true") validateField(name);
    });
  });
  fields.event.addEventListener("change", () => {
    validateField("event");
    if (fields.email.value) validateField("email");
    renderSummary();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const results = Object.keys(fields).map((n) => [n, validateField(n)]);
    const firstBad = results.find(([, ok]) => !ok);
    if (firstBad) {
      fields[firstBad[0]].focus();
      return;
    }
    const reg = {
      id: "CG-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      eventId: fields.event.value,
      name: fields.name.value.trim().replace(/\s+/g, " "),
      email: fields.email.value.trim().toLowerCase(),
      phone: fields.phone.value.trim(),
      at: new Date().toISOString(),
    };
    registrations.push(reg);
    saveRegistrations();
    showConfirmation(reg);
    renderAll();
    renderSelect();
    renderSummary();
  });

  function showConfirmation(reg) {
    const ev = byId(reg.eventId);
    form.hidden = true;
    confirmation.hidden = false;
    confirmation.innerHTML = `
      <div class="check">${ICON.check}</div>
      <h3>You're in, ${esc(reg.name.split(" ")[0])}.</h3>
      <p>Your seat for <strong>${esc(ev.title)}</strong> is saved for ${fmtLong.format(ev.start)} at ${fmtTime.format(ev.start)}, ${esc(ev.venue)}.</p>
      <span class="ref">Ref ${esc(reg.id)}</span>
      <p>Keep this reference. Your registration is stored in this browser and listed under My registrations.</p>
      <div class="actions">
        <button class="btn btn-primary" type="button" data-ics="${reg.id}">Add to calendar</button>
        <button class="btn btn-ghost" type="button" data-another>Register for another event</button>
      </div>`;
    confirmation.focus();
  }

  function resetForm() {
    form.reset();
    Object.keys(fields).forEach((n) => {
      fields[n].setAttribute("aria-invalid", "false");
      fields[n].closest(".field").classList.remove("valid");
      $("#e-" + n).textContent = "";
    });
    confirmation.hidden = true;
    form.hidden = false;
    renderSelect();
    renderSummary();
  }

  function startRegistration(id) {
    closeDetail();
    if (!confirmation.hidden) resetForm();
    renderSelect(id);
    renderSummary();
    $("#register").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => fields.name.focus({ preventScroll: true }), 450);
  }

  function downloadICS(regId) {
    const reg = registrations.find((r) => r.id === regId);
    const ev = reg && byId(reg.eventId);
    if (!ev) return;
    const stamp = (d) =>
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;
    const end = new Date(ev.start.getTime() + ev.durationMin * 60000);
    const lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Common Ground Events//EN", "BEGIN:VEVENT",
      `UID:${reg.id}@commonground.events`, `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(ev.start)}`, `DTEND:${stamp(end)}`,
      `SUMMARY:${ev.title}`, `LOCATION:${ev.venue}`, `DESCRIPTION:${ev.tagline} (Ref ${reg.id})`,
      "END:VEVENT", "END:VCALENDAR",
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${ev.id}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-open],[data-register],[data-cat],[data-reset],[data-close],[data-ics],[data-cancel],[data-another]");
    if (!t) return;
    if (t.dataset.open) openDetail(t.dataset.open);
    else if (t.dataset.register) startRegistration(t.dataset.register);
    else if (t.dataset.cat) { filters.category = t.dataset.cat; renderChips(); renderGrid(); }
    else if (t.hasAttribute("data-reset")) {
      filters.query = ""; filters.category = "all"; $("#search").value = ""; renderChips(); renderGrid();
    }
    else if (t.hasAttribute("data-close")) closeDetail();
    else if (t.dataset.ics) downloadICS(t.dataset.ics);
    else if (t.hasAttribute("data-another")) { resetForm(); $("#register").scrollIntoView({ behavior: "smooth" }); }
    else if (t.dataset.cancel) {
      const reg = registrations.find((r) => r.id === t.dataset.cancel);
      if (reg && confirm("Cancel your registration for " + (byId(reg.eventId)?.title || "this event") + "?")) {
        registrations = registrations.filter((r) => r.id !== reg.id);
        saveRegistrations();
        renderAll();
        renderSelect(fields.event.value);
        renderSummary();
        toast("Registration cancelled. Your seat is back in the pool.");
      }
    }
  });

  $("#search").addEventListener("input", (e) => { filters.query = e.target.value; renderGrid(); });

  const themeBtn = $("#theme-toggle");
  function syncThemeLabel() {
    const dark = document.documentElement.dataset.theme === "dark";
    themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }
  themeBtn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("cg.theme", next); } catch {}
    syncThemeLabel();
  });
  syncThemeLabel();

  const menuBtn = $("#menu-toggle");
  const nav = $("#site-nav");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  renderAll();
  renderSelect();
  renderSummary();
  setInterval(tickCountdowns, 1000);

  if (location.hash.startsWith("#event-")) openDetail(location.hash.replace("#event-", ""));
})();
