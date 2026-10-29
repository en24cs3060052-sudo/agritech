// Generic CRUD: farmers see/edit only their own records, admins see all.
const express = require('express');
const { auth, wrap } = require('../middleware');
module.exports = (Model, { populate = '', beforeSave = d => d } = {}) => {
  const router = express.Router();
  const scope = req => req.user.role === 'admin' ? {} : { owner: req.user.id };
  router.use(auth);
  router.get('/', wrap(async (req, res) => res.json(await Model.find(scope(req)).populate(populate).sort('-createdAt'))));
  router.post('/', wrap(async (req, res) => res.status(201).json(await Model.create(beforeSave({ ...req.body, owner: req.user.id })))));
  router.put('/:id', wrap(async (req, res) => {
    const { owner, ...body } = req.body;
    const doc = await Model.findOneAndUpdate({ _id: req.params.id, ...scope(req) }, beforeSave(body), { new: true, runValidators: true });
    doc ? res.json(doc) : res.status(404).json({ message: 'Not found' });
  }));
  router.delete('/:id', wrap(async (req, res) => {
    const doc = await Model.findOneAndDelete({ _id: req.params.id, ...scope(req) });
    doc ? res.json({ ok: true }) : res.status(404).json({ message: 'Not found' });
  }));
  return router;
};
