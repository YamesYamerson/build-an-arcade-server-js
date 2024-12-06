const express = require('express');
const router = express.Router();
const matchmakingController = require('../controllers/matchmakingController');

router.post('/queue', matchmakingController.addToQueue);
router.get('/match', matchmakingController.getMatch);

module.exports = router;
