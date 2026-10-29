import React, { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { t } from '../i18n';

const get = (o, p) => p.split('.').reduce((a, k) => a?.[k], o);
const empty = fields => Object.fromEntries(fields.map(f => [f.name, '']));

// Generic list + form used for farms, crops, alerts and resources
export default function Crud({ title, endpoint, fields, columns, embedded }) {
  const [items, setItems] = useState([]);
  const [opts, setOpts] = useState({});
  const [form, setForm] = useState(empty(fields));
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState('');
  const load = useCallback(() => api.get('/' + endpoint).then(r => setItems(r.data)).catch(e => setErr(errMsg(e))), [endpoint]);

  useEffect(() => {
    load();
    fields.filter(f => f.from).forEach(f => api.get('/' + f.from).then(r => setOpts(o => ({ ...o, [f.name]: r.data }))));
  }, [load]); // eslint-disable-line

  const reset = () => { setForm(empty(fields)); setEditing(null); };
  const submit = async e => {
    e.preventDefault(); setErr('');
    const body = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''));
    try { editing ? await api.put(`/${endpoint}/${editing}`, body) : await api.post('/' + endpoint, body); reset(); load(); }
    catch (x) { setErr(errMsg(x)); }
  };
  const edit = it => {
    setEditing(it._id);
    setForm(Object.fromEntries(fields.map(f => { const v = it[f.name]; return [f.name, v && typeof v === 'object' ? v._id : f.type === 'date' && v ? v.slice(0, 10) : v ?? '']; })));
  };
  const del = async id => { if (window.confirm('Delete this record?')) { await api.delete(`/${endpoint}/${id}`).catch(x => setErr(errMsg(x))); load(); } };

  return (
    <div className={embedded ? 'mt-4' : 'container py-4'}>
      <h2>{title}</h2>
      {err && <div className="alert alert-warning" role="alert">{err}</div>}
      <form className="panel row g-2 mb-4" onSubmit={submit}>
        {fields.map(f => (
          <div className="col-md-3" key={f.name}>
            <label className="form-label small mb-0">{f.label}</label>
            {f.type === 'select'
              ? <select className="form-select" required={f.required} value={form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.value })}>
                  <option value="">Select</option>
                  {f.from ? (opts[f.name] || []).map(o => <option key={o._id} value={o._id}>{o.name}</option>) : f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              : <input className="form-control" type={f.type || 'text'} step="any" required={f.required} value={form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.value })} />}
          </div>
        ))}
        <div className="col-12">
          <button className="btn btn-field me-2">{editing ? t('save') : t('add')}</button>
          {editing && <button type="button" className="btn btn-outline-secondary" onClick={reset}>{t('cancel')}</button>}
        </div>
      </form>
      {items.length === 0 ? <p>Nothing here yet. Use the form above to add your first record.</p> :
        <div className="table-responsive panel"><table className="table align-middle mb-0">
          <thead><tr>{columns.map(c => <th key={c}>{c.split('.')[0]}</th>)}<th /></tr></thead>
          <tbody>{items.map(it => (
            <tr key={it._id}>{columns.map(c => <td key={c}>{String(get(it, c) ?? '')}</td>)}
              <td className="text-nowrap"><button className="btn btn-sm btn-outline-success me-1" onClick={() => edit(it)}>{t('edit')}</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => del(it._id)}>{t('delete')}</button></td></tr>))}
          </tbody></table></div>}
    </div>
  );
}
