(function attachEinsteinLabPhysics(root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.EinsteinLabPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createEinsteinLabPhysics() {
  "use strict";

  const GRAVITATIONAL_CONSTANT = 6.6743e-11;
  const SPEED_OF_LIGHT = 299792458;
  const SOLAR_MASS_KG = 1.98847e30;
  const EARTH_MASS_KG = 5.9722e24;
  const PLANCK_CONSTANT = 6.62607015e-34;
  const ELECTRON_VOLT_JOULES = 1.602176634e-19;
  const EARTH_GRAVITY = 9.80665;
  const TAU = Math.PI * 2;

  function finiteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, finiteNumber(value, minimum)));
  }

  function lerp(from, to, amount) {
    return from + (to - from) * amount;
  }

  function damp(from, to, lambda, deltaSeconds) {
    return lerp(from, to, 1 - Math.exp(-lambda * Math.max(0, deltaSeconds)));
  }

  function mapTransitionValue(current, target, deltaSeconds) {
    const from = finiteNumber(current, 0);
    const to = finiteNumber(target, from);
    if (Math.abs(to - from) < 1e-4) return to;
    const next = damp(from, to, 11, deltaSeconds);
    return Math.abs(to - next) < 1e-4 ? to : next;
  }

  function mod(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  }

  function schwarzschildRadiusMetresForKilograms(massKilograms) {
    const mass = Math.max(0, finiteNumber(massKilograms, 0));
    return (2 * GRAVITATIONAL_CONSTANT * mass) / (SPEED_OF_LIGHT * SPEED_OF_LIGHT);
  }

  function schwarzschildRadiusKm(solarMasses) {
    return schwarzschildRadiusMetresForKilograms(
      Math.max(0, finiteNumber(solarMasses, 0)) * SOLAR_MASS_KG,
    ) / 1000;
  }

  function schwarzschildRadiusMillimetresForEarthMass(earthMasses) {
    return schwarzschildRadiusMetresForKilograms(
      Math.max(0, finiteNumber(earthMasses, 0)) * EARTH_MASS_KG,
    ) * 1000;
  }

  function riverSpeedFraction(radiusInSchwarzschildRadii) {
    const radius = Math.max(1e-9, finiteNumber(radiusInSchwarzschildRadii, 1));
    return Math.sqrt(1 / radius);
  }

  function blackHoleRadialLightSpeeds(radiusInSchwarzschildRadii) {
    const flow = riverSpeedFraction(radiusInSchwarzschildRadii);
    return Object.freeze({
      outward: 1 - flow,
      inward: -1 - flow,
      river: -flow,
    });
  }

  function horizonCoordinatePoint(solarMasses, radiusInSchwarzschildRadii) {
    const mass = Math.max(0, finiteNumber(solarMasses, 0));
    const radiusRatio = Math.max(1e-9, finiteNumber(radiusInSchwarzschildRadii, 1));
    const horizonRadiusKm = schwarzschildRadiusKm(mass);
    const rates = blackHoleRadialLightSpeeds(radiusRatio);
    return Object.freeze({
      mass,
      radiusRatio,
      horizonRadiusKm,
      physicalRadiusKm: radiusRatio * horizonRadiusKm,
      outward: rates.outward,
      inward: rates.inward,
    });
  }

  function whiteHoleRadialLightSpeeds(radiusInSchwarzschildRadii) {
    const flow = riverSpeedFraction(radiusInSchwarzschildRadii);
    return Object.freeze({
      outward: 1 + flow,
      inward: -1 + flow,
      river: flow,
    });
  }

  function horizonZone(radiusInSchwarzschildRadii, tolerance) {
    const radius = finiteNumber(radiusInSchwarzschildRadii, 1);
    const epsilon = tolerance == null ? 0.035 : Math.max(0, tolerance);
    if (Math.abs(radius - 1) <= epsilon) return "horizon";
    return radius < 1 ? "inside" : "outside";
  }

  function compactKruskalPoint(nullU, nullV) {
    const compactU = Math.atan(finiteNumber(nullU, 0));
    const compactV = Math.atan(finiteNumber(nullV, 0));
    return Object.freeze({
      time: (compactV + compactU) / Math.PI,
      space: (compactV - compactU) / Math.PI,
    });
  }

  function kruskalRegion(time, space, tolerance) {
    const timeCoordinate = finiteNumber(time, 0);
    const spaceCoordinate = finiteNumber(space, 0);
    const epsilon = tolerance == null ? 0.015 : Math.max(0, tolerance);
    const absoluteTime = Math.abs(timeCoordinate);
    const absoluteSpace = Math.abs(spaceCoordinate);
    if (Math.abs(absoluteTime - absoluteSpace) <= epsilon) return "horizon";
    if (timeCoordinate > absoluteSpace) return "black-hole";
    if (timeCoordinate < -absoluteSpace) return "white-hole";
    return spaceCoordinate >= 0 ? "right-exterior" : "left-exterior";
  }

  function cubicKruskalPath(direction, progress, points) {
    const timeDirection = finiteNumber(direction, 1) < 0 ? -1 : 1;
    const amount = clamp(progress, 0, 1);
    const pathAmount = timeDirection < 0 ? 1 - amount : amount;
    const inverse = 1 - pathAmount;
    const [start, controlA, controlB, end] = points;
    const spaceCoordinate =
      inverse ** 3 * start.space +
      3 * inverse * inverse * pathAmount * controlA.space +
      3 * inverse * pathAmount * pathAmount * controlB.space +
      pathAmount ** 3 * end.space;
    const timeCoordinate =
      inverse ** 3 * start.time +
      3 * inverse * inverse * pathAmount * controlA.time +
      3 * inverse * pathAmount * pathAmount * controlB.time +
      pathAmount ** 3 * end.time;
    return Object.freeze({
      time: timeDirection < 0 ? -timeCoordinate : timeCoordinate,
      space: spaceCoordinate,
    });
  }

  function kruskalCausalPath(direction, progress) {
    return cubicKruskalPath(direction, progress, [
      { space: 0.86, time: -0.12 },
      { space: 0.72, time: 8 / 75 },
      { space: 0.26, time: 49 / 75 },
      { space: 0, time: 1 },
    ]);
  }

  function compactKruskalCausalPath(direction, progress) {
    return cubicKruskalPath(direction, progress, [
      { space: 0.62, time: -0.48 },
      { space: 0.54, time: -0.28 },
      { space: 0.2, time: 0.38 },
      { space: 0, time: 0.72 },
    ]);
  }

  function compareWormholePaths(ordinaryDistance, throatDistance) {
    const ordinary = Math.max(0, finiteNumber(ordinaryDistance, 0));
    const throat = Math.max(1e-9, finiteNumber(throatDistance, 1e-9));
    return Object.freeze({ ordinary, throat, shortcutFactor: ordinary / throat });
  }

  function photonEnergyElectronVolts(wavelengthNanometres) {
    const wavelengthMetres = Math.max(1e-15, finiteNumber(wavelengthNanometres, 1)) * 1e-9;
    return (PLANCK_CONSTANT * SPEED_OF_LIGHT) / wavelengthMetres / ELECTRON_VOLT_JOULES;
  }

  function stimulatedCascade(initialPhotons, excitedAtoms, generations) {
    let photons = Math.max(0, Math.floor(finiteNumber(initialPhotons, 0)));
    let excited = Math.max(0, Math.floor(finiteNumber(excitedAtoms, 0)));
    const rounds = Math.max(0, Math.floor(finiteNumber(generations, 0)));
    let emitted = 0;

    for (let generation = 0; generation < rounds && excited > 0 && photons > 0; generation += 1) {
      const additions = Math.min(photons, excited);
      photons += additions;
      excited -= additions;
      emitted += additions;
    }

    return Object.freeze({ photons, excitedAtoms: excited, emitted });
  }

  function equivalenceDropMetres(accelerationInEarthGravities, horizontalDistanceMetres) {
    const acceleration = Math.max(0, finiteNumber(accelerationInEarthGravities, 0)) * EARTH_GRAVITY;
    const distance = Math.max(0, finiteNumber(horizontalDistanceMetres, 0));
    const flightTime = distance / SPEED_OF_LIGHT;
    return 0.5 * acceleration * flightTime * flightTime;
  }

  function equivalenceDropFemtometres(accelerationInEarthGravities, horizontalDistanceMetres) {
    return equivalenceDropMetres(accelerationInEarthGravities, horizontalDistanceMetres) * 1e15;
  }

  function fieldEquationComponentBalance(sourceComponent, backgroundComponent) {
    const source = clamp(sourceComponent, 0, 1);
    const background = clamp(backgroundComponent, 0, 0.2);
    const curvature = source - background;
    return Object.freeze({
      source,
      background,
      curvature,
      geometrySide: curvature + background,
    });
  }

  function radialAccelerationRelative(radiusInReferenceUnits, massMultiplier) {
    const radius = Math.max(1e-9, finiteNumber(radiusInReferenceUnits, 1));
    const mass = Math.max(0, finiteNumber(massMultiplier, 0));
    return -mass / (radius * radius);
  }

  function laserNetGainRelative(excitedFraction) {
    return 2 * clamp(excitedFraction, 0, 1) - 1;
  }

  function laserGainRegime(excitedFraction) {
    const gain = laserNetGainRelative(excitedFraction);
    if (Math.abs(gain) <= 1e-12) return "transparent";
    return gain > 0 ? "amplifies" : "absorbs";
  }

  function laserPopulationState(excitedFraction, atomCount) {
    const total = Math.max(2, Math.floor(finiteNumber(atomCount, 20)));
    const excited = Math.round(clamp(excitedFraction, 0, 1) * total);
    const ground = total - excited;
    const representedFraction = excited / total;
    const regime = laserGainRegime(representedFraction);
    return Object.freeze({
      total,
      excited,
      ground,
      representedFraction,
      regime,
      inversion: Math.max(0, excited - ground),
    });
  }

  function schwarzschildEmbeddingHeight(radius, schwarzschildRadius) {
    const throat = Math.max(1e-9, finiteNumber(schwarzschildRadius, 1));
    const radialCoordinate = Math.max(throat, finiteNumber(radius, throat));
    return 2 * Math.sqrt(throat * (radialCoordinate - throat));
  }

  function kruskalRadialInvariant(radiusInSchwarzschildRadii) {
    const radius = Math.max(0, finiteNumber(radiusInSchwarzschildRadii, 1));
    return (radius - 1) * Math.exp(radius);
  }

  function gridWarp(x, y, compactness) {
    const strength = clamp(compactness, 0, 1);
    const radiusSquared = x * x + y * y;
    const radius = Math.sqrt(radiusSquared) + 1e-6;
    const envelope = Math.exp(-radiusSquared * 2.6);
    const pull = strength * envelope * 0.34;
    return Object.freeze({
      x: x - (x / radius) * pull,
      y: y - (y / radius) * pull,
      depth: -strength * envelope,
    });
  }

  function gravitationalAcceleration(x, y, massMultiplier) {
    const radiusSquared = Math.max(0.035, x * x + y * y);
    const radius = Math.sqrt(radiusSquared);
    const factor = -Math.max(0, finiteNumber(massMultiplier, 1)) / (radiusSquared * radius);
    return Object.freeze({ x: x * factor, y: y * factor });
  }

  function createOrbitState(massMultiplier, speedMultiplier) {
    const mass = Math.max(0.05, finiteNumber(massMultiplier, 1));
    const speed = Math.max(0, finiteNumber(speedMultiplier, 1));
    const radius = 1.36;
    return {
      x: radius,
      y: 0,
      vx: 0,
      vy: Math.sqrt(mass / radius) * speed,
      trail: [],
      elapsed: 0,
      escaped: false,
      collided: false,
    };
  }

  function stepOrbit(state, massMultiplier, deltaSeconds) {
    const dt = clamp(deltaSeconds, 0, 0.025);
    if (!state || state.escaped || state.collided || dt <= 0) return state;

    const acceleration = gravitationalAcceleration(state.x, state.y, massMultiplier);
    state.vx += acceleration.x * dt;
    state.vy += acceleration.y * dt;
    state.x += state.vx * dt;
    state.y += state.vy * dt;
    state.elapsed += dt;

    const radius = Math.hypot(state.x, state.y);
    state.collided = radius < 0.24;
    state.escaped = radius > 4.8;

    if (state.trail.length === 0 || state.elapsed - state.trail[state.trail.length - 1].time > 0.018) {
      state.trail.push({ x: state.x, y: state.y, time: state.elapsed });
      if (state.trail.length > 560) state.trail.shift();
    }
    return state;
  }

  function orbitClassification(state) {
    if (!state) return "ready";
    if (state.collided) return "collision course";
    if (state.escaped) return "escape path";
    const radius = Math.hypot(state.x, state.y);
    if (radius > 2.8) return "wide arc";
    if (radius < 0.52) return "plunging path";
    return "bound orbit";
  }

  function wavelengthToRgb(wavelengthNanometres) {
    const wavelength = clamp(wavelengthNanometres, 380, 750);
    let red = 0;
    let green = 0;
    let blue = 0;

    if (wavelength < 440) {
      red = -(wavelength - 440) / 60;
      blue = 1;
    } else if (wavelength < 490) {
      green = (wavelength - 440) / 50;
      blue = 1;
    } else if (wavelength < 510) {
      green = 1;
      blue = -(wavelength - 510) / 20;
    } else if (wavelength < 580) {
      red = (wavelength - 510) / 70;
      green = 1;
    } else if (wavelength < 645) {
      red = 1;
      green = -(wavelength - 645) / 65;
    } else {
      red = 1;
    }

    const edge = wavelength < 420
      ? 0.3 + (0.7 * (wavelength - 380)) / 40
      : wavelength > 700
        ? 0.3 + (0.7 * (750 - wavelength)) / 50
        : 1;

    return `rgb(${Math.round(255 * red * edge)}, ${Math.round(255 * green * edge)}, ${Math.round(255 * blue * edge)})`;
  }

  return Object.freeze({
    GRAVITATIONAL_CONSTANT,
    SPEED_OF_LIGHT,
    SOLAR_MASS_KG,
    EARTH_MASS_KG,
    PLANCK_CONSTANT,
    ELECTRON_VOLT_JOULES,
    EARTH_GRAVITY,
    TAU,
    finiteNumber,
    clamp,
    lerp,
    damp,
    mapTransitionValue,
    mod,
    schwarzschildRadiusMetresForKilograms,
    schwarzschildRadiusKm,
    schwarzschildRadiusMillimetresForEarthMass,
    riverSpeedFraction,
    blackHoleRadialLightSpeeds,
    horizonCoordinatePoint,
    whiteHoleRadialLightSpeeds,
    horizonZone,
    compactKruskalPoint,
    kruskalRegion,
    kruskalCausalPath,
    compactKruskalCausalPath,
    compareWormholePaths,
    photonEnergyElectronVolts,
    stimulatedCascade,
    equivalenceDropMetres,
    equivalenceDropFemtometres,
    fieldEquationComponentBalance,
    radialAccelerationRelative,
    laserNetGainRelative,
    laserGainRegime,
    laserPopulationState,
    schwarzschildEmbeddingHeight,
    kruskalRadialInvariant,
    gridWarp,
    gravitationalAcceleration,
    createOrbitState,
    stepOrbit,
    orbitClassification,
    wavelengthToRgb,
  });
});
