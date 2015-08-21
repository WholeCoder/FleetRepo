var express = require('express'),
    cookieParser = require('cookie-parser'),
    app = express(),

    http = require('http').Server(app),
    io = require('socket.io')(http),

    excelbuilder = require('msexcel-builder'),

    path = require('path'),    
    User = require('./user-model'),
    Token = require('./token-model'),
    Trailer = require('./trailer-model'),
    TrailerArchive = require('./trailer-archive-model'),
    File = require('./file-model'),
    FileArchive = require('./file-archive-model'),

    nodemailer = require('nodemailer'),
    randtoken = require('rand-token'),
    fs = require('fs'),
    multer  = require('multer'),
    upload = multer({ dest: 'uploads/' }),
    mime = require('mime'),
    url = require('url'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session);
 
// ** MUST set this as a config variable on the heroku.com website **
var DISABLE_SSL = process.env.ENVIRONMENT == 'local_development';
var ENVIRONMENT = process.env.ENVIRONMENT;

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



var mongoose = require ("mongoose");


app.use(cookieParser());
app.use(session({
  store: new MongoStore({
    url: mongodbconnectionstring
  }),
  secret: 'rubenjohnathanpierichs'
}));



var connStr = mongodbconnectionstring;
mongoose.connect(connStr, function(err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});


// save user to database
function saveUserToDatabase(u, req, res)
{
  console.log("saveUserToDatabase() called-----------");
  // Generate a 16 character alpha-numeric token:
  var token = randtoken.generate(16);

  // create a user a new user
  var testUser = new User({
      username: u.email.toLowerCase(),
      password: u.password,
      customer: u.customer,
      activated: true,
      activationtoken: token
  });

  testUser.save(function(err) {
      if (err) throw err;

      //sendAnEmail(u.email, req, res, token);
  });
}

// save token to database
function saveTokenToDatabase(u, req, res)
{
  console.log("saveTokenToDatabase() called-----------");

  // create a user a new user
  var testToken = new Token({
      username: u.email,
      token: u.token,
      validuntil: expiresIn(7)
  });

  testToken.save(function(err) {
      if (err) throw err;

      //sendAnEmail(u.email, req, res, token);
  });
}

app.use(express.static(path.join(__dirname, 'public')));

 /* serves main page */
app.get("/", function(req, res) {
   sendIfNoSSLRequired(path.join(__dirname, 'index.html'),req, res)
});
 
app.get("/mockup", function(req, res) {
   res.sendFile(path.join(__dirname, 'mockup.html'))
});

// take out after first run!
/*app.get("/tempsetall100", function(req, res) {
  Trailer.find({status1: new RegExp('^100%', "i")}, function( err, trailers100){
    for (var i = 0;i < trailers100.length; i++)
    {
      var currTrailer = trailers100[i];

      var currentDateInMillisectonds = new Date().getTime()
      var timeInMillisecondsToAdd = 1000*60*60*24*5; // 5 days

      var dateWithAddedOffset = new Date(currentDateInMillisectonds + timeInMillisecondsToAdd);

      currTrailer.whentobearchived = dateWithAddedOffset;
      currTrailer.save(function (err) {
        if (err) 
        {
          console.log('ERROR saving trailer!!');
        } else 
        {
          console.log("Trailer saved successfully!");
        }
        
      });
    }
  });

  res.setHeader('content-type', 'application/json');
  res.writeHead(200);
  res.end("{}");

});
*/

