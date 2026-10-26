/**
 * Canonical FieldCam RBAC Permission Modules and Actions Registry.
 * Mirrors the authoritative backend registry in platform-service and auth-service.
 */

export const PERMISSION_MODULES = Object.freeze({
  DASHBOARD: "DASHBOARD",
  PROJECTS: "PROJECTS",
  VENDORS: "VENDORS",
  INVOICES: "INVOICES",
  ANALYTICS: "ANALYTICS",
  SERVICES: "SERVICES",
  SUPPORT: "SUPPORT",
});

export const MODULE_ACTIONS = Object.freeze({
  DASHBOARD: Object.freeze(["VIEW"]),
  PROJECTS: Object.freeze(["VIEW", "CREATE", "EDIT", "ASSIGN", "REVIEW", "EXPORT"]),
  VENDORS: Object.freeze(["VIEW", "CREATE", "EDIT", "STATUS", "REGISTRATIONS_REVIEW"]),
  INVOICES: Object.freeze(["VIEW", "CREATE", "EDIT", "REVIEW", "SEND", "RECORD_PAYMENT"]),
  ANALYTICS: Object.freeze(["VIEW"]),
  SERVICES: Object.freeze(["VIEW", "CREATE", "EDIT", "STATUS"]),
  SUPPORT: Object.freeze(["VIEW", "CREATE", "EDIT", "STATUS", "CHAT"]),
});

/**
 * Authoritative regular Admin business-module navigation items and their
 * canonical module mapping (VIEW permission required for display).
 */
export const ADMIN_NAV_MODULE_MAPPING = Object.freeze([
  Object.freeze({ id: "dashboard", module: PERMISSION_MODULES.DASHBOARD, label: "Dashboard", path: "/admin/dashboard" }),
  Object.freeze({ id: "projects", module: PERMISSION_MODULES.PROJECTS, label: "Projects", path: "/admin/projects" }),
  Object.freeze({ id: "vendors", module: PERMISSION_MODULES.VENDORS, label: "Vendors", path: "/admin/vendors" }),
  Object.freeze({ id: "invoices", module: PERMISSION_MODULES.INVOICES, label: "Invoices", path: "/admin/invoices" }),
  Object.freeze({ id: "analytics", module: PERMISSION_MODULES.ANALYTICS, label: "Analytics", path: "/admin/analytics" }),
  Object.freeze({ id: "services", module: PERMISSION_MODULES.SERVICES, label: "Services", path: "/admin/services" }),
  Object.freeze({ id: "support", module: PERMISSION_MODULES.SUPPORT, label: "Support", path: "/admin/support" }),
]);

/**
 * Checks if a given module identifier is valid and supported.
 * Case-insensitive.
 *
 * @param {string} moduleName
 * @returns {boolean}
 */
export const isValidModule = (moduleName) => {
  if (!moduleName || typeof moduleName !== "string") return false;
  const modUpper = moduleName.trim().toUpperCase();
  return Boolean(PERMISSION_MODULES[modUpper]);
};

/**
 * Checks if a given action is valid for the specified module.
 * Case-insensitive.
 *
 * @param {string} moduleName
 * @param {string} actionName
 * @returns {boolean}
 */
export const isValidAction = (moduleName, actionName) => {
  if (!isValidModule(moduleName) || !actionName || typeof actionName !== "string") {
    return false;
  }
  const modUpper = moduleName.trim().toUpperCase();
  const actUpper = actionName.trim().toUpperCase();
  const validActions = MODULE_ACTIONS[modUpper] || [];
  return validActions.includes(actUpper);
};

/**
 * Normalizes backend permission entries into a Map of Module -> Set<Action>.
 * Validates module and action against the canonical registry.
 * Safely handles duplicates, unexpected types, and case variations.
 *
 * @param {Array} rawPermissions - Raw permissions array from user object
 * @returns {Map<string, Set<string>>} Map of module string to Set of action strings
 */
