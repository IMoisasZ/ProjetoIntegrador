var express = require('express');
var router = express.Router();
const usersController = require("../controllers/users")
const { check, validationResult, body } = require('express-validator')
const { Usuario } = require('../models')

/* GET users listing. */

/* signIn */
router.get('/signIn', usersController.signIn)

/* login */
router.post('/signIn', usersController.login)

/* logout */
router.post('/signIn/logout', usersController.logout)

/* signUp */
router.get('/signUp', usersController.signUp)

/* createUser */ 
router.post('/signUp', 
[
    check("nome_usuario").isLength({min:3}).withMessage('Usuário não informado ou não atende aos requisitos!'),
    check("email").isEmail().withMessage('Email não digitado ou incorreto!'),
    check("senha").isLength({min:6}).withMessage('Senha não informada ou não atende aos requisitos! A senha deve conter no mínimo 6 caracteres!')
    // body("email").custom(async (email) => {
    //     let user = await Usuario.findOne({where:{email:email}});

    //     return user.email !== email;
    // }).withMessage('Usuário já cadastrado!')
],
usersController.createUser) 

/* config */
router.get('/config', usersController.config)

/* delete account */
router.get('/delete', usersController.excluirConta)

module.exports = router;
 