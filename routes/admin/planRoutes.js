const express = require('express');
const router = express.Router();
const planController = require('../../controllers/admin/planController');
const { authenticateAdmin } = require('../../middleware/admin/authenticateAdmin');

router.use(authenticateAdmin);

router.get('/', planController.getPlans);
router.post('/', planController.createPlan);
router.patch('/:id', planController.updatePlan);
router.delete('/:id', planController.deletePlan);

module.exports = router;