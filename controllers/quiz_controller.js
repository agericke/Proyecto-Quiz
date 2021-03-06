var models = require('../models/index.js');
var Sequelize = require('sequelize');
var cloudinary = require('cloudinary');
var fs = require('fs');

//Opciones para imágenes subidas a cloudinary
var cloudinary_image_options = { crop: 'limit', width: 200, height: 200, radius: 5, 
                                 border: "3px_solid_blue", tags: ['core', 'quiz-2016'] };

//Autoload el quiz asociado a :quizId
exports.load = function(req, res, next, quizId) {
  models.Quiz.findById(quizId, {include: [ {model:models.Attachment}, {model:models.Comment, include:[{model:models.User, as:'Author'}]}]})
    .then(function(quiz) {
        if (quiz) {
          req.quiz = quiz;
          next();
        } else {
          next(new Error('No existe quizId=' +quizId));
        }
    }).catch(function(error) { next(error); });
};

// MW que permite acciones solamente si al usuario logeado es admin o es el autor del quiz.
exports.ownershipRequired = function(req, res, next){

    var isAdmin      = req.session.user.isAdmin;
    var quizAuthorId = req.quiz.AuthorId;
    var loggedUserId = req.session.user.id;

    if (isAdmin || quizAuthorId === loggedUserId) {
        next();
    } else {
      console.log('Operación prohibida: El usuario logeado no es el autor del quiz, ni un administrador.');
      res.send(403);
    }
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
  .findAll({where: {question: {$like: "%"+search+"%"}}, order:[['question', 'DESC']], include: [ models.Attachment ] })
  .then(function(quizzes) {
    
    //Compruebo el formato con el que se envía la petición
    if ((!req.params.format) || (req.params.format === "html")){
      if (quizzes){
      res.render('quizzes/index.ejs', { quizzes: quizzes, title:'Lista Preguntas'}); 
      } else  {throw new Error('No existe ese quiz en la BBDD');} 
    }
    else if (req.params.format ==="json") {
      res.send(JSON.stringify(quizzes)); 
    }
    else {
       throw new Error('No se admite format=' + req.params.format);
    }
  })
  .catch(function(error) { 
    next(error)
  }); 
};

//GET /quizzes/:quizId
exports.show = function(req, res, next) {
  var answer = req.query.answer || "";
  if ((!req.params.format) || (req.params.fotmat === "html")){
    res.render("quizzes/show", {quiz: req.quiz, answer: answer, title:'Pregunta especifica'}); 
  }
  else if (req.params.format === 'json') {
    res.send(JSON.stringify(req.quiz));
  }
  else {
    next(new Error ('No se admite format=' +req.params.format));
  }
};

//GET /quizzes/:quizId/check
exports.check = function(req,res, next) {
  var answer = req.query.answer || "";
  var result = answer === req.quiz.answer ? 'Correcta' : 'Incorrecta';
  res.render('quizzes/result', { quiz: req.quiz, result:result, answer: answer, title:"Respuesta "+result });
};

//Get /author
exports.autor = function(req,res) {
    res.render('author', {title: 'Autor'});
};

//GET /quizzes/new
exports.new = function(req, res, next) {
  var quiz = models.Quiz.build({question:"", answer: ""});
  res.render("quizzes/new", {quiz: quiz, title: "Pregunta Nueva"});
};

