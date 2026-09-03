import { useEffect, useMemo, useState } from 'react';
import { getDictDataByDictKey } from '@/services/saas-zero/dict';

export type SystemDictOption = {
  value: string;
  label: string;
};

export function useSystemDict(dictKey: string, allowedValues?: string[]) {
  const [options, setOptions] = useState<SystemDictOption[]>([]);

  useEffect(() => {
    let mounted = true;
    getDictDataByDictKey(dictKey)
      .then((result) => {
        if (mounted) {
          setOptions(
            (result?.list || [])
              .filter((item) => item.status === 'active')
              .map((item) => ({ value: item.value, label: item.name })),
          );
        }
      })
      .catch(() => {
        if (mounted) setOptions([]);
      });
    return () => {
      mounted = false;
    };
  }, [dictKey]);

  const filteredOptions = useMemo(() => {
    if (!allowedValues) return options;
    const allowed = new Set(allowedValues);
    return options.filter((option) => allowed.has(option.value));
  }, [allowedValues, options]);

  const labels = useMemo(
    () =>
      new Map(filteredOptions.map((option) => [option.value, option.label])),
    [filteredOptions],
  );

  return {
    options: filteredOptions,
    getLabel: (value?: string) => (value ? labels.get(value) || value : ''),
  };
}

export function filterSystemDictOptions(
  options: SystemDictOption[],
  values: string[],
) {
  const allowed = new Set(values);
  return options.filter((option) => allowed.has(option.value));
}
