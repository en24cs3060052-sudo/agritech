import React, { useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { errMsg } from '../api';

export default function Weather() {
  const [city, setCity] = useState('Bhopal');
  const [w, setW] = useState(null);
  const [err, setErr] = useState('');
  const go = async e => { e?.preventDefault(); setErr(''); try { setW((await api.get('/weather', { params: { city } })).data); } catch (x) { setErr(errMsg(x)); } };
  return (
    <div className="container py-4">
      <h2>Weather and field advice</h2>
      <form className="d-flex gap-2 mb-3" onSubmit={go}>
        <input className="form-control w-auto" value={city} onChange={e => setCity(e.target.value)} aria-label="City" />
        <button className="btn btn-field">Get forecast</button>
      </form>
      {err && <div className="alert alert-warning">{err}</div>}
      {w && <div className="panel">
        <h3>{w.city}: {Math.round(w.temp)}°C, {w.condition}</h3>
        <p>Humidity {w.humidity}% · Wind {w.wind} m/s</p>
        <p><strong>{w.advice}</strong></p>
        {w.sample && <p className="small text-muted">Showing sample data. Add OPENWEATHER_KEY on the server for live forecasts.</p>}
        <ResponsiveContainer width="100%" height={220}><LineChart data={w.forecast}><XAxis dataKey="day" /><YAxis unit="°" /><Tooltip /><Line dataKey="temp" stroke="#1b6f6a" strokeWidth={2} /></LineChart></ResponsiveContainer>
      </div>}
    </div>
  );
}
