var models = require('../models/index.js');

// GET /question
exports.question = function(req, res, next) {
  models
  .Quiz
  .findOne() // Busca la primera pregunta
  .then(function(quiz){
    if (quiz) {
      var answer = req.query.answer || '';
      res
      .render('quizzes/question', {title:'Intenta responder', question: '¿Capital de Italia?', answer: answer});  
    }
    else {
      throw new Error('No hay preguntas en la BBDD');
    }
  }).catch(function (error) { next(error);});
};

// GET /check
exports.check = function(req, res, next) {
  models
  .Quiz
  .findOne() // Busca la primera pregunta
  .then(function (quiz) {
    if (quiz) {
      var answer = req.query.answer || "";
      var result = ((answer === 'Roma') ? 'Correcta' : 'Incorrecta');
      res.render('quizzes/result', {result: result, title: 'Respuesta '+result, answer:answer});  
    }
    else {
      throw new Error('No hay preguntas en la BBDD');
    }
  }).catch(function(error) { next(error);});
};

//Get /author
exports.autor = function(req,res) {
    res.render('author', {title: 'Autor'});
}