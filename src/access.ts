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
    routeFilter: (route: any) => {
      if (!route.name) return true;
      return hasPermission(`menu:${route.name}`) || hasRole('admin');
    },
  };
}
