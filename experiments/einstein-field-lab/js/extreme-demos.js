(function attachExtremeDemos(root) {
  "use strict";

  const physics = root.EinsteinLabPhysics;
  const stageTools = root.EinsteinLabStage;
  if (!physics || !stageTools) {
    throw new Error("Extreme spacetime demos require the local physics and stage scripts.");
  }

  function rgba(hex, alpha) {
    const clean = hex.replace("#", "");
    const value = Number.parseInt(clean, 16);
    return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
  }

  function monoFont(size, weight) {
    return `${weight || 650} ${size}px ${getComputedStyle(document.documentElement).getPropertyValue("--mono")}`;
  }

  function blackHoleGeometry(width, height, mass) {
    const maximum = Math.min(width * 0.5, height * 0.43);
    const massScale = Math.log10(Math.max(1, mass)) / 2;
    const horizonRadius = maximum * (0.19 + massScale * 0.1);
    return Object.freeze({
      centerX: width * (width < 520 ? 0.34 : 0.38),
      centerY: height * 0.5,
      horizonRadius,
      maximum,
    });
  }

  function radialDistanceForRadius(geometry, radiusInHorizons) {
    if (radiusInHorizons <= 1) return geometry.horizonRadius * radiusInHorizons;
    return geometry.horizonRadius +
      ((radiusInHorizons - 1) / 3) * (geometry.maximum - geometry.horizonRadius);
  }

  function drawRadialGrid(frame, geometry) {
    const { context, colors } = frame;
    context.save();
    context.strokeStyle = rgba(colors.paper, 0.1);
    context.lineWidth = 1;
    for (let ring = 1; ring <= 7; ring += 1) {
      const radius = (geometry.maximum / 7) * ring;
      context.beginPath();
      context.arc(geometry.centerX, geometry.centerY, radius, 0, physics.TAU);
      context.stroke();
    }
    for (let spoke = 0; spoke < 16; spoke += 1) {
      const angle = (spoke / 16) * physics.TAU;
      stageTools.line(
        context,
        geometry.centerX + Math.cos(angle) * 7,
        geometry.centerY + Math.sin(angle) * 7,
        geometry.centerX + Math.cos(angle) * geometry.maximum,
        geometry.centerY + Math.sin(angle) * geometry.maximum,
      );
    }
    context.restore();
  }

  function drawRiverArrows(frame, geometry, time, direction) {
    const { context, colors, reducedMotion, paused } = frame;
    const phase = reducedMotion || paused ? 0.25 : physics.mod(time * 0.28, 1);
    context.save();
    context.strokeStyle = rgba(colors.geometry, 0.42);
    context.fillStyle = rgba(colors.geometry, 0.72);
    context.lineWidth = 1;
    for (let spoke = 0; spoke < 12; spoke += 1) {
      const angle = (spoke / 12) * physics.TAU;
      for (let step = 1; step <= 4; step += 1) {
        const radius = geometry.horizonRadius * (0.38 + step * 0.74 + phase * 0.12);
        if (radius > geometry.maximum) continue;
        const radiusInHorizons = radius / geometry.horizonRadius;
        const flow = Math.min(2.2, physics.riverSpeedFraction(radiusInHorizons));
        const sign = direction >= 0 ? -1 : 1;
        const startX = geometry.centerX + Math.cos(angle) * radius;
        const startY = geometry.centerY + Math.sin(angle) * radius;
        const length = (7 + flow * 8) * sign;
        const endX = startX + Math.cos(angle) * length;
        const endY = startY + Math.sin(angle) * length;
        stageTools.drawArrow(context, startX, startY, endX, endY, 4);
      }
    }
    context.restore();
  }

  function createBlackHoleDemo(canvas, state, onZone) {
    const demoState = state || {
      mass: 10,
      radius: 2.4,
      pulseVersion: 0,
      pulseStart: null,
    };
    let lastZone = "";

    function emit() {
      demoState.pulseVersion += 1;
      demoState.pulseStart = null;
      stage.invalidate();
    }

    const stage = new stageTools.CanvasStage(canvas, (frame) => {
      const { context, width, height, time, colors, reducedMotion, paused } = frame;
      const geometry = blackHoleGeometry(width, height, demoState.mass);
      const sourceDistance = radialDistanceForRadius(geometry, demoState.radius);
      const sourceX = geometry.centerX + sourceDistance;
      const sourceY = geometry.centerY;
      const zone = physics.horizonZone(demoState.radius);

      drawRadialGrid(frame, geometry);

      context.save();
      const interior = context.createRadialGradient(
        geometry.centerX,
        geometry.centerY,
        geometry.horizonRadius * 0.12,
        geometry.centerX,
        geometry.centerY,
        geometry.horizonRadius,
      );
      interior.addColorStop(0, colors.ink);
      interior.addColorStop(0.72, "#020305");
      interior.addColorStop(1, rgba(colors.horizon, 0.3));
      context.fillStyle = interior;
      context.beginPath();
      context.arc(geometry.centerX, geometry.centerY, geometry.horizonRadius, 0, physics.TAU);
      context.fill();
      context.strokeStyle = colors.horizon;
      context.lineWidth = 2;
      context.shadowColor = colors.horizon;
      context.shadowBlur = 16;
      context.stroke();
      context.shadowBlur = 0;

      context.strokeStyle = rgba(colors.horizon, 0.24);
      context.lineWidth = 1;
      context.beginPath();
      context.arc(geometry.centerX, geometry.centerY, geometry.horizonRadius + 8, 0, physics.TAU);
      context.stroke();
      context.restore();

      drawRiverArrows(frame, geometry, time, 1);

      context.save();
      context.fillStyle = colors.paperBright;
      context.strokeStyle = colors.paperBright;
      context.lineWidth = 1.5;
      context.beginPath();
      context.arc(sourceX, sourceY, 6, 0, physics.TAU);
      context.fill();

      const light = physics.blackHoleRadialLightSpeeds(demoState.radius);
      const outwardLength = Math.max(-62, Math.min(62, light.outward * 42));
      const inwardLength = Math.max(-62, Math.min(62, light.inward * 25));
      context.strokeStyle = colors.photon;
      context.fillStyle = colors.photon;
      stageTools.drawArrow(context, sourceX, sourceY - 7, sourceX + outwardLength, sourceY - 7, 6);
      context.strokeStyle = colors.geometry;
      context.fillStyle = colors.geometry;
      stageTools.drawArrow(context, sourceX, sourceY + 7, sourceX + inwardLength, sourceY + 7, 6);

      context.font = monoFont(8);
      context.textAlign = "center";
      context.fillStyle = colors.photon;
      context.fillText("OUTWARD BEAM", sourceX + outwardLength * 0.5, sourceY - 18);
      context.fillStyle = colors.geometry;
      context.fillText("INWARD BEAM", sourceX + inwardLength * 0.5, sourceY + 26);

      if (demoState.pulseVersion > 0) {
        if (demoState.pulseStart == null) demoState.pulseStart = time;
        const elapsed = reducedMotion || paused ? 1.5 : Math.max(0, time - demoState.pulseStart);
        const pulseScale = geometry.horizonRadius * 0.62;
        const outwardX = sourceX + light.outward * elapsed * pulseScale;
        const inwardX = sourceX + light.inward * elapsed * pulseScale;
        context.shadowBlur = 12;
        context.shadowColor = colors.photon;
        context.fillStyle = colors.photon;
        context.beginPath();
        context.arc(outwardX, sourceY - 7, 4, 0, physics.TAU);
        context.fill();
        context.shadowColor = colors.geometry;
        context.fillStyle = colors.geometry;
        context.beginPath();
        context.arc(inwardX, sourceY + 7, 4, 0, physics.TAU);
        context.fill();
        context.shadowBlur = 0;
      }

      context.fillStyle = rgba(colors.paper, 0.48);
      context.font = monoFont(8);
      context.textAlign = "left";
      context.fillText("EVERY PATH LEADS IN", 14, height - 18);
      context.textAlign = "center";
      context.fillStyle = colors.horizon;
      context.fillText("EVENT HORIZON · rₛ", geometry.centerX, geometry.centerY - geometry.horizonRadius - 13);
      context.textAlign = "right";
      context.fillStyle = rgba(colors.paper, 0.48);
      context.fillText(`LIGHT STARTS · ${demoState.radius.toFixed(2)} rₛ`, width - 14, height - 18);
      context.restore();

      if (zone !== lastZone) {
        lastZone = zone;
        if (typeof onZone === "function") onZone(zone, light);
      }
    }, { animated: true });

    return Object.freeze({
      stage,
      state: demoState,
      emit,
      setMass(value) {
        demoState.mass = physics.clamp(value, 1, 100);
        stage.invalidate();
      },
      setRadius(value) {
        demoState.radius = physics.clamp(value, 0.35, 4);
        stage.invalidate();
      },
    });
  }

  function kruskalDiagramGeometry(width, height) {
    return Object.freeze({
      centerX: width * 0.5,
      centerY: height * 0.51,
      halfWidth: Math.min(width * 0.43, height * 0.64),
      halfHeight: Math.min(height * 0.4, width * 0.5),
      compact: width < 520,
    });
  }

  function kruskalCanvasPoint(geometry, space, time) {
    return Object.freeze({
      x: geometry.centerX + space * geometry.halfWidth,
      y: geometry.centerY - time * geometry.halfHeight,
    });
  }

  function drawKruskalPolygon(context, geometry, coordinates) {
    context.beginPath();
    coordinates.forEach(([space, time], index) => {
      const point = kruskalCanvasPoint(geometry, space, time);
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    });
    context.closePath();
  }

  function drawKruskalSingularity(context, from, to, teeth) {
    const count = teeth || 20;
    context.beginPath();
    context.moveTo(from.x, from.y);
    for (let index = 1; index <= count; index += 1) {
      const amount = index / count;
      const x = physics.lerp(from.x, to.x, amount);
      const baseline = physics.lerp(from.y, to.y, amount);
      const y = baseline + (index % 2 === 0 ? -3 : 3);
      context.lineTo(x, y);
    }
    context.stroke();
  }

  function createWhiteHoleDemo(canvas, state, onDirection) {
    const demoState = state || { direction: 1 };
    let lastLabel = "";
    const stage = new stageTools.CanvasStage(canvas, (frame) => {
      const { context, width, height, time, colors, reducedMotion, paused } = frame;
      const direction = physics.clamp(demoState.direction, -1, 1);
      const effectiveDirection = Math.abs(direction) < 0.03 ? 0 : Math.sign(direction);
      const geometry = kruskalDiagramGeometry(width, height);
      const topLeft = kruskalCanvasPoint(geometry, -0.46, 0.72);
      const topRight = kruskalCanvasPoint(geometry, 0.46, 0.72);
      const rightInfinity = kruskalCanvasPoint(geometry, 0.94, 0);
      const bottomRight = kruskalCanvasPoint(geometry, 0.46, -0.72);
      const bottomLeft = kruskalCanvasPoint(geometry, -0.46, -0.72);
      const leftInfinity = kruskalCanvasPoint(geometry, -0.94, 0);
      const center = kruskalCanvasPoint(geometry, 0, 0);
      const activeColor = effectiveDirection < 0 ? colors.paperBright : colors.horizon;

      context.save();
      context.strokeStyle = rgba(colors.paper, 0.055);
      context.lineWidth = 1;
      context.setLineDash([2, 7]);
      for (let step = -3; step <= 3; step += 1) {
        const fraction = step / 4;
        const horizontalStart = kruskalCanvasPoint(geometry, -0.84, fraction);
        const horizontalEnd = kruskalCanvasPoint(geometry, 0.84, fraction);
        const verticalStart = kruskalCanvasPoint(geometry, fraction, -0.68);
        const verticalEnd = kruskalCanvasPoint(geometry, fraction, 0.68);
        stageTools.line(context, horizontalStart.x, horizontalStart.y, horizontalEnd.x, horizontalEnd.y);
        stageTools.line(context, verticalStart.x, verticalStart.y, verticalEnd.x, verticalEnd.y);
      }
      context.setLineDash([]);

      context.fillStyle = rgba(colors.horizon, effectiveDirection > 0 ? 0.16 : 0.045);
      drawKruskalPolygon(context, geometry, [[0, 0], [0.46, 0.72], [-0.46, 0.72]]);
      context.fill();
      context.fillStyle = rgba(colors.paperBright, effectiveDirection < 0 ? 0.13 : 0.035);
      drawKruskalPolygon(context, geometry, [[0, 0], [-0.46, -0.72], [0.46, -0.72]]);
      context.fill();
      context.fillStyle = rgba(colors.geometry, 0.035);
      drawKruskalPolygon(context, geometry, [[0, 0], [0.46, 0.72], [0.94, 0], [0.46, -0.72]]);
      context.fill();
      drawKruskalPolygon(context, geometry, [[0, 0], [-0.46, -0.72], [-0.94, 0], [-0.46, 0.72]]);
      context.fill();

      context.strokeStyle = rgba(colors.paper, 0.3);
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(topLeft.x, topLeft.y);
      context.lineTo(topRight.x, topRight.y);
      context.lineTo(rightInfinity.x, rightInfinity.y);
      context.lineTo(bottomRight.x, bottomRight.y);
      context.lineTo(bottomLeft.x, bottomLeft.y);
      context.lineTo(leftInfinity.x, leftInfinity.y);
      context.closePath();
      context.stroke();

      context.strokeStyle = rgba(activeColor, 0.72);
      context.lineWidth = 1.5;
      for (const horizon of [topLeft, topRight, bottomLeft, bottomRight]) {
        stageTools.line(context, center.x, center.y, horizon.x, horizon.y);
      }

      context.strokeStyle = effectiveDirection > 0 ? colors.horizon : rgba(colors.horizon, 0.42);
      context.lineWidth = 2;
      drawKruskalSingularity(context, topLeft, topRight, geometry.compact ? 14 : 22);
      context.strokeStyle = effectiveDirection < 0 ? colors.paperBright : rgba(colors.paperBright, 0.34);
      drawKruskalSingularity(context, bottomLeft, bottomRight, geometry.compact ? 14 : 22);

      context.strokeStyle = rgba(colors.paper, 0.18);
      context.fillStyle = rgba(colors.paper, 0.52);
      context.lineWidth = 1;
      const timeBottom = kruskalCanvasPoint(geometry, 0, -0.86);
      const timeTop = kruskalCanvasPoint(geometry, 0, 0.86);
      const spaceLeft = kruskalCanvasPoint(geometry, -1.02, 0);
      const spaceRight = kruskalCanvasPoint(geometry, 1.02, 0);
      stageTools.drawArrow(context, timeBottom.x, timeBottom.y, timeTop.x, timeTop.y, 5);
      stageTools.drawArrow(context, spaceLeft.x, spaceLeft.y, spaceRight.x, spaceRight.y, 5);

      const pathColor = effectiveDirection < 0 ? colors.paperBright : colors.photon;
      if (effectiveDirection !== 0) {
        context.strokeStyle = pathColor;
        context.fillStyle = pathColor;
        context.lineWidth = 2.2;
        context.shadowColor = pathColor;
        context.shadowBlur = 9;
        context.beginPath();
        for (let index = 0; index <= 64; index += 1) {
          const pathPoint = physics.compactKruskalCausalPath(effectiveDirection, index / 64);
          const point = kruskalCanvasPoint(geometry, pathPoint.space, pathPoint.time);
          if (index === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        }
        context.stroke();
        context.shadowBlur = 0;

        for (const amount of [0.3, 0.58, 0.84]) {
          const startPath = physics.compactKruskalCausalPath(effectiveDirection, amount - 0.035);
          const endPath = physics.compactKruskalCausalPath(effectiveDirection, amount);
          const startPoint = kruskalCanvasPoint(geometry, startPath.space, startPath.time);
          const endPoint = kruskalCanvasPoint(geometry, endPath.space, endPath.time);
          stageTools.drawArrow(context, startPoint.x, startPoint.y, endPoint.x, endPoint.y, 5);
        }

        const motionProgress = reducedMotion || paused ? 0.68 : physics.mod(time * 0.16, 1);
        const particlePath = physics.compactKruskalCausalPath(effectiveDirection, motionProgress);
        const particle = kruskalCanvasPoint(geometry, particlePath.space, particlePath.time);
        context.shadowColor = pathColor;
        context.shadowBlur = 16;
        context.beginPath();
        context.arc(particle.x, particle.y, 4.2, 0, physics.TAU);
        context.fill();
        context.shadowBlur = 0;
      }

      function label(text, space, timeCoordinate, color, align) {
        const point = kruskalCanvasPoint(geometry, space, timeCoordinate);
        context.fillStyle = color;
        context.textAlign = align || "center";
        context.fillText(text, point.x, point.y);
      }

      context.font = monoFont(geometry.compact ? 7 : 9, 700);
      label("BLACK HOLE · FUTURE", 0, 0.56, effectiveDirection > 0 ? colors.horizon : rgba(colors.paper, 0.42));
      label("WHITE HOLE · PAST", 0, -0.52, effectiveDirection < 0 ? colors.paperBright : rgba(colors.paper, 0.42));
      label("EXTERIOR", 0.69, 0.03, rgba(colors.geometry, 0.62));
      label("EXTERIOR", -0.69, 0.03, rgba(colors.geometry, 0.62));
      label(geometry.compact ? "I+" : "FUTURE NULL ∞ · I+", 0.72, 0.27, rgba(colors.paper, 0.52));
      label(geometry.compact ? "I−" : "PAST NULL ∞ · I−", 0.72, -0.23, rgba(colors.paper, 0.52));
      label(geometry.compact ? "I′+" : "I′+ · FUTURE NULL ∞", -0.72, 0.27, rgba(colors.paper, 0.52));
      label(geometry.compact ? "I′−" : "I′− · PAST NULL ∞", -0.72, -0.23, rgba(colors.paper, 0.52));
      label("r=0 · FUTURE SINGULARITY", 0, 0.78, effectiveDirection > 0 ? colors.horizon : rgba(colors.paper, 0.42));
      label("r=0 · PAST SINGULARITY", 0, -0.75, effectiveDirection < 0 ? colors.paperBright : rgba(colors.paper, 0.42));
      label("T · TIME", 0.04, 0.92, rgba(colors.paper, 0.52), "left");
      label("X · SPACE", 1.02, 0.07, rgba(colors.paper, 0.52), "right");

      context.textAlign = "center";
      context.font = monoFont(geometry.compact ? 7 : 9, 700);
      context.fillStyle = effectiveDirection < 0 ? colors.paperBright : effectiveDirection > 0 ? colors.horizon : rgba(colors.paper, 0.5);
      const heading = effectiveDirection < 0
        ? "WHITE-HOLE ORIENTATION · PAST SINGULARITY → FUTURE NULL INFINITY"
        : effectiveDirection > 0
          ? "BLACK-HOLE ORIENTATION · PAST NULL INFINITY → FUTURE SINGULARITY"
          : "TIME-REFLECTION MIDPOINT · PATHS DE-EMPHASIZED";
      context.fillText(heading, width * 0.5, 23);
      context.fillStyle = rgba(colors.paper, 0.42);
      context.font = monoFont(geometry.compact ? 6.5 : 8);
      const footer = geometry.compact
        ? "I− INCOMING · I+ OUTGOING · INFINITY IS COMPACTED TO THE EDGE"
        : "COMPACTIFIED MAP · INFINITY IS A BOUNDARY, NOT A PHYSICAL PLACE";
      context.fillText(footer, width * 0.5, height - 17);
      context.restore();

      if (heading !== lastLabel) {
        lastLabel = heading;
        if (typeof onDirection === "function") onDirection(direction, heading);
      }
    }, { animated: true });

    return Object.freeze({
      stage,
      state: demoState,
      setDirection(value) {
        demoState.direction = physics.clamp(value, -1, 1);
        stage.invalidate();
      },
    });
  }

  function wormholeDistances(fold) {
    const amount = physics.clamp(fold, 0, 1);
    const ordinary = 120;
    const throat = physics.lerp(62, 16, amount);
    return physics.compareWormholePaths(ordinary, throat);
  }

  function cubicPoint(start, controlA, controlB, end, progress) {
    const inverse = 1 - progress;
    return {
      x: inverse ** 3 * start.x + 3 * inverse * inverse * progress * controlA.x + 3 * inverse * progress * progress * controlB.x + progress ** 3 * end.x,
      y: inverse ** 3 * start.y + 3 * inverse * inverse * progress * controlA.y + 3 * inverse * progress * progress * controlB.y + progress ** 3 * end.y,
    };
  }

  function createWormholeDemo(canvas, state, onDistance) {
    const demoState = state || { fold: 0.5, signalVersion: 0, signalStart: null };
    let lastFactor = -1;

    function send() {
      demoState.signalVersion += 1;
      demoState.signalStart = null;
      stage.invalidate();
    }

    const stage = new stageTools.CanvasStage(canvas, (frame) => {
      const { context, width, height, time, colors, reducedMotion, paused } = frame;
      const fold = physics.clamp(demoState.fold, 0, 1);
      const distances = wormholeDistances(fold);
      const left = { x: width * 0.22, y: height * 0.62 };
      const right = { x: width * 0.78, y: height * 0.62 };
      const sag = physics.lerp(18, height * 0.27, fold);
      const throatY = left.y + sag;
      const upperA = { x: width * 0.34, y: height * 0.18 };
      const upperB = { x: width * 0.66, y: height * 0.18 };

      context.save();
      context.strokeStyle = rgba(colors.paper, 0.12);
      context.lineWidth = 1;
      for (let y = 36; y < height; y += 36) stageTools.line(context, 0, y, width, y);

      context.strokeStyle = rgba(colors.matter, 0.56);
      context.setLineDash([5, 7]);
      context.beginPath();
      context.moveTo(left.x, left.y);
      context.bezierCurveTo(upperA.x, upperA.y, upperB.x, upperB.y, right.x, right.y);
      context.stroke();
      context.setLineDash([]);

      const leftGradient = context.createLinearGradient(0, left.y - 80, 0, throatY);
      leftGradient.addColorStop(0, rgba(colors.wormhole, 0.04));
      leftGradient.addColorStop(1, rgba(colors.wormhole, 0.24));
      context.fillStyle = leftGradient;
      context.strokeStyle = colors.wormhole;
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(0, left.y - 44);
      context.bezierCurveTo(width * 0.11, left.y - 44, left.x - 42, left.y - 36, left.x, left.y);
      context.bezierCurveTo(left.x + 28, left.y + 30, left.x + 22, throatY, width * 0.5, throatY);
      context.bezierCurveTo(right.x - 22, throatY, right.x - 28, right.y + 30, right.x, right.y);
      context.bezierCurveTo(right.x + 42, right.y - 36, width * 0.89, right.y - 44, width, right.y - 44);
      context.lineTo(width, height);
      context.lineTo(0, height);
      context.closePath();
      context.fill();
      context.stroke();

      context.strokeStyle = colors.photon;
      context.lineWidth = 2;
      context.shadowColor = colors.photon;
      context.shadowBlur = 10;
      context.beginPath();
      context.moveTo(left.x, left.y);
      context.bezierCurveTo(left.x + 26, left.y + 30, left.x + 22, throatY, width * 0.5, throatY);
      context.bezierCurveTo(right.x - 22, throatY, right.x - 26, right.y + 30, right.x, right.y);
      context.stroke();
      context.shadowBlur = 0;

      for (const mouth of [left, right]) {
        context.fillStyle = colors.ink;
        context.strokeStyle = colors.wormhole;
        context.lineWidth = 2;
        context.beginPath();
        context.ellipse(mouth.x, mouth.y, 18, 7, 0, 0, physics.TAU);
        context.fill();
        context.stroke();
      }

      context.font = monoFont(8, 700);
      context.textAlign = "center";
      context.fillStyle = colors.matter;
      context.fillText("LONG DRAWN ROUTE", width * 0.5, height * 0.12);
      context.fillStyle = colors.photon;
      context.fillText("SHORT DRAWN ROUTE", width * 0.5, throatY + 24);
      context.fillStyle = rgba(colors.paper, 0.46);
      context.fillText("DIAGRAM ONLY", 54, height - 18);

      if (demoState.signalVersion > 0) {
        if (demoState.signalStart == null) demoState.signalStart = time;
        const elapsed = reducedMotion || paused ? 2 : Math.max(0, time - demoState.signalStart);
        const ordinaryProgress = Math.min(1, elapsed / 2.6);
        const throatProgress = Math.min(1, elapsed / (2.6 / distances.shortcutFactor));
        const ordinaryPoint = cubicPoint(left, upperA, upperB, right, ordinaryProgress);
        const throatControlA = { x: left.x + 40, y: throatY };
        const throatControlB = { x: right.x - 40, y: throatY };
        const throatPoint = cubicPoint(left, throatControlA, throatControlB, right, throatProgress);

        context.shadowBlur = 14;
        context.shadowColor = colors.matter;
        context.fillStyle = colors.matter;
        context.beginPath();
        context.arc(ordinaryPoint.x, ordinaryPoint.y, 4, 0, physics.TAU);
        context.fill();
        context.shadowColor = colors.photon;
        context.fillStyle = colors.photon;
        context.beginPath();
        context.arc(throatPoint.x, throatPoint.y, 4, 0, physics.TAU);
        context.fill();
        context.shadowBlur = 0;
      }
      context.restore();

      if (Math.abs(distances.shortcutFactor - lastFactor) > 0.005) {
        lastFactor = distances.shortcutFactor;
        if (typeof onDistance === "function") onDistance(distances);
      }
    }, { animated: true });

    return Object.freeze({
      stage,
      state: demoState,
      send,
      setFold(value) {
        demoState.fold = physics.clamp(value, 0, 1);
        stage.invalidate();
      },
      distances() {
        return wormholeDistances(demoState.fold);
      },
    });
  }

  root.EinsteinLabExtremeDemos = Object.freeze({
    ready: true,
    createBlackHoleDemo,
    createWhiteHoleDemo,
    createWormholeDemo,
    wormholeDistances,
  });
})(typeof window !== "undefined" ? window : globalThis);
