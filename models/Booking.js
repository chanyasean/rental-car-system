const mongoose = require ('mongoose');

const BookingSchema = new mongoose.Schema(
    {
        bookingDate: {
            type: Date,
            required: true
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        car: {
            type: mongoose.Schema.ObjectId,
            ref: 'Car',
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);

module.exports = mongoose.model('Booking', BookingSchema);