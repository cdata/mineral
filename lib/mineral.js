var express = require('express');
var argv = require('optimist');
var app = express();

app.use(express.static('./static'));

app.listen(8001);
