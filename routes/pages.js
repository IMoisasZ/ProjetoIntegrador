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

/*GET verificar cursos agendados. */
router.get('/create/learnCourses', pagesController.myCourses)

/*PUT cancelar agendamentos. */
router.post('/create/learnCourses/:id_curso', pagesController.cancelSchedule)

/*GET verificar cursos iniciados. */
router.get('/create/learnCourses/startedCourses', pagesController.startedCourses)

/*GET verificar agendamentos cancelados. */
router.get('/create/learnCourses/canceledSchedule', pagesController.canceledSchedule)

/*GET verificar cursos concluidos. */
router.get('/create/learnCourses/finishedSchedule', pagesController.finishedSchedule)

/*GET enviar mensagens */
router.get('/create/message', pagesController.message)

/*POST enviar mensagens */
router.post('/create/message/:id_message', pagesController.messageChecked)

/*GET enviar mensagens */
router.get('/create/message/sendMessage/:id_curso', pagesController.sendMessageDados)

/*POST enviar mensagens */
router.post('/create/message/sendMessage', pagesController.sendMessage)

/*GET enviar mensagens */
router.get('/create/message/readMessages', pagesController.readMessages)

/*GET enviar mensagens */
router.get('/create/message/unreadMessages', pagesController.unreadMessages)

module.exports = router;