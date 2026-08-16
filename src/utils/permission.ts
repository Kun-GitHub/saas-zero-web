import { useModel } from '@umijs/max';

/**
 * 按钮级权限 hook。
 * - can(code) 返回当前用户是否拥有某权限码（admin 恒为 true）
 * - 权限码来自 button 类型菜单的 path（如 system:user:create），
 *   由 /oauth/permissions 下发，角色分配菜单时勾选。
 */
export const usePermission = () => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const permissions = currentUser?.permissions || [];
  const isAdmin = (currentUser?.roleCodes || []).includes('admin');

  return {
    isAdmin,
    can: (code: string) => isAdmin || permissions.includes(code),
  };
};
