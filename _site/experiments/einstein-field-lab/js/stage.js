(function attachEinsteinLabStage(root) {
  "use strict";

  const registry = new Set();
  const renderLookahead = Math.max(600, Math.round(root.innerHeight * 0.75));
  const reducedMotionQuery = root.matchMedia
    ? root.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false, addEventListener: function noop() {} };
  let globallyPaused = false;

  function cssColor(name, fallback) {
    const value = root.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function palette() {
    return Object.freeze({
      ink: cssColor("--ink", "#080b13"),
      raised: cssColor("--ink-raised", "#0f1521"),
      paper: cssColor("--paper", "#eee8d8"),
      paperBright: cssColor("--paper-bright", "#fffaf0"),
      geometry: cssColor("--geometry", "#68d8cf"),
      matter: cssColor("--matter", "#f2b45f"),
      horizon: cssColor("--horizon", "#f06d62"),
      wormhole: cssColor("--wormhole", "#b9a2ff"),
      photon: cssColor("--photon", "#d9f76f"),
    });
  }

  class CanvasStage {
    constructor(canvas, draw, options) {
      if (!canvas || typeof draw !== "function") {
        throw new Error("CanvasStage needs a canvas and a draw function.");
      }

      this.canvas = canvas;
      this.context = canvas.getContext("2d", { alpha: true });
      if (!this.context) throw new Error(`Canvas 2D is unavailable for #${canvas.id}.`);

      this.draw = draw;
      this.options = Object.assign({ animated: true, initiallyVisible: false }, options);
      this.colors = palette();
      this.width = 0;
      this.height = 0;
      this.pixelRatio = 1;
      this.visible = Boolean(this.options.initiallyVisible);
      this.dirty = true;
      this.frameRequest = null;
      this.lastTimestamp = null;
      this.destroyed = false;
      this.localPaused = false;

      this.onFrame = this.onFrame.bind(this);
      this.resize = this.resize.bind(this);
      this.onReducedMotionChange = this.onReducedMotionChange.bind(this);
      this.onWindowResize = this.onWindowResize.bind(this);

      this.resizeObserver = typeof ResizeObserver === "function"
        ? new ResizeObserver(this.resize)
        : null;
      if (this.resizeObserver) this.resizeObserver.observe(canvas);
      else root.addEventListener("resize", this.onWindowResize, { passive: true });

      this.intersectionObserver = typeof IntersectionObserver === "function"
        ? new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (entry.target !== this.canvas) continue;
            this.visible = entry.isIntersecting || entry.intersectionRatio > 0;
            if (this.visible) this.invalidate();
            else this.cancelFrame();
          }
        }, { rootMargin: `${renderLookahead}px 0px`, threshold: 0 })
        : null;
      if (this.intersectionObserver) this.intersectionObserver.observe(canvas);
      else this.visible = true;

      if (reducedMotionQuery.addEventListener) {
        reducedMotionQuery.addEventListener("change", this.onReducedMotionChange);
      }

      registry.add(this);
      this.resize();
      this.invalidate();
    }

    get reducedMotion() {
      return Boolean(reducedMotionQuery.matches);
    }

    get paused() {
      return globallyPaused || this.localPaused;
    }

    get shouldAnimate() {
      const requested = typeof this.options.animated === "function"
        ? this.options.animated()
        : this.options.animated;
      return Boolean(requested) && this.visible && !this.paused && !this.reducedMotion;
    }

    onWindowResize() {
      this.resize();
    }

    onReducedMotionChange() {
      this.lastTimestamp = null;
      this.invalidate();
    }

    resize() {
      if (this.destroyed) return;
      const rect = this.canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const pixelRatio = Math.min(2, Math.max(1, root.devicePixelRatio || 1));
      const physicalWidth = Math.round(width * pixelRatio);
      const physicalHeight = Math.round(height * pixelRatio);

      if (this.canvas.width !== physicalWidth || this.canvas.height !== physicalHeight) {
        this.canvas.width = physicalWidth;
        this.canvas.height = physicalHeight;
      }
      this.width = width;
      this.height = height;
      this.pixelRatio = pixelRatio;
      this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      this.dirty = true;
      this.invalidate();
    }

    invalidate() {
      if (this.destroyed) return;
      this.dirty = true;
      if ((this.visible || !this.intersectionObserver) && this.frameRequest == null) {
        this.frameRequest = root.requestAnimationFrame(this.onFrame);
      }
    }

    cancelFrame() {
      if (this.frameRequest != null) root.cancelAnimationFrame(this.frameRequest);
      this.frameRequest = null;
      this.lastTimestamp = null;
    }

    setPaused(paused) {
      this.localPaused = Boolean(paused);
      this.lastTimestamp = null;
      this.invalidate();
    }

    onFrame(timestamp) {
      this.frameRequest = null;
      if (this.destroyed || (!this.visible && this.intersectionObserver)) return;

      const previous = this.lastTimestamp == null ? timestamp : this.lastTimestamp;
      const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previous) / 1000));
      this.lastTimestamp = timestamp;

      if (this.dirty || this.shouldAnimate) {
        this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
        this.context.clearRect(0, 0, this.width, this.height);
        this.draw({
          context: this.context,
          width: this.width,
          height: this.height,
          time: timestamp / 1000,
          deltaSeconds,
          reducedMotion: this.reducedMotion,
          paused: this.paused,
          colors: this.colors,
          stage: this,
        });
        this.dirty = false;
      }

      if (this.shouldAnimate) {
        this.frameRequest = root.requestAnimationFrame(this.onFrame);
      } else {
        this.lastTimestamp = null;
      }
    }

    destroy() {
      if (this.destroyed) return;
      this.destroyed = true;
      this.cancelFrame();
      if (this.resizeObserver) this.resizeObserver.disconnect();
      else root.removeEventListener("resize", this.onWindowResize);
      if (this.intersectionObserver) this.intersectionObserver.disconnect();
      if (reducedMotionQuery.removeEventListener) {
        reducedMotionQuery.removeEventListener("change", this.onReducedMotionChange);
      }
      registry.delete(this);
    }
  }

  function setGlobalPaused(paused) {
    globallyPaused = Boolean(paused);
    for (const stage of registry) stage.invalidate();
  }

  function isGlobalPaused() {
    return globallyPaused;
  }

  function canvasPoint(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return Object.freeze({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      normalizedX: rect.width ? (event.clientX - rect.left) / rect.width : 0,
      normalizedY: rect.height ? (event.clientY - rect.top) / rect.height : 0,
    });
  }

  function line(context, fromX, fromY, toX, toY) {
    context.beginPath();
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.stroke();
  }

  function drawArrow(context, fromX, fromY, toX, toY, headSize) {
    const size = headSize == null ? 7 : headSize;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    line(context, fromX, fromY, toX, toY);
    context.beginPath();
    context.moveTo(toX, toY);
    context.lineTo(toX - Math.cos(angle - 0.55) * size, toY - Math.sin(angle - 0.55) * size);
    context.lineTo(toX - Math.cos(angle + 0.55) * size, toY - Math.sin(angle + 0.55) * size);
    context.closePath();
    context.fill();
  }

  root.EinsteinLabStage = Object.freeze({
    CanvasStage,
    setGlobalPaused,
    isGlobalPaused,
    canvasPoint,
    line,
    drawArrow,
    palette,
  });
})(typeof window !== "undefined" ? window : globalThis);
