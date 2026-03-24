const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Riya Sethi <${process.env.EMAIL_FROM}>`;
        this.data = {};
    }

    usesBrevo() {
        return process.env.EMAIL_PROVIDER === 'brevo' || Boolean(process.env.BREVO_API_KEY);
    }

    newTransport() {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async sendWithBrevo(mailOptions) {
        const senderName = process.env.EMAIL_FROM_NAME || 'Riya Sethi';
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
            },
            body: JSON.stringify({
                sender: {
                    name: senderName,
                    email: process.env.EMAIL_FROM,
                },
                to: [{ email: mailOptions.to }],
                subject: mailOptions.subject,
                htmlContent: mailOptions.html,
                textContent: mailOptions.text,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Brevo API error (${response.status}): ${errorText}`);
        }
    }

    // Send the actual email
    async send(template, subject) {
        // 1) Render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject,
            data: this.data,
        });

        // 2) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText(html),
        };

        // 3) Send email using Brevo API or SMTP transport
        if (this.usesBrevo()) {
            await this.sendWithBrevo(mailOptions);
            return;
        }

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
    }

    async sendBookingConfirmation(tour) {
        this.data = {
            tourName: tour.name,
            price: tour.price,
            duration: tour.duration,
            summary: tour.summary,
        };

        await this.send('bookingConfirmation', `Booking confirmed: ${tour.name}`);
    }
};
