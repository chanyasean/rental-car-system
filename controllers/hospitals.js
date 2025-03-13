// Desc : Get all hospitals
// Route : GET /api/v1/hospitals

const Hospital = require("../models/Hospital");

// Access : Public
exports.getHospitals= async (req,res,next) => {
        let query;

        //Copy req.qury
        const reqQuery = {...req.query};

        //Fields to exclude
        const removeFields = ['select','sort','page','limit'];

        //Loop over remove fields and deleted them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);
        console.log(reqQuery);

        //Create Query String
        let queryStr=JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        query=Hospital.find(JSON.parse(queryStr)).populate('appointments');

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
        const total = await Hospital.countDocuments();
        query = query.skip(startIndex).limit(limit);

        //Executing Query
        const hospitals = await query;

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
        res.status(200).json({success:true, count:hospitals.length, pagination, data:hospitals});
    }
    catch(err) {
        res.status(400).json({success:false});
    }
};

// Desc : Get single hospital
// Route : GET /api/v1/hospitals/:id
// Access : Public
exports.getHospital= async (req,res,next) => {
    try{
        const hospital = await Hospital.findById(req.params.id);
        if(!hospital){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true,data:hospital});
    }
    catch(err) {
        res.status(400).json({success:false});
    }
};

// Desc : Create a hospital
// Route : POST /api/v1/hospitals
// Access : Private
exports.createHospital= async (req,res,next) => {
    const hospital = await Hospital.create(req.body);
    res.status(201).json({success:true, data:hospital});
};

// Desc : Update a hospital
// Route : PUT /api/v1/hospitals/:id
// Access : Private
exports.updateHospital= async (req,res,next) => {
    try{
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!hospital){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true,data:hospital});
    }
    catch(err) {
        res.status(400).json({success:false});
    }
};

// Desc : Delete a hospital
// Route : DELETE /api/v1/hospitals/:id
// Access : Private
exports.deleteHospital= async (req,res,next) => {
    try{
        const hospital = await Hospital.findByIdAndDelete(req.params.id);

        if(!hospital){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true,data:{}});
    }
    catch(err) {
        res.status(400).json({success:false});
    }
};