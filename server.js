const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

//Load env vars
dotenv.config({path:'./config/config.env'});

//Connect to database
connectDB();

const app = express();

// Route files
const cars = require ('./routes/cars');
const bookings = require('./routes/bookings');
const auth = require('./routes/auth');

//Body Parser
app.use(express.json());
app.use(mongoSanitize()); // Sanitize Data
app.use(xss()); // Prevent XSS attacks
app.use(helmet()); // Set security headers
//Rate Limiting
const limiter = rateLimit.rateLimit(
    {
        windowsMs : 10*60*1000, //10 mins
        max: 100
    }
);
app.use(limiter);
app.use(hpp()); //Prevent http param pollutions
app.use(cors()); // Enable CORS
app.use('/api/v1/cars',cars);
app.use('/api/v1/bookings',bookings);
app.use('/api/v1/auth',auth);

//Cookie Parser
app.use(cookieParser());

const PORT=process.env.PORT || 5003;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, 'mode on port', PORT));

//Handle uphandles promise rejections
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(()=>process.exit(1));
});

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info:
        {
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express Car Renting API'
        },
        servers: [
            {
                url: 'http://localhost:5003/api/v1'
            }
        ],
    },
    apis:['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));