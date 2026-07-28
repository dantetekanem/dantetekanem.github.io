(function attachSeasonsEngine(root) {
  "use strict";

  const math = root.SeasonsMath;
  if (!math) throw new Error("SeasonsMath must load before SeasonsEngine.");

  const EARTH_RADIUS = 1.02;
  const SUN_RADIUS = 1.46;
  const ORBIT_SCALE = 5.2;
  const MAP_WIDTH = 1024;
  const MAP_HEIGHT = 512;
  const CLOUD_WIDTH = 512;
  const CLOUD_HEIGHT = 256;

  const ORBIT_COLOR = Object.freeze([0.31, 0.61, 0.77, 0.3]);
  const QUARTER_TICK_COLOR = Object.freeze([0.92, 0.95, 0.97, 0.52]);
  const MONTH_TICK_COLOR = Object.freeze([0.92, 0.95, 0.97, 0.25]);
  const CURRENT_TICK_COLOR = Object.freeze([1.0, 0.827, 0.416, 0.95]);
  const MERIDIAN_COLOR = Object.freeze([0.47, 0.72, 0.78, 0.68]);

  const STAR_VERTEX_SHADER = `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    attribute float aSize;
    uniform mat4 uViewProjection;
    uniform float uPixelRatio;
    varying vec3 vColor;

    void main() {
      gl_Position = uViewProjection * vec4(aPosition, 1.0);
      gl_PointSize = max(1.0, aSize * uPixelRatio);
      vColor = aColor;
    }
  `;

  const STAR_FRAGMENT_SHADER = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
    #else
      precision mediump float;
    #endif
    varying vec3 vColor;

    void main() {
      vec2 point = gl_PointCoord * 2.0 - 1.0;
      float radius = dot(point, point);
      if (radius > 1.0) discard;
      float alpha = smoothstep(1.0, 0.12, radius) * 0.72;
      gl_FragColor = vec4(vColor, alpha);
    }
  `;

  const LINE_VERTEX_SHADER = `
    attribute vec3 aPosition;
    attribute vec4 aColor;
    uniform mat4 uViewProjection;
    varying vec4 vColor;

    void main() {
      gl_Position = uViewProjection * vec4(aPosition, 1.0);
      vColor = aColor;
    }
  `;

  const LINE_FRAGMENT_SHADER = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
    #else
      precision mediump float;
    #endif
    varying vec4 vColor;

    void main() {
      gl_FragColor = vColor;
    }
  `;

  const SPHERE_VERTEX_SHADER = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aUv;
    uniform mat4 uModel;
    uniform mat4 uViewProjection;
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    varying vec3 vLocalPosition;
    varying vec2 vUv;

    void main() {
      vec4 world = uModel * vec4(aPosition, 1.0);
      vWorldPosition = world.xyz;
      vWorldNormal = normalize(mat3(uModel) * aNormal);
      vLocalPosition = aPosition;
      vUv = aUv;
      gl_Position = uViewProjection * world;
    }
  `;

  const EARTH_FRAGMENT_SHADER = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
    #else
      precision mediump float;
    #endif
    uniform sampler2D uMap;
    uniform sampler2D uLandMask;
    uniform vec3 uSunPosition;
    uniform vec3 uCameraPosition;
    uniform vec3 uAxis;
    uniform vec3 uSeasonColor;
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    varying vec2 vUv;

    void main() {
      vec3 normal = normalize(vWorldNormal);
      vec3 lightDirection = normalize(uSunPosition - vWorldPosition);
      vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);
      float rawLight = dot(normal, lightDirection);
      float daylight = smoothstep(-0.10, 0.14, rawLight);
      float land = texture2D(uLandMask, vUv).r;
      vec3 albedo = texture2D(uMap, vUv).rgb;
      vec3 night = albedo * vec3(0.075, 0.10, 0.14);
      vec3 lit = albedo * (0.34 + max(rawLight, 0.0) * 0.78);

      vec3 halfVector = normalize(lightDirection + viewDirection);
      float oceanSpecular = pow(max(dot(normal, halfVector), 0.0), 72.0) * (1.0 - land);
      lit += vec3(0.31, 0.61, 0.77) * oceanSpecular * max(rawLight, 0.0) * 0.32;

      vec3 color = mix(night, lit, daylight);
      float poleTowardSun = dot(normalize(uAxis), lightDirection);
      float sunwardHemisphere = dot(normal, normalize(uAxis)) * sign(poleTowardSun);
      float seasonalStrength =
        smoothstep(0.05, 0.9, sunwardHemisphere) *
        clamp(abs(poleTowardSun) / 0.3978, 0.0, 1.0) * daylight;
      color = mix(color, uSeasonColor, seasonalStrength * 0.10);

      float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.0);
      color += vec3(0.31, 0.61, 0.77) * fresnel * 0.16;
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const SUN_FRAGMENT_SHADER = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
    #else
      precision mediump float;
    #endif
    uniform vec3 uCameraPosition;
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    varying vec3 vLocalPosition;

    void main() {
      gl_FragColor = vec4(1.0, 0.827, 0.416, 1.0);
    }
  `;

  const CLOUD_FRAGMENT_SHADER = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
    #else
      precision mediump float;
    #endif
    uniform sampler2D uCloudMap;
    uniform vec3 uSunPosition;
    uniform vec3 uCameraPosition;
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    varying vec2 vUv;

    void main() {
      float cloud = texture2D(uCloudMap, vUv).a;
      if (cloud < 0.025) discard;
      vec3 normal = normalize(vWorldNormal);
      vec3 lightDirection = normalize(uSunPosition - vWorldPosition);
      float daylight = smoothstep(-0.16, 0.22, dot(normal, lightDirection));
      vec3 color = mix(vec3(0.15, 0.24, 0.36), vec3(0.95, 0.98, 1.0), daylight);
      gl_FragColor = vec4(color, cloud * (0.2 + daylight * 0.46));
    }
  `;

  const ATMOSPHERE_FRAGMENT_SHADER = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
    #else
      precision mediump float;
    #endif
    uniform vec3 uCameraPosition;
    uniform vec3 uTint;
    uniform float uStrength;
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;

    void main() {
      vec3 normal = normalize(vWorldNormal);
      vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);
      float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.25);
      float alpha = fresnel * uStrength;
      gl_FragColor = vec4(uTint * (0.7 + fresnel * 0.8), alpha);
    }
  `;

  function seededRandom(seed) {
    let state = seed >>> 0;
    return function random() {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function createCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  class MapTextureBuilder {
    constructor(features) {
      this.features = features;
      this.width = MAP_WIDTH;
      this.height = MAP_HEIGHT;
      this.baseCanvas = createCanvas(this.width, this.height);
      this.mapCanvas = createCanvas(this.width, this.height);
      this.maskCanvas = createCanvas(this.width, this.height);
      this.pathCache = new WeakMap();
      this.drawBaseMap();
      this.drawMask();
      this.renderSelection(null);
    }

    ringIntoPath(path, ring) {
      const points = math.unwrapRing(ring);
      if (points.length === 0) return;

      for (let index = 0; index < points.length; index += 1) {
        const longitude = points[index][0];
        const latitude = points[index][1];
        const x = ((longitude + 180) / 360) * this.width;
        const y = ((90 - latitude) / 180) * this.height;
        if (index === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
      path.closePath();
    }

    pathForFeature(feature) {
      if (this.pathCache.has(feature)) return this.pathCache.get(feature);

      const path = new Path2D();
      const geometry = feature.geometry;
      const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;

      for (const polygon of polygons) {
        for (const ring of polygon) this.ringIntoPath(path, ring);
      }

      this.pathCache.set(feature, path);
      return path;
    }

    paintFeature(context, feature, fillStyle, strokeStyle, lineWidth) {
      const path = this.pathForFeature(feature);
      context.fillStyle = fillStyle;
      context.strokeStyle = strokeStyle || "transparent";
      context.lineWidth = lineWidth || 0;
      context.lineJoin = "round";
      context.lineCap = "round";

      for (const offset of [-this.width, 0, this.width]) {
        context.save();
        context.translate(offset, 0);
        context.fill(path, "evenodd");
        if (lineWidth > 0) context.stroke(path);
        context.restore();
      }
    }

    countryColor() {
      return "rgb(83, 109, 118)";
    }

    drawOcean(context) {
      context.fillStyle = "#183c53";
      context.fillRect(0, 0, this.width, this.height);
    }

    drawLatitudeGuides(context) {
      context.save();
      context.strokeStyle = "rgba(234, 242, 247, 0.16)";
      for (const latitude of [-66.56, -23.44, 0, 23.44, 66.56]) {
        const y = ((90 - latitude) / 180) * this.height;
        context.lineWidth = latitude === 0 ? 1 : 0.65;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(this.width, y);
        context.stroke();
      }
      context.restore();
    }

    drawBaseMap() {
      const context = this.baseCanvas.getContext("2d", { alpha: false });
      this.drawOcean(context);

      for (const feature of this.features) {
        this.paintFeature(
          context,
          feature,
          this.countryColor(feature),
          "rgba(234, 242, 247, 0.18)",
          0.55,
        );
      }
      this.drawLatitudeGuides(context);
    }

    drawMask() {
      const context = this.maskCanvas.getContext("2d", { alpha: false });
      context.fillStyle = "black";
      context.fillRect(0, 0, this.width, this.height);
      for (const feature of this.features) {
        this.paintFeature(context, feature, "white", "transparent", 0);
      }
    }

    renderSelection(feature) {
      const context = this.mapCanvas.getContext("2d", { alpha: false });
      context.clearRect(0, 0, this.width, this.height);
      context.drawImage(this.baseCanvas, 0, 0);

      if (!feature) return this.mapCanvas;

      this.paintFeature(
        context,
        feature,
        "rgba(217, 242, 124, 0.36)",
        "rgba(217, 242, 124, 0.82)",
        2.4,
      );

      const point = math.featureLabelPoint(feature);
      const x = ((point.longitude + 180) / 360) * this.width;
      const y = ((90 - point.latitude) / 180) * this.height;
      context.save();
      context.fillStyle = "rgba(7, 17, 31, 0.92)";
      context.strokeStyle = "rgba(121, 183, 200, 0.96)";
      context.lineWidth = 2;
      for (const offset of [-this.width, 0, this.width]) {
        context.beginPath();
        context.arc(x + offset, y, 4.8, 0, math.TAU);
        context.fill();
        context.stroke();
      }
      context.restore();
      return this.mapCanvas;
    }
  }

  function createCloudCanvas() {
    const canvas = createCanvas(CLOUD_WIDTH, CLOUD_HEIGHT);
    const context = canvas.getContext("2d");
    const random = seededRandom(424242);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.filter = "blur(4px)";

    for (let band = 0; band < 13; band += 1) {
      const bandLatitude = 0.15 + random() * 0.7;
      const count = 24 + Math.floor(random() * 25);
      for (let index = 0; index < count; index += 1) {
        const x = random() * canvas.width;
        const y = (bandLatitude + (random() - 0.5) * 0.075) * canvas.height;
        const width = 12 + random() * 46;
        const height = 2.5 + random() * 10;
        context.fillStyle = `rgba(255, 255, 255, ${0.07 + random() * 0.2})`;
        context.beginPath();
        context.ellipse(x, y, width, height, (random() - 0.5) * 0.34, 0, math.TAU);
        context.fill();
      }
    }

    context.restore();
    return canvas;
  }

  function compileProgram(gl, vertexSource, fragmentSource) {
    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const vertexShader = compile(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.bindAttribLocation(program, 0, "aPosition");
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = [
        gl.getProgramInfoLog(program),
        gl.getShaderInfoLog(vertexShader),
        gl.getShaderInfoLog(fragmentShader),
      ]
        .filter(Boolean)
        .join("\n");
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      throw new Error(`WebGL shader link failed:\n${message}`);
    }

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return program;
  }

  function programInfo(gl, program, attributes, uniforms) {
    const attributeLocations = {};
    const uniformLocations = {};
    for (const name of attributes) attributeLocations[name] = gl.getAttribLocation(program, name);
    for (const name of uniforms) uniformLocations[name] = gl.getUniformLocation(program, name);
    return { program, attributes: attributeLocations, uniforms: uniformLocations };
  }

  function createArrayBuffer(gl, values, usage) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, values, usage || gl.STATIC_DRAW);
    return buffer;
  }

  function createSphereGeometry(gl, longitudeSegments, latitudeSegments) {
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    for (let latitudeIndex = 0; latitudeIndex <= latitudeSegments; latitudeIndex += 1) {
      const v = latitudeIndex / latitudeSegments;
      const latitude = Math.PI / 2 - v * Math.PI;
      const cosineLatitude = Math.cos(latitude);
      const sineLatitude = Math.sin(latitude);

      for (let longitudeIndex = 0; longitudeIndex <= longitudeSegments; longitudeIndex += 1) {
        const u = longitudeIndex / longitudeSegments;
        const longitude = u * math.TAU - Math.PI;
        const x = cosineLatitude * Math.cos(longitude);
        const y = sineLatitude;
        const z = -cosineLatitude * Math.sin(longitude);
        positions.push(x, y, z);
        normals.push(x, y, z);
        uvs.push(u, v);
      }
    }

    const rowWidth = longitudeSegments + 1;
    for (let latitudeIndex = 0; latitudeIndex < latitudeSegments; latitudeIndex += 1) {
      for (let longitudeIndex = 0; longitudeIndex < longitudeSegments; longitudeIndex += 1) {
        const topLeft = latitudeIndex * rowWidth + longitudeIndex;
        const bottomLeft = topLeft + rowWidth;
        indices.push(topLeft, bottomLeft, topLeft + 1, bottomLeft, bottomLeft + 1, topLeft + 1);
      }
    }

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
      position: createArrayBuffer(gl, new Float32Array(positions)),
      normal: createArrayBuffer(gl, new Float32Array(normals)),
      uv: createArrayBuffer(gl, new Float32Array(uvs)),
      index: indexBuffer,
      count: indices.length,
    };
  }

  function createStarGeometry(gl) {
    const random = seededRandom(20250101);
    const positions = [];
    const colors = [];
    const sizes = [];
    const count = 280;

    for (let index = 0; index < count; index += 1) {
      const y = random() * 2 - 1;
      const angle = random() * math.TAU;
      const radial = Math.sqrt(Math.max(0, 1 - y * y));
      const radius = 42 + random() * 28;
      positions.push(
        radial * Math.cos(angle) * radius,
        y * radius,
        radial * Math.sin(angle) * radius,
      );
      const warmth = random();
      if (warmth > 0.92) colors.push(1.0, 0.83, 0.52);
      else if (warmth < 0.08) colors.push(0.49, 0.72, 0.78);
      else colors.push(0.88, 0.92, 0.94);
      sizes.push(0.45 + Math.pow(random(), 5) * 1.45);
    }

    return {
      count,
      position: createArrayBuffer(gl, new Float32Array(positions)),
      color: createArrayBuffer(gl, new Float32Array(colors)),
      size: createArrayBuffer(gl, new Float32Array(sizes)),
    };
  }

  function createOrbitGeometry(gl) {
    const positions = [];
    const colors = [];
    const segments = 360;

    for (let index = 0; index <= segments; index += 1) {
      const day = (index / segments) * math.YEAR_DAYS;
      const state = math.sampleState(day, ORBIT_SCALE);
      positions.push(state.position[0], state.position[1], state.position[2]);
      colors.push(...ORBIT_COLOR);
    }

    return {
      count: segments + 1,
      position: createArrayBuffer(gl, new Float32Array(positions)),
      color: createArrayBuffer(gl, new Float32Array(colors)),
    };
  }

  function createCalibrationTickGeometry(gl) {
    const positions = [];
    const colors = [];
    for (let month = 0; month < 12; month += 1) {
      const state = math.sampleState((month / 12) * math.YEAR_DAYS, ORBIT_SCALE);
      const radial = math.normalize3(state.position);
      const quarter = month % 3 === 0;
      const inward = quarter ? 0.16 : 0.09;
      const outward = quarter ? 0.2 : 0.12;
      positions.push(...math.subtract3(state.position, math.scale3(radial, inward)));
      positions.push(...math.add3(state.position, math.scale3(radial, outward)));
      const color = quarter ? QUARTER_TICK_COLOR : MONTH_TICK_COLOR;
      colors.push(...color, ...color);
    }
    return {
      count: 24,
      position: createArrayBuffer(gl, new Float32Array(positions)),
      color: createArrayBuffer(gl, new Float32Array(colors)),
    };
  }

  function createDynamicLineGeometry(gl, count, color) {
    const colors = [];
    for (let index = 0; index < count; index += 1) colors.push(...color);
    return {
      count,
      position: createArrayBuffer(gl, new Float32Array(count * 3), gl.DYNAMIC_DRAW),
      color: createArrayBuffer(gl, new Float32Array(colors)),
    };
  }

  function bindAttribute(gl, location, buffer, size) {
    if (location < 0) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  }

  function createTexture(gl, canvas, options) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options && options.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);

    const anisotropy =
      gl.getExtension("EXT_texture_filter_anisotropic") ||
      gl.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
      gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
    if (anisotropy) {
      const maximum = gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      gl.texParameterf(gl.TEXTURE_2D, anisotropy.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(4, maximum));
    }

    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
  }

  function updateTexture(gl, texture, canvas) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  class OrbitCamera {
    constructor(canvas, options) {
      this.canvas = canvas;
      this.mode = "overview";
      this.yaw = 0.04;
      this.pitch = 0.2;
      this.distance = 4.4;
      this.overviewZoom = 1;
      this.currentEye = null;
      this.currentTarget = null;
      this.reducedMotion = Boolean(options.reducedMotion);
      this.onModeChange = options.onModeChange || function noop() {};
      this.onChange = options.onChange || function noop() {};
      this.pointers = new Map();
      this.lastSinglePoint = null;
      this.lastPinchDistance = null;
      this.attach();
    }

    attach() {
      this.onPointerDown = (event) => {
        if (event.button !== undefined && event.button !== 0 && event.pointerType !== "touch") return;
        this.canvas.setPointerCapture(event.pointerId);
        this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (this.pointers.size === 1) this.lastSinglePoint = { x: event.clientX, y: event.clientY };
        if (this.pointers.size === 2) this.lastPinchDistance = this.pointerDistance();
        this.onChange();
      };

      this.onPointerMove = (event) => {
        if (!this.pointers.has(event.pointerId)) return;
        const previous = this.pointers.get(event.pointerId);
        this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

        if (this.pointers.size === 1) {
          const deltaX = event.clientX - previous.x;
          const deltaY = event.clientY - previous.y;
          this.yaw -= deltaX * 0.0062;
          this.pitch = math.clamp(this.pitch + deltaY * 0.0052, -1.05, 1.05);
          this.lastSinglePoint = { x: event.clientX, y: event.clientY };
        } else if (this.pointers.size === 2) {
          const distance = this.pointerDistance();
          if (this.lastPinchDistance && distance > 1) {
            this.zoomBy(this.lastPinchDistance / distance);
          }
          this.lastPinchDistance = distance;
        }
        this.onChange();
      };

      this.onPointerUp = (event) => {
        this.pointers.delete(event.pointerId);
        this.lastPinchDistance = this.pointers.size === 2 ? this.pointerDistance() : null;
        const remaining = this.pointers.values().next().value;
        this.lastSinglePoint = remaining ? { ...remaining } : null;
        this.onChange();
      };

      this.onWheel = (event) => {
        event.preventDefault();
        this.zoomBy(Math.exp(event.deltaY * 0.00115));
        this.onChange();
      };

      this.onKeyDown = (event) => {
        const orbitStep = event.shiftKey ? 0.18 : 0.08;
        let handled = true;
        if (event.key === "ArrowLeft") this.yaw += orbitStep;
        else if (event.key === "ArrowRight") this.yaw -= orbitStep;
        else if (event.key === "ArrowUp") this.pitch = math.clamp(this.pitch - orbitStep, -1.05, 1.05);
        else if (event.key === "ArrowDown") this.pitch = math.clamp(this.pitch + orbitStep, -1.05, 1.05);
        else if (event.key === "+" || event.key === "=") this.zoomBy(0.9);
        else if (event.key === "-" || event.key === "_") this.zoomBy(1.1);
        else if (event.key === "Home") this.setMode("overview");
        else handled = false;

        if (handled) {
          event.preventDefault();
          this.onChange();
        }
      };

      this.canvas.addEventListener("pointerdown", this.onPointerDown);
      this.canvas.addEventListener("pointermove", this.onPointerMove);
      this.canvas.addEventListener("pointerup", this.onPointerUp);
      this.canvas.addEventListener("pointercancel", this.onPointerUp);
      this.canvas.addEventListener("wheel", this.onWheel, { passive: false });
      this.canvas.addEventListener("keydown", this.onKeyDown);
    }

    pointerDistance() {
      const points = Array.from(this.pointers.values());
      if (points.length < 2) return 0;
      return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
    }

    zoomBy(factor) {
      if (this.mode === "overview") {
        this.overviewZoom = math.clamp(this.overviewZoom * factor, 0.72, 2.2);
      } else {
        this.distance = math.clamp(this.distance * factor, 2.65, 9.5);
      }
    }

    setMode(mode) {
      if (mode !== "overview" && mode !== "earth") return;
      if (this.mode === mode) return;
      this.mode = mode;
      if (mode === "overview") {
        this.yaw = 0.04;
        this.pitch = 0.2;
        this.distance = 4.4;
        this.overviewZoom = 1;
      }
      this.onModeChange(mode);
      this.onChange();
    }

    setReducedMotion(reducedMotion) {
      this.reducedMotion = Boolean(reducedMotion);
      this.onChange();
    }

    update(earthPosition, deltaSeconds, viewportAspect, viewportHeight) {
      let desiredTarget;
      let desiredEye;
      const aspect = Math.max(0.35, viewportAspect || 1);
      const portraitLift = math.clamp((0.9 - aspect) / 0.45, 0, 1);
      const shortLandscape = aspect > 1.65 && viewportHeight < 560;

      if (this.mode === "overview") {
        const framingScale = Math.max(1, 1.35 / aspect) * (shortLandscape ? 1.42 : 1);
        const orbitDistance = 13.4 * framingScale * this.overviewZoom;
        const cosinePitch = Math.cos(this.pitch);
        desiredTarget = math.scale3(earthPosition, 0.48);
        desiredTarget[0] += shortLandscape ? 4.5 : 0;
        desiredTarget[1] = -6.15 * portraitLift;
        desiredEye = math.add3(desiredTarget, [
          Math.sin(this.yaw) * cosinePitch * orbitDistance,
          Math.sin(this.pitch) * orbitDistance,
          Math.cos(this.yaw) * cosinePitch * orbitDistance,
        ]);
      } else {
        const cosinePitch = Math.cos(this.pitch);
        const focusScale = Math.max(1, 0.72 / aspect);
        const effectiveDistance = this.distance * focusScale;
        const offset = [
          Math.sin(this.yaw) * cosinePitch * effectiveDistance,
          Math.sin(this.pitch) * effectiveDistance,
          Math.cos(this.yaw) * cosinePitch * effectiveDistance,
        ];
        desiredTarget = earthPosition.slice();
        desiredTarget[1] -= 1.2 * portraitLift;
        desiredEye = math.add3(desiredTarget, offset);
      }

      let settled = true;
      if (!this.currentEye || !this.currentTarget || this.reducedMotion) {
        this.currentEye = desiredEye;
        this.currentTarget = desiredTarget;
      } else {
        const amount = 1 - Math.exp(-6.2 * Math.min(Math.max(deltaSeconds, 1 / 240), 0.1));
        this.currentEye = math.lerp3(this.currentEye, desiredEye, amount);
        this.currentTarget = math.lerp3(this.currentTarget, desiredTarget, amount);
        const eyeGap = math.length3(math.subtract3(this.currentEye, desiredEye));
        const targetGap = math.length3(math.subtract3(this.currentTarget, desiredTarget));
        settled = eyeGap + targetGap < 0.002;
        if (settled) {
          this.currentEye = desiredEye;
          this.currentTarget = desiredTarget;
        }
      }

      return { eye: this.currentEye, target: this.currentTarget, settled };
    }

    destroy() {
      this.canvas.removeEventListener("pointerdown", this.onPointerDown);
      this.canvas.removeEventListener("pointermove", this.onPointerMove);
      this.canvas.removeEventListener("pointerup", this.onPointerUp);
      this.canvas.removeEventListener("pointercancel", this.onPointerUp);
      this.canvas.removeEventListener("wheel", this.onWheel);
      this.canvas.removeEventListener("keydown", this.onKeyDown);
    }
  }

  class SeasonsRenderer {
    constructor(canvas, geojson, options) {
      this.canvas = canvas;
      this.options = options || {};
      this.reducedMotion = Boolean(this.options.reducedMotion);
      this.gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        depth: true,
        stencil: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance",
      });

      if (!this.gl) throw new Error("WebGL is not available in this browser.");
      this.features = geojson.features;
      this.mapBuilder = new MapTextureBuilder(this.features);
      this.width = Math.max(1, canvas.clientWidth || 1);
      this.height = Math.max(1, canvas.clientHeight || 1);
      this.pixelRatio = 1;
      this.sizeDirty = true;
      this.contextLost = false;
      this.selectedFeature = null;
      this.visualSpinAngle = null;
      this.visualCloudSpinAngle = null;
      this.previousSimulationDay = null;
      this.initialize();
      this.camera = new OrbitCamera(canvas, {
        reducedMotion: this.reducedMotion,
        onModeChange: (mode) => {
          if (this.options.onCameraModeChange) this.options.onCameraModeChange(mode);
        },
        onChange: () => {
          if (this.options.onInteraction) this.options.onInteraction();
        },
      });
      this.attachContextEvents();
    }

    initialize() {
      const gl = this.gl;
      this.programs = {
        stars: programInfo(
          gl,
          compileProgram(gl, STAR_VERTEX_SHADER, STAR_FRAGMENT_SHADER),
          ["aPosition", "aColor", "aSize"],
          ["uViewProjection", "uPixelRatio"],
        ),
        line: programInfo(
          gl,
          compileProgram(gl, LINE_VERTEX_SHADER, LINE_FRAGMENT_SHADER),
          ["aPosition", "aColor"],
          ["uViewProjection"],
        ),
        earth: programInfo(
          gl,
          compileProgram(gl, SPHERE_VERTEX_SHADER, EARTH_FRAGMENT_SHADER),
          ["aPosition", "aNormal", "aUv"],
          ["uModel", "uViewProjection", "uMap", "uLandMask", "uSunPosition", "uCameraPosition", "uAxis", "uSeasonColor"],
        ),
        sun: programInfo(
          gl,
          compileProgram(gl, SPHERE_VERTEX_SHADER, SUN_FRAGMENT_SHADER),
          ["aPosition", "aNormal", "aUv"],
          ["uModel", "uViewProjection", "uCameraPosition"],
        ),
        cloud: programInfo(
          gl,
          compileProgram(gl, SPHERE_VERTEX_SHADER, CLOUD_FRAGMENT_SHADER),
          ["aPosition", "aNormal", "aUv"],
          ["uModel", "uViewProjection", "uCloudMap", "uSunPosition", "uCameraPosition"],
        ),
        atmosphere: programInfo(
          gl,
          compileProgram(gl, SPHERE_VERTEX_SHADER, ATMOSPHERE_FRAGMENT_SHADER),
          ["aPosition", "aNormal", "aUv"],
          ["uModel", "uViewProjection", "uCameraPosition", "uTint", "uStrength"],
        ),
      };

      this.sphere = createSphereGeometry(gl, 112, 72);
      this.stars = createStarGeometry(gl);
      this.orbit = createOrbitGeometry(gl);
      this.calibrationTicks = createCalibrationTickGeometry(gl);
      this.currentTick = createDynamicLineGeometry(gl, 2, CURRENT_TICK_COLOR);
      this.meridian = createDynamicLineGeometry(gl, 73, MERIDIAN_COLOR);
      this.axis = createDynamicLineGeometry(gl, 2, QUARTER_TICK_COLOR);

      this.mapTexture = createTexture(gl, this.mapBuilder.mapCanvas, { repeat: true });
      this.landMaskTexture = createTexture(gl, this.mapBuilder.maskCanvas, { repeat: true });
      this.cloudTexture = createTexture(gl, createCloudCanvas(), { repeat: true });

      gl.clearColor(0.027, 0.067, 0.122, 1);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);
    }

    attachContextEvents() {
      this.onContextLost = (event) => {
        event.preventDefault();
        this.contextLost = true;
        if (this.options.onContextLost) this.options.onContextLost();
      };
      this.onContextRestored = () => {
        this.contextLost = false;
        if (this.options.onContextRestored) this.options.onContextRestored();
        window.location.reload();
      };
      this.canvas.addEventListener("webglcontextlost", this.onContextLost);
      this.canvas.addEventListener("webglcontextrestored", this.onContextRestored);
    }

    setReducedMotion(reducedMotion) {
      this.reducedMotion = Boolean(reducedMotion);
      this.camera.setReducedMotion(this.reducedMotion);
    }

    setCameraMode(mode) {
      this.camera.setMode(mode);
    }

    getCameraMode() {
      return this.camera.mode;
    }

    getCameraState() {
      return {
        mode: this.camera.mode,
        earthDistance: this.camera.distance,
        overviewZoom: this.camera.overviewZoom,
        yaw: this.camera.yaw,
        pitch: this.camera.pitch,
      };
    }

    setSelectedFeature(feature) {
      this.selectedFeature = feature;
      this.selectedCoordinates = feature ? math.featureLabelPoint(feature) : null;
      this.mapBuilder.renderSelection(feature);
      updateTexture(this.gl, this.mapTexture, this.mapBuilder.mapCanvas);
    }

    resize(width, height) {
      const nextWidth = Math.max(1, Number(width) || 1);
      const nextHeight = Math.max(1, Number(height) || 1);
      if (Math.abs(nextWidth - this.width) < 0.25 && Math.abs(nextHeight - this.height) < 0.25) return;
      this.width = nextWidth;
      this.height = nextHeight;
      this.sizeDirty = true;
    }

    resizeIfNeeded() {
      if (!this.sizeDirty) return;
      const rawPixelRatio = Math.min(window.devicePixelRatio || 1, 1.8);
      const maximumDimension = 2880;
      let width = Math.max(1, Math.round(this.width * rawPixelRatio));
      let height = Math.max(1, Math.round(this.height * rawPixelRatio));
      const scale = Math.min(1, maximumDimension / Math.max(width, height));
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));

      if (this.canvas.width !== width || this.canvas.height !== height) {
        this.canvas.width = width;
        this.canvas.height = height;
      }

      this.pixelRatio = width / this.width;
      this.gl.viewport(0, 0, width, height);
      this.sizeDirty = false;
    }

    bindSphere(program) {
      const gl = this.gl;
      bindAttribute(gl, program.attributes.aPosition, this.sphere.position, 3);
      bindAttribute(gl, program.attributes.aNormal, this.sphere.normal, 3);
      bindAttribute(gl, program.attributes.aUv, this.sphere.uv, 2);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sphere.index);
    }

    drawStars(viewProjection) {
      const gl = this.gl;
      const program = this.programs.stars;
      gl.useProgram(program.program);
      bindAttribute(gl, program.attributes.aPosition, this.stars.position, 3);
      bindAttribute(gl, program.attributes.aColor, this.stars.color, 3);
      bindAttribute(gl, program.attributes.aSize, this.stars.size, 1);
      gl.uniformMatrix4fv(program.uniforms.uViewProjection, false, viewProjection);
      gl.uniform1f(program.uniforms.uPixelRatio, this.pixelRatio);
      gl.drawArrays(gl.POINTS, 0, this.stars.count);
    }

    drawLineGeometry(geometry, viewProjection, mode) {
      const gl = this.gl;
      const program = this.programs.line;
      gl.useProgram(program.program);
      bindAttribute(gl, program.attributes.aPosition, geometry.position, 3);
      bindAttribute(gl, program.attributes.aColor, geometry.color, 4);
      gl.uniformMatrix4fv(program.uniforms.uViewProjection, false, viewProjection);
      gl.drawArrays(mode, 0, geometry.count);
    }

    drawSphere(program, model, viewProjection) {
      const gl = this.gl;
      gl.useProgram(program.program);
      this.bindSphere(program);
      gl.uniformMatrix4fv(program.uniforms.uModel, false, model);
      gl.uniformMatrix4fv(program.uniforms.uViewProjection, false, viewProjection);
      gl.drawElements(gl.TRIANGLES, this.sphere.count, gl.UNSIGNED_SHORT, 0);
    }

    composeModel(position, tilt, spin, radius) {
      const translation = math.translation4(position[0], position[1], position[2]);
      const tiltMatrix = math.rotationZ4(tilt);
      const spinMatrix = math.rotationY4(spin);
      const scaleMatrix = math.scale4(radius, radius, radius);
      return math.multiply4(
        translation,
        math.multiply4(tiltMatrix, math.multiply4(spinMatrix, scaleMatrix)),
      );
    }

    composeEarthModel(position, spin, radius) {
      const translation = math.translation4(position[0], position[1], position[2]);
      const orientation = math.earthOrientation4(spin);
      const scaleMatrix = math.scale4(radius, radius, radius);
      return math.multiply4(translation, math.multiply4(orientation, scaleMatrix));
    }

    render(day, timeSeconds, deltaSeconds) {
      if (this.contextLost) return null;
      this.resizeIfNeeded();
      const gl = this.gl;
      const orbital = math.sampleState(day, ORBIT_SCALE);
      const cameraState = this.camera.update(
        orbital.position,
        deltaSeconds,
        this.width / this.height,
        this.height,
      );
      const projection = math.perspective4(40 * math.DEG, this.width / this.height, 0.08, 120);
      const view = math.lookAt4(cameraState.eye, cameraState.target, [0, 1, 0]);
      const viewProjection = math.multiply4(projection, view);

      if (
        this.visualSpinAngle == null ||
        this.visualCloudSpinAngle == null ||
        this.previousSimulationDay == null
      ) {
        this.visualSpinAngle = math.earthSpinAngle(day);
        this.visualCloudSpinAngle = this.visualSpinAngle;
      } else if (!this.reducedMotion) {
        const spinDelta = math.cappedVisualSpinDelta(
          this.previousSimulationDay,
          day,
          deltaSeconds,
        );
        this.visualSpinAngle = math.mod(this.visualSpinAngle + spinDelta, math.TAU);
        this.visualCloudSpinAngle = math.mod(
          this.visualCloudSpinAngle + spinDelta,
          math.TAU,
        );
      }
      this.previousSimulationDay = day;

      const starDirection = math.normalize3(math.subtract3(cameraState.target, cameraState.eye));
      const starView = math.lookAt4([0, 0, 0], starDirection, [0, 1, 0]);
      const starViewProjection = math.multiply4(projection, starView);

      const earthModel = this.composeEarthModel(
        orbital.position,
        this.visualSpinAngle,
        EARTH_RADIUS,
      );
      const cloudModel = this.composeEarthModel(
        orbital.position,
        this.visualCloudSpinAngle,
        EARTH_RADIUS * 1.016,
      );
      const atmosphereModel = this.composeEarthModel(
        orbital.position,
        this.visualSpinAngle,
        EARTH_RADIUS * 1.052,
      );
      const sunModel = this.composeModel([0, 0, 0], 0, math.sunSpinAngle(day), SUN_RADIUS);

      const radial = math.normalize3(orbital.position);
      const currentTickStart = math.subtract3(orbital.position, math.scale3(radial, 0.19));
      const currentTickEnd = math.add3(orbital.position, math.scale3(radial, 0.28));
      gl.bindBuffer(gl.ARRAY_BUFFER, this.currentTick.position);
      gl.bufferSubData(
        gl.ARRAY_BUFFER,
        0,
        new Float32Array([...currentTickStart, ...currentTickEnd]),
      );

      if (this.selectedCoordinates) {
        const meridianPositions = [];
        for (let index = 0; index < this.meridian.count; index += 1) {
          const latitude = -90 + (180 * index) / (this.meridian.count - 1);
          const local = math.scale3(
            math.latLonToUnit(latitude, this.selectedCoordinates.longitude),
            1.026,
          );
          const world = math.transformPoint4(earthModel, [...local, 1]);
          meridianPositions.push(world[0], world[1], world[2]);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.meridian.position);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(meridianPositions));
      }

      this.earthModel = earthModel;
      this.orbital = orbital;
      this.viewProjection = viewProjection;
      this.cameraState = cameraState;

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      this.drawStars(starViewProjection);

      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(false);
      this.drawLineGeometry(this.orbit, viewProjection, gl.LINE_STRIP);
      this.drawLineGeometry(this.calibrationTicks, viewProjection, gl.LINES);
      this.drawLineGeometry(this.currentTick, viewProjection, gl.LINES);

      gl.depthMask(true);
      gl.disable(gl.BLEND);
      const sunProgram = this.programs.sun;
      gl.useProgram(sunProgram.program);
      gl.uniform3fv(sunProgram.uniforms.uCameraPosition, cameraState.eye);
      this.drawSphere(sunProgram, sunModel, viewProjection);

      const earthProgram = this.programs.earth;
      gl.useProgram(earthProgram.program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.mapTexture);
      gl.uniform1i(earthProgram.uniforms.uMap, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.landMaskTexture);
      gl.uniform1i(earthProgram.uniforms.uLandMask, 1);
      gl.uniform3f(earthProgram.uniforms.uSunPosition, 0, 0, 0);
      gl.uniform3fv(earthProgram.uniforms.uCameraPosition, cameraState.eye);
      gl.uniform3fv(earthProgram.uniforms.uAxis, math.AXIS);
      gl.uniform3f(earthProgram.uniforms.uSeasonColor, 0.85, 0.95, 0.49);
      this.drawSphere(earthProgram, earthModel, viewProjection);

      gl.enable(gl.BLEND);
      gl.depthMask(false);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      const cloudProgram = this.programs.cloud;
      gl.useProgram(cloudProgram.program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.cloudTexture);
      gl.uniform1i(cloudProgram.uniforms.uCloudMap, 0);
      gl.uniform3f(cloudProgram.uniforms.uSunPosition, 0, 0, 0);
      gl.uniform3fv(cloudProgram.uniforms.uCameraPosition, cameraState.eye);
      this.drawSphere(cloudProgram, cloudModel, viewProjection);

      const atmosphereProgram = this.programs.atmosphere;
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.useProgram(atmosphereProgram.program);
      gl.uniform3fv(atmosphereProgram.uniforms.uCameraPosition, cameraState.eye);
      gl.uniform3f(atmosphereProgram.uniforms.uTint, 0.31, 0.61, 0.77);
      gl.uniform1f(atmosphereProgram.uniforms.uStrength, 0.32);
      this.drawSphere(atmosphereProgram, atmosphereModel, viewProjection);

      const axisLength = EARTH_RADIUS * 1.62;
      const south = math.subtract3(orbital.position, math.scale3(math.AXIS, axisLength));
      const north = math.add3(orbital.position, math.scale3(math.AXIS, axisLength));
      gl.bindBuffer(gl.ARRAY_BUFFER, this.axis.position);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array([...south, ...north]));
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      this.drawLineGeometry(this.axis, viewProjection, gl.LINES);
      if (this.selectedCoordinates) {
        this.drawLineGeometry(this.meridian, viewProjection, gl.LINE_STRIP);
      }

      gl.depthMask(true);
      gl.disable(gl.BLEND);

      const sunScreen = math.projectToScreen([0, 0, 0], viewProjection, this.width, this.height);
      const sunEdge = math.projectToScreen([SUN_RADIUS, 0, 0], viewProjection, this.width, this.height);
      const northScreen = math.projectToScreen(north, viewProjection, this.width, this.height);

      this.frameState = {
        day,
        timeSeconds,
        visualSpinAngle: this.visualSpinAngle,
        orbital,
        earthModel,
        viewProjection,
        camera: cameraState,
        needsFrame: !cameraState.settled,
        sun: {
          ...sunScreen,
          radius: Math.max(24, Math.hypot(sunEdge.x - sunScreen.x, sunEdge.y - sunScreen.y)),
        },
        axisNorth: northScreen,
      };
      return this.frameState;
    }

    projectCountry(latitude, longitude) {
      if (!this.frameState) return null;
      const localUnit = math.latLonToUnit(latitude, longitude);
      const localSurface = [...math.scale3(localUnit, 1.018), 1];
      const world = math.transformPoint4(this.earthModel, localSurface);
      const worldPoint = [world[0], world[1], world[2]];
      const normal = math.normalize3(math.subtract3(worldPoint, this.orbital.position));
      const toCamera = math.normalize3(math.subtract3(this.cameraState.eye, worldPoint));
      const facing = math.dot3(normal, toCamera);
      const daylight = math.dot3(normal, this.orbital.lightDirection);
      const screen = math.projectToScreen(worldPoint, this.viewProjection, this.width, this.height);
      return {
        ...screen,
        world: worldPoint,
        normal,
        facing,
        daylight,
        visible: screen.inFront && facing > 0.025,
      };
    }

    destroy() {
      this.camera.destroy();
      this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
      this.canvas.removeEventListener("webglcontextrestored", this.onContextRestored);
      const loseContext = this.gl.getExtension("WEBGL_lose_context");
      if (loseContext) loseContext.loseContext();
    }
  }

  root.SeasonsEngine = Object.freeze({
    EARTH_RADIUS,
    SUN_RADIUS,
    ORBIT_SCALE,
    MapTextureBuilder,
    OrbitCamera,
    SeasonsRenderer,
    createRenderer(canvas, geojson, options) {
      return new SeasonsRenderer(canvas, geojson, options);
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : window);
