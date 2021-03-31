var express = require('express');
var router = express.Router();
const pagesController = require('../controllers/pages');

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

module.exports = router;