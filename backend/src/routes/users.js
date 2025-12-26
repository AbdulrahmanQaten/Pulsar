import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// الحصول على ملف المستخدم
router.get('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    // Check if current user is following this user
    let isFollowing = false;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.userId);
        if (currentUser) {
          isFollowing = currentUser.following.includes(user._id);
        }
      } catch (err) {
        // Token invalid, continue without auth
      }
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        createdAt: user.createdAt,
        isFollowing,
      },
    });
  } catch (error) {
    next(error);
  }
});

// تحديث الملف الشخصي
router.put('/profile', auth, async (req, res, next) => {
  try {
    const { displayName, bio, location, avatar } = req.body;

    const user = await User.findById(req.userId);

    if (displayName) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
      },
    });
  } catch (error) {
    next(error);
  }
});

// متابعة/إلغاء متابعة مستخدم
router.post('/:id/follow', auth, async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.userId.toString()) {
      return res.status(400).json({ error: 'لا يمكنك متابعة نفسك' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(req.userId);

    if (!targetUser) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // إلغاء المتابعة
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== targetUserId
      );
      targetUser.followers = targetUser.followers.filter(
        id => id.toString() !== req.userId.toString()
      );
    } else {
      // متابعة
      currentUser.following.push(targetUserId);
      targetUser.followers.push(req.userId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: isFollowing ? 'تم إلغاء المتابعة' : 'تم المتابعة',
      isFollowing: !isFollowing,
    });
  } catch (error) {
    next(error);
  }
});

// الحصول على المتابعين
router.get('/:id/followers', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'followers',
      'username displayName avatar'
    );

    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    res.json({
      followers: user.followers.map(f => ({
        id: f._id,
        username: f.username,
        displayName: f.displayName,
        avatar: f.avatar,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// الحصول على المتابَعين
router.get('/:id/following', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'following',
      'username displayName avatar'
    );

    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    res.json({
      following: user.following.map(f => ({
        id: f._id,
        username: f.username,
        displayName: f.displayName,
        avatar: f.avatar,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// الحصول على منشورات المستخدم
router.get('/:username/posts', async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    const posts = await Post.find({ author: user._id })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 });

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
    }));

    res.json({ posts: formattedPosts });
  } catch (error) {
    next(error);
  }
});

export default router;
