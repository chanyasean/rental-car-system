const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const speakeasy = require('speakeasy');
const bcrypt=require('bcryptjs');

//@desc Regiter User
//@route POST /api/v1/auth/register
//@access Public

exports.register = async(req,res,next)=>
{
    try
    {
        const {name, telephone, email, password, role} = req.body;
        
        //Generate password with salt
        const salt=await bcrypt.genSalt(10);
        const newpassword=await bcrypt.hash(password,salt);

        //Create user
        const user = await User.create({
         name,
         telephone,
         email,
         password: newpassword,
         role
        });

        //Create token
        //const token = user.getSignedJwtToken();
        //res.status(200).json({success:true,token});
        //sendTokenResponse(user,200,res);
        res.status(200).json({success:true});
    }
    catch(err)
    {
        res.status(400).json({success:false});
        console.log(err.stack);
    }
};

//@desc Login user
//@route POST /api/v1/auth/login
//@access Public
exports.login = async (req,res,next) => 
{
    try
    {
        const {email, password, otp} = req.body;

        //Validate email & pasword
        if(!email || !password) {
            return res.status(400).json({success:false, msg:'Please provide an email or password'});
        }

        //Check for user
        const user = await User.findOne({email}).select('+password');
        if(!user) {
            return res.status(400).json({success:false, msg:'Invalid credentials'});
        }

        //Check if password matches
        const isMatch = await user.matchPassword(password);
        if(!isMatch) {
            return res.status(401).json({success:false, msg:'Invalid credentials'});
        }

          // If user has 2FA enabled
        if (user.twoFactorEnabled) {
            // If OTP not yet provided, send it via email
            if (!otp) {
                const temp_secret = speakeasy.generateSecret({ length: 6 });
                const token = speakeasy.totp({ secret: temp_secret.base32, encoding: 'base32' });

                user.twoFactorTempSecret = temp_secret.base32;
                user.twoFactorOTPExpires = Date.now() + 5 * 60 * 1000; // 5 mins
                await user.save();

                await sendEmail({
                    email: user.email,
                    subject: 'Your OTP Code',
                    message: `Your one-time login code is: ${token}`
                });

                return res.status(200).json({
                success: true, msg: 'OTP sent to your email. Please provide it to complete login.'
                });
            }
            // If OTP provided, validate it
            const isValid = speakeasy.totp.verify({
                secret: user.twoFactorTempSecret,
                encoding: 'base32',
                token: otp,
                window: 1
            });
  
            if (!isValid || Date.now() > user.twoFactorOTPExpires) {
                return res.status(401).json({ success: false, msg: 'Invalid or expired OTP' });
            }
        }

        //Create token
        //const token = user.getSignedJwtToken();
        //return res.status(200).json({success:true,token});
        sendTokenResponse(user,200,res);
    }catch(err) {
        return res.status(401).json({success:false, msg:'Cannot convert email or password to string'});
    }
};

//Get token from model, create cookie and send response
const sendTokenResponse = (user,statusCode,res) =>
{
    //Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires : new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly : true
    };

    if(process.env.NODE_ENV==='production')
    {
        options.secure=true;
    }
    res.status(statusCode).cookie('token',token,options).json(
        {
            success: true,
            token
        }
    )
};


//@desc Get current Logged in user
//@route POST/api/v1/auth/me
//@access Private
exports.getMe = async(req,res,next) =>
{
    const user = await User.findById(req.user.id);
    res.status(200).json(
        {
            sucess: true,
            data: user
        }
    );
};

//@desc Log user out / clear cookie
//@route GET/api/v1/auth/logout
//@access Private
exports.logout = async(req,res,next) =>
    {
        res.cookie('token','none',
            {
                expires: new Date(Date.now() + 10*1000),
                httpOnly: true
            }
        );

        res.status(200).json(
            {
                sucess: true,
                data: {}
            }
        );
    };