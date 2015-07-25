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
  mongodbconnectionstring = "mongodb://dbuser:ubuntu2rbnue3@ds061621.mongolab.com:61621/heroku_pxjw3c9s";
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
      username: u.email,
      password: u.password,
      customer: u.customer,
      account: u.account,
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

app.post("/login", function(req, res) {
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
            User.getAuthenticated(loginInfoJson.email, loginInfoJson.password, function(err, user, reason) {
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
                    res.end('{"email":"'+user.username+'","token":"'+token+'","expiresIn":'+expIn+',"customer":"'+user.customer+'"}');
                    req.session.currentuser = {};
                    req.session.currentuser.username = user.username;
                    req.session.currentuser.customer = user.customer;
                    req.session.save();
console.log("req.session.currentuser.username == "+req.session.currentuser.username);                    
                    console.log('login success user looks like:  '+'{"email":"'+user.username+'","token":"'+token+'","expiresIn":'+expIn+',"customer":"'+user.customer+'"}');
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
} else 
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

app.get("/loaddummytrailerdata", function(req, res) {
if(req.session.currentuser.customer == "ADMIN")
{

  var trailerRay = [
      { unitnumber: "1245",  customer: "CHAMBERSBURG WASTE PAPER", account: "Dedicated Hershey",  vehicletype: "Flat Bed", location: "EDC III",  assignedto: "Mary",  datersnotified: "11/19/2015",  estimatedtimeofcompletion: "11/27/2015",  status1: "10% - A/Estimate", status2: "10% - A/Parts", status3: "10% - A/Authorization",  dateapproved: "11/3/2015"},
      { unitnumber: "1238",  customer: "CONTRACT LEASING CORP.", account: "Intermodal", vehicletype: "Reefer Trailer",  location: "GRANTVILLE CRENGLAND",  datersnotified: "11/19/2015",  estimatedtimeofcompletion: "11/20/2015",  status1: "50% - Work In Progress", status2: "50% - Work In Progress", status3: "",  dateapproved: "11/18/2015"},
      { unitnumber: "1294",  customer: "CR ENGLAND", account: "OTR",  vehicletype: "Container Chassis", location: "GRANTVILLE CRENGLAND",  datersnotified: "11/19/2015",  estimatedtimeofcompletion: "11/26/2015",  status1: "100% - Complete - Reserved for Driver", status2: "100% - Complete - Released to Customer", status3: "100% - Complete - Ready for P/U",  dateapproved: "11/1/2015"},
      { unitnumber: "1134",  customer: "WHITE ARROW", account: "Intermodal",  vehicletype: "Tractor/Condo", location: "GRANTVILLE CRENGLAND",  datersnotified: "11/19/2015",  estimatedtimeofcompletion: "11/25/2015",  status1: "100% - Complete - Reserved for Driver", status2: "100% - Complete - Ready for P/U", status3: "",  dateapproved: "11/19/2015"}
  ];

  for (var i = 0; i < trailerRay.length; i++)
  {
    var trailer = new Trailer(trailerRay[i]);
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
} // end if
});
 
app.get("/deletealltrailers", function(req, res) {

if(req.session.currentuser.customer == "ADMIN")
{
  Trailer.remove({}, function(err){
    if(err)
    {
      console.log("ERROR - getting deleting all Trailers.");
      res.writeHead(200);
      res.end("");
    } else
    {
      res.writeHead(200);
      res.end("");
    }
  });
} // end if
});
 
app.post("/barchartdata", function(req, res) {
  var wins2 = [
  // [0,13],[1,11],[2,15],[3,15],[4,18],[5,21],[6,28]
  ];
  var percents2 = [
      [0, "10% Done"],
      [1, "50%, 75%, 90% Done"],
      [2, "100% Done"]];

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

app.post("/piechartdata", function(req, res) {
  var piechartdata = [
/*      {data: [[0,14]], label: "10%"},
      {data: [[1,14]], label: "50%"},
      {data: [[2,14]], label: "75%"},
      {data: [[3,14]], label: "90%"},
      {data: [[4,38]], label: "100%"}
*/
  ];
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
      piechartdata.push({data: [[0,trailers10.length]], label: "10% Done"});

      Trailer.find({status1: new RegExp('^50%', "i")}, function( err, trailers50){
        console.log( "Number of 50% Trailers:", trailers50.length );
        piechartdata.push({data: [[1,trailers50.length]], label: "50%,75%,90% Done"});

        Trailer.find({status1: new RegExp('^75%', "i")}, function( err, trailers75){
          console.log( "Number of 75% Trailers:", trailers50.length );
          piechartdata[1].data[0][1] += trailers75.length

          Trailer.find({status1: new RegExp('^90%', "i")}, function( err, trailers90){
            console.log( "Number of 90% Trailers:", trailers90.length );
            piechartdata[1].data[0][1] += trailers90.length

            Trailer.find({status1: new RegExp('^100%', "i")}, function( err, trailers100){
              console.log( "Number of 100% Trailers:", trailers100.length );
              piechartdata.push({data: [[2,trailers100.length]], label: "100% Done"});

              res.setHeader('content-type', 'application/json');
              res.writeHead(200);
              res.end(JSON.stringify(piechartdata));


            });

          });
        });
      });

    });

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
            Trailer.findOneAndUpdate({_id: newTrailerObject._id}, newTrailerObject, {}, function(err, doc){
                if (err)
                {
                  console.log("ERROR - could not find and update the trailer with _id == "+newTrailerObject._id);
                } else
                {
                  console.log("found in updatetrailer - _id found == "+doc._id);
                }
                res.setHeader('content-type', 'application/json');
                res.writeHead(200);
                res.end("{}");
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
      });
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
              res.setHeader('content-type', 'application/json');
              res.writeHead(200);
              res.end("{}");
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
            }); // end Trailer.find
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