# تشغيل المشروع وبيانات الأدمن

نفّذ الأوامر في PowerShell. يحتاج المشروع إلى Node.js 18 أو أحدث، وإلى إمكانية الاتصال بقاعدة MongoDB المضبوطة في `backend\.env`.

## إعدادات مطلوبة قبل التشغيل

افتح `backend\.env` وتأكد من الآتي:

- أن `MONGO_URL` يشير إلى قاعدة بيانات متاحة.
- أن قيمة `JWT_SECRET` عشوائية وطولها 32 حرفًا على الأقل. لتوليد قيمة، نفّذ:

  ```powershell
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

  انسخ الناتج إلى `JWT_SECRET` في `backend\.env`.
- اجعل `CLIENT_URL` مساويًا تمامًا لـ `http://localhost:5173`، دون `/` في النهاية، حتى يسمح الـAPI بطلبات الواجهة.

لا تستبدل ملف `.env` الموجود ولا تشارك بياناته.

## أول تشغيل أو بعد تحديث الاعتماديات

من جذر المشروع:

```powershell
cd C:\Users\xpress\OneDrive\Desktop\mtec\backend
npm install
cd ..\frontend
npm install
```

## إنشاء حساب الأدمن

نفّذ مرة واحدة من مجلد الباك إند:

```powershell
cd C:\Users\xpress\OneDrive\Desktop\mtec\backend
npm run seed
```

ينشئ الأمر حساب الأدمن من `ADMIN_EMAIL` و`ADMIN_PASSWORD` في `backend\.env` إذا لم يكن موجودًا. إذا كان الحساب موجودًا مسبقًا، لن يغيّر كلمة مروره. ويضيف بيانات تجريبية للعملاء إذا كانت قاعدة البيانات لا تحتوي عليها.

## تشغيل المشروع

افتح نافذتي PowerShell واتركهما مفتوحتين.

**النافذة الأولى — الباك إند:**

```powershell
cd C:\Users\xpress\OneDrive\Desktop\mtec\backend
npm run dev
```

**النافذة الثانية — الواجهة:**

```powershell
cd C:\Users\xpress\OneDrive\Desktop\mtec\frontend
npm run dev
```

افتح `http://localhost:5173`. لإيقاف كل خادم اضغط `Ctrl+C` في نافذته.

## فحص تسجيل الدخول من PowerShell

بعد تشغيل الباك إند، نفّذ الأمر التالي وأدخل بريد الأدمن وكلمة مروره عند ظهور النافذة. لن يطبع الأمر رمز الدخول:

```powershell
$credential = Get-Credential -Message "أدخل بيانات الأدمن"
$password = [System.Net.NetworkCredential]::new("", $credential.Password).Password
$body = @{ email = $credential.UserName; password = $password } | ConvertTo-Json
$result = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/login" -ContentType "application/json" -Body $body
$result | Select-Object success, message, user
$password = $null
```

## بيانات الأدمن

بيانات تسجيل الدخول هي القيم المضبوطة في `ADMIN_EMAIL` و`ADMIN_PASSWORD` داخل `backend\.env`. لا يغيّر `npm run seed` كلمة مرور حساب موجود بالبريد نفسه. لا تضع بيانات الدخول في ملفات المشروع أو ترفع `.env` إلى Git.
