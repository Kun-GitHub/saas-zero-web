import { request } from '@umijs/max';

export async function createApi(body: any) {
  return request<SaaS.EmptyResp>('/system/api/create', { method: 'POST', data: body });
}

export async function updateApi(body: any) {
  return request<SaaS.EmptyResp>('/system/api/update', { method: 'POST', data: body });
}

export async function deleteApi(ids: number[]) {
  return request<SaaS.EmptyResp>('/system/api/delete', { method: 'POST', data: { ids } });
}

export async function getApiList(params: SaaS.ApiQuery) {
  return request<SaaS.PageResult<SaaS.SysApi>>('/system/api/list', { method: 'GET', params });
}

export async function getApiDetail(id: number) {
  return request<SaaS.SysApi>('/system/api/detail', { method: 'GET', params: { id } });
}
