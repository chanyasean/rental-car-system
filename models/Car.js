const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a car name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    provider: {
        name: {
            type: String,
            required: [true, 'Please add a provider name'],
        },
        address: {
            type: String,
            required: [true, 'Please add a provider address'],
        },
        tel: {
            type: String,
        },
    },
    available: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Reverse populate with virtuals
CarSchema.virtual('bookings', 
    {
        ref: 'Booking',
        localField: '_id',
        foreignField: 'car',
        justOne: false 
    }
);
  

module.exports=mongoose.model('Car',CarSchema);