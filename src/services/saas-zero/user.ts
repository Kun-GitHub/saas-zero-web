import { request } from '@umijs/max';

export async function createUser(body: SaaS.UserCreate) {
  return request<SaaS.EmptyResp>('/system/user/create', {
    method: 'POST',
    data: body,
  });
}

export async function updateUser(body: SaaS.UserUpdate) {
  return request<SaaS.EmptyResp>('/system/user/update', {
    method: 'POST',
    data: body,
  });
}

export async function deleteUser(ids: number[]) {
  return request<SaaS.EmptyResp>('/system/user/delete', {
    method: 'POST',
    data: { ids },
  });
}

export async function getUserList(params: SaaS.UserQuery) {
  return request<SaaS.PageResult<SaaS.SysUser>>('/system/user/list', {
    method: 'GET',
    params,
  });
}

export async function getUserDetail(id: number) {
  return request<SaaS.SysUser>('/system/user/detail', {
    method: 'GET',
    params: { id },
  });
}

export async function assignUserRoles(body: SaaS.UserAssignRoles) {
  return request<SaaS.EmptyResp>('/system/user/assignRoles', {
    method: 'POST',
    data: body,
  });
}

export async function resetUserPassword(body: SaaS.UserResetPassword) {
  return request<SaaS.EmptyResp>('/system/user/resetPassword', {
    method: 'POST',
    data: body,
  });
}
