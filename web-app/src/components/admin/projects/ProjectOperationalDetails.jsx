import { useState, useEffect } from "react";
import { FiChevronDown, FiCalendar, FiMapPin, FiMap, FiAlertCircle } from "react-icons/fi";

const parseCoordinateString = (text) => {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();
  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;

  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  const latValid = !isNaN(lat) && lat >= -90 && lat <= 90;
  const lngValid = !isNaN(lng) && lng >= -180 && lng <= 180;

  return {
    isCoordinateFormat: true,
    isValid: latValid && lngValid,
    latitude: lat,
    longitude: lng,
    error: !latValid
      ? "Invalid latitude: must be between -90 and 90."
      : !lngValid
      ? "Invalid longitude: must be between -180 and 180."
      : null,
  };
};

const ProjectOperationalDetails = ({
  vendorId,
  setVendorId,
  deadline,
  setDeadline,
  location,
  setLocation,
  locationCoordinates,
  setLocationCoordinates,
  vendors = [],
}) => {
  const [debouncedLocation, setDebouncedLocation] = useState(location);

  // Debounce location text to avoid constant iframe reloads while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(location);
    }, 400);
    return () => clearTimeout(timer);
  }, [location]);

  // Synchronize coordinates state if user enters coordinate string or changes location
  useEffect(() => {
    if (!setLocationCoordinates) return;
    const coordInfo = parseCoordinateString(location);
    if (coordInfo?.isValid) {
      setLocationCoordinates({
        latitude: coordInfo.latitude,
        longitude: coordInfo.longitude,
      });
    } else if (coordInfo?.isCoordinateFormat && !coordInfo.isValid) {
      setLocationCoordinates(null);
    } else if (!coordInfo?.isCoordinateFormat) {
      // Clear coordinates when plain text is entered unless set by an explicit picker
      setLocationCoordinates(null);
    }
  }, [location, setLocationCoordinates]);

  // Resolve map query and status
  const coordInfo = parseCoordinateString(debouncedLocation);
  let mapQuery = "";
  let coordinateError = null;

  if (coordInfo?.isCoordinateFormat) {
    if (coordInfo.isValid) {
      mapQuery = `${coordInfo.latitude},${coordInfo.longitude}`;
    } else {
      coordinateError = coordInfo.error;
    }
  } else if (
    locationCoordinates &&
    typeof locationCoordinates.latitude === "number" &&
    typeof locationCoordinates.longitude === "number"
  ) {
    mapQuery = `${locationCoordinates.latitude},${locationCoordinates.longitude}`;
  } else if (debouncedLocation && debouncedLocation.trim().length >= 2) {
    mapQuery = encodeURIComponent(debouncedLocation.trim());
  }

  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
      <h2 className="text-sm font-bold text-[#3E3734]">Operational Details</h2>

      {/* Row 1: Assigned Vendor & Deadline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assigned Vendor */}
        <div>
          <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
            Assigned Vendor
          </label>
          <div className="relative">
            <select
              value={vendorId || ""}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors appearance-none cursor-pointer pr-10"
            >
              <option value="">
                Select vendor (Optional)...
              </option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.companyName} ({v.contactName || "Active"})
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
            Deadline <span className="text-[#C62828]">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors cursor-pointer"
            />
            <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
          Location <span className="text-[#C62828]">*</span>
        </label>
        <div className="relative">
          <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder=" Location (or enter coordinates)"
            className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors"
          />
        </div>

        {/* Interactive Map Preview */}
        <div className="w-full h-56 rounded-xl overflow-hidden border border-[#E8E2DE] bg-[#FAF7F5] relative mt-3 shadow-xs">
          {mapQuery ? (
            <iframe
              title="Project Location Map Preview"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            />
          ) : coordinateError ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#C62828] bg-[#FFF5F5]">
              <FiAlertCircle className="text-2xl mb-1.5 text-[#C62828]" />
              <span className="text-xs font-bold">{coordinateError}</span>
              <span className="text-[11px] text-[#817B77] mt-0.5">
                Coordinates must be within -90 to 90 latitude and -180 to 180 longitude.
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#A39A94]">
              <FiMap className="text-2xl mb-2 text-[#C8B5AC]" />
              <span className="text-xs font-semibold text-[#817B77]">
                Interactive Map Preview
              </span>
              <span className="text-[10px] text-[#A39A94] mt-1">
                Enter an address or coordinates above to view interactive map preview
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectOperationalDetails;
