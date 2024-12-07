const express = require('express');
const path = require('path');

const app = express();

// Update the static file directory to the root if files are moved there
app.use(express.static(path.join(__dirname, '.'))); // Serves files relative to the project root

// Serve the index.html file explicitly
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Update the path to the new location
});
