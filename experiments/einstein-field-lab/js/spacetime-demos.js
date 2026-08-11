(function attachSpacetimeDemos(root) {
  "use strict";

  const physics = root.EinsteinLabPhysics;
  const stageTools = root.EinsteinLabStage;
  if (!physics || !stageTools) {
    throw new Error("Spacetime demos require the local physics and stage scripts.");
  }

  function rgba(hex, alpha) {
    const clean = hex.replace("#", "");
    const value = Number.parseInt(clean, 16);
    const red = (value >> 16) & 255;
    const green = (value >> 8) & 255;
    const blue = value & 255;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  function drawFieldGrid(frame, density, activeTerm) {
    const { context, width, height, colors } = frame;
    const centerX = width * (width > 700 ? 0.7 : 0.62);
    const centerY = height * 0.46;
    const scale = Math.min(width, height) * 0.72;
    const gridAlpha = activeTerm === "geometry" ? 0.34 : 0.2;

    function map(normalizedX, normalizedY) {
      const relativeX = normalizedX - 0.34;
      const relativeY = normalizedY;
      const warped = physics.gridWarp(relativeX, relativeY, density);
      const lensLift = density * Math.exp(-(relativeX * relativeX + relativeY * relativeY) * 5) * height * 0.055;
      return {
        x: centerX + warped.x * scale,
        y: centerY + warped.y * scale + lensLift,
      };
    }

    context.save();
    context.lineWidth = 1;
    context.strokeStyle = rgba(colors.geometry, gridAlpha);
    for (let row = -7; row <= 7; row += 1) {
      context.beginPath();
      for (let segment = -30; segment <= 30; segment += 1) {
        const point = map(segment / 20, row / 9);
        if (segment === -30) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      }
      context.stroke();
    }

    context.strokeStyle = rgba(colors.geometry, gridAlpha * 0.78);
    for (let column = -18; column <= 18; column += 1) {
      context.beginPath();
      for (let segment = -16; segment <= 16; segment += 1) {
        const point = map(column / 12, segment / 10);
        if (segment === -16) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      }
      context.stroke();
    }
    context.restore();

    return { centerX: centerX + 0.34 * scale, centerY };
  }

  function createFieldDemo(canvas, state) {
    const demoState = state || { density: 0.35, activeTerm: "geometry" };
    const stage = new stageTools.CanvasStage(canvas, (frame) => {
      const { context, width, height, time, colors, reducedMotion, paused } = frame;
      const density = physics.clamp(demoState.density, 0, 1);
      const center = drawFieldGrid(frame, density, demoState.activeTerm);

      if (demoState.activeTerm === "background") {
        context.save();
        context.strokeStyle = rgba(colors.wormhole, 0.32);
        context.lineWidth = 1;
        for (let radius = 70; radius < Math.max(width, height); radius += 76) {
          context.beginPath();
          context.arc(center.centerX, center.centerY, radius + Math.sin(time * 0.4) * 2, 0, physics.TAU);
          context.stroke();
        }
        context.restore();
      }

      context.save();
      const massRadius = 13 + density * 26;
      const glow = context.createRadialGradient(
        center.centerX,
        center.centerY,
        0,
        center.centerX,
        center.centerY,
        massRadius * 3.2,
      );
      glow.addColorStop(0, rgba(colors.matter, demoState.activeTerm === "matter" ? 0.92 : 0.72));
      glow.addColorStop(0.2, rgba(colors.matter, 0.28));
      glow.addColorStop(1, rgba(colors.matter, 0));
      context.fillStyle = glow;
      context.beginPath();
      context.arc(center.centerX, center.centerY, massRadius * 3.2, 0, physics.TAU);
      context.fill();
      context.fillStyle = colors.matter;
      context.beginPath();
      context.arc(center.centerX, center.centerY, massRadius, 0, physics.TAU);
      context.fill();
      context.fillStyle = colors.ink;
      context.font = `700 ${Math.max(8, massRadius * 0.42)}px ${getComputedStyle(document.documentElement).getPropertyValue("--mono")}`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("Tμν", center.centerX, center.centerY + 1);
      context.restore();

      const phase = reducedMotion || paused ? 0.48 : physics.mod(time * 0.17, 1);
      context.save();
      context.lineWidth = 1.4;
      context.strokeStyle = rgba(colors.photon, 0.64);
      context.fillStyle = colors.photon;
      for (let lane = -2; lane <= 2; lane += 1) {
        const baseY = center.centerY + lane * Math.min(54, height * 0.11);
        context.beginPath();
        for (let segment = 0; segment <= 80; segment += 1) {
          const progress = segment / 80;
          const x = -30 + progress * (width + 60);
          const distance = (x - center.centerX) / Math.max(1, width * 0.24);
          const bend = density * Math.exp(-distance * distance) * (lane * 15 + 18) * (x < center.centerX ? 1 : -0.35);
          const y = baseY + bend;
          if (segment === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();

        const pulseX = -30 + physics.mod(phase + lane * 0.12 + 1, 1) * (width + 60);
        const pulseDistance = (pulseX - center.centerX) / Math.max(1, width * 0.24);
        const pulseY = baseY + density * Math.exp(-pulseDistance * pulseDistance) * (lane * 15 + 18) * (pulseX < center.centerX ? 1 : -0.35);
        context.beginPath();
        context.arc(pulseX, pulseY, 2.8, 0, physics.TAU);
        context.fill();
      }
      context.restore();

      context.save();
      context.fillStyle = rgba(colors.paper, 0.46);
      context.font = `650 9px ${getComputedStyle(document.documentElement).getPropertyValue("--mono")}`;
      context.textAlign = "right";
      context.fillText(`ILLUSTRATION STRENGTH · ${Math.round(density * 100)}%`, width - 18, height - 18);
      context.restore();
    }, { animated: true, initiallyVisible: true });

    return Object.freeze({
      stage,
      state: demoState,
      setDensity(value) {
        demoState.density = physics.clamp(value, 0, 1);
        stage.invalidate();
      },
      setActiveTerm(term) {
        demoState.activeTerm = term;
        stage.invalidate();
      },
    });
  }

  function createElevatorDemo(canvas, state) {
    const demoState = state || { acceleration: 1, viewpoint: "inside" };
    const stage = new stageTools.CanvasStage(canvas, (frame) => {
      const { context, width, height, time, colors, reducedMotion, paused } = frame;
      const acceleration = physics.clamp(demoState.acceleration, 0, 2);
      const outside = demoState.viewpoint === "outside";
      const motionTime = reducedMotion || paused ? 0.35 : time;
      const cabinWidth = Math.min(width * 0.64, 410);
      const cabinHeight = Math.min(height * 0.66, 300);
      const cabinX = width * 0.5 - cabinWidth * 0.5;
      const travel = outside ? Math.sin(motionTime * 0.85) * 15 * acceleration : 0;
      const cabinY = height * 0.5 - cabinHeight * 0.5 - travel;

      context.fillStyle = rgba(colors.matter, 0.025);
      context.fillRect(0, 0, width, height);

      context.save();
      context.strokeStyle = rgba(colors.paper, 0.1);
      context.lineWidth = 1;
      for (let y = 28; y < height; y += 34) stageTools.line(context, 0, y, width, y);
      context.restore();

      context.save();
      context.strokeStyle = rgba(colors.paper, 0.68);
      context.lineWidth = 1.5;
      context.strokeRect(cabinX, cabinY, cabinWidth, cabinHeight);
      context.strokeStyle = rgba(colors.matter, 0.46);
      context.setLineDash([4, 7]);
      context.strokeRect(cabinX + 14, cabinY + 14, cabinWidth - 28, cabinHeight - 28);
      context.setLineDash([]);

      const sourceY = cabinY + cabinHeight * 0.36;
      const entryX = cabinX + 16;
      const exitX = cabinX + cabinWidth - 16;
      context.lineWidth = 2;
      context.strokeStyle = colors.photon;
      context.shadowColor = colors.photon;
      context.shadowBlur = 10;
      context.beginPath();
      for (let segment = 0; segment <= 60; segment += 1) {
        const progress = segment / 60;
        const x = physics.lerp(entryX, exitX, progress);
        const visibleDrop = outside ? 0 : acceleration * progress * progress * cabinHeight * 0.19;
        const y = sourceY + visibleDrop;
        if (segment === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
      context.shadowBlur = 0;

      const pulseProgress = reducedMotion || paused ? 0.72 : physics.mod(time * 0.45, 1);
      const pulseX = physics.lerp(entryX, exitX, pulseProgress);
      const pulseY = sourceY + (outside ? 0 : acceleration * pulseProgress * pulseProgress * cabinHeight * 0.19);
      context.fillStyle = colors.photon;
      context.beginPath();
      context.arc(pulseX, pulseY, 4, 0, physics.TAU);
      context.fill();

      context.fillStyle = colors.matter;
      context.beginPath();
      context.arc(entryX - 2, sourceY, 5, 0, physics.TAU);
      context.fill();

      context.strokeStyle = colors.matter;
      context.fillStyle = colors.matter;
      context.lineWidth = 1.5;
      const arrowX = cabinX + cabinWidth - 30;
      const arrowBottom = cabinY + cabinHeight - 30;
      const arrowTop = arrowBottom - 36 - acceleration * 12;
      stageTools.drawArrow(context, arrowX, arrowBottom, arrowX, arrowTop, 7);
      context.font = `650 9px ${getComputedStyle(document.documentElement).getPropertyValue("--mono")}`;
      context.textAlign = "right";
      context.fillText(`${acceleration.toFixed(2)} g`, arrowX - 10, arrowTop + 3);

      if (outside) {
        context.fillStyle = rgba(colors.paper, 0.54);
        context.textAlign = "left";
        context.fillText("LIGHT STAYS STRAIGHT", 18, 26);
        context.fillText("LIFT MOVES UP", 18, 42);
      } else {
        context.fillStyle = rgba(colors.paper, 0.54);
        context.textAlign = "left";
        context.fillText("VIEW FROM INSIDE THE LIFT", 18, 26);
        context.fillText("LIGHT LOOKS BENT", 18, 42);
      }
      context.restore();
    }, { animated: true });

    return Object.freeze({
      stage,
      state: demoState,
      setAcceleration(value) {
        demoState.acceleration = physics.clamp(value, 0, 2);
        stage.invalidate();
      },
      setViewpoint(viewpoint) {
        demoState.viewpoint = viewpoint === "outside" ? "outside" : "inside";
        stage.invalidate();
      },
    });
  }

  function drawOrbitGrid(frame, mass) {
    const { context, width, height, colors } = frame;
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const spacing = Math.max(34, Math.min(width, height) / 9);

    context.save();
    context.strokeStyle = rgba(colors.geometry, 0.15);
    context.lineWidth = 1;
    const maxRadius = Math.hypot(width, height) * 0.62;
    for (let radius = spacing; radius < maxRadius; radius += spacing) {
      const squeeze = Math.max(0.45, 1 - (mass * 0.11) / (radius / spacing));
      context.beginPath();
      context.ellipse(centerX, centerY, radius, radius * squeeze, 0, 0, physics.TAU);
      context.stroke();
    }
    for (let spoke = 0; spoke < 16; spoke += 1) {
      const angle = (spoke / 16) * physics.TAU;
      stageTools.line(
        context,
        centerX + Math.cos(angle) * 24,
        centerY + Math.sin(angle) * 16,
        centerX + Math.cos(angle) * maxRadius,
        centerY + Math.sin(angle) * maxRadius * 0.88,
      );
    }
    context.restore();
    return { centerX, centerY, scale: Math.min(width, height) * 0.195 };
  }

  function createCurvatureDemo(canvas, state, onStatus) {
    const demoState = state || {
      mass: 1,
      speed: 1,
      orbit: physics.createOrbitState(1, 1),
      staticSolved: false,
    };
    let lastStatus = "";

    function launch() {
      demoState.orbit = physics.createOrbitState(demoState.mass, demoState.speed);
      demoState.staticSolved = false;
      stage.invalidate();
    }

    const stage = new stageTools.CanvasStage(canvas, (frame) => {
      const { context, width, height, deltaSeconds, reducedMotion, paused, colors } = frame;
      const geometry = drawOrbitGrid(frame, demoState.mass);

      if (reducedMotion || paused) {
        if (!demoState.staticSolved) {
          for (let step = 0; step < 420; step += 1) {
            physics.stepOrbit(demoState.orbit, demoState.mass, 0.012);
            if (demoState.orbit.collided || demoState.orbit.escaped) break;
          }
          demoState.staticSolved = true;
        }
      } else {
        const simulationDelta = Math.min(0.04, deltaSeconds) * 2.6;
        for (let step = 0; step < 4; step += 1) {
          physics.stepOrbit(demoState.orbit, demoState.mass, simulationDelta / 4);
        }
      }

      context.save();
      const glow = context.createRadialGradient(
        geometry.centerX,
        geometry.centerY,
        0,
        geometry.centerX,
        geometry.centerY,
        72,
      );
      glow.addColorStop(0, rgba(colors.matter, 0.75));
      glow.addColorStop(0.25, rgba(colors.matter, 0.25));
      glow.addColorStop(1, rgba(colors.matter, 0));
      context.fillStyle = glow;
      context.beginPath();
      context.arc(geometry.centerX, geometry.centerY, 72, 0, physics.TAU);
      context.fill();
      context.fillStyle = colors.matter;
      context.beginPath();
      context.arc(geometry.centerX, geometry.centerY, 10 + demoState.mass * 4, 0, physics.TAU);
      context.fill();

      const trail = demoState.orbit.trail;
      if (trail.length > 1) {
        context.lineWidth = 2;
        context.strokeStyle = colors.geometry;
        context.shadowColor = colors.geometry;
        context.shadowBlur = 8;
        context.beginPath();
        trail.forEach((point, index) => {
          const x = geometry.centerX + point.x * geometry.scale;
          const y = geometry.centerY + point.y * geometry.scale;
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });
        context.stroke();
        context.shadowBlur = 0;
      }

      const probeX = geometry.centerX + demoState.orbit.x * geometry.scale;
      const probeY = geometry.centerY + demoState.orbit.y * geometry.scale;
      context.fillStyle = colors.paperBright;
      context.beginPath();
      context.arc(probeX, probeY, 5, 0, physics.TAU);
      context.fill();
      context.strokeStyle = rgba(colors.paper, 0.46);
      context.fillStyle = rgba(colors.paper, 0.72);
      context.lineWidth = 1;
      stageTools.drawArrow(
        context,
        probeX,
        probeY,
        probeX + demoState.orbit.vx * 34,
        probeY + demoState.orbit.vy * 34,
        5,
      );
      context.restore();

      const status = physics.orbitClassification(demoState.orbit);
      if (status !== lastStatus) {
        lastStatus = status;
        if (typeof onStatus === "function") onStatus(status);
      }
    }, { animated: true });

    return Object.freeze({
      stage,
      state: demoState,
      launch,
      setMass(value) {
        demoState.mass = physics.clamp(value, 0.35, 2.4);
        launch();
      },
      setSpeed(value) {
        demoState.speed = physics.clamp(value, 0.35, 1.7);
        launch();
      },
    });
  }

  root.EinsteinLabSpacetimeDemos = Object.freeze({
    createFieldDemo,
    createElevatorDemo,
    createCurvatureDemo,
  });
})(typeof window !== "undefined" ? window : globalThis);
