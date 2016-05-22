var models = require('../models/index.js');

//GET /quizzes Acción para mostrar el índice de preguntas
exports.index = function(req, res, next) {
  models
  .Quiz
  .findAll()
  .then(function(quizzes) {
    res.render('quizzes/index.ejs', { quizzes: quizzes, title:'Lista Preguntas'});
  })
  .catch(function(error) { next(error)});
};

// GET /question
// exports.question = function(req, res, next) {
//   models
//   .Quiz
//   .findOne() // Busca la primera pregunta
//   .then(function(quiz){
//     if (quiz) {
//       var answer = req.query.answer || '';
//       res
//       .render('quizzes/question', {title:'Intenta responder', question: '¿Capital de Italia?', answer: answer});  
//     }
//     else {
//       throw new Error('No hay preguntas en la BBDD');
//     }
//   }).catch(function (error) { next(error);});
// };

//GET /quizzes/:id
exports.show = function(req, res, next) {
  models
  .Quiz
  .findById(req.params.quizId)
  .then(function(quiz) {
    if (quiz) {
      var answer = req.query.answer || "";
      res.render("quizzes/show", {quiz: quiz, answer: answer, title:'Pregunta especifica'});
    } else { throw new Error('No existe ese quiz en la BBDD'); }
  })
  .catch(function(error) { next(error); });
};

//GET /quizzes/:id/check
exports.check = function(req,res, next) {
  models
  .Quiz
  .findById(req.params.quizId)
  .then(function (quiz) {
    if (quiz) {
      var answer = req.query.answer || "";
      var result = answer === quiz.answer ? 'Correcta' : 'Incorrecta';
      res.render('quizzes/result', { quiz:quiz, result:result, answer: answer, title:"Respuesta "+result });
    } else { throw new Error ('No existe ese quiz en la BBDD'); }
  })
  .catch(function (error){ next(error); });
};

// GET /check
// exports.check = function(req, res, next) {
//   models
//   .Quiz
//   .findOne() // Busca la primera pregunta
//   .then(function (quiz) {
//     if (quiz) {
//       var answer = req.query.answer || "";
//       var result = ((answer === 'Roma') ? 'Correcta' : 'Incorrecta');
//       res.render('quizzes/result', {result: result, title: 'Respuesta '+result, answer:answer});  
//     }
//     else {
//       throw new Error('No hay preguntas en la BBDD');
//     }
//   }).catch(function(error) { next(error);});
// };

//Get /author
exports.autor = function(req,res) {
    res.render('author', {title: 'Autor'});
}