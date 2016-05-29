var express = require('express');
var router = express.Router();//Generamos enrutador

//Importamos el controlador
var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');

/* GET home page. */
router.get('/', function(req, res) {//Metemos el get al pth vacio, raiz.
  res.render('index', { title: 'Cambiando titulos' });
});

//Aoutoload de rutas que usen :quizId
//Si existe parámetro quizId en la ruta, entonces invoca
//quizController.load ( ejecuta funcion autoload y queda cargada)
router.param('quizId', quizController.load); //autoload :quizId
//Se instala para que se ejecute antes que lo necesiten
//las rutas show y answer y solo en caso de que path contenga :id

//DEfinicion de rutas de /quizzes
router.get('/quizzes', quizController.index);
router.get('/quizzes/:quizId(\\d+)', quizController.show);
router.get('/quizzes/:quizId(\\d+)/check', quizController.check);
router.get('/quizzes/new', quizController.new);
router.post('/quizzes', quizController.create);
router.get('/search', quizController.search);
router.get('/quizzes/:quizId(\\d+)/edit', quizController.edit);
router.put('/quizzes/:quizId(\\d+)', quizController.update);
router.delete('/quizzes/:quizId(\\d+)', quizController.destroy);
router.get('/author', quizController.autor);

router.get('/quizzes/:quizId(\\d+)/comments/new', commentController.new);
router.post('/quizzes/:quizId(\\d+)/comments', commentController.create);

module.exports = router;