const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(cors()); 
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api', authRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes); 
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
