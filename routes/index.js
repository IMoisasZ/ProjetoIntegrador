var express = require('express');
var router = express.Router();
const pagesController = require("../controllers/pages")

/* GET home page. */
router.get('/', pagesController.index)

/* GET main page. */
router.get('/main', pagesController.main)

module.exports = router;