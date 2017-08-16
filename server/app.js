const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const api = require('./route');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('tiny'))
app.use(express.static(path.join(__dirname, '..', 'public')))

app.get('/', function (req, res, next){
	try {res.sendFile('index.html');
	} catch (error) {
		next(error);
	}
})

app.use('/api', api)

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next){
	res.status(500);
	console.log(err);
	res.send(err);
})

app.listen(process.env.PORT || 1337, function(){
	console.log('http://localhost:1337/');
})