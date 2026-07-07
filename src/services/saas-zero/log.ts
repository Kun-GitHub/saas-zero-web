import { request } from '@umijs/max';

export async function getLoginLogList(params: { page: number; pageSize: number; username?: string }) {
  return request<SaaS.PageResult<SaaS.SysLoginLog>>('/system/log/loginLog/list', {
    method: 'GET',
    params,
  });
}

export async function getOperationLogList(params: { page: number; pageSize: number; module?: string }) {
  return request<SaaS.PageResult<SaaS.SysOperationLog>>('/system/log/operationLog/list', {
    method: 'GET',
    params,
  });
}
