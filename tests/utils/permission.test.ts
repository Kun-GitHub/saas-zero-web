import { isSuperAdmin } from '@/utils/permission';

const baseUser = (extra: Partial<SaaS.CurrentUser> = {}): SaaS.CurrentUser => ({
  userId: '1',
  tenantId: '1',
  tenantCode: 'default',
  userName: 'admin',
  nickname: '管理员',
  roleCodes: ['admin'],
  permissions: [],
  ...extra,
});

describe('isSuperAdmin', () => {
  it('true for default tenant admin role', () => {
    expect(isSuperAdmin(baseUser())).toBe(true);
  });

  it('false for default tenant non-admin role', () => {
    expect(isSuperAdmin(baseUser({ roleCodes: ['user'] }))).toBe(false);
  });

  it('false for non-default tenant admin role', () => {
    expect(isSuperAdmin(baseUser({ tenantCode: 'acme' }))).toBe(false);
  });

  it('false when currentUser missing', () => {
    expect(isSuperAdmin(undefined)).toBe(false);
  });
});
