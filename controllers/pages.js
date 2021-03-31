const pagesController = {
    
    learn:(req, res, next) => {
        res.render("learn",{usuarios: req.session.usuario})
    },
    schedules:(req, res, next) => {
        res.render("schedules",{usuarios: req.session.usuario})
    },
    new:(req, res, next) => {
        res.render("new",{usuarios: req.session.usuario})
    },
    teach:(req, res, next) => {
        res.render("teach",{usuarios: req.session.usuario})
    },
    requests:(req, res, next) => {
        res.render("requests",{usuarios: req.session.usuario})
    },
    create:(req, res, next) =>{
        res.render('create',{usuarios: req.session.usuario})
    }
}

module.exports = pagesController;