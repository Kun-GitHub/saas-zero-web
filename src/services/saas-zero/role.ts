import { request } from '@umijs/max';

export async function createRole(body: SaaS.RoleCreate) {
  return request<SaaS.EmptyResp>('/system/role/create', {
    method: 'POST',
    data: body,
  });
}

export async function updateRole(body: SaaS.RoleUpdate) {
  return request<SaaS.EmptyResp>('/system/role/update', {
    method: 'PUT',
    data: body,
  });
}

export async function deleteRole(ids: number[]) {
  return request<SaaS.EmptyResp>('/system/role/delete', {
    method: 'POST',
    data: { ids },
  });
}

export async function getRoleList(params: SaaS.RoleQuery) {
  return request<SaaS.PageResult<SaaS.SysRole>>('/system/role/list', {
    method: 'GET',
    params,
  });
}

export async function getRoleDetail(id: string) {
  return request<SaaS.SysRole>(`/system/role/${id}`, {
    method: 'GET',
  });
}

export async function assignRoleMenus(body: SaaS.RoleAssignMenus) {
  return request<SaaS.EmptyResp>('/system/role/assignMenus', {
    method: 'POST',
    data: body,
  });
}

export async function assignRoleApis(body: SaaS.RoleAssignApis) {
  return request<SaaS.EmptyResp>('/system/role/assignApis', {
    method: 'POST',
    data: body,
  });
}
