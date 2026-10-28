# تشغيل MTEC Leads

نفّذ الأوامر في PowerShell من جذر المشروع `mtec`. يحتاج المشروع إلى Node.js 18 أو أحدث، وإلى قاعدة MongoDB متاحة.

## تجهيز الإعدادات

تأكد أن `backend\.env` يحتوي على `MONGO_URL` صالح، وأن `JWT_SECRET` سلسلة عشوائية بطول 32 حرفًا على الأقل. لتوليد سر جديد:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

ضع الناتج في `JWT_SECRET` داخل `backend\.env`. اضبط `CLIENT_URL` على `http://localhost:5173` لمطابقة منفذ الواجهة الافتراضي، وعرّف `ADMIN_EMAIL` و`ADMIN_PASSWORD` لحساب الأدمن.

لا تستبدل ملف `.env` ولا تشاركه أو ترفعه إلى Git.

## تثبيت الاعتماديات

```powershell
cd .\backend
npm install
cd ..\frontend
npm install
```

## إنشاء حساب الأدمن وبيانات تجريبية

بعد ضبط إعدادات الباك إند، شغّل مرة واحدة:

```powershell
cd ..\backend
npm run seed
```

ينشئ حساب الأدمن من `ADMIN_EMAIL` و`ADMIN_PASSWORD` إذا لم يكن موجودًا، ويضيف بيانات عملاء تجريبية عندما لا توجد بيانات عملاء بالفعل. لا يغيّر كلمة مرور حساب موجود.

## تشغيل التطبيق

افتح نافذتي PowerShell.

في النافذة الأولى:

```powershell
cd C:\Users\xpress\OneDrive\Desktop\mtec\backend
npm run dev
```

في النافذة الثانية:

```powershell
cd C:\Users\xpress\OneDrive\Desktop\mtec\frontend
npm run dev
```

افتح `http://localhost:5173`. أوقف كل خادم باستخدام `Ctrl+C` في نافذته.

## أوامر إضافية

ابنِ الواجهة للإنتاج من مجلد `frontend`:

```powershell
npm run build
npm run preview
```

شغّل الباك إند دون إعادة تشغيل تلقائية من مجلد `backend`:

```powershell
npm start
```
