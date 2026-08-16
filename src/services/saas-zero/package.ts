import { request } from '@umijs/max';

export async function createPackage(body: any) {
  return request<SaaS.EmptyResp>('/system/package/create', {
    method: 'POST',
    data: body,
  });
}

export async function updatePackage(body: any) {
  return request<SaaS.EmptyResp>('/system/package/update', {
    method: 'POST',
    data: body,
  });
}

export async function deletePackage(ids: string[]) {
  return request<SaaS.EmptyResp>('/system/package/delete', {
    method: 'POST',
    data: { ids },
  });
}

export async function getPackageList(params: { page: number; pageSize: number }) {
  return request<SaaS.PageResult<SaaS.SysPackage>>('/system/package/list', {
    method: 'GET',
    params,
  });
}

export async function getPackageDetail(id: string) {
  return request<SaaS.SysPackage>('/system/package/detail', {
    method: 'GET',
    params: { id },
  });
}

export async function assignPackageMenus(body: SaaS.RoleAssignMenus) {
  return request<SaaS.EmptyResp>('/system/package/assignMenus', {
    method: 'POST',
    data: body,
  });
}

export async function assignPackageApis(body: SaaS.RoleAssignApis) {
  return request<SaaS.EmptyResp>('/system/package/assignApis', {
    method: 'POST',
    data: body,
  });
}
