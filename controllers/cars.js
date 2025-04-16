// Desc : Get all cars
// Route : GET /api/v1/cars

const Car = require("../models/Car");
const Booking = require('../models/Booking.js');

// Access : Public
exports.getCars= async (req,res,next) => {
        let query;

        //Copy req.qury
        const reqQuery = {...req.query};

        //Fields to exclude
        const removeFields = ['select','sort','page','limit'];

        //Loop over remove fields and deleted them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);
        console.log(reqQuery);

        // Custom filters for nested fields
        if (reqQuery.provider) 
            {
                reqQuery['provider.name'] = { $regex: reqQuery.provider, $options: 'i' };
                delete reqQuery.provider;
            }
        if (reqQuery.address) 
            {
                reqQuery['provider.address'] = { $regex: reqQuery.address, $options: 'i' };
                delete reqQuery.address;
            }
        if (reqQuery.name) 
            {
                reqQuery.name = { $regex: reqQuery.name, $options: 'i' };
            }

        //Create Query String
        let queryStr=JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        query=Car.find(JSON.parse(queryStr)).populate('bookings');

        //Select Fields
        if(req.query.select)
        {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        //Sort
        if(req.query.sort)
        {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        //Pagination
        const page = parseInt(req.query.page,10)||1;
        const limit = parseInt (req.query.limit,10)||25;
        const startIndex = (page-1)*limit;
        const endIndex = page*limit;

    try{
        const total = await Car.countDocuments();
        query = query.skip(startIndex).limit(limit);

        //Executing Query
        const cars = await query;

        //Pagination result
        const pagination = {};

        if(endIndex < total)
        {
            pagination.next = {
                page: page+1,
                limit
            }
        }

        if(startIndex > 0)
        {
            pagination.prev = {
                page: page-1,
                limit
            }
        }
        res.status(200).json({success:true, count:cars.length, pagination, data:cars});
    }
    catch(err) {
        res.status(500).json({success:false});
    }
};

// Desc : Get single car
// Route : GET /api/v1/cars/:id
// Access : Public
exports.getCar = async (req,res,next) => {
    try{
        const car = await Car.findById(req.params.id);
        if(!car){
            return res.status(404).json({ success: false, msg: 'Car not found' });
        }
        res.status(200).json({success:true,data:car});
    }
    catch(err) {
        res.status(400).json({ success: false, error: 'Invalid booking ID format' });
        res.status(500).json({success:false, msg: 'Internal Server Error'});
    }
};

// Desc : Create a car
// Route : POST /api/v1/cars
// Access : Private/Admin
exports.createCar = async (req, res, next) => {
    try {
      const car = await Car.create(req.body);
      res.status(201).json({ success: true, data: car });
    } catch (err) {
      res.status(400).json({ success: false, msg: 'Invalid input' });
    }
  };

// Desc : Update a car
// Route : PUT /api/v1/cars/:id
// Access : Private
exports.updateCar = async (req,res,next) => {
    try{
        const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!car){
            return res.status(404).json({success:false, msg: 'Car not found'});
        }
        res.status(200).json({success:true,data:car});
    }
    catch(err) {
        res.status(400).json({success:false, msg: 'Invalid input'});
    }
};

// Desc : Delete a car
// Route : DELETE /api/v1/cars/:id
// Access : Private
exports.deleteCar = async (req,res,next) => {
    try{
        const car = await Car.findById(req.params.id);

        if(!car){
            return res.status(400).json({success:false, msg: 'Car not found'});
        }

        await Booking.deleteMany ({car: req.params.id});
        await Car.deleteOne({_id: req.params.id});

        res.status(200).json({success:true,data:{}});
    }
    catch(err) {
        res.status(500).json({success:false, msg: 'Internal Server Error'});
    }
};