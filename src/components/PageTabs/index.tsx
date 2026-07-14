import { history, useIntl, useLocation } from '@umijs/max';
import { Menu, Tabs } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const pathI18nKey: Record<string, string> = {
  '/dashboard': 'menu.dashboard',
  '/system/user': 'menu.systemUser',
  '/system/role': 'menu.systemRole',
  '/system/menu': 'menu.systemMenu',
  '/system/dept': 'menu.systemDept',
  '/dict': 'menu.dict',
  '/tenant/list': 'menu.tenantList',
  '/tenant/package': 'menu.tenantPackage',
  '/api': 'menu.api',
  '/log/login-log': 'menu.loginLog',
  '/log/operation-log': 'menu.operationLog',
  '/init': 'menu.init',
};

interface TabItem {
  key: string;
  label: string;
  closable: boolean;
}

const PageTabs: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const intl = useIntl();
  const f = (id: string) => intl.formatMessage({ id });
  const tabsRef = useRef<HTMLDivElement>(null);
  const [tabs, setTabs] = useState<TabItem[]>([
    {
      key: '/dashboard',
      label: intl.formatMessage({ id: 'menu.dashboard' }),
      closable: false,
    },
  ]);
  const [activeKey, setActiveKey] = useState('/dashboard');
  const [ctxMenu, setCtxMenu] = useState<{
    key: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const path = location.pathname;
    const i18nKey = pathI18nKey[path];
    if (!i18nKey) return;
    const label = intl.formatMessage({ id: i18nKey });
    setTabs((prev) => {
      if (prev.some((t) => t.key === path)) return prev;
      return [...prev, { key: path, label, closable: true }];
    });
    setActiveKey(path);
  }, [location.pathname]);

  const onTabChange = useCallback((key: string) => {
    setActiveKey(key);
    history.push(key);
  }, []);

  const switchToTab = useCallback((key: string) => {
    setActiveKey(key);
    setTabs((prev) => {
      const exists = prev.find((t) => t.key === key);
      if (!exists) return prev;
      return prev;
    });
    history.push(key);
  }, []);

  const closeTab = useCallback(
    (targetKey: string) => {
      setTabs((prev) => {
        const idx = prev.findIndex((t) => t.key === targetKey);
        const next = prev.filter((t) => t.key !== targetKey);
        if (targetKey === activeKey && next.length > 0) {
          const nextIdx = Math.min(idx, next.length - 1);
          switchToTab(next[nextIdx].key);
        }
        return next;
      });
    },
    [activeKey, switchToTab],
  );

  const closeOthers = useCallback(
    (key: string) => {
      setTabs((prev) => {
        const next = prev.filter((t) => t.key === key || !t.closable);
        if (key !== activeKey) switchToTab(key);
        return next;
      });
      setCtxMenu(null);
    },
    [activeKey, switchToTab],
  );

  const closeRight = useCallback(
    (key: string) => {
      setTabs((prev) => {
        const idx = prev.findIndex((t) => t.key === key);
        const next = prev.slice(0, idx + 1);
        if (!next.find((t) => t.key === activeKey)) switchToTab(key);
        return next;
      });
      setCtxMenu(null);
    },
    [activeKey, switchToTab],
  );

  const closeAll = useCallback(() => {
    setTabs((prev) => {
      const next = prev.filter((t) => !t.closable);
      switchToTab('/dashboard');
      return next;
    });
    setCtxMenu(null);
  }, [switchToTab]);

  useEffect(() => {
    if (!ctxMenu) return;
    const handler = () => setCtxMenu(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [ctxMenu]);

  if (location.pathname === '/user/login') return <>{children}</>;

  return (
    <div
      ref={tabsRef}
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div
        style={{
          borderBottom: '1px solid #f0f0f0',
          background: '#fff',
          margin: '-24px -24px 0',
          padding: '0 8px',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <Tabs
          type="editable-card"
          hideAdd
          size="small"
          activeKey={activeKey}
          onChange={onTabChange}
          onEdit={(targetKey) => closeTab(targetKey as string)}
          tabBarStyle={{ margin: 0 }}
          items={tabs.map((tab) => ({
            key: tab.key,
            label: (
              <span
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCtxMenu({ key: tab.key, x: e.clientX, y: e.clientY });
                }}
              >
                {tab.label}
              </span>
            ),
            closable: tab.closable,
          }))}
        />
      </div>
      <div style={{ flex: 1, overflow: 'auto', paddingTop: 24 }}>
        {children}
      </div>
      {ctxMenu &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              left: ctxMenu.x,
              top: ctxMenu.y,
              zIndex: 1050,
              boxShadow: '0 6px 16px rgba(0,0,0,.08)',
              borderRadius: 6,
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Menu
              onClick={({ key }) => {
                if (key === 'closeOthers') closeOthers(ctxMenu.key);
                else if (key === 'closeRight') closeRight(ctxMenu.key);
                else if (key === 'closeAll') closeAll();
                else if (key === 'closeCurrent') closeTab(ctxMenu.key);
              }}
              items={[
                { key: 'closeOthers', label: f('app.tabs.closeOthers') },
                { key: 'closeRight', label: f('app.tabs.closeRight') },
                { key: 'closeAll', label: f('app.tabs.closeAll') },
                { type: 'divider' },
                { key: 'closeCurrent', label: f('app.tabs.closeCurrent') },
              ]}
              style={{ border: 'none' }}
            />
          </div>,
          document.body,
        )}
    </div>
  );
};

export default PageTabs;
