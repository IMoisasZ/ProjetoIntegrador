const { CoinUsuario } = require("../models")

const mainController = {
    
    index:(req, res, next) =>{
        res.render('index')
    },
    main:async(req, res, next) => {
        req.session.usuario.coin = await CoinUsuario.sum('coin',{
            where: {id_usuario: req.session.usuario.id}
        })
        res.render('main',{usuarios: req.session.usuario})
    }
}

module.exports = mainController;