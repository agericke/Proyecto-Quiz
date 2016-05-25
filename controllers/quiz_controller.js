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
exports.search = function(req, res, next) {
  var search1 = req.query.search1 || "";
  models
  .Quiz
  .findAll({where: {question: {$like: "%"+search1+"%"}}, order:['question']})
  .then(function(quizzes) {
    if (quizzes){
      res.render('quizzes/index.ejs', { quizzes: quizzes, title:'Lista Preguntas de search1'}); 
    } else  {throw new Error('No existe ese quiz en la BBDD');}
  })
  .catch(function(error) { next(error)}); 
};

//GET /quizzes Acción para mostrar el índice de preguntas
exports.index = function(req, res, next) {
  var search = req.query.search || "";
  models
  .Quiz
  .findAll({where: {question: {$like: "%"+search+"%"}}, order:[['question', 'DESC']] })
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

//GET /quizzes/new
exports.new = function(req, res, next) {
  var quiz = models.Quiz.build({question:"", answer: ""});
  res.render("quizzes/new", {quiz: quiz, title: "Pregunta Nueva"});
};

//POST /quizzes/create
exports.create = function(req, res, next) {
  var quiz = models.Quiz.build({ question: req.body.quiz.question,
                                 answer: req.body.quiz.answer});
  
//guarda en DB los campos pregunta y respuesta de quiz
  quiz.save({fields: ["question", "answer"]})
    .then(function(quiz) {
      req.flash('success', 'Quiz creado con éxito.');
      res.redirect('/quizzes'); //res.redirect:
    })                          // Redirección HTTP a lista de preguntas
    .catch(function(error) {
      req.flash('error', 'Error al crear un Quiz: '+error.message);
      next(error);
    });
};