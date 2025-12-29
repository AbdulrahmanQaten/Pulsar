import express from 'express';
import Post from '../models/Post.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// الحصول على جميع المنشورات (التغذية) مع pagination
router.get('/', async (req, res, next) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // 20 منشور لكل صفحة
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'username displayName avatar')
      .populate('comments.author', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination info
    const total = await Post.countDocuments();

    // Get current user ID from token if available
    let currentUserId = null;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
      } catch (err) {
        // Token invalid or expired, continue without user
      }
    }

    // تحويل البيانات للتوافق مع الواجهة الأمامية
    const formattedPosts = posts.map(post => ({
      id: post._id,
      author: {
        id: post.author._id,
        username: post.author.username,
        displayName: post.author.displayName,
        avatar: post.author.avatar,
      },
      content: post.content,
      image: post.image,
      createdAt: post.createdAt,
      likes: post.likes.length,
      comments: post.comments.length,
      reposts: post.reposts.length,
      isLiked: currentUserId ? post.likes.includes(currentUserId) : false,
    }));

    res.json({ 
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// الحصول على منشور واحد
router.get('/:id', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username displayName avatar')
      .populate('comments.author', 'username displayName avatar');

    if (!post) {
      return res.status(404).json({ error: 'المنشور غير موجود' });
    }

    // Get current user ID from token if available
    let currentUserId = null;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
      } catch (err) {
        // Token invalid or expired
      }
    }

    res.json({
      post: {
        id: post._id,
        author: {
          id: post.author._id,
          username: post.author.username,
          displayName: post.author.displayName,
          avatar: post.author.avatar,
        },
        content: post.content,
        image: post.image,
        createdAt: post.createdAt,
        likes: post.likes.length,
        comments: post.comments,
        reposts: post.reposts.length,
        isLiked: currentUserId ? post.likes.includes(currentUserId) : false,
      },
    });
  } catch (error) {
    next(error);
  }
});

// إنشاء منشور جديد
router.post('/', auth, async (req, res, next) => {
  try {
    const { content, image } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'محتوى المنشور مطلوب' });
    }

    const post = new Post({
      author: req.userId,
      content: content.trim(),
      image: image || '',
    });

    await post.save();
    await post.populate('author', 'username displayName avatar');

    res.status(201).json({
      message: 'تم إنشاء المنشور بنجاح',
      post: {
        id: post._id,
        author: {
          id: post.author._id,
          username: post.author.username,
          displayName: post.author.displayName,
          avatar: post.author.avatar,
        },
        content: post.content,
        image: post.image,
        createdAt: post.createdAt,
        likes: 0,
        comments: 0,
        reposts: 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// تحديث منشور
router.put('/:id', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'المنشور غير موجود' });
    }

    // التحقق من الملكية
    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'غير مصرح لك بتعديل هذا المنشور' });
    }

    const { content, image } = req.body;

    if (content) post.content = content.trim();
    if (image !== undefined) post.image = image;

    await post.save();
    await post.populate('author', 'username displayName avatar');

    res.json({
      message: 'تم تحديث المنشور بنجاح',
      post: {
        id: post._id,
        author: {
          id: post.author._id,
          username: post.author.username,
          displayName: post.author.displayName,
          avatar: post.author.avatar,
        },
        content: post.content,
        image: post.image,
        createdAt: post.createdAt,
        likes: post.likes.length,
        comments: post.comments.length,
        reposts: post.reposts.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// حذف منشور
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'المنشور غير موجود' });
    }

    // التحقق من الملكية
    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'غير مصرح لك بحذف هذا المنشور' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'تم حذف المنشور بنجاح' });
  } catch (error) {
    next(error);
  }
});

// إعجاب/إلغاء إعجاب
router.post('/:id/like', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'المنشور غير موجود' });
    }

    const likeIndex = post.likes.indexOf(req.userId);

    if (likeIndex > -1) {
      // إلغاء الإعجاب
      post.likes.splice(likeIndex, 1);
    } else {
      // إضافة إعجاب
      post.likes.push(req.userId);
    }

    await post.save();

    res.json({
      message: likeIndex > -1 ? 'تم إلغاء الإعجاب' : 'تم الإعجاب',
      likes: post.likes.length,
      isLiked: likeIndex === -1,
    });
  } catch (error) {
    next(error);
  }
});

// إضافة تعليق
router.post('/:id/comment', auth, async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'محتوى التعليق مطلوب' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'المنشور غير موجود' });
    }

    post.comments.push({
      author: req.userId,
      content: content.trim(),
    });

    await post.save();
    await post.populate('comments.author', 'username displayName avatar');

    res.status(201).json({
      message: 'تم إضافة التعليق بنجاح',
      comment: post.comments[post.comments.length - 1],
    });
  } catch (error) {
    next(error);
  }
});

// إضافة رد على تعليق
router.post('/:postId/comment/:commentId/reply', auth, async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'محتوى الرد مطلوب' });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: 'المنشور غير موجود' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: 'التعليق غير موجود' });
    }

    comment.replies.push({
      author: req.userId,
      content: content.trim(),
    });

    await post.save();
    await post.populate('comments.replies.author', 'username displayName avatar');

    res.status(201).json({
      message: 'تم إضافة الرد بنجاح',
      reply: comment.replies[comment.replies.length - 1],
    });
  } catch (error) {
    next(error);
  }
});

// إعجاب/إلغاء إعجاب على تعليق
router.post('/:postId/comment/:commentId/like', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: 'المنشور غير موجود' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: 'التعليق غير موجود' });
    }

    const likeIndex = comment.likes.indexOf(req.userId);
    const dislikeIndex = comment.dislikes.indexOf(req.userId);

    // إزالة dislike إذا كان موجوداً
    if (dislikeIndex > -1) {
      comment.dislikes.splice(dislikeIndex, 1);
    }

    if (likeIndex > -1) {
      // إلغاء الإعجاب
      comment.likes.splice(likeIndex, 1);
    } else {
      // إضافة إعجاب
      comment.likes.push(req.userId);
    }

    await post.save();

    res.json({
      message: likeIndex > -1 ? 'تم إلغاء الإعجاب' : 'تم الإعجاب',
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
    });
  } catch (error) {
    next(error);
  }
});

// عدم إعجاب/إلغاء عدم إعجاب على تعليق
router.post('/:postId/comment/:commentId/dislike', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: 'المنشور غير موجود' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: 'التعليق غير موجود' });
    }

    const likeIndex = comment.likes.indexOf(req.userId);
    const dislikeIndex = comment.dislikes.indexOf(req.userId);

    // إزالة like إذا كان موجوداً
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    }

    if (dislikeIndex > -1) {
      // إلغاء عدم الإعجاب
      comment.dislikes.splice(dislikeIndex, 1);
    } else {
      // إضافة عدم إعجاب
      comment.dislikes.push(req.userId);
    }

    await post.save();

    res.json({
      message: dislikeIndex > -1 ? 'تم إلغاء عدم الإعجاب' : 'تم عدم الإعجاب',
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
