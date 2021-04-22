var express = require('express');
var router = express.Router();
const pagesController = require('../controllers/pages');
const multer = require('multer')
const path = require('path');
const { check, validationResult, body } = require('express-validator')

// criando o processo para inclusão da imagem do curso
// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, path.join('uploads'))
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.originalname)
//     }
//   })
   
//   var upload = multer({ storage: storage })


/* GET learn page. */
router.get('/learn', pagesController.learn)

/* GET schedules page. */
router.get('/schedules', pagesController.schedules)

/* Post cancelar agendamento */
router.post('/schedules', pagesController.cancel)

/* GET new page. */
router.get('/new', pagesController.new)

/* Post agendar curso*/
router.post('/new', pagesController.schedule)

/* GET teach page. */
router.get('/teach', pagesController.teach)

/* GET requests page. */
router.get('/requests', pagesController.requests)

/* POST aceitar a solicitação de alteração de data. */
router.post('/requests/acept', pagesController.aceptSolicitation)

/* POST cancelar a solicitação de alteração de data. */
router.post('/requests/cancel', pagesController.cancelSolicitation)

/*GET Create page. */
router.get('/create', pagesController.create)

/*POST incluir curso. */
router.post('/create', pagesController.public)

/*GET verificar cursos publicados. */
router.get('/create/publicated', pagesController.publicated)

/*GET verificar cursos cancelados. */
router.get('/create/publicated/cancel', pagesController.cancelCourse)

/*GET verificar cursos agendados. */
router.get('/create/publicated/scheduled', pagesController.scheduled)

/*GET verificar cursos iniciados. */
router.get('/create/publicated/started', pagesController.started)

/*GET verificar cursos concluidos. */
router.get('/create/publicated/finished', pagesController.finished)

/*GET concluir curso. */
router.get('/create/publicated/finish/:id_curso', pagesController.finish)

/*PUT alterar dados do curso. Necessário arrumar */
router.post('/create/publicated/finish/:id_curso', pagesController.finish_course)

/*PUT alterar dados do curso. Necessário arrumar */
router.post('/create/publicated/cancel/:id_curso', pagesController.courseCancel)

/*PUT alterar dados do curso. Necessário arrumar */
router.get('/create/publicated/edit/:id_curso', pagesController.edit)

/*PUT alterar dados do curso. Necessário arrumar */
router.post('/create/publicated/update/:id_curso', pagesController.update)

/*GET mostrar os dados curso para poder iniciar o mesmo */
router.get('/create/publicated/start/:id_curso', pagesController.start)

/*PUT iniciar o curso. Necessário arrumar */
router.post('/create/publicated/start/:id_curso', pagesController.start_course)



module.exports = router;