'use client';
import { useState, type FormEvent } from 'react';
export default function OwnerLogin() {
  const [role,setRole] = useState('owner'); const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await fetch('/api/owner-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, email: form.get('email'), password: form.get('password') }) });
      if (!result.ok) { const data = await result.json(); throw new Error(data.error); }
      window.location.assign(role === 'owner' ? '/dashboard' : '/' + role + '-workspace');
    } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); setBusy(false); }
  }
  return <main className="owner-login owner"><section className="login-story"><a href="/" className="owner-brand"><img src="/brand/parichayam.svg" alt="" />Parichayam <em>Café</em></a><span className="owner-kicker">THE OWNER’S DESK</span><h1>A little perspective.<br />A better <em>tomorrow.</em></h1><p>Behind every memorable café is a thousand thoughtful decisions. Make yours here.</p><img className="login-food" src="/media/hero.webp" alt="Pizza and coffee at Parichayam Café" /><small>GOOD FOOD. GOOD COMPANY. GOOD BUSINESS.</small></section><section className="login-form"><span className="owner-kicker">WELCOME BACK</span><h2>Your café, at a glance.</h2><p>Choose your role to sign in.</p><div className="period-tabs" style={{marginBottom:24}}>{[['owner','Admin (Owner)'],['staff','Staff'],['developer','Developer']].map(([value,label])=><button key={value} type="button" aria-pressed={role===value} className={role===value?'selected':''} onClick={()=>{setRole(value);setError('');}}>{label}</button>)}</div><form key={role} onSubmit={login}><label>Email address<input name="email" type="email" autoComplete="username" required placeholder="owner@parichayam.cafe" /></label><label>Password<input name="password" type="password" autoComplete="current-password" required placeholder="Enter your password" /></label>{error && <p role="alert" className="owner-error">{error}</p>}<button className="owner-primary" disabled={busy}>{busy ? 'Opening your desk…' : 'Login'} <span>↗</span></button></form><div className="demo-login"><strong>Explore the demo</strong><p>Email: {role}@parichayam.cafe<br />Password: {role==='owner'?'Parichayam@2026':role==='staff'?'Staff@2026':'Developer@2026'}</p><small>Sample business data. These shared credentials are for preview only.</small></div><a href="/">← Back to the café</a></section></main>;
}
