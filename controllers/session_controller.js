var userController = require('./user_controller');

// MW que permite acciones solamente si al usuario logeado es admin o rl propio usuario.
exports.adminOrMyselfRequired = function(req, res, next){

    var isAdmin      = req.session.user.isAdmin;
    var userId       = req.user.id;
    var loggedUserId = req.session.user.id;

    if (isAdmin || userId === loggedUserId) {
        next();
    } else {
      console.log('Ruta prohibida: no es el usuario logeado, ni un administrador.');
      res.send(403);    }
};

exports.adminAndNotMyselfRequired = function(req, res, next){

    var isAdmin      = req.session.user.isAdmin;
    var userId       = req.user.id;
    var loggedUserId = req.session.user.id;

    if (isAdmin && userId !== loggedUserId) {
        next();
    } else {
      console.log('Ruta prohibida: no es el usuario logeado, ni un administrador.');
      res.send(403);    }
};

// Middleware: Se requiere hacer login.
//
// Si el usuario ya hizo login anteriormente entonces existira 
// el objeto user en req.session, por lo que continuo con los demas 
// middlewares o rutas.
// Si no existe req.session.user, entonces es que aun no he hecho 
// login, por lo que me redireccionan a una pantalla de login. 
// Guardo en redir cual es mi url para volver automaticamente a 
// esa url despues de hacer login; pero si redir ya existe entonces
// conservo su valor.
// 
exports.loginRequired = function (req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/session?redir=' + (req.param('redir') || req.url));
    }
};

// GET /session   -- Formulario de login
exports.new = function(req, res, next) {
    res.render('session/new', {redir: req.query.redir || '/', title:"Log in"});
};


// POST /session   -- Crear la sesion si usuario se autentica
exports.create = function(req, res, next) {
    
    var redir = req.body.redir || '/';
    var login     = req.body.login;
    var password  = req.body.password;

    userController.autenticar(login, password)
        .then(function(user) {
            
            var hora = new Date();
	        // Crear req.session.user y guardar campos id y username
	        // La sesión se define por la existencia de: req.session.user
	        req.session.user = {id:user.id, username:user.username, isAdmin: user.isAdmin, expires: hora.valueOf()};

	        res.redirect(redir); // redirección a la raiz
		})
		.catch(function(error) {
            req.flash('error', 'Se ha producido un error: ' + error);
            res.redirect("/session?redir="+redir);        
    });
};


// DELETE /session   -- Destruir sesion 
exports.destroy = function(req, res, next) {

    delete req.session.user;
    
    res.redirect("/session"); // redirect a login
};