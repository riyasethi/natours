const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const { buildAppUrl } = require('../utils/appUrl');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    if (!stripe) {
        return next(new AppError('Stripe is not configured for this demo yet.', 500));
    }

    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    if (!tour) {
        return next(new AppError('There is no tour with that ID.', 404));
    }

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        success_url: `${buildAppUrl(req, '/my-tours')}?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: buildAppUrl(req, `/tour/${tour.slug}`),
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: Math.round(tour.price * 100),
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                    },
                },
                quantity: 1,
            },
        ],
    });

    // 3) Create session as response
    res.status(200).json({
        status: 'success',
        session,
    });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
    const { tour, user, price } = req.query;

    if (!tour && !user && !price) return next();
    const existingBooking = await Booking.findOne({ tour, user }).select('_id');

    await Booking.findOneAndUpdate(
        { tour, user },
        { price, paid: true },
        {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        },
    );

    if (!existingBooking) {
        const [bookedTour, bookedUser] = await Promise.all([Tour.findById(tour), User.findById(user)]);

        if (bookedTour && bookedUser) {
            const bookingsUrl = buildAppUrl(req, '/my-tours');
            new Email(bookedUser, bookingsUrl).sendBookingConfirmation(bookedTour).catch((err) => {
                console.error('Booking confirmation email failed to send', err.message);
            });
        }
    }

    res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
