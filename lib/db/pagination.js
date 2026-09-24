// Cursor-based pagination helper — বড় ডেটাসেটে OFFSET এড়িয়ে keyset pagination।
// created_at + id দিয়ে স্থিতিশীল ordering. CockroachDB/Postgres উভয়ে চলে।
function encodeCursor(row) {
  if (!row) return null;
  return Buffer.from(JSON.stringify({ created_at: row.created_at, id: row.id })).toString('base64url');
}

function decodeCursor(cursor) {
  if (!cursor) return null;
  try {
    const o = JSON.parse(Buffer.from(String(cursor), 'base64url').toString('utf8'));
    if (o && o.created_at && o.id) return o;
    return null;
  } catch { return null; }
}

/**
 * keysetWhere({cursor, orderDir}) → { clause, params, nextIndex }
 * @param {Array} params ইতিমধ্যে জমা হওয়া $ params
 * WHERE ... AND (created_at, id) < ($n, $m)  [desc]  — tuple comparison, standard SQL
 */
function keysetClause(params, cursor, orderDir = 'DESC') {
  const c = decodeCursor(cursor);
  if (!c) return { clause: '', params };
  const op = orderDir === 'DESC' ? '<' : '>';
  params.push(c.created_at, c.id);
  return { clause: ` AND (t.created_at, t.id) ${op} ($${params.length - 1}, $${params.length})`, params };
}

function pageOf(rows, limit) {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return { items, nextCursor: hasMore ? encodeCursor(items[items.length - 1]) : null, hasMore };
}

module.exports = { encodeCursor, decodeCursor, keysetClause, pageOf };
