import React, { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../App';

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]), [f, setF] = useState({ title: '', body: '', type: 'forum' }), [reply, setReply] = useState({}), [err, setErr] = useState('');
  const load = useCallback(async () => setPosts((await api.get('/posts')).data), []);
  useEffect(() => { load(); }, [load]);
  const post = async e => { e.preventDefault(); try { await api.post('/posts', f); setF({ title: '', body: '', type: 'forum' }); load(); } catch (x) { setErr(errMsg(x)); } };
  const send = async id => { if (!reply[id]) return; await api.post(`/posts/${id}/reply`, { text: reply[id] }); setReply({ ...reply, [id]: '' }); load(); };
  const del = async id => { await api.delete('/posts/' + id).catch(x => setErr(errMsg(x))); load(); };
  return (
    <div className="container py-4">
      <h2>Experts and community</h2>
      {err && <div className="alert alert-warning">{err}</div>}
      <form className="panel mb-4" onSubmit={post}>
        <select className="form-select mb-2 w-auto" value={f.type} onChange={e => setF({ ...f, type: e.target.value })}><option value="forum">Community discussion</option><option value="question">Ask an expert</option></select>
        <input className="form-control mb-2" placeholder="Title" required value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
        <textarea className="form-control mb-2" rows="2" placeholder="Describe your question or topic" value={f.body} onChange={e => setF({ ...f, body: e.target.value })} />
        <button className="btn btn-field">Post</button>
      </form>
      {posts.map(p => (
        <div className="panel mb-3" key={p._id}>
          <div className="d-flex justify-content-between"><h5>{p.title} <span className="badge bg-secondary">{p.type === 'question' ? 'Expert question' : 'Discussion'}</span></h5>
            {(user.role === 'admin' || p.owner === user.id) && <button className="btn btn-sm btn-outline-danger" onClick={() => del(p._id)}>Delete</button>}</div>
          <small>by {p.authorName}</small><p>{p.body}</p>
          {p.replies.map((r, i) => <div key={i} className="border-start ps-2 mb-1"><strong>{r.authorName}:</strong> {r.text}</div>)}
          <div className="d-flex gap-2 mt-2"><input className="form-control" placeholder="Write a reply" value={reply[p._id] || ''} onChange={e => setReply({ ...reply, [p._id]: e.target.value })} />
            <button className="btn btn-outline-success" onClick={() => send(p._id)}>Reply</button></div>
        </div>))}
      {posts.length === 0 && <p>No posts yet. Start the first discussion above.</p>}
    </div>
  );
}
