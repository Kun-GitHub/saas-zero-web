export default function access(
  initialState: { currentUser?: SaaS.CurrentUser } | undefined,
) {
  const { currentUser } = initialState ?? {};
  const roleCodes = currentUser?.roleCodes || [];
  const permissions = currentUser?.permissions || [];
  const hasPermission = (code: string) => permissions.includes(code);
  const hasRole = (code: string) => roleCodes.includes(code);

  return {
    isAdmin: hasRole('admin'),
    canAdmin: hasRole('admin') || hasRole('manager'),
    // Route-level access: admin can see everything, others check menu permissions
    routeFilter: (route: any) => {
      if (!route.name) return true;
      if (hasRole('admin')) return true;
      return hasPermission(`menu:${route.name}`);
    },
    // Page-level access control helpers
    canManageUsers: hasRole('admin') || hasPermission('system:user:manage'),
    canManageRoles: hasRole('admin') || hasPermission('system:role:manage'),
    canManageMenus: hasRole('admin') || hasPermission('system:menu:manage'),
    canManageDepts: hasRole('admin') || hasPermission('system:dept:manage'),
    canManageTenants: hasRole('admin') || hasPermission('system:tenant:manage'),
    canManagePackages:
      hasRole('admin') || hasPermission('system:package:manage'),
    canManageApis: hasRole('admin') || hasPermission('system:api:manage'),
    canManageDicts: hasRole('admin') || hasPermission('system:dict:manage'),
    canViewLogs: hasRole('admin') || hasPermission('system:log:view'),
  };
}
