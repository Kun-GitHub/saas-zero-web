import { apiMenuToLayout, buildLayoutMenu } from '@/utils/menu';

describe('buildLayoutMenu', () => {
  it('returns empty array for undefined/null input', () => {
    expect(buildLayoutMenu(undefined)).toEqual([]);
    expect(buildLayoutMenu([])).toEqual([]);
  });

  it('converts backend menu tree and drops button nodes', () => {
    const menus = [
      {
        id: '1',
        name: '系统管理',
        path: '/system',
        menuType: 'directory',
        icon: 'Setting',
        children: [
          {
            id: '2',
            name: '用户管理',
            path: '/system/user',
            menuType: 'menu',
            children: [
              {
                id: '3',
                name: '新增用户',
                path: 'system:user:create',
                menuType: 'button',
              },
            ],
          },
        ],
      },
    ];
    const layout = buildLayoutMenu(menus as any);
    expect(layout).toHaveLength(1);
    expect(layout[0]).toMatchObject({ name: '系统管理', path: '/system' });
    // 按钮节点被过滤
    expect(layout[0].children).toHaveLength(1);
    expect(layout[0].children[0]).toMatchObject({
      name: '用户管理',
      path: '/system/user',
    });
    expect(layout[0].children[0].children).toBeUndefined();
  });

  it('preserves hidden flag (hideInMenu)', () => {
    const layout = buildLayoutMenu([
      {
        id: '1',
        name: '隐藏菜单',
        path: '/hidden',
        menuType: 'menu',
        hidden: true,
      },
    ] as any);
    expect(layout[0].hideInMenu).toBe(true);
  });

  it('assigns fallback key for empty path', () => {
    const layout = buildLayoutMenu([
      { id: '99', name: '无路径', path: '', menuType: 'menu' },
    ] as any);
    expect(layout[0].key).toBe('/__menu_99');
  });
});

describe('apiMenuToLayout', () => {
  it('ignores icon when unregistered (no throw)', () => {
    const node = apiMenuToLayout({
      id: '1',
      name: '未知图标',
      path: '/x',
      menuType: 'menu',
      icon: 'NotARealIcon',
    } as any);
    expect(node.icon).toBeNull();
  });

  it('maps children recursively', () => {
    const node = apiMenuToLayout({
      id: '1',
      name: '根',
      path: '/root',
      menuType: 'directory',
      children: [
        { id: '2', name: '子', path: '/root/child', menuType: 'menu' },
      ],
    } as any);
    expect(node.children).toHaveLength(1);
    expect(node.children[0].path).toBe('/root/child');
  });
});
