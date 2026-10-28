# Old backend commands (Courses API)

Run these commands in PowerShell from the project folder.

## Install

```powershell
Set-Location "C:\Users\xpress\OneDrive\Desktop\mtec\backend"
npm install
```

Make sure MongoDB is running and `backend\.env` has the settings below. Keep any existing `.env` values that are already correct; do not overwrite the file blindly.

```dotenv
PORT=5000
NODE_ENV=development
MONGO_URL=mongodb://127.0.0.1:27017/mtec_leads
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_NAME=MTEC Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-strong-password
STRIPE_CURRENCY=usd
```

Generate a random JWT secret in PowerShell, then copy its output into `JWT_SECRET` in `.env`:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Stripe keys are only needed for payment checkout and webhook functionality:

```dotenv
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

## Create the admin and initial categories

```powershell
Set-Location "C:\Users\xpress\OneDrive\Desktop\mtec\backend"
node database/seed.js
```

To also add the sample courses:

```powershell
node database/seed.js --sample
```

## Run the API

Development mode (auto-restarts on file changes):

```powershell
Set-Location "C:\Users\xpress\OneDrive\Desktop\mtec\backend"
npm run dev
```

Normal start:

```powershell
Set-Location "C:\Users\xpress\OneDrive\Desktop\mtec\backend"
npm start
```

The API listens on `http://localhost:5000`.

## Admin login

- Email: the value of `ADMIN_EMAIL` in `.env`
- Password: the value of `ADMIN_PASSWORD` in `.env`

The seed script creates the admin using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`. The seed script does not change the password of an admin account that already exists. Set a strong private password before running it.
