const mongoose = require('mongoose');

let isListenersBound = false;
let activeConnectionPromise = null;

const bindConnectionListeners = () => {
    if (isListenersBound) return;
    isListenersBound = true;

    mongoose.connection.on('connected', () => {
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    });

    mongoose.connection.on('error', (error) => {
        console.error(`MongoDB connection error: ${error.message}`);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected.');
    });
};

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error('Missing MONGODB_URI in backend/.env');
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (activeConnectionPromise) {
        return activeConnectionPromise;
    }

    bindConnectionListeners();

    activeConnectionPromise = mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 20,
        minPoolSize: 2,
        retryWrites: true,
        autoIndex: process.env.NODE_ENV !== 'production',
        family: 4
    }).then((conn) => {
        activeConnectionPromise = null;
        return conn.connection;
    }).catch((error) => {
        activeConnectionPromise = null;
        console.error(`Error connecting to MongoDB: ${error.message}`);
        throw error;
    });

    return activeConnectionPromise;
};

module.exports = connectDB;
