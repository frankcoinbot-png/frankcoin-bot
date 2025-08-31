import React, { useEffect, useState } from 'react';

async function post(path, body, token){
  const r = await fetch((import.meta.env.VITE_API_BASE || 'http://localhost:8080') + '/api' + path, {
    method: 'POST', headers: { 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) }, body: JSON.stringify(body||{})
  });
  return r.json();
}
async function get(path, token){
  const r = await fetch((import.meta.env.VITE_API_BASE || 'http://localhost:8080') + '/api' + path, { headers: { ...(token?{Authorization:`Bearer ${token}`}:{}) }});
  return r.json();
}

export default function Admin({ onAuth }){
  const [token, setToken] = useState('');
  const [pwd, setPwd] = useState('');
  const [stats, setStats] = useState(null);

  async function login(){
    const r = await post('/admin/login',{ password: pwd });
    if(r.token){ localStorage.setItem('admin','1'); setToken(r.token); onAuth && onAuth(); }
  }

  useEffect(()=>{ (async()=>{ if(token){ setStats(await get('/admin/stats', token)); } })(); },[token]);

  if(!token){
    return (
      <section className="screen admin">
        <h2>Admin Login</h2>
        <div className="card">
          <label>Password<input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} /></label>
          <button onClick={login} style={{marginTop:8}}>Login</button>
        </div>
      </section>
    );
  }

  return (
    <section className="screen admin">
      <h2>Admin Panel</h2>
      <div className="grid">
        <div className="card">
          <h3>Stats</h3>
          <div>Users: {stats?.users ?? '-'}</div>
          <div>Active Premium: {stats?.activePremium ?? '-'}</div>
          <div>Revenue (TON): {stats?.revenueTon ?? '-'}</div>
        </div>
        <GrantPremium token={token} />
        <Payout token={token} />
      </div>
    </section>
  );
}

function GrantPremium({ token }){
  const [uid,setUid] = useState('');
  const [days,setDays] = useState(30);
  async function submit(){
    await fetch((import.meta.env.VITE_API_BASE || 'http://localhost:8080') + '/api/admin/grant_premium', {
      method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({ uid: Number(uid), days })
    });
    alert('Granted');
  }
  return (
    <div className="card">
      <h3>Grant Premium</h3>
      <label>User TG ID<input value={uid} onChange={e=>setUid(e.target.value)} /></label>
      <label>Days<input type="number" value={days} onChange={e=>setDays(Number(e.target.value))} /></label>
      <button onClick={submit} style={{marginTop:8}}>Grant</button>
    </div>
  );
}

function Payout({ token }){
  const [to,setTo] = useState('');
  const [amount,setAmount] = useState('1');
  const [comment,setComment] = useState('FRANKCOIN payout');
  async function submit(){
    const r = await fetch((import.meta.env.VITE_API_BASE || 'http://localhost:8080') + '/api/admin/payout', {
      method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({ to, amountTon: Number(amount), comment })
    });
    const j = await r.json();
    alert(j.ok ? 'Sent' : ('Error: '+(j.error||'unknown')));
  }
  return (
    <div className="card">
      <h3>Withdraw TON</h3>
      <label>To Address<input value={to} onChange={e=>setTo(e.target.value)} /></label>
      <label>Amount TON<input value={amount} onChange={e=>setAmount(e.target.value)} /></label>
      <label>Comment<input value={comment} onChange={e=>setComment(e.target.value)} /></label>
      <button onClick={submit} style={{marginTop:8}}>Withdraw</button>
    </div>
  );
}
