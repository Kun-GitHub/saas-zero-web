import { useModel } from '@umijs/max';

/**
 * 是否为 default 租户的管理员（超级管理员）。
 * 仅 default 租户的 admin 角色拥有全量权限；其他租户的 admin 角色按角色权限校验。
 */
export const isSuperAdmin = (currentUser?: SaaS.CurrentUser): boolean =>
  !!currentUser &&
  currentUser.tenantCode === 'default' &&
  (currentUser.roleCodes || []).includes('admin');

/**
 * 按钮级权限 hook。
 * - can(code) 返回当前用户是否拥有某权限码（default 租户管理员恒为 true）
 * - 权限码来自 button 类型菜单的 path（如 system:user:create），
 *   由 /oauth/permissions 下发，角色分配菜单时勾选。
 */
export const usePermission = () => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const permissions = currentUser?.permissions || [];
  const admin = isSuperAdmin(currentUser);

  return {
    isAdmin: admin,
    can: (code: string) => admin || permissions.includes(code),
  };
};
