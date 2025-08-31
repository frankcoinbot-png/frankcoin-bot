import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFriends, getToken, getTop, init, sendTaps } from './api';
import Admin from './admin/Admin';

function useLang(){
  const [lng, setLng] = useState('en');
  useEffect(()=>{ document.documentElement.lang = lng; },[lng]);
  return [lng, setLng];
}

export default function App(){
  const { t } = useTranslation();
  const [tab, setTab] = useState('home');
  const [uid] = useState(Number(import.meta.env.VITE_BOT_USER_ID_FOR_DEV || 1001));
  const [token, setToken] = useState('');
  const [balance, setBalance] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const batchRef = useRef(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lng, setLng] = useLang();

  useEffect(() => { (async () => {
    const tk = await getToken(uid); setToken(tk);
    const data = await init(uid);
    setBalance(data?.profile?.coins ?? 0);
    setMultiplier(data?.multipliers?.tap ?? 1);
    setIsAdmin(Boolean(localStorage.getItem('admin')));
  })(); }, [uid]);

  useEffect(() => {
    const id = setInterval(async () => {
      const n = batchRef.current; if(!n || !token) return; batchRef.current = 0;
      const res = await sendTaps(token, n);
      setBalance(b => b + res.awarded);
    }, 900);
    return () => clearInterval(id);
  }, [token]);

  function onTap(){ batchRef.current += 1; }

  return (
    <div className="app">
      <header>FRANKCOIN</header>
      <nav>
        <button className={tab==='home'? 'active':''} onClick={()=>setTab('home')}>{t('nav.home')}</button>
        <button className={tab==='premium'? 'active':''} onClick={()=>setTab('premium')}>{t('nav.premium')}</button>
        <button className={tab==='friends'? 'active':''} onClick={()=>setTab('friends')}>{t('nav.friends')}</button>
        <button className={tab==='top'? 'active':''} onClick={()=>setTab('top')}>{t('nav.top')}</button>
        <button className={tab==='info'? 'active':''} onClick={()=>setTab('info')}>{t('nav.info')}</button>
        {isAdmin && <button className={tab==='admin'? 'active':''} onClick={()=>setTab('admin')}>Admin</button>}
        <select onChange={e=>setLng(e.target.value)} defaultValue={'en'}>
          <option value="en">EN</option>
          <option value="de">DE</option>
          <option value="uk">UK</option>
          <option value="ru">RU</option>
        </select>
      </nav>

      {tab==='home' && (
        <section className="screen home">
          <div className="stats">
            <div>{t('home.balance')}: {balance.toLocaleString()}</div>
            <div>{t('home.rate')}: x{multiplier}</div>
          </div>
          <button className="coin" onClick={onTap} aria-label="Tap to earn"/>
          <p className="hint">{t('home.tap')}</p>
        </section>
      )}

      {tab==='premium' && (
        <section className="screen premium">
          <h2>{t('premium.title')}</h2>
          <p>{t('premium.copy')}</p>
          <div className="card">
            <div className="price">4 TON / {t('premium.month')}</div>
            <ul>
              <li>×5 {t('premium.speed')}</li>
              <li>12h {t('premium.autoclick')}</li>
            </ul>
            <button onClick={()=>alert('Connect wallet via TonConnect UI in production')}>{t('premium.buy')}</button>
          </div>
        </section>
      )}

      {tab==='friends' && <Friends token={token} />}
      {tab==='top' && <Top />}
      {tab==='info' && (
        <section className="screen info">
          <h2>Information</h2>
          <p>Official channel:</p>
          <a href="https://t.me/frankcoin_bot_official" target="_blank">t.me/frankcoin_bot_official</a>
        </section>
      )}

      {tab==='admin' && <Admin onAuth={()=>setIsAdmin(true)} />}
    </div>
  );
}

function Friends({ token }){
  const { t } = useTranslation();
  const [link, setLink] = useState('');
  const [stats, setStats] = useState(null);
  useEffect(()=>{ (async()=>{ const r = await getFriends(token); setLink(r.link); setStats(r.stats); })(); }, [token]);
  return (
    <section className="screen friends">
      <h2>{t('friends.title')}</h2>
      <p>{t('friends.copy')}</p>
      <div className="ref">
        <input readOnly value={link} />
        <button onClick={()=>navigator.clipboard.writeText(link)}>{t('friends.copylink')}</button>
      </div>
      <div className="row">
        <div>{t('friends.invites')}: {stats?.invites ?? 0}</div>
        <div>{t('friends.earned')}: {(stats?.coins ?? 0).toLocaleString()}</div>
      </div>
    </section>
  );
}

function Top(){
  const { t } = useTranslation();
  const [scope, setScope] = useState('global');
  const [rows, setRows] = useState([]);
  useEffect(()=>{ (async()=>{ setRows(await getTop(scope)); })(); }, [scope]);
  return (
    <section className="screen top">
      <h2>{t('leaderboard.title')}</h2>
      <div className="tabs">
        <button className={scope==='global'?'active':''} onClick={()=>setScope('global')}>{t('top.global')}</button>
        <button className={scope==='weekly'?'active':''} onClick={()=>setScope('weekly')}>{t('top.weekly')}</button>
        <button className={scope==='today'?'active':''} onClick={()=>setScope('today')}>{t('top.today')}</button>
      </div>
      <ol>
        {rows.map((r,i)=> (
          <li key={r.tg_id}>{i+1}. @{r.username ?? r.tg_id} — {Number(r.score||0).toLocaleString()}</li>
        ))}
      </ol>
    </section>
  );
}
