import { isSuperAdmin } from '@/utils/permission';

export default function access(
  initialState:
    | {
        currentUser?: SaaS.CurrentUser;
        menuData?: any[];
      }
    | undefined,
) {
  // While initialState is still loading, allow all routes to prevent flash of 404.
  // The layout's onPageChange handler will redirect to /user/login if the user
  // turns out to be unauthenticated once the state resolves.
  if (!initialState) {
    return {
      isAdmin: true,
      canAdmin: true,
      routeFilter: () => true,
      canManageUsers: true,
      canManageRoles: true,
      canManageMenus: true,
      canManageDepts: true,
      canManageTenants: true,
      canManagePackages: true,
      canManageApis: true,
      canManageDicts: true,
      canViewLogs: true,
    };
  }

  const { currentUser } = initialState;
  const roleCodes = currentUser?.roleCodes || [];
  const permissions = currentUser?.permissions || [];
  const admin = isSuperAdmin(currentUser);
  const hasPermission = (code: string) => permissions.includes(code);

  // 菜单可见性由后端 /oauth/menus 驱动（角色并集 + 父链），页面路由跟随菜单：
  // 只要后端下发了该菜单，页面即可进入（按钮码仅用于页面内按钮显隐）。
  const menuPaths = new Set<string>();
  const collectPaths = (nodes: any[]) => {
    (nodes || []).forEach((n: any) => {
      if (n?.path) menuPaths.add(n.path);
      if (n?.children?.length) collectPaths(n.children);
    });
  };
  collectPaths(initialState?.menuData ?? []);
  const hasMenu = (path: string) =>
    admin || menuPaths.has(path) || hasPermission(`menu:${path}`);

  return {
    isAdmin: admin,
    canAdmin: admin || roleCodes.includes('manager') || hasMenu('/system'),
    // Route-level access: default 租户管理员可见全部，其余按菜单权�?角色可见�?
    routeFilter: (route: any) => {
      if (!route.name) return true;
      if (admin) return true;
      // 路由可见性优先由后端 /oauth/menus 驱动；此处仅兜底拦截
      return hasPermission(`menu:${route.name}`);
    },
    // Page-level access control helpers（default 租户管理员全放行，其余跟随后端菜单 / 权限码）
    canManageUsers: hasMenu('/system/user'),
    canManageRoles: hasMenu('/system/role'),
    canManageMenus: hasMenu('/system/menu'),
    canManageDepts: hasMenu('/system/dept'),
    canManageTenants: hasMenu('/tenant/list'),
    canManagePackages: hasMenu('/tenant/package'),
    canManageApis: hasMenu('/api'),
    canManageDicts: hasMenu('/dict'),
    canViewLogs: hasMenu('/log'),
  };
}
