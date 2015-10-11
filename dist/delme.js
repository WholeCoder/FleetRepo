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
var newTrailer = {
  "unitnumber":"newunitnumber",
  "customer": "CR RUBEN",
  "account": "",
  "vehicletype": "Honda Civic",
  "location": "CARSONVILLE, PA",
  "datersnotified": "",
  "dateapproved": "",
  "estimatedtimeofcompletion": "",
  "status1": "",
  "status2": "",
  "status3": "",
  "numberofsupportingdocuments": 0,
  "whentobearchived": null,
  "note": "Ruben's car"
};

/*testUser.save(function(err) {
    if (err) throw err;
console.log('could not save testUser! '+err);
    //sendAnEmail(u.email, req, res, token);
});
*/
var query = {_id: undefined};
if (!query._id) {
    query._id = new mongoose.mongo.ObjectID();
}

Trailer.findOneAndUpdate(
  query, newTrailer, { 'new': true, 'upsert':true },function(err, doc) {
    if (!err) 
      console.log("Successfully saved trailer!")
    else
      console.log("ERROR! - couldn't save trailer!")
  });
