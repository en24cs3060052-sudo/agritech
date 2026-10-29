import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api';
import { useAuth } from '../App';
import { t } from '../i18n';

const TIPS = ['Test your soil before every sowing season.', 'Water early in the morning to reduce evaporation.', 'Rotate crops to break pest cycles.', 'Check the forecast before spraying.', 'Keep records of every input you buy.'];

export default function Dashboard() {
  const { user } = useAuth();
  const [d, setD] = useState({ farms: [], crops: [], orders: [], alerts: [] });
  useEffect(() => {
    Promise.all(['farms', 'crops', 'orders', 'alerts'].map(k => api.get('/' + k).then(r => r.data).catch(() => [])))
      .then(([farms, crops, orders, alerts]) => setD({ farms, crops, orders, alerts }));
  }, []);
  const chart = d.crops.filter(c => c.nitrogen != null).map(c => ({ name: c.name, N: c.nitrogen, P: c.phosphorus, K: c.potassium }));
  return (
    <div className="container py-4">
      <h2>{t('welcome')}, {user.name}</h2>
      <div className="panel my-3"><strong>Tip of the day:</strong> {TIPS[new Date().getDate() % TIPS.length]}</div>
      <div className="row g-3 my-2">
        {[['Farms', d.farms.length], ['Crops', d.crops.length], ['Orders', d.orders.length]].map(([l, n]) => (
          <div className="col-4" key={l}><div className="panel"><div className="stat">{n}</div>{l}</div></div>))}
      </div>
      <div className="row g-3">
        <div className="col-lg-6"><div className="panel h-100"><h4>Soil nutrients by crop</h4>
          {chart.length ? <ResponsiveContainer width="100%" height={240}><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
            <Bar dataKey="N" fill="#1b6f6a" /><Bar dataKey="P" fill="#e07a1f" /><Bar dataKey="K" fill="#14213d" /></BarChart></ResponsiveContainer>
            : <p>Add soil readings to a crop to see nutrient levels here.</p>}</div></div>
        <div className="col-lg-6"><div className="panel h-100"><h4>{t('alerts')}</h4>
          {d.alerts.length === 0 ? <p>No active alerts.</p> : d.alerts.map(a => (
            <div key={a._id} className={`panel sev-${a.severity} mb-2 py-2`}><strong>{a.title}</strong> {a.crop && <small>({a.crop})</small>}<div>{a.message}</div></div>))}</div></div>
      </div>
    </div>
  );
}
