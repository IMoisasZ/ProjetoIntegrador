var express = require('express');
var router = express.Router();
const ControllerUsuarios = require("../Controller/ControllerUsuarios")

/* GET users listing. */
router.get('/cadastrarUsuario', ControllerUsuarios.cadastrarUsuario)

module.exports = router;
 