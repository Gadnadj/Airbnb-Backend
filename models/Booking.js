const mongoose = require('mongoose');
const BookingSchema = mongoose.Schema({
    place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
    checkIn: Date,
    checkOut: Date,
    name: String,
    phone: String,
    price: Number,
    numOfNights: Number,
})

const BookingModel = mongoose.model('booking', BookingSchema);
module.exports = BookingModel;