import { request } from '@umijs/max';

export async function createUser(body: SaaS.UserCreate) {
  return request<SaaS.EmptyResp>('/system/user/create', {
    method: 'POST',
    data: body,
  });
}

export async function updateUser(body: SaaS.UserUpdate) {
  return request<SaaS.EmptyResp>('/system/user/update', {
    method: 'PUT',
    data: body,
  });
}

export async function deleteUser(ids: number[]) {
  return request<SaaS.EmptyResp>('/system/user/delete', {
    method: 'POST',
    data: { ids },
  });
}

export async function batchDeleteUser(ids: number[]) {
  return deleteUser(ids);
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

export async function getUserList(params: SaaS.UserQuery) {
  return request<SaaS.PageResult<SaaS.SysUser>>('/system/user/list', {
    method: 'GET',
    params,
  });
}

export async function getUserDetail(id: string) {
  return request<SaaS.SysUser>(`/system/user/${id}`, {
    method: 'GET',
  });
}

export async function getUserByUsername(username: string) {
  return request<SaaS.SysUser>(`/system/user/username/${username}`, {
    method: 'GET',
  });
}
