import { ballPosition, BOUNDS, BALL_R } from "./badge.js";
import { TZ, START_HOUR } from "./site.js";

const T = JSON.parse(document.getElementById("i18n").textContent);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} },
};

// ---------- Language choice ----------

for (const link of document.querySelectorAll(".switcher a[data-lang]")) {
  link.addEventListener("click", () => store.set("jc-lang", link.dataset.lang));
}

// ---------- Countdown to the next Tuesday session ----------

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const TUESDAY = 2;
const wallClock = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ, weekday: "short", year: "numeric", month: "numeric",
  day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23",
});

function wall(date) {
  const p = {};
  for (const { type, value } of wallClock.formatToParts(date)) p[type] = value;
  return {
    weekday: WEEKDAYS[p.weekday], year: +p.year, month: +p.month, day: +p.day,
    hour: +p.hour, minute: +p.minute, second: +p.second,
  };
}
// Milliseconds the Cyprus wall clock is ahead of UTC at a given instant.
function offset(date) {
  const w = wall(date);
  return Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second) - Math.floor(date / 1000) * 1000;
}

function nextSession(now) {
  const w = wall(now);
  if (w.weekday === TUESDAY && w.hour >= START_HOUR) return { on: true };
  const days = (TUESDAY - w.weekday + 7) % 7;
  const local = Date.UTC(w.year, w.month - 1, w.day + days, START_HOUR);
  // Correct for a daylight-saving change between now and then.
  const at = new Date(local - offset(new Date(local - offset(now))));
  return { on: false, today: days === 0, at };
}

const units = Object.fromEntries(
  ["day", "hour", "minute"].map((u) => [u, new Intl.NumberFormat(T.locale, { style: "unit", unit: u, unitDisplay: "short" })])
);
const dateFormat = new Intl.DateTimeFormat(T.locale, { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });

function duration(ms) {
  const mins = Math.max(1, Math.ceil(ms / 60000));
  const d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60), m = mins % 60;
  if (d) return [units.day.format(d), h && units.hour.format(h)].filter(Boolean).join(" ");
  if (h) return [units.hour.format(h), m && units.minute.format(m)].filter(Boolean).join(" ");
  return units.minute.format(m);
}

const countdown = document.querySelector("[data-countdown]");
function tick() {
  const now = new Date();
  const next = nextSession(now);
  let text, state;
  if (next.on) {
    text = T.countdown.on;
    state = "on";
  } else {
    const time = duration(next.at - now);
    text = next.today
      ? T.countdown.today.replace("{time}", time)
      : T.countdown.next.replace("{date}", dateFormat.format(next.at)).replace("{time}", time);
    state = next.today ? "today" : "next";
  }
  countdown.querySelector("[data-countdown-text]").textContent = text;
  countdown.dataset.state = state;
}
if (countdown) {
  tick();
  setInterval(tick, 30_000);
  document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && tick());
}

// ---------- The badge: rotating ring and throwable balls ----------

const stage = document.querySelector(".stage");
const svg = stage?.querySelector(".badge-svg");