// this next app.get will remove the whentobedeleted from trailers
/*app.get("/tempsetall100", function(req, res) {



    var statusesToSetToUndefined =
      ["100% COMPLETE:  IN TRANSIT TO CUSTOMER", 
      "100% COMPLETE:  READY FOR P/U", 
      "100% COMPLETE:  RESERVED"
    ];


for (var j = 0; j < statusesToSetToUndefined.length; j++)
{

  Trailer.find({status1: new RegExp(statusesToSetToUndefined[j], "i")}, function( err, trailers100){
    for (var i = 0;i < trailers100.length; i++)
    {
      var currTrailer = trailers100[i];

      var currentDateInMillisectonds = new Date().getTime()
      var timeInMillisecondsToAdd = 1000*60*60*24*5; // 5 days

      var dateWithAddedOffset = new Date(currentDateInMillisectonds + timeInMillisecondsToAdd);

      currTrailer.whentobearchived = undefined;
      currTrailer.save(function (err) {
        if (err) 
        {
          console.log('ERROR saving trailer!!');
        } else 
        {
          console.log("Trailer saved successfully!");
        }
        
      });
    }
  }); // end Trailer.find


} // end for j


  res.setHeader('content-type', 'application/json');
  res.writeHead(200);
  res.end("{}");

});
*/
// take out after done testing!
/*app.get("/loaddatatotestarchive", function(req, res) {
  var trailerData = [{"_id":"55b6406dd731670300edb5df","unitnumber":"40492","customer":"CR ENGLAND","account":"DEDICATED - UK","vehicletype":"TRAILER:  DRY VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/13/2015","dateapproved":"07/13/2015","estimatedtimeofcompletion":"07/15/2015","status1":"100% COMPLETE:  READY FOR P/U","status2":"","status3":"","__v":0},{"_id":"55b640cfd731670300edb5e0","unitnumber":"17746","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/20/2015","dateapproved":"07/20/2015","estimatedtimeofcompletion":"07/24/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b64155d731670300edb5e1","unitnumber":"20431","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/27/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b6425ed731670300edb5e2","unitnumber":"23063","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/21/2015","dateapproved":"07/22/2015","estimatedtimeofcompletion":"07/28/2015","status1":"100% COMPLETE:  READY FOR P/U","status2":"","status3":"","__v":0},{"_id":"55b64297d731670300edb5e3","unitnumber":"22899","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/20/2015","dateapproved":"07/21/2015","estimatedtimeofcompletion":"07/27/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b642bfd731670300edb5e4","unitnumber":"22232","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/09/2015","dateapproved":"07/10/2015","estimatedtimeofcompletion":"07/30/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b64305d731670300edb5e5","unitnumber":"20190","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/21/2015","dateapproved":"07/22/2015","estimatedtimeofcompletion":"07/31/2015","status1":"50%  WORK IN PROGRESS","status2":"","status3":"","__v":0},{"_id":"55b644cdd731670300edb5e6","unitnumber":"20769","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/21/2015","dateapproved":"07/22/2015","estimatedtimeofcompletion":"07/28/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b64578d731670300edb5e7","unitnumber":"18289","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/21/2015","dateapproved":"07/22/2015","estimatedtimeofcompletion":"07/29/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b64696d731670300edb5e8","unitnumber":"20866","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/22/2015","dateapproved":"07/23/2015","estimatedtimeofcompletion":"07/29/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b64759d731670300edb5e9","unitnumber":"18564","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/23/2015","dateapproved":"07/24/2015","estimatedtimeofcompletion":"07/29/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b647d3d731670300edb5eb","unitnumber":"20456","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/24/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/30/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b647f4d731670300edb5ec","unitnumber":"20378","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/24/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/30/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b6484ed731670300edb5ed","unitnumber":"20466","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/24/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/29/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55bbc391422ef20300b67bb7","unitnumber":"21253","customer":"CR ENGLAND","account":"","vehicletype":"","location":"FRS - (GRANTVILLE PA)","datersnotified":"11/17/2014","dateapproved":"","estimatedtimeofcompletion":"","status1":"","status2":"","status3":"","__v":0},{"_id":"55b6487dd731670300edb5ee","unitnumber":"19225","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/24/2015","dateapproved":"07/28/2015","estimatedtimeofcompletion":"08/03/2015","status1":"50%  WORK IN PROGRESS","status2":"","status3":"","__v":0},{"_id":"55b648c1d731670300edb5ef","unitnumber":"18332","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/24/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/29/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b648f5d731670300edb5f0","unitnumber":"20879","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/27/2015","dateapproved":"07/28/2015","estimatedtimeofcompletion":"08/03/2015","status1":"50%  WORK IN PROGRESS","status2":"","status3":"","__v":0},{"_id":"55b65f5ed731670300edb5f1","unitnumber":"22126","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/29/2015","dateapproved":"07/29/2015","estimatedtimeofcompletion":"07/31/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b66dabd731670300edb5f2","unitnumber":"174972","customer":"CR ENGLAND","account":"DEDICATED - MELANIE LEE","vehicletype":"TRACTOR:  CONDO","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/17/2015","dateapproved":"07/17/2015","estimatedtimeofcompletion":"07/22/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b66de5d731670300edb5f3","unitnumber":"50401","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRACTOR:  CONDO","location":"FRS - (GRANTVILLE PA)","datersnotified":"","dateapproved":"","estimatedtimeofcompletion":"","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b66e94d731670300edb5f4","unitnumber":"59391","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRACTOR:  DAY CAB","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/24/2015","dateapproved":"07/24/2015","estimatedtimeofcompletion":"07/24/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b66f0bd731670300edb5f5","unitnumber":"CREU533232","customer":"CR ENGLAND","account":"Intermodal","vehicletype":"TRAILER:  CONTAINER / CHASSIS","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/20/2015","dateapproved":"07/20/2015","estimatedtimeofcompletion":"07/21/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b66f44d731670300edb5f6","unitnumber":"CREU533499","customer":"CR ENGLAND","account":"Intermodal","vehicletype":"TRAILER:  CONTAINER / CHASSIS","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/27/2015","status1":"100% COMPLETE:  READY FOR P/U","status2":"","status3":"","__v":0},{"_id":"55b66fa5d731670300edb5f8","unitnumber":"165","customer":"CONTRACT LEASING CORP.","account":"","vehicletype":"TRAILER:  DRY VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"05/26/2015","dateapproved":"06/29/2015","estimatedtimeofcompletion":"07/01/2015","status1":"100% COMPLETE:  READY FOR P/U","status2":"","status3":"","__v":0},{"_id":"55b66fedd731670300edb5f9","unitnumber":"260854","customer":"BTC","account":"","vehicletype":"TRAILER:  FLAT BED","location":"FRS - (GRANTVILLE PA)","datersnotified":"06/05/2015","dateapproved":"06/05/2015","estimatedtimeofcompletion":"07/05/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b67063d731670300edb5fa","unitnumber":"394769","customer":"UNITED PARCEL SERVICE","account":"MATT OESTERLING","vehicletype":"TRAILER:  DRY VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"05/28/2015","dateapproved":"07/24/2015","estimatedtimeofcompletion":"07/24/2015","status1":"100% COMPLETE:  DELIVERED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b67083d731670300edb5fb","unitnumber":"531505","customer":"NEW ERA TRANSPORTATION","account":"","vehicletype":"TRAILER:  DRY VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/27/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b670aed731670300edb5fc","unitnumber":"451502","customer":"KOCH","account":"","vehicletype":"TRAILER:  DRY VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/22/2015","dateapproved":"07/22/2015","estimatedtimeofcompletion":"07/22/2015","status1":"100% COMPLETE:  READY FOR P/U","status2":"","status3":"","__v":0},{"_id":"55b670ddd731670300edb5fd","unitnumber":"4661","customer":"WHITE ARROW","account":"","vehicletype":"TRAILER:  DRY VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/10/2015","dateapproved":"07/17/2015","estimatedtimeofcompletion":"","status1":"50%  WORK IN PROGRESS","status2":"","status3":"","__v":0},{"_id":"55b6716cd731670300edb5fe","unitnumber":"U65609","customer":"LOGISTICS & DISTRIBUTION SERVICES","account":"","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"05/28/2015","dateapproved":"07/31/2015","estimatedtimeofcompletion":"","status1":"100% COMPLETE:  READY FOR P/U","status2":"","status3":"","__v":0},{"_id":"55b67199d731670300edb600","unitnumber":"99009","customer":"NEON","account":"","vehicletype":"TRAILER:  DRY VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"02/19/2015","dateapproved":"","estimatedtimeofcompletion":"","status1":"10%  A/W AUTHORIZATION","status2":"","status3":"","__v":0},{"_id":"55b671b9d731670300edb601","unitnumber":"917616","customer":"UNITED PARCEL SERVICE","account":"MATT OESTERLING","vehicletype":"TRAILER:  DRY VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/14/2015","dateapproved":"","estimatedtimeofcompletion":"","status1":"10%  A/W AUTHORIZATION","status2":"","status3":"","__v":0},{"_id":"55b671d7d731670300edb602","unitnumber":"938570","customer":"UNITED PARCEL SERVICE","account":"MATT OESTERLING","vehicletype":"TRAILER:  DRY VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/16/2015","dateapproved":"","estimatedtimeofcompletion":"","status1":"10%  A/W AUTHORIZATION","status2":"","status3":"","__v":0},{"_id":"55b671f3d731670300edb603","unitnumber":"717819","customer":"UNITED PARCEL SERVICE","account":"MATT OESTERLING","vehicletype":"TRAILER:  DRY VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/22/2015","dateapproved":"","estimatedtimeofcompletion":"","status1":"50%  WORK IN PROGRESS","status2":"","status3":"","__v":0},{"_id":"55b671f6d731670300edb604","unitnumber":"20315","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/27/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b67245d731670300edb605","unitnumber":"21586","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/27/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b6727cd731670300edb606","unitnumber":"21081","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/27/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b672a9d731670300edb607","unitnumber":"22901","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/27/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b67327d731670300edb608","unitnumber":"316616","customer":"UNITED PARCEL SERVICE","account":"MATT OESTERLING","vehicletype":"TRAILER:  DRY VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/22/2015","dateapproved":"07/30/2015","estimatedtimeofcompletion":"","status1":"25%  A/W REPAIRS","status2":"","status3":"","__v":0},{"_id":"55b6737cd731670300edb609","unitnumber":"59385","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRACTOR:  DAY CAB","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b673e6d731670300edb60a","unitnumber":"59387","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRACTOR:  DAY CAB","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/27/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b674a3d731670300edb60b","unitnumber":"59263","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRACTOR:  DAY CAB","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/27/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b67563d731670300edb60c","unitnumber":"59247","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRACTOR:  DAY CAB","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/29/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b676ccd731670300edb60d","unitnumber":"20568","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/27/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b67a82d731670300edb60e","unitnumber":"ENGZ30381","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  CONTAINER / CHASSIS","location":"HERSHEY-Y & S CANDIES (Lancaster PA)","datersnotified":"07/26/2015","dateapproved":"07/26/2015","estimatedtimeofcompletion":"07/26/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b67ad1d731670300edb60f","unitnumber":"20533","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"REEFER: REEFER UNIT","location":"WEST HERSHEY - (HERSHEY PA)","datersnotified":"07/25/2015","dateapproved":"07/25/2015","estimatedtimeofcompletion":"07/25/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b67bcdd731670300edb610","unitnumber":"59413","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRACTOR:  CONDO","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/25/2015","dateapproved":"07/25/2015","estimatedtimeofcompletion":"07/25/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b67ca6d731670300edb611","unitnumber":"19187","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  DRY VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/27/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b67dd9d731670300edb612","unitnumber":"U66421","customer":"LOGISTICS & DISTRIBUTION SERVICES","account":"","vehicletype":"TRAILER:  REEFER VAN","location":"PET SMART (BETHEL PA)","datersnotified":"07/23/2015","dateapproved":"07/23/2015","estimatedtimeofcompletion":"07/23/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b67e4cd731670300edb613","unitnumber":"917166","customer":"UNITED PARCEL SERVICE","account":"MATT OESTERLING","vehicletype":"TRAILER:  DRY VAN","location":"UPS - HARRISBURG (HARRISBURG PA)","datersnotified":"07/23/2015","dateapproved":"07/23/2015","estimatedtimeofcompletion":"07/23/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b67e97d731670300edb614","unitnumber":"874714","customer":"UNITED PARCEL SERVICE","account":"MATT OESTERLING","vehicletype":"TRAILER:  DRY VAN","location":"UPS - HARRISBURG (HARRISBURG PA)","datersnotified":"07/23/2015","dateapproved":"07/23/2015","estimatedtimeofcompletion":"07/23/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b68459d731670300edb615","unitnumber":"59260","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRACTOR:  DAY CAB","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/30/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b684dcd731670300edb616","unitnumber":"59383","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRACTOR:  DAY CAB","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/27/2015","dateapproved":"","estimatedtimeofcompletion":"","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b6940e8a35960300bfb5e3","unitnumber":"50760","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRACTOR:  CONDO","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/27/2015","dateapproved":"07/28/2015","estimatedtimeofcompletion":"07/31/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b6a6d58a35960300bfb5e5","unitnumber":"877118","customer":"UNITED PARCEL SERVICE","account":"","vehicletype":"TRAILER:  DRY VAN","location":"600 OAK RIDGE  HAZLETON, PA","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/27/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b6a7618a35960300bfb5e6","unitnumber":"602993","customer":"UNITED PARCEL SERVICE","account":"","vehicletype":"TRAILER:  DRY VAN","location":"UPS - HARRISBURG (HARRISBURG PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/27/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b6a7b98a35960300bfb5e7","unitnumber":"870908","customer":"UNITED PARCEL SERVICE","account":"","vehicletype":"TRAILER:  DRY VAN","location":"UPS - HARRISBURG (HARRISBURG PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/27/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b6a82d8a35960300bfb5e8","unitnumber":"602695","customer":"UNITED PARCEL SERVICE","account":"","vehicletype":"TRAILER:  DRY VAN","location":"UPS - HARRISBURG (HARRISBURG PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/27/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b764188a35960300bfb5e9","unitnumber":"59827","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRACTOR:  CONDO","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/28/2015","dateapproved":"07/28/2015","estimatedtimeofcompletion":"07/28/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b76fc18a35960300bfb5ea","unitnumber":"19088","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"07/27/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b772198a35960300bfb5eb","unitnumber":"18108","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/31/2015","dateapproved":"07/31/2015","estimatedtimeofcompletion":"07/31/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b783ef8a35960300bfb5ee","unitnumber":"20412","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/28/2015","dateapproved":"07/28/2015","estimatedtimeofcompletion":"07/31/2015","status1":"100% COMPLETE:  READY FOR P/U","status2":"","status3":"","__v":0},{"_id":"55b784468a35960300bfb5ef","unitnumber":"22284","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/29/2015","dateapproved":"07/29/2015","estimatedtimeofcompletion":"","status1":"50%  WORK IN PROGRESS","status2":"","status3":"","__v":0},{"_id":"55b784678a35960300bfb5f0","unitnumber":"19269","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/27/2015","dateapproved":"07/27/2015","estimatedtimeofcompletion":"","status1":"50%  WORK IN PROGRESS","status2":"","status3":"","__v":0},{"_id":"55b79c8c8a35960300bfb5f2","unitnumber":"59360","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRACTOR:  DAY CAB","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/28/2015","dateapproved":"07/28/2015","estimatedtimeofcompletion":"07/28/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b79d1b8a35960300bfb5f3","unitnumber":"CREU532226","customer":"CR ENGLAND","account":"Intermodal","vehicletype":"TRAILER:  CONTAINER / CHASSIS","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/28/2015","dateapproved":"07/28/2015","estimatedtimeofcompletion":"07/28/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b7c7688a35960300bfb5f4","unitnumber":"50279","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRACTOR:  DAY CAB","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/28/2015","dateapproved":"07/28/2015","estimatedtimeofcompletion":"","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b8b4222807210300b83e4c","unitnumber":"50143","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRACTOR:  DAY CAB","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/28/2015","dateapproved":"07/28/2015","estimatedtimeofcompletion":"07/28/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b8b4b02807210300b83e4d","unitnumber":"533180","customer":"WESTERN  EXPRESS INC.","account":"","vehicletype":"TRAILER:  DRY VAN","location":"GIANT DISTRIBUTION, CARLISLE","datersnotified":"07/28/2015","dateapproved":"07/28/2015","estimatedtimeofcompletion":"07/28/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b8b4b42807210300b83e4e","unitnumber":"20366","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/29/2015","dateapproved":"","estimatedtimeofcompletion":"","status1":"25%  A/W REPAIRS","status2":"","status3":"","__v":0},{"_id":"55b8b4da2807210300b83e4f","unitnumber":"51192","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRACTOR:  CONDO","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/30/2015","dateapproved":"07/30/2015","estimatedtimeofcompletion":"07/30/2015","status1":"100% COMPLETE:  RESERVED","status2":"","status3":"","__v":0},{"_id":"55b8b5162807210300b83e50","unitnumber":"PTLZ064751","customer":"LOGISTICS & DISTRIBUTION SERVICES","account":"","vehicletype":"TRAILER:  DRY VAN","location":"PET SMART (BETHEL PA)","datersnotified":"07/28/2015","dateapproved":"07/28/2015","estimatedtimeofcompletion":"07/28/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b8b5302807210300b83e51","unitnumber":"21189","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/28/2015","dateapproved":"07/28/2015","estimatedtimeofcompletion":"07/29/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b8b5a22807210300b83e52","unitnumber":"U65616","customer":"LOGISTICS & DISTRIBUTION SERVICES","account":"","vehicletype":"TRAILER:  REEFER VAN","location":"PET SMART (BETHEL PA)","datersnotified":"07/28/2015","dateapproved":"07/28/2015","estimatedtimeofcompletion":"07/28/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b8b5d92807210300b83e53","unitnumber":"R53888","customer":"LOGISTICS & DISTRIBUTION SERVICES","account":"","vehicletype":"TRAILER:  REEFER VAN","location":"PET SMART (BETHEL PA)","datersnotified":"07/28/2015","dateapproved":"07/28/2015","estimatedtimeofcompletion":"07/28/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b8b6142807210300b83e54","unitnumber":"U67633","customer":"LOGISTICS & DISTRIBUTION SERVICES","account":"","vehicletype":"TRAILER:  REEFER VAN","location":"PET SMART (BETHEL PA)","datersnotified":"07/28/2015","dateapproved":"07/28/2015","estimatedtimeofcompletion":"07/28/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b8b7162807210300b83e55","unitnumber":"U64495","customer":"LOGISTICS & DISTRIBUTION SERVICES","account":"","vehicletype":"TRAILER:  REEFER VAN","location":"PET SMART (BETHEL PA)","datersnotified":"07/28/2015","dateapproved":"07/28/2015","estimatedtimeofcompletion":"07/28/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b8c09c2807210300b83e56","unitnumber":"52368","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRACTOR:  CONDO","location":"","datersnotified":"07/23/2015","dateapproved":"07/23/2015","estimatedtimeofcompletion":"07/31/2015","status1":"100% COMPLETE:  READY FOR P/U","status2":"","status3":"","__v":0},{"_id":"55b8fde02807210300b83e58","unitnumber":"50790","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRACTOR:  CONDO","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/29/2015","dateapproved":"07/29/2015","estimatedtimeofcompletion":"07/29/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b8ff392807210300b83e59","unitnumber":"50419","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRACTOR:  CONDO","location":"","datersnotified":"07/29/2015","dateapproved":"07/29/2015","estimatedtimeofcompletion":"07/31/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b8ff7b2807210300b83e5a","unitnumber":"59104","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRACTOR:  DAY CAB","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/29/2015","dateapproved":"07/29/2015","estimatedtimeofcompletion":"","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b8ffe82807210300b83e5b","unitnumber":"59253","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRACTOR:  DAY CAB","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/29/2015","dateapproved":"07/29/2015","estimatedtimeofcompletion":"","status1":"50%  WORK IN PROGRESS","status2":"","status3":"","__v":0},{"_id":"55b912502807210300b83e5c","unitnumber":"21303","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"08/03/2015","dateapproved":"08/03/2015","estimatedtimeofcompletion":"","status1":"25%  A/W REPAIRS","status2":"","status3":"","__v":0},{"_id":"55b91eda2807210300b83e5d","unitnumber":"20655","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"08/03/2015","dateapproved":"08/03/2015","estimatedtimeofcompletion":"","status1":"25%  A/W REPAIRS","status2":"","status3":"","__v":0},{"_id":"55b92b992807210300b83e5e","unitnumber":"52953","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRACTOR:  CONDO","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/29/2015","dateapproved":"07/29/2015","estimatedtimeofcompletion":"07/30/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b92eaa2807210300b83e5f","unitnumber":"50281","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRACTOR:  DAY CAB","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/29/2015","dateapproved":"07/29/2015","estimatedtimeofcompletion":"","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b9377c2807210300b83e60","unitnumber":"174972","customer":"CR ENGLAND","account":"Dedicated Hershey: m lee","vehicletype":"TRACTOR:  CONDO","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/29/2015","dateapproved":"07/29/2015","estimatedtimeofcompletion":"07/29/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b947cd47a3870300d1b16d","unitnumber":"637203","customer":"UNITED PARCEL SERVICE","account":"","vehicletype":"TRAILER:  DRY VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/29/2015","dateapproved":"","estimatedtimeofcompletion":"","status1":"10%  A/W ESTIMATE","status2":"","status3":"","__v":0},{"_id":"55b9480647a3870300d1b16e","unitnumber":"719831","customer":"UNITED PARCEL SERVICE","account":"","vehicletype":"TRAILER:  DRY VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/29/2015","dateapproved":"","estimatedtimeofcompletion":"","status1":"10%  A/W ESTIMATE","status2":"","status3":"","__v":0},{"_id":"55b9490347a3870300d1b16f","unitnumber":"52001","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRACTOR:  CONDO","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/29/2015","dateapproved":"07/29/2015","estimatedtimeofcompletion":"07/29/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55b99ae247a3870300d1b173","unitnumber":"20371","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"REEFER: REEFER UNIT","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"7/29/2015","dateapproved":"07/29/2015","estimatedtimeofcompletion":"07/30/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55ba14e447a3870300d1b174","unitnumber":"22901","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/30/2015","dateapproved":"07/30/2015","estimatedtimeofcompletion":"07/30/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55ba153b47a3870300d1b175","unitnumber":"20781","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/30/2015","dateapproved":"07/30/2015","estimatedtimeofcompletion":"07/30/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55ba159547a3870300d1b176","unitnumber":"R20456","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"REEFER: REEFER UNIT","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/30/2015","dateapproved":"07/30/2015","estimatedtimeofcompletion":"07/30/2015","status1":"100% COMPLETE:  RESERVED","status2":"","status3":"","__v":0},{"_id":"55ba2b7247a3870300d1b177","unitnumber":"20487","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/30/2015","dateapproved":"07/30/2015","estimatedtimeofcompletion":"07/30/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55ba6097c7eaa00300eb5a2c","unitnumber":"18214","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"AMERICOLD-MANCHESTER (MANCHESTER PA)","datersnotified":"07/30/2015","dateapproved":"07/30/2015","estimatedtimeofcompletion":"07/30/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55ba8a8cc7eaa00300eb5a2d","unitnumber":"23371","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/30/2015","dateapproved":"07/30/2015","estimatedtimeofcompletion":"07/30/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55ba8afec7eaa00300eb5a2e","unitnumber":"20799","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/30/2015","dateapproved":"07/30/2015","estimatedtimeofcompletion":"07/30/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55ba8b6ac7eaa00300eb5a2f","unitnumber":"21117","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"WEST HERSHEY - (HERSHEY PA)","datersnotified":"07/30/2015","dateapproved":"07/30/2015","estimatedtimeofcompletion":"07/30/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55ba8cf8c7eaa00300eb5a30","unitnumber":"20544","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"WEST HERSHEY - (HERSHEY PA)","datersnotified":"07/30/2015","dateapproved":"07/30/2015","estimatedtimeofcompletion":"07/30/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55bb6813422ef20300b67baf","unitnumber":"R18849","customer":"CR ENGLAND","account":"OTR","vehicletype":"REEFER: REEFER UNIT","location":"","datersnotified":"07/30/2015","dateapproved":"07/31/2015","estimatedtimeofcompletion":"07/31/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55bb6888422ef20300b67bb0","unitnumber":"20541","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-Y & S CANDIES (Lancaster PA)","datersnotified":"07/31/2015","dateapproved":"07/31/2015","estimatedtimeofcompletion":"07/31/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55bb6948422ef20300b67bb1","unitnumber":"21232","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/31/2015","dateapproved":"07/31/2015","estimatedtimeofcompletion":"","status1":"10%  A/W ESTIMATE","status2":"","status3":"","__v":0},{"_id":"55bb70a3422ef20300b67bb2","unitnumber":"20384","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-Y & S CANDIES (Lancaster PA)","datersnotified":"07/31/2015","dateapproved":"07/31/2015","estimatedtimeofcompletion":"07/31/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55bb81b1422ef20300b67bb3","unitnumber":"19456","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"","dateapproved":"","estimatedtimeofcompletion":"","status1":"10%  A/W ESTIMATE","status2":"","status3":"","__v":0},{"_id":"55bb8460422ef20300b67bb4","unitnumber":"21145","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"","dateapproved":"","estimatedtimeofcompletion":"","status1":"10%  A/W ESTIMATE","status2":"","status3":"","__v":0},{"_id":"55bbb854422ef20300b67bb5","unitnumber":"20437","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/31/2015","dateapproved":"07/31/2015","estimatedtimeofcompletion":"07/31/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55bbb880422ef20300b67bb6","unitnumber":"20527","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/31/2015","dateapproved":"07/31/2015","estimatedtimeofcompletion":"07/31/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55bbcb08422ef20300b67bb8","unitnumber":"51000","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRACTOR:  CONDO","location":"FRS - (GRANTVILLE PA)","datersnotified":"","dateapproved":"","estimatedtimeofcompletion":"","status1":"50%  WORK IN PROGRESS","status2":"","status3":"","__v":0},{"_id":"55bbcbf8422ef20300b67bb9","unitnumber":"531464","customer":"NEW ERA TRANSPORTATION","account":"","vehicletype":"TRAILER:  DRY VAN","location":"FRS","datersnotified":"07/31/2015","dateapproved":"","estimatedtimeofcompletion":"","status1":"10%  A/W ESTIMATE","status2":"","status3":"","__v":0},{"_id":"55bbd437422ef20300b67bba","unitnumber":"23108","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"07/31/2015","dateapproved":"07/31/2015","estimatedtimeofcompletion":"07/31/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55bbd81f422ef20300b67bbb","unitnumber":"532415","customer":"CR ENGLAND","account":"Intermodal","vehicletype":"","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/31/2015","dateapproved":"","estimatedtimeofcompletion":"","status1":"100% COMPLETE:  RESERVED","status2":"","status3":"","__v":0},{"_id":"55bf4e004694490300f73bfd","unitnumber":"19222","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"","dateapproved":"","estimatedtimeofcompletion":"","status1":"10%  A/W ESTIMATE","status2":"","status3":"","__v":0},{"_id":"55bf4eb84694490300f73bfe","unitnumber":"21879","customer":"CR ENGLAND","account":"OTR","vehicletype":"","location":"FRS - (GRANTVILLE PA)","datersnotified":"","dateapproved":"","estimatedtimeofcompletion":"","status1":"10%  A/W ESTIMATE","status2":"","status3":"","__v":0},{"_id":"55bf4ee24694490300f73bff","unitnumber":"18331","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"","dateapproved":"","estimatedtimeofcompletion":"","status1":"10%  A/W ESTIMATE","status2":"","status3":"","__v":0},{"_id":"55bf4f234694490300f73c00","unitnumber":"874411","customer":"UNITED PARCEL SERVICE","account":"","vehicletype":"TRAILER:  DRY VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"","dateapproved":"","estimatedtimeofcompletion":"","status1":"10%  A/W ESTIMATE","status2":"","status3":"","__v":0},{"_id":"55bf4fa64694490300f73c01","unitnumber":"22147","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"07/31/2015","dateapproved":"07/31/2015","estimatedtimeofcompletion":"","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55bf52f24694490300f73c02","unitnumber":"21115","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"","dateapproved":"","estimatedtimeofcompletion":"","status1":"10%  A/W ESTIMATE","status2":"","status3":"","__v":0},{"_id":"55bf535c4694490300f73c03","unitnumber":"20470","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-Y & S CANDIES (Lancaster PA)","datersnotified":"08/02/2015","dateapproved":"08/02/2015","estimatedtimeofcompletion":"08/02/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55bf62534694490300f73c04","unitnumber":"174972","customer":"CR ENGLAND","account":"","vehicletype":"TRACTOR:  DAY CAB","location":"FRS - (GRANTVILLE PA)","datersnotified":"08/02/15","dateapproved":"08/02/2015","estimatedtimeofcompletion":"08/02/2015","status1":"100% COMPLETE:  RELEASED TO CUSTOMER","status2":"","status3":"","__v":0},{"_id":"55bf96ba4ffe92030058a6ad","unitnumber":"21151","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"08/03/2015","dateapproved":"08/03/2015","estimatedtimeofcompletion":"","status1":"75%  WORK IN PROGRESS","status2":"","status3":"","__v":0},{"_id":"55bf96fc4ffe92030058a6ae","unitnumber":"20569","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"08/03/2015","dateapproved":"08/03/2015","estimatedtimeofcompletion":"","status1":"50%  WORK IN PROGRESS","status2":"","status3":"","__v":0},{"_id":"55bf972f4ffe92030058a6af","unitnumber":"20393","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"08/03/2015","dateapproved":"08/03/2015","estimatedtimeofcompletion":"08/03/2015","status1":"50%  WORK IN PROGRESS","status2":"","status3":"","__v":0},{"_id":"55bf97704ffe92030058a6b0","unitnumber":"20580","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"08/03/2015","dateapproved":"08/03/2015","estimatedtimeofcompletion":"08/03/2015","status1":"10%  A/W AUTHORIZATION","status2":"","status3":"","__v":0},{"_id":"55bf97a04ffe92030058a6b1","unitnumber":"21727","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"FRS - (GRANTVILLE PA)","datersnotified":"08/03/2015","dateapproved":"","estimatedtimeofcompletion":"","status1":"10%  A/W ESTIMATE","status2":"","status3":"","__v":0},{"_id":"55bf9e814ffe92030058a6b2","unitnumber":"50279","customer":"CR ENGLAND","account":"","vehicletype":"TRACTOR:  DAY CAB","location":"EDC3","datersnotified":"08/03/2015","dateapproved":"08/03/2015","estimatedtimeofcompletion":"","status1":"10%  A/W ESTIMATE","status2":"","status3":"","__v":0},{"_id":"55bf9eb34ffe92030058a6b3","unitnumber":"50278","customer":"CR ENGLAND","account":"","vehicletype":"TRACTOR:  DAY CAB","location":"FRS - (GRANTVILLE PA)","datersnotified":"08/03/2015","dateapproved":"08/03/2015","estimatedtimeofcompletion":"","status1":"10%  A/W ESTIMATE","status2":"","status3":"","__v":0},{"_id":"55bfab184ffe92030058a6b4","unitnumber":"52481","customer":"CR ENGLAND","account":"","vehicletype":"TRACTOR:  DAY CAB","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"08/03/2015","dateapproved":"","estimatedtimeofcompletion":"08/03/2015","status1":"10%  A/W AUTHORIZATION","status2":"","status3":"","__v":0},{"_id":"55bfb8684ffe92030058a6b5","unitnumber":"18374","customer":"CR ENGLAND","account":"OTR","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"08/03/2015","dateapproved":"","estimatedtimeofcompletion":"08/03/2015","status1":"10%  A/W AUTHORIZATION","status2":"","status3":"","__v":0},{"_id":"55bfb89c4ffe92030058a6b6","unitnumber":"20495","customer":"CR ENGLAND","account":"Dedicated Hershey","vehicletype":"TRAILER:  REEFER VAN","location":"HERSHEY-EDC3 (PALMYRA PA)","datersnotified":"08/03/2015","dateapproved":"","estimatedtimeofcompletion":"08/03/2015","status1":"10%  A/W AUTHORIZATION","status2":"","status3":"","__v":0}];
  for (var i = 0; i < trailerData.length; i++)
  {
    delete trailerData._id;


    var trailer = new Trailer(trailerData[i]);

    //trailer.whentobearchived = 
    trailer.save(function (err) {
      if (err) 
      {
        console.log('ERROR saving trailer!!');
      } else 
      {
        console.log("Trailer saved successfully!");
      }
      
    });


  }
  res.setHeader('content-type', 'application/json');
  res.writeHead(200);
  res.end("{}");

}); // end /loaddatatotestarchive
*/


