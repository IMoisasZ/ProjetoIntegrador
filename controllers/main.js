const mainController = {

    learn:(req, res, next) => {
        res.render("learn")
    },
    teach:(req, res, next) => {
        res.render("teach")
    },
    config:(req, res, nex) =>{
        res.render('config')
    },
    delete:(req,res,next) =>{
        res.render('delete')
    }
}

module.exports = mainController;