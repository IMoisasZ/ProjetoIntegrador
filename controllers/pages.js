const pagesController = {

    index:(req, res, next) =>{
        res.render("index")
    },
    main:(req, res, next) => {
        res.render("main")
    }
}

module.exports = pagesController;