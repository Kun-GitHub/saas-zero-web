import dayjs from 'dayjs';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * Formats API date values consistently. The backend normally returns
 * `YYYY-MM-DD HH:mm:ss`, while this also tolerates Unix seconds/milliseconds
 * and ISO strings so legacy records do not leak raw timestamps into the UI.
 */
export const formatDateTime = (
  value?: string | number | null,
  emptyText = '-',
): string => {
  if (value === undefined || value === null || value === '') return emptyText;

  if (typeof value === 'number' || /^\d+$/.test(String(value))) {
    const timestamp = Number(value);
    if (!Number.isFinite(timestamp) || timestamp <= 0) return emptyText;
    const date = dayjs(
      timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp,
    );
    return date.isValid() ? date.format(DATE_TIME_FORMAT) : String(value);
  }

  const date = dayjs(value);
  return date.isValid() ? date.format(DATE_TIME_FORMAT) : String(value);
};
