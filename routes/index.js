var express = require('express');
var router = express.Router();
const pagesController = require("../controllers/pages")

/* GET home page. */
router.get('/', pagesController.index)

module.exports = router;