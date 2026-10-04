/**
 * Calculates distance in meters between two geographical points using the Haversine formula.
 * @param {Object} pointA - { latitude, longitude }
 * @param {Object} pointB - { latitude, longitude }
 * @returns {number} Distance in meters
 */
export const distanceBetweenCoordinates = (pointA, pointB) => {
  if (!pointA || !pointB) {
    throw new Error("Both coordinate points (pointA, pointB) are required");
  }

  const lat1 = Number(pointA.latitude);
  const lon1 = Number(pointA.longitude);
  const lat2 = Number(pointB.latitude);
  const lon2 = Number(pointB.longitude);

  if (isNaN(lat1) || lat1 < -90 || lat1 > 90) {
    throw new Error("Invalid latitude for pointA");
  }
  if (isNaN(lon1) || lon1 < -180 || lon1 > 180) {
    throw new Error("Invalid longitude for pointA");
  }
  if (isNaN(lat2) || lat2 < -90 || lat2 > 90) {
    throw new Error("Invalid latitude for pointB");
  }
  if (isNaN(lon2) || lon2 < -180 || lon2 > 180) {
    throw new Error("Invalid longitude for pointB");
  }

  const R = 6371000; // Earth's mean radius in meters
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Deterministically validates photo location against project coordinates.
 * @param {Object} params - { photoLocation, projectLocationCoordinates, maxDistanceMeters }
 * @returns {Object} { valid: boolean, distanceMeters: number|null, reason: string|null }
 */
export const validatePhotoLocation = ({
  photoLocation,
  projectLocationCoordinates,
  maxDistanceMeters = 500,
}) => {
  if (
    !projectLocationCoordinates ||
    projectLocationCoordinates.latitude === undefined ||
    projectLocationCoordinates.longitude === undefined ||
    projectLocationCoordinates.latitude === null ||
    projectLocationCoordinates.longitude === null
  ) {
    return {
      valid: true,
      distanceMeters: null,
      reason: "Project location coordinates unavailable",
    };
  }

  if (
    !photoLocation ||
    photoLocation.latitude === undefined ||
    photoLocation.longitude === undefined ||
    photoLocation.latitude === null ||
    photoLocation.longitude === null
  ) {
    return {
      valid: false,
      distanceMeters: null,
      reason: "Photo coordinates missing or incomplete",
    };
  }

  try {
    const distanceMeters = distanceBetweenCoordinates(
      photoLocation,
      projectLocationCoordinates
    );
    const valid = distanceMeters <= maxDistanceMeters;
    return {
      valid,
      distanceMeters,
      reason: valid
        ? null
        : `Photo location (${distanceMeters.toFixed(
            1
          )}m) exceeds maximum allowed geofence distance (${maxDistanceMeters}m)`,
    };
  } catch (err) {
    return {
      valid: false,
      distanceMeters: null,
      reason: `Invalid coordinates: ${err.message}`,
    };
  }
};

/**
 * Deterministically validates photo capture timestamp.
 * Note: capturedAt is supplied by client request body in current phase and is not tamper-proof.
 * EXIF extraction will be implemented in a future phase.
 * @param {Object} params - { capturedAt, uploadedAt, maxAgeMinutes }
 * @returns {Object} { valid: boolean, ageMinutes: number|null, reason: string|null }
 */
export const validateCaptureTimestamp = ({
  capturedAt,
  uploadedAt = new Date(),
  maxAgeMinutes = 1440, // Default 24 hours
}) => {
  if (!capturedAt) {
    return {
      valid: false,
      ageMinutes: null,
      reason: "Capture timestamp (capturedAt) is missing",
    };
  }

  const captureDate = new Date(capturedAt);
  const uploadDate = new Date(uploadedAt);

  if (isNaN(captureDate.getTime())) {
    return {
      valid: false,
      ageMinutes: null,
      reason: "Invalid capturedAt date format",
    };
  }

  if (isNaN(uploadDate.getTime())) {
    return {
      valid: false,
      ageMinutes: null,
      reason: "Invalid uploadedAt date format",
    };
  }

  const ageMs = uploadDate.getTime() - captureDate.getTime();
  const ageMinutes = ageMs / (1000 * 60);

  if (ageMs < -60000) {
    // Allow up to 1 minute clock skew
    return {
      valid: false,
      ageMinutes,
      reason: "Capture timestamp cannot be in the future",
    };
  }

  if (maxAgeMinutes && ageMinutes > maxAgeMinutes) {
    return {
      valid: false,
      ageMinutes,
      reason: `Photo capture age (${Math.round(
        ageMinutes
      )} mins) exceeds maximum allowed age (${maxAgeMinutes} mins)`,
    };
  }

  return {
    valid: true,
    ageMinutes: Math.max(0, ageMinutes),
    reason: null,
  };
};
