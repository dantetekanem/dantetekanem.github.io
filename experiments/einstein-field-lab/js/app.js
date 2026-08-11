(function startEinsteinFieldLab(root) {
  "use strict";

  const physics = root.EinsteinLabPhysics;
  const stageTools = root.EinsteinLabStage;
  const mathMaps = root.EinsteinLabMathMaps;
  const spacetimeDemos = root.EinsteinLabSpacetimeDemos;
  const extremeDemos = root.EinsteinLabExtremeDemos;
  const laserDemos = root.EinsteinLabLaserDemo;
  const reducedMotionQuery = root.matchMedia("(prefers-reduced-motion: reduce)");

  if (!physics || !stageTools || !mathMaps || !mathMaps.ready || !spacetimeDemos || !extremeDemos || !extremeDemos.ready || !laserDemos || !laserDemos.ready) {
    throw new Error("Einstein Field Lab did not load its local scripts in order.");
  }

  function element(id) {
    const found = document.getElementById(id);
    if (!found) throw new Error(`Einstein Field Lab is missing #${id}.`);
    return found;
  }

  const elements = {
    equationTooltip: element("equation-tooltip"),
    announcement: element("lab-announcement"),
    fieldDensity: element("field-density"),
    fieldDensityOutput: element("field-density-output"),
    fieldMapDensity: element("field-map-density"),
    fieldMapDensityOutput: element("field-map-density-output"),
    fieldMapBackground: element("field-map-background"),
    fieldMapBackgroundOutput: element("field-map-background-output"),
    fieldStageDensity: element("field-stage-density"),
    fieldStageDensityOutput: element("field-stage-density-output"),
    fieldMapReadout: element("field-map-readout"),
    fieldBalanceCurvature: element("field-balance-curvature"),
    fieldBalanceBackground: element("field-balance-background"),
    fieldBalanceSource: element("field-balance-source"),
    fieldLedgerSource: element("field-ledger-source"),
    fieldLedgerBackground: element("field-ledger-background"),
    fieldLedgerCurvature: element("field-ledger-curvature"),
    fieldLedgerCheck: element("field-ledger-check"),
    equationReadout: element("equation-readout"),
    elevatorAcceleration: element("elevator-acceleration"),
    elevatorAccelerationOutput: element("elevator-acceleration-output"),
    elevatorMapAcceleration: element("elevator-map-acceleration"),
    elevatorMapAccelerationOutput: element("elevator-map-acceleration-output"),
    elevatorMapReadout: element("elevator-map-readout"),
    elevatorInside: element("elevator-inside"),
    elevatorOutside: element("elevator-outside"),
    elevatorState: element("elevator-state"),
    curvatureMass: element("curvature-mass"),
    curvatureMassOutput: element("curvature-mass-output"),
    curvatureSpeed: element("curvature-speed"),
    curvatureSpeedOutput: element("curvature-speed-output"),
    curvatureMapMass: element("curvature-map-mass"),
    curvatureMapMassOutput: element("curvature-map-mass-output"),
    curvatureMapReadout: element("curvature-map-readout"),
    launchProbe: element("launch-probe"),
    orbitState: element("orbit-state"),
    horizonMass: element("horizon-mass"),
    horizonMassOutput: element("horizon-mass-output"),
    horizonMapMass: element("horizon-map-mass"),
    horizonMapMassOutput: element("horizon-map-mass-output"),
    horizonMapReadout: element("horizon-map-readout"),
    horizonPosition: element("horizon-position"),
    horizonPositionOutput: element("horizon-position-output"),
    horizonMapPosition: element("horizon-map-position"),
    horizonMapPositionOutput: element("horizon-map-position-output"),
    horizonZone: element("horizon-zone"),
    emitLight: element("emit-light"),
    timeDirection: element("time-direction"),
    timeDirectionOutput: element("time-direction-output"),
    timeDirectionControlOutput: element("time-direction-control-output"),
    kruskalMapReadout: element("kruskal-map-readout"),
    kruskalMapRadius: element("kruskal-map-radius"),
    kruskalMapRadiusOutput: element("kruskal-map-radius-output"),
    kruskalMapDirection: element("kruskal-map-direction"),
    kruskalMapDirectionOutput: element("kruskal-map-direction-output"),
    directionGlyph: element("direction-glyph"),
    wormholeFold: element("wormhole-fold"),
    wormholeFoldOutput: element("wormhole-fold-control-output"),
    wormholeOutput: element("wormhole-output"),
    wormholeMapRadius: element("wormhole-map-radius"),
    wormholeMapRadiusOutput: element("wormhole-map-radius-output"),
    wormholeMapReadout: element("wormhole-map-readout"),
    sendWormholeSignal: element("send-wormhole-signal"),
    laserPump: element("laser-pump"),
    laserPumpOutput: element("laser-pump-control-output"),
    laserMapPump: element("laser-map-pump"),
    laserMapPumpOutput: element("laser-map-pump-output"),
    laserMapReadout: element("laser-map-readout"),
    laserOutput: element("laser-output"),
    firePhoton: element("fire-photon"),
  };

  const fieldMap = mathMaps.createFieldMap(element("field-math-map"), {
    density: Number(elements.fieldDensity.value) / 100,
    background: Number(elements.fieldMapBackground.value) / 100,
    onUpdate(balance) {
      const source = balance.source.toFixed(2);
      const background = balance.background.toFixed(2);
      const curvature = balance.curvature.toFixed(2);
      elements.fieldMapReadout.textContent = `Spatial stress ${(balance.source * 100).toFixed(1)}% · background ${(balance.background * 100).toFixed(1)}% · curvature ${(balance.curvature * 100).toFixed(1)}%`;
      elements.fieldBalanceCurvature.textContent = curvature;
      elements.fieldBalanceBackground.textContent = background;
      elements.fieldBalanceSource.textContent = source;
      elements.fieldLedgerSource.textContent = source;
      elements.fieldLedgerBackground.textContent = background;
      elements.fieldLedgerCurvature.textContent = curvature;
      elements.fieldLedgerCheck.textContent = `${curvature} + ${background} = ${source}`;
    },
  });
  const elevatorMap = mathMaps.createLiftMap(element("elevator-math-map"), {
    acceleration: Number(elements.elevatorAcceleration.value),
    onUpdate(plotted) {
      elements.elevatorMapReadout.textContent = `L = ${plotted.distance.toFixed(1)} m · |Δy| = ${plotted.dropFemtometres.toFixed(3)} fm`;
    },
  });
  const curvatureMap = mathMaps.createCurvatureMap(element("curvature-math-map"), {
    mass: Number(elements.curvatureMass.value),
    onUpdate(plotted) {
      elements.curvatureMapReadout.textContent = `At r = ${plotted.launchRadius.toFixed(2)} · |aᵣ| = ${Math.abs(plotted.acceleration).toFixed(2)}`;
    },
  });
  const horizonMap = mathMaps.createHorizonMap(element("horizon-math-map"), {
    mass: Number(elements.horizonMass.value),
    radius: Number(elements.horizonPosition.value),
    onUpdate: updateHorizonMapReadout,
  });
  const laserMap = mathMaps.createLaserMap(element("laser-math-map"), {
    pump: Number(elements.laserPump.value) / 100,
    onUpdate(plotted) {
      const gainValue = Math.abs(plotted.gain) <= 1e-12
        ? "0.00"
        : `${plotted.gain > 0 ? "+" : "−"}${Math.abs(plotted.gain).toFixed(2)}`;
      elements.laserMapReadout.textContent = `${(plotted.pump * 100).toFixed(1)}% excited · Grel ${gainValue} · ${plotted.regime}`;
    },
  });
  const bridgeMap = mathMaps.createBridgeMap(element("wormhole-math-map"), {
    radius: Number(elements.wormholeMapRadius.value),
    onUpdate(plotted) {
      elements.wormholeMapReadout.textContent = `r = ${plotted.radius.toFixed(2)} rₛ · z = ±${plotted.height.toFixed(2)} rₛ`;
    },
  });
  const kruskalMap = mathMaps.createKruskalMap(element("kruskal-math-map"), {
    direction: Number(elements.timeDirection.value),
    radius: Number(elements.kruskalMapRadius.value),
    onUpdate: updateKruskalMapReadout,
  });

  const fieldDemo = spacetimeDemos.createFieldDemo(element("field-canvas"), {
    density: Number(elements.fieldDensity.value) / 100,
    activeTerm: "geometry",
  });
  const elevatorDemo = spacetimeDemos.createElevatorDemo(element("elevator-canvas"), {
    acceleration: Number(elements.elevatorAcceleration.value),
    viewpoint: "inside",
  });
  const curvatureDemo = spacetimeDemos.createCurvatureDemo(
    element("curvature-canvas"),
    {
      mass: Number(elements.curvatureMass.value),
      speed: Number(elements.curvatureSpeed.value),
      orbit: physics.createOrbitState(
        Number(elements.curvatureMass.value),
        Number(elements.curvatureSpeed.value),
      ),
      staticSolved: false,
    },
    (status) => {
      elements.orbitState.textContent = status.replace(/\b\w/g, (letter) => letter.toUpperCase());
    },
  );
  const blackHoleDemo = extremeDemos.createBlackHoleDemo(
    element("black-hole-canvas"),
    {
      mass: Number(elements.horizonMass.value),
      radius: Number(elements.horizonPosition.value),
      pulseVersion: 0,
      pulseStart: null,
    },
    (zone) => {
      const labels = {
        outside: "Outside the horizon",
        horizon: "At the horizon",
        inside: "Inside · all light moves inward",
      };
      elements.horizonZone.textContent = labels[zone];
    },
  );
  const whiteHoleDemo = extremeDemos.createWhiteHoleDemo(
    element("white-hole-canvas"),
    { direction: Number(elements.timeDirection.value) },
  );
  const wormholeDemo = extremeDemos.createWormholeDemo(
    element("wormhole-canvas"),
    { fold: Number(elements.wormholeFold.value) / 100, signalVersion: 0, signalStart: null },
    (distances) => {
      elements.wormholeOutput.textContent = `Illustration ratio · ${distances.shortcutFactor.toFixed(1)}×`;
    },
  );
  const laserDemo = laserDemos.createLaserDemo(
    element("laser-canvas"),
    { pump: Number(elements.laserPump.value) / 100, photonVersion: 0, photonStart: null },
    (laserState) => {
      const gain = laserState.gain;
      if (!laserState.fired) {
        const readyText = {
          absorbs: "net absorption",
          transparent: "transparent",
          amplifies: "material gain ready",
        }[gain.regime];
        elements.laserOutput.textContent = `${gain.excited} excited · ${readyText}`;
      } else if (gain.regime === "absorbs") {
        elements.laserOutput.textContent = "Light fades · net absorption";
      } else if (gain.regime === "transparent") {
        elements.laserOutput.textContent = "One photon passes · transparent";
      } else {
        elements.laserOutput.textContent = `${laserState.visiblePhotons} photons shown · ${laserState.completed ? "animation capped" : "beam growing"}`;
      }
    },
  );

  const allDemos = [
    fieldMap,
    elevatorMap,
    curvatureMap,
    horizonMap,
    laserMap,
    bridgeMap,
    kruskalMap,
    fieldDemo,
    elevatorDemo,
    curvatureDemo,
    blackHoleDemo,
    whiteHoleDemo,
    wormholeDemo,
    laserDemo,
  ];
  const demoByChapter = Object.freeze({
    equation: fieldDemo,
    equivalence: elevatorDemo,
    curvature: curvatureDemo,
    "black-hole": blackHoleDemo,
    "white-hole": whiteHoleDemo,
    wormhole: wormholeDemo,
    laser: laserDemo,
  });
  const previewByChapter = Object.freeze({
    curvature: () => curvatureDemo.launch(),
    "black-hole": () => blackHoleDemo.emit(),
    wormhole: () => wormholeDemo.send(),
    laser: () => laserDemo.fire(),
  });
  const previewedChapters = new Set();
  let chapterObserver = null;
  let experimentObserver = null;
  let previewObserver = null;
  let storyScrollFrame = null;
  let storyChapters = [];
  const revealLead = 300;
  const revealTravel = 600;

  function revealProgress(elementTop, viewportHeight) {
    if (reducedMotionQuery.matches) return elementTop <= viewportHeight + revealLead ? 1 : 0;
    return physics.clamp((viewportHeight + revealLead - elementTop) / revealTravel, 0, 1);
  }

  function setStageReveal(target, progress) {
    target.style.setProperty("--story-stage-opacity", (0.08 + progress * 0.92).toFixed(3));
    target.style.setProperty("--story-stage-reveal-offset", `${((1 - progress) * 80).toFixed(2)}px`);
    target.style.setProperty("--story-stage-reveal-scale", (0.975 + progress * 0.025).toFixed(4));
  }

  function updateStoryParallax() {
    storyScrollFrame = null;
    const viewportHeight = Math.max(1, root.innerHeight);
    const motionScale = reducedMotionQuery.matches ? 0 : 1;
    storyChapters.forEach((chapter) => {
      const rect = chapter.getBoundingClientRect();
      if (rect.bottom < -viewportHeight || rect.top > viewportHeight * 2) return;
      const center = rect.top + rect.height / 2;
      const progress = physics.clamp((center - viewportHeight / 2) / (viewportHeight + rect.height / 2), -1, 1);
      chapter.style.setProperty("--story-copy-shift", `${(-progress * 12 * motionScale).toFixed(2)}px`);
      chapter.style.setProperty("--story-stage-shift", `${(progress * 10 * motionScale).toFixed(2)}px`);
      chapter.style.setProperty("--story-bg-shift", `${(-progress * 36 * motionScale).toFixed(2)}px`);
      chapter.querySelectorAll(".chapter-copy, .hero-copy").forEach((copy) => {
        const copyReveal = revealProgress(copy.getBoundingClientRect().top, viewportHeight);
        copy.style.setProperty("--story-reveal-opacity", (0.08 + copyReveal * 0.92).toFixed(3));
        copy.style.setProperty("--story-reveal-offset", `${((1 - copyReveal) * 64).toFixed(2)}px`);
        copy.style.setProperty("--story-child-opacity", copyReveal.toFixed(3));
        copy.style.setProperty("--story-child-offset", `${((1 - copyReveal) * 24).toFixed(2)}px`);
      });
      chapter.querySelectorAll(".lab-stage, .equation-console, .math-map-wide").forEach((stage) => {
        setStageReveal(stage, revealProgress(stage.getBoundingClientRect().top, viewportHeight));
      });
    });
  }

  function scheduleStoryParallax() {
    if (storyScrollFrame == null) {
      storyScrollFrame = root.requestAnimationFrame(updateStoryParallax);
    }
  }

  function initializeEquationTooltips() {
    const symbols = Array.from(document.querySelectorAll(".equation-symbol[data-definition]"));
    const tooltip = elements.equationTooltip;
    let activeSymbol = null;
    let pinned = false;

    function positionTooltip(symbol) {
      if (!symbol || symbol !== activeSymbol) return;
      const symbolRect = symbol.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const gutter = 12;
      const gap = 9;
      const maximumLeft = Math.max(gutter, root.innerWidth - tooltipRect.width - gutter);
      const centeredLeft = symbolRect.left + symbolRect.width / 2 - tooltipRect.width / 2;
      const left = Math.min(maximumLeft, Math.max(gutter, centeredLeft));
      const equationStrip = symbol.closest(".stage-equation");
      const stageEquation = equationStrip && equationStrip.parentElement.classList.contains("lab-stage")
        ? equationStrip
        : null;
      const displayEquation = symbol.closest(".display-equation");
      let top = symbolRect.top - tooltipRect.height - gap;
      let below = top < gutter;
      if (stageEquation) {
        top = stageEquation.getBoundingClientRect().bottom + gap;
        below = true;
      } else if (displayEquation) {
        top = symbolRect.bottom + gap;
        below = true;
      } else if (below) {
        top = symbolRect.bottom + gap;
      }
      if (top + tooltipRect.height > root.innerHeight - gutter) {
        top = symbolRect.top - tooltipRect.height - gap;
        below = false;
      }
      top = Math.min(
        Math.max(gutter, root.innerHeight - tooltipRect.height - gutter),
        Math.max(gutter, top),
      );
      tooltip.classList.toggle("is-below", below);
      tooltip.style.left = `${Math.round(left)}px`;
      tooltip.style.top = `${Math.round(top)}px`;
    }

    function showTooltip(symbol, shouldPin) {
      if (!symbol) return;
      if (activeSymbol && activeSymbol !== symbol) activeSymbol.classList.remove("is-explaining");
      activeSymbol = symbol;
      pinned = Boolean(shouldPin);
      symbol.classList.add("is-explaining");
      tooltip.textContent = symbol.dataset.definition;
      tooltip.setAttribute("aria-hidden", "false");
      tooltip.classList.add("is-visible");
      positionTooltip(symbol);
    }

    function hideTooltip() {
      if (activeSymbol) activeSymbol.classList.remove("is-explaining");
      activeSymbol = null;
      pinned = false;
      tooltip.classList.remove("is-visible", "is-below");
      tooltip.setAttribute("aria-hidden", "true");
    }

    symbols.forEach((symbol) => {
      symbol.setAttribute("aria-describedby", tooltip.id);
      if (symbol.tagName === "ABBR") symbol.setAttribute("role", "button");
      symbol.addEventListener("pointerenter", () => showTooltip(symbol, false));
      symbol.addEventListener("pointerleave", () => {
        if (!pinned && document.activeElement !== symbol) hideTooltip();
      });
      symbol.addEventListener("focus", () => showTooltip(symbol, false));
      symbol.addEventListener("blur", () => {
        if (!pinned) hideTooltip();
      });
      symbol.addEventListener("click", () => {
        if (activeSymbol === symbol && pinned) hideTooltip();
        else showTooltip(symbol, true);
      });
      symbol.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          hideTooltip();
          symbol.blur();
        } else if (symbol.tagName === "ABBR" && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          if (activeSymbol === symbol && pinned) hideTooltip();
          else showTooltip(symbol, true);
        }
      });
    });

    document.addEventListener("pointerdown", (event) => {
      if (activeSymbol && !event.target.closest(".equation-symbol")) hideTooltip();
    });
    root.addEventListener("resize", () => positionTooltip(activeSymbol), { passive: true });
    root.addEventListener("scroll", () => positionTooltip(activeSymbol), { passive: true });
  }

  function fieldDescription(value) {
    if (value < 0.12) return "almost flat";
    if (value < 0.45) return "slightly bent";
    if (value < 0.75) return "strongly bent";
    return "extremely bent";
  }

  function updateFieldDensity() {
    const value = Number(elements.fieldDensity.value);
    elements.fieldMapDensity.value = String(value);
    elements.fieldStageDensity.value = String(value);
    fieldMap.setDensity(value / 100);
    fieldDemo.setDensity(value / 100);
    elements.fieldDensityOutput.textContent = `${value}%`;
    elements.fieldMapDensityOutput.textContent = `${value}%`;
    elements.fieldStageDensityOutput.textContent = `${value}%`;
    elements.fieldDensity.setAttribute("aria-valuetext", `${value} percent, ${fieldDescription(value / 100)}`);
  }

  elements.fieldDensity.addEventListener("input", updateFieldDensity);
  elements.fieldMapDensity.addEventListener("input", () => {
    elements.fieldDensity.value = elements.fieldMapDensity.value;
    updateFieldDensity();
  });
  elements.fieldMapBackground.addEventListener("input", () => {
    const value = Number(elements.fieldMapBackground.value);
    elements.fieldMapBackgroundOutput.textContent = `${value}%`;
    fieldMap.setBackground(value / 100);
  });
  elements.fieldStageDensity.addEventListener("input", () => {
    elements.fieldDensity.value = elements.fieldStageDensity.value;
    updateFieldDensity();
  });

  const termCopy = Object.freeze({
    geometry: "This side shows how spacetime bends.",
    background: "Lambda represents curvature associated with empty space. Observations say its value is very small.",
    matter: "This side lists what is here: energy, motion, pressure, and stress.",
  });
  const equationTerms = Array.from(document.querySelectorAll("[data-equation-term]"));
  equationTerms.forEach((button) => {
    button.addEventListener("click", () => {
      const term = button.dataset.equationTerm;
      equationTerms.forEach((candidate) => candidate.classList.toggle("is-active", candidate === button));
      fieldDemo.setActiveTerm(term);
      elements.equationReadout.textContent = termCopy[term];
    });
  });

  function updateElevatorAcceleration() {
    const value = Number(elements.elevatorAcceleration.value);
    const label = `${value.toFixed(2).replace(/0$/, "")} g`;
    elements.elevatorMapAcceleration.value = String(value);
    elevatorMap.setAcceleration(value);
    elevatorDemo.setAcceleration(value);
    elements.elevatorAccelerationOutput.textContent = label;
    elements.elevatorMapAccelerationOutput.textContent = label;
    elements.elevatorAcceleration.setAttribute(
      "aria-valuetext",
      value === 0 ? "Coasting without acceleration" : `${value.toFixed(2)} times Earth’s gravity`,
    );
  }

  function setElevatorViewpoint(viewpoint) {
    const outside = viewpoint === "outside";
    elevatorDemo.setViewpoint(outside ? "outside" : "inside");
    elements.elevatorInside.classList.toggle("is-active", !outside);
    elements.elevatorOutside.classList.toggle("is-active", outside);
    elements.elevatorInside.setAttribute("aria-pressed", String(!outside));
    elements.elevatorOutside.setAttribute("aria-pressed", String(outside));
    elements.elevatorState.textContent = outside ? "View from outside" : "View from inside";
  }

  elements.elevatorAcceleration.addEventListener("input", updateElevatorAcceleration);
  elements.elevatorMapAcceleration.addEventListener("input", () => {
    elements.elevatorAcceleration.value = elements.elevatorMapAcceleration.value;
    updateElevatorAcceleration();
  });
  elements.elevatorInside.addEventListener("click", () => setElevatorViewpoint("inside"));
  elements.elevatorOutside.addEventListener("click", () => setElevatorViewpoint("outside"));

  function updateCurvatureMass() {
    const value = Number(elements.curvatureMass.value);
    const label = `${value.toFixed(2).replace(/0$/, "")}×`;
    elements.curvatureMapMass.value = String(value);
    curvatureMap.setMass(value);
    elements.curvatureMassOutput.textContent = label;
    elements.curvatureMapMassOutput.textContent = label;
    elements.curvatureMass.setAttribute("aria-valuetext", `${value.toFixed(2)} times the starting mass`);
    curvatureDemo.setMass(value);
  }

  function updateCurvatureSpeed() {
    const value = Number(elements.curvatureSpeed.value);
    elements.curvatureSpeedOutput.textContent = `${value.toFixed(2)}×`;
    elements.curvatureSpeed.setAttribute("aria-valuetext", `${value.toFixed(2)} times the speed needed for a circular orbit`);
    curvatureDemo.setSpeed(value);
  }

  function launchProbe(announce) {
    curvatureDemo.launch();
    elements.orbitState.textContent = "Tracing Path";
    if (announce) {
      elements.announcement.textContent = `Probe launched at ${Number(elements.curvatureSpeed.value).toFixed(2)} times circular-orbit speed around ${Number(elements.curvatureMass.value).toFixed(2)} times the starting mass.`;
    }
  }

  elements.curvatureMass.addEventListener("input", updateCurvatureMass);
  elements.curvatureMapMass.addEventListener("input", () => {
    elements.curvatureMass.value = elements.curvatureMapMass.value;
    updateCurvatureMass();
  });
  elements.curvatureSpeed.addEventListener("input", updateCurvatureSpeed);
  elements.launchProbe.addEventListener("click", () => launchProbe(true));
  element("curvature-canvas").addEventListener("pointerdown", () => launchProbe(false));

  function updateHorizonMapReadout(plotted) {
    const outwardSign = plotted.outward >= 0 ? "+" : "−";
    elements.horizonMapReadout.textContent = `${plotted.radius.toFixed(2)} rₛ = ${plotted.physicalRadiusKm.toFixed(1)} km · outgoing ${outwardSign}${Math.abs(plotted.outward).toFixed(2)}c · ingoing −${Math.abs(plotted.inward).toFixed(2)}c`;
  }

  function updateHorizonMass() {
    const mass = Number(elements.horizonMass.value);
    const radius = physics.schwarzschildRadiusKm(mass);
    const label = `${mass.toFixed(0)} M☉ · ${radius.toFixed(1)} km`;
    elements.horizonMapMass.value = String(mass);
    horizonMap.setMass(mass);
    blackHoleDemo.setMass(mass);
    elements.horizonMassOutput.textContent = label;
    elements.horizonMapMassOutput.textContent = label;
    elements.horizonMapPositionOutput.textContent = `${Number(elements.horizonPosition.value).toFixed(2)} rₛ · ${(radius * Number(elements.horizonPosition.value)).toFixed(1)} km`;
    elements.horizonMass.setAttribute(
      "aria-valuetext",
      `${mass.toFixed(0)} solar masses, ${radius.toFixed(1)} kilometre horizon radius`,
    );
  }

  function updateHorizonPosition() {
    const radius = Number(elements.horizonPosition.value);
    const zone = physics.horizonZone(radius);
    elements.horizonMapPosition.value = String(radius);
    horizonMap.setRadius(radius);
    blackHoleDemo.setRadius(radius);
    const physicalRadiusKm = physics.schwarzschildRadiusKm(Number(elements.horizonMass.value)) * radius;
    elements.horizonPositionOutput.textContent = `${radius.toFixed(2)} rₛ · ${zone}`;
    elements.horizonMapPositionOutput.textContent = `${radius.toFixed(2)} rₛ · ${physicalRadiusKm.toFixed(1)} km`;
    elements.horizonPosition.setAttribute(
      "aria-valuetext",
      `${radius.toFixed(2)} horizon radii, ${zone}`,
    );
  }

  function emitLight() {
    blackHoleDemo.emit();
    elements.announcement.textContent = `Two light beams sent from ${elements.horizonPositionOutput.textContent}.`;
  }

  function updateKruskalMapReadout(plotted) {
    const timeLabel = plotted.direction < -0.08
      ? "white-hole path"
      : plotted.direction > 0.08
        ? "black-hole path"
        : "both orientations";
    elements.kruskalMapReadout.textContent = `r = ${plotted.radius.toFixed(2)} rₛ · T ${plotted.direction >= 0 ? "+" : "−"}${Math.abs(plotted.direction).toFixed(2)} · ${timeLabel}`;
  }

  function updateTimeDirection() {
    const direction = Number(elements.timeDirection.value);
    elements.kruskalMapDirection.value = String(direction);
    elements.kruskalMapDirectionOutput.textContent = `${direction >= 0 ? "+" : "−"}${Math.abs(direction).toFixed(2)}`;
    kruskalMap.setDirection(direction);
    whiteHoleDemo.setDirection(direction);
    let label;
    let accessible;
    if (direction < -0.08) {
      label = "White-hole orientation";
      accessible = `${Math.abs(direction).toFixed(2)} presentation weight toward reflected T and the white-hole path`;
    } else if (direction > 0.08) {
      label = "Black-hole orientation";
      accessible = `${direction.toFixed(2)} presentation weight toward the original T coordinate and black-hole path`;
    } else {
      label = "Both time-reflected views";
      accessible = "Presentation midpoint showing both time-reflected causal orientations";
    }
    elements.timeDirectionOutput.textContent = label;
    elements.timeDirectionControlOutput.textContent = direction < -0.08 ? "Reflected T" : direction > 0.08 ? "Original T" : "Both";
    elements.timeDirection.setAttribute("aria-valuetext", accessible);
    elements.directionGlyph.style.setProperty("--direction-rotation", direction < 0 ? "180deg" : "0deg");
  }

  function updateWormholeFold() {
    const value = Number(elements.wormholeFold.value);
    wormholeDemo.setFold(value / 100);
    const distances = wormholeDemo.distances();
    elements.wormholeFoldOutput.textContent = `${value}%`;
    elements.wormholeOutput.textContent = `Illustration ratio · ${distances.shortcutFactor.toFixed(1)}×`;
    elements.wormholeFold.setAttribute(
      "aria-valuetext",
      `${value} percent together, prescribed drawing path ratio ${distances.shortcutFactor.toFixed(1)}`,
    );
  }

  function sendWormholeSignal() {
    wormholeDemo.send();
    elements.announcement.textContent = `${elements.wormholeOutput.textContent}. Both diagram markers sent along their assigned animation paths.`;
  }

  elements.horizonMass.addEventListener("input", updateHorizonMass);
  elements.horizonMapMass.addEventListener("input", () => {
    elements.horizonMass.value = elements.horizonMapMass.value;
    updateHorizonMass();
  });
  elements.horizonPosition.addEventListener("input", updateHorizonPosition);
  elements.horizonMapPosition.addEventListener("input", () => {
    elements.horizonPosition.value = elements.horizonMapPosition.value;
    updateHorizonPosition();
  });
  elements.emitLight.addEventListener("click", emitLight);
  elements.timeDirection.addEventListener("input", updateTimeDirection);
  elements.kruskalMapDirection.addEventListener("input", () => {
    elements.timeDirection.value = elements.kruskalMapDirection.value;
    updateTimeDirection();
  });
  elements.kruskalMapRadius.addEventListener("input", () => {
    const radius = Number(elements.kruskalMapRadius.value);
    elements.kruskalMapRadiusOutput.textContent = `${radius.toFixed(2)} rₛ`;
    kruskalMap.setRadius(radius);
  });
  elements.wormholeFold.addEventListener("input", updateWormholeFold);
  elements.wormholeMapRadius.addEventListener("input", () => {
    const radius = Number(elements.wormholeMapRadius.value);
    elements.wormholeMapRadiusOutput.textContent = `${radius.toFixed(2)} rₛ`;
    bridgeMap.setRadius(radius);
  });
  elements.sendWormholeSignal.addEventListener("click", sendWormholeSignal);

  function updateLaserPump() {
    const value = Number(elements.laserPump.value);
    elements.laserMapPump.value = String(value);
    laserMap.setPump(value / 100);
    laserDemo.setPump(value / 100);
    const gain = laserDemo.gain();
    elements.laserPumpOutput.textContent = `${value}%`;
    elements.laserMapPumpOutput.textContent = `${value}%`;
    const readyText = {
      absorbs: "net absorption",
      transparent: "transparent",
      amplifies: "material gain ready",
    }[gain.regime];
    elements.laserOutput.textContent = `${gain.excited} excited · ${readyText}`;
    const valueText = {
      absorbs: `${value} percent excited, net absorption in the teaching model`,
      transparent: `${value} percent excited, the teaching model is transparent`,
      amplifies: `${value} percent excited, positive material gain in the teaching model`,
    }[gain.regime];
    elements.laserPump.setAttribute("aria-valuetext", valueText);
  }

  function firePhoton() {
    const gain = laserDemo.gain();
    laserDemo.fire();
    elements.announcement.textContent = gain.regime === "amplifies"
      ? `${gain.excited} atoms are excited. One resonant photon enters; the idealized cascade adds photons to the same optical mode.`
      : gain.regime === "transparent"
        ? "One resonant photon enters at the transparency point; this teaching model has neither net gain nor net absorption."
        : "One resonant photon enters. The teaching model has net absorption, so the light fades.";
  }

  elements.laserPump.addEventListener("input", updateLaserPump);
  elements.laserMapPump.addEventListener("input", () => {
    elements.laserPump.value = elements.laserMapPump.value;
    updateLaserPump();
  });
  elements.firePhoton.addEventListener("click", firePhoton);

  function accentFor(chapter) {
    const accent = chapter && chapter.dataset.accent;
    if (accent === "matter") return "var(--matter)";
    if (accent === "horizon") return "var(--horizon)";
    if (accent === "wormhole" || accent === "photon") return "var(--wormhole)";
    if (accent === "white-hole") return "var(--paper)";
    return "var(--geometry)";
  }

  function initializeStoryMotion() {
    storyChapters = Array.from(document.querySelectorAll("main > section[id]"));
    const navLinks = Array.from(document.querySelectorAll("[data-nav-for]"));
    const progress = element("worldline-progress");
    const navigation = document.querySelector(".worldline-nav");
    const chapterVisibility = new Map(storyChapters.map((chapter) => [chapter, 0]));

    function previewExperiment(chapter) {
      const demo = demoByChapter[chapter.id];
      if (demo) demo.stage.invalidate();
      const preview = previewByChapter[chapter.id];
      if (!preview || previewedChapters.has(chapter.id)) return;
      previewedChapters.add(chapter.id);
      chapter.classList.add("is-experiment-previewed");
      preview();
      if (demo) demo.stage.invalidate();
    }

    function activate(chapter) {
      if (!chapter) return;
      const index = Math.max(0, storyChapters.indexOf(chapter));
      const denominator = Math.max(1, storyChapters.length - 1);
      const percentage = (index / denominator) * 100;
      storyChapters.forEach((candidate) => {
        const active = candidate === chapter;
        candidate.classList.toggle("is-story-active", active);
      });
      document.documentElement.style.setProperty("--story-progress", `${percentage}%`);
      document.documentElement.style.setProperty("--active-accent", accentFor(chapter));
      progress.style.setProperty("--story-progress", `${percentage}%`);
      const activeDemo = demoByChapter[chapter.id];
      if (activeDemo) activeDemo.stage.invalidate();
      navLinks.forEach((link) => {
        const active = link.dataset.navFor === chapter.id;
        link.classList.toggle("is-active", active);
        if (active) {
          link.setAttribute("aria-current", "step");
          if (navigation && navigation.scrollWidth > navigation.clientWidth) {
            link.scrollIntoView({ block: "nearest", inline: "center", behavior: reducedMotionQuery.matches ? "auto" : "smooth" });
          }
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    updateStoryParallax();
    document.documentElement.classList.add("story-motion-ready");
    if (storyChapters[0]) activate(storyChapters[0]);

    if (typeof IntersectionObserver === "function") {
      chapterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          chapterVisibility.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        const current = Array.from(chapterVisibility.entries())
          .sort((a, b) => b[1] - a[1])[0];
        if (current && current[1] > 0) activate(current[0]);
      }, { rootMargin: "-24% 0px -48%", threshold: [0, 0.12, 0.3, 0.55] });
      storyChapters.forEach((chapter) => chapterObserver.observe(chapter));

      experimentObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const chapter = entry.target.closest(".chapter");
          if (!chapter) return;
          const active = entry.isIntersecting;
          chapter.classList.toggle("is-experiment-active", active);
        });
      }, { rootMargin: `0px 0px ${revealLead}px 0px`, threshold: 0 });

      previewObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const chapter = entry.target.closest(".chapter");
          if (chapter) previewExperiment(chapter);
          previewObserver.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px 80px 0px", threshold: 0 });

      document.querySelectorAll(".chapter .lab-stage").forEach((stage) => {
        experimentObserver.observe(stage);
        previewObserver.observe(stage);
      });
    } else {
      storyChapters.forEach((chapter) => {
        chapter.classList.add("is-story-active", "is-experiment-active");
        previewExperiment(chapter);
      });
    }

    root.addEventListener("scroll", scheduleStoryParallax, { passive: true });
    root.addEventListener("resize", scheduleStoryParallax, { passive: true });
    scheduleStoryParallax();
  }

  function updateReducedMotionLabel() {
    document.documentElement.classList.toggle("system-reduced-motion", reducedMotionQuery.matches);
    allDemos.forEach((demo) => demo.stage.invalidate());
  }

  if (reducedMotionQuery.addEventListener) {
    reducedMotionQuery.addEventListener("change", updateReducedMotionLabel);
  }

  updateFieldDensity();
  updateElevatorAcceleration();
  updateCurvatureMass();
  updateCurvatureSpeed();
  updateHorizonMass();
  updateHorizonPosition();
  updateTimeDirection();
  updateWormholeFold();
  updateLaserPump();
  setElevatorViewpoint("inside");
  initializeEquationTooltips();
  initializeStoryMotion();
  updateReducedMotionLabel();

  root.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    allDemos.forEach((demo) => demo.stage.invalidate());
    scheduleStoryParallax();
  });

  root.addEventListener("pagehide", (event) => {
    if (event.persisted) return;
    if (chapterObserver) chapterObserver.disconnect();
    if (experimentObserver) experimentObserver.disconnect();
    if (previewObserver) previewObserver.disconnect();
    root.removeEventListener("scroll", scheduleStoryParallax);
    root.removeEventListener("resize", scheduleStoryParallax);
    if (storyScrollFrame != null) root.cancelAnimationFrame(storyScrollFrame);
    if (reducedMotionQuery.removeEventListener) {
      reducedMotionQuery.removeEventListener("change", updateReducedMotionLabel);
    }
    allDemos.forEach((demo) => demo.stage.destroy());
  });
})(window);
