# MELORA ÇANTASI

موقع ويب فاخر لبيع الشنط النسائية.

## الميزات
- عرض المنتجات مع السعر والصورة
- تسجيل حساب جديد
- تسجيل دخول
- لوحة تحكم أدمن
- إدارة المنتجات
- تغيير اللغة (عربي / تركي)
- نظام مستخدمين (أدمن/مستخدم)
- تشفير كلمات المرور
- رسائل نجاح
- صفحة 404 مخصصة
- تصميم فاخر أبيض وذهبي
- متجاوب مع الموبايل

## التقنيات
- Backend: Python Flask
- Database: SQLite
- Frontend: HTML + CSS + Bootstrap
- Multi Language: Flask-Babel
- Authentication: Flask-Login
- Password Hashing: werkzeug.security

## التشغيل
1. تثبيت المتطلبات:
   ```bash
   pip install flask flask_sqlalchemy flask_login flask_babel
   ```
2. تشغيل التطبيق:
   ```bash
   python app.py
   ```

## ملاحظات
- أول حساب يتم إنشاؤه يكون أدمن تلقائياً.
- رفع الصور يتم في مجلد static/uploads.
- الشعار يجب وضعه في static/logo.png (استبدل الصورة حسب الحاجة).

## هيكل المشروع
```
melora_project/
│
├── app.py
├── models.py
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── admin_dashboard.html
│   ├── add_product.html
│   └── edit_product.html
│   └── 404.html
│
├── static/
│   ├── style.css
│   ├── logo.png
│   └── uploads/
│
└── database.db
```

## مثال منتجات
- شنطة يد جلد فاخر – 450 ₺
- شنطة كتف عصرية – 320 ₺
- شنطة سهرة ذهبية – 600 ₺

## مميزات احترافية إضافية (اختياري)
- سلة شراء
- نظام طلبات
- رفع صور متعددة
- فلترة حسب السعر
- بحث عن المنتجات

✨ MELORA ÇANTASI ✨
