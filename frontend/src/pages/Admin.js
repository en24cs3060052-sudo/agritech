import React, { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import Crud from './Crud';

export default function Admin() {
  const [stats, setStats] = useState({}), [users, setUsers] = useState([]), [orders, setOrders] = useState([]), [err, setErr] = useState('');
  const load = useCallback(async () => {
    setStats((await api.get('/admin/stats')).data); setUsers((await api.get('/admin/users')).data); setOrders((await api.get('/orders')).data);
  }, []);
  useEffect(() => { load(); }, [load]);
  const status = async (id, s) => { await api.put('/orders/' + id, { status: s }).catch(x => setErr(errMsg(x))); load(); };
  const rm = async id => { if (window.confirm('Remove this user?')) { await api.delete('/admin/users/' + id).catch(x => setErr(errMsg(x))); load(); } };
  return (
    <div className="container py-4">
      <h2>Admin dashboard</h2>
      {err && <div className="alert alert-warning">{err}</div>}
      <div className="row g-3 mb-4">{Object.entries(stats).map(([k, v]) => <div className="col-6 col-md" key={k}><div className="panel"><div className="stat">{v}</div>{k}</div></div>)}</div>
      <h4>Order approvals</h4>
      <div className="table-responsive panel mb-4"><table className="table mb-0"><thead><tr><th>Farmer</th><th>Item</th><th>Qty</th><th>Status</th></tr></thead>
        <tbody>{orders.map(o => <tr key={o._id}><td>{o.owner?.name}</td><td>{o.resourceName}</td><td>{o.quantity}</td>
          <td><select className="form-select form-select-sm" value={o.status} onChange={e => status(o._id, e.target.value)}>{['placed', 'approved', 'shipped', 'delivered', 'rejected'].map(s => <option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table></div>
      <h4>Users</h4>
      <div className="table-responsive panel"><table className="table mb-0"><tbody>{users.map(u => <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
        <td><button className="btn btn-sm btn-outline-danger" onClick={() => rm(u._id)}>Remove</button></td></tr>)}</tbody></table></div>
      <Crud embedded title="Pest alerts" endpoint="alerts" columns={['title', 'crop', 'severity', 'message']}
        fields={[{ name: 'title', label: 'Title', required: true }, { name: 'crop', label: 'Crop' }, { name: 'severity', label: 'Severity', type: 'select', options: ['low', 'medium', 'high'] }, { name: 'message', label: 'Message' }]} />
      <Crud embedded title="Resource catalogue" endpoint="resources" columns={['name', 'category', 'price', 'stock']}
        fields={[{ name: 'name', label: 'Name', required: true }, { name: 'category', label: 'Category' }, { name: 'price', label: 'Price (₹)', type: 'number', required: true }, { name: 'stock', label: 'Stock', type: 'number' }]} />
    </div>
  );
}
