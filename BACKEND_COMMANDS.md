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
STRIPE_CURRENCY=egp
```

Generate a random JWT secret in PowerShell, then copy its output into `JWT_SECRET` in `.env`:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Stripe keys are needed for online checkout and payment confirmation:

```dotenv
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

Guest course access links are sent after a card payment is confirmed, or after an admin confirms a cash payment. Configure a Resend API key and a verified sender address:

```dotenv
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM="MTEC SkillUp <courses@your-verified-domain.com>"
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

## Render backend deployment

The frontend remains on Vercel; the Express backend runs as a Render web service. The root `render.yaml` defines the backend service, Frankfurt region, production environment, health check, and required environment variables.

1. In Render, choose **New > Blueprint** and connect this Git repository's `main` branch.
2. Select `render.yaml` at the repository root and create the `mtec-software-api-ywagdy59` service.
3. Enter the existing MongoDB Atlas URI for `MONGO_URL` in the Blueprint prompt. Render generates `JWT_SECRET`; do not commit either value.
4. After the service is live, open its **Connect > Outbound** panel. Add the listed outbound IP ranges to MongoDB Atlas **Network Access**. Render's ranges are shared and region-specific; keep the service in Frankfurt to use the matching ranges.
5. In the Vercel frontend project's Production Environment Variables, set `VITE_API_URL` to `https://mtec-software-api-ywagdy59.onrender.com/api`, then redeploy the frontend.

`CLIENT_URL` is set to the frontend's production domain in `render.yaml`. The backend binds to `0.0.0.0` and uses Render's `PORT`. Verify `/api/health`, `/api/course`, `/api/reviews`, and `/api/catogery` after deployment. The free Render service may sleep when idle and cold-start on the next request. Uploaded course videos need durable external storage; files written to a Render service's local filesystem are not persistent.

## Admin login

- Email: the value of `ADMIN_EMAIL` in `.env`
- Password: the value of `ADMIN_PASSWORD` in `.env`

The seed script creates the admin using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`. The seed script does not change the password of an admin account that already exists. Set a strong private password before running it.
