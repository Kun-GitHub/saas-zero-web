import { request } from '@umijs/max';

export async function createDict(body: any) {
  return request<SaaS.EmptyResp>('/system/dict/create', {
    method: 'POST',
    data: body,
  });
}

export async function updateDict(body: any) {
  return request<SaaS.EmptyResp>('/system/dict/update', {
    method: 'POST',
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

export async function getDictDetail(id: number) {
  return request<SaaS.SysDict>('/system/dict/detail', {
    method: 'GET',
    params: { id },
  });
}

export async function createDictData(body: any) {
  return request<SaaS.EmptyResp>('/system/dictData/create', {
    method: 'POST',
    data: body,
  });
}

export async function updateDictData(body: any) {
  return request<SaaS.EmptyResp>('/system/dictData/update', {
    method: 'POST',
    data: body,
  });
}

export async function deleteDictData(ids: number[]) {
  return request<SaaS.EmptyResp>('/system/dictData/delete', {
    method: 'POST',
    data: { ids },
  });
}

export async function getDictDataList(params: any) {
  return request<SaaS.PageResult<SaaS.SysDictData>>('/system/dictData/list', {
    method: 'GET',
    params,
  });
}

export async function getDictDataDetail(id: number) {
  return request<SaaS.SysDictData>('/system/dictData/detail', {
    method: 'GET',
    params: { id },
  });
}

export async function getDictDataByDictKey(dictKey: string) {
  return request<SaaS.SysDictData[]>('/system/dictData/byDictKey', {
    method: 'GET',
    params: { key: dictKey },
  });
}
