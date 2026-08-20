(function attachLaserDemo(root) {
  "use strict";

  const physics = root.EinsteinLabPhysics;
  const stageTools = root.EinsteinLabStage;
  if (!physics || !stageTools) {
    throw new Error("The stimulated-emission demo requires the local physics and stage scripts.");
  }

  function rgba(hex, alpha) {
    const clean = hex.replace("#", "");
    const value = Number.parseInt(clean, 16);
    return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
  }

  function monoFont(size, weight) {
    return `${weight || 650} ${size}px ${getComputedStyle(document.documentElement).getPropertyValue("--mono")}`;
  }

  function gainState(pump, atomCount) {
    const population = physics.laserPopulationState(pump, atomCount || 20);
    const cascade = population.inversion > 0
      ? physics.stimulatedCascade(1, population.inversion, 5)
      : Object.freeze({ photons: 1, excitedAtoms: 0, emitted: 0 });
    return Object.freeze({
      ...population,
      hasInversion: population.regime === "amplifies",
      photons: Math.min(24, cascade.photons),
      emitted: Math.min(23, cascade.emitted),
    });
  }

  function atomLayout(width, height, count) {
    const columns = 5;
    const rows = Math.ceil(count / columns);
    const left = width * 0.17;
    const right = width * 0.79;
    const top = height * 0.24;
    const bottom = height * 0.76;
    const atoms = [];
    for (let index = 0; index < count; index += 1) {
      const column = index % columns;
      const row = Math.floor(index / columns);
      atoms.push({
        x: physics.lerp(left, right, columns === 1 ? 0.5 : column / (columns - 1)),
        y: physics.lerp(top, bottom, rows === 1 ? 0.5 : row / (rows - 1)),
      });
    }
    return atoms;
  }

  function createLaserDemo(canvas, state, onState) {
    const demoState = state || {
      pump: 0.6,
      photonVersion: 0,
      photonStart: null,
    };
    let lastSignature = "";

    function fire() {
      demoState.photonVersion += 1;
      demoState.photonStart = null;
      stage.invalidate();
    }

    const stage = new stageTools.CanvasStage(canvas, (frame) => {
      const { context, width, height, time, colors, reducedMotion, paused } = frame;
      const gain = gainState(demoState.pump, 20);
      const atoms = atomLayout(width, height, gain.total);
      let elapsed = 0;
      if (demoState.photonVersion > 0) {
        if (demoState.photonStart == null) demoState.photonStart = time;
        elapsed = reducedMotion || paused ? 2.4 : Math.max(0, time - demoState.photonStart);
      }
      const cascadeProgress = Math.min(1, elapsed / 1.75);
      const emittedSoFar = Math.round(gain.emitted * cascadeProgress);

      context.save();
      const chamberLeft = width * 0.09;
      const chamberRight = width * 0.88;
      const chamberTop = height * 0.14;
      const chamberBottom = height * 0.86;

      context.fillStyle = rgba(colors.wormhole, 0.035);
      context.fillRect(chamberLeft, chamberTop, chamberRight - chamberLeft, chamberBottom - chamberTop);
      context.strokeStyle = rgba(colors.wormhole, 0.3);
      context.lineWidth = 1;
      context.strokeRect(chamberLeft, chamberTop, chamberRight - chamberLeft, chamberBottom - chamberTop);

      context.strokeStyle = colors.paperBright;
      context.lineWidth = 3;
      context.setLineDash([3, 4]);
      stageTools.line(context, chamberLeft, chamberTop + 8, chamberLeft, chamberBottom - 8);
      context.setLineDash([]);
      context.strokeStyle = rgba(colors.paperBright, 0.48);
      context.lineWidth = 2;
      stageTools.line(context, chamberRight, chamberTop + 8, chamberRight, chamberBottom - 8);

      context.font = monoFont(8, 700);
      context.textAlign = "center";
      context.fillStyle = rgba(colors.paper, 0.42);
      context.fillText("SOME LIGHT ESCAPES", chamberLeft, chamberTop - 12);
      context.fillText("MIRROR", chamberRight, chamberTop - 12);

      const activeExcited = Math.max(0, gain.excited - emittedSoFar);
      atoms.forEach((atom, index) => {
        const excited = index < activeExcited;
        const wasEmitted = index >= activeExcited && index < gain.excited;
        const pulse = reducedMotion || paused ? 0 : Math.sin(time * 2.4 + index * 0.62) * 1.4;
        context.strokeStyle = excited
          ? colors.matter
          : wasEmitted
            ? colors.photon
            : rgba(colors.geometry, 0.56);
        context.lineWidth = excited ? 2 : 1;
        context.beginPath();
        context.arc(atom.x, atom.y, 8 + (excited ? pulse : 0), 0, physics.TAU);
        context.stroke();
        context.fillStyle = excited ? rgba(colors.matter, 0.22) : rgba(colors.geometry, 0.08);
        context.fill();
        context.fillStyle = excited ? colors.matter : colors.geometry;
        context.beginPath();
        context.arc(atom.x, atom.y, 2.2, 0, physics.TAU);
        context.fill();

        if (excited) {
          context.strokeStyle = rgba(colors.matter, 0.52);
          context.beginPath();
          context.moveTo(atom.x - 5, atom.y - 12);
          context.lineTo(atom.x, atom.y - 17);
          context.lineTo(atom.x + 5, atom.y - 12);
          context.stroke();
        }
      });

      if (demoState.photonVersion > 0) {
        const baseProgress = Math.min(1, elapsed / (gain.hasInversion ? 1.55 : 1.1));
        const primaryX = physics.lerp(0, chamberRight + 28, baseProgress);
        const fade = gain.regime === "absorbs" ? Math.max(0.12, 1 - baseProgress * 0.9) : 1;
        context.strokeStyle = rgba(colors.photon, fade * 0.5);
        context.fillStyle = rgba(colors.photon, fade);
        context.lineWidth = 1.4;
        context.shadowColor = colors.photon;
        context.shadowBlur = gain.hasInversion ? 11 : 3;
        stageTools.line(context, 0, height * 0.5, primaryX, height * 0.5);
        context.beginPath();
        context.arc(primaryX, height * 0.5, 4, 0, physics.TAU);
        context.fill();

        const photonCount = gain.hasInversion ? Math.max(1, Math.round(physics.lerp(1, gain.photons, cascadeProgress))) : 1;
        for (let photon = 1; photon < photonCount; photon += 1) {
          const generation = Math.floor(Math.log2(photon + 1));
          const lane = (photon % 7) - 3;
          const delay = generation * 0.11;
          const progress = physics.clamp((baseProgress - delay) / Math.max(0.15, 1 - delay), 0, 1);
          const x = physics.lerp(width * 0.28 + generation * 22, chamberRight + 26, progress);
          const y = height * 0.5 + lane * 7;
          context.globalAlpha = Math.max(0.22, 1 - generation * 0.08);
          context.beginPath();
          context.arc(x, y, 2.4, 0, physics.TAU);
          context.fill();
        }
        context.globalAlpha = 1;
        context.shadowBlur = 0;
      }

      const populationY = height - 25;
      const populationLeft = width * 0.17;
      const populationWidth = width * 0.62;
      context.fillStyle = rgba(colors.paper, 0.1);
      context.fillRect(populationLeft, populationY, populationWidth, 3);
      context.fillStyle = gain.regime === "amplifies" ? colors.photon : colors.matter;
      context.fillRect(populationLeft, populationY, populationWidth * gain.representedFraction, 3);
      context.font = monoFont(8, 700);
      context.textAlign = "left";
      context.fillStyle = gain.regime === "amplifies" ? colors.photon : rgba(colors.paper, 0.5);
      const regimeText = {
        absorbs: "MORE LOWER-STATE ATOMS · NET ABSORPTION",
        transparent: "EQUAL POPULATIONS · TRANSPARENT",
        amplifies: "MORE EXCITED ATOMS · MATERIAL GAIN",
      }[gain.regime];
      context.fillText(regimeText, populationLeft, populationY - 9);

      context.textAlign = "right";
      context.fillStyle = rgba(colors.paper, 0.44);
      context.fillText("RESONANT PHOTON · SAME OPTICAL MODE", width - 13, height - 12);
      context.restore();

      const signature = `${gain.excited}:${gain.photons}:${demoState.photonVersion}:${Math.round(cascadeProgress * 10)}`;
      if (signature !== lastSignature) {
        lastSignature = signature;
        if (typeof onState === "function") {
          onState(Object.freeze({
            gain,
            fired: demoState.photonVersion > 0,
            completed: cascadeProgress >= 1,
            visiblePhotons: gain.hasInversion
              ? Math.max(1, Math.round(physics.lerp(1, gain.photons, cascadeProgress)))
              : demoState.photonVersion > 0 ? 1 : 0,
          }));
        }
      }
    }, { animated: true });

    return Object.freeze({
      stage,
      state: demoState,
      fire,
      setPump(value) {
        demoState.pump = physics.clamp(value, 0, 1);
        demoState.photonVersion = 0;
        demoState.photonStart = null;
        stage.invalidate();
      },
      gain() {
        return gainState(demoState.pump, 20);
      },
    });
  }

  root.EinsteinLabLaserDemo = Object.freeze({
    ready: true,
    createLaserDemo,
    gainState,
  });
})(typeof window !== "undefined" ? window : globalThis);