if (svg) {
  const SVGNS = "http://www.w3.org/2000/svg";
  const island = svg.querySelector(".island");
  const ring = svg.querySelector(".ring");
  const toggle = stage.querySelector("[data-motion]");

  const GRAVITY = 1100;  // island units / s²
  const BOUNCE = 0.72;
  const FREE_FOR = 1.6;  // seconds a thrown ball flies before rejoining
  const REJOIN = 0.55;   // seconds to glide back into the pattern
  const R = BOUNDS.r - BALL_R;

  let playing = !reducedMotion && store.get("jc-motion") !== "off";
  let clock = 0;          // pattern time, frozen while paused
  let spin = 0;           // idle ring rotation in degrees
  let visible = true;
  let last = 0;
  let frame = 0;

  const balls = [...svg.querySelectorAll(".ball")].map((el, i) => {
    const hit = document.createElementNS(SVGNS, "circle");
    hit.setAttribute("r", String(BALL_R * 2.3));
    hit.setAttribute("class", "ball-hit");
    el.append(hit);
    const [x, y] = ballPosition(clock, i);
    return { el, i, mode: "loop", x, y, vx: 0, vy: 0, t: 0, from: null, pointer: null };
  });

  const toIsland = (e) => new DOMPoint(e.clientX, e.clientY).matrixTransform(island.getScreenCTM().inverse());
  const place = (b) => b.el.setAttribute("transform", `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`);

  function setPlaying(on) {
    playing = on;
    stage.classList.toggle("paused", !on);
    toggle.setAttribute("aria-label", on ? T.pause : T.play);
    store.set("jc-motion", on ? "on" : "off");
    wake();
  }
  stage.classList.toggle("paused", !playing);
  toggle.setAttribute("aria-label", playing ? T.pause : T.play);
  toggle.addEventListener("click", () => setPlaying(!playing));

  function step(dt) {
    if (playing) {
      clock += dt;
      spin = (spin + dt * 5) % 360;
    }
    for (const b of balls) {
      if (b.mode === "loop") {
        [b.x, b.y] = ballPosition(clock, b.i);
      } else if (b.mode === "free") {
        b.t += dt;
        b.vy += GRAVITY * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        // Bounce off the inside of the badge.
        const dx = b.x - BOUNDS.cx, dy = b.y - BOUNDS.cy, d = Math.hypot(dx, dy);
        if (d > R) {
          const nx = dx / d, ny = dy / d, dot = b.vx * nx + b.vy * ny;
          if (dot > 0) {
            b.vx -= (1 + BOUNCE) * dot * nx;
            b.vy -= (1 + BOUNCE) * dot * ny;
          }
          b.x = BOUNDS.cx + nx * R;
          b.y = BOUNDS.cy + ny * R;
        }
        if (b.t > FREE_FOR) Object.assign(b, { mode: "rejoin", t: 0, from: [b.x, b.y] });
      } else if (b.mode === "rejoin") {
        b.t += dt;
        const k = Math.min(1, b.t / REJOIN), e = k * k * (3 - 2 * k);
        const [tx, ty] = ballPosition(clock, b.i);
        b.x = b.from[0] + (tx - b.from[0]) * e;
        b.y = b.from[1] + (ty - b.from[1]) * e;
        if (k === 1) b.mode = "loop";
      }
      place(b);
    }
    const angle = reducedMotion ? 0 : spin + scrollY * 0.12;
    ring.setAttribute("transform", `rotate(${angle.toFixed(2)} 200 200)`);
  }

  // Run only while something moves and the badge is on screen.
  const busy = () => visible && (playing || balls.some((b) => b.mode !== "loop"));
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    step(dt);
    frame = busy() ? requestAnimationFrame(loop) : 0;
  }
  function wake() {
    if (!frame && busy()) {
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    wake();
  }).observe(stage);

  for (const b of balls) {
    b.el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      try { b.el.setPointerCapture(e.pointerId); } catch {}
      b.el.classList.add("held");
      stage.classList.add("touched");
      const p = toIsland(e);
      b.pointer = { id: e.pointerId, start: performance.now(), sx: p.x, sy: p.y, lx: p.x, ly: p.y, lt: performance.now() };
      Object.assign(b, { mode: "held", x: p.x, y: p.y, vx: 0, vy: 0 });
      place(b);
      wake();
    });
    b.el.addEventListener("pointermove", (e) => {
      if (b.mode !== "held" || b.pointer?.id !== e.pointerId) return;
      const p = toIsland(e), now = performance.now();
      const dt = Math.max(0.008, (now - b.pointer.lt) / 1000);
      // Smoothed release velocity.
      b.vx = b.vx * 0.4 + ((p.x - b.pointer.lx) / dt) * 0.6;
      b.vy = b.vy * 0.4 + ((p.y - b.pointer.ly) / dt) * 0.6;
      Object.assign(b.pointer, { lx: p.x, ly: p.y, lt: now });
      b.x = p.x;
      b.y = p.y;
      place(b);
    });
    const release = (e) => {
      if (b.mode !== "held" || b.pointer?.id !== e.pointerId) return;
      b.el.classList.remove("held");
      const moved = Math.hypot(b.x - b.pointer.sx, b.y - b.pointer.sy);
      const tap = moved < 6 && performance.now() - b.pointer.start < 300;
      if (tap) {
        // A tap pops the ball straight up.
        b.vx = (Math.random() - 0.5) * 260;
        b.vy = -720;
      }
      const speed = Math.hypot(b.vx, b.vy), max = 2400;
      if (speed > max) { b.vx *= max / speed; b.vy *= max / speed; }
      Object.assign(b, { mode: "free", t: 0, pointer: null });
      wake();
    };
    b.el.addEventListener("pointerup", release);
    b.el.addEventListener("pointercancel", release);
  }

  step(0);
  wake();
}

// ---------- Reveal sections as they scroll in ----------

const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reducedMotion) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

// ---------- Copy coordinates ----------

for (const button of document.querySelectorAll("[data-copy]")) {
  const label = button.textContent;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.textContent = T.copied;
      button.classList.add("done");
      setTimeout(() => {
        button.textContent = label;
        button.classList.remove("done");
      }, 2000);
    } catch {}
  });
}
