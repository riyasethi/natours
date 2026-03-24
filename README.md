# Natours

Natours is a full-stack travel booking application built with Node.js, Express, MongoDB, and Pug. It includes authentication, tour browsing, protected routes, reviews, account management, and Stripe-based booking flow support.

## Features

-   User signup, login, logout, and password reset
-   Booking confirmation emails for newly booked tours
-   Tour listing and tour detail pages
-   Protected account page with profile/password updates
-   Role-based authorization
-   Review and booking models
-   Server-rendered Pug views
-   MongoDB Atlas-backed persistence
-   Built-in demo dataset for local setup and portfolio demos

## Tech Stack

-   Node.js
-   Express
-   MongoDB Atlas
-   Mongoose
-   Pug
-   JWT authentication
-   Stripe

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the `config.example.env` file to a local `config.env` file. Fill in your environment variables.
3. Start the app:

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

## Email Setup

Natours supports two email options:

- Gmail SMTP for local development
- Brevo API for deployment platforms like Render

### Gmail SMTP Setup

1. Turn on 2-Step Verification for your Google account.
2. Create a Google App Password for Mail.
3. Put the values in `config.env`:

```env
EMAIL_PROVIDER=smtp
EMAIL_USERNAME=your-gmail-address@gmail.com
EMAIL_PASSWORD=your-google-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_FROM=your-gmail-address@gmail.com
EMAIL_FROM_NAME=Riya Sethi
```

4. Restart the app after updating the password.

### Brevo API Setup

1. In Brevo, verify your sender email or domain.
2. Create an API key from your Brevo SMTP & API settings.
3. Put these values in `config.env` or your deployment environment:

```env
EMAIL_PROVIDER=brevo
EMAIL_FROM=your-verified-sender@example.com
EMAIL_FROM_NAME=Riya Sethi
BREVO_API_KEY=your-brevo-api-key
```

Brevo uses HTTPS, so it works on Render free where SMTP ports are blocked.
