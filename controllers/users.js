const { Usuario, CoinUsuario, CursoPublicado, CursoAgendado, Message } = require('../models')
const { check, validationResult, body } = require('express-validator')
const {Op} = require('sequelize')
const bcrypt = require('bcrypt');
const usersController = {
    signIn:async(req, res, next) => {
        res.render('signIn');
    },
    login: async (req, res, next) =>{
        let { user, senha } = req.body;
        let usuario = await Usuario.findOne({
            where:{
                email: user
            },
        });

        if(!usuario){
            return res.render('signIn', {notFound: true})
        }


        if(!bcrypt.compareSync(senha, usuario.senha)){
            return res.render('signIn', { notFound: true });
        }

        let usuarioJson = await usuario.toJSON()

        usuarioJson.senha = undefined
        
        req.session.usuario = usuarioJson;

        res.redirect('/main')
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
                status: 1, /* 1 = usuario ativo - 0 = usuario bloqueado */
                tipo_usuario: 0 /* 0 = usuario Administrador; 1 = usuario padrão */
            })

            //pegando o id do usuario cadastrado
            let idUser = await Usuario.findOne({where:{email}})

            //incluidon os pontos (8coins) iniciais pelo cadastro no sistema
            await CoinUsuario.create({
                tipo: 'I', /* I = IN (se cadastrou no sistema)*/
                coin: 8,
                caminho: 'Cadastro inicial',
                id_usuario: idUser.id
            })

            /*mensages*/
            await Message.create({
                id_curso: "",
                mensagem: "Seja bem vindo ao CONNEKT. Você ganhou 8 Coins para iniciar na nossa plataforma! Bora aprender e ensinar!",
                de: "",
                para: idUser.id,
                lida: false,
                tipo: "SISTEMA"
            })

            return res.render('signUp', {sucesso: true})
        }else{
            return res.render('signUp', {errors: listaErros.errors})
        }
    },
    config: async (req, res, nex) =>{
        let coinTotal = await CoinUsuario.findAll({
            where:{
                id_usuario: req.session.usuario.id,
                tipo:
                {[Op.ne]:['I']}
            }
        })

        console.log(coinTotal);
        
        let configEnsinando = 0
        let configAprendendo = 0
        
        coinTotal.forEach(element =>{
            if(element.coin < 0){
                configAprendendo += element.coin
                configEnsinando += 0
            }
            if(element.coin > 0){
                configAprendendo += 0
                configEnsinando += element.coin 
            }
        })

        configEnsinando = Math.abs(configEnsinando)
        configAprendendo =  Math.abs(configAprendendo)

        res.render('config',{usuarios: req.session.usuario, ensinando: configEnsinando, aprendendo: configAprendendo})
    },
    excluirConta: async (req,res,next) =>{
        let ensinando = await CursoPublicado.findAll({
            where:{
                id_usuario: req.session.usuario.id,
                id_status_curso: 6
            }
        })

        let configEnsinando = 0
        if(typeof(ensinando) !== "undefined"){
            ensinando.forEach(element =>{
                configEnsinando += element.carga_horaria
            })
        }     

        let aprendendo = await CursoAgendado.findAll({
            where:{
                id_usuario_agendamento: req.session.usuario.id,
            }
        })

        let configAprendendo = 0
        if(typeof(aprendendo) !== "undefined"){
            for(let i = 0; i < ensinando.length; i++){
                for(let j = 0; j < aprendendo.length; j++){
                    if(ensinando.id === aprendendo.id_usuario_agendamento){
                        configAprendendo += ensinando.carga_horaria 
                    }
                }
            }
        }

        res.render('excluirConta',{usuarios: req.session.usuario, ensinando: configEnsinando, aprendendo: configAprendendo})
    }
    
}

module.exports = usersController;