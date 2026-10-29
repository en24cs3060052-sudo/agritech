import React, { useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../App';
import { t } from '../i18n';

export default function Auth() {
  const { login } = useAuth();
  const [reg, setReg] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '', language: 'en' });
  const [err, setErr] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setErr('');
    try { const { data } = await api.post(reg ? '/auth/register' : '/auth/login', f); localStorage.setItem('lang', data.user.language || 'en'); login(data.token, data.user); }
    catch (x) { setErr(errMsg(x)); }
  };
  return (
    <div className="hero d-flex align-items-center">
      <div className="container py-5">
        <h1 className="display-4">Smarter decisions for every season.</h1>
        <p className="lead mb-4">AgriTech brings your fields, soil health, weather, pest alerts and expert help together, in English and हिन्दी.</p>
        <form onSubmit={submit}>
          {reg && <input className="form-control mb-2" placeholder="Full name" value={f.name} onChange={set('name')} required />}
          <input className="form-control mb-2" type="email" placeholder="Email" value={f.email} onChange={set('email')} required />
          <input className="form-control mb-2" type="password" placeholder="Password (6+ characters)" value={f.password} onChange={set('password')} required minLength={6} />
          {reg && <select className="form-select mb-2" value={f.language} onChange={set('language')}><option value="en">English</option><option value="hi">हिन्दी</option></select>}
          {err && <div className="alert alert-warning py-2" role="alert">{err}</div>}
          <button className="btn btn-warning me-2">{reg ? t('register') : t('login')}</button>
          <button type="button" className="btn btn-link text-white" onClick={() => setReg(!reg)}>{reg ? 'I already have an account' : 'New here? Create an account'}</button>
        </form>
      </div>
    </div>
  );
}
