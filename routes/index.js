var express = require('express');
var router = express.Router();//Generamos enrutador

//Importamos el controlador
var quizController = require('../controllers/quiz_controller');

/* GET home page. */
router.get('/', function(req, res) {//Metemos el get al pth vacio, raiz.
  res.render('index', { title: 'Cambiando titulos' });
});

router.get('/question', quizController.question);
router.get('/check', quizController.check);

router.get('/author', quizController.autor);

module.exports = router;