app.get("/get/:filename", function(req, res) {
    var filename = req.params.filename;
    var filenamewithpath = path.join(__dirname, 'documentsforreading',filename);

    res.sendFile(filenamewithpath);
});

app.post('/uploaddocument', upload.single('avatar'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  //console.log("req.body.name == "+req.body.name);

if(req.session.currentuser.customer == "ADMIN")
{


  console.log("req.file == "+req.file);

  for (var prop in req.file)
  {
    console.log("   "+prop+"  ==  "+req.file[prop]);
  }



  var filePath = path.join(__dirname, 'uploads',req.file.filename);

  fs.readFile(filePath, function(err,data){ // binary was utf-8
      if (!err){



        var aFile = new File({name:req.file['originalname'], 
                              contents: data, 
                              mimetype:  mime.lookup(req.file['originalname']),
                              customer: req.body.customer,
                              trailer_id: req.body._id});

        aFile.save(function (err) {
          if (err) 
          {
            console.log('ERROR saving a file!!');

            res.setHeader('content-type', 'application/json');
            res.writeHead(200);
            res.end('{"error":"'+err+'"}');
          } else 
          {
            console.log("File was saved successfully!");
          
            Trailer.find({_id: req.body._id}, function(err, docs){
              var foundTrailer = docs[0];
              if (foundTrailer.numberofsupportingdocuments == undefined ||
                  foundTrailer.numberofsupportingdocuments == null)
              {
                foundTrailer.numberofsupportingdocuments = 1;
              } else {
                foundTrailer.numberofsupportingdocuments++;
              }

              Trailer.findOneAndUpdate({_id: req.body._id}, foundTrailer, {}, 
                  function(err, doc){
                    res.setHeader('content-type', 'application/json');
                    res.writeHead(200);
                    res.end('{"filesaved":"successfully"}');
                  }
              ); // end Trailer.findOneAndUpdate


            }); // end Trailer.find

          }
          
        });





/*      console.log('received data: ' + data);
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(data);
      response.end();
*/      }else{
          console.log(err);

          res.setHeader('content-type', 'application/json');
          res.writeHead(200);
          res.end('{"error":"'+err+'"}');
      }

  }); // end fs.readFile(...)

} // end if
});


