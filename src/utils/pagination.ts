export const PAGE_SIZE = 5;

export interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
}

/** Повертає елементи потрібної сторінки; номер сторінки (з 1) обмежується допустимим діапазоном. */
export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize: number = PAGE_SIZE,
): Page<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;

  return { items: items.slice(start, start + pageSize), page: current, totalPages };
}
