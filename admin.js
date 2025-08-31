const express = require('express');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { TonClient, WalletContractV4, internal, toNano } = require('@ton/ton');
const { mnemonicToPrivateKey } = require('@ton/crypto');

const r = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev';

function adminAuth(req,res,next){
  const token = req.headers.authorization?.split(' ')[1];
  if(!token) return res.status(401).json({ error: 'no token' });
  try { jwt.verify(token, JWT_SECRET); next(); } catch { return res.status(401).json({ error: 'bad token' }); }
}

r.post('/login', async (req,res) => {
  const { password } = req.body || {};
  if(password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'bad password' });
  const token = jwt.sign({ role:'admin' }, JWT_SECRET, { expiresIn: '1d' });
  return res.json({ token });
});

r.get('/stats', adminAuth, async (_, res) => {
  const users = (await query(`SELECT COUNT(*)::int AS c FROM users`)).rows[0].c;
  const activePremium = (await query(`SELECT COUNT(*)::int AS c FROM subscriptions WHERE status='active' AND expires_at>now()`)).rows[0].c;
  const revenueTon = (await query(`SELECT COALESCE(SUM(amount_ton),0)::numeric AS s FROM ton_transactions WHERE confirmed=true`)).rows[0].s;
  res.json({ users, activePremium, revenueTon });
});

r.post('/grant_premium', adminAuth, async (req,res) => {
  const { uid, days } = req.body || {};
  if(!uid || !days) return res.status(400).json({ error: 'uid/days required' });
  await query(`INSERT INTO subscriptions (user_id,status,started_at,expires_at,auto_click_available) VALUES ($1,'active',now(),now()+($2||' days')::interval,true)`, [uid, String(days)]);
  res.json({ ok: true });
});

r.post('/payout', adminAuth, async (req,res) => {
  try{
    const { to, amountTon, comment } = req.body || {};
    if(!to || !amountTon) return res.status(400).json({ error: 'to/amountTon required' });
    if(!process.env.CUSTODIAL_MNEMONIC) return res.status(400).json({ error: 'custodial mnemonic not set' });

    const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC' });
    const keyPair = await mnemonicToPrivateKey(process.env.CUSTODIAL_MNEMONIC.split(' '));
    const wallet = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });
    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();

    await walletContract.sendTransfer({
      secretKey: keyPair.secretKey,
      seqno,
      messages: [ internal({ to, value: toNano(amountTon), body: comment || '' }) ]
    });

    await query(`INSERT INTO ton_transactions (tx_hash,user_id,amount_ton,payload,confirmed) VALUES ($1,$2,$3,$4,true) ON CONFLICT DO NOTHING`, [
      `payout:${Date.now()}`, 0, amountTon, `payout:${comment || ''}`
    ]);
    res.json({ ok: true });
  } catch (e){
    res.status(500).json({ error: e?.message || 'payout failed' });
  }
});

module.exports = r;