app.get("/servertime", function(req, res) {
  var rightNow = new Date();
  var rightNowObject = {now: rightNow};

  res.setHeader('content-type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(rightNowObject));
});

app.get("/archive100", function(req, res) {


if(req.session.currentuser.customer == "ADMIN")
{


  Trailer.find({status1: new RegExp('^100%', "i")}, function( err, trailers100){
    for (var i = 0;i < trailers100.length; i++)
    {
      var currTrailer = trailers100[i];

      var rightNow = new Date();
      if (currTrailer.whentobearchived != undefined && currTrailer.whentobearchived.getTime() < rightNow.getTime())
      {
        console.log("------------- "+currTrailer.whentobearchived +" < " + rightNow);

                Trailer.findOneAndRemove({'_id' : currTrailer._id}, function (err,trailer){
                  if(err) 
                  {
                    return;
                  }
                  delete trailer._id;

                  var trailerArchive = new TrailerArchive(trailer);

                  trailerArchive.whenitwasarchived = trailer.whentobearchived;
                  delete trailerArchive.whentobearchived;

                  trailerArchive.save(function (err) {
                    if (err) 
                    {
                      console.log('ERROR saving trailer archive!!');
                    } else 
                    {
                      console.log("Trailer Archive saved successfully!");
                      if (trailerArchive.numberofsupportingdocuments != undefined &&
                          trailerArchive.numberofsupportingdocuments != null &&
                          trailerArchive.numberofsupportingdocuments != 0)
                      {
                          File.find({trailer_id:trailerArchive._id}, function( err, files){
                            for (var i = 0; i < files.length; i++)
                            {
                              files[i].remove();
                              delete files[i]._id;
                              files[i].trailer_id = trailerArchive._id;
                              var fileArchive = new FileArchive(files[i]);
                              fileArchive.save(function(err) {
                                if (err)
                                {
                                  throw err;
                                }
                              });
                            }
                          });
                      }
                    }
                    
                  });

                }); // end Trailer.findOneAndRemove

      } // end if

    } // end for

    res.setHeader('content-type', 'application/json');
    res.writeHead(200);
    res.end("{}");
  }); // end Trailer.find


} // end if

}); // end /archive100

app.get("/activate", function(req, res) {
  var queryData = url.parse(req.url, true).query;

  res.writeHead(200);
  res.end("User was successfully activated!  You may log in now!");
  User.findOne({ activationtoken: queryData.activationtoken }, function(err, user) {
          if (err) throw err;

          user.activated = true;
          user.save();
  });  
});

app.get("/logout", function(req, res) {
  req.session.currentuser = {};
  req.session.save();
});

app.get("/getenvironment", function(req, res) {
  console.log("----------current user in session == "+JSON.stringify(req.session.currentuser));
  if(req.session.currentuser != undefined)
  {

    var prettyEnvironment = "WTF?";
    if (ENVIRONMENT == 'local_development') // on development
    {
      prettyEnvironment = "Local Development Environment";
    } else if (ENVIRONMENT == 'remote_developmeent') // on testing site
    {
      prettyEnvironment = "Remote Development Environment";
    } else if (ENVIRONMENT == 'production')
    {
      prettyEnvironment = "Production";
    } else
    {
      prettyEnvironment = "WTF?";
    }

    res.setHeader('content-type', 'application/json');
    res.writeHead(200);

    res.end('{"environment": "'+prettyEnvironment+'"}');
  }
});

app.post("/login", function(req, res) {
  req.session.currentuser = {};
  req.session.save();

  var str = "";
  for (var prop in req.headers)
  {
    str += prop + " ";
  }

  // *** note!!! *** headers always come through lowercase!!!!
  console.log("authorization == "+req.headers['authorization']);//Authorization
  if (req.method == 'POST') {
    console.log('1.  POST found');
      var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });
      req.on('end', function () {
           var loginInfoJson = JSON.parse(jsonString)
console.log('2.  jsonString == '+jsonString);
            User.getAuthenticated(loginInfoJson.email.toLowerCase(), loginInfoJson.password, function(err, user, reason) {
                if (err) throw err;
console.log('3.  found a user');
                // login was successful if we have a user
                if (user && user.activated) {
console.log('4.  user is valid and activated');                  
                    // handle login success
                    res.setHeader('content-type', 'application/json');
                    res.writeHead(200);
                    var token = randtoken.generate(16);
                    var expIn = expiresIn(3);
//saveTokenToDatabase({email:user.username , token: token}, req, res);
                    res.end('{"email":"'+user.username.toLowerCase()+'","token":"'+token+'","expiresIn":'+expIn+',"customer":"'+user.customer+'"}');
                    req.session.currentuser = {};
                    req.session.currentuser.username = user.username.toLowerCase();
                    req.session.currentuser.customer = user.customer;
                    req.session.save();
console.log("req.session.currentuser.username == "+req.session.currentuser.username.toLowerCase());
                    console.log('login success user looks like:  '+'{"email":"'+user.username.toLowerCase()+'","token":"'+token+'","expiresIn":'+expIn+',"customer":"'+user.customer+'"}');
                    return;
                }

                var reasonCouldNotLogIn = "User not activated";
                // otherwise we can determine why we failed
                var reasons = User.failedLogin;
                switch (reason) {
                    case reasons.NOT_FOUND:
                    case reasons.PASSWORD_INCORRECT:
                        // note: these cases are usually treated the same - don't tell
                        // the user *why* the login failed, only that it did
                        reasonCouldNotLogIn = "Not Found OR Incorrect Password";
                        break;
                    case reasons.MAX_ATTEMPTS:
                        // send email or otherwise notify user that account is
                        // temporarily locked
                        reasonCouldNotLogIn = "Max Attempts"
                        break;
                }
console.log('5. could not log in reasonCouldNotLogIn == '+reasonCouldNotLogIn);
                res.setHeader('content-type', 'application/json');
                res.writeHead(200);

                res.end("{\"email\":\""+reasonCouldNotLogIn+"\"}");
            });  // User.getAuthenticated
      });
  }

});

