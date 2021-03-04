const usersController = {

    signIn:(req, res, next) => {
        res.render('signIn')
    },
    signUp:(req, res, next) => {
        res.render('signUp')
    }
}

module.exports = usersController;