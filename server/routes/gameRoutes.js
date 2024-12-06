const express = require('express');
const router = express.Router();

// Define routes
router.get('/', (req, res) => {
    res.send('Game Routes');
});

module.exports = router; // Export router
