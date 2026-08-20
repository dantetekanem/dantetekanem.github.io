(function attachSeasonsMath(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) module.exports = api;
  root.SeasonsMath = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createSeasonsMath() {
  "use strict";

  const TAU = Math.PI * 2;
  const DEG = Math.PI / 180;
  const RAD = 180 / Math.PI;
  const YEAR_DAYS = 365.2422;
  const DISPLAY_DAYS = 365;
  const DISPLAY_YEAR = 2025;
  const OBLIQUITY_DEGREES = 23.44;
  const OBLIQUITY = OBLIQUITY_DEGREES * DEG;
  const SIDEREAL_DAY = 0.9972696;
  const SUN_ROTATION_DAYS = 25.38;
  const MARCH_EQUINOX_DAY = 79;
  const QUARTER_YEAR = YEAR_DAYS / 4;
  const JUNE_SOLSTICE_DAY = MARCH_EQUINOX_DAY + QUARTER_YEAR;
  const SEPTEMBER_EQUINOX_DAY = MARCH_EQUINOX_DAY + QUARTER_YEAR * 2;
  const DECEMBER_SOLSTICE_DAY = MARCH_EQUINOX_DAY + QUARTER_YEAR * 3;
  const MAX_VISUAL_ROTATION_HOURS_PER_SECOND = 12;
  const MAX_VISUAL_SPIN_RADIANS_PER_SECOND =
    TAU * (MAX_VISUAL_ROTATION_HOURS_PER_SECOND / 24);

  const AXIS = Object.freeze([Math.sin(OBLIQUITY), Math.cos(OBLIQUITY), 0]);
  const EQUATOR_REFERENCE = Object.freeze([0, 0, -1]);
  const EAST_REFERENCE = Object.freeze([-Math.cos(OBLIQUITY), Math.sin(OBLIQUITY), 0]);
  const SEASON_EVENTS = Object.freeze({
    marchEquinox: MARCH_EQUINOX_DAY,
    juneSolstice: JUNE_SOLSTICE_DAY,
    septemberEquinox: SEPTEMBER_EQUINOX_DAY,
    decemberSolstice: DECEMBER_SOLSTICE_DAY,
  });

  const MONTHS_SHORT = Object.freeze([
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ]);
  const MONTHS_LONG = Object.freeze([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]);

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function lerp(from, to, amount) {
    return from + (to - from) * amount;
  }

  function damp(from, to, lambda, deltaSeconds) {
    return lerp(from, to, 1 - Math.exp(-lambda * deltaSeconds));
  }

  function mod(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  }

  function wrapRadians(angle) {
    return mod(angle, TAU);
  }

  function wrapPi(angle) {
    return wrapRadians(angle + Math.PI) - Math.PI;
  }

  function wrapSimulationDay(day) {
    return mod(day, YEAR_DAYS);
  }

  function simulationDayDelta(previousDay, currentDay) {
    let delta = currentDay - previousDay;
    if (delta > YEAR_DAYS / 2) delta -= YEAR_DAYS;
    else if (delta < -YEAR_DAYS / 2) delta += YEAR_DAYS;
    return delta;
  }

  function cappedVisualSpinDelta(previousDay, currentDay, deltaSeconds) {
    if (!Number.isFinite(previousDay) || !Number.isFinite(currentDay) || deltaSeconds <= 0) {
      return 0;
    }
    const physicalSpin =
      (TAU * simulationDayDelta(previousDay, currentDay)) / SIDEREAL_DAY;
    const maximumSpin = MAX_VISUAL_SPIN_RADIANS_PER_SECOND * deltaSeconds;
    return clamp(physicalSpin, -maximumSpin, maximumSpin);
  }

  function add3(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  }

  function subtract3(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }

  function scale3(vector, scalar) {
    return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
  }

  function dot3(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  function cross3(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  }

  function length3(vector) {
    return Math.hypot(vector[0], vector[1], vector[2]);
  }

  function normalize3(vector) {
    const length = length3(vector);
    return length < 1e-12 ? [0, 0, 0] : scale3(vector, 1 / length);
  }

  function lerp3(a, b, amount) {
    return [
      lerp(a[0], b[0], amount),
      lerp(a[1], b[1], amount),
      lerp(a[2], b[2], amount),
    ];
  }

  function rotateAroundAxis(vector, axis, angle) {
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const oneMinusCosine = 1 - cosine;
    const axisCrossVector = cross3(axis, vector);
    const axisProjection = dot3(axis, vector) * oneMinusCosine;
    return [
      vector[0] * cosine + axisCrossVector[0] * sine + axis[0] * axisProjection,
      vector[1] * cosine + axisCrossVector[1] * sine + axis[1] * axisProjection,
      vector[2] * cosine + axisCrossVector[2] * sine + axis[2] * axisProjection,
    ];
  }

  function identity4(out) {
    const target = out || new Float32Array(16);
    target.fill(0);
    target[0] = 1;
    target[5] = 1;
    target[10] = 1;
    target[15] = 1;
    return target;
  }

  function multiply4(a, b, out) {
    const target = out || new Float32Array(16);
    for (let column = 0; column < 4; column += 1) {
      const columnOffset = column * 4;
      for (let row = 0; row < 4; row += 1) {
        target[columnOffset + row] =
          a[row] * b[columnOffset] +
          a[4 + row] * b[columnOffset + 1] +
          a[8 + row] * b[columnOffset + 2] +
          a[12 + row] * b[columnOffset + 3];
      }
    }
    return target;
  }

  function translation4(x, y, z, out) {
    const target = identity4(out);
    target[12] = x;
    target[13] = y;
    target[14] = z;
    return target;
  }

  function scale4(x, y, z, out) {
    const target = identity4(out);
    target[0] = x;
    target[5] = y;
    target[10] = z;
    return target;
  }

  function rotationY4(angle, out) {
    const target = identity4(out);
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    target[0] = cosine;
    target[2] = -sine;
    target[8] = sine;
    target[10] = cosine;
    return target;
  }

  function rotationZ4(angle, out) {
    const target = identity4(out);
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    target[0] = cosine;
    target[1] = sine;
    target[4] = -sine;
    target[5] = cosine;
    return target;
  }

  function earthOrientation4(spinAngle, out) {
    const target = identity4(out);
    const primeMeridian = rotateAroundAxis(EQUATOR_REFERENCE, AXIS, spinAngle);
    const east = rotateAroundAxis(EAST_REFERENCE, AXIS, spinAngle);
    const localZ = scale3(east, -1);

    target[0] = primeMeridian[0];
    target[1] = primeMeridian[1];
    target[2] = primeMeridian[2];
    target[4] = AXIS[0];
    target[5] = AXIS[1];
    target[6] = AXIS[2];
    target[8] = localZ[0];
    target[9] = localZ[1];
    target[10] = localZ[2];
    return target;
  }

  function perspective4(fieldOfViewRadians, aspect, near, far, out) {
    const target = out || new Float32Array(16);
    const focalLength = 1 / Math.tan(fieldOfViewRadians / 2);
    const inverseRange = 1 / (near - far);
    target.fill(0);
    target[0] = focalLength / aspect;
    target[5] = focalLength;
    target[10] = (far + near) * inverseRange;
    target[11] = -1;
    target[14] = 2 * far * near * inverseRange;
    return target;
  }

  function lookAt4(eye, targetPoint, up, out) {
    const target = out || new Float32Array(16);
    const zAxis = normalize3(subtract3(eye, targetPoint));
    let xAxis = normalize3(cross3(up, zAxis));
    if (length3(xAxis) < 1e-8) xAxis = normalize3(cross3([0, 0, 1], zAxis));
    const yAxis = cross3(zAxis, xAxis);

    target[0] = xAxis[0]; target[1] = yAxis[0]; target[2] = zAxis[0]; target[3] = 0;
    target[4] = xAxis[1]; target[5] = yAxis[1]; target[6] = zAxis[1]; target[7] = 0;
    target[8] = xAxis[2]; target[9] = yAxis[2]; target[10] = zAxis[2]; target[11] = 0;
    target[12] = -dot3(xAxis, eye);
    target[13] = -dot3(yAxis, eye);
    target[14] = -dot3(zAxis, eye);
    target[15] = 1;
    return target;
  }

  function transformPoint4(matrix, point, out) {
    const x = point[0];
    const y = point[1];
    const z = point[2];
    const w = point.length > 3 ? point[3] : 1;
    const target = out || [0, 0, 0, 0];
    target[0] = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12] * w;
    target[1] = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13] * w;
    target[2] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14] * w;
    target[3] = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15] * w;
    return target;
  }

  function projectToScreen(worldPoint, viewProjection, width, height) {
    const clip = transformPoint4(viewProjection, [worldPoint[0], worldPoint[1], worldPoint[2], 1]);
    if (Math.abs(clip[3]) < 1e-8) return { x: 0, y: 0, depth: 1, inFront: false };
    const inverseW = 1 / clip[3];
    const ndcX = clip[0] * inverseW;
    const ndcY = clip[1] * inverseW;
    const ndcZ = clip[2] * inverseW;
    return {
      x: (ndcX + 1) * width * 0.5,
      y: (1 - ndcY) * height * 0.5,
      depth: ndcZ,
      inFront: clip[3] > 0 && ndcZ >= -1 && ndcZ <= 1,
    };
  }

  function seasonalLongitude(day) {
    return (TAU * (day - JUNE_SOLSTICE_DAY)) / YEAR_DAYS;
  }

  function sunDirectionForDay(day) {
    const longitude = seasonalLongitude(day);
    return [Math.cos(longitude), 0, -Math.sin(longitude)];
  }

  function sunRightAscensionFromDirection(lightDirection) {
    return Math.atan2(
      dot3(lightDirection, EAST_REFERENCE),
      dot3(lightDirection, EQUATOR_REFERENCE),
    );
  }

  const SPIN0 = wrapRadians(sunRightAscensionFromDirection(sunDirectionForDay(0)));

  function sampleState(day, visualOrbitRadius) {
    const radius = visualOrbitRadius == null ? 5.2 : visualOrbitRadius;
    const wrappedDay = wrapSimulationDay(day);
    const longitude = seasonalLongitude(day);
    const cosine = Math.cos(longitude);
    const sine = Math.sin(longitude);
    const position = [-radius * cosine, 0, radius * sine];
    const lightDirection = [cosine, 0, -sine];
    const declination = Math.asin(clamp(dot3(AXIS, lightDirection), -1, 1));
    return {
      day: wrappedDay,
      lambda: longitude,
      seasonPhase: wrapRadians(longitude),
      angle: longitude,
      distance: radius,
      normalizedDistance: 1,
      position,
      lightDirection,
      declination,
      declinationDegrees: declination * RAD,
      sunRightAscension: sunRightAscensionFromDirection(lightDirection),
    };
  }

  function earthSpinAngle(day) {
    return wrapRadians(SPIN0 + (TAU * day) / SIDEREAL_DAY);
  }

  function sunSpinAngle(day) {
    return wrapRadians((TAU * day) / SUN_ROTATION_DAYS);
  }

  function seasonNameForLambda(longitude) {
    const phase = wrapRadians(longitude + 1e-12);
    if (phase < Math.PI / 2) return "Summer";
    if (phase < Math.PI) return "Autumn";
    if (phase < (3 * Math.PI) / 2) return "Winter";
    return "Spring";
  }

  function northernSeason(day) {
    return seasonNameForLambda(seasonalLongitude(day));
  }

  function seasonForLatitude(day, latitudeDegrees) {
    const latitude = Number(latitudeDegrees) || 0;
    if (Math.abs(latitude) < 0.5) {
      return { name: "Equatorial", hemisphere: "Equatorial", label: "Equatorial", equatorial: true };
    }
    const localLongitude = latitude < 0
      ? seasonalLongitude(day) + Math.PI
      : seasonalLongitude(day);
    const name = seasonNameForLambda(localLongitude);
    const hemisphere = latitude < 0 ? "Southern" : "Northern";
    return { name, hemisphere, label: `${hemisphere} ${name.toLowerCase()}`, equatorial: false };
  }

  function daylightHours(latitudeDegrees, declinationRadians) {
    const latitude = clamp(latitudeDegrees, -89.9999, 89.9999) * DEG;
    const cosineHourAngle = -Math.tan(latitude) * Math.tan(declinationRadians);
    if (cosineHourAngle >= 1) return 0;
    if (cosineHourAngle <= -1) return 24;
    return (24 * Math.acos(cosineHourAngle)) / Math.PI;
  }

  function solarNoonAltitude(latitudeDegrees, declinationRadians) {
    return clamp(90 - Math.abs(latitudeDegrees - declinationRadians * RAD), -90, 90);
  }

  function displayDayIndex(day) {
    return Math.min(DISPLAY_DAYS - 1, Math.floor(wrapSimulationDay(day)));
  }

  function datePartsForDay(day) {
    const dayIndex = displayDayIndex(day);
    const date = new Date(Date.UTC(DISPLAY_YEAR, 0, 1 + dayIndex));
    const month = date.getUTCMonth();
    const dateOfMonth = date.getUTCDate();
    return {
      date,
      iso: `${DISPLAY_YEAR}-${String(month + 1).padStart(2, "0")}-${String(dateOfMonth).padStart(2, "0")}`,
      month,
      monthShort: MONTHS_SHORT[month],
      monthLong: MONTHS_LONG[month],
      dateOfMonth,
      dayIndex,
      dayNumber: dayIndex + 1,
    };
  }

  function latLonToUnit(latitudeDegrees, longitudeDegrees) {
    const latitude = clamp(latitudeDegrees, -90, 90) * DEG;
    const longitude = normalizeLongitude(longitudeDegrees) * DEG;
    const cosineLatitude = Math.cos(latitude);
    return [
      cosineLatitude * Math.cos(longitude),
      Math.sin(latitude),
      -cosineLatitude * Math.sin(longitude),
    ];
  }

  function normalizeLongitude(longitude) {
    return mod(longitude + 180, 360) - 180;
  }

  function unwrapRing(ring) {
    if (!ring || ring.length === 0) return [];
    const unwrapped = [[ring[0][0], ring[0][1]]];
    let previous = ring[0][0];
    let offset = 0;
    for (let index = 1; index < ring.length; index += 1) {
      const rawLongitude = ring[index][0];
      let longitude = rawLongitude + offset;
      const delta = longitude - previous;
      if (delta > 180) { offset -= 360; longitude -= 360; }
      else if (delta < -180) { offset += 360; longitude += 360; }
      unwrapped.push([longitude, ring[index][1]]);
      previous = longitude;
    }
    return unwrapped;
  }

  function ringAreaAndCentroid(ring) {
    const points = unwrapRing(ring);
    if (points.length < 3) return { area: 0, longitude: 0, latitude: 0 };
    let doubleArea = 0;
    let longitudeMoment = 0;
    let latitudeMoment = 0;
    for (let index = 0; index < points.length - 1; index += 1) {
      const current = points[index];
      const next = points[index + 1];
      const cross = current[0] * next[1] - next[0] * current[1];
      doubleArea += cross;
      longitudeMoment += (current[0] + next[0]) * cross;
      latitudeMoment += (current[1] + next[1]) * cross;
    }
    if (Math.abs(doubleArea) < 1e-10) {
      return { area: 0, longitude: normalizeLongitude(points[0][0]), latitude: points[0][1] };
    }
    return {
      area: doubleArea / 2,
      longitude: normalizeLongitude(longitudeMoment / (3 * doubleArea)),
      latitude: latitudeMoment / (3 * doubleArea),
    };
  }

  function featureLabelPoint(feature) {
    const properties = (feature && feature.properties) || {};
    const labelLongitude = Number(properties.LABEL_X);
    const labelLatitude = Number(properties.LABEL_Y);
    if (Number.isFinite(labelLongitude) && Number.isFinite(labelLatitude)) {
      return { longitude: labelLongitude, latitude: labelLatitude, source: "label" };
    }
    const geometry = feature && feature.geometry;
    if (!geometry || !geometry.coordinates) return { longitude: 0, latitude: 0, source: "fallback" };
    const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
    let largest = null;
    for (const polygon of polygons) {
      const outerRing = polygon && polygon[0];
      if (!outerRing) continue;
      const candidate = ringAreaAndCentroid(outerRing);
      if (!largest || Math.abs(candidate.area) > Math.abs(largest.area)) largest = candidate;
    }
    if (!largest) return { longitude: 0, latitude: 0, source: "fallback" };
    return {
      longitude: largest.longitude,
      latitude: clamp(largest.latitude, -90, 90),
      source: "centroid",
    };
  }

  function formatCoordinate(value, positiveSuffix, negativeSuffix, digits) {
    const precision = digits == null ? 1 : digits;
    const suffix = value >= 0 ? positiveSuffix : negativeSuffix;
    return `${Math.abs(value).toFixed(precision)}°${suffix}`;
  }

  function formatDaylight(hours) {
    if (hours <= 0.01) return "Polar night";
    if (hours >= 23.99) return "Midnight sun";
    const totalMinutes = Math.round(hours * 60);
    return `${Math.floor(totalMinutes / 60)}h ${String(totalMinutes % 60).padStart(2, "0")}m`;
  }

  return Object.freeze({
    TAU, DEG, RAD,
    YEAR_DAYS, DISPLAY_DAYS, DISPLAY_YEAR,
    OBLIQUITY, OBLIQUITY_DEGREES,
    SIDEREAL_DAY, SUN_ROTATION_DAYS,
    MARCH_EQUINOX_DAY, JUNE_SOLSTICE_DAY,
    SEPTEMBER_EQUINOX_DAY, DECEMBER_SOLSTICE_DAY,
    QUARTER_YEAR, SEASON_EVENTS,
    MAX_VISUAL_ROTATION_HOURS_PER_SECOND,
    MAX_VISUAL_SPIN_RADIANS_PER_SECOND,
    AXIS, EQUATOR_REFERENCE, EAST_REFERENCE, SPIN0,
    MONTHS_SHORT, MONTHS_LONG,
    clamp, lerp, damp, mod, wrapRadians, wrapPi, wrapSimulationDay,
    simulationDayDelta, cappedVisualSpinDelta,
    add3, subtract3, scale3, dot3, cross3, length3, normalize3, lerp3,
    rotateAroundAxis,
    identity4, multiply4, translation4, scale4, rotationY4, rotationZ4,
    earthOrientation4, perspective4, lookAt4, transformPoint4, projectToScreen,
    seasonalLongitude, sunDirectionForDay, sunRightAscensionFromDirection,
    sampleState, earthSpinAngle, sunSpinAngle,
    seasonNameForLambda, northernSeason, seasonForLatitude,
    daylightHours, solarNoonAltitude,
    displayDayIndex, datePartsForDay,
    latLonToUnit, normalizeLongitude, unwrapRing, ringAreaAndCentroid,
    featureLabelPoint, formatCoordinate, formatDaylight,
  });
});
