const { PythonShell } = require('python-shell');  

const options = { 
    args: ["uploads/1740537190465_Pool-Table-test1.jpg"], 
    pythonOptions: ['-u']  // ✅ Ensures real-time output
};

console.log("🚀 Running PythonShell...");

const shell = new PythonShell("process_image.py", options);

// ✅ Capture stdout from Python
shell.on("message", (message) => {
    console.log("🐍 Python Output:", message);
});

// ✅ Capture errors
shell.on("stderr", (stderr) => {
    console.error("❌ Python Error:", stderr);
});

// ✅ Detect when script is finished
shell.end((err, code, signal) => {
    if (err) {
        console.error("❌ PythonShell error:", err);
    } else {
        console.log("✅ Python script finished successfully with exit code:", code);
    }
});
