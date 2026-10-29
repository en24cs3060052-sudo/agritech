const express = require('express');
const crud = require('./crud');
const { auth, adminOnly, wrap } = require('../middleware');
const M = require('../models');

// Soil analysis from pH / N / P / K readings
const soilReport = c => {
  const t = [];
  if (c.ph != null && c.ph !== '') t.push(c.ph < 6 ? 'Soil is acidic: add lime.' : c.ph > 7.5 ? 'Soil is alkaline: add gypsum or organic matter.' : 'pH is in the ideal range.');
  if (c.nitrogen !== undefined && c.nitrogen !== '' && c.nitrogen < 280) t.push('Low nitrogen: apply urea or compost.');
  if (c.phosphorus !== undefined && c.phosphorus !== '' && c.phosphorus < 11) t.push('Low phosphorus: apply DAP or SSP.');
  if (c.potassium !== undefined && c.potassium !== '' && c.potassium < 120) t.push('Low potassium: apply MOP.');
  return t.join(' ') || 'No soil readings entered yet.';
};
const farms = crud(M.Farm);
const crops = crud(M.Crop, { populate: 'farm', beforeSave: d => ({ ...d, soilReport: soilReport(d) }) });

// Alerts and resources: everyone reads, only admin writes
const adminManaged = Model => {
  const r = express.Router();
  r.use(auth);
  r.get('/', wrap(async (q, s) => s.json(await Model.find().sort('-createdAt'))));
  r.post('/', adminOnly, wrap(async (q, s) => s.status(201).json(await Model.create(q.body))));
  r.put('/:id', adminOnly, wrap(async (q, s) => s.json(await Model.findByIdAndUpdate(q.params.id, q.body, { new: true, runValidators: true }))));
  r.delete('/:id', adminOnly, wrap(async (q, s) => { await Model.findByIdAndDelete(q.params.id); s.json({ ok: true }); }));
  return r;
};

// Orders: farmer places, admin updates status
const orders = express.Router();
orders.use(auth);
orders.get('/', wrap(async (q, s) => s.json(await M.Order.find(q.user.role === 'admin' ? {} : { owner: q.user.id }).populate('owner', 'name').sort('-createdAt'))));
orders.post('/', wrap(async (q, s) => {
  const item = await M.Resource.findById(q.body.resource);
  const qty = Number(q.body.quantity);
  if (!item || !(qty >= 1)) return s.status(400).json({ message: 'Choose a resource and quantity' });
  if (item.stock < qty) return s.status(400).json({ message: 'Not enough stock' });
  item.stock -= qty; await item.save();
  s.status(201).json(await M.Order.create({ owner: q.user.id, resource: item._id, resourceName: item.name, quantity: qty, total: qty * item.price }));
}));
orders.put('/:id', adminOnly, wrap(async (q, s) => s.json(await M.Order.findByIdAndUpdate(q.params.id, { status: q.body.status }, { new: true, runValidators: true }))));

// Expert consultation and community forum
const posts = express.Router();
posts.use(auth);
posts.get('/', wrap(async (q, s) => s.json(await M.Post.find().sort('-createdAt'))));
posts.post('/', wrap(async (q, s) => s.status(201).json(await M.Post.create({ title: q.body.title, body: q.body.body, type: q.body.type, owner: q.user.id, authorName: q.user.name }))));
posts.post('/:id/reply', wrap(async (q, s) => s.json(await M.Post.findByIdAndUpdate(q.params.id, { $push: { replies: { authorName: q.user.name + (q.user.role === 'admin' ? ' (Expert)' : ''), text: q.body.text } } }, { new: true }))));
posts.delete('/:id', wrap(async (q, s) => {
  const p = await M.Post.findById(q.params.id);
  if (!p) return s.status(404).json({ message: 'Not found' });
  if (q.user.role !== 'admin' && String(p.owner) !== q.user.id) return s.status(403).json({ message: 'Not allowed' });
  await p.deleteOne(); s.json({ ok: true });
}));

// Weather: live from OpenWeather if a key is set, otherwise sample data. Saved to WeatherData.
const weather = express.Router();
weather.get('/', auth, wrap(async (q, s) => {
  const city = q.query.city || 'Bhopal';
  let data;
  const key = process.env.OPENWEATHER_KEY;
  if (key) {
    try {
      const j = await (await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${key}`)).json();
      if (j.list) data = { city, temp: j.list[0].main.temp, humidity: j.list[0].main.humidity, wind: j.list[0].wind.speed, condition: j.list[0].weather[0].main, forecast: j.list.filter((_, i) => i % 8 === 0).map(x => ({ day: x.dt_txt.slice(0, 10), temp: x.main.temp, rain: x.pop })) };
    } catch (e) { console.error('Weather API failed:', e.message); }
  }
  const sample = !data;
  if (!data) data = { city, temp: 31, humidity: 58, wind: 3.4, condition: 'Partly cloudy', forecast: [30, 32, 29, 27, 28].map((t, i) => ({ day: `Day ${i + 1}`, temp: t, rain: [0.1, 0.2, 0.7, 0.6, 0.1][i] })) };
  await M.WeatherData.create(data);
  const advice = data.forecast.some(f => f.rain > 0.5) ? 'Rain expected soon: postpone spraying and irrigation.' : data.temp > 35 ? 'Heat alert: irrigate early morning or evening.' : 'Good conditions for field work.';
  s.json({ ...data, advice, sample });
}));

// Admin dashboard
const admin = express.Router();
admin.use(auth, adminOnly);
admin.get('/stats', wrap(async (q, s) => {
  const [users, farms, crops, orders, posts] = await Promise.all([M.User, M.Farm, M.Crop, M.Order, M.Post].map(x => x.countDocuments()));
  s.json({ users, farms, crops, orders, posts });
}));
admin.get('/users', wrap(async (q, s) => s.json(await M.User.find().select('-password').sort('-createdAt'))));
admin.delete('/users/:id', wrap(async (q, s) => {
  if (q.params.id === q.user.id) return s.status(400).json({ message: 'You cannot delete yourself' });
  await M.User.findByIdAndDelete(q.params.id); s.json({ ok: true });
}));

module.exports = { farms, crops, alerts: adminManaged(M.Alert), resources: adminManaged(M.Resource), orders, posts, weather, admin };
