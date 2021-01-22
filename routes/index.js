var express = require('express');
var router = express.Router();
const ControllerPaginas = require("../Controller/ControllerPaginas")

/* GET home page. */
router.get('/', ControllerPaginas.index)

module.exports = router;
