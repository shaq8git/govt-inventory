export function getPerms(menuCode) {
  try {
    const user = JSON.parse(sessionStorage.getItem("storeAuthUser") || "null");
    const roleName = user?.userrole?.rolename;
    if (!roleName) return { c: true, r: true, u: true, d: true };
    const all = JSON.parse(localStorage.getItem("userPermissions_v1") || "{}");
    const p = all[roleName]?.[menuCode];
    if (!p) return { c: true, r: true, u: true, d: true };
    return p;
  } catch {
    return { c: true, r: true, u: true, d: true };
  }
}
