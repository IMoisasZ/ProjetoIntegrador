const { Usuario, CoinUsuario } = require('../models')
const { check, validationResult, body } = require('express-validator')
const bcrypt = require('bcrypt');
const usersController = {
    signIn:async(req, res, next) => {
        res.render('signIn');
    },
    login: async (req, res, next) =>{
        let { user, senha } = req.body;
        let usuario = await Usuario.findOne({where:{email:user}});

        if(!usuario){
            return res.render('signIn', {notFound: true})
        }

        if(!bcrypt.compareSync(senha, usuario.senha)){
            return res.render('signIn', { notFound: true });
        }

        usuario.senha = undefined
        
        req.session.usuario = usuario;

        res.render('main',{usuarios: req.session.usuario, pontos});
    },
    logout:async (req, res, next) =>{
        req.session.destroy();
        res.redirect('/')
    },
    signUp: async (req, res, next) => {
        res.render('signUp')
    },
    createUser: async(req,res, next) =>{
        // verificando os erros para validação na criação do usuário
        
        let { nome_usuario, email, senha } = req.body

        let listaErros = (validationResult(req));
        if(listaErros.isEmpty()){
            
            // criptografar da senha para incluir no banco
            let senhaCrypt = bcrypt.hashSync(senha, 10) /* senha criptografada */
            
            // incluindo usuário no banco
            await Usuario.create({
                nome_usuario: nome_usuario,
                email: email,
                senha: senhaCrypt,
                status: 1 /* 1 = usuario ativo - 0 = usuario bloqueado */
            })

            //pegando o id do usuario cadastrado
            let idUser = await Usuario.findOne({where:{email}})

            //incluidon os pontos (8coins) iniciais pelo cadastro no sistema
            await CoinUsuario.create({
                id_usuario: idUser.id,
                pontos: 8,
                caminho: 'Cadastro inicial'
            })
            return res.render('signIn')
        }else{
            return res.render('signUp', {errors: listaErros.errors})
        }
    },
    config:(req, res, nex) =>{
        res.render('config',{usuarios: req.session.usuario})
    },
    excluirConta:(req,res,next) =>{
        res.render('excluirConta',{usuarios: req.session.usuario})
    }
    
}

module.exports = usersController;