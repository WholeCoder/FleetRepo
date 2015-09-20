var express = require('express'),
    cookieParser = require('cookie-parser'),
    app = express(),

    http = require('http').Server(app),
    io = require('socket.io')(http),

    path = require('path'),
    User = require('./user-model'),
    Token = require('./token-model'),
    Trailer = require('./trailer-model'),
    nodemailer = require('nodemailer'),
    randtoken = require('rand-token'),
    url = require('url'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session);

// ** MUST set this as a config variable on the heroku.com website **
var DISABLE_SSL = process.env.ENVIRONMENT == 'local_development';
var ENVIRONMENT = "local_development";/*process.env.ENVIRONMENT*/;

var mongodbconnectionstring = "mongodb://localhost/test";

console.log("ENVIRONMENT == "+ENVIRONMENT);
console.log("DISABLE_SSL == "+DISABLE_SSL);


if (DISABLE_SSL && ENVIRONMENT == 'local_development') // on development
{
  console.log("!!!!!!!DISABLE_SSL was set - admin app won't be encrypted!!!!!!")
  console.log("setting connection to local mongodb!!!!!!!!!!!!");
  mongodbconnectionstring = "mongodb://localhost/test";
} else if (ENVIRONMENT == 'remote_developmeent') // on testing site
{
  mongodbconnectionstring = "mongodb://dbuser:ubuntu2rbnue3@ds047802.mongolab.com:47802/heroku_dswxx1s9";
} else if (ENVIRONMENT == 'production')
{
  mongodbconnectionstring = "mongodb://dbuser:ubuntu2rbnue3@ds027293-a0.mongolab.com:27293,ds027293-a1.mongolab.com:27293/heroku_qlr988hb?replicaSet=rs-ds027293";
} else
{
  console.log("!!CONFIG ERROR - ENVIRONMENT system variable not found.  Can not set mongodb variable!!!!")
}

var connStr = mongodbconnectionstring;

var mongoose = require ("mongoose");
mongoose.connect(connStr, function(err) {
    if (err) {
      consoel.log("error == "+err);
      throw err;
    }
    console.log('Successfully connected to MongoDB');
});


var mongoose = require ("mongoose");

var token = randtoken.generate(16);

// create a user a new user
var testUser = new User({
    username: 'jpierich1985@gmail.com',
    password: 'qwertyuiop',
    customer: 'ADMIN',
    activated: true,
    activationtoken: token
});

testUser.save(function(err) {
    if (err) throw err;
console.log('could not save testUser! '+err);
    //sendAnEmail(u.email, req, res, token);
});
