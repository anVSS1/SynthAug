const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load env vars
dotenv.config();

const app = express();
app.use(helmet()); // Set security HTTP headers

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:5173',
    credentials: true,
};
app.use(cors(corsOptions));

// Connect to Database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // These options are no longer needed in Mongoose 6+
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
};

connectDB();

// Rate Limiting
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 20, // Limit each IP to 20 auth requests per windowMs
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});


// Middleware
app.use(express.json({ limit: '50mb' })); // Body parser with size limit
app.use(morgan('dev')); // Logger

// Define Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/user', apiLimiter, require('./routes/user'));
app.use('/api/projects', apiLimiter, require('./routes/projects'));
app.use('/api/proxy', apiLimiter, require('./routes/proxy'));
app.use('/api/notifications', apiLimiter, require('./routes/notifications'));
app.use('/api/activity', apiLimiter, require('./routes/activity'));


// Simple root route
app.get('/', (req, res) => res.send('SynthAug API Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
