// Repository: users — শুধু server-side থেকে ব্যবহার করুন।
const { query } = require('../client');

async function createUser({ fullName, email, phone, passwordHash, authProvider, authSubject, role = 'USER' }) {
  const r = await query(
    `INSERT INTO users (full_name, email, phone, password_hash, auth_provider, auth_subject, role)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id, full_name, email, phone, role, is_active, is_verified, created_at`,
    [fullName, email || null, phone || null, passwordHash || null, authProvider || null, authSubject || null, role]
  );
  return r.rows[0];
}

async function findById(id) {
  const r = await query(`SELECT id, full_name, email, phone, avatar_url, role, is_active, is_verified, created_at FROM users WHERE id=$1 AND deleted_at IS NULL`, [id]);
  return r.rows[0] || null;
}

async function findByEmail(email) {
  const r = await query(`SELECT * FROM users WHERE lower(email)=lower($1) AND deleted_at IS NULL`, [email]);
  return r.rows[0] || null;
}

/** Login-এর জন্য hash সহ (public API-তে password_hash কখনো ফেরত নয়)। */
async function findAuthByEmail(email) {
  const r = await query(
    `SELECT id, full_name, email, phone, password_hash, role, is_active, is_verified FROM users
     WHERE lower(email)=lower($1) AND deleted_at IS NULL`, [email]);
  return r.rows[0] || null;
}

/** রোল পরিবর্তন শুধু ADMIN/SUPER_ADMIN — caller service-এ যাচাই করবে। */
async function setRole(id, role) {
  const r = await query(`UPDATE users SET role=$2, updated_at=now() WHERE id=$1 AND deleted_at IS NULL RETURNING id, role`, [id, role]);
  return r.rows[0] || null;
}

async function setActive(id, isActive) {
  const r = await query(`UPDATE users SET is_active=$2, updated_at=now() WHERE id=$1 RETURNING id, is_active`, [id, isActive]);
  return r.rows[0] || null;
}

async function touchLogin(id) {
  await query(`UPDATE users SET last_login_at=now() WHERE id=$1`, [id]);
}

module.exports = { createUser, findById, findByEmail, findAuthByEmail, setRole, setActive, touchLogin };