function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}

function sendIfNoSSLRequired(page_path, req, res)
{
    if(!DISABLE_SSL)
    {
      // on heroku production deployment
      if (req.headers['x-forwarded-proto'] == "https")
      {
        console.log("ssl found - getting encrypted page");
        res.sendFile(page_path)
      } else
      {
        console.log("ssl not found - sending error message");
        //res.end("Sorry, this must be accessed over https.");
        res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
        res.end();
      }
    } else
    {
      // running locally
      console.log("ssl not needed - sending unencrypted admin page");
      res.sendFile(page_path)
    }
}

 /*app.get("/admin", function(req, res) {
  console.log('called /admin!!!!!!!!!!');
    sendIfNoSSLRequired(__dirname + '/indexAppManager.html',req, res)
 });
 */
 app.get("/newAdmin", function(req, res) {
  console.log('called /newAdmin!!!!!!!!!!');
    sendIfNoSSLRequired(__dirname + '/newAppManager.html',req, res)
 });
 
 app.get("/chat", function(req, res) {
  console.log('called /newAdmin!!!!!!!!!!');
    sendIfNoSSLRequired(__dirname + '/chat.html',req, res)
 });
 

function createExceldocument(trailer_data, callbackfunction)
{
  // Create a random string of nonsense so users can't overwrite their excel files
  var token = randtoken.generate(16);
  var excelFilename = 'sample'+token+'.xlsx';
  // Create a new workbook file in current working-path 
  var workbook = excelbuilder.createWorkbook('./', excelFilename)
  
  // Create a new worksheet with 10 columns and 12 rows 
  var sheet1 = workbook.createSheet('Exported Customer Portal Units', 50, trailer_data.length+10);
  
  var columnTitles = ["Unit #",
  "Customer",
  "Account",
  "Vehicle Type",
  "Location",
  "Date RS Notified",
  "Date Approved",
  "Estimated Time of Completion",
  "Status"]

  for (var i = 0; i < columnTitles.length; i++)
  {
    sheet1.set(i+1, 1, columnTitles[i]);
  }

  for (var j = 0; j < trailer_data.length; j++)
  {
    var currentTrailer = trailer_data[j];

    var widthOfEachColumn = 30;

    sheet1.width(1, widthOfEachColumn);
    sheet1.set(1, j+3,currentTrailer.unitnumber);
    sheet1.width(2, widthOfEachColumn);
    sheet1.set(2, j+3, currentTrailer.customer);
    sheet1.width(3, widthOfEachColumn);
    sheet1.set(3, j+3, currentTrailer.account);
    sheet1.width(4, widthOfEachColumn);
    sheet1.set(4, j+3, currentTrailer.vehicletype);
    sheet1.width(5, widthOfEachColumn);
    sheet1.set(5, j+3, currentTrailer.location);
    sheet1.width(6, widthOfEachColumn);
    sheet1.set(6, j+3, currentTrailer.datersnotified);
    sheet1.width(7, widthOfEachColumn);
    sheet1.set(7, j+3, currentTrailer.dateapproved);
    sheet1.width(8, widthOfEachColumn);
    sheet1.set(8, j+3, currentTrailer.estimatedtimeofcompletion);
    sheet1.width(9, widthOfEachColumn);
    sheet1.set(9, j+3, currentTrailer.status1);
    sheet1.width(10, widthOfEachColumn);
    sheet1.set(10, j+3, currentTrailer.status2);
    sheet1.width(11, widthOfEachColumn);
    sheet1.set(11, j+3, currentTrailer.status3);
  }

  // Fill some data 
/*  sheet1.set(1, 1, 'I am title');
  for (var i = 2; i < 5; i++)
    sheet1.set(i, 1, 'test'+i);
*/  
  // Save it 
  workbook.save(function(ok){
/*    if (!ok) {
      console.log('           workbook canceling ok == '+ok);
      workbook.cancel();
    }
    else {
*/      console.log('------------congratulations, your workbook created');
      callbackfunction(excelFilename);
      
/*    }*/
  });

} // end createExceldocument



