var express = require('express');
var router = express.Router();
const pagesController = require('../controllers/pages');
const multer = require('multer')
const path = require('path')

//criando o processo para inclusão da imagem do curso
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join('uploads'))
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
   
  var upload = multer({ storage: storage })


/* GET learn page. */
router.get('/learn', pagesController.learn)

/* GET schedules page. */
router.get('/schedules', pagesController.schedules)

/* GET new page. */
router.get('/new', pagesController.new)

/* GET teach page. */
router.get('/teach', pagesController.teach)

/* GET requests page. */
router.get('/requests', pagesController.requests)

/*GET Create page. */
router.get('/create', pagesController.create)

/*GET incluir curso. */
router.post('/create', upload.any(), pagesController.public)

module.exports = router;