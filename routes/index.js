var express = require('express');
var router = express.Router();//Generamos enrutador

/* GET home page. */
router.get('/', function(req, res) {//Metemos el get al pth vacio, raiz.
  res.render('index', { title: 'Quiz' });
});

module.exports = router;
