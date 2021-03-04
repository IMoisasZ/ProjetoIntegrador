var express = require('express');
var router = express.Router();
const usersController = require("../controllers/users")

/* signIn */
router.get('/signIn', usersController.signIn)

/* signUp */
router.get('/signUp', usersController.signUp)

/* signUp */
router.get('/signUp', usersController.signUp)

module.exports = router;
 