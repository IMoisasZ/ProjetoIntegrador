var express = require('express');
var router = express.Router();
const usersController = require("../controllers/users")

/* GET users listing. */
// router.get('/cadastrarUsuario', ControllerUsuarios.cadastrarUsuario)

/* signIn */
router.get('/signIn', usersController.signIn)

/* signUp */
router.get('/signUp', usersController.signUp)

/* config */
router.get('/config', usersController.config)

/* excluir conta */
router.get('/excluirConta', usersController.excluirConta)

module.exports = router;
 