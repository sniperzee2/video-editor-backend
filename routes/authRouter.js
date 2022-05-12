const router = require('express').Router();
const {login} = require('../controllers/authController');

router.post('/create_new_storage', login);


module.exports = router;
