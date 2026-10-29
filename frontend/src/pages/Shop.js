import React, { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';

export default function Shop() {
  const [res, setRes] = useState([]), [orders, setOrders] = useState([]), [qty, setQty] = useState({}), [msg, setMsg] = useState('');
  const load = useCallback(async () => { setRes((await api.get('/resources')).data); setOrders((await api.get('/orders')).data); }, []);
  useEffect(() => { load(); }, [load]);
  const order = async r => {
    try { await api.post('/orders', { resource: r._id, quantity: qty[r._id] || 1 }); setMsg(`Ordered ${r.name}`); load(); }
    catch (e) { setMsg(errMsg(e)); }
  };
  return (
    <div className="container py-4">
      <h2>Resources and orders</h2>
      {msg && <div className="alert alert-info">{msg}</div>}
      <div className="row g-3 mb-4">{res.map(r => (
        <div className="col-md-4" key={r._id}><div className="panel">
          <h5>{r.name}</h5><div>{r.category} · ₹{r.price} · {r.stock} in stock</div>
          <div className="d-flex gap-2 mt-2"><input type="number" min="1" className="form-control" style={{ width: 80 }} value={qty[r._id] || 1} onChange={e => setQty({ ...qty, [r._id]: e.target.value })} aria-label="Quantity" />
            <button className="btn btn-field" onClick={() => order(r)} disabled={!r.stock}>Order</button></div></div></div>))}
        {res.length === 0 && <p>No resources listed yet.</p>}</div>
      <h4>Order tracking</h4>
      <div className="table-responsive panel"><table className="table mb-0"><thead><tr><th>Item</th><th>Qty</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>{orders.map(o => <tr key={o._id}><td>{o.resourceName}</td><td>{o.quantity}</td><td>₹{o.total}</td><td>{o.status}</td></tr>)}</tbody></table></div>
    </div>
  );
}
