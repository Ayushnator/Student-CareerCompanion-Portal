import Resource from '../models/Resource.js';

export const createResource = async (req, res) => {
  try {
    const { subjectId, title, type, url, description } = req.body;
    if (!subjectId || !title || !type || !url) {
      return res.status(400).json({ status: 'error', message: 'subjectId, title, type, url are required' });
    }
    const resource = await Resource.create({ subject: subjectId, title, type, url, description });
    return res.status(201).json({ status: 'success', data: resource });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const listResources = async (req, res) => {
  try {
    const { subjectId, type } = req.query;
    const filter = {};
    if (subjectId) filter.subject = subjectId;
    if (type) filter.type = type;
    const resources = await Resource.find(filter).populate('subject', 'name').sort({ createdAt: -1 });
    return res.status(200).json({ status: 'success', data: resources });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('subject', 'name');
    if (!resource) return res.status(404).json({ status: 'error', message: 'Resource not found' });
    return res.status(200).json({ status: 'success', data: resource });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const updateResource = async (req, res) => {
  try {
    const { subjectId, title, type, url, description } = req.body;
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { subject: subjectId, title, type, url, description },
      { new: true }
    );
    if (!resource) return res.status(404).json({ status: 'error', message: 'Resource not found' });
    return res.status(200).json({ status: 'success', data: resource });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ status: 'error', message: 'Resource not found' });
    return res.status(200).json({ status: 'success', message: 'Resource deleted' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

