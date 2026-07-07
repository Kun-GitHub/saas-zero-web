import { request } from '@umijs/max';

export async function login(body: SaaS.LoginParams) {
  return request<SaaS.LoginResult>('/oauth/login', {
    method: 'POST',
    data: body,
  });
}

export async function getCurrentUser() {
  return request<SaaS.CurrentUser>('/oauth/userinfo', {
    method: 'GET',
  });
}

export async function getMenus() {
  return request<SaaS.SysMenu[]>('/oauth/menus', {
    method: 'GET',
  });
}

export async function getPermissions() {
  return request<string[]>('/oauth/permissions', {
    method: 'GET',
  });
}

export async function changePassword(body: { oldPassword: string; newPassword: string }) {
  return request<SaaS.EmptyResp>('/oauth/password/change', {
    method: 'POST',
    data: body,
  });
}

export async function resetPassword(body: SaaS.UserResetPassword) {
  return request<SaaS.EmptyResp>('/oauth/password/reset', {
    method: 'POST',
    data: body,
  });
}
