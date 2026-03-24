/* eslint-disable */

const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};

const showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.body.insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
};

const request = async (url, options = {}) => {
    const response = await fetch(url, {
        credentials: 'same-origin',
        ...options,
    });
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
        throw new Error(data?.message || 'Something went wrong.');
    }

    return data;
};

const displayMap = (locations) => {
    if (!window.mapboxgl) return;

    mapboxgl.accessToken =
        'pk.eyJ1IjoiY2ljZXJvdGhvbWEiLCJhIjoiY2tmMzZsbTEwMDA5MjJybGZwaWM2YnRkeiJ9.Ph2iTxWF2xwIQTIYOc0Yuw';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        scrollZoom: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((loc) => {
        const el = document.createElement('div');
        el.className = 'marker';

        new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat(loc.coordinates).addTo(map);
        new mapboxgl.Popup({ offset: 30, closeOnClick: false, closeButton: false })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: { top: 200, bottom: 150, left: 100, right: 100 },
    });
};

const login = async (email, password) => {
    const data = await request('/api/v1/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (data.status === 'success') {
        showAlert('success', 'Logged in successfully!');
        window.setTimeout(() => location.assign('/'), 1500);
    }
};

const signup = async (name, email, password, passwordConfirm) => {
    const data = await request('/api/v1/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, passwordConfirm }),
    });

    if (data.status === 'success') {
        showAlert('success', 'Account created successfully!');
        window.setTimeout(() => location.assign('/'), 1500);
    }
};

const forgotPassword = async (email) => {
    const data = await request('/api/v1/users/forgotPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    if (data.status === 'success') {
        showAlert('success', 'Reset link sent! Please check your email.');
    }
};

const logout = async () => {
    const data = await request('/api/v1/users/logout');
    if (data.status === 'success') location.reload(true);
};

const resetPassword = async (token, password, passwordConfirm) => {
    const data = await request(`/api/v1/users/resetPassword/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, passwordConfirm }),
    });

    if (data.status === 'success') {
        showAlert('success', 'Password reset successfully!');
        window.setTimeout(() => location.assign('/me'), 1500);
    }
};

const updateSettings = async (data, type) => {
    const url = type === 'password' ? '/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe';
    const isFormData = data instanceof FormData;

    const response = await request(url, {
        method: 'PATCH',
        headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data),
    });

    if (response.status === 'success') {
        showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
};

const bookTour = async (tourId) => {
    if (!stripe) {
        showAlert('error', 'Stripe is not configured.');
        return;
    }

    const session = await request(`/api/v1/bookings/checkout-session/${tourId}`);
    const result = await stripe.redirectToCheckout({ sessionId: session.session.id });

    if (result && result.error) {
        throw new Error(result.error.message);
    }
};

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const forgotPasswordForm = document.querySelector('.form--forgot-password');
const resetPasswordForm = document.querySelector('.form--reset-password');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const photoInput = document.getElementById('photo');
const userPhotoPreview = document.querySelector('.form__user-photo');
const stripe =
    typeof Stripe !== 'undefined' && bookBtn && bookBtn.dataset.stripePublicKey
        ? Stripe(bookBtn.dataset.stripePublicKey)
        : null;

const submitUserData = async () => {
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);

    if (photoInput && photoInput.files[0]) {
        form.append('photo', photoInput.files[0]);
    }

    await updateSettings(form, 'data');
};

if (mapBox) {
    displayMap(JSON.parse(mapBox.dataset.locations));
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await login(document.getElementById('email').value, document.getElementById('password').value);
        } catch (err) {
            showAlert('error', err.message);
        }
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await signup(
                document.getElementById('name').value,
                document.getElementById('email').value,
                document.getElementById('password').value,
                document.getElementById('passwordConfirm').value,
            );
        } catch (err) {
            showAlert('error', err.message);
        }
    });
}

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = forgotPasswordForm.querySelector('button');
        button.textContent = 'Sending...';

        try {
            await forgotPassword(document.getElementById('email').value);
        } catch (err) {
            showAlert('error', err.message);
        } finally {
            button.textContent = 'Send reset link';
        }
    });
}

if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = resetPasswordForm.dataset.token;

        try {
            await resetPassword(
                token,
                document.getElementById('password').value,
                document.getElementById('passwordConfirm').value,
            );
        } catch (err) {
            showAlert('error', err.message);
        }
    });
}

if (logOutBtn) {
    logOutBtn.addEventListener('click', async () => {
        try {
            await logout();
        } catch (err) {
            showAlert('error', err.message);
        }
    });
}

if (userDataForm) {
    userDataForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await submitUserData();
        } catch (err) {
            showAlert('error', err.message);
        }
    });
}

if (photoInput) {
    photoInput.addEventListener('change', async () => {
        const file = photoInput.files[0];
        if (!file) return;

        if (userPhotoPreview) {
            userPhotoPreview.src = URL.createObjectURL(file);
        }

        try {
            await submitUserData();
        } catch (err) {
            showAlert('error', err.message);
        }
    });
}

if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = document.querySelector('.btn--save-password');
        button.textContent = 'Updating...';
        try {
            await updateSettings(
                {
                    passwordCurrent: document.getElementById('password-current').value,
                    password: document.getElementById('password').value,
                    passwordConfirm: document.getElementById('password-confirm').value,
                },
                'password',
            );

            document.getElementById('password-current').value = '';
            document.getElementById('password').value = '';
            document.getElementById('password-confirm').value = '';
        } catch (err) {
            showAlert('error', err.message);
        } finally {
            button.textContent = 'Save password';
        }
    });
}

if (bookBtn) {
    bookBtn.addEventListener('click', async (e) => {
        e.target.textContent = 'Processing...';
        try {
            await bookTour(e.target.dataset.tourId);
        } catch (err) {
            showAlert('error', err.message);
            e.target.textContent = 'Book tour now!';
        }
    });
}
