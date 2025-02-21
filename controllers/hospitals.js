// Desc : Get all hospitals
// Route : GET /api/v1/hospitals

const Hospital = require("../models/Hospital");

// Access : Public
exports.getHospitals= async (req,res,next) => {
    try{
        const hospitals = await Hospital.find();
        res.status(200).json({success:true, count:hospitals.length, data:hospitals});
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