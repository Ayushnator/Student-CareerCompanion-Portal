import Subject from '../models/Subject.js';

export const createSubject = async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    if (!name) return res.status(400).json({ status: 'error', message: 'Name is required' });
    const subject = await Subject.create({ name, description, tags });
    return res.status(201).json({ status: 'success', data: subject });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const listSubjects = async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q ? { name: { $regex: q, $options: 'i' } } : {};
    const subjects = await Subject.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ status: 'success', data: subjects });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ status: 'error', message: 'Subject not found' });
    return res.status(200).json({ status: 'success', data: subject });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { name, description, tags },
      { new: true }
    );
    if (!subject) return res.status(404).json({ status: 'error', message: 'Subject not found' });
    return res.status(200).json({ status: 'success', data: subject });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ status: 'error', message: 'Subject not found' });
    return res.status(200).json({ status: 'success', message: 'Subject deleted' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

