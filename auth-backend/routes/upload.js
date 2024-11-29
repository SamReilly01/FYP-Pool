const express = require('express');
const multer = require('multer');
const pool = require('../models/db'); // Import your database connection
const fs = require('fs'); // To ensure the uploads folder exists

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Save files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit
    },
    fileFilter: (req, file, cb) => {
        // Allow only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed.'));
        }
    },
});

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { user_id } = req.body;
        if (!user_id || isNaN(user_id)) {
            throw new Error('Invalid or missing user_id.');
        }

        if (!req.file) {
            throw new Error('No file uploaded.');
        }

        const filePath = `/uploads/${req.file.filename}`;

        const query = `
            INSERT INTO uploaded_images (user_id, image_url, uploaded_at)
            VALUES ($1, $2, NOW())
            RETURNING *;
        `;
        const values = [parseInt(user_id, 10), filePath]; // Ensure user_id is an integer

        const result = await pool.query(query, values);

        res.status(200).json({
            message: 'Image uploaded successfully',
            image: result.rows[0],
        });
    } catch (err) {
        console.error('Error uploading image:', err.message); // Log the specific error
        res.status(500).json({ error: err.message }); // Send the error to the frontend
    }
});


module.exports = router;
