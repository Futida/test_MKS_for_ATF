const express = require('express');
const app = express();
// package for working with file and directory
const path = require('path');
// body parsing middleware
const bodyParser = require('body-parser');
// CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options
const cors = require('cors');

const routes = require('./routes/routes');
//logging middleware for Node
const logger = require('morgan');

const port = 4000;

app.use(logger('tiny'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use('/', routes);

app.use(function(req, res) {
    res.status(404);
    console.log('Not found URL: %s', req.url);
    res.send({ error: 'Not found' });
});

app.listen(port, function() {
    console.log('Listening on port ' + port);
});