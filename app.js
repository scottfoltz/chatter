var express = require("express");

var app = express();


console.log('Webserver Running');

app.use(express.static('./'));


app.listen(3000);

//To Run:
//Use `node app.js` from the command line while within this directory.