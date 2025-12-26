const errorHandler = (err, req, res, next) => {
  console.error('❌ خطأ:', err.message);

  // خطأ MongoDB - تكرار قيمة فريدة
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = field === 'email' 
      ? 'البريد الإلكتروني مستخدم بالفعل' 
      : 'اسم المستخدم مستخدم بالفعل';
    return res.status(400).json({ error: message });
  }

  // خطأ التحقق من البيانات
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: messages[0] });
  }

  // خطأ JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'رمز غير صالح' });
  }

  // خطأ عام
  res.status(err.status || 500).json({
    error: err.message || 'حدث خطأ في الخادم',
  });
};

export default errorHandler;
