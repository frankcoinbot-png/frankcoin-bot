require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const { query } = require('./db');
const { ensureUser } = require('./bot');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'dev';

// --- Helpers
function signUserToken(tg_id) {
  return jwt.sign({ uid: tg_id }, JWT_SECRET, { expiresIn: '7d' });
}
function auth(req,res,next){
  const token = req.headers.authorization?.split(' ')[1];
  if(!token) return res.status(401).json({ error: 'no token' });
  try{
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  }catch{
    return res.status(401).json({ error: 'bad token' });
  }
}

// --- Public API
app.get('/api/token/:tgid', async (req,res)=>{
  const uid = Number(req.params.tgid);
  const u = await query('SELECT tg_id FROM users WHERE tg_id=$1',[uid]);
  if(u.rows.length===0){
    await query('SELECT ensure_user($1,$2,$3)', [uid, null, null]);
  }
  const t = signUserToken(uid);
  res.json({ token: t });
});

app.get('/api/init/:tgid', async (req,res)=>{
  const uid = Number(req.params.tgid);
  const user = await query('SELECT u.tg_id, u.username, COALESCE(b.coins,0) coins FROM users u LEFT JOIN balances b ON b.user_id=u.tg_id WHERE u.tg_id=$1',[uid]);
  const active = await query(`SELECT 1 FROM subscriptions WHERE user_id=$1 AND status='active' AND expires_at>now() LIMIT 1`,[uid]);
  res.json({
    profile: { id: uid, username: user.rows[0]?.username, coins: Number(user.rows[0]?.coins||0) },
    multipliers: { tap: active.rows.length?5:1 },
    premium: { active: active.rows.length>0 }
  });
});

app.post('/api/taps', auth, async (req,res)=>{
  const uid = req.user.uid;
  const { n } = req.body || { n: 1 };
  const multQ = await query(`SELECT CASE WHEN EXISTS(SELECT 1 FROM subscriptions WHERE user_id=$1 AND status='active' AND expires_at>now()) THEN 5 ELSE 1 END AS m`,[uid]);
  const m = Number(multQ.rows[0].m||1);
  const award = n * m;
  await query(`INSERT INTO taps(user_id, amount) VALUES ($1,$2)`,[uid, award]);
  await query(`INSERT INTO balances(user_id, coins) VALUES ($1,$2) ON CONFLICT (user_id) DO UPDATE SET coins = balances.coins + EXCLUDED.coins`,[uid, award]);
  res.json({ awarded: award });
});

app.get('/api/friends', auth, async (req,res)=>{
  const uid = req.user.uid;
  const link = `https://t.me/${process.env.BOT_USERNAME}?start=${uid}`;
  const stats = await query(`SELECT COUNT(*)::int invites, COALESCE(SUM(b.coins),0)::bigint coins
    FROM users u LEFT JOIN balances b ON b.user_id=u.tg_id WHERE u.referrer_id=$1`,[uid]);
  res.json({ link, stats: stats.rows[0] });
});

app.get('/api/top/:scope', async (req,res)=>{
  const scope = req.params.scope;
  // simple global leaderboard
  const rows = (await query(`SELECT u.tg_id, u.username, COALESCE(b.coins,0) AS score
    FROM users u LEFT JOIN balances b ON b.user_id=u.tg_id
    ORDER BY score DESC NULLS LAST LIMIT 50`)).rows;
  res.json(rows);
});

// --- Admin Routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// --- Static (optional: serve compiled webapp if copied to backend/public)
app.use(express.static(path.join(__dirname, '..', 'public')));

const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>{
  console.log(`Backend listening on :${PORT}`);
});
