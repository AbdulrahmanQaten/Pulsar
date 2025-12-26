import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    // الحصول على التوكن من الهيدر
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'الرجاء تسجيل الدخول' });
    }

    // التحقق من التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // البحث عن المستخدم
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'المستخدم غير موجود' });
    }

    // إرفاق المستخدم بالطلب
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'الرجاء تسجيل الدخول' });
  }
};

export default auth;
