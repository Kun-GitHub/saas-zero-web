import {
  AppstoreOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import * as Icons from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Input, Modal, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import React, { useMemo, useState } from 'react';

const useStyles = createStyles(({ token }) => ({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: token.paddingXS,
    maxHeight: 420,
    overflow: 'auto',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${token.paddingSM}px 0`,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadius,
    cursor: 'pointer',
    fontSize: token.fontSizeLG,
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: token.colorPrimary,
      color: token.colorPrimary,
    },
  },
  itemSelected: {
    borderColor: token.colorPrimary,
    background: token.colorPrimaryBg,
    color: token.colorPrimary,
  },
  iconPreview: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: token.fontSizeLG,
    cursor: 'pointer',
  },
}));

const iconNames = Object.keys(Icons)
  .filter((k) => /(Outlined|Filled|TwoTone)$/.test(k))
  .sort();

const renderIconByName = (name?: string) => {
  if (!name) return null;
  const Comp =
    (Icons as any)[`${name}Outlined`] || (Icons as any)[name];
  return Comp ? <Comp /> : null;
};

type IconPickerProps = {
  value?: string;
  onChange?: (value: string) => void;
};

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  const { styles } = useStyles();
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return iconNames;
    return iconNames.filter((n) => n.toLowerCase().includes(kw));
  }, [search]);

  const f = (id: string) => intl.formatMessage({ id });

  return (
    <>
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        addonBefore={
          <span
            className={styles.iconPreview}
            onClick={() => setOpen(true)}
          >
            {renderIconByName(value) || <AppstoreOutlined />}
          </span>
        }
        addonAfter={
          <AppstoreOutlined
            style={{ cursor: 'pointer' }}
            onClick={() => setOpen(true)}
          />
        }
      />
      <Modal
        title={f('pages.system.menu.selectIcon')}
        open={open}
        footer={null}
        width={720}
        onCancel={() => setOpen(false)}
      >
        <Input
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={f('pages.system.menu.searchIcon')}
          prefix={<SearchOutlined />}
          style={{ marginBottom: 16 }}
        />
        <div className={styles.grid}>
          {filtered.map((name) => {
            const selected = value === name;
            return (
              <Tooltip title={name} key={name}>
                <div
                  className={
                    selected
                      ? `${styles.item} ${styles.itemSelected}`
                      : styles.item
                  }
                  onClick={() => {
                    onChange?.(name);
                    setOpen(false);
                  }}
                >
                  {renderIconByName(name)}
                </div>
              </Tooltip>
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default IconPicker;
