import { request } from '@umijs/max';

export async function createMenu(body: SaaS.MenuCreate) {
  return request<SaaS.EmptyResp>('/system/menu/create', {
    method: 'POST',
    data: body,
  });
}

export async function updateMenu(body: SaaS.MenuUpdate) {
  return request<SaaS.EmptyResp>('/system/menu/update', {
    method: 'POST',
    data: body,
  });
}

export async function deleteMenu(ids: string[]) {
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
  return request<SaaS.SysMenu>('/system/menu/detail', {
    method: 'GET',
    params: { id },
  });
}

export async function getMenuTree() {
  return request<SaaS.SysMenu[]>('/system/menu/tree', {
    method: 'GET',
  });
}
