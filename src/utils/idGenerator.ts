let lastId = 0;

/** Унікальний числовий id на основі часу; гарантовано зростає навіть у межах однієї мілісекунди. */
export function generateId(): number {
  const now = Date.now();
  lastId = now > lastId ? now : lastId + 1;
  return lastId;
}
