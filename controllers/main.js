const mainController = {
    
    index:(req, res, next) =>{
        res.render('index')
    },
    main:async(req, res, next) => {
        res.render('main',{usuarios: req.session.usuario})
    }
}

module.exports = mainController;