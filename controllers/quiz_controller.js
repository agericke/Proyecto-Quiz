var models = require('../models/models.js');

// GET /question
exports.question = function(req, res, next) {
  var answer = req.query.answer || '';
  res.render('quizzes/question', {title:'Intenta responder', question: '¿Capital de Italia?', answer: answer});
};

// GET /check
exports.check = function(req, res, next) {
  var answer = req.query.answer || "";
  
  var result = ((answer === 'Roma') ? 'Correcta' : 'Incorrecta');
  res.render('quizzes/result', {result: result, title: 'Respuesta '+result, answer:answer});
};

//Get /author
exports.autor = function(req,res) {
    res.render('author', {title: 'Autor'});
}