const mainController = {

    learn:(req, res, next) => {
        res.render("learn")
    },

    learnmine:(req, res, next) => {
        res.render("learnmine")
    },

    new:(req, res, next) => {
        res.render("new")
    },

    teach:(req, res, next) => {
        res.render("teach")

    },

    teachnew:(req, res, next) => {
        res.render("teachnew")

    },

    teachmine:(req, res, next) => {
        res.render("teachmine")
    },

    config:(req, res, nex) =>{
        res.render('config')
    },

    delete:(req,res,next) =>{
        res.render('delete')
    },
    advanced:(req, res, next) => {
        res.render("advanced")
    },
    beginner:(req, res, next) => {
        res.render("beginner")
    },
    intensive:(req, res, next) => {
        res.render("intensive")
    }
}

module.exports = mainController;