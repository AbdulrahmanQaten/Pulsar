import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// تسجيل مستخدم جديد
router.post('/register', async (req, res, next) => {
  try {
    const { email, username, displayName, password } = req.body;

    // التحقق من البيانات
    if (!email || !username || !displayName || !password) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const user = new User({
      email,
      username,
      displayName,
      password: hashedPassword,
    });

    await user.save();

    // إنشاء التوكن
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      message: 'تم التسجيل بنجاح',
      token,
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

// تسجيل الدخول
router.post('/login', async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    // البحث عن المستخدم بالبريد أو اسم المستخدم
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(401).json({ error: 'البريد/اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'البريد/اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    // إنشاء التوكن
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
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

// الحصول على المستخدم الحالي
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      username: req.user.username,
      displayName: req.user.displayName,
      avatar: req.user.avatar,
      bio: req.user.bio,
      location: req.user.location,
    },
  });
});

export default router;
