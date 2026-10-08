// Fetches the area around the skate park from OpenStreetMap and writes
// simplified SVG geometry to src/map-data.json. Run by hand (`npm run map`)
// when the map needs refreshing; the output is committed.
import { writeFile } from "node:fs/promises";
import { PIN } from "../src/site.js";

const SERVERS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const IDS = {
  coastline: 41032845,
  beaches: [330715021, 512502636],
  carpark: 510794126,
  aisles: [764028671, 764028672, 764028673, 764028674],
  skate: 1127319178,
  dog: 1127319177,
  road: [535304020, 577814974, 1212490885, 577814973, 1385739332, 55528212],
  promenade: 344988911,
  footways: [1381917565, 1381917566],
};

// Window in metres around the pin: x grows east, y grows south.
const X0 = -90, X1 = 240, Y0 = -75, Y1 = 150;
const W = 660;
const S = W / (X1 - X0);
const H = Math.round((Y1 - Y0) * S);
const K = Math.cos((PIN.lat * Math.PI) / 180) * 111320;

const project = ({ lat, lon }) => [
  +(((lon - PIN.lon) * K - X0) * S).toFixed(1),
  +((-(lat - PIN.lat) * 110540 - Y0) * S).toFixed(1),
];
const metres = ([x, y]) => [+((x - X0) * S).toFixed(1), +((y - Y0) * S).toFixed(1)];
const d = (pts, close) => "M" + pts.map((p) => p.join(" ")).join(" L") + (close ? " Z" : "");

const query = `[out:json][timeout:50];way(around:300,${PIN.lat},${PIN.lon});out geom tags;`;

let data;
for (const url of SERVERS) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "User-Agent": "juggling.cy map builder", Accept: "application/json" },
      body: new URLSearchParams({ data: query }),
    });
    if (res.ok) { data = await res.json(); break; }
  } catch {}
}
if (!data) throw new Error("No Overpass server answered");

const ways = new Map(data.elements.map((e) => [e.id, e]));
const pts = (id) => ways.get(id).geometry.map(project);

// The coastline is one long way; keep the part near the window and close it
// off along the east edge, where the sea is.
const coast = pts(IDS.coastline)
  .filter(([, y]) => y > -80 && y < H + 80)
  .sort((a, b) => a[1] - b[1]);
const sea = [[coast[0][0], -10], ...coast, [coast.at(-1)[0], H + 10], [W + 10, H + 10], [W + 10, -10]];

const map = {
  width: W,
  height: H,
  sea: d(sea, true),
  beaches: IDS.beaches.map((id) => d(pts(id), true)),
  carpark: d(pts(IDS.carpark), true),
  aisles: IDS.aisles.map((id) => d(pts(id))),
  skate: d(pts(IDS.skate), true),
  dog: d(pts(IDS.dog), true),
  road: d(IDS.road.flatMap(pts)),
  promenade: d(pts(IDS.promenade)),
  footways: IDS.footways.map((id) => d(pts(id))),
  // Walk from the seafront road, through the car park's middle aisle, to the
  // skate park gate.
  walk: d([metres([103, 43]), metres([12, 43]), metres([3, 30])]),
  pin: project(PIN),
  labels: {
    road: metres([118, -40]),
    carpark: metres([50, 90]),
    skate: metres([-35, 26]),
    dog: metres([-34, 88]),
    beach: metres([182, 110]),
    sea: metres([214, -30]),
  },
};

await writeFile(new URL("../src/map-data.json", import.meta.url), JSON.stringify(map, null, 1) + "\n");
console.log(`map-data.json written (${W}×${H})`);
