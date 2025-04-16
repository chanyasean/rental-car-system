const Booking = require('../models/Booking');

const Car = require('../models/Car');

const generateInvoice = require('../utils/generateInvoice');

//@desc Get all bookings
//@route GET /api/v1/bookings
//@access Private (User/Admin)

exports.getBookings = async (req, res, next) => {
    try {
        let query;

        if (req.user.role !== 'admin') {
            query = Booking.find({ user: req.user.id });
        } else {
            query = Booking.find();
        }

        const bookings = await query.populate({
            path: 'car',
            select: 'name provider tel'
        })
        // Only select relevant user fields
        .populate({ path: 'user', select: 'name email'
        });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

//@desc Get single booking
//@route GET /api/v1/bookings/:id
//@access Private
exports.getBooking = async (req,res,next)=>
{
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'car',
            select: 'name provider tel'
        })
        // Only select relevant user fields
        .populate({ path: 'user', select: 'name email'
        });
        
        if (!booking){
            return res.status(404).json({success: false, message: `Booking not found`});
        }

        // Only allow owner or admin to access
        if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, msg: 'Not authorized' });
        }
        
        res.status(200).json(
            {
                success: true,
                data: booking
            }
        );
    } catch (err) {
        console.error(err);
         // If error is a CastError (invalid ObjectId format)
         if (err.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid booking ID format' });
        }

        // General server error
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

//@desc Create new booking
//@route POST /api/v1/cars/:carId/booking
//@access Private
exports.createBooking = async (req,res,next)=>
{
    try {
        req.body.car = req.params.carId;

        const car = await Car.findById(req.params.carId);

        if(!car)
        {
            return res.status(404).json ({success: false, message: `Car not found with the id of ${req.params.carId}`});
        }
        
        //add user Id to req.body
        req.body.user = req.user.id;

        //Check for existed booking
        const existedBooking = await Booking.find({user:req.user.id});

        //If the user is not an admin, they can only create 3 bookings.
        if(existedBooking.length >= 3 && req.user.role != 'admin'){
            return res.status(400).json({success: false, message: `The user with ID ${req.user.id} has already reached booking limit (max : 3)`});
        }

        const booking = await Booking.create(req.body);

        // Populate user for the invoice
        const user = req.user;

        // Generate PDF invoice
        generateInvoice(booking, car, user);
        
        res.status(201).json(
            {
                success: true,
                data: booking
            }
        );  
    } catch (error) {

        console.log(error);

        return res.status(500).json({success: false, message: "Cannot create a booking"});
    }
};

//@desc Update booking
//@route PUT /api/v1/bookings/:id
//@access Private
exports.updateBooking = async (req,res,next)=>
{
    try {
        let booking = await Booking.findById(req.params.id);

        if(!booking){
            return res.status(404).json({success: false, message: `No booking with the id of ${req.params.id}`});
        }

        //Make sure user is the booking owner
        if(booking.user._id.toString() !== req.user.id && req.user.role !== 'admin')
        {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to update this booking`});
        }

       booking = await Booking.findByIdAndUpdate(req.params.id,req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.log(error);
        // If error is a CastError (invalid ObjectId format)
        if (err.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Bad Request' });
        }
        return res.status(500).json({success: false, message: "Cannot update the booking"});
    }
};

//@desc Delete booking
//@route DELETE /api/v1/bookings/:id
//@access Private
exports.deleteBooking = async (req,res,next)=>
{
    try {
        const booking = await Booking.findById(req.params.id);

        if(!booking)
            {
                return res.status(404).json({success: false, message: `No booking with the id of ${req.params.id}`});
            }

        //Make sure user is the booking owner
        if(booking.user._id.toString() !== req.user.id && req.user.role !== 'admin')
            {
                return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to delete this booking`});
            }

            await booking.deleteOne();

            res.status(200).json({
                success: true,
                data: {}
            });
    } catch (error) {
        console.log(error);
        // If error is a CastError (invalid ObjectId format)
        if (err.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid booking ID format' });
        }
        return res.status(500).json({success: false, message:"Cannot delete the booking"});
    }
};