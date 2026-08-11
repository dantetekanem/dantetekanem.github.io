(function attachEinsteinLabMathMaps(root) {
  "use strict";

  const physics = root.EinsteinLabPhysics;
  const stageTools = root.EinsteinLabStage;

  if (!physics || !stageTools) {
    root.EinsteinLabMathMaps = Object.freeze({ ready: false });
    return;
  }

  function plotGeometry(width, height, ranges) {
    const compact = width < 560;
    const left = compact ? 54 : 76;
    const right = compact ? 16 : 28;
    const top = compact ? 22 : 28;
    const bottom = compact ? 50 : 58;
    const plotWidth = Math.max(1, width - left - right);
    const plotHeight = Math.max(1, height - top - bottom);

    return Object.freeze({
      compact,
      left,
      right,
      top,
      bottom,
      width: plotWidth,
      height: plotHeight,
      x(value) {
        return left + ((value - ranges.xMin) / (ranges.xMax - ranges.xMin)) * plotWidth;
      },
      y(value) {
        return top + plotHeight - ((value - ranges.yMin) / (ranges.yMax - ranges.yMin)) * plotHeight;
      },
    });
  }

  function logarithmicXGeometry(width, height, ranges) {
    const geometry = plotGeometry(width, height, ranges);
    const minimum = Math.log(ranges.xMin);
    const span = Math.log(ranges.xMax) - minimum;
    return Object.freeze({
      ...geometry,
      x(value) {
        return geometry.left + ((Math.log(Math.max(ranges.xMin, value)) - minimum) / span) * geometry.width;
      },
    });
  }

  function drawAxes(context, geometry, options) {
    const { width, height, left, top } = geometry;
    const right = left + width;
    const bottom = top + height;
    const labelFont = geometry.compact ? "600 8px SFMono-Regular, Consolas, monospace" : "600 9px SFMono-Regular, Consolas, monospace";
    const axisFont = geometry.compact ? "650 8px SFMono-Regular, Consolas, monospace" : "650 9px SFMono-Regular, Consolas, monospace";

    context.save();
    context.lineWidth = 1;
    context.font = labelFont;
    context.fillStyle = "rgba(238, 232, 216, 0.42)";
    context.strokeStyle = "rgba(238, 232, 216, 0.09)";

    options.xTicks.forEach((tick) => {
      const x = geometry.x(tick.value);
      context.beginPath();
      context.moveTo(x, top);
      context.lineTo(x, bottom);
      context.stroke();
      context.textAlign = "center";
      context.textBaseline = "top";
      context.fillText(tick.label, x, bottom + 9);
    });

    options.yTicks.forEach((tick) => {
      const y = geometry.y(tick.value);
      context.beginPath();
      context.moveTo(left, y);
      context.lineTo(right, y);
      context.stroke();
      context.textAlign = "right";
      context.textBaseline = "middle";
      context.fillText(tick.label, left - 8, y);
    });

    context.strokeStyle = "rgba(238, 232, 216, 0.34)";
    context.beginPath();
    context.moveTo(left, top);
    context.lineTo(left, bottom);
    context.lineTo(right, bottom);
    context.stroke();

    context.fillStyle = "rgba(238, 232, 216, 0.62)";
    context.font = axisFont;
    context.textAlign = "center";
    context.textBaseline = "bottom";
    context.fillText(options.xLabel, left + width / 2, bottom + (geometry.compact ? 42 : 49));

    context.save();
    context.translate(geometry.compact ? 11 : 15, top + height / 2);
    context.rotate(-Math.PI / 2);
    context.textAlign = "center";
    context.textBaseline = "top";
    context.fillText(options.yLabel, 0, 0);
    context.restore();
    context.restore();
  }

  function drawSeries(context, geometry, from, to, samples, valueForX, color, lineWidth, dash) {
    context.save();
    context.strokeStyle = color;
    context.lineWidth = lineWidth == null ? 2 : lineWidth;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.setLineDash(dash || []);
    context.beginPath();
    for (let index = 0; index <= samples; index += 1) {
      const xValue = physics.lerp(from, to, index / samples);
      const yValue = valueForX(xValue);
      const x = geometry.x(xValue);
      const y = geometry.y(yValue);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
    context.restore();
  }

  function drawParametric(context, geometry, from, to, samples, pointForAmount, color, lineWidth, dash) {
    context.save();
    context.strokeStyle = color;
    context.lineWidth = lineWidth == null ? 2 : lineWidth;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.setLineDash(dash || []);
    context.beginPath();
    for (let index = 0; index <= samples; index += 1) {
      const amount = physics.lerp(from, to, index / samples);
      const point = pointForAmount(amount);
      const x = geometry.x(point.x);
      const y = geometry.y(point.y);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
    context.restore();
  }

  function drawMarker(context, x, y, color, label, align) {
    context.save();
    context.fillStyle = color;
    context.strokeStyle = "rgba(8, 11, 19, 0.9)";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(x, y, 5.5, 0, physics.TAU);
    context.fill();
    context.stroke();
    if (label) {
      context.font = "700 8px SFMono-Regular, Consolas, monospace";
      context.textAlign = align || "left";
      context.textBaseline = "bottom";
      context.fillStyle = color;
      context.fillText(label, x + (align === "right" ? -10 : 10), y - 7);
    }
    context.restore();
  }

  function drawPlotNote(context, text, x, y, color, align) {
    context.save();
    context.font = "650 8px SFMono-Regular, Consolas, monospace";
    context.textAlign = align || "left";
    context.textBaseline = "middle";
    context.fillStyle = color;
    context.fillText(text, x, y);
    context.restore();
  }

  function updateAnimatedValues(frame, state, pairs) {
    let animating = false;
    pairs.forEach(([valueKey, targetKey]) => {
      const target = state[targetKey];
      if (frame.paused || frame.reducedMotion) state[valueKey] = target;
      else state[valueKey] = physics.mapTransitionValue(state[valueKey], target, frame.deltaSeconds);
      if (Math.abs(state[valueKey] - target) >= 1e-4) animating = true;
    });
    state.animating = animating;
  }

  function beginMapAnimation(stage, state) {
    state.animating = true;
    stage.invalidate();
  }

  function createStaticMap(canvas, state, draw) {
    state.animating = false;
    const stage = new stageTools.CanvasStage(
      canvas,
      (frame) => draw(frame, state),
      { animated: () => state.animating, initiallyVisible: false },
    );
    return stage;
  }

  function createLiftMap(canvas, initialState) {
    const startingAcceleration = Math.max(0, physics.finiteNumber(initialState && initialState.acceleration, 1));
    const state = {
      acceleration: startingAcceleration,
      targetAcceleration: startingAcceleration,
      distance: 3,
      onUpdate: initialState && typeof initialState.onUpdate === "function" ? initialState.onUpdate : null,
    };
    const ranges = { xMin: 0, xMax: 3, yMin: 0, yMax: 1.08 };
    const stage = createStaticMap(canvas, state, (frame) => {
      const { context, width, height, colors } = frame;
      updateAnimatedValues(frame, state, [["acceleration", "targetAcceleration"]]);
      const geometry = plotGeometry(width, height, ranges);
      drawAxes(context, geometry, {
        xLabel: "DISTANCE ACROSS LIFT  L  (m)",
        yLabel: "BEAM-DROP MAGNITUDE  |Δy|  (fm)",
        xTicks: [0, 1, 2, 3].map((value) => ({ value, label: String(value) })),
        yTicks: [0, 0.25, 0.5, 0.75, 1].map((value) => ({ value, label: value.toFixed(value === 0 || value === 1 ? 0 : 2) })),
      });

      drawSeries(
        context,
        geometry,
        0,
        state.distance,
        80,
        (distance) => physics.equivalenceDropFemtometres(1, distance),
        "rgba(238, 232, 216, 0.2)",
        1.2,
        [4, 5],
      );
      drawSeries(
        context,
        geometry,
        0,
        state.distance,
        80,
        (distance) => physics.equivalenceDropFemtometres(state.acceleration, distance),
        colors.matter,
        2.4,
      );

      const drop = physics.equivalenceDropFemtometres(state.acceleration, state.distance);
      drawMarker(context, geometry.x(state.distance), geometry.y(drop), colors.matter, `${state.acceleration.toFixed(1)} g`, "right");
      drawPlotNote(context, "1 g reference", geometry.x(1.9), geometry.y(physics.equivalenceDropFemtometres(1, 1.9)) - 11, "rgba(238, 232, 216, 0.38)");
      if (state.onUpdate) state.onUpdate({
        acceleration: state.acceleration,
        distance: state.distance,
        dropFemtometres: drop,
      });
    });

    return Object.freeze({
      stage,
      setAcceleration(value) {
        state.targetAcceleration = Math.max(0, physics.finiteNumber(value, 0));
        beginMapAnimation(stage, state);
      },
      values() {
        return Object.freeze({
          acceleration: state.acceleration,
          distance: state.distance,
          dropFemtometres: physics.equivalenceDropFemtometres(state.acceleration, state.distance),
        });
      },
    });
  }

  function createFieldMap(canvas, initialState) {
    const startingDensity = physics.clamp(initialState && initialState.density, 0, 1);
    const requestedBackground = initialState && initialState.background != null
      ? initialState.background
      : 0.04;
    const startingBackground = physics.clamp(requestedBackground, 0, 0.2);
    const state = {
      density: startingDensity,
      targetDensity: startingDensity,
      background: startingBackground,
      targetBackground: startingBackground,
      onUpdate: initialState && typeof initialState.onUpdate === "function" ? initialState.onUpdate : null,
    };
    const ranges = { xMin: 0, xMax: 1, yMin: -0.2, yMax: 1 };
    const stage = createStaticMap(canvas, state, (frame) => {
      const { context, width, height, colors } = frame;
      updateAnimatedValues(frame, state, [
        ["density", "targetDensity"],
        ["background", "targetBackground"],
      ]);
      const geometry = plotGeometry(width, height, ranges);
      drawAxes(context, geometry, {
        xLabel: "SOURCE COMPONENT  κTμν  (NORMALIZED)",
        yLabel: "CURVATURE COMPONENT  Gμν  (NORMALIZED)",
        xTicks: [0, 0.25, 0.5, 0.75, 1].map((value) => ({ value, label: value.toFixed(value === 0 || value === 1 ? 0 : 2) })),
        yTicks: [-0.2, 0, 0.25, 0.5, 0.75, 1].map((value) => ({ value, label: value > 0 ? `+${value.toFixed(value === 1 ? 0 : 2)}` : value.toFixed(value === 0 ? 0 : 1) })),
      });

      context.save();
      context.fillStyle = "rgba(185, 162, 255, 0.1)";
      context.beginPath();
      context.moveTo(geometry.x(0), geometry.y(0));
      context.lineTo(geometry.x(1), geometry.y(1));
      context.lineTo(geometry.x(1), geometry.y(1 - state.background));
      context.lineTo(geometry.x(0), geometry.y(-state.background));
      context.closePath();
      context.fill();
      context.restore();

      drawSeries(
        context,
        geometry,
        0,
        1,
        2,
        (source) => source,
        "rgba(238, 232, 216, 0.34)",
        1.2,
        [5, 5],
      );
      drawSeries(
        context,
        geometry,
        0,
        1,
        2,
        (source) => physics.fieldEquationComponentBalance(source, state.background).curvature,
        colors.geometry,
        2.6,
      );

      const balance = physics.fieldEquationComponentBalance(state.density, state.background);
      context.save();
      context.strokeStyle = "rgba(242, 180, 95, 0.42)";
      context.lineWidth = 1;
      context.setLineDash([4, 5]);
      context.beginPath();
      context.moveTo(geometry.x(state.density), geometry.y(ranges.yMin));
      context.lineTo(geometry.x(state.density), geometry.y(balance.curvature));
      context.lineTo(geometry.x(0), geometry.y(balance.curvature));
      context.stroke();
      context.restore();

      drawMarker(
        context,
        geometry.x(state.density),
        geometry.y(balance.curvature),
        colors.matter,
        `SOURCE ${Math.round(state.density * 100)}% → G ${Math.round(balance.curvature * 100)}%`,
        state.density > 0.7 ? "right" : "left",
      );
      drawPlotNote(context, "NO BACKGROUND: G = κT", geometry.x(0.58), geometry.y(0.58) - 11, "rgba(238, 232, 216, 0.5)");
      drawPlotNote(context, "WITH Λg: G = κT − Λg", geometry.x(0.58), geometry.y(0.58 - state.background) + 12, colors.geometry);
      drawPlotNote(context, `Λg OFFSET ${Math.round(state.background * 100)}%`, geometry.x(0.07), geometry.y(-state.background) - 10, colors.wormhole);

      if (state.onUpdate) state.onUpdate(balance);
    });

    return Object.freeze({
      stage,
      setDensity(value) {
        state.targetDensity = physics.clamp(value, 0, 1);
        beginMapAnimation(stage, state);
      },
      setBackground(value) {
        state.targetBackground = physics.clamp(value, 0, 0.2);
        beginMapAnimation(stage, state);
      },
      values() {
        return physics.fieldEquationComponentBalance(state.density, state.background);
      },
    });
  }

  function createCurvatureMap(canvas, initialState) {
    const startingMass = Math.max(0.05, physics.finiteNumber(initialState && initialState.mass, 1));
    const state = {
      mass: startingMass,
      targetMass: startingMass,
      launchRadius: 1.36,
      onUpdate: initialState && typeof initialState.onUpdate === "function" ? initialState.onUpdate : null,
    };
    const ranges = { xMin: 0.75, xMax: 4, yMin: 0, yMax: 4.5 };
    const stage = createStaticMap(canvas, state, (frame) => {
      const { context, width, height, colors } = frame;
      updateAnimatedValues(frame, state, [["mass", "targetMass"]]);
      const geometry = plotGeometry(width, height, ranges);
      drawAxes(context, geometry, {
        xLabel: "DISTANCE FROM CENTRE  r  (REFERENCE UNITS)",
        yLabel: "INWARD ACCELERATION  |aᵣ|",
        xTicks: [0.75, 1, 2, 3, 4].map((value) => ({ value, label: String(value) })),
        yTicks: [0, 1, 2, 3, 4].map((value) => ({ value, label: String(value) })),
      });

      drawSeries(
        context,
        geometry,
        ranges.xMin,
        ranges.xMax,
        100,
        (radius) => Math.abs(physics.radialAccelerationRelative(radius, 1)),
        "rgba(238, 232, 216, 0.2)",
        1.2,
        [4, 5],
      );
      drawSeries(
        context,
        geometry,
        ranges.xMin,
        ranges.xMax,
        100,
        (radius) => Math.abs(physics.radialAccelerationRelative(radius, state.mass)),
        colors.geometry,
        2.4,
      );
      const acceleration = Math.abs(physics.radialAccelerationRelative(state.launchRadius, state.mass));
      drawMarker(context, geometry.x(state.launchRadius), geometry.y(acceleration), colors.geometry, "LAUNCH RADIUS");
      drawPlotNote(context, "1× MASS", geometry.x(2.75), geometry.y(Math.abs(physics.radialAccelerationRelative(2.75, 1))) - 10, "rgba(238, 232, 216, 0.38)");
      if (state.onUpdate) state.onUpdate({
        mass: state.mass,
        launchRadius: state.launchRadius,
        acceleration: physics.radialAccelerationRelative(state.launchRadius, state.mass),
      });
    });

    return Object.freeze({
      stage,
      setMass(value) {
        state.targetMass = Math.max(0.05, physics.finiteNumber(value, 1));
        beginMapAnimation(stage, state);
      },
      values() {
        return Object.freeze({
          mass: state.mass,
          launchRadius: state.launchRadius,
          acceleration: physics.radialAccelerationRelative(state.launchRadius, state.mass),
        });
      },
    });
  }

  function createHorizonMap(canvas, initialState) {
    const startingMass = Math.max(1, physics.finiteNumber(initialState && initialState.mass, 10));
    const startingRadius = physics.clamp(physics.finiteNumber(initialState && initialState.radius, 2.4), 0.35, 4);
    const state = {
      mass: startingMass,
      targetMass: startingMass,
      radius: startingRadius,
      targetRadius: startingRadius,
      onUpdate: initialState && typeof initialState.onUpdate === "function" ? initialState.onUpdate : null,
    };
    const ranges = { xMin: 1, xMax: 1200, yMin: -3.1, yMax: 1 };
    const stage = createStaticMap(canvas, state, (frame) => {
      const { context, width, height, colors } = frame;
      updateAnimatedValues(frame, state, [
        ["mass", "targetMass"],
        ["radius", "targetRadius"],
      ]);
      const geometry = logarithmicXGeometry(width, height, ranges);
      const point = physics.horizonCoordinatePoint(state.mass, state.radius);
      const horizonRadiusKm = point.horizonRadiusKm;
      drawAxes(context, geometry, {
        xLabel: "PHYSICAL DISTANCE FROM CENTRE  r  (KM · LOG SCALE)",
        yLabel: "RADIAL COORDINATE RATE  (dr/dt) / c",
        xTicks: [1, 3, 10, 30, 100, 300, 1000].map((value) => ({ value, label: String(value) })),
        yTicks: [-3, -2, -1, 0, 1].map((value) => ({ value, label: String(value) })),
      });

      context.save();
      context.strokeStyle = "rgba(240, 109, 98, 0.68)";
      context.lineWidth = 1.2;
      context.setLineDash([5, 5]);
      context.beginPath();
      context.moveTo(geometry.x(horizonRadiusKm), geometry.y(ranges.yMin));
      context.lineTo(geometry.x(horizonRadiusKm), geometry.y(ranges.yMax));
      context.stroke();
      context.restore();
      drawPlotNote(
        context,
        `HORIZON  rₛ = ${horizonRadiusKm.toFixed(1)} KM`,
        geometry.x(horizonRadiusKm) + 8,
        geometry.y(0.78),
        colors.horizon,
      );

      const curveMinimumKm = Math.max(ranges.xMin, horizonRadiusKm * 0.25);
      const logarithmicMinimum = Math.log(curveMinimumKm);
      const logarithmicSpan = Math.log(ranges.xMax) - logarithmicMinimum;
      const pointForAmount = (amount, direction) => {
        const physicalRadiusKm = Math.exp(logarithmicMinimum + logarithmicSpan * amount);
        const rates = physics.blackHoleRadialLightSpeeds(physicalRadiusKm / horizonRadiusKm);
        return { x: physicalRadiusKm, y: rates[direction] };
      };
      drawParametric(
        context,
        geometry,
        0,
        1,
        180,
        (amount) => pointForAmount(amount, "outward"),
        colors.geometry,
        2.5,
      );
      drawParametric(
        context,
        geometry,
        0,
        1,
        180,
        (amount) => pointForAmount(amount, "inward"),
        colors.horizon,
        2.2,
      );

      const labelAlign = geometry.x(point.physicalRadiusKm) > geometry.left + geometry.width * 0.72 ? "right" : "left";
      drawMarker(context, geometry.x(point.physicalRadiusKm), geometry.y(point.outward), colors.geometry, "OUTGOING", labelAlign);
      drawMarker(context, geometry.x(point.physicalRadiusKm), geometry.y(point.inward), colors.horizon, "INGOING", labelAlign);
      if (state.onUpdate) state.onUpdate({
        mass: state.mass,
        radius: state.radius,
        schwarzschildRadiusKm: point.horizonRadiusKm,
        physicalRadiusKm: point.physicalRadiusKm,
        outward: point.outward,
        inward: point.inward,
      });
    });

    return Object.freeze({
      stage,
      setMass(value) {
        state.targetMass = Math.max(1, physics.finiteNumber(value, 10));
        beginMapAnimation(stage, state);
      },
      setRadius(value) {
        state.targetRadius = physics.clamp(value, 0.35, 4);
        beginMapAnimation(stage, state);
      },
      values() {
        const point = physics.horizonCoordinatePoint(state.mass, state.radius);
        return Object.freeze({
          mass: state.mass,
          radius: state.radius,
          schwarzschildRadiusKm: point.horizonRadiusKm,
          physicalRadiusKm: point.physicalRadiusKm,
          outward: point.outward,
          inward: point.inward,
        });
      },
    });
  }

  function createLaserMap(canvas, initialState) {
    const startingPump = physics.clamp(initialState && initialState.pump, 0, 1);
    const state = {
      pump: startingPump,
      targetPump: startingPump,
      resonantFrequency: 0.62,
      onUpdate: initialState && typeof initialState.onUpdate === "function" ? initialState.onUpdate : null,
    };
    const stage = createStaticMap(canvas, state, (frame) => {
      const { context, width, height, colors } = frame;
      updateAnimatedValues(frame, state, [["pump", "targetPump"]]);
      const stacked = width < 660;
      const gap = stacked ? 14 : 18;
      const panelWidth = stacked ? width : (width - gap) / 2;
      const panelHeight = stacked ? (height - gap) / 2 : height;

      function drawPanel(offsetX, offsetY, panel, title, drawData) {
        context.save();
        context.translate(offsetX, offsetY);
        context.strokeStyle = "rgba(238, 232, 216, 0.08)";
        context.strokeRect(0.5, 0.5, panelWidth - 1, panelHeight - 1);
        drawPlotNote(context, title, panel.compact ? 54 : 76, 12, "rgba(238, 232, 216, 0.58)");
        drawAxes(context, panel, drawData.axes);
        drawData.draw(context, panel);
        context.restore();
      }

      const energyRanges = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
      const gainRanges = { xMin: 0, xMax: 1, yMin: -1, yMax: 1 };
      const energyGeometry = plotGeometry(panelWidth, panelHeight, energyRanges);
      const gainGeometry = plotGeometry(panelWidth, panelHeight, gainRanges);
      const secondX = stacked ? 0 : panelWidth + gap;
      const secondY = stacked ? panelHeight + gap : 0;

      drawPanel(0, 0, energyGeometry, "A · PHOTON ENERGY", {
        axes: {
          xLabel: "RELATIVE FREQUENCY  ν",
          yLabel: "RELATIVE ENERGY GAP  ΔE",
          xTicks: [0, 0.5, 1].map((value) => ({ value, label: value.toFixed(value === 0 || value === 1 ? 0 : 1) })),
          yTicks: [0, 0.5, 1].map((value) => ({ value, label: value.toFixed(value === 0 || value === 1 ? 0 : 1) })),
        },
        draw(panelContext, geometry) {
          drawSeries(panelContext, geometry, 0, 1, 2, (frequency) => frequency, colors.photon, 2.4);
          drawMarker(
            panelContext,
            geometry.x(state.resonantFrequency),
            geometry.y(state.resonantFrequency),
            colors.photon,
            "MATCHING PHOTON",
            state.resonantFrequency > 0.65 ? "right" : "left",
          );
        },
      });

      drawPanel(secondX, secondY, gainGeometry, "B · POPULATION INVERSION", {
        axes: {
          xLabel: "EXCITED FRACTION  N₂ / (N₁ + N₂)",
          yLabel: "SIMPLIFIED NET GAIN",
          xTicks: [0, 0.5, 1].map((value) => ({ value, label: `${Math.round(value * 100)}%` })),
          yTicks: [-1, 0, 1].map((value) => ({ value, label: value > 0 ? `+${value}` : String(value) })),
        },
        draw(panelContext, geometry) {
          panelContext.save();
          panelContext.strokeStyle = "rgba(238, 232, 216, 0.28)";
          panelContext.setLineDash([5, 5]);
          panelContext.beginPath();
          panelContext.moveTo(geometry.x(0.5), geometry.y(-1));
          panelContext.lineTo(geometry.x(0.5), geometry.y(1));
          panelContext.stroke();
          panelContext.restore();
          drawSeries(panelContext, geometry, 0, 1, 2, physics.laserNetGainRelative, colors.wormhole, 2.4);
          const gain = physics.laserNetGainRelative(state.pump);
          drawMarker(panelContext, geometry.x(state.pump), geometry.y(gain), colors.wormhole, gain >= 0 ? "AMPLIFIES" : "ABSORBS", state.pump > 0.7 ? "right" : "left");
          drawPlotNote(panelContext, "THRESHOLD", geometry.x(0.5) + 7, geometry.y(0) - 10, "rgba(238, 232, 216, 0.48)");
        },
      });
      if (state.onUpdate) state.onUpdate({
        pump: state.pump,
        gain: physics.laserNetGainRelative(state.pump),
      });
    });

    return Object.freeze({
      stage,
      setPump(value) {
        state.targetPump = physics.clamp(value, 0, 1);
        beginMapAnimation(stage, state);
      },
      values() {
        return Object.freeze({
          pump: state.pump,
          gain: physics.laserNetGainRelative(state.pump),
        });
      },
    });
  }

  function createBridgeMap(canvas, initialState) {
    const startingRadius = physics.clamp(initialState && initialState.radius, 1, 4);
    const state = {
      throatRadius: 1,
      radius: startingRadius,
      targetRadius: startingRadius,
      onUpdate: initialState && typeof initialState.onUpdate === "function" ? initialState.onUpdate : null,
    };
    const ranges = { xMin: 1, xMax: 4, yMin: -3.6, yMax: 3.6 };
    const stage = createStaticMap(canvas, state, (frame) => {
      const { context, width, height, colors } = frame;
      updateAnimatedValues(frame, state, [["radius", "targetRadius"]]);
      const geometry = plotGeometry(width, height, ranges);
      drawAxes(context, geometry, {
        xLabel: "AREAL RADIUS  r / rₛ",
        yLabel: "EMBEDDING HEIGHT  z / rₛ",
        xTicks: [1, 2, 3, 4].map((value) => ({ value, label: String(value) })),
        yTicks: [-3, -2, -1, 0, 1, 2, 3].map((value) => ({ value, label: value > 0 ? `+${value}` : String(value) })),
      });

      drawSeries(
        context,
        geometry,
        1,
        4,
        100,
        (radius) => physics.schwarzschildEmbeddingHeight(radius, state.throatRadius),
        colors.wormhole,
        2.4,
      );
      drawSeries(
        context,
        geometry,
        1,
        4,
        100,
        (radius) => -physics.schwarzschildEmbeddingHeight(radius, state.throatRadius),
        colors.wormhole,
        2.4,
      );
      drawMarker(context, geometry.x(1), geometry.y(0), colors.paperBright, "THROAT  r = rₛ");
      drawPlotNote(context, "EXTERIOR SHEET A", geometry.x(2.65), geometry.y(2.65) - 9, "rgba(185, 162, 255, 0.72)");
      drawPlotNote(context, "EXTERIOR SHEET B", geometry.x(2.65), geometry.y(-2.65) + 10, "rgba(185, 162, 255, 0.72)");
      const heightAtRadius = physics.schwarzschildEmbeddingHeight(state.radius, state.throatRadius);
      const align = state.radius > 3.25 ? "right" : "left";
      drawMarker(context, geometry.x(state.radius), geometry.y(heightAtRadius), colors.photon, "+z", align);
      drawMarker(context, geometry.x(state.radius), geometry.y(-heightAtRadius), colors.photon, "−z", align);
      if (state.onUpdate) state.onUpdate({
        radius: state.radius,
        throatRadius: state.throatRadius,
        height: heightAtRadius,
      });
    });

    return Object.freeze({
      stage,
      setRadius(value) {
        state.targetRadius = physics.clamp(value, 1, 4);
        beginMapAnimation(stage, state);
      },
      values() {
        return Object.freeze({
          radius: state.radius,
          throatRadius: state.throatRadius,
          height: physics.schwarzschildEmbeddingHeight(state.radius, state.throatRadius),
        });
      },
    });
  }

  function createKruskalMap(canvas, initialState) {
    const startingDirection = physics.clamp(initialState && initialState.direction, -1, 1);
    const startingRadius = physics.clamp(initialState && initialState.radius, 1.02, 1.4);
    const state = {
      direction: startingDirection,
      targetDirection: startingDirection,
      radius: startingRadius,
      targetRadius: startingRadius,
      onUpdate: initialState && typeof initialState.onUpdate === "function" ? initialState.onUpdate : null,
    };
    const ranges = { xMin: -1.6, xMax: 1.6, yMin: -1.6, yMax: 1.6 };
    const stage = createStaticMap(canvas, state, (frame) => {
      const { context, width, height, colors } = frame;
      updateAnimatedValues(frame, state, [
        ["direction", "targetDirection"],
        ["radius", "targetRadius"],
      ]);
      const geometry = plotGeometry(width, height, ranges);
      drawAxes(context, geometry, {
        xLabel: "KRUSKAL SPACE COORDINATE  X",
        yLabel: "KRUSKAL TIME COORDINATE  T",
        xTicks: [-1, 0, 1].map((value) => ({ value, label: value > 0 ? `+${value}` : String(value) })),
        yTicks: [-1, 0, 1].map((value) => ({ value, label: value > 0 ? `+${value}` : String(value) })),
      });

      context.save();
      context.strokeStyle = "rgba(238, 232, 216, 0.56)";
      context.lineWidth = 1.3;
      context.setLineDash([5, 5]);
      context.beginPath();
      context.moveTo(geometry.x(-1.6), geometry.y(-1.6));
      context.lineTo(geometry.x(1.6), geometry.y(1.6));
      context.moveTo(geometry.x(-1.6), geometry.y(1.6));
      context.lineTo(geometry.x(1.6), geometry.y(-1.6));
      context.stroke();
      context.restore();

      [1.08, 1.2, 1.35].forEach((radius, index) => {
        const invariant = physics.kruskalRadialInvariant(radius);
        const color = `rgba(104, 216, 207, ${0.16 + index * 0.1})`;
        [-1, 1].forEach((side) => {
          drawParametric(
            context,
            geometry,
            -1.05,
            1.05,
            80,
            (time) => ({ x: side * Math.sqrt(time * time + invariant), y: time }),
            color,
            1,
          );
        });
      });
      const selectedInvariant = physics.kruskalRadialInvariant(state.radius);
      [-1, 1].forEach((side) => {
        drawParametric(
          context,
          geometry,
          -1.05,
          1.05,
          80,
          (time) => ({ x: side * Math.sqrt(time * time + selectedInvariant), y: time }),
          colors.geometry,
          2.3,
        );
      });
      drawPlotNote(context, `r = ${state.radius.toFixed(2)} rₛ`, geometry.x(Math.sqrt(selectedInvariant)) + 8, geometry.y(0) - 11, colors.geometry);

      [-1, 1].forEach((timeSign) => {
        drawParametric(
          context,
          geometry,
          -1.15,
          1.15,
          80,
          (space) => ({ x: space, y: timeSign * Math.sqrt(space * space + 1) }),
          "rgba(240, 109, 98, 0.62)",
          1.6,
        );
      });

      const blackWeight = physics.clamp((state.direction + 1) / 2, 0, 1);
      const whiteWeight = 1 - blackWeight;
      drawParametric(
        context,
        geometry,
        0,
        1,
        70,
        (amount) => physics.kruskalCausalPath(1, amount),
        `rgba(240, 109, 98, ${0.12 + blackWeight * 0.88})`,
        1.2 + blackWeight * 1.8,
      );
      drawParametric(
        context,
        geometry,
        0,
        1,
        70,
        (amount) => physics.kruskalCausalPath(-1, amount),
        `rgba(238, 232, 216, ${0.12 + whiteWeight * 0.88})`,
        1.2 + whiteWeight * 1.8,
      );
      const blackPoint = physics.kruskalCausalPath(1, 0.76);
      const whitePoint = physics.kruskalCausalPath(-1, 0.76);
      if (blackWeight >= 0.48) {
        drawMarker(context, geometry.x(blackPoint.space), geometry.y(blackPoint.time), `rgba(240, 109, 98, ${0.35 + blackWeight * 0.65})`, "BLACK-HOLE PATH");
      }
      if (whiteWeight >= 0.48) {
        drawMarker(context, geometry.x(whitePoint.space), geometry.y(whitePoint.time), `rgba(238, 232, 216, ${0.35 + whiteWeight * 0.65})`, "WHITE-HOLE PATH");
      }

      drawPlotNote(context, "BLACK HOLE", geometry.x(0), geometry.y(1.36), colors.horizon, "center");
      drawPlotNote(context, "WHITE HOLE", geometry.x(0), geometry.y(-1.36), colors.paperBright, "center");
      drawPlotNote(context, "EXTERIOR", geometry.x(1.34), geometry.y(0), "rgba(104, 216, 207, 0.72)", "center");
      drawPlotNote(context, "SECOND EXTERIOR", geometry.x(-1.34), geometry.y(0), "rgba(104, 216, 207, 0.52)", "center");
      drawPlotNote(context, "r = 0", geometry.x(0), geometry.y(1) - 8, colors.horizon, "center");
      drawPlotNote(context, "r = 0", geometry.x(0), geometry.y(-1) + 10, colors.horizon, "center");
      if (state.onUpdate) state.onUpdate({
        direction: state.direction,
        radius: state.radius,
        invariant: selectedInvariant,
      });
    });

    return Object.freeze({
      stage,
      setDirection(value) {
        state.targetDirection = physics.clamp(value, -1, 1);
        beginMapAnimation(stage, state);
      },
      setRadius(value) {
        state.targetRadius = physics.clamp(value, 1.02, 1.4);
        beginMapAnimation(stage, state);
      },
      values() {
        return Object.freeze({
          direction: state.direction,
          radius: state.radius,
          invariant: physics.kruskalRadialInvariant(state.radius),
        });
      },
    });
  }

  root.EinsteinLabMathMaps = Object.freeze({
    ready: true,
    createLiftMap,
    createFieldMap,
    createCurvatureMap,
    createHorizonMap,
    createLaserMap,
    createBridgeMap,
    createKruskalMap,
  });
})(typeof window !== "undefined" ? window : globalThis);
