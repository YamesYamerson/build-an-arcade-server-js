const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Default route: Send a fallback response if `index.html` is missing
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Arcade Server</h1><p>No index.html file found. Add one in the public directory.</p>');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