app.get("/FleetRepairSolutionsPortalData.xlsx", function(req, res) {
  

  var trailerRay = [];
console.log("------------------ req.query.searchTerm == "+req.query.searchTerm);
//console.log("\n\n/trailers req.session == "+JSON.stringify(req.session))
if(req.session.currentuser.customer == "ADMIN")
{
  var searchStringArray = req.query.searchTerm.split(" ");

  var orclausearray = [];
  for (var i = 0; i < searchStringArray.length; i++)
  {
    orclausearray.push({unitnumber: new RegExp(searchStringArray[i])})
    orclausearray.push({customer: new RegExp(searchStringArray[i])})
    orclausearray.push({account: new RegExp(searchStringArray[i])})
    orclausearray.push({vehicletype: new RegExp(searchStringArray[i])})
    orclausearray.push({location: new RegExp(searchStringArray[i])})
    orclausearray.push({datersnotified: new RegExp(searchStringArray[i])})
    orclausearray.push({dateapproved: new RegExp(req.query.searchTerm)})
    orclausearray.push({estimatedtimeofcompletion: new RegExp(searchStringArray[i])})
    orclausearray.push({status1: new RegExp(searchStringArray[i])})
    orclausearray.push({status2: new RegExp(searchStringArray[i])})
    orclausearray.push({status3: new RegExp(searchStringArray[i])})  
  }
  var orclause =  {$or: orclausearray}
  // var orclause =  {$or: [{status1: new RegExp('^10%', "i")}]}

  console.log ('               found ADMIN');
  Trailer.find(orclause, function(err, docs){
    if(err)
    {
       console.log("ERROR - getting all Trailers.");
      res.setHeader('content-type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(trailerRay));
    } else
    {
      trailerRay = docs;
      console.log('            got all Trailer documents length = '+trailerRay.length);
      // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
      createExceldocument(trailerRay, function(excelFilename) {
        console.log("           in createExelDocument callback -----sending xsl file");
/*        res.setHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.writeHead(200);
*/        //res.end(JSON.stringify(trailerRay));
        console.log('!!!!!!!!!!!! path ==' + path.join(__dirname, '/'+excelFilename));
        sendIfNoSSLRequired(path.join(__dirname, '/'+excelFilename),req, res)  
      });

    }
  });
} else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined)
{
  var searchStringArray = req.query.searchTerm.split(" ");

  var orclausearray = [];
  for (var i = 0; i < searchStringArray.length; i++)
  {
    orclausearray.push({unitnumber: new RegExp(searchStringArray[i])})
    orclausearray.push({customer: new RegExp(searchStringArray[i])})
    orclausearray.push({account: new RegExp(searchStringArray[i])})
    orclausearray.push({vehicletype: new RegExp(searchStringArray[i])})
    orclausearray.push({location: new RegExp(searchStringArray[i])})
    orclausearray.push({datersnotified: new RegExp(searchStringArray[i])})
    orclausearray.push({dateapproved: new RegExp(req.query.searchTerm)})
    orclausearray.push({estimatedtimeofcompletion: new RegExp(searchStringArray[i])})
    orclausearray.push({status1: new RegExp(searchStringArray[i])})
    orclausearray.push({status2: new RegExp(searchStringArray[i])})
    orclausearray.push({status3: new RegExp(searchStringArray[i])})  
  }

  var orclause =  {$or: orclausearray}

  var andclause =  {$and: [orclause, {customer: req.session.currentuser.customer}]}

  Trailer.find(andclause, function(err, docs){
    if(err)
    {
       console.log("ERROR - getting all Trailers.");
      res.setHeader('content-type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(trailerRay));
    } else
    {
      trailerRay = docs;
      // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
      createExceldocument(trailerRay, function(excelFilename) {
        console.log("           in createExelDocument callback -----sending xsl file");
/*        res.setHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.writeHead(200);
*/        //res.end(JSON.stringify(trailerRay));
        console.log('!!!!!!!!!!!! path ==' + path.join(__dirname, '/'+excelFilename));
        sendIfNoSSLRequired(path.join(__dirname, '/'+excelFilename),req, res)  
      });
    }
  });
} // END IF










 });
 
app.get("/trailers", function(req, res) {
  var trailerRay = [];

console.log("\n\n/trailers req.session == "+JSON.stringify(req.session))
if(req.session.currentuser.customer == "ADMIN")
{
  Trailer.find({}, function(err, docs){
    if(err)
    {
       console.log("ERROR - getting all Trailers.");
      res.setHeader('content-type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(trailerRay));
    } else
    {
      trailerRay = docs;
      // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
    res.setHeader('content-type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(trailerRay));
    }
  });
} else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined)
{
  Trailer.find({customer: req.session.currentuser.customer}, function(err, docs){
    if(err)
    {
       console.log("ERROR - getting all Trailers.");
      res.setHeader('content-type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(trailerRay));
    } else
    {
      trailerRay = docs;
      // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
    res.setHeader('content-type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(trailerRay));
    }
  });
} // END IF

});
 





app.get("/FleetRepairSolutionsOnLotPortalData.xlsx", function(req, res) {
  

 // These are the statuses of the trailers on the lot.
  var onLotStatuses =
      ["10%  A/W AUTHORIZATION",
      "10%  A/W PARTS",
      "10%  A/W ESTIMATE",
      "10%  A/W ARRIVAL OF UNIT",
      "25%  A/W REPAIRS",
      "50%  WORK IN PROGRESS",
      "75%  WORK IN PROGRESS",
      "90%  A/W FINAL QUALITY CHECK",
      "100% COMPLETE:  IN TRANSIT TO CUSTOMER",
      "100% COMPLETE:  READY FOR P/U",
/*      "100% COMPLETE:  RELEASED TO CUSTOMER", // these are not in lot
      "100% COMPLETE:  DELIVERED TO CUSTOMER", // these aren't in lot
*/      "100% COMPLETE:  RESERVED"
      ];


  var trailerRay = [];
console.log("------------------ req.query.searchTerm == "+req.query.searchTerm);
//console.log("\n\n/trailers req.session == "+JSON.stringify(req.session))
if(req.session.currentuser.customer == "ADMIN")
{
  var searchStringArray = req.query.searchTerm.split(" ");

  var orclausearray = [];
  for (var i = 0; i < searchStringArray.length; i++)
  {
    orclausearray.push({unitnumber: new RegExp(searchStringArray[i])})
    orclausearray.push({customer: new RegExp(searchStringArray[i])})
    orclausearray.push({account: new RegExp(searchStringArray[i])})
    orclausearray.push({vehicletype: new RegExp(searchStringArray[i])})
    orclausearray.push({location: new RegExp(searchStringArray[i])})
    orclausearray.push({datersnotified: new RegExp(searchStringArray[i])})
    orclausearray.push({dateapproved: new RegExp(req.query.searchTerm)})
    orclausearray.push({estimatedtimeofcompletion: new RegExp(searchStringArray[i])})
    orclausearray.push({status1: new RegExp(searchStringArray[i])})
    orclausearray.push({status2: new RegExp(searchStringArray[i])})
    orclausearray.push({status3: new RegExp(searchStringArray[i])})  
  }
  var orclause =  {$or: orclausearray}

  var orclausearray2 = [];
  for (var i = 0; i < onLotStatuses.length; i++)
  {
    orclausearray2.push({status1: new RegExp(onLotStatuses[i])})
  }
  orclausearray2.push({status1: undefined})
  orclausearray2.push({status1: ""})
  orclausearray2.push({status1: null})

  var orclause2 =  {$or: orclausearray2}

  var andclause =  {$and: [orclause, orclause2, {location: "FRS - (GRANTVILLE PA)"}]}
  // var orclause =  {$or: [{status1: new RegExp('^10%', "i")}]}

  console.log ('               found ADMIN');
  Trailer.find(andclause, function(err, docs){
    if(err)
    {
       console.log("ERROR - getting all Trailers.");
      res.setHeader('content-type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(trailerRay));
    } else
    {
      trailerRay = docs;
      console.log('            got all Trailer documents length = '+trailerRay.length);
      // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
      createExceldocument(trailerRay, function(excelFilename) {
        console.log("           in createExelDocument callback -----sending xsl file");
/*        res.setHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.writeHead(200);
*/        //res.end(JSON.stringify(trailerRay));
        console.log('!!!!!!!!!!!! path ==' + path.join(__dirname, '/'+excelFilename));
        sendIfNoSSLRequired(path.join(__dirname, '/'+excelFilename),req, res)  
      });

    }
  });
} else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined)
{
  var searchStringArray = req.query.searchTerm.split(" ");

  var orclausearray = [];
  for (var i = 0; i < searchStringArray.length; i++)
  {
    orclausearray.push({unitnumber: new RegExp(searchStringArray[i])})
    orclausearray.push({customer: new RegExp(searchStringArray[i])})
    orclausearray.push({account: new RegExp(searchStringArray[i])})
    orclausearray.push({vehicletype: new RegExp(searchStringArray[i])})
    orclausearray.push({location: new RegExp(searchStringArray[i])})
    orclausearray.push({datersnotified: new RegExp(searchStringArray[i])})
    orclausearray.push({dateapproved: new RegExp(req.query.searchTerm)})
    orclausearray.push({estimatedtimeofcompletion: new RegExp(searchStringArray[i])})
    orclausearray.push({status1: new RegExp(searchStringArray[i])})
    orclausearray.push({status2: new RegExp(searchStringArray[i])})
    orclausearray.push({status3: new RegExp(searchStringArray[i])})  
  }

  var orclause =  {$or: orclausearray}


  var orclausearray2 = [];
  for (var i = 0; i < onLotStatuses.length; i++)
  {
    orclausearray2.push({status1: new RegExp(onLotStatuses[i])})
  }
  orclausearray2.push({status1: undefined})
  orclausearray2.push({status1: ""})
  orclausearray2.push({status1: null})

  var orclause2 =  {$or: orclausearray2}

  var andclause =  {$and: [orclause, orclause2, 
                        {location: "FRS - (GRANTVILLE PA)"}
                        , {customer: req.session.currentuser.customer}]}


  Trailer.find(andclause, function(err, docs){
    if(err)
    {
       console.log("ERROR - getting all Trailers.");
      res.setHeader('content-type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(trailerRay));
    } else
    {
      trailerRay = docs;
      // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
      createExceldocument(trailerRay, function(excelFilename) {
        console.log("           in createExelDocument callback -----sending xsl file");
/*        res.setHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.writeHead(200);
*/        //res.end(JSON.stringify(trailerRay));
        console.log('!!!!!!!!!!!! path ==' + path.join(__dirname, '/'+excelFilename));
        sendIfNoSSLRequired(path.join(__dirname, '/'+excelFilename),req, res)  
      });
    }
  });
} // END IF










 });
 





app.get("/trailersonlot", function(req, res) {

  // These are the statuses of the trailers on the lot.
  var onLotStatuses =
      ["10%  A/W AUTHORIZATION",
      "10%  A/W PARTS",
      "10%  A/W ESTIMATE",
      "10%  A/W ARRIVAL OF UNIT",
      "25%  A/W REPAIRS",
      "50%  WORK IN PROGRESS",
      "75%  WORK IN PROGRESS",
      "90%  A/W FINAL QUALITY CHECK",
      "100% COMPLETE:  IN TRANSIT TO CUSTOMER",
      "100% COMPLETE:  READY FOR P/U",
/*      "100% COMPLETE:  RELEASED TO CUSTOMER", // these are not in lot
      "100% COMPLETE:  DELIVERED TO CUSTOMER", // these aren't in lot
*/      "100% COMPLETE:  RESERVED"
      ]



  var trailerRay = [];
console.log("-----------executing /trailersonlot");

console.log("\n\n/trailers req.session == "+JSON.stringify(req.session))
if(req.session.currentuser.customer == "ADMIN")
{


  var orclausearray = [];
  for (var i = 0; i < onLotStatuses.length; i++)
  {
    orclausearray.push({status1: new RegExp(onLotStatuses[i])})
  }
  orclausearray.push({status1: undefined})
  orclausearray.push({status1: ""})
  orclausearray.push({status1: null})

  var orclause =  {$or: orclausearray}

  var andclause =  {$and: [orclause, {location: "FRS - (GRANTVILLE PA)"}]}


  Trailer.find(andclause, function(err, docs){
    if(err)
    {
       console.log("ERROR - getting all Trailers.");
      res.setHeader('content-type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(trailerRay));
    } else
    {
      trailerRay = docs;
      // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
    res.setHeader('content-type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(trailerRay));
    }
  });
} else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined)
{

  var orclausearray = [];
  for (var i = 0; i < onLotStatuses.length; i++)
  {
    orclausearray.push({status1: new RegExp(onLotStatuses[i])})
  }
  orclausearray.push({status1: undefined})
  orclausearray.push({status1: ""})
  orclausearray.push({status1: null})

  var orclause =  {$or: orclausearray}

  var andclause =  {$and: [orclause, {customer: req.session.currentuser.customer}, {location: "FRS - (GRANTVILLE PA)"}]}

  Trailer.find(andclause, function(err, docs){
    if(err)
    {
       console.log("ERROR - getting all Trailers.");
      res.setHeader('content-type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(trailerRay));
    } else
    {
      trailerRay = docs;
      // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
    res.setHeader('content-type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(trailerRay));
    }
  });
} // END IF

});
 
app.get("/trailerarchives", function(req, res) {
  var trailerRay = [];

console.log("\n\n/trailers req.session == "+JSON.stringify(req.session))
if(req.session.currentuser.customer == "ADMIN")
{
  TrailerArchive.find({}, function(err, docs){
    if(err)
    {
       console.log("ERROR - getting all Trailers.");
      res.setHeader('content-type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(trailerRay));
    } else
    {
      trailerRay = docs;
      // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
    res.setHeader('content-type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(trailerRay));
    }
  });
} else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined)
{
  TrailerArchive.find({customer: req.session.currentuser.customer}, function(err, docs){
    if(err)
    {
       console.log("ERROR - getting all Trailers.");
      res.setHeader('content-type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(trailerRay));
    } else
    {
      trailerRay = docs;
      // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
    res.setHeader('content-type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(trailerRay));
    }
  });
} // END IF

});
 
app.post("/barchartdata", function(req, res) {
  var wins2 = [
  // [0,13],[1,11],[2,15],[3,15],[4,18],[5,21],[6,28]
  ];
  var percents2 = [
      [0, "10% Complete"],
      [1, "50%, 75%, 90% Complete"],
      [2, "100% Complete"]];

  var barchartdata = {"wins": wins2, "percents": percents2};


    var tempChartData = [];  
    Trailer.find({status1: new RegExp('^10%', "i")}, function( err, trailers10){
      console.log( "Number of 10% Trailers:", trailers10.length );
      wins2.push([0,trailers10.length]);

      Trailer.find({status1: new RegExp('^50%', "i")}, function( err, trailers50){
        console.log( "Number of 50% Trailers:", trailers50.length );
        wins2.push([1,trailers50.length]);

        Trailer.find({status1: new RegExp('^75%', "i")}, function( err, trailers75){
          console.log( "Number of 75% Trailers:", trailers50.length );
          wins2[1][1] += trailers75.length

          Trailer.find({status1: new RegExp('^90%', "i")}, function( err, trailers90){
            console.log( "Number of 90% Trailers:", trailers90.length );
            wins2[1][1] += trailers90.length

            Trailer.find({status1: new RegExp('^100%', "i")}, function( err, trailers100){
              console.log( "Number of 100% Trailers:", trailers100.length );
              wins2.push([2,trailers100.length]);

              res.setHeader('content-type', 'application/json');
              res.writeHead(200);
              res.end(JSON.stringify(barchartdata));


            });

          });
        });
      });

    });


});

app.get("/getAUsersCustomer", function(req, res) {
  res.setHeader('content-type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify({customer: req.session.currentuser.customer}));
});

app.post("/piechartdata", function(req, res) {
  var piechartdata = [
/*      {data: [[0,14]], label: "10%"},
      {data: [[1,14]], label: "50%"},
      {data: [[2,14]], label: "75%"},
      {data: [[3,14]], label: "90%"},
      {data: [[4,38]], label: "100%"}
*/
  ];

if(req.session.currentuser.customer == "ADMIN")
{

/*    var statuses = [
      ["","blanklight.png"],
      ["10% - A/Authorization","redlight.png"],
      ["10% - A/Parts","redlight.png"],
      ["10% - A/Estimate","redlight.png"],
      ["10% - A/Repairs","redlight.png"],
      ["10% - A/Arrival of Unit","redlight.png"],
      ["50% - Work In Progress","yellowlight.png"],
      ["75% - Work In Progress","yellowlight.png"],
      ["90% - A/W Final Quality Check","yellowlight.png"],
      ["100% - Complete - Ready for P/U","greenlight.png"],
      ["100% - Complete - Released to Customer","greenlight.png"],
      ["100% - Complete - Reserved for Driver","greenlight.png"]
    ];
*/
    var tempChartData = [];  
    Trailer.find({status1: new RegExp('^10%', "i")}, function( err, trailers10){
      console.log( "Number of 10% Trailers:", trailers10.length );
      piechartdata.push({data: [[0,trailers10.length]], label: "10% Compelete", color:"#ff3f0b"});

      Trailer.find({status1: new RegExp('^50%', "i")}, function( err, trailers50){
        console.log( "Number of 50% Trailers:", trailers50.length );
        piechartdata.push({data: [[1,trailers50.length]], label: "25%, 50%,75%,90% Complete", color: "#fffc0b"});


Trailer.find({status1: new RegExp('^25%', "i")}, function( err, trailers25){
  piechartdata[1].data[0][1] += trailers25.length


        Trailer.find({status1: new RegExp('^75%', "i")}, function( err, trailers75){
          console.log( "Number of 75% Trailers:", trailers75.length );
          piechartdata[1].data[0][1] += trailers75.length

          Trailer.find({status1: new RegExp('^90%', "i")}, function( err, trailers90){
            console.log( "Number of 90% Trailers:", trailers90.length );
            piechartdata[1].data[0][1] += trailers90.length

            Trailer.find({status1: new RegExp('^100%', "i")}, function( err, trailers100){
              console.log( "Number of 100% Trailers:", trailers100.length );
              piechartdata.push({data: [[2,trailers100.length]], label: "100% Complete", color: "#00b800"});

              res.setHeader('content-type', 'application/json');
              res.writeHead(200);
              res.end(JSON.stringify(piechartdata));


            }); // end 100%

          }); // end 90%
        }); // end 75%



});  // end 25%



      }); // end 50%

    }); // end 10%
} else
{
    var tempChartData = [];  
    var andclause =  {$and: [{status1: new RegExp('^10%', "i")}, {customer: req.session.currentuser.customer}]}
    // {status1: new RegExp('^10%', "i")}
    Trailer.find(andclause, function( err, trailers10){
      console.log( "Number of 10% Trailers:", trailers10.length );
      piechartdata.push({data: [[0,trailers10.length]], label: "10% Compelete", color:"#ff3f0b"});



andclause =  {$and: [{status1: new RegExp('^25%', "i")}, {customer: req.session.currentuser.customer}]}
Trailer.find(andclause, function( err, trailers25){
  console.log( "Number of 25% Trailers:", trailers25.length );
  piechartdata.push({data: [[1,trailers25.length]], label: "25%,50%,75%,90% Complete", color: "#fffc0b"});




      andclause =  {$and: [{status1: new RegExp('^50%', "i")}, {customer: req.session.currentuser.customer}]}
      Trailer.find(andclause, function( err, trailers50){
        console.log( "Number of 50% Trailers:", trailers50.length );
        piechartdata[1].data[0][1] += trailers50.length

        andclause =  {$and: [{status1: new RegExp('^75%', "i")}, {customer: req.session.currentuser.customer}]}
        Trailer.find(andclause, function( err, trailers75){
          console.log( "Number of 75% Trailers:", trailers50.length );
          piechartdata[1].data[0][1] += trailers75.length

          andclause =  {$and: [{status1: new RegExp('^90%', "i")}, {customer: req.session.currentuser.customer}]}

          Trailer.find(andclause, function( err, trailers90){
            console.log( "Number of 90% Trailers:", trailers90.length );
            piechartdata[1].data[0][1] += trailers90.length

            andclause =  {$and: [{status1: new RegExp('^100%', "i")}, {customer: req.session.currentuser.customer}]}
            Trailer.find(andclause, function( err, trailers100){
              console.log( "Number of 100% Trailers:", trailers100.length );
              piechartdata.push({data: [[2,trailers100.length]], label: "100% Complete", color: "#00b800"});

              res.setHeader('content-type', 'application/json');
              res.writeHead(200);
              res.end(JSON.stringify(piechartdata));


            }); // end 100%

          }); // end 90%
        }); // end 75%
      }); // end 50%


}); // end 25%



    }); // end 10%
} // end else clause
});

app.post("/savenewaccount", function(req, res) {
if(req.session.currentuser.customer == "ADMIN")
{
  if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });
      req.on('end', function () {
           saveUserToDatabase(JSON.parse(jsonString),req, res);
      });
  }

  res.setHeader('content-type', 'application/json');
  res.writeHead(200);
  res.end("{}");
}//end if
});

// for administrators to change the password of a user
app.post("/resetuserspassword", function(req, res) {
if(req.session.currentuser.customer == "ADMIN")
{
  if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });
      req.on('end', function () {
           var userdata = JSON.parse(jsonString);
           console.log("/resetuserspassword - jsonString == "+jsonString);


           User.findOne({ username: userdata.email }, function (err, user){
            user.password = userdata.password;
            user.save();

            res.setHeader('content-type', 'application/json');
            res.writeHead(200);
            res.end("{}");
          });
      });
  }
} // end if
});

// for the user to change their own password
app.post("/doletuserresetpassword", function(req, res) {
  console.log("\n\n/doletuserresetpassword---------------customer == "+ req.session.currentuser.customer+"\n\n");

  if(req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined)
  {
    if (req.method == 'POST') {
        var jsonString = '';
        req.on('data', function (data) {
            jsonString += data;
        });
        req.on('end', function () {
             var userdata = JSON.parse(jsonString);




User.getAuthenticated(req.session.currentuser.username.toLowerCase(), userdata.currentpassword, function(err, user, reason) {



                if (err) throw err;
console.log('3.  found a user');
                // login was successful if we have a user
                if (user && user.activated) {
console.log('4.  user is valid and activated');                  
                    // handle login success


                     User.findOne({ username: req.session.currentuser.username }, function (err, user){
                      if (err)
                      {
                        res.setHeader('content-type', 'application/json');
                        res.writeHead(200);
                        res.end('{"status": "Could not find user in database!"}');
                      }

                      // save new password
                      user.password = userdata.password;
                      user.save();

                      res.setHeader('content-type', 'application/json');
                      res.writeHead(200);
                      res.end('{"status": "successful"}');
                    }); // end User.findOne

                    return;
                }

                var reasonCouldNotLogIn = "User not activated";
                // otherwise we can determine why we failed
                var reasons = User.failedLogin;
                switch (reason) {
                    case reasons.NOT_FOUND:
                    case reasons.PASSWORD_INCORRECT:
                        // note: these cases are usually treated the same - don't tell
                        // the user *why* the login failed, only that it did
                        reasonCouldNotLogIn = "Not Found OR Incorrect Password";
                        break;
                    case reasons.MAX_ATTEMPTS:
                        // send email or otherwise notify user that account is
                        // temporarily locked
                        reasonCouldNotLogIn = "Max Attempts"
                        break;
                }
console.log('5. could not log in reasonCouldNotLogIn == '+reasonCouldNotLogIn);
                res.setHeader('content-type', 'application/json');
                res.writeHead(200);

                res.end("{\"status\":\""+reasonCouldNotLogIn+"\"}");

            });  // User.getAuthenticated
  
        });
    }
  } // end if
});

app.post("/savetrailer", function(req, res) {
if(req.session.currentuser.customer == "ADMIN")
{
  if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });
      req.on('end', function () {
           var newTrailerObject = JSON.parse(jsonString);

          var statusesToSetToUndefined =
            ["100% COMPLETE:  IN TRANSIT TO CUSTOMER", 
            "100% COMPLETE:  READY FOR P/U", 
            "100% COMPLETE:  RESERVED"
          ];

          var markForArchival = true;
          for (var j = 0; j < statusesToSetToUndefined.length; j++)
          {
            if (statusesToSetToUndefined[j] == newTrailerObject.status1)
            {
              markForArchival = false;
              break;
            }
          }

           if (markForArchival && newTrailerObject.status1.indexOf("100%") > -1)
           {
              var currentDateInMillisectonds = new Date().getTime()
              var timeInMillisecondsToAdd = 1000*60*60*24*5; // 5 days

              var dateWithAddedOffset = new Date(currentDateInMillisectonds + timeInMillisecondsToAdd);

              newTrailerObject.whentobearchived = dateWithAddedOffset;
           } else
           {
            newTrailerObject.whentobearchived = undefined;
           }

           var trailer = new Trailer(newTrailerObject);


            trailer.save(function (err) {
              if (err) 
              {
                console.log('ERROR saving trailer!!');
              } else 
              {
                console.log("Trailer saved successfully!");
              }
              
            });
      });
  }

  res.setHeader('content-type', 'application/json');
  res.writeHead(200);
  res.end("{}");
}//end if
});

app.post("/updatetrailer", function(req, res) {
if(req.session.currentuser.customer == "ADMIN")
{
  if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });
      req.on('end', function () {
           var newTrailerObject = JSON.parse(jsonString);
           console.log("/updatetrailer - jsonString == "+jsonString);


          var statusesToSetToUndefined =
            ["100% COMPLETE:  IN TRANSIT TO CUSTOMER", 
            "100% COMPLETE:  READY FOR P/U", 
            "100% COMPLETE:  RESERVED"
          ];

          var markForArchival = true;
          for (var j = 0; j < statusesToSetToUndefined.length; j++)
          {
            if (statusesToSetToUndefined[j] == newTrailerObject.status1)
            {
              markForArchival = false;
              break;
            }
          }


           if (markForArchival && newTrailerObject.status1.indexOf("100%") > -1)
           {
              var currentDateInMillisectonds = new Date().getTime()
              var timeInMillisecondsToAdd = 1000*10;//1000*60*60*24*5; // 5 days

              var dateWithAddedOffset = new Date(currentDateInMillisectonds + timeInMillisecondsToAdd);

              newTrailerObject.whentobearchived = dateWithAddedOffset;
           } else
           {
            newTrailerObject.whentobearchived = undefined;
           }
console.log("\n\n----------------- 1");
            Trailer.findOneAndUpdate({_id: newTrailerObject._id}, newTrailerObject, {}, function(err, doc){
                if (err)
                {
                  console.log("ERROR - could not find and update the trailer with _id == "+newTrailerObject._id);
                } else
                {
                  console.log("found in updatetrailer - _id found == "+doc._id);
                }
console.log("----------------- 2");



            File.find({trailer_id: doc._id}, function(err, docs){
              if(err) throw err;

              if (docs.length == 0 )
              {
                res.setHeader('content-type', 'application/json');
                res.writeHead(200);
                res.end("{}");
              }
console.log("numer of files found == "+docs.length);              
var count = 0;
              for (var i = 0; i < docs.length; i++)
              {
                var foundFile = docs[i];

                foundFile.customer = newTrailerObject.customer;
console.log("----------------- 3 foundFile.name == "+foundFile.name);
                foundFile.save(function(err) {
console.log(" err == "+err);                  
                    if (err) throw err;
                    count++;
console.log("     count == "+count);                    
                    if (count == docs.length)
                    {
console.log("sending back content!!!!!!!!!!!!!!!!!!!!!");                      
                      res.setHeader('content-type', 'application/json');
                      res.writeHead(200);
                      res.end("{}");
                    } // end if
                });

                /*File.findOneAndUpdate({_id: foundFile._id}, foundFile, {}, 
                    function(err, doc2){
console.log("----------------- 4");
                      if (i == docs.length-1)
                      {
                        res.setHeader('content-type', 'application/json');
                        res.writeHead(200);
                        res.end("{}");
                      } // end if
                    }
                ); // end Trailer.findOneAndUpdate
                */
              } // end for

            }); // end Trailer.find


            });/*            var trailer = new Trailer(newTrailerObject);
            trailer.save(function (err) {
              if (err) 
              {
                console.log('ERROR saving trailer!!');
              } else 
              {
                console.log("Trailer saved successfully!");
              }
              
            });
*/
console.log("----------------- 5");

      });

console.log("----------------- 6   Write empty json response.");

/*                res.setHeader('content-type', 'application/json');
                res.writeHead(200);
                res.end("{}");
*/
  }
} // end if
});

