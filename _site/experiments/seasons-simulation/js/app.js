(function startSeasonsExperience(root) {
  "use strict";

  const math = root.SeasonsMath;
  const engine = root.SeasonsEngine;
  const geojson = root.NATURAL_EARTH;

  if (!math || !engine || !geojson) {
    throw new Error("The seasons experiment did not load all required local scripts.");
  }

  const elements = {
    experience: document.getElementById("experience"),
    canvas: document.getElementById("space-canvas"),
    fallback: document.getElementById("webgl-fallback"),
    fallbackCanvas: document.getElementById("fallback-canvas"),
    fallbackCountry: document.getElementById("fallback-country"),
    fallbackDate: document.getElementById("fallback-date"),
    fallbackSeason: document.getElementById("fallback-season"),
    annotation: document.getElementById("country-annotation"),
    leaderLine: document.getElementById("leader-line"),
    leaderGhost: document.getElementById("leader-ghost"),
    surfacePoint: document.getElementById("surface-point"),
    surfacePulse: document.getElementById("surface-pulse"),
    axisLine: document.getElementById("axis-extension"),
    axisCap: document.getElementById("axis-cap"),
    axisLabel: document.getElementById("axis-label"),
    countryTag: document.getElementById("country-tag"),
    tagIndex: document.getElementById("tag-index"),
    tagCountry: document.getElementById("tag-country"),
    tagCoordinates: document.getElementById("tag-coordinates"),
    tagHorizon: document.getElementById("tag-horizon"),
    panel: document.getElementById("controls"),
    panelHandle: document.getElementById("panel-handle"),
    runningState: document.getElementById("running-state"),
    recordCount: document.getElementById("record-count"),
    countryCombobox: document.getElementById("country-combobox"),
    countrySearch: document.getElementById("country-search"),
    countryOptions: document.getElementById("country-options"),
    countryCode: document.getElementById("country-code"),
    countryAnnouncement: document.getElementById("country-announcement"),
    panelAnnouncement: document.getElementById("panel-announcement"),
    currentDate: document.getElementById("current-date"),
    dateMonth: document.getElementById("date-month"),
    dateNumber: document.getElementById("date-number"),
    dayNumber: document.getElementById("day-number"),
    seasonName: document.getElementById("season-name"),
    seasonSymbol: document.getElementById("season-symbol"),
    daylightValue: document.getElementById("daylight-value"),
    declinationValue: document.getElementById("declination-value"),
    solarNoonValue: document.getElementById("solar-noon-value"),
    timeline: document.getElementById("timeline"),
    timelineOutput: document.getElementById("timeline-output"),
    orbitCursor: document.getElementById("orbit-cursor"),
    playToggle: document.getElementById("play-toggle"),
    speed: document.getElementById("speed"),
    speedOutput: document.getElementById("speed-output"),
    speedPresets: Array.from(document.querySelectorAll("[data-speed]")),
    earthView: document.getElementById("earth-view"),
    overviewView: document.getElementById("overview-view"),
  };

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobilePanelQuery = window.matchMedia("(max-width: 700px)");
  const SPEED_STOPS = Object.freeze([0.1, 0.5, 1, 5, 10, 30]);
  const collator = new Intl.Collator("en", { sensitivity: "base" });
  const state = {
    day: 0,
    speed: 1,
    playing: !reducedMotionQuery.matches,
    selected: null,
    timelineScrubbing: false,
    activeCountryOption: -1,
    visibleCountryOptions: [],
    panelManuallyPositioned: false,
    panelOffset: { x: 0, y: 0 },
  };

  let renderer;
  let usingFallback = false;
  let resizeObserver = null;
  let animationFrame = null;
  let lastTimestamp = null;
  let lastDisplayDay = -1;
  let tagRect = null;
  let annotationDirty = true;
  let lastHorizonMessage = "";
  let firstFrameRendered = false;
  let lastFrameNeedsAnother = false;

  function setText(element, value) {
    if (element.textContent !== value) element.textContent = value;
  }

  function propertyText(properties, key) {
    const value = properties && properties[key];
    if (value == null || value === "" || value === -99 || value === "-99") return "";
    return String(value);
  }

  function countryCode(properties) {
    const candidates = ["ISO_A3", "ADM0_ISO", "SOV_A3", "ADM0_A3", "POSTAL"];
    for (const key of candidates) {
      const value = propertyText(properties, key);
      if (value) return value.toUpperCase();
    }
    return String(properties.NE_ID || "MAP").slice(-3);
  }

  function buildCountryCatalog(features) {
    return features
      .map((feature, index) => {
        const properties = feature.properties || {};
        const name =
          propertyText(properties, "ADMIN") ||
          propertyText(properties, "NAME_LONG") ||
          propertyText(properties, "NAME_EN") ||
          `Mapped place ${index + 1}`;
        const code = countryCode(properties);
        const point = math.featureLabelPoint(feature);
        const searchableFields = [
          name,
          code,
          propertyText(properties, "NAME"),
          propertyText(properties, "NAME_LONG"),
          propertyText(properties, "NAME_EN"),
          propertyText(properties, "FORMAL_EN"),
          propertyText(properties, "SOVEREIGNT"),
          propertyText(properties, "ABBREV"),
          propertyText(properties, "POSTAL"),
          propertyText(properties, "ISO_A2"),
          propertyText(properties, "ISO_A3"),
          propertyText(properties, "ADM0_ISO"),
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("en");

        return {
          feature,
          name,
          code,
          latitude: point.latitude,
          longitude: point.longitude,
          continent: propertyText(properties, "CONTINENT") || "Mapped sovereignty",
          type: propertyText(properties, "TYPE") || "Mapped place",
          searchText: searchableFields,
        };
      })
      .sort((a, b) => collator.compare(a.name, b.name));
  }

  const catalog = buildCountryCatalog(geojson.features);
  elements.recordCount.textContent = `${catalog.length} mapped`;

  function findCountry(query) {
    const normalized = String(query || "").trim().toLocaleLowerCase("en");
    if (!normalized) return null;
    return (
      catalog.find((entry) => entry.name.toLocaleLowerCase("en") === normalized) ||
      catalog.find((entry) => entry.code.toLocaleLowerCase("en") === normalized) ||
      null
    );
  }

  function formatSignedDegrees(value) {
    const absolute = Math.abs(value).toFixed(1);
    return `${value < 0 ? "−" : "+"}${absolute}°`;
  }

  function formatAltitude(value) {
    return `${value < 0 ? "−" : ""}${Math.abs(value).toFixed(1)}°`;
  }

  function updateDateReadout(force) {
    const dateParts = math.datePartsForDay(state.day);
    if (!force && dateParts.dayIndex === lastDisplayDay) return;
    lastDisplayDay = dateParts.dayIndex;

    const orbital = math.sampleState(state.day, 1);
    const season = math.seasonForLatitude(state.day, state.selected.latitude);
    const daylight = math.daylightHours(state.selected.latitude, orbital.declination);
    const solarNoon = math.solarNoonAltitude(state.selected.latitude, orbital.declination);

    elements.currentDate.dateTime = dateParts.iso;
    setText(elements.dateMonth, dateParts.monthShort);
    setText(elements.dateNumber, String(dateParts.dateOfMonth).padStart(2, "0"));
    setText(elements.dayNumber, String(dateParts.dayNumber).padStart(3, "0"));
    setText(elements.timelineOutput, `${dateParts.monthLong.slice(0, 3)} ${dateParts.dateOfMonth}`);
    setText(
      elements.seasonName,
      season.equatorial ? `${season.label} · equatorial light` : season.label,
    );
    setText(elements.daylightValue, math.formatDaylight(daylight));
    setText(elements.declinationValue, formatSignedDegrees(orbital.declinationDegrees));
    setText(elements.solarNoonValue, formatAltitude(solarNoon));
    setText(elements.fallbackCountry, state.selected.name);
    setText(elements.fallbackDate, `${dateParts.monthShort} ${String(dateParts.dateOfMonth).padStart(2, "0")}`);
    setText(elements.fallbackSeason, season.label);
    elements.timeline.setAttribute(
      "aria-valuetext",
      `${dateParts.monthLong} ${dateParts.dateOfMonth}, day ${dateParts.dayNumber}, ${season.label}`,
    );
  }

  function updateTimelinePosition() {
    const wrapped = math.wrapSimulationDay(state.day);
    const percentage = (wrapped / math.YEAR_DAYS) * 100;
    if (!state.timelineScrubbing) elements.timeline.value = String(wrapped);
    elements.timeline.style.setProperty("--timeline-pct", `${percentage}%`);
    elements.orbitCursor.style.setProperty("--timeline-pct", `${percentage}%`);
  }

  function updateSpeedReadout() {
    const speedIndex = SPEED_STOPS.indexOf(state.speed);
    const formatted = state.speed < 10 ? state.speed.toFixed(1) : state.speed.toFixed(0);
    elements.speedOutput.innerHTML = `<strong>${formatted}</strong><span>${state.speed === 1 ? "day / sec" : "days / sec"}</span>`;
    elements.speed.value = String(Math.max(0, speedIndex));
    elements.speed.setAttribute(
      "aria-valuetext",
      `${formatted} simulated ${state.speed === 1 ? "day" : "days"} per second`,
    );

    for (const button of elements.speedPresets) {
      const active = Math.abs(Number(button.dataset.speed) - state.speed) < 0.001;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    }
  }

  function setPlaying(playing) {
    state.playing = Boolean(playing);
    elements.playToggle.setAttribute("aria-pressed", String(state.playing));
    elements.playToggle.setAttribute("aria-label", state.playing ? "Pause simulation" : "Resume simulation");
    elements.runningState.classList.toggle("is-paused", !state.playing);
    elements.runningState.innerHTML = `<i aria-hidden="true"></i> ${state.playing ? "Running" : "Paused"}`;
    if (state.playing) requestRender();
  }

  function updateCameraButtons(mode) {
    const earthActive = mode === "earth";
    elements.earthView.classList.toggle("is-active", earthActive);
    elements.overviewView.classList.toggle("is-active", !earthActive);
    elements.earthView.setAttribute("aria-pressed", String(earthActive));
    elements.overviewView.setAttribute("aria-pressed", String(!earthActive));
  }

  function closeCountryOptions() {
    elements.countryOptions.hidden = true;
    elements.countrySearch.setAttribute("aria-expanded", "false");
    elements.countrySearch.setAttribute("aria-activedescendant", "");
    state.activeCountryOption = -1;
  }

  function countryMatches(query) {
    const normalized = String(query || "").trim().toLocaleLowerCase("en");
    if (!normalized) return catalog.slice(0, 12);

    return catalog
      .map((entry) => {
        const name = entry.name.toLocaleLowerCase("en");
        const code = entry.code.toLocaleLowerCase("en");
        let rank = 4;
        if (name === normalized || code === normalized) rank = 0;
        else if (name.startsWith(normalized) || code.startsWith(normalized)) rank = 1;
        else if (entry.searchText.includes(` ${normalized}`)) rank = 2;
        else if (entry.searchText.includes(normalized)) rank = 3;
        return { entry, rank };
      })
      .filter((candidate) => candidate.rank < 4)
      .sort((a, b) => a.rank - b.rank || collator.compare(a.entry.name, b.entry.name))
      .slice(0, 14)
      .map((candidate) => candidate.entry);
  }

  function setActiveCountryOption(index) {
    const maximum = state.visibleCountryOptions.length - 1;
    state.activeCountryOption = math.clamp(index, 0, Math.max(0, maximum));
    const optionElements = Array.from(elements.countryOptions.querySelectorAll("[role='option']"));
    optionElements.forEach((option, optionIndex) => {
      const active = optionIndex === state.activeCountryOption;
      option.classList.toggle("is-active", active);
      if (active) {
        elements.countrySearch.setAttribute("aria-activedescendant", option.id);
        option.scrollIntoView({ block: "nearest" });
      }
    });
  }

  function renderCountryOptions(query) {
    state.visibleCountryOptions = countryMatches(query);
    state.activeCountryOption = -1;
    elements.countryOptions.replaceChildren();

    if (state.visibleCountryOptions.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-option";
      empty.textContent = "No mapped country matches that search.";
      elements.countryOptions.appendChild(empty);
    } else {
      state.visibleCountryOptions.forEach((entry, index) => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "country-option";
        option.id = `country-option-${index}`;
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", String(state.selected === entry));
        option.innerHTML = `<span><strong>${escapeHtml(entry.name)}</strong><small>${escapeHtml(entry.continent)} · ${escapeHtml(entry.type)}</small></span><span>${escapeHtml(entry.code)}</span>`;
        option.addEventListener("pointerdown", (event) => event.preventDefault());
        option.addEventListener("click", () => selectCountry(entry, true));
        elements.countryOptions.appendChild(option);
      });
    }

    elements.countryOptions.hidden = false;
    elements.countrySearch.setAttribute("aria-expanded", "true");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function selectCountry(entry, announce) {
    if (!entry) return false;
    state.selected = entry;
    renderer.setSelectedFeature(entry.feature);
    elements.countrySearch.value = entry.name;
    setText(elements.countryCode, entry.code);
    setText(elements.tagIndex, `Selected country / ${entry.code}`);
    setText(elements.tagCountry, entry.name);
    setText(
      elements.tagCoordinates,
      `${math.formatCoordinate(entry.latitude, "N", "S", 1)} · ${math.formatCoordinate(entry.longitude, "E", "W", 1)}`,
    );
    lastDisplayDay = -1;
    annotationDirty = true;
    updateDateReadout(true);
    closeCountryOptions();
    requestRender();

    if (announce) {
      const season = math.seasonForLatitude(state.day, entry.latitude);
      elements.countryAnnouncement.textContent = `${entry.name} selected. ${season.label}, day ${math.datePartsForDay(state.day).dayNumber}.`;
    }
    return true;
  }

  function updateAnnotation(frame) {
    if (!frame || frame.fallback || !state.selected) {
      elements.annotation.hidden = Boolean(frame && frame.fallback);
      return;
    }
    elements.annotation.hidden = false;
    const projection = renderer.projectCountry(state.selected.latitude, state.selected.longitude);
    if (!projection) return;

    if (annotationDirty || !tagRect) {
      tagRect = elements.countryTag.getBoundingClientRect();
      annotationDirty = false;
    }

    const startX = math.clamp(projection.x, -80, window.innerWidth + 80);
    const startY = math.clamp(projection.y, -80, window.innerHeight + 80);
    const endX = tagRect.right + 6;
    const endY = tagRect.top + Math.min(34, tagRect.height * 0.42);
    const path = `M ${endX.toFixed(2)} ${endY.toFixed(2)} L ${startX.toFixed(2)} ${startY.toFixed(2)}`;

    elements.leaderLine.setAttribute("d", path);
    elements.leaderGhost.setAttribute("d", path);
    elements.surfacePoint.setAttribute("cx", startX.toFixed(2));
    elements.surfacePoint.setAttribute("cy", startY.toFixed(2));
    elements.surfacePulse.setAttribute("cx", startX.toFixed(2));
    elements.surfacePulse.setAttribute("cy", startY.toFixed(2));
    elements.annotation.classList.toggle("is-behind", !projection.visible);

    let horizonMessage;
    if (!projection.visible) horizonMessage = "OCCLUDED";
    else if (projection.daylight > 0.12) horizonMessage = "SUN-FACING";
    else if (projection.daylight < -0.12) horizonMessage = "NIGHT-SIDE";
    else horizonMessage = "TERMINATOR";

    if (horizonMessage !== lastHorizonMessage) {
      setText(elements.tagHorizon, horizonMessage);
      lastHorizonMessage = horizonMessage;
    }

    const earthCenter = math.projectToScreen(
      frame.orbital.position,
      frame.viewProjection,
      window.innerWidth,
      window.innerHeight,
    );
    const axis = frame.axisNorth;
    elements.axisLine.setAttribute("x1", earthCenter.x.toFixed(2));
    elements.axisLine.setAttribute("y1", earthCenter.y.toFixed(2));
    elements.axisLine.setAttribute("x2", axis.x.toFixed(2));
    elements.axisLine.setAttribute("y2", axis.y.toFixed(2));
    elements.axisCap.setAttribute("cx", axis.x.toFixed(2));
    elements.axisCap.setAttribute("cy", axis.y.toFixed(2));
    elements.axisLabel.style.transform = `translate3d(${(axis.x + 8).toFixed(2)}px, ${(axis.y - 4).toFixed(2)}px, 0)`;

  }

  function setSpeed(value) {
    const requested = Number(value);
    state.speed = SPEED_STOPS.reduce((closest, candidate) =>
      Math.abs(candidate - requested) < Math.abs(closest - requested) ? candidate : closest,
    SPEED_STOPS[0]);
    updateSpeedReadout();
  }

  function initializeCountryCombobox() {
    elements.countrySearch.addEventListener("focus", () => renderCountryOptions(elements.countrySearch.value));
    elements.countrySearch.addEventListener("input", () => renderCountryOptions(elements.countrySearch.value));
    elements.countrySearch.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (elements.countryOptions.hidden) renderCountryOptions(elements.countrySearch.value);
        setActiveCountryOption(state.activeCountryOption + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (elements.countryOptions.hidden) renderCountryOptions(elements.countrySearch.value);
        setActiveCountryOption(state.activeCountryOption <= 0 ? state.visibleCountryOptions.length - 1 : state.activeCountryOption - 1);
      } else if (event.key === "Enter") {
        const active = state.visibleCountryOptions[state.activeCountryOption];
        const exact = findCountry(elements.countrySearch.value);
        if (active || exact) {
          event.preventDefault();
          selectCountry(active || exact, true);
        }
      } else if (event.key === "Escape") {
        closeCountryOptions();
        elements.countrySearch.value = state.selected.name;
      }
    });

    document.addEventListener("pointerdown", (event) => {
      if (!elements.countryCombobox.contains(event.target)) closeCountryOptions();
    });
  }

  function initializeTimeline() {
    const maximum = Math.floor(math.YEAR_DAYS * 100) / 100;
    elements.timeline.max = maximum.toFixed(2);

    function applyTimelineValue(value) {
      state.day = math.clamp(Number(value) || 0, 0, maximum);
      lastDisplayDay = -1;
      updateTimelinePosition();
      updateDateReadout(true);
      requestRender();
    }

    function settleTimeline() {
      if (!state.timelineScrubbing && document.activeElement !== elements.timeline) return;
      state.timelineScrubbing = false;
      applyTimelineValue(Math.round(Number(elements.timeline.value)));
    }

    elements.timeline.addEventListener("pointerdown", () => {
      state.timelineScrubbing = true;
    });
    elements.timeline.addEventListener("pointerup", settleTimeline);
    elements.timeline.addEventListener("pointercancel", settleTimeline);
    elements.timeline.addEventListener("change", settleTimeline);
    elements.timeline.addEventListener("blur", () => {
      if (state.timelineScrubbing) settleTimeline();
    });
    elements.timeline.addEventListener("input", () => {
      applyTimelineValue(elements.timeline.value);
    });
    elements.timeline.addEventListener("keydown", (event) => {
      const directions = {
        ArrowLeft: -1,
        ArrowDown: -1,
        ArrowRight: 1,
        ArrowUp: 1,
      };
      if (directions[event.key]) {
        const step = event.shiftKey ? 30 : 1;
        applyTimelineValue(Math.round(state.day) + directions[event.key] * step);
        event.preventDefault();
      } else if (event.key === "Home") {
        applyTimelineValue(0);
        event.preventDefault();
      } else if (event.key === "End") {
        applyTimelineValue(maximum);
        event.preventDefault();
      }
    });
  }

  function initializePlayback() {
    elements.playToggle.addEventListener("click", () => setPlaying(!state.playing));
    elements.speed.addEventListener("input", () => {
      const index = math.clamp(Math.round(Number(elements.speed.value)), 0, SPEED_STOPS.length - 1);
      setSpeed(SPEED_STOPS[index]);
    });
    for (const button of elements.speedPresets) {
      button.addEventListener("click", () => setSpeed(button.dataset.speed));
    }
    elements.earthView.addEventListener("click", () => renderer.setCameraMode("earth"));
    elements.overviewView.addEventListener("click", () => renderer.setCameraMode("overview"));

    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const typing = target instanceof HTMLInputElement || target instanceof HTMLButtonElement || target instanceof HTMLTextAreaElement;
      if (typing) return;
      if (event.code === "Space") {
        event.preventDefault();
        setPlaying(!state.playing);
      } else if (event.key.toLocaleLowerCase("en") === "o") {
        renderer.setCameraMode("overview");
      } else if (event.key.toLocaleLowerCase("en") === "e") {
        renderer.setCameraMode("earth");
      }
    });
  }

  function initializePanelDrag() {
    let dragState = null;
    const margin = 8;

    function applyPanelOffset(x, y) {
      const nextX = mobilePanelQuery.matches ? 0 : x;
      state.panelOffset = { x: nextX, y };
      state.panelManuallyPositioned = Math.abs(nextX) > 0.5 || Math.abs(y) > 0.5;
      elements.panel.style.setProperty("--panel-x", `${nextX.toFixed(2)}px`);
      elements.panel.style.setProperty("--panel-y", `${y.toFixed(2)}px`);
      annotationDirty = true;
    }

    function measureBounds() {
      const rect = elements.panel.getBoundingClientRect();
      const viewport = window.visualViewport;
      const viewportWidth = viewport ? viewport.width : window.innerWidth;
      const viewportHeight = viewport ? viewport.height : window.innerHeight;
      const rootStyle = getComputedStyle(document.documentElement);
      const safeTop = parseFloat(rootStyle.getPropertyValue("--safe-top")) || 0;
      const safeRight = parseFloat(rootStyle.getPropertyValue("--safe-right")) || 0;
      const safeBottom = parseFloat(rootStyle.getPropertyValue("--safe-bottom")) || 0;
      const safeLeft = parseFloat(rootStyle.getPropertyValue("--safe-left")) || 0;
      const offset = state.panelOffset;
      const bounds = {
        minX: offset.x + margin + safeLeft - rect.left,
        maxX: offset.x + viewportWidth - margin - safeRight - rect.right,
        minY: offset.y + margin + safeTop - rect.top,
        maxY: offset.y + viewportHeight - margin - safeBottom - rect.bottom,
      };

      if (mobilePanelQuery.matches) {
        bounds.minX = 0;
        bounds.maxX = 0;
        bounds.maxY = offset.y + viewportHeight - margin - safeBottom - 44 - rect.top;
      }
      if (bounds.minX > bounds.maxX) bounds.minX = bounds.maxX = 0;
      if (bounds.minY > bounds.maxY) bounds.minY = bounds.maxY = 0;
      return bounds;
    }

    function clampOffset(x, y, bounds) {
      return {
        x: math.clamp(x, bounds.minX, bounds.maxX),
        y: math.clamp(y, bounds.minY, bounds.maxY),
      };
    }

    function nearest(value, candidates) {
      return candidates.reduce((best, candidate) =>
        Math.abs(candidate - value) < Math.abs(best - value) ? candidate : best,
      candidates[0]);
    }

    function mobileSnapY(value, bounds) {
      const expanded = math.clamp(0, bounds.minY, bounds.maxY);
      const middle = expanded + (bounds.maxY - expanded) * 0.52;
      return nearest(value, [bounds.minY, expanded, middle, bounds.maxY]);
    }

    function snapDesktop(offset, bounds) {
      const threshold = 24;
      let x = offset.x;
      let y = offset.y;
      if (Math.abs(x - bounds.minX) <= threshold) x = bounds.minX;
      else if (Math.abs(x - bounds.maxX) <= threshold) x = bounds.maxX;
      if (Math.abs(y - bounds.minY) <= threshold) y = bounds.minY;
      else if (Math.abs(y - bounds.maxY) <= threshold) y = bounds.maxY;
      return { x, y };
    }

    function announcePanelPosition(bounds) {
      if (mobilePanelQuery.matches) {
        const expanded = math.clamp(0, bounds.minY, bounds.maxY);
        const progress = (state.panelOffset.y - expanded) / Math.max(1, bounds.maxY - expanded);
        const label = state.panelOffset.y < expanded - 2 ? "fully expanded" : progress > 0.82 ? "collapsed" : progress > 0.28 ? "half open" : "expanded";
        elements.panelAnnouncement.textContent = `Observatory bottom sheet ${label}.`;
        return;
      }
      const horizontal = (state.panelOffset.x - bounds.minX) / Math.max(1, bounds.maxX - bounds.minX);
      const vertical = (state.panelOffset.y - bounds.minY) / Math.max(1, bounds.maxY - bounds.minY);
      const xLabel = horizontal < 0.34 ? "left" : horizontal > 0.66 ? "right" : "center";
      const yLabel = vertical < 0.34 ? "upper" : vertical > 0.66 ? "lower" : "middle";
      elements.panelAnnouncement.textContent = `Observatory controls moved to ${yLabel} ${xLabel}.`;
    }

    function finishDragging(cancelled) {
      if (!dragState) return;
      const completed = dragState;
      dragState = null;
      elements.panel.classList.remove("is-dragging");
      if (elements.panelHandle.hasPointerCapture(completed.pointerId)) {
        elements.panelHandle.releasePointerCapture(completed.pointerId);
      }
      if (cancelled) {
        applyPanelOffset(completed.startX, completed.startY);
        elements.panelAnnouncement.textContent = "Panel move cancelled.";
        return;
      }
      const current = state.panelOffset;
      const snapped = mobilePanelQuery.matches
        ? { x: 0, y: mobileSnapY(current.y, completed.bounds) }
        : snapDesktop(current, completed.bounds);
      applyPanelOffset(snapped.x, snapped.y);
      announcePanelPosition(completed.bounds);
    }

    elements.panelHandle.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0 && event.pointerType !== "touch") return;
      const bounds = measureBounds();
      dragState = {
        pointerId: event.pointerId,
        originX: event.clientX,
        originY: event.clientY,
        startX: state.panelOffset.x,
        startY: state.panelOffset.y,
        bounds,
      };
      elements.panelHandle.focus({ preventScroll: true });
      elements.panelHandle.setPointerCapture(event.pointerId);
      elements.panel.classList.add("is-dragging");
      event.preventDefault();
    });

    elements.panelHandle.addEventListener("pointermove", (event) => {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      const deltaX = mobilePanelQuery.matches ? 0 : event.clientX - dragState.originX;
      const deltaY = event.clientY - dragState.originY;
      const next = clampOffset(
        dragState.startX + deltaX,
        dragState.startY + deltaY,
        dragState.bounds,
      );
      applyPanelOffset(next.x, next.y);
    });

    elements.panelHandle.addEventListener("pointerup", (event) => {
      if (dragState && dragState.pointerId === event.pointerId) finishDragging(false);
    });
    elements.panelHandle.addEventListener("pointercancel", (event) => {
      if (dragState && dragState.pointerId === event.pointerId) finishDragging(true);
    });
    elements.panelHandle.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && dragState) {
        finishDragging(true);
        event.preventDefault();
        return;
      }

      const bounds = measureBounds();
      if (event.key === "Enter" || event.key === " ") {
        if (mobilePanelQuery.matches) {
          const expanded = math.clamp(0, bounds.minY, bounds.maxY);
          const nextY = state.panelOffset.y > expanded + 24 ? expanded : bounds.maxY;
          applyPanelOffset(0, nextY);
        } else {
          applyPanelOffset(bounds.maxX, bounds.maxY);
        }
        announcePanelPosition(bounds);
        event.preventDefault();
        return;
      }
      if (event.key === "Home") {
        applyPanelOffset(bounds.minX, bounds.minY);
        announcePanelPosition(bounds);
        event.preventDefault();
        return;
      }
      if (event.key === "End") {
        applyPanelOffset(bounds.maxX, bounds.maxY);
        announcePanelPosition(bounds);
        event.preventDefault();
        return;
      }

      const directions = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      const direction = directions[event.key];
      if (!direction) return;
      const distance = event.shiftKey ? 64 : 16;
      const next = clampOffset(
        state.panelOffset.x + direction[0] * distance,
        state.panelOffset.y + direction[1] * distance,
        bounds,
      );
      applyPanelOffset(next.x, next.y);
      announcePanelPosition(bounds);
      event.preventDefault();
    });

    function clampPanelAfterViewportChange() {
      const bounds = measureBounds();
      const next = clampOffset(state.panelOffset.x, state.panelOffset.y, bounds);
      applyPanelOffset(next.x, next.y);
    }

    window.addEventListener("resize", clampPanelAfterViewportChange);
    if (window.visualViewport) window.visualViewport.addEventListener("resize", clampPanelAfterViewportChange);
    mobilePanelQuery.addEventListener("change", () => {
      applyPanelOffset(0, 0);
      elements.panelAnnouncement.textContent = mobilePanelQuery.matches
        ? "Observatory controls changed to a bottom sheet."
        : "Observatory controls returned to the lower right.";
    });
  }

  class StaticCanvasRenderer {
    constructor(canvas, options) {
      this.canvas = canvas;
      this.options = options || {};
      this.context = canvas.getContext("2d");
      this.gl = null;
      this.width = Math.max(1, canvas.clientWidth || window.innerWidth);
      this.height = Math.max(1, canvas.clientHeight || window.innerHeight);
      this.pixelRatio = 1;
      this.sizeDirty = true;
      this.cameraMode = "overview";
      this.selectedCoordinates = null;
      this.frameState = null;
    }

    resize(width, height) {
      this.width = Math.max(1, Number(width) || 1);
      this.height = Math.max(1, Number(height) || 1);
      this.sizeDirty = true;
    }

    setSelectedFeature(feature) {
      this.selectedCoordinates = feature ? math.featureLabelPoint(feature) : null;
    }

    setReducedMotion() {}

    setCameraMode(mode) {
      if (mode !== "overview" && mode !== "earth" || mode === this.cameraMode) return;
      this.cameraMode = mode;
      if (this.options.onCameraModeChange) this.options.onCameraModeChange(mode);
      requestRender();
    }

    getCameraMode() {
      return this.cameraMode;
    }

    getCameraState() {
      return { mode: this.cameraMode, earthDistance: null, overviewZoom: null };
    }

    projectCountry() {
      return null;
    }

    render(day) {
      const context = this.context;
      if (!context) return null;
      if (this.sizeDirty) {
        this.pixelRatio = Math.min(window.devicePixelRatio || 1, 1.8);
        this.canvas.width = Math.max(1, Math.round(this.width * this.pixelRatio));
        this.canvas.height = Math.max(1, Math.round(this.height * this.pixelRatio));
        this.sizeDirty = false;
      }
      context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
      context.clearRect(0, 0, this.width, this.height);
      context.fillStyle = "#07111f";
      context.fillRect(0, 0, this.width, this.height);

      const compact = this.width < 701;
      const sunX = compact ? this.width * 0.42 : this.width * 0.48;
      const sunY = compact ? this.height * 0.34 : this.height * 0.52;
      const orbitRadiusX = Math.min(this.width * (compact ? 0.33 : 0.31), 390);
      const orbitRadiusY = Math.min(this.height * (compact ? 0.19 : 0.31), 240);
      const earthRadius = math.clamp(Math.min(this.width, this.height) * 0.065, 25, 58);
      const sunRadius = earthRadius * 1.16;
      const orbital = math.sampleState(day, 1);
      const earthX = sunX + orbital.position[0] * orbitRadiusX;
      const earthY = sunY + orbital.position[2] * orbitRadiusY;

      context.save();
      context.strokeStyle = "rgba(79, 156, 197, 0.5)";
      context.lineWidth = 1;
      context.beginPath();
      context.ellipse(sunX, sunY, orbitRadiusX, orbitRadiusY, 0, 0, math.TAU);
      context.stroke();
      for (let month = 0; month < 12; month += 1) {
        const angle = (month / 12) * math.TAU;
        const cosine = Math.cos(angle);
        const sine = Math.sin(angle);
        const length = month % 3 === 0 ? 8 : 4;
        const x = sunX - cosine * orbitRadiusX;
        const y = sunY + sine * orbitRadiusY;
        const normalX = -cosine;
        const normalY = sine;
        context.strokeStyle = month % 3 === 0 ? "rgba(234, 242, 247, 0.7)" : "rgba(234, 242, 247, 0.34)";
        context.beginPath();
        context.moveTo(x - normalX * length, y - normalY * length);
        context.lineTo(x + normalX * length, y + normalY * length);
        context.stroke();
      }
      const currentNormal = math.normalize3([orbital.position[0], 0, orbital.position[2]]);
      context.strokeStyle = "#ffd36a";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(earthX - currentNormal[0] * 8, earthY - currentNormal[2] * 8);
      context.lineTo(earthX + currentNormal[0] * 12, earthY + currentNormal[2] * 12);
      context.stroke();
      context.restore();

      context.fillStyle = "#ffd36a";
      context.beginPath();
      context.arc(sunX, sunY, sunRadius, 0, math.TAU);
      context.fill();

      context.fillStyle = "#4f9cc5";
      context.beginPath();
      context.arc(earthX, earthY, earthRadius, 0, math.TAU);
      context.fill();

      const lightAngle = Math.atan2(sunY - earthY, sunX - earthX);
      context.save();
      context.beginPath();
      context.arc(earthX, earthY, earthRadius, 0, math.TAU);
      context.clip();
      context.translate(earthX, earthY);
      context.rotate(lightAngle);
      context.fillStyle = "rgba(7, 17, 31, 0.78)";
      context.fillRect(-earthRadius, -earthRadius, earthRadius, earthRadius * 2);
      context.strokeStyle = "rgba(234, 242, 247, 0.48)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(0, -earthRadius);
      context.lineTo(0, earthRadius);
      context.stroke();
      context.restore();

      const tilt = 23.44 * math.DEG;
      const axisLength = earthRadius * 1.46;
      const axisX = Math.sin(tilt) * axisLength;
      const axisY = Math.cos(tilt) * axisLength;
      context.strokeStyle = "rgba(234, 242, 247, 0.82)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(earthX - axisX, earthY + axisY);
      context.lineTo(earthX + axisX, earthY - axisY);
      context.stroke();

      if (this.selectedCoordinates) {
        const longitude = this.selectedCoordinates.longitude * math.DEG;
        context.strokeStyle = "rgba(121, 183, 200, 0.82)";
        context.beginPath();
        context.ellipse(earthX, earthY, earthRadius * 0.34, earthRadius * 0.98, -longitude, 0, math.TAU);
        context.stroke();
        const unit = math.latLonToUnit(
          this.selectedCoordinates.latitude,
          this.selectedCoordinates.longitude,
        );
        const oriented = math.transformPoint4(math.earthOrientation4(math.earthSpinAngle(day)), [...unit, 1]);
        const pinX = earthX + oriented[0] * earthRadius * 0.84;
        const pinY = earthY - oriented[1] * earthRadius * 0.84;
        context.fillStyle = "#07111f";
        context.strokeStyle = "#d9f27c";
        context.lineWidth = 2;
        context.beginPath();
        context.arc(pinX, pinY, 4, 0, math.TAU);
        context.fill();
        context.stroke();
      }

      context.fillStyle = "rgba(234, 242, 247, 0.68)";
      context.font = "600 10px ui-monospace, SFMono-Regular, Consolas, monospace";
      context.fillText("SUN", sunX - 12, sunY + sunRadius + 18);
      context.fillText("23.44° FIXED AXIS", earthX + earthRadius + 12, earthY - earthRadius);

      this.frameState = {
        fallback: true,
        needsFrame: false,
        orbital,
        visualSpinAngle: math.earthSpinAngle(day),
      };
      return this.frameState;
    }

    destroy() {}
  }

  function requestRender() {
    if (animationFrame == null && !document.hidden) {
      animationFrame = window.requestAnimationFrame(animate);
    }
  }

  function drawFrame(timestamp, deltaSeconds) {
    const frame = renderer.render(state.day, timestamp / 1000, deltaSeconds);
    updateTimelinePosition();
    updateDateReadout(false);
    updateAnnotation(frame);
    firstFrameRendered = Boolean(frame);
    lastFrameNeedsAnother = Boolean(frame && frame.needsFrame);
    return frame;
  }

  function animate(timestamp) {
    animationFrame = null;
    const deltaSeconds = lastTimestamp == null ? 0 : Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    lastTimestamp = timestamp;
    const activePlayback = state.playing && !state.timelineScrubbing && !document.hidden;

    if (activePlayback) {
      state.day = math.wrapSimulationDay(state.day + deltaSeconds * state.speed);
    }

    drawFrame(timestamp, deltaSeconds);
    if (activePlayback || lastFrameNeedsAnother) requestRender();
    else lastTimestamp = null;
  }

  function installDebugApi() {
    const debugApi = {
      get ready() {
        return firstFrameRendered;
      },
      snapshot() {
        const date = math.datePartsForDay(state.day);
        const season = math.seasonForLatitude(state.day, state.selected.latitude);
        const panelRect = elements.panel.getBoundingClientRect();
        const frame = renderer.frameState;
        const earthScreen = frame && frame.viewProjection
          ? math.projectToScreen(frame.orbital.position, frame.viewProjection, renderer.width, renderer.height)
          : null;
        return {
          webgl: Boolean(renderer && renderer.gl),
          country: state.selected.name,
          countryCode: state.selected.code,
          countryCount: catalog.length,
          day: state.day,
          displayDay: date.dayNumber,
          date: date.iso,
          season: season.label,
          speed: state.speed,
          playing: state.playing,
          rafScheduled: animationFrame != null,
          fallback: usingFallback,
          visualSpinAngle: renderer.frameState ? renderer.frameState.visualSpinAngle : null,
          cameraMode: renderer.getCameraMode(),
          camera: renderer.getCameraState(),
          scene: frame && !frame.fallback ? {
            sun: frame.sun,
            earth: earthScreen,
          } : null,
          panel: {
            left: panelRect.left,
            top: panelRect.top,
            right: panelRect.right,
            bottom: panelRect.bottom,
          },
        };
      },
      selectCountry(nameOrCode) {
        return selectCountry(findCountry(nameOrCode), false);
      },
      setDay(day) {
        state.day = math.wrapSimulationDay(Number(day) || 0);
        lastDisplayDay = -1;
        updateDateReadout(true);
        updateTimelinePosition();
        requestRender();
        return state.day;
      },
      setSpeed,
      setPlaying,
      setCameraMode(mode) {
        renderer.setCameraMode(mode);
        return renderer.getCameraMode();
      },
      renderFrame() {
        return Boolean(drawFrame(performance.now(), 0));
      },
    };
    Object.defineProperty(root, "__SEASONS__", {
      value: Object.freeze(debugApi),
      configurable: true,
    });
  }

  function initialize() {
    function activateFallback() {
      if (usingFallback) return;
      usingFallback = true;
      elements.canvas.hidden = true;
      elements.fallback.hidden = false;
      document.body.classList.add("fallback-mode");
      renderer = new StaticCanvasRenderer(elements.fallbackCanvas, {
        onCameraModeChange: updateCameraButtons,
      });
      if (state.selected) renderer.setSelectedFeature(state.selected.feature);
      renderer.resize(elements.experience.clientWidth, elements.experience.clientHeight);
      requestRender();
    }

    const forceFallback = new URLSearchParams(window.location.search).has("fallback");
    if (!forceFallback) {
      try {
        renderer = engine.createRenderer(elements.canvas, geojson, {
          reducedMotion: reducedMotionQuery.matches,
          onCameraModeChange: updateCameraButtons,
          onInteraction: requestRender,
          onContextLost: activateFallback,
          onContextRestored: requestRender,
        });
      } catch (_error) {
        activateFallback();
      }
    } else {
      activateFallback();
    }

    const canada = findCountry("Canada") || catalog[0];
    selectCountry(canada, false);
    setSpeed(1);
    setPlaying(!reducedMotionQuery.matches);
    updateCameraButtons("overview");
    updateTimelinePosition();
    updateDateReadout(true);
    initializeCountryCombobox();
    initializeTimeline();
    initializePlayback();
    initializePanelDrag();
    installDebugApi();

    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      renderer.resize(entry.contentRect.width, entry.contentRect.height);
      annotationDirty = true;
      requestRender();
    });
    resizeObserver.observe(elements.experience);
    renderer.resize(elements.experience.clientWidth, elements.experience.clientHeight);

    reducedMotionQuery.addEventListener("change", (event) => {
      renderer.setReducedMotion(event.matches);
      if (event.matches) setPlaying(false);
      requestRender();
    });

    document.addEventListener("visibilitychange", () => {
      lastTimestamp = null;
      if (!document.hidden) requestRender();
    });

    window.addEventListener(
      "pagehide",
      () => {
        if (animationFrame != null) window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
        if (resizeObserver) resizeObserver.disconnect();
      },
      { once: true },
    );

    document.body.classList.add("is-ready");
    requestRender();
  }

  initialize();
})(typeof globalThis !== "undefined" ? globalThis : window);
