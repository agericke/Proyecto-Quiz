var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');

var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express(); //Crea aplicacion express

// view engine setup
app.set('views', path.join(__dirname, 'views'));//Instalaparametro de views, se le pasa en ruta el views como directorio. join es un metodo del modulo path que asocia el directorio de quiz con el directorio views y crea el path
app.set('view engine', 'ejs');//Proque hemos puesto ejs al generar al proyecto. ejs es el renderizador utilizado por Ruby

app.use(partials());

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico')); //_dirname representa el directorio absoluto del sistema (donde est'a app.js (directorio quiz en nuestro caso))
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);//Instalar enrutadores. El index en la ruta base
//app.use('/users', users);//El segundo lo instalamos en la ruta users

// catch 404 and forward to error handler
//Va a estar asociadas a todo el resto de rutas que no sean las otras dos. Se ejecutara esto siempre que no sea una de las rutas definidas arriba
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {//parametro env de la aplicacion sea development (estamos en dfase esarrolo)
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            title: 'Error',
            message: err.message,
            error: err //print err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        title: 'Error',
        error: {}//Stack de errores esta vacio
    });
});

module.exports = app;
