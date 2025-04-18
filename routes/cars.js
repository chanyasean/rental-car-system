const express = require('express');
const {getCars, getCar, createCar, updateCar, deleteCar} = require('../controllers/cars');

//Include other resource routers
const bookingRouter = require('./bookings');

const router = express.Router();

const {protect,authorize} = require('../middleware/auth');

//Re-route into other resource routers
router.use('/:carId/bookings',bookingRouter);

router.route('/').get(protect, authorize('admin','user'), getCars).post(protect, authorize('admin'), createCar);
router.route('/:id').get(protect, authorize('admin','user'), getCar).put(protect, authorize('admin'), updateCar).delete(protect, authorize('admin'), deleteCar);

module.exports=router;