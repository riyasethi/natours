const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', encodeURIComponent(process.env.DATABASE_PASSWORD));

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
    try {
        await mongoose.connect(DB);
        console.log('DB connection successful!');
        await Review.deleteMany();
        await Tour.deleteMany();
        await User.deleteMany();
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.insertMany(reviews);
        console.log('Data successfully loaded!');
    } catch (err) {
        console.log(err);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
    try {
        await mongoose.connect(DB);
        console.log('DB connection successful!');
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data successfully deleted!');
    } catch (err) {
        console.log(err);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
