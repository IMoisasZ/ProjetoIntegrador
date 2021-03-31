var express = require('express');
var router = express.Router();
const mainController = require("../controllers/main")

/* GET home page. */
router.get('/', mainController.index)

/* GET main page */
router.get('/main', mainController.main)

module.exports = router;