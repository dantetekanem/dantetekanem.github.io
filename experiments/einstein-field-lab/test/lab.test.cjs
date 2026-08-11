"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const experimentRoot = path.resolve(__dirname, "..");
const repositoryRoot = path.resolve(experimentRoot, "..", "..");
const paths = {
  html: path.join(experimentRoot, "index.html"),
  css: path.join(experimentRoot, "styles.css"),
  physics: path.join(experimentRoot, "js", "physics.js"),
  stage: path.join(experimentRoot, "js", "stage.js"),
  mathMaps: path.join(experimentRoot, "js", "math-maps.js"),
  spacetime: path.join(experimentRoot, "js", "spacetime-demos.js"),
  extreme: path.join(experimentRoot, "js", "extreme-demos.js"),
  laser: path.join(experimentRoot, "js", "laser-demo.js"),
  app: path.join(experimentRoot, "js", "app.js"),
  home: path.join(repositoryRoot, "_layouts", "home.html"),
};

function read(filePath) {
  assert.ok(fs.existsSync(filePath), `Expected ${path.relative(repositoryRoot, filePath)} to exist`);
  return fs.readFileSync(filePath, "utf8");
}

function matchAll(source, expression) {
  return Array.from(source.matchAll(expression));
}

function approximately(actual, expected, tolerance, message) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message}: expected ${expected} ± ${tolerance}, received ${actual}`,
  );
}

test("the experiment is a direct-file static entrypoint with only local runtime assets", () => {
  const html = read(paths.html);
  read(paths.css);
  read(paths.physics);
  read(paths.stage);
  read(paths.mathMaps);
  read(paths.spacetime);
  read(paths.extreme);
  read(paths.laser);
  read(paths.app);

  assert.match(html, /<link[^>]+href=["']\.\/styles\.css["']/i);
  for (const script of [
    "physics.js",
    "stage.js",
    "math-maps.js",
    "spacetime-demos.js",
    "extreme-demos.js",
    "laser-demo.js",
    "app.js",
  ]) {
    assert.match(html, new RegExp(`<script[^>]+src=["']\\.\\/js\\/${script.replace(".", "\\.")}["'][^>]*defer`, "i"));
  }

  assert.doesNotMatch(html, /<script[^>]+src=["']https?:\/\//i, "runtime JavaScript must not require a network");
  assert.doesNotMatch(html, /<link[^>]+href=["']https?:\/\//i, "styles and fonts must work offline");
  assert.doesNotMatch(html, /type=["']module["']/i, "file:// loading must not depend on module CORS");
});

test("the motion-first story exposes every requested topic and a meaningful control", () => {
  const html = read(paths.html);
  const topics = [
    "field-equation",
    "equivalence",
    "curvature",
    "black-hole",
    "white-hole",
    "wormhole",
    "stimulated-emission",
  ];
  const controls = [
    "field-density",
    "elevator-acceleration",
    "curvature-mass",
    "curvature-speed",
    "launch-probe",
    "horizon-mass",
    "horizon-position",
    "emit-light",
    "time-direction",
    "wormhole-fold",
    "send-wormhole-signal",
    "laser-pump",
    "fire-photon",
  ];

  for (const topic of topics) {
    assert.match(html, new RegExp(`data-topic=["']${topic}["']`), `missing ${topic} topic`);
  }
  for (const control of controls) {
    assert.match(html, new RegExp(`id=["']${control}["']`), `missing ${control} control`);
  }
});

test("the utility bar omits the manual motion toggle", () => {
  const html = read(paths.html);
  const css = read(paths.css);
  const app = read(paths.app);

  assert.doesNotMatch(html, /motion-toggle|Pause motion/i);
  assert.doesNotMatch(css, /\.motion-(?:toggle|indicator)\b/);
  assert.doesNotMatch(app, /motionToggle|setPaused/);
});

test("canvas stages retain the mobile margin and animation-performance safeguards", () => {
  const css = read(paths.css);
  const app = read(paths.app);
  const stage = read(paths.stage);

  assert.match(css, /\.lab-stage\s*\{[^}]*margin:\s*0;/s, "figure stages must not retain browser inline margins on mobile");
  assert.doesNotMatch(css, /transition(?:-property)?\s*:\s*all\b/i);
  assert.doesNotMatch(css, /will-change\s*:\s*all\b/i);
  assert.match(stage, /Math\.max\(600,\s*Math\.round\(root\.innerHeight\s*\*\s*0\.75\)\)/, "canvas rendering should prepare at least 600px or three quarters of a viewport ahead");
  assert.match(app, /const revealLead = 300;/, "scroll-linked reveals should begin 300px before the viewport");
  assert.match(app, /const revealTravel = 600;/, "scroll-linked reveals should remain in motion until the content is visibly inside the viewport");
  assert.match(app, /--story-reveal-opacity/, "scroll position must continuously drive chapter opacity");
  assert.match(app, /querySelectorAll\("\.chapter-copy, \.hero-copy"\)/, "reveals must track the visible copy rather than an oversized chapter container");
  assert.match(app, /revealProgress\(copy\.getBoundingClientRect\(\)\.top/, "copy animation must follow the copy’s actual viewport position");
  assert.match(app, /--story-stage-reveal-offset/, "scroll position must continuously drive experiment-stage movement");
  assert.match(css, /opacity:\s*var\(--story-reveal-opacity/, "chapter copy must use the scroll-linked opacity");
  assert.doesNotMatch(css, /chapter\.is-story-(?:active|revealed)\s+\.chapter-copy/, "binary chapter classes must not short-circuit the scroll animation");
  assert.match(app, /let previewObserver = null;/, "one-shot previews need a separate near-viewport observer");
  assert.match(app, /rootMargin:\s*"0px 0px 80px 0px"/, "one-shot previews should wait until the experiment is nearly visible");
});

test("every animated scene keeps its explanatory equation at the point of use", () => {
  const html = read(paths.html);
  const canvasIds = [
    "field-canvas",
    "elevator-canvas",
    "curvature-canvas",
    "black-hole-canvas",
    "white-hole-canvas",
    "wormhole-canvas",
    "laser-canvas",
  ];

  for (const canvasId of canvasIds) {
    assert.match(
      html,
      new RegExp(`class=["'][^"']*\\bstage-equation\\b[^"']*["'][^>]*data-equation-for=["']${canvasId}["']`),
      `missing adjacent equation for ${canvasId}`,
    );
  }
  assert.equal(matchAll(html, /data-equation-for=["'][^"']+["']/g).length, canvasIds.length);
});

test("every displayed equation exposes its variable definitions on hover", () => {
  const html = read(paths.html);
  const css = read(paths.css);
  const app = read(paths.app);
  const symbolTags = matchAll(
    html,
    /<(?:abbr|span|button)\b[^>]*class=["'][^"']*\bequation-symbol\b[^"']*["'][^>]*>/gi,
  ).map((match) => match[0]);

  assert.ok(symbolTags.length >= 24, `expected at least 24 defined equation symbols, received ${symbolTags.length}`);
  for (const tag of symbolTags) assert.match(tag, /data-definition=["'][^"']+["']/i);
  assert.match(css, /\.equation-tooltip\s*\{[^}]*position:\s*fixed;/s);
  assert.match(app, /pointerenter/);
  assert.match(app, /getBoundingClientRect\(\)/);
});

test("every variable in the four foundational equations is individually explainable", () => {
  const html = read(paths.html);
  const equations = [
    ["field-canvas", 5],
    ["elevator-canvas", 4],
    ["curvature-canvas", 5],
    ["black-hole-canvas", 5],
  ];

  for (const [canvasId, expectedSymbols] of equations) {
    const start = html.indexOf(`data-equation-for="${canvasId}"`);
    assert.ok(start >= 0, `missing foundational equation for ${canvasId}`);
    const block = html.slice(start, start + 2600);
    const symbolTags = matchAll(
      block,
      /<(?:abbr|span|button)\b[^>]*class=["'][^"']*\bequation-symbol\b[^"']*["'][^>]*>/gi,
    ).map((match) => match[0]);
    assert.equal(symbolTags.length, expectedSymbols, `${canvasId} must explain every variable occurrence`);
    for (const tag of symbolTags) assert.match(tag, /data-definition=["'][^"']+["']/i);
  }

  const curvatureStart = html.indexOf('data-equation-for="curvature-canvas"');
  const curvatureEquation = html.slice(curvatureStart, curvatureStart + 2600);
  assert.doesNotMatch(curvatureEquation, /⃗/, "combining vector arrows render as missing-glyph boxes in some browsers");
  assert.equal(matchAll(curvatureEquation, /\bvector-symbol\b/g).length, 3, "each displayed vector needs robust notation");
});

test("every variable in the five extreme-physics equations is individually explainable", () => {
  const html = read(paths.html);
  const equations = [
    ['data-equation-id="schwarzschild-radius"', 4],
    ['data-equation-for="white-hole-canvas"', 4],
    ['data-equation-for="wormhole-canvas"', 3],
    ['data-equation-id="photon-energy"', 3],
    ['data-equation-for="laser-canvas"', 6],
  ];

  for (const [marker, expectedSymbols] of equations) {
    const start = html.indexOf(marker);
    assert.ok(start >= 0, `missing extreme-physics equation marked ${marker}`);
    const closingTag = marker.includes("data-equation-id") ? "</p>" : "</div>";
    const end = html.indexOf(closingTag, start);
    assert.ok(end > start, `could not isolate extreme-physics equation marked ${marker}`);
    const block = html.slice(start, end + closingTag.length);
    const symbolTags = matchAll(
      block,
      /<(?:abbr|span|button)\b[^>]*class=["'][^"']*\bequation-symbol\b[^"']*["'][^>]*>/gi,
    ).map((match) => match[0]);
    assert.equal(symbolTags.length, expectedSymbols, `${marker} must explain every variable occurrence`);
    for (const tag of symbolTags) assert.match(tag, /data-definition=["'][^"']+["']/i);
  }
});

test("the laser lesson keeps photon energy and population inversion as separate relations", () => {
  const html = read(paths.html);
  const start = html.indexOf('data-equation-for="laser-canvas"');
  const end = html.indexOf("</div>", start);
  const equation = html.slice(start, end);

  assert.match(equation, /<span aria-hidden="true">;<\/span>/, "the two laser claims need a visible statement separator");
  assert.doesNotMatch(equation, /<span aria-hidden="true">·<\/span>/, "the energy relation must not multiply the inversion condition");
});

test("the laser maps distinguish resonance, transparency, gain, and device threshold", () => {
  const html = read(paths.html);
  const mathMaps = read(paths.mathMaps);
  read(paths.physics);
  delete require.cache[require.resolve(paths.physics)];
  const physics = require(paths.physics);

  assert.equal(physics.laserGainRegime(0.49), "absorbs");
  assert.equal(physics.laserGainRegime(0.5), "transparent");
  assert.equal(physics.laserGainRegime(0.51), "amplifies");

  const transparentPopulation = physics.laserPopulationState(0.5, 20);
  assert.deepEqual(
    { excited: transparentPopulation.excited, ground: transparentPopulation.ground, regime: transparentPopulation.regime },
    { excited: 10, ground: 10, regime: "transparent" },
  );
  const firstAllowedGain = physics.laserPopulationState(0.55, 20);
  assert.deepEqual(
    { excited: firstAllowedGain.excited, ground: firstAllowedGain.ground, regime: firstAllowedGain.regime },
    { excited: 11, ground: 9, regime: "amplifies" },
  );
  for (let percent = 0; percent <= 100; percent += 5) {
    const population = physics.laserPopulationState(percent / 100, 20);
    approximately(population.representedFraction, percent / 100, 1e-12, `${percent}% aligns with the 20-atom illustration`);
  }

  const start = html.indexOf('id="laser"');
  const end = html.indexOf("</section>", start);
  const laserSection = html.slice(start, end);
  assert.match(laserSection, /G<sub>rel<\/sub>\s*≡[\s\S]*2f<sub>2<\/sub>\s*−\s*1/);
  assert.match(laserSection, /normalized, lossless[\s\S]*equal degeneracy[\s\S]*equal (?:transition )?cross-sections/i);
  assert.match(laserSection, /σ<sub>e<\/sub>\(ν\)N<sub>2<\/sub>\s*&gt;\s*σ<sub>a<\/sub>\(ν\)N<sub>1<\/sub>/);
  assert.match(laserSection, /cavity[^.]*gain[^.]*loss/i);
  assert.match(laserSection, /assumes (?:a )?resonant/i);
  assert.match(laserSection, /finite linewidth/i);
  assert.doesNotMatch(laserSection, /gain threshold/i);
  for (const id of ["laser-map-pump", "laser-pump"]) {
    assert.match(laserSection, new RegExp(`id=["']${id}["'][^>]*step=["']5["']`));
  }

  assert.match(mathMaps, /xLabel:\s*"FREQUENCY RATIO\s+ν \/ ν₀"/);
  assert.match(mathMaps, /yLabel:\s*"GAP RATIO\s+ΔE \/ \(hν₀\)"/);
  assert.match(mathMaps, /laserGainRegime\(state\.pump\)/);
  assert.doesNotMatch(mathMaps, /gain\s*>=\s*0\s*\?\s*"AMPLIFIES"/);
});

test("footer formula notes cite authoritative sources and corresponding GitHub implementations", () => {
  const html = read(paths.html);
  const start = html.indexOf('id="formula-notes"');
  assert.ok(start >= 0, "missing formula notes footer");
  const end = html.indexOf("</section>", start);
  const notes = html.slice(start, end);
  const noteIds = ["equivalence", "field", "orbit", "horizon", "laser", "bridge", "kruskal"];

  for (const noteId of noteIds) {
    const noteStart = notes.indexOf(`id="formula-note-${noteId}"`);
    assert.ok(noteStart >= 0, `missing ${noteId} formula note`);
    const noteEnd = notes.indexOf("</li>", noteStart);
    const note = notes.slice(noteStart, noteEnd);
    assert.match(note, /data-citation-kind="authority"/, `${noteId} needs an authoritative formula source`);
    assert.ok(
      matchAll(note, /data-citation-kind="implementation"/g).length >= 2,
      `${noteId} needs model and graph or animation implementation links`,
    );
    assert.match(
      note,
      /https:\/\/github\.com\/dantetekanem\/dantetekanem\.github\.io\/blob\/main\/experiments\/einstein-field-lab\/js\/[^"#]+\.js#L\d+/,
      `${noteId} needs a function-specific GitHub source anchor`,
    );
  }

  for (const authority of [
    "https://einsteinpapers.press.princeton.edu/vol3-trans/393",
    "https://doi.org/10.1002/andp.19163540702",
    "https://arxiv.org/abs/gr-qc/0411060",
    "https://physics.nist.gov/cgi-bin/cuu/Value?h",
    "https://doi.org/10.1103/PhysRev.48.73",
    "https://doi.org/10.1119/1.15620",
    "https://doi.org/10.1103/PhysRev.119.1743",
  ]) {
    assert.match(notes, new RegExp(authority.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing ${authority}`);
  }
});

test("BFCache pagehide preserves live stages and later exits still clean them up", () => {
  const app = read(paths.app);
  const handler = app.match(
    /root\.addEventListener\("pagehide",\s*\(event\)\s*=>\s*\{([\s\S]*?)\n\s*\}\);/,
  );

  assert.ok(handler, "pagehide must use a reusable event-aware handler without once:true");
  assert.match(handler[1], /if\s*\(event\.persisted\)\s*return;/);
  assert.ok(
    handler[1].indexOf("event.persisted") < handler[1].indexOf("stage.destroy()"),
    "BFCache guard must run before destructive stage cleanup",
  );
  assert.doesNotMatch(handler[0], /once\s*:\s*true/);
});

test("the blog’s curated experiment grid links to the new page", () => {
  const home = read(paths.home);
  assert.match(home, /\/experiments\/einstein-field-lab\//);
});

test("the Kruskal map preserves causal regions and exact time reversal", () => {
  read(paths.physics);
  delete require.cache[require.resolve(paths.physics)];
  const physics = require(paths.physics);

  const futureHorizon = physics.compactKruskalPoint(0, 5);
  approximately(futureHorizon.time, futureHorizon.space, 1e-12, "U = 0 maps to a 45-degree horizon");

  const original = physics.compactKruskalPoint(1.25, 3.5);
  const reversed = physics.compactKruskalPoint(-3.5, -1.25);
  approximately(reversed.time, -original.time, 1e-12, "time reversal flips the vertical coordinate");
  approximately(reversed.space, original.space, 1e-12, "time reversal keeps the horizontal coordinate");

  assert.equal(physics.kruskalRegion(0.7, 0.1), "black-hole");
  assert.equal(physics.kruskalRegion(-0.7, 0.1), "white-hole");
  assert.equal(physics.kruskalRegion(0.1, 0.7), "right-exterior");
  assert.equal(physics.kruskalRegion(0.1, -0.7), "left-exterior");
  assert.equal(physics.kruskalRegion(0.4, 0.4), "horizon");

  const blackStart = physics.kruskalCausalPath(1, 0);
  const blackEnd = physics.kruskalCausalPath(1, 1);
  const whiteStart = physics.kruskalCausalPath(-1, 0);
  const whiteEnd = physics.kruskalCausalPath(-1, 1);
  approximately(whiteStart.time, -blackEnd.time, 1e-12, "white-hole path starts at the time-reversed black-hole end");
  approximately(whiteStart.space, blackEnd.space, 1e-12, "time-reversed path keeps its spatial endpoint");
  approximately(whiteEnd.time, -blackStart.time, 1e-12, "white-hole path ends at the time-reversed black-hole start");
  approximately(whiteEnd.space, blackStart.space, 1e-12, "time-reversed path keeps its exterior side");
});

test("the uncompactified and compact Kruskal paths are causal, reflected, and renderer-specific", () => {
  const mathMaps = read(paths.mathMaps);
  const extreme = read(paths.extreme);
  read(paths.physics);
  delete require.cache[require.resolve(paths.physics)];
  const physics = require(paths.physics);

  function assertCausal(pathFor, maximumSpacePerTime, label) {
    let previous = pathFor(0);
    for (let index = 1; index <= 1000; index += 1) {
      const current = pathFor(index / 1000);
      const deltaTime = current.time - previous.time;
      const deltaSpace = current.space - previous.space;
      assert.ok(deltaTime > 0, `${label} must remain future-directed at sample ${index}`);
      assert.ok(
        Math.abs(deltaSpace) <= maximumSpacePerTime * deltaTime + 1e-10,
        `${label} must remain inside its local null slope at sample ${index}`,
      );
      previous = current;
    }
  }

  assertCausal((amount) => physics.kruskalCausalPath(1, amount), 1, "uncompactified black-hole path");
  assertCausal((amount) => physics.kruskalCausalPath(-1, amount), 1, "uncompactified white-hole path");
  const physicalEnd = physics.kruskalCausalPath(1, 1);
  approximately(physicalEnd.space ** 2 - physicalEnd.time ** 2, -1, 1e-12, "the physical path ends on r = 0");

  const compactNullSlope = 0.46 / 0.72;
  assertCausal((amount) => physics.compactKruskalCausalPath(1, amount), compactNullSlope, "compact black-hole path");
  assertCausal((amount) => physics.compactKruskalCausalPath(-1, amount), compactNullSlope, "compact white-hole path");
  const compactEnd = physics.compactKruskalCausalPath(1, 1);
  approximately(compactEnd.space, 0, 1e-12, "the compact path reaches the middle of the drawn singularity");
  approximately(compactEnd.time, 0.72, 1e-12, "the compact path ends on its own T = 0.72 boundary");

  for (const amount of [0, 0.13, 0.5, 0.87, 1]) {
    const physicalBlack = physics.kruskalCausalPath(1, 1 - amount);
    const physicalWhite = physics.kruskalCausalPath(-1, amount);
    approximately(physicalWhite.time, -physicalBlack.time, 1e-12, "physical path time reflection");
    approximately(physicalWhite.space, physicalBlack.space, 1e-12, "physical path spatial reflection");
    const compactBlack = physics.compactKruskalCausalPath(1, 1 - amount);
    const compactWhite = physics.compactKruskalCausalPath(-1, amount);
    approximately(compactWhite.time, -compactBlack.time, 1e-12, "compact path time reflection");
    approximately(compactWhite.space, compactBlack.space, 1e-12, "compact path spatial reflection");
  }

  assert.match(mathMaps, /physics\.kruskalCausalPath\(/);
  assert.doesNotMatch(mathMaps, /physics\.compactKruskalCausalPath\(/);
  assert.match(extreme, /physics\.compactKruskalCausalPath\(/);
  assert.doesNotMatch(extreme, /physics\.kruskalCausalPath\(/);
});

test("the bridge and Kruskal copy state the plotted domains and physical limits", () => {
  const html = read(paths.html);
  const wormholeStart = html.indexOf('id="wormhole"');
  const wormhole = html.slice(wormholeStart, html.indexOf("</section>", wormholeStart));
  assert.match(wormhole, /prescribed illustration path lengths/i);
  assert.match(wormhole, /not (?:measured|computed)[^.]*Bézier[^.]*(?:proper|geodesic) distance/i);
  assert.match(wormhole, /time-symmetric equatorial spatial slice/i);
  assert.match(wormhole, /two (?:copies of the )?Schwarzschild exterior/i);
  assert.match(wormhole, /r\s*(?:&gt;=|≥)\s*r<sub>s<\/sub>/i);
  assert.match(wormhole, /no future-directed causal curve[^.]*one exterior[^.]*other/i);
  assert.match(wormhole, /null energy condition/i);
  assert.match(wormhole, /T<sub>μν<\/sub>k<sup>μ<\/sup>k<sup>ν<\/sup>\s*&lt;\s*0/);

  const kruskalStart = html.indexOf('id="white-hole"');
  const kruskal = html.slice(kruskalStart, html.indexOf("</section>", kruskalStart));
  assert.match(kruskal, /time-reflection isometry/i);
  assert.match(kruskal, /conventional (?:overall )?normalization/i);
  assert.match(kruskal, /presentation control/i);
  assert.match(kruskal, /not physical (?:time )?evolution/i);
  assert.match(kruskal, /maximally extended eternal/i);
  assert.match(kruskal, /realistic collapse[^.]*no past white-hole region/i);
});

test("the early relativity maps declare the frames and normalizations they use", () => {
  const html = read(paths.html);
  const mathMaps = read(paths.mathMaps);

  const liftStart = html.indexOf('data-equation-for="elevator-canvas"');
  const liftBlock = html.slice(liftStart, html.indexOf("</figure>", liftStart));
  assert.match(liftBlock, /\|<abbr[^>]*>Δy<\/abbr>\|\s*[≃≈]/, "the positive lift plot must display a drop magnitude and approximation");
  assert.match(liftBlock, /aL\/c²\s*≪\s*1/, "the lift approximation needs its small-acceleration domain");
  assert.match(liftBlock, /uniformly upward-accelerating cabin/i);

  const fieldStart = html.indexOf('class="field-balance-equation"');
  const fieldEnd = html.indexOf("</figure>", fieldStart);
  const fieldBlock = html.slice(fieldStart, fieldEnd);
  assert.match(fieldBlock, /local orthonormal frame/i);
  assert.match(fieldBlock, /signature\s*\(−\+\+\+\)/i);
  assert.match(fieldBlock, /spatial (?:stress|pressure)/i);
  assert.match(fieldBlock, /independent teaching values/i);
  assert.match(mathMaps, /SPATIAL STRESS COMPONENT\s+κT/i);

  const curvatureStart = html.indexOf('data-equation-for="curvature-canvas"');
  const curvatureEnd = html.indexOf("</section>", curvatureStart);
  assert.match(html.slice(curvatureStart, curvatureEnd), /G\s*=\s*1[^.]*reference time unit/i);

  const horizonStart = html.indexOf('id="black-hole"');
  const horizonEnd = html.indexOf("</section>", horizonStart);
  const horizonBlock = html.slice(horizonStart, horizonEnd);
  assert.match(horizonBlock, /dr\/dt<sub>GP<\/sub>/);
  assert.match(horizonBlock, /uncharged/i);
  assert.match(horizonBlock, /areal radius/i);
  assert.match(mathMaps, /\(dr\/dt_GP\) \/ c/);
});

test("the pre-animation coordinate maps preserve the equations they graph", () => {
  read(paths.physics);
  delete require.cache[require.resolve(paths.physics)];
  const physics = require(paths.physics);

  approximately(
    physics.equivalenceDropFemtometres(1, 3),
    0.49101,
    0.0001,
    "a three-metre beam crossing at one Earth gravity",
  );
  const fieldBalance = physics.fieldEquationComponentBalance(0.8, 0.04);
  approximately(fieldBalance.source, 0.8, 1e-12, "the chosen source component");
  approximately(fieldBalance.background, 0.04, 1e-12, "the chosen background component");
  approximately(fieldBalance.curvature, 0.76, 1e-12, "curvature after moving the background term");
  approximately(fieldBalance.geometrySide, 0.8, 1e-12, "G plus Lambda g balances kappa T");

  const lightAtTenMasses = physics.horizonCoordinatePoint(10, 1.88);
  const lightAtSixtyFourMasses = physics.horizonCoordinatePoint(64, 1.88);
  assert.ok(
    lightAtSixtyFourMasses.physicalRadiusKm > lightAtTenMasses.physicalRadiusKm * 6,
    "in a fixed kilometre map, increasing M must move the selected radius and horizon",
  );
  approximately(lightAtTenMasses.radiusRatio, 1.88, 1e-12, "the selected radius stays fixed in horizon units");
  approximately(lightAtTenMasses.outward, lightAtSixtyFourMasses.outward, 1e-12, "the normalized coordinate rate stays invariant at the same r/r_s");

  approximately(
    physics.radialAccelerationRelative(2, 1),
    -0.25,
    1e-12,
    "inverse-square acceleration at twice the reference radius",
  );
  approximately(
    physics.radialAccelerationRelative(2, 2),
    -0.5,
    1e-12,
    "the inverse-square curve scales linearly with mass",
  );
});

test("coordinate-map values animate toward a changed number without overshooting", () => {
  read(paths.physics);
  delete require.cache[require.resolve(paths.physics)];
  const physics = require(paths.physics);

  const first = physics.mapTransitionValue(0, 1, 1 / 60);
  assert.ok(first > 0 && first < 1, `first animated step must stay between endpoints, received ${first}`);
  const reverse = physics.mapTransitionValue(1, -1, 1 / 60);
  assert.ok(reverse < 1 && reverse > -1, `reverse animated step must stay between endpoints, received ${reverse}`);
  assert.equal(physics.mapTransitionValue(0.99999, 1, 1 / 60), 1, "a settled value snaps exactly to its target");
  assert.equal(physics.mapTransitionValue(0.99989, 1, 1 / 60), 1, "the settling step itself lands exactly on its target");
});

test("the later coordinate maps preserve gain, bridge, and Kruskal relationships", () => {
  read(paths.physics);
  delete require.cache[require.resolve(paths.physics)];
  const physics = require(paths.physics);

  approximately(physics.laserNetGainRelative(0.6), 0.2, 1e-12, "60 percent excitation clears the inversion threshold");
  approximately(physics.laserNetGainRelative(0.5), 0, 1e-12, "50 percent excitation is the simplified transparency point");
  approximately(physics.schwarzschildEmbeddingHeight(2, 1), 2, 1e-12, "the spatial embedding at twice the horizon radius");
  approximately(physics.schwarzschildEmbeddingHeight(1, 1), 0, 1e-12, "the two embedding sheets meet at the throat");
  approximately(physics.kruskalRadialInvariant(2), Math.E ** 2, 1e-12, "constant radius is a Kruskal hyperbola");
});

test("the pure model keeps horizon, wormhole, and photon relationships honest", () => {
  read(paths.physics);
  delete require.cache[require.resolve(paths.physics)];
  const physics = require(paths.physics);

  approximately(physics.schwarzschildRadiusKm(1), 2.95325, 0.0001, "one-solar-mass horizon radius");
  approximately(physics.schwarzschildRadiusKm(5), 14.76625, 0.001, "horizon radius scales with mass");
  approximately(physics.schwarzschildRadiusMillimetresForEarthMass(1), 8.87, 0.03, "Earth-mass horizon radius");

  const outside = physics.blackHoleRadialLightSpeeds(4);
  const horizon = physics.blackHoleRadialLightSpeeds(1);
  const inside = physics.blackHoleRadialLightSpeeds(0.25);
  assert.ok(outside.outward > 0 && outside.inward < 0, "outside light can move either radial way");
  approximately(horizon.outward, 0, 1e-12, "outward coordinate ray sits at the horizon");
  assert.ok(inside.outward < 0 && inside.inward < 0, "inside both radial light choices lead inward");

  const whiteInside = physics.whiteHoleRadialLightSpeeds(0.25);
  assert.ok(whiteInside.outward > 0 && whiteInside.inward > 0, "inside an idealized white-hole region both choices lead outward");

  const pathComparison = physics.compareWormholePaths(120, 18);
  assert.equal(pathComparison.ordinary, 120);
  assert.equal(pathComparison.throat, 18);
  approximately(pathComparison.shortcutFactor, 120 / 18, 1e-12, "wormhole path comparison");

  approximately(physics.photonEnergyElectronVolts(620), 2.0, 0.02, "620 nm photon energy");
  assert.deepEqual(
    physics.stimulatedCascade(1, 7, 3),
    { photons: 8, excitedAtoms: 0, emitted: 7 },
    "an idealized, atom-limited three-generation cascade",
  );
});
