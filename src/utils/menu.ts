import * as Icons from '@ant-design/icons';
import type * as React from 'react';
import { createElement } from 'react';

/**
 * 把后端 /oauth/menus 返回的菜单树转换为 ProLayout 的布局数据。
 * ProLayout/antd Menu keys items by `path`. Directory nodes with an empty
 * path would all collapse to `undefined`, making sibling directories expand,
 * collapse and highlight together. Guarantee a unique, stable path per node.
 * 同时过滤掉 button 类型节点（按钮权限码仅用于 usePermission）。
 */
export const apiMenuToLayout = (m: any): any => {
  const path = m.path || `/__menu_${m.id}`;
  const children = (m.children?.length ? m.children : [])
    .filter((c: any) => c.menuType !== 'button')
    .map((c: any) => apiMenuToLayout(c));
  return {
    key: path,
    name: m.name,
    path,
    icon: m.icon ? resolveIcon(m.icon) : undefined,
    hideInMenu: m.hidden || false,
    children: children.length ? children : undefined,
  };
};

const iconCache = new Map<string, React.ReactNode>();
const resolveIcon = (name: string): React.ReactNode => {
  if (iconCache.has(name)) return iconCache.get(name);
  const Comp = (Icons as any)[`${name}Outlined`] || (Icons as any)[name];
  if (!Comp) {
    iconCache.set(name, null);
    return null;
  }
  const node = createElement(Comp);
  iconCache.set(name, node);
  return node;
};

/**
 * 从后端菜单树生成 ProLayout menuData（过滤 button，转布局结构）。
 */
export const buildLayoutMenu = (apiMenus: any[] | undefined): any[] => {
  if (!apiMenus || apiMenus.length === 0) return [];
  return apiMenus
    .filter((m: any) => m.menuType !== 'button')
    .map((m: any) => apiMenuToLayout(m));
};