app.get("/getusers", function(req, res) {
if(req.session.currentuser.customer == "ADMIN")
{
  User.find({},function(err, obj) {
    if (err)
    {
      console.log("ERROR! - can not find any users!!!");
      res.setHeader('content-type', 'application/json');
      res.writeHead(200);
      res.end("[]");
    } else
    {
      var usersWithJustEmailAndCustomer = [];
      for (var i = 0; i < obj.length; i++)
      {
        usersWithJustEmailAndCustomer.push({email: obj[i].username, customer: obj[i].customer})
      }

      console.log("found these users == "+JSON.stringify(usersWithJustEmailAndCustomer));
      res.setHeader('content-type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(usersWithJustEmailAndCustomer));
    }
  });
} // end if
});
 
app.post("/gettrailer", function(req, res) {
if(req.session.currentuser.customer == "ADMIN")
{
  if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });
      req.on('end', function () {
           var _idObj = JSON.parse(jsonString);
           Trailer.find({_id:_idObj._id},function(err, obj) {
              if (err)
              {
                console.log("ERROR! - can not find trailer record with _id == "+_id);
              } else
              {
                console.log("called gettrailer obj == "+JSON.stringify(obj[0]));
                res.setHeader('content-type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify(obj[0]));
              }
            });
      });
  }
} else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined)
{
  if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });
      req.on('end', function () {
           var _idObj = JSON.parse(jsonString);
           Trailer.find({_id:_idObj._id, customer: req.session.currentuser.customer},function(err, obj) {
              if (err)
              {
                console.log("ERROR! - can not find trailer record with _id == "+_id);
              } else
              {
                console.log("called gettrailer obj == "+JSON.stringify(obj[0]));
                res.setHeader('content-type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify(obj[0]));
              }
            });
      });
  }
} // end else if
});


