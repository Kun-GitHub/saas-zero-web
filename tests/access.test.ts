import access from '@/access';

const defaultUser = (
  extra: Partial<SaaS.CurrentUser> = {},
): SaaS.CurrentUser => ({
  userId: '1',
  tenantId: '1',
  tenantCode: 'default',
  userName: 'admin',
  nickname: '管理员',
  roleCodes: ['admin'],
  permissions: [],
  ...extra,
});

describe('access (页面路由跟随菜单)', () => {
  it('returns all-true while initialState is loading (prevent 404 flash)', () => {
    const a = access(undefined);
    expect(a.isAdmin).toBe(true);
    expect(a.canManageUsers).toBe(true);
    expect(a.routeFilter({ name: 'any' })).toBe(true);
  });

  it('default tenant admin sees every page regardless of menus', () => {
    const a = access({ currentUser: defaultUser(), menuData: [] });
    expect(a.isAdmin).toBe(true);
    expect(a.canManageUsers).toBe(true);
    expect(a.canManageTenants).toBe(true);
    expect(a.canViewLogs).toBe(true);
    expect(a.routeFilter({ name: 'secret' })).toBe(true);
  });

  it('non-admin can only access pages present in menuData', () => {
    const a = access({
      currentUser: defaultUser({ tenantCode: 'acme', roleCodes: ['user'] }),
      menuData: [
        { path: '/system/user', children: [{ path: '/system/user/list' }] },
      ],
    });
    expect(a.isAdmin).toBe(false);
    expect(a.canManageUsers).toBe(true); // /system/user 已下发
    expect(a.canManageRoles).toBe(false); // /system/role 未下发
    expect(a.canViewLogs).toBe(false);
  });

  it('permission code "menu:<path>" grants page access as fallback', () => {
    const a = access({
      currentUser: defaultUser({
        tenantCode: 'acme',
        roleCodes: ['user'],
        permissions: ['menu:/system/dept'],
      }),
      menuData: [],
    });
    expect(a.canManageDepts).toBe(true);
    expect(a.canManageUsers).toBe(false);
  });

  it('routeFilter blocks unnamed routes via permission code', () => {
    const a = access({
      currentUser: defaultUser({ tenantCode: 'acme', roleCodes: ['user'] }),
      menuData: [],
    });
    expect(a.routeFilter({ name: 'system.user' })).toBe(false);
    expect(a.routeFilter({})).toBe(true); // 无 name 放行
  });
});
