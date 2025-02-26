const { PythonShell } = require('python-shell');

const image_path = 'uploads/1740537190465_Pool-Table-test1.jpg';
console.log('📥 Testing PythonShell with image:', image_path);

const options = {
  args: [image_path],
  pythonOptions: ['-u'], // ✅ Forces unbuffered output from Python
};

const pyshell = new PythonShell('process_image.py', options);

// ✅ Capture standard output
pyshell.on('message', function (message) {
  console.log('📤 Python Output:', message);
});

// ✅ Capture errors
pyshell.on('error', function (err) {
  console.error('❌ PythonShell Error:', err);
});

// ✅ Detect when Python script exits
pyshell.end(function (err) {
  if (err) {
    console.error('❌ PythonShell Execution Failed:', err);
  } else {
    console.log('✅ Python script finished successfully');
  }
});
