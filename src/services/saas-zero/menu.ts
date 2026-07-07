import { request } from '@umijs/max';

export async function createMenu(body: SaaS.MenuCreate) {
  return request<SaaS.EmptyResp>('/system/menu/create', {
    method: 'POST',
    data: body,
  });
}

export async function updateMenu(body: SaaS.MenuUpdate) {
  return request<SaaS.EmptyResp>('/system/menu/update', {
    method: 'PUT',
    data: body,
  });
}

export async function deleteMenu(ids: number[]) {
  return request<SaaS.EmptyResp>('/system/menu/delete', {
    method: 'POST',
    data: { ids },
  });
}

export async function getMenuList() {
  return request<SaaS.SysMenu[]>('/system/menu/list', {
    method: 'GET',
  });
}

export async function getMenuDetail(id: string) {
  return request<SaaS.SysMenu>(`/system/menu/${id}`, {
    method: 'GET',
  });
}

export async function getMenuTree() {
  return request<SaaS.SysMenu[]>('/system/menu/tree', {
    method: 'GET',
  });
}
