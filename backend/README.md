# Pulsar Backend API

Backend API لمنصة Pulsar للتواصل الاجتماعي.

## التقنيات المستخدمة

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT للمصادقة
- bcryptjs لتشفير كلمات المرور

## التثبيت والتشغيل

```bash
# تثبيت الحزم
npm install

# تشغيل الخادم في وضع التطوير
npm run dev

# تشغيل الخادم في وضع الإنتاج
npm start
```

## متغيرات البيئة

أنشئ ملف `.env` في المجلد الرئيسي:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## نقاط النهاية (API Endpoints)

### المصادقة

- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/me` - الحصول على المستخدم الحالي (يتطلب مصادقة)

### المنشورات

- `GET /api/posts` - الحصول على جميع المنشورات
- `GET /api/posts/:id` - الحصول على منشور واحد
- `POST /api/posts` - إنشاء منشور (يتطلب مصادقة)
- `PUT /api/posts/:id` - تحديث منشور (يتطلب مصادقة)
- `DELETE /api/posts/:id` - حذف منشور (يتطلب مصادقة)
- `POST /api/posts/:id/like` - إعجاب/إلغاء إعجاب (يتطلب مصادقة)
- `POST /api/posts/:id/comment` - إضافة تعليق (يتطلب مصادقة)

### المستخدمين

- `GET /api/users/:username` - الحصول على ملف المستخدم
- `PUT /api/users/profile` - تحديث الملف الشخصي (يتطلب مصادقة)
- `POST /api/users/:id/follow` - متابعة/إلغاء متابعة (يتطلب مصادقة)
- `GET /api/users/:id/followers` - الحصول على المتابعين
- `GET /api/users/:id/following` - الحصول على المتابَعين
- `GET /api/users/:username/posts` - الحصول على منشورات المستخدم

## المصادقة

استخدم JWT Token في الهيدر:

```
Authorization: Bearer YOUR_TOKEN_HERE
```
