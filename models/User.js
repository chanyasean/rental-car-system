const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Please add a name']
    },
    telephone: {
        type: String,
        minlength:10,
        required: [true, 'Please add a telephone number'],
        match: [/^0\d{9}$/, 'Please add a valid telephone number (e.g., 0812345678)']
    },
    email:{
        type:String,
        required:[true, 'Please add an email'],
        unique:true,
        match:[
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Please add a valid email'
        ]
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true, 'Please add a password'],
        minlength:6,
        select:false
    },
    twoFactorEnabled: {
        type: Boolean,
        default: true
    },
    twoFactorTempSecret: String,
    twoFactorOTPExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt:{
        type:Date,
        default:Date.now
    }
});

UserSchema.pre('save', async function(next) {
    // ถ้า password ไม่ได้ถูกแก้ไข (เช่น save เพื่อเซฟ OTP) ให้ข้ามการ hash
    if (!this.isModified('password')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });
  

//Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
  };

  //Match user entered password to hashed password in database
  UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

module.exports = mongoose.model('User',UserSchema);