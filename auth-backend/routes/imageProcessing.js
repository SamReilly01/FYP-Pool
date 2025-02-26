const express = require('express');
const multer = require('multer');
const { PythonShell } = require('python-shell');
const path = require('path');
const db = require('../models/db');

const router = express.Router();

// ✅ Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'), // Ensure the uploads folder is correctly referenced
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });

// ✅ Image Upload Route
router.post('/upload', upload.single('image'), async (req, res) => {
  console.log('📥 Image received for upload:', req.file);

  if (!req.file) {
    console.error('❌ No file uploaded.');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const imageUrl = `/uploads/${req.file.filename}`;
    console.log('✅ Image successfully uploaded:', imageUrl);

    // 🔥 Store the uploaded image in the database
    await db.query(`INSERT INTO uploaded_images (image_url, uploaded_at) VALUES ($1, NOW())`, [imageUrl]);

    res.json({ message: 'Image uploaded successfully', image_url: imageUrl });
  } catch (err) {
    console.error('❌ Server error during upload:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ✅ Fetch the latest uploaded image from the database
router.get('/latest', async (req, res) => {
  try {
    console.log('📥 Fetching latest uploaded image from DB...');
    const result = await db.query(
      'SELECT image_url FROM uploaded_images ORDER BY uploaded_at DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      console.error('❌ No uploaded images found in database.');
      return res.status(404).json({ error: 'No uploaded images found' });
    }

    const latestImage = result.rows[0].image_url;
    console.log('✅ Latest image path from database:', latestImage);

    res.json({ image_url: latestImage });
  } catch (error) {
    console.error('❌ Error fetching latest image from database:', error);
    res.status(500).json({ error: 'Error retrieving latest image from database' });
  }
});



// ✅ Process image using Python script
router.post('/process', async (req, res) => {
  console.log('📥 Received request to process image:', req.body);

  let { image_path } = req.body;
  if (!image_path || image_path === 'undefined') {
    console.error('❌ Invalid image path received:', image_path);
    return res.status(400).json({ error: 'Invalid image path received.' });
  }

  // ✅ Ensure the correct image path is used
  console.log('✅ Using image path for processing:', image_path);

  const absoluteImagePath = path.join(__dirname, '../', image_path);
  console.log('🔍 Converted Image Path:', absoluteImagePath);

  const options = {
    args: [absoluteImagePath],
    pythonOptions: ['-u'],
  };

  let output = [];
  let pyshell = new PythonShell('process_image.py', options);

  pyshell.on('message', (message) => {
    try {
      console.log('🐍 Python Output:', message);
      output.push(message);
    } catch (err) {
      console.error('❌ Error processing Python output:', err);
    }
  });

  pyshell.on('stderr', (stderr) => {
    console.error('❌ Python Error:', stderr);
  });

  pyshell.end((err, code, signal) => {
    if (err) {
      console.error('❌ PythonShell error:', err);
      return res.status(500).json({ error: 'Error processing image' });
    }

    console.log('✅ Python script finished with exit code:', code);

    if (output.length === 0) {
      console.error('❌ No output from Python script.');
      return res.status(500).json({ error: 'No response from Python script' });
    }

    try {
      const parsedResult = JSON.parse(output.join('').trim());
      // 🔥 Ensure correct relative path
      const processedFilename = path.basename(image_path);
      const processedImageUrl = `/uploads/processed_${processedFilename}`; // Ensure a valid path

      console.log("✅ Processed image path:", processedImageUrl);

      res.json({
        message: 'Image processed successfully',
        transformed_image_url: processedImageUrl, // Send relative URL
        ball_positions: parsedResult.ball_positions,
      });


    } catch (parseError) {
      console.error('❌ Failed to parse Python response:', parseError);
      console.error('Received Output:', output);
      res.status(500).json({ error: 'Failed to parse Python response' });
    }
  });
});


module.exports = router;