//POST /quizzes/create
exports.create = function(req, res, next) {
  
  var authorId = req.session.user && req.session.user.id || 0;
  var quiz = { question: req.body.question, 
               answer:   req.body.answer,
               AuthorId: authorId };
    
  // Guarda en la tabla Quizzes el nuevo quiz.
  models.Quiz.create(quiz)
  .then(function(quiz) {
      req.flash('success', 'Pregunta y Respuesta guardadas con éxito.');

      if (!req.file) { 
          req.flash('info', 'Es un Quiz sin imagen.');
          return; 
      }    

       // Salvar la imagen en Cloudinary
      return new Promise(function(resolve,reject) {
          var path = req.file.path;
          cloudinary.uploader.upload(path, function(result) {
                  fs.unlink(req.file.path); // borrar la imagen subida a ./uploads

                  if (! result.error) {
                      resolve({ public_id: result.public_id,
                                url: result.secure_url,
                                filename: req.file.originalname,
                                mime: req.file.mimetype,
                                QuizId: quiz.id });
                  } else {
                      req.flash('error', 'No se ha podido salvar la imagen: '+result.error.message);
                      resolve(null);
                  }
              },
              cloudinary_image_options
          );
      })
      .then(function(attachmentData) { // Guardar attachment y relacion en la BBDD.

          if (attachmentData) {
              return models.Attachment.create(attachmentData)
                  .then(function(attachment) {
                      req.flash('success', 'Imagen guardada con éxito.');
                  })
                  .catch(function(error) { // Ignoro errores de validacion en imagenes
                      req.flash('error', 'No se ha podido salvar la imagen: '+error.message);
                      cloudinary.api.delete_resources(attachmentData.public_id, function(result) {
                          if (result.error) {
                              req.flash('error', 'Borrando en Cloudinary: '+result.error.message);
                          }
                      });
                  });
          }
      })
  })
  .then(function() {
      res.redirect('/quizzes');
  })                          // Redirección HTTP a lista de preguntas
    .catch(Sequelize.ValidationError, function(error) {
      
      req.flash('error', 'Errores en el formulario: ');
      for (var i in error.errors) {
        req.flash('error', error.errors[i].value);
      }
      
      res.render('quizzes/new', {quiz: quiz, title:"Pregunta nueva"});
    }) 
    .catch(function(error) {
      req.flash('error', 'Error al crear un Quiz: '+error.message);
      next(error);
    });
};

// GET /quizzes/:quizId/edit
exports.edit = function (req, res, next){
  var quiz = req.quiz; //req.quiz: autoload de instrancia de quiz
  res.render('quizzes/edit', {quiz:quiz, title:"Editar pregunta"});
};

// PUT /quizzes/:quizId
exports.update = function(req, res, next){
  
  req.quiz.question = req.body.question;
  req.quiz.answer = req.body.answer;
  
  req.quiz.save({fields:["question", "answer"]})
    .then(function(quiz) {
          req.flash('success', 'Pregunta y Respuesta editadas con éxito.');

        if (!req.file) { 
            req.flash('info', 'No se ha cambiado la imagen ya existente.');
            return; 
        }  

        // Borrar la imagen antigua de Cloudinary (Ignoro resultado)
        cloudinary.api.delete_resources(req.quiz.Attachment.public_id);

        // Eliminar la imagen antigua de la tabla Attachments
        return quiz.Attachment.destroy()
            .then(function() {

                // Salvar la imagen nueva en Cloudinary
                return new Promise(function(resolve,reject) {
         
                    cloudinary.uploader.upload(req.file.path, function(result) {
                            fs.unlink(req.file.path); // borrar la imagen subida a ./uploads

                            if (! result.error) {
                                resolve({ public_id: result.public_id,
                                          url: result.secure_url,
                                          filename: req.file.originalname,
                                          mime: req.file.mimetype,
                                          QuizId: quiz.id });
                            } else {
                                req.flash('error', 'No se ha podido salvar la nueva imagen: '+result.error.message);
                                resolve(null);
                            }
                        },
                        cloudinary_image_options
                    );
                })
                .then(function(attachmentData) { // Guardar attachment y relacion en la BBDD.

                    if (attachmentData) {
                        return models.Attachment.create(attachmentData)
                            .then(function(attachment) {
                                req.flash('success', 'Imagen nueva guardada con éxito.');
                            })
                            .catch(function(error) { // Ignoro errores de validacion en imagenes
                                req.flash('error', 'No se ha podido salvar la nueva imagen: '+error.message);
                                cloudinary.api.delete_resources(attachmentData.public_id);
                            });
                    }
                });
            });
    })            
    .then(function() {
        res.redirect('/quizzes');
    })
    .catch(Sequelize.ValidationError, function(error) {
      req.flash('error', 'Errores en el formulario: ');
      for (var i in error.errors) {
        req.flash('error', error.errors[i].value);
      };
      
      res.render('quizzes/edit', {quiz: req.quiz, title:"Edite de nuevo"});
    })
    .catch(function(error) {
      req.flash('error', 'Error al editar Quiz: '+error.message);
      next(error);
    });
};

//DELETE /quizzes/:quizId
exports.destroy = function(req, res, next) {
  
  // Borrar la imagen de Cloudinary (Ignoro resultado)
  if(req.quiz.Attachment) { 
    cloudinary.api.delete_resources(req.quiz.Attachment.public_id);
  }
 
  req.quiz.destroy()
  .then( function() {
    req.flash('success', 'Quiz borrado con éxito.');
    res.redirect('/quizzes');
  })
  .catch(function(error) {
    req.flash('error', 'Error al editar el Quiz: '+error.message);
    next(error);
  });
};