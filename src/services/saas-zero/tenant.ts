import { request } from '@umijs/max';

export async function createTenant(body: any) {
  return request<SaaS.EmptyResp>('/system/tenant/create', {
    method: 'POST',
    data: body,
  });
}

export async function updateTenant(body: any) {
  return request<SaaS.EmptyResp>('/system/tenant/update', {
    method: 'PUT',
    data: body,
  });
}

export async function deleteTenant(ids: number[]) {
  return request<SaaS.EmptyResp>('/system/tenant/delete', {
    method: 'POST',
    data: { ids },
  });
}

export async function getTenantList(params: SaaS.TenantQuery) {
  return request<SaaS.PageResult<SaaS.SysTenant>>('/system/tenant/list', {
    method: 'GET',
    params,
  });
}

export async function getTenantDetail(id: string) {
  return request<SaaS.SysTenant>(`/system/tenant/${id}`, {
    method: 'GET',
  });
}

export async function changeTenantStatus(id: string, status: string) {
  return request<SaaS.EmptyResp>('/system/tenant/changeStatus', {
    method: 'POST',
    data: { id, status },
  });
}
