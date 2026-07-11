declare namespace SaaS {
  type CurrentUser = {
    userId: string;
    tenantId: string;
    userName: string;
    nickname: string;
    avatar?: string;
    mobile?: string;
    email?: string;
    roleCodes: string[];
    permissions: string[];
  };

  type LoginParams = {
    tenantCode: string;
    username: string;
    password: string;
    captchaId?: string;
    captchaVal?: string;
  };

  type LoginResult = {
    token: string;
    user: CurrentUser;
  };

  type CaptchaResult = {
    captchaId: string;
    captchaImg: string;
  };

  type PageResult<T> = {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
  };

  type SysUser = {
    id: string;
    username: string;
    nickname: string;
    mobile?: string;
    email?: string;
    deptId?: string;
    deptName?: string;
    roleIds: string[];
    roleNames: string[];
    status: string;
    lastLoginAt?: string;
    createdAt: string;
  };

  type UserQuery = {
    page: number;
    pageSize: number;
    username?: string;
    nickname?: string;
    mobile?: string;
    status?: string;
    deptId?: string;
    startTime?: string;
    endTime?: string;
  };

  type UserCreate = {
    username: string;
    password: string;
    nickname: string;
    mobile?: string;
    email?: string;
    deptId?: string;
    roleIds?: string[];
    status: string;
  };

  type UserUpdate = UserCreate & { id: string };

  type SysRole = {
    id: string;
    name: string;
    code: string;
    status: string;
    sort: number;
    remark?: string;
    createdAt: string;
  };

  type RoleQuery = {
    page: number;
    pageSize: number;
    name?: string;
    code?: string;
    status?: string;
  };

  type RoleCreate = {
    name: string;
    code: string;
    status: string;
    sort?: number;
    remark?: string;
  };

  type RoleUpdate = RoleCreate & { id: string };

  type SysMenu = {
    id: string;
    name: string;
    menuType: string;
    path?: string;
    icon?: string;
    component?: string;
    hidden?: boolean;
    isRedirect?: boolean;
    redirect?: string;
    status: string;
    sort: number;
    parentId?: string;
    children?: SysMenu[];
  };

  type MenuCreate = {
    name: string;
    type: string;
    path?: string;
    icon?: string;
    status: string;
    sort: number;
    parentId?: string;
  };

  type MenuUpdate = MenuCreate & { id: string };

  type SysDept = {
    id: string;
    name: string;
    leader?: string;
    phone?: string;
    status: string;
    sort: number;
    parentId?: string;
    children?: SysDept[];
  };

  type DeptCreate = {
    name: string;
    parentId?: string;
    leader?: string;
    phone?: string;
    status: string;
    sort?: number;
  };

  type DeptUpdate = DeptCreate & { id: string };

  type SysTenant = {
    id: string;
    name: string;
    code: string;
    adminId?: string;
    packageId?: string;
    packageName?: string;
    expiredAt?: string;
    status: string;
    createdAt: string;
  };

  type TenantQuery = {
    page: number;
    pageSize: number;
    name?: string;
    code?: string;
    status?: string;
  };

  type SysPackage = {
    id: string;
    name: string;
    code: string;
    status: string;
    sort?: number;
    remark?: string;
  };

  type SysApi = {
    id: string;
    apiName: string;
    apiPath: string;
    apiMethod: string;
    apiType?: string;
    status: string;
    remark?: string;
  };

  type ApiQuery = {
    page: number;
    pageSize: number;
    apiName?: string;
    apiPath?: string;
    apiType?: string;
    status?: string;
  };

  type SysDict = {
    id: string;
    name: string;
    key: string;
    status: string;
    remark?: string;
  };

  type SysDictData = {
    id: string;
    name: string;
    key: string;
    value: string;
    status: string;
    remark?: string;
    dictId: string;
  };

  type SysLoginLog = {
    id: string;
    username: string;
    loginIp: string;
    status: string;
    msg?: string;
    loginAt: string;
  };

  type SysOperationLog = {
    id: string;
    operatorName: string;
    module: string;
    operation: string;
    requestUrl: string;
    status: string;
    duration: number;
    createdAt: string;
  };

  type EmptyResp = {
    code: number;
    msg: string;
  };

  type RoleAssignMenus = {
    id: number;
    menuIds: number[];
  };

  type RoleAssignApis = {
    id: number;
    apiIds: number[];
  };

  type UserAssignRoles = {
    id: number;
    roleIds: number[];
  };

  type UserResetPassword = {
    id: number;
    password: string;
  };

  type IdsReq = {
    ids: number[];
  };

  type SysRoleMenuIds = {
    menuIds: number[];
  };

  type SysRoleApiIds = {
    apiIds: number[];
  };

  type SysUserRoleIds = {
    roleIds: number[];
  };
}
