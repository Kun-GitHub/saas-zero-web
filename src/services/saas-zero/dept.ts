import { request } from '@umijs/max';

export async function createDept(body: SaaS.DeptCreate) {
  return request<SaaS.EmptyResp>('/system/dept/create', {
    method: 'POST',
    data: body,
  });
}

export async function updateDept(body: SaaS.DeptUpdate) {
  return request<SaaS.EmptyResp>('/system/dept/update', {
    method: 'POST',
    data: body,
  });
}

export async function deleteDept(ids: number[]) {
  return request<SaaS.EmptyResp>('/system/dept/delete', {
    method: 'POST',
    data: { ids },
  });
}

export async function getDeptList() {
  return request<SaaS.SysDept[]>('/system/dept/list', {
    method: 'GET',
  });
}

export async function getDeptDetail(id: number) {
  return request<SaaS.SysDept>('/system/dept/detail', {
    method: 'GET',
    params: { id },
  });
}

export async function getDeptTree() {
  return request<SaaS.SysDept[]>('/system/dept/tree', {
    method: 'GET',
  });
}
