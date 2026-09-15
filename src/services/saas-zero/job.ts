import { request } from '@umijs/max';

export async function getJobHandlers() {
  return request<{ code: string; name: string }[]>('/system/job/handlers', { method: 'GET' });
}

export async function createJob(body: SaaS.JobCreate) {
  return request<SaaS.EmptyResp>('/system/job/create', {
    method: 'POST',
    data: body,
  });
}

export async function updateJob(body: SaaS.JobUpdate) {
  return request<SaaS.EmptyResp>('/system/job/update', {
    method: 'POST',
    data: body,
  });
}

export async function deleteJob(ids: string[]) {
  return request<SaaS.EmptyResp>('/system/job/delete', {
    method: 'POST',
    data: { ids },
  });
}

export async function getJobList(params: SaaS.JobQuery) {
  return request<SaaS.PageResult<SaaS.SysJob>>('/system/job/list', {
    method: 'GET',
    params,
  });
}

export async function getJobDetail(id: string) {
  return request<SaaS.SysJob>('/system/job/detail', {
    method: 'GET',
    params: { id },
  });
}

export async function startJob(id: string) {
  return request<SaaS.EmptyResp>('/system/job/start', {
    method: 'POST',
    data: { id },
  });
}

export async function pauseJob(id: string) {
  return request<SaaS.EmptyResp>('/system/job/pause', {
    method: 'POST',
    data: { id },
  });
}

export async function runJobOnce(id: string) {
  return request<SaaS.EmptyResp>('/system/job/runOnce', {
    method: 'POST',
    data: { id },
  });
}

export async function getJobLogList(params: SaaS.JobLogQuery) {
  return request<SaaS.PageResult<SaaS.SysJobLog>>('/system/job/log/list', {
    method: 'GET',
    params,
  });
}

export async function cleanJobLog(body: SaaS.CleanJobLogReq) {
  return request<SaaS.EmptyResp>('/system/job/log/clean', {
    method: 'POST',
    data: body,
  });
}