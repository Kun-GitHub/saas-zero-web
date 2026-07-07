import { request } from '@umijs/max';

export async function createDict(body: any) {
  return request<SaaS.EmptyResp>('/system/dict/create', {
    method: 'POST',
    data: body,
  });
}

export async function updateDict(body: any) {
  return request<SaaS.EmptyResp>('/system/dict/update', {
    method: 'PUT',
    data: body,
  });
}

export async function deleteDict(ids: number[]) {
  return request<SaaS.EmptyResp>('/system/dict/delete', {
    method: 'POST',
    data: { ids },
  });
}

export async function getDictList(params: any) {
  return request<SaaS.PageResult<SaaS.SysDict>>('/system/dict/list', {
    method: 'GET',
    params,
  });
}

export async function getDictDetail(id: string) {
  return request<SaaS.SysDict>(`/system/dict/${id}`, {
    method: 'GET',
  });
}

export async function createDictData(body: any) {
  return request<SaaS.EmptyResp>('/system/dict/data/create', {
    method: 'POST',
    data: body,
  });
}

export async function updateDictData(body: any) {
  return request<SaaS.EmptyResp>('/system/dict/data/update', {
    method: 'PUT',
    data: body,
  });
}

export async function deleteDictData(ids: number[]) {
  return request<SaaS.EmptyResp>('/system/dict/data/delete', {
    method: 'POST',
    data: { ids },
  });
}

export async function getDictDataList(params: any) {
  return request<SaaS.PageResult<SaaS.SysDictData>>('/system/dict/data/list', {
    method: 'GET',
    params,
  });
}

export async function getDictDataDetail(id: string) {
  return request<SaaS.SysDictData>(`/system/dict/data/${id}`, {
    method: 'GET',
  });
}

export async function getDictDataByDictKey(dictKey: string) {
  return request<SaaS.SysDictData[]>(`/system/dict/data/dictKey/${dictKey}`, {
    method: 'GET',
  });
}
