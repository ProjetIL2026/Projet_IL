const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, salonController.creer);
router.get('/mes-salons', authMiddleware, salonController.mesSalons);
router.get('/:code', authMiddleware, salonController.getSalon);

module.exports = router;