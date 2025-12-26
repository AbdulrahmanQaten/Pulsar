# نشر Pulsar على Render

## الخطوات

### 1. إنشاء حساب على Render

اذهب إلى [render.com](https://render.com) وأنشئ حساب مجاني

### 2. إنشاء Web Service جديد

1. اضغط على "New +" → "Web Service"
2. اربط حساب GitHub الخاص بك
3. اختر مستودع Pulsar
4. اختر مجلد `backend` كـ Root Directory

### 3. إعدادات الخدمة

**Name**: `pulsar-backend` (أو أي اسم تريده)

**Environment**: `Node`

**Build Command**:

```bash
npm install
```

**Start Command**:

```bash
npm start
```

### 4. إضافة متغيرات البيئة

اضغط على "Environment" وأضف:

```
MONGODB_URI=mongodb+srv://rahmanqaten_db_user:Aa123Pulsar%3F%3F%3F@pulsar.m20p15y.mongodb.net/pulsar?retryWrites=true&w=majority&appName=pulsar
JWT_SECRET=pulsar-secret-key-2024-production-change-this
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.vercel.app
```

> **ملاحظة**: سنحدث `FRONTEND_URL` بعد نشر الواجهة الأمامية

### 5. انشر!

اضغط على "Create Web Service" وانتظر حتى يكتمل النشر (2-3 دقائق)

### 6. احصل على URL الخاص بك

بعد النشر، ستحصل على رابط مثل:

```
https://pulsar-backend-xxxx.onrender.com
```

احفظ هذا الرابط لاستخدامه في الواجهة الأمامية!

---

## ملاحظات مهمة

⚠️ **Free Tier**: الخدمة المجانية تنام بعد 15 دقيقة من عدم النشاط. أول طلب بعد النوم قد يستغرق 30-60 ثانية.

✅ **Auto Deploy**: كل push إلى GitHub سيؤدي إلى نشر تلقائي

🔒 **HTTPS**: Render يوفر HTTPS مجاناً
