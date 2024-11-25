const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Import cors
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();

app.use(cors()); // Add CORS middleware
app.use(express.json());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
