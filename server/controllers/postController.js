import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

export const createPost = async (req, res) => {
  try {
    const { title, content, subjectId } = req.body;
    if (!title || !content) return res.status(400).json({ status: 'error', message: 'title and content are required' });
    
    const post = await Post.create({ 
      title, 
      content, 
      subject: subjectId, 
      author: req.user._id,
      authorName: req.user.name 
    });
    return res.status(201).json({ status: 'success', data: post });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const listPosts = async (req, res) => {
  try {
    const { subjectId } = req.query;
    const filter = subjectId ? { subject: subjectId } : {};
    const posts = await Post.find(filter).populate('subject', 'name').sort({ createdAt: -1 });
    return res.status(200).json({ status: 'success', data: posts });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('subject', 'name');
    if (!post) return res.status(404).json({ status: 'error', message: 'Post not found' });
    return res.status(200).json({ status: 'success', data: post });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { title, content, subjectId } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) return res.status(404).json({ status: 'error', message: 'Post not found' });
    
    const isAuthor = post.author && post.author.toString() === req.user._id.toString();
    const isAdminOrGuide = ['admin', 'guide'].includes(req.user.role);

    if (!isAuthor && !isAdminOrGuide) {
       return res.status(403).json({ status: 'error', message: 'Not authorized to update this post' });
    }
    
    post.title = title || post.title;
    post.content = content || post.content;
    post.subject = subjectId || post.subject;
    
    await post.save();
    return res.status(200).json({ status: 'success', data: post });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ status: 'error', message: 'Post not found' });

    const isAuthor = post.author && post.author.toString() === req.user._id.toString();
    const isAdminOrGuide = ['admin', 'guide'].includes(req.user.role);

    if (!isAuthor && !isAdminOrGuide) {
       return res.status(403).json({ status: 'error', message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ post: req.params.id });
    return res.status(200).json({ status: 'success', message: 'Post deleted' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ status: 'error', message: 'content is required' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ status: 'error', message: 'Post not found' });
    
    const comment = await Comment.create({ 
      post: req.params.id, 
      content, 
      author: req.user._id,
      authorName: req.user.name 
    });
    return res.status(201).json({ status: 'success', data: comment });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const listComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ status: 'error', message: 'Post not found' });
    const comments = await Comment.find({ post: req.params.id }).sort({ createdAt: -1 });
    return res.status(200).json({ status: 'success', data: comments });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ status: 'error', message: 'Comment not found' });
    
    const isAuthor = comment.author && comment.author.toString() === req.user._id.toString();
    const isAdminOrGuide = ['admin', 'guide'].includes(req.user.role);
    
    if (!isAuthor && !isAdminOrGuide) {
       return res.status(403).json({ status: 'error', message: 'Not authorized to delete this comment' });
    }
    
    await Comment.findByIdAndDelete(req.params.commentId);
    return res.status(200).json({ status: 'success', message: 'Comment deleted' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
