var models = require('../models/models.js');

// GET /quizes/question
exports.question = function(req, res) {
  models.Quiz.findAll().success(function(quiz) {
    res.render('quizes/question', { pregunta: quiz[0].pregunta, title: 'Intenta responder'});
  })
};

// GET /quizes/answer
exports.answer = function(req, res) {
  models.Quiz.findAll().success(function(quiz) {
    if (req.query.respuesta === quiz[0].respuesta) {
      res.render('quizes/answer', { respuesta: 'Correcto', title: 'Repuesta Buena'});
    } else {
      res.render('quizes/answer', { respuesta: 'Incorrecto', title: 'Respuesta mala'});
    }
  })
};

//Get /author
exports.autor = function(req,res) {
    res.render('author', {title: 'Autor'});
}