export const normalizePermissions = (rawPermissions) => {
  const permissionMap = new Map();
  if (!Array.isArray(rawPermissions)) {
    return permissionMap;
  }

  for (const entry of rawPermissions) {
    if (!entry || typeof entry !== "object") continue;
    const modStr = (entry.module || "").toString().trim().toUpperCase();
    if (!PERMISSION_MODULES[modStr]) continue;

    const actionsArr = Array.isArray(entry.actions) ? entry.actions : [];
    const allowedActions = MODULE_ACTIONS[modStr] || [];

    if (!permissionMap.has(modStr)) {
      permissionMap.set(modStr, new Set());
    }
    const actionSet = permissionMap.get(modStr);

    for (const act of actionsArr) {
      if (!act || typeof act !== "string") continue;
      const actStr = act.trim().toUpperCase();
      if (allowedActions.includes(actStr)) {
        actionSet.add(actStr);
      }
    }
  }

  return permissionMap;
};

/**
 * Verifies if the authenticated user is an authoritative SUPER_ADMIN.
 * Requires BOTH user.role === "SUPER_ADMIN" AND server-attested user.isSuperAdmin === true.
 * Does not trust client-only or unverified role indicators alone.
 *
 * @param {Object} user - Authenticated user object
 * @returns {boolean}
 */
export const checkIsSuperAdmin = (user) => {
  return Boolean(
    user &&
    typeof user === "object" &&
    user.role === "SUPER_ADMIN" &&
    user.isSuperAdmin === true
  );
};

/**
 * Evaluates whether a user has a specific module and action permission.
 *
 * Semantic Rules:
 * 1. Unauthenticated or missing user -> false
 * 2. Unknown module or action -> false
 * 3. Authoritative SUPER_ADMIN -> true for any valid canonical module and action
 * 4. Non-ADMIN roles (VENDOR, STAFF) -> false (preserves tenant isolation)
 * 5. ADMIN -> evaluates normalized permissions map
 *
 * @param {Object} user - Authenticated user object
 * @param {Map<string, Set<string>>} permissionMap - Normalized permissions map
 * @param {string} module - Target business module (case-insensitive)
 * @param {string} action - Target business action (case-insensitive)
 * @returns {boolean}
 */
export const checkPermission = (user, permissionMap, module, action) => {
  if (!user || !module || !action) return false;
  if (!isValidModule(module) || !isValidAction(module, action)) return false;

  // 1. Authoritative Super Admin bypass
  if (checkIsSuperAdmin(user)) {
    return true;
  }

  // 2. Non-ADMIN users (VENDOR, STAFF) do not receive admin module permissions
  if (user.role !== "ADMIN") {
    return false;
  }

  // 3. ADMIN evaluation against server-provided permissions
  const modUpper = module.trim().toUpperCase();
  const actUpper = action.trim().toUpperCase();

  const actionSet = permissionMap?.get?.(modUpper);
  if (!actionSet) return false;

  return actionSet.has(actUpper);
};

/**
 * Evaluates whether a user can access a module.
 *
 * Semantic Rules:
 * 1. Unauthenticated or missing user -> false
 * 2. Unknown module -> false
 * 3. Authoritative SUPER_ADMIN -> true for any valid canonical module
 * 4. Non-ADMIN roles (VENDOR, STAFF) -> false
 * 5. ADMIN -> returns true if the canonical "VIEW" action is granted on the module.
 *    If "VIEW" is absent, module access is denied.
 *
 * @param {Object} user - Authenticated user object
 * @param {Map<string, Set<string>>} permissionMap - Normalized permissions map
 * @param {string} module - Target business module (case-insensitive)
 * @returns {boolean}
 */
export const checkModuleAccess = (user, permissionMap, module) => {
  if (!user || !module) return false;
  if (!isValidModule(module)) return false;

  if (checkIsSuperAdmin(user)) {
    return true;
  }

  if (user.role !== "ADMIN") {
    return false;
  }

  const modUpper = module.trim().toUpperCase();
  const actionSet = permissionMap?.get?.(modUpper);
  if (!actionSet) return false;

  return actionSet.has("VIEW");
};
