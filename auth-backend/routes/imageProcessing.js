const express = require('express');
const multer = require('multer');
const { PythonShell } = require('python-shell');
const path = require('path');
const db = require('../models/db');
const fs = require('fs');

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'pool-table-' + uniqueSuffix + extension);
  }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  // Accept image files only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are accepted.'), false);
  }
};

// Configure upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // Increased to 15MB limit
  }
});

// Ensure uploads and debug directories exist
const uploadsDir = path.join(__dirname, '../uploads');
const debugDir = path.join(__dirname, '../debug');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(debugDir)) {
  fs.mkdirSync(debugDir, { recursive: true });
}

// Image Upload Route with better error handling
router.post('/upload', upload.single('image'), async (req, res) => {
  console.log('📥 Image received for upload:', req.file);

  if (!req.file) {
    console.error('❌ No file uploaded.');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Get the player level from the request
  const playerLevel = req.body.playerLevel || 'intermediate';
  console.log('👤 Player level:', playerLevel);

  try {
    const imageUrl = `/uploads/${req.file.filename}`;
    console.log('✅ Image successfully uploaded:', imageUrl);

    // Store the uploaded image and player level in the database
    await db.query(
      `INSERT INTO uploaded_images (image_url, uploaded_at, player_level) VALUES ($1, NOW(), $2)`,
      [imageUrl, playerLevel]
    );

    res.json({
      message: 'Image uploaded successfully',
      image_url: imageUrl,
      file_size: req.file.size,
      file_type: req.file.mimetype,
      player_level: playerLevel
    });
  } catch (err) {
    console.error('❌ Server error during upload:', err);
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
});

// Fetch the latest uploaded image from the database with error handling
router.get('/latest', async (req, res) => {
  try {
    console.log('📥 Fetching latest uploaded image from DB...');
    const result = await db.query(
      'SELECT image_url, uploaded_at, player_level FROM uploaded_images ORDER BY uploaded_at DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      console.error('❌ No uploaded images found in database.');
      return res.status(404).json({ error: 'No uploaded images found' });
    }

    const latestImage = result.rows[0];
    console.log('✅ Latest image path from database:', latestImage.image_url);

    // Check if the file actually exists
    const absolutePath = path.join(__dirname, '..', latestImage.image_url);
    if (!fs.existsSync(absolutePath)) {
      console.error('❌ Image file not found on server:', absolutePath);
      return res.status(404).json({ error: 'Image file not found on server' });
    }

    res.json({
      image_url: latestImage.image_url,
      uploaded_at: latestImage.uploaded_at,
      player_level: latestImage.player_level
    });
  } catch (error) {
    console.error('❌ Error fetching latest image from database:', error);
    res.status(500).json({ error: 'Error retrieving latest image from database: ' + error.message });
  }
});

// Process image with improved error handling and debugging
router.post('/process', async (req, res) => {
  console.log('📥 Received request to process image:', req.body);
  console.time('image-processing');

  let { image_path } = req.body;
  if (!image_path || image_path === 'undefined') {
    console.error('❌ Invalid image path received:', image_path);
    return res.status(400).json({ error: 'Invalid image path received.' });
  }

  // Ensure the correct image path is used
  console.log('✅ Using image path for processing:', image_path);

  const absoluteImagePath = path.join(__dirname, '../', image_path);
  console.log('🔍 Absolute Image Path:', absoluteImagePath);

  // Check if the file exists
  if (!fs.existsSync(absoluteImagePath)) {
    console.error('❌ File does not exist at path:', absoluteImagePath);
    return res.status(404).json({ error: 'Image file not found at the specified path.' });
  }

  // Check file size
  const stats = fs.statSync(absoluteImagePath);
  console.log(`📊 File size: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);

  // If file is very large, warn but continue
  if (stats.size > 10 * 1024 * 1024) {
    console.warn(`⚠️ Large file detected (${(stats.size / 1024 / 1024).toFixed(2)}MB). Processing may take longer.`);
  }

  // Configure Python options with increased timeout
  const options = {
    args: [absoluteImagePath],
    pythonOptions: ['-u'],  // unbuffered output
    mode: 'text',
    pythonPath: 'python',  // use 'python3' if that's your system's Python 3 command
    scriptPath: path.join(__dirname, '../'),  // Ensure correct script path
    // Increase timeout for large images
    timeout: 60000  // 60 seconds timeout
  };

  let output = [];
  let errorOutput = [];

  try {
    console.log('🐍 Starting Python script with options:', JSON.stringify(options));
    let pyshell = new PythonShell('process_image.py', options);

    pyshell.on('message', (message) => {
      try {
        console.log('🐍 Python Output received:', message.substring(0, 200) + '...');
        output.push(message);
      } catch (err) {
        console.error('❌ Error processing Python output:', err);
        errorOutput.push(`Error processing output: ${err.message}`);
      }
    });

    pyshell.on('stderr', (stderr) => {
      console.error('❌ Python Error:', stderr);
      errorOutput.push(stderr);
    });

    await new Promise((resolve, reject) => {
      pyshell.end((err, code, signal) => {
        if (err) {
          console.error('❌ PythonShell error:', err);
          errorOutput.push(`PythonShell error: ${err.message}`);
          reject(err);
        } else {
          console.log('✅ Python script finished with exit code:', code);
          resolve();
        }
      });
    });

    if (output.length === 0) {
      console.error('❌ No output from Python script. Error output:', errorOutput);
      throw new Error(`No output from Python script. Error: ${errorOutput.join(', ')}`);
    }

    // Try to parse the JSON output
    try {
      // Join all output and parse
      const fullOutput = output.join('').trim();
      console.log('🔍 Parsing JSON output of length:', fullOutput.length);
      const parsedResult = JSON.parse(fullOutput);

      // Check if the result indicates an error
      if (parsedResult.error) {
        console.error('❌ Python script reported an error:', parsedResult.error);
        throw new Error(parsedResult.error);
      }

      // Process the filename and ensure we have the correct URL
      const processedFilename = path.basename(image_path);
      const processedImageUrl = parsedResult.image_url || `/uploads/processed_${processedFilename}`;

      console.log("✅ Processed image path:", processedImageUrl);
      console.log(`📊 Detected ${parsedResult.ball_positions?.length || 0} balls`);

      // Check for synthetic balls
      const syntheticBalls = parsedResult.ball_positions?.filter(ball => ball.synthetic) || [];
      if (syntheticBalls.length > 0) {
        console.log(`⚠️ Added ${syntheticBalls.length} synthetic balls to complete the game setup`);
      }

      // Extract all info from Python response
      const response = {
        message: 'Image processed successfully',
        transformed_image_url: processedImageUrl,
        ball_positions: parsedResult.ball_positions || [],
        original_dimensions: parsedResult.original_dimensions || null,
        table_bounds: parsedResult.table_bounds || null,
        synthetic_ball_count: syntheticBalls.length,
        processing_time_ms: console.timeEnd('image-processing')
      };

      res.json(response);
    } catch (parseError) {
      console.error('❌ Failed to parse Python response:', parseError);
      console.error('❌ Received Output:', output.length > 0 ? output[0].substring(0, 200) + '...' : 'No output');
      console.error('❌ Error Output:', errorOutput);

      // Try to handle common errors
      if (errorOutput.some(error => error.includes('ImportError') || error.includes('ModuleNotFoundError'))) {
        throw new Error(`Python dependency error. Please ensure all required libraries are installed: ${errorOutput.join(', ')}`);
      } else if (errorOutput.some(error => error.includes('MemoryError'))) {
        throw new Error(`Image processing failed due to memory constraints. Please try with a smaller image.`);
      } else if (errorOutput.length > 0) {
        throw new Error(`Python script execution error: ${errorOutput.join(', ')}`);
      } else {
        throw new Error(`Failed to parse Python response: ${parseError.message}. Output: ${output.length > 0 ? output[0].substring(0, 100) + '...' : 'No output'}`);
      }
    }
  } catch (error) {
    console.error('❌ Error during image processing:', error);
    console.timeEnd('image-processing');

    // Create error response with useful debug info
    const errorResponse = {
      error: 'Error processing image: ' + error.message,
      details: {
        input_path: absoluteImagePath,
        error_type: error.name,
        error_output: errorOutput.slice(0, 5), // Limit to first 5 error messages
        exists: fs.existsSync(absoluteImagePath)
      },
      // Provide fallback values to prevent UI errors
      transformed_image_url: `/uploads/processed_${path.basename(image_path)}`,
      ball_positions: [
        { "color": "white", "x": 200, "y": 200, "vx": 0, "vy": 0 },
        { "color": "black", "x": 400, "y": 200, "vx": 0, "vy": 0 },
        { "color": "red", "x": 600, "y": 150, "vx": 0, "vy": 0, "number": 1 },
        { "color": "yellow", "x": 600, "y": 250, "vx": 0, "vy": 0, "number": 1 }
      ],
      original_dimensions: { width: 800, height: 400 },
      table_bounds: { x: 0, y: 0, width: 800, height: 400 }
    };

    res.status(500).json(errorResponse);
  }
});

// Add a new endpoint to get debug information
router.get('/debug', async (req, res) => {
  try {
    const debugDir = path.join(__dirname, '../debug');

    // Check if debug directory exists
    if (!fs.existsSync(debugDir)) {
      return res.status(404).json({ error: 'Debug directory not found' });
    }

    // Read all debug files
    const files = fs.readdirSync(debugDir);
    const debugFiles = files.filter(file => file.endsWith('.jpg'));

    // Generate URLs for each debug file
    const debugImages = debugFiles.map(file => ({
      name: file,
      url: `/debug/${file}`
    }));

    res.json({
      message: 'Debug images retrieved successfully',
      debug_images: debugImages
    });
  } catch (error) {
    console.error('❌ Error retrieving debug images:', error);
    res.status(500).json({ error: 'Error retrieving debug images: ' + error.message });
  }
});

// Serve debug images
router.use('/debug', express.static(path.join(__dirname, '../debug')));

// Add a cleanup endpoint to remove old debug images
router.post('/cleanup', async (req, res) => {
  try {
    const debugDir = path.join(__dirname, '../debug');

    // Check if debug directory exists
    if (!fs.existsSync(debugDir)) {
      return res.status(404).json({ error: 'Debug directory not found' });
    }

    // Get all files in debug directory
    const files = fs.readdirSync(debugDir);

    // Keep track of deleted files
    let deletedCount = 0;

    // Delete all files except the most recent ones
    const MAX_FILES_TO_KEEP = 50; // Keep last 50 debug files

    if (files.length > MAX_FILES_TO_KEEP) {
      // Sort files by modification time (oldest first)
      const sortedFiles = files.map(file => {
        const filePath = path.join(debugDir, file);
        return {
          name: file,
          path: filePath,
          mtime: fs.statSync(filePath).mtime.getTime()
        };
      }).sort((a, b) => a.mtime - b.mtime);

      // Delete oldest files
      const filesToDelete = sortedFiles.slice(0, sortedFiles.length - MAX_FILES_TO_KEEP);

      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        deletedCount++;
      }
    }

    res.json({
      message: 'Debug cleanup completed',
      deleted_files: deletedCount
    });
  } catch (error) {
    console.error('❌ Error during debug cleanup:', error);
    res.status(500).json({ error: 'Error during debug cleanup: ' + error.message });
  }
});

// Add an endpoint to reprocess a specific image
router.post('/reprocess', async (req, res) => {
  const { image_path } = req.body;

  if (!image_path) {
    return res.status(400).json({ error: 'No image path provided for reprocessing' });
  }

  try {
    // Check if image exists
    const absoluteImagePath = path.join(__dirname, '../', image_path);
    if (!fs.existsSync(absoluteImagePath)) {
      return res.status(404).json({ error: 'Image not found for reprocessing' });
    }

    // Clear existing debug files for this image
    const debugDir = path.join(__dirname, '../debug');
    if (fs.existsSync(debugDir)) {
      const basename = path.basename(image_path, path.extname(image_path));
      const relatedDebugFiles = fs.readdirSync(debugDir)
        .filter(file => file.includes(basename));

      for (const file of relatedDebugFiles) {
        fs.unlinkSync(path.join(debugDir, file));
      }
    }

    // Redirect to the normal process endpoint
    console.log('🔄 Reprocessing image:', image_path);

    // Use the normal process endpoint logic
    const options = {
      args: [absoluteImagePath],
      pythonOptions: ['-u'],
      mode: 'text',
      pythonPath: 'python',
      scriptPath: path.join(__dirname, '../'),
      timeout: 60000
    };

    let output = [];
    let errorOutput = [];

    let pyshell = new PythonShell('process_image.py', options);

    pyshell.on('message', (message) => {
      output.push(message);
    });

    pyshell.on('stderr', (stderr) => {
      errorOutput.push(stderr);
    });

    await new Promise((resolve, reject) => {
      pyshell.end((err, code, signal) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    if (output.length === 0) {
      throw new Error(`No output from Python script during reprocessing`);
    }

    const fullOutput = output.join('').trim();
    const parsedResult = JSON.parse(fullOutput);

    // Check for errors
    if (parsedResult.error) {
      throw new Error(parsedResult.error);
    }

    // Process the result
    const processedFilename = path.basename(image_path);
    const processedImageUrl = parsedResult.image_url || `/uploads/processed_${processedFilename}`;

    const response = {
      message: 'Image reprocessed successfully',
      transformed_image_url: processedImageUrl,
      ball_positions: parsedResult.ball_positions || [],
      original_dimensions: parsedResult.original_dimensions || null,
      table_bounds: parsedResult.table_bounds || null
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Error during image reprocessing:', error);
    res.status(500).json({
      error: 'Error reprocessing image: ' + error.message,
      transformed_image_url: `/uploads/processed_${path.basename(image_path)}`,
      ball_positions: [
        { "color": "white", "x": 200, "y": 200 },
        { "color": "black", "x": 400, "y": 200 }
      ]
    });
  }
});

module.exports = router;