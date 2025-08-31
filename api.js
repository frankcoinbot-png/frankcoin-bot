const API = (import.meta.env.VITE_API_BASE || 'http://localhost:8080') + '/api';

export async function getToken(uid){
  const r = await fetch(`${API}/token/${uid}`);
  const j = await r.json();
  return j.token;
}
export async function init(uid){
  const r = await fetch(`${API}/init/${uid}`);
  return await r.json();
}
export async function sendTaps(token, n){
  const r = await fetch(`${API}/taps`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ n }) });
  return await r.json();
}
export async function getFriends(token){
  const r = await fetch(`${API}/friends`, { headers:{ Authorization:`Bearer ${token}` } });
  return await r.json();
}
export async function getTop(scope){
  const r = await fetch(`${API}/top/${scope}`);
  return await r.json();
}
