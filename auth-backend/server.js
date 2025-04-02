const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const imageProcessingRoutes = require('./routes/imageProcessing');
const resultsRoutes = require('./routes/results');
const path = require('path');

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(cors()); 
app.use(express.json());

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route registrations 
app.use('/api/auth', authRoutes); // This makes all auth routes available under /api/auth
app.use('/api', uploadRoutes);
app.use('/api/image', imageProcessingRoutes);
app.use('/api/results', resultsRoutes);

// Debugging log
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Server is running! Try /api/image/upload or /api/image/process');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});