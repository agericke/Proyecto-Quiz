var models = require('../models/index.js');

//Autoload el quiz asociado a :quizId
exports.load = function(req, res, next, quizId) {
  models.Quiz.findById(quizId)
    .then(function(quiz) {
        if (quiz) {
          req.quiz = quiz;
          next();
        } else {
          next(new Error('No existe quizId=' +quizId));
        }
    }).catch(function(error) { next(error); })
};

//GET /quizzes Acción para mostrar el índice de preguntas
exports.index = function(req, res, next) {
  var search = req.query.search || "";
  models
  .Quiz
  .findAll({where: {question: {$like: "%"+search+"%"}}})
  .then(function(quizzes) {
    if (quizzes){
      res.render('quizzes/index.ejs', { quizzes: quizzes, title:'Lista Preguntas'}); 
    } else  {throw new Error('No existe ese quiz en la BBDD');}
  })
  .catch(function(error) { next(error)}); 
};

//GET /quizzes/:id
exports.show = function(req, res, next) {
  var answer = req.query.answer || "";
  res.render("quizzes/show", {quiz: req.quiz, answer: answer, title:'Pregunta especifica'});
};

//GET /quizzes/:id/check
exports.check = function(req,res, next) {
  var answer = req.query.answer || "";
  var result = answer === req.quiz.answer ? 'Correcta' : 'Incorrecta';
  res.render('quizzes/result', { quiz: req.quiz, result:result, answer: answer, title:"Respuesta "+result });
};

//Get /author
exports.autor = function(req,res) {
    res.render('author', {title: 'Autor'});
}