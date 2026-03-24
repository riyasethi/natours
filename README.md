# Natours

Natours is a full-stack travel booking application built with Node.js, Express, MongoDB, and Pug. It includes authentication, tour browsing, protected routes, reviews, account management, and Stripe-based booking flow support.

## Features

- User signup, login, logout, and password reset
- Booking confirmation emails for newly booked tours
- Tour listing and tour detail pages
- Protected account page with profile/password updates
- Role-based authorization
- Review and booking models
- Server-rendered Pug views
- MongoDB Atlas-backed persistence
- Built-in demo dataset for local setup and portfolio demos

## Tech Stack

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- Pug
- JWT authentication
- Stripe

## Local Setup

1. Install dependencies:

```bash
npm install
```

1. Copy the `config.example.env` file to a local `config.env` file.
2. Fill in your environment variables:

```env
NODE_ENV=development
PORT=3000
APP_URL=http://127.0.0.1:3000
DATABASE=mongodb+srv://natours-user:<PASSWORD>@cluster.mongodb.net/natours?retryWrites=true&w=majority&appName=natours
DATABASE_PASSWORD=your-db-password

JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

EMAIL_USERNAME=your-gmail-address@gmail.com
EMAIL_PASSWORD=your-google-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_FROM=your-gmail-address@gmail.com

STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLIC_KEY=your-stripe-publishable-key
```

1. Start the app:

```bash
npm start
```

## Stripe Test Setup

Use Stripe test mode for portfolio/demo bookings so no real money is charged.

1. Create or open your Stripe test account.
2. Copy your test secret key and test publishable key.
3. Add them to `config.env`:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_publishable_key
```

4. Restart the server after updating the keys.
5. Open any tour while logged in and click `Book tour now!`.
6. Use a Stripe test card such as:

```text
4242 4242 4242 4242
Any future expiry date
Any 3-digit CVC
Any ZIP/postcode
```

## Gmail SMTP Setup

Natours now uses SMTP environment variables in every environment, and this repo is configured for Gmail SMTP by default.

1. Turn on 2-Step Verification for your Google account.
2. Create a Google App Password for Mail.
3. Put the values in `config.env`:

```env
EMAIL_USERNAME=your-gmail-address@gmail.com
EMAIL_PASSWORD=your-google-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_FROM=your-gmail-address@gmail.com
```

4. Restart the app after updating the password.

For deployment, add the same values as environment variables on your hosting platform instead of committing them to Git.

## Deployment URL Setup

Set `APP_URL` to the public URL where the app is deployed.

Examples:

```env
APP_URL=http://127.0.0.1:3000
```

```env
APP_URL=https://your-app.onrender.com
```

Natours uses `APP_URL` for:
- welcome email links
- password reset email links
- booking confirmation links
- Stripe success/cancel redirects
