const {Op} = require('sequelize')
const { CoinUsuario, Message } = require("../models")

const mainController = {
    
    index:(req, res, next) =>{
        res.render('index')
    },
    main:async(req, res, next) => {
        req.session.usuario.coin = await CoinUsuario.sum('coin',{
            where: {id_usuario: req.session.usuario.id}
        })

        let message = await Message.findAll({
            where:{
                para: req.session.usuario.id,
                lida: false
            }
        })

        req.session.usuario.msg = message.length

        res.render('main',{usuarios: req.session.usuario})
    }
}

module.exports = mainController;