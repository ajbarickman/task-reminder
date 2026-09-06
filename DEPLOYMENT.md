# Deployment & Setup Guide: FamilyTask

This guide walks you through testing the app locally, configuring Google OAuth for you and your son, and deploying to **Vercel** with **Vercel Postgres**.

---

## 1. Running & Testing Locally

The development server is currently running at:
👉 **[http://localhost:3000](http://localhost:3000)**

You can open this URL on your browser to test:
* **Parent View:** Add chores, homework, and test reminders.
* **Son's View:** Experience the interactive mobile checklist with confetti animations when completing tasks.
* **Phone Mode Switcher:** Toggle between Parent and Son views with one click.

---

## 2. Setting Up Google Login (OAuth)

To allow both you and your son to sign in with your Google accounts:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `Family Task Reminder`).
3. Navigate to **APIs & Services > Credentials**.
4. Click **Create Credentials > OAuth client ID**.
5. Set Application type to **Web application**.
6. Under **Authorized redirect URIs**, add:
   * For local testing: `http://localhost:3000/api/auth/callback/google`
   * For production (after deploying to Vercel): `https://<your-vercel-domain>.vercel.app/api/auth/callback/google`
7. Copy the **Client ID** and **Client Secret**.
8. Paste them into your `.env.local` file:
   ```env
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   AUTH_SECRET="any-random-string-or-key"
   ```

---

## 3. Deploying to Vercel with Vercel Postgres

Deploying to Vercel is seamless:

### Step 1: Push to GitHub
1. In the Antigravity IDE terminal, initialize git (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Family Task Reminder App"
   ```
2. Push this repository to your GitHub account.

### Step 2: Import into Vercel
1. Go to [vercel.com](https://vercel.com) and click **Add New > Project**.
2. Select your `task-reminder` repository and click **Import**.

### Step 3: Add Vercel Postgres
1. In your Vercel project dashboard, go to the **Storage** tab.
2. Click **Create Database** and choose **Postgres**.
3. Accept the default name (e.g., `verceldb`) and click **Create**.
4. Connect the database to your project. Vercel will automatically populate:
   * `POSTGRES_PRISMA_URL`
   * `POSTGRES_URL_NON_POOLING`
   * Other database credentials

### Step 4: Add Authentication & Twilio Environment Variables
In your Vercel Project Settings > **Environment Variables**, add:
* `AUTH_SECRET`: A random 32-character string
* `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
* `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
* `NEXTAUTH_URL`: `https://<your-vercel-project-name>.vercel.app`
* `TWILIO_ACCOUNT_SID`: Your Twilio Account SID (optional, for SMS)
* `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token (optional, for SMS)
* `TWILIO_PHONE_NUMBER`: Your Twilio phone number (e.g., `+15551234567`)

### Step 5: Initialize the Postgres Database Tables
Run the database push command once to create the tables in your live Vercel Postgres:
```bash
npx prisma db push
```

---

## 4. How Your Son Installs It on His iPhone Home Screen

1. On your son's iPhone, open Safari and go to your Vercel URL (e.g. `https://your-app.vercel.app`).
2. Tap the **Share** button (the square with an arrow pointing up at the bottom of Safari).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top right corner.
5. The **FamilyTask** icon will now appear on his iPhone home screen just like a regular App Store app! When tapped, it opens in full screen without the browser URL bar.

