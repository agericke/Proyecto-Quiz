var path = require('path');

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);

var DATABASE_PROTOCOL = url[1];
var DATABASE_DIALECT  = url[1];
var DATABASE_USER     = url[2];
var DATABASE_PASSWORD = url[3];
var DATABASE_HOST     = url[4];
var DATABASE_PORT     = url[5];
var DATABASE_NAME     = url[6];

var DATABASE_STORAGE  = process.env.DATABASE_STORAGE;

// Usar BBDD SQLite o Postgres
var sequelize = new Sequelize(DATABASE_NAME, 
    						  DATABASE_USER, 
							  DATABASE_PASSWORD, 
				              { dialect:  DATABASE_DIALECT, 
				                protocol: DATABASE_PROTOCOL, 
				                port:     DATABASE_PORT,
				                host:     DATABASE_HOST,
				                storage:  DATABASE_STORAGE,   // solo local (.env)
				                omitNull: true                // solo Postgres
				              });

// Importar la definicion de la tabla Quiz en quiz.js
var Quiz = sequelize.import(path.join(__dirname,'quiz'));

//Importar la definición de la tabla Comments de comment.js
var Comment = sequelize.import(path.join(__dirname,'comment'));

// Importar la definicion de la tabla Users de user.js
var User = sequelize.import(path.join(__dirname,'user'));

// Importar la definicion de la tabla Attachments de attachment.js
var Attachment = sequelize.import(path.join(__dirname,'attachment'));

//Relaciones 1 a entre Quiz y Comment:
Comment.belongsTo(Quiz); //Comment pertenece a un quiz
Quiz.hasMany(Comment); //quiz puede tener muchos comments

//Relacion 1 a N entre User y Quiz:
User.hasMany(Quiz, {foreignKey: 'AuthorId'});
Quiz.belongsTo(User, {as: 'Author', foreignKey: 'AuthorId'});

//Relación 1-a-1 entre Quiz y Attachment
Attachment.belongsTo(Quiz);
Quiz.hasOne(Attachment);

//RElación 1-a-N entre User y Comments
User.hasMany(Comment, {foreignKey: 'AuthorId'});
Comment.belongsTo(User, {as: 'Author', foreignKey: 'AuthorId'});

/* Usare Migraciones y Seeders

//sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize.
sync()
.then(function() { //sync() crea la tabbla quiz
    return Quiz.count().then(function (c) {
        if (c === 0) { // la tabla se inicializa si está vacía
            return Quiz
                .bulkCreate([{ question: 'Capital de Italia', answer:'Roma'},
                         { question:'Capital de Portugal', answer: 'Lisboa'}
                        ])
                .then(function () {
                    console.log('Base de datos inicializada con datos');
                });
        }
    });
}).catch(function(error) {
    console.log("Error Sincronizando las tablas de la BBDD:", error);
    process.exit(1);
});

*/

exports.Quiz = Quiz; // exportar definición de tabla Quiz
exports.Comment = Comment; //exportar definición de tabla Comments
exports.User = User; //exportar definicion de tabla Users
exports.Attachment = Attachment; //exportar definicion de tabla Attachments