app.post("/getnameoftrailerdocument", function(req, res) {
if(req.session.currentuser.customer == "ADMIN")
{
  if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });
      req.on('end', function () {
           var _idObj = JSON.parse(jsonString);
           File.findOne({_id:_idObj._id},function(err, obj) {
              if (err)
              {
                console.log("ERROR! - can not find document with _id == "+_id);
              } else
              {
                var token = randtoken.generate(16);
                var filename = token+obj.name;
                var filenamewithpath = path.join(__dirname, 'documentsforreading',filename);
                fs.writeFile(filenamewithpath, obj.contents, function (err) {
                  if (err) return console.log(err);
                  console.log('Hello World > helloworld.txt');
  
                  res.setHeader('content-type', 'application/json');
                  res.writeHead(200);
                  res.end(JSON.stringify({"filename": filename}));
                });
              }
            });
      });
  }
} else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined)
{
  if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });
      req.on('end', function () {
           var _idObj = JSON.parse(jsonString);
           File.findOne({_id:_idObj._id, customer: req.session.currentuser.customer},function(err, obj) {
              if (err)
              {
                console.log("ERROR! - can not find document with _id == "+_id);
              } else
              {
                var token = randtoken.generate(16);
                var filename = token+obj.name;
                var filenamewithpath = path.join(__dirname, 'documentsforreading',filename);
                fs.writeFile(filenamewithpath, obj.contents, function (err) {
                  if (err) return console.log(err);
                  console.log('Hello World > helloworld.txt');
  
                  res.setHeader('content-type', 'application/json');
                  res.writeHead(200);
                  res.end(JSON.stringify({"filename": filename}));
                });
              }
            });
      });
  } // end POST if
} // end else if
});

app.post("/getnameoftrailerarchivedocument", function(req, res) {
if(req.session.currentuser.customer == "ADMIN")
{
  if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });
      req.on('end', function () {
           var _idObj = JSON.parse(jsonString);
           FileArchive.findOne({_id:_idObj._id},function(err, obj) {
              if (err)
              {
                console.log("ERROR! - can not find document with _id == "+_id);
              } else
              {
                var token = randtoken.generate(16);
                var filename = token+obj.name;
                var filenamewithpath = path.join(__dirname, 'documentsforreading',filename);
                fs.writeFile(filenamewithpath, obj.contents, function (err) {
                  if (err) return console.log(err);
                  console.log('Hello World > helloworld.txt');
  
                  res.setHeader('content-type', 'application/json');
                  res.writeHead(200);
                  res.end(JSON.stringify({"filename": filename}));
                });
              }
            });
      });
  }
} else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined)
{
  if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });
      req.on('end', function () {
           var _idObj = JSON.parse(jsonString);
           FileArchive.findOne({_id:_idObj._id, customer: req.session.currentuser.customer},function(err, obj) {
              if (err)
              {
                console.log("ERROR! - can not find document with _id == "+_id);
              } else
              {
                var token = randtoken.generate(16);
                var filename = token+obj.name;
                var filenamewithpath = path.join(__dirname, 'documentsforreading',filename);
                fs.writeFile(filenamewithpath, obj.contents, function (err) {
                  if (err) return console.log(err);
                  console.log('Hello World > helloworld.txt');
  
                  res.setHeader('content-type', 'application/json');
                  res.writeHead(200);
                  res.end(JSON.stringify({"filename": filename}));
                });
              }
            });
      });
  } // end POST if
} // end else if
});


app.post("/gettrailerdocuments", function(req, res) {
if(req.session.currentuser.customer == "ADMIN")
{
  if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });
      req.on('end', function () {
           var _idObj = JSON.parse(jsonString);
           File.find({trailer_id:_idObj._id},function(err, obj) {
              if (err)
              {
                console.log("ERROR! - can not find trailer record with _id == "+_id);
              } else
              {
                for (var i = 0; i < obj.length; i++)
                {
                  obj[i].contents = null;
                }

                console.log("called gettrailerdocuments obj == "+JSON.stringify(obj));
                res.setHeader('content-type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify(obj));
              }
            });
      });
  }
} else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined)
{
  if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });
      req.on('end', function () {
           var _idObj = JSON.parse(jsonString);
console.log("!!!!!!!!!!!executing File.find");
           File.find({trailer_id:_idObj._id, customer: req.session.currentuser.customer},function(err, obj) {
              if (err)
              {
                console.log("ERROR! - can not find trailer record with _id == "+_id);
              } else
              {
                for (var i = 0; i < obj.length; i++)
                {
                  obj[i].contents = null;
                }

                console.log("called gettrailerdocuments obj == "+JSON.stringify(obj));
                res.setHeader('content-type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify(obj));
              }
            });
      });
  }

} // end if
});
 

app.post("/deletetrailer", function(req, res) {
if(req.session.currentuser.customer == "ADMIN")
{
  if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });
      req.on('end', function () {
           var newDeleteTrailerObject = JSON.parse(jsonString);
           console.log("jsonString for delete trailer == "+jsonString);
           console.log("newDeleteTrailerObject._id == "+newDeleteTrailerObject._id);

          Trailer.findOneAndRemove({'_id' : newDeleteTrailerObject._id}, function (err,trailer){
              
              File.find({ trailer_id:newDeleteTrailerObject._id }).remove( function(err) {
                if (err) throw err;

                res.setHeader('content-type', 'application/json');
                res.writeHead(200);
                res.end("{}");
              });
          });
            //var trailer = new Trailer(newTrailerObject);
/*            trailer.save(function (err) {
              if (err) 
              {
                console.log('ERROR saving trailer!!');
              } else 
              {
                console.log("Trailer saved successfully!");
              }
              
            });
*/      });
  }
} // end if
});

app.post("/deleteuseraccount", function(req, res)
{
  if (req.session.currentuser.customer == "ADMIN") 
  {
    if (req.method == 'POST') 
    {
      var jsonString = '';
      req.on('data', function(data) 
      {
        jsonString += data;
      });
      req.on('end', function() 
      {

        var newDeleteUserObject = JSON.parse(jsonString);


        User.findOne({ username: newDeleteUserObject.email }, function(err, user) {



          if(user.customer == "ADMIN")
          {
            User.find({customer: new RegExp('ADMIN', "i")}, function(err, userAdmins) 
            {
              if (userAdmins.length > 1) 
              {

                User.findOneAndRemove({'username': newDeleteUserObject.email}, 
                    function(err, user) 
                    {
                      if (err) 
                      {
                          console.log("ERROR in /deleteuseraccount")
                      } else 
                      {
                          console.log("COMPLETED /deleteuseraccount successfully")

                          res.setHeader('content-type', 'application/json');
                          res.writeHead(200);
                          res.end("{}");
                      }
                    }); // end User.findOneAndRemove
              } // end useradmins.length != 1
            }); // end User.find
          } // if newDeleteUserObject.customer == 'ADMIN'
          else
          {
            // User we are deleting isn't and ADMIN
            User.findOneAndRemove({'username': newDeleteUserObject.email}, 
                function(err, user) 
                {
                  if (err) 
                  {
                      console.log("ERROR in /deleteuseraccount")
                  } else 
                  {
                      console.log("COMPLETED /deleteuseraccount successfully")

                      res.setHeader('content-type', 'application/json');
                      res.writeHead(200);
                      res.end("{}");
                  }
                }); // end User.findOneAndRemove
          }


        });  // end User.findOne


      }); // end req.on('end')
    } // end req.method == 'POST'
  }//req.session.currentuser.customer == "ADMIN"


}); // end app.post("/deleteuseraccount"

function getAllObjectsProperties(obj)
{
  var str = "";
  for (var prop in obj)
  {
    str += prop + " ";
  }

  return str;
}

app.get("/greeting", function(req, res) {
    res.setHeader('content-type', 'application/json');
    res.writeHead(200);
  
    var str = getAllObjectsProperties(req.headers);
    console.log('------header properties == '+str);
    console.log('----------cookie header == '+req.headers['cookie']);

    console.log('============req.session.lastPage == '+req.session.lastPage);
    req.session.lastPage = '/radical';
    
      if(req.headers['x-forwarded-proto'] == "https")
      {
        res.end("{\"id\":3433,\"content\":\"This is https!\"}");
      } else
    {
      res.end("{\"id\":3433,\"content\":\"Hello, World!\"}");
    }
    console.log("DISABLE_SSL == "+DISABLE_SSL);
  });

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});


 var port = process.env.PORT || 5000;
/* app.listen(port, function() {
   console.log("Listening on " + port);
 });
*/
http.listen(port, function(){
  console.log('listening on *:'+port);
});



 function sendAnEmail(toEmail, req, res, activationtoken)
 {
  // create reusable transporter object using SMTP transport
  var transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
          user: 'vapebooknet@gmail.com',
          pass: 'MMgm2285'
      }
  });

  // NB! No need to recreate the transporter object. You can use
  // the same transporter object for all e-mails
    var protocol = "http://"
    if(CHECK_FOR_SSL)
    {
      protocol = "https://";
    }

  // setup e-mail data with unicode symbols
  var mailOptions = {
      from: 'Vape Book ✔ <vapebooknet@gmail.com>', // sender address
      to: toEmail + ', ' + toEmail, // list of receivers
      subject: 'Activate Your VapeBook.net Account! ✔', // Subject line
      text: 'Follow this link to activate your VapeBook account: '+protocol + req.headers['host'] + '/activate?activationtoken='+activationtoken, // plaintext body
      html: 'Follow this link to activate your VapeBook account:<a href="'+protocol + req.headers['host'] + '/activate?activationtoken='+activationtoken+'">Activate ✔</b>' // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          console.log(error);
      }else{
          console.log('Message sent: ' + info.response);
      }
  });
}