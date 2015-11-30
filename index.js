// ** MUST set this as a config variable on the heroku.com website **
var DISABLE_SSL = process.env.ENVIRONMENT == 'local_development';
var ENVIRONMENT = process.env.ENVIRONMENT;

var mongodbconnectionstring = "mongodb://localhost/test";

console.log("ENVIRONMENT == " + ENVIRONMENT);
console.log("DISABLE_SSL == " + DISABLE_SSL);


if (DISABLE_SSL && ENVIRONMENT == 'local_development') // on development
{
  console.log("!!!!!!!DISABLE_SSL was set - admin app won't be encrypted!!!!!!")
  console.log("setting connection to local mongodb!!!!!!!!!!!!");
  mongodbconnectionstring = "mongodb://localhost/test";
} else if (ENVIRONMENT == 'remote_developmeent') // on testing site
{
  mongodbconnectionstring = "mongodb://dbuser:ubuntu2rbnue3@ds047802.mongolab.com:47802/heroku_dswxx1s9";
} else if (ENVIRONMENT == 'production') {
  require('newrelic');
  mongodbconnectionstring = "mongodb://dbuser:ubuntu2rbnue3@ds027293-a0.mongolab.com:27293,ds027293-a1.mongolab.com:27293/heroku_qlr988hb?replicaSet=rs-ds027293";
} else {
  console.log("!!CONFIG ERROR - ENVIRONMENT system variable not found.  Can not set mongodb variable!!!!")
}

var express = require('express'),
  cookieParser = require('cookie-parser'),
  app = express(),

  http = require('http').Server(app),
  io = require('socket.io')(http),

  mkdirp = require('mkdirp'),

  excelbuilder = require('msexcel-builder'),

  path = require('path'),
  User = require('./user-model'),
  Token = require('./token-model'),
  Trailer = require('./trailer-model'),
  TrailerArchive = require('./trailer-archive-model'),
  File = require('./file-model'),
  FileArchive = require('./file-archive-model'),
  Config = require('./config-model'),

  LotWalkthroughInstance = require('./lot-walkthrough-instance-model'),
  LotWalkthroughTrailer = require('./lot-walkthrough-trailer-model'),

  nodemailer = require('nodemailer'),
  randtoken = require('rand-token'),
  fs = require('fs'),
  multer = require('multer'),
  upload = multer({
    dest: 'uploads/'
  }),
  mime = require('mime'),
  url = require('url'),
  session = require('express-session'),
  MongoStore = require('connect-mongo')(session);


var mongoose = require("mongoose");
//mongoose = Promise.promisifyAll(mongoose);

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
function saveUserToDatabase(u, req, res) {
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
function saveTokenToDatabase(u, req, res) {
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


app.get("/", function(req, res) {
  sendIfNoSSLRequired(path.join(__dirname, 'index.html'), req, res)
});


app.get("/uploaddocument", function(req, res) {
  sendIfNoSSLRequired(path.join(__dirname, 'index.html'), req, res)
});

app.get("/mockup", function(req, res) {
  res.sendFile(path.join(__dirname, 'mockup.html'))
});


// this next app.get will remove the whentobedeleted from trailers

// take out after done testing!



app.get("/get/:tokenpath/:filename", function(req, res) {
  var filename = req.params.filename;
  var tokenpath = req.params.tokenpath;

  var filenamewithpath = path.join(__dirname, 'documentsforreading', tokenpath, filename);

  res.sendFile(filenamewithpath);
});

app.post('/uploaddocument', upload.single('avatar'), function(req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  //console.log("req.body.name == "+req.body.name);

  if (req.session.currentuser.customer == "ADMIN") {


    console.log("req.file == " + req.file);

    for (var prop in req.file) {
      console.log("   " + prop + "  ==  " + req.file[prop]);
    }


    if (req.file['size'] <= 100000) {
      var filePath = path.join(__dirname, 'uploads', req.file.filename);

      fs.readFile(filePath, function(err, data) { // binary was utf-8
        if (!err) {



          var aFile = new File({
            name: req.file['originalname'],
            contents: data,
            mimetype: mime.lookup(req.file['originalname']),
            customer: req.body.customer,
            trailer_id: req.body._id
          });

          aFile.save(function(err) {
            if (err) {
              console.log('ERROR saving a file!!');

              res.setHeader('content-type', 'application/json');
              res.writeHead(200);
              res.end('{"error":"' + err + '"}');
            } else {
              console.log("File was saved successfully!");

              Trailer.find({
                _id: req.body._id
              }, function(err, docs) {
                var foundTrailer = docs[0];
                if (foundTrailer.numberofsupportingdocuments == undefined ||
                  foundTrailer.numberofsupportingdocuments == null) {
                  foundTrailer.numberofsupportingdocuments = 1;
                } else {
                  foundTrailer.numberofsupportingdocuments++;
                }

                Trailer.findOneAndUpdate({
                    _id: req.body._id
                  }, foundTrailer, {},
                  function(err, doc) {
                    res.redirect('#/viewdocumentupload/' + req.body._id + '/filesizeok');

                  }
                ); // end Trailer.findOneAndUpdate


              }); // end Trailer.find

            } // end else

          });





        } else {
          console.log(err);

          res.setHeader('content-type', 'application/json');
          res.writeHead(200);
          res.end('{"error":"' + err + '"}');
        }

      }); // end fs.readFile(...)





    } else { //if (req.file['size'] <= 64000)
      // Reject document - not small enough.
      res.redirect('#/viewdocumentupload/' + req.body._id + '/filetoobig');

    } // end else

  } // end if - check for ADMIN
});


app.get("/servertime", function(req, res) {
  var rightNow = new Date();
  var rightNowObject = {
    now: rightNow
  };

  res.setHeader('content-type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(rightNowObject));
});



function sendOutDailyEmails() {
  User.find({}, function(err, users) {
    if (err) {
      console.log("ERROR! - can not find any users!!!");
      res.setHeader('content-type', 'application/json');
      res.writeHead(200);
      res.end("[]");
    } else {
      var customerHashByCustomer = {};
      for (var i = 0; i < users.length; i++) {
        if (users[i].senddailyemail) {
          if (customerHashByCustomer[users[i].customer] == undefined) {
            customerHashByCustomer[users[i].customer] = [];
          }
          customerHashByCustomer[users[i].customer].push(users[i].username);
        }
      }

      for (var cust in customerHashByCustomer) {
        var andclause = {
          $and: [{
            customer: cust
          }, {
            status1: new RegExp('^100%', "i")
          }]
        }
        Trailer.find(andclause, function(err, trailers100) {
          var htmlTrailerTable = buildHTMLTrailerTable(trailers100);

          var cst = "";
          if(trailers100.length > 0)
          {
            cst = trailers100[0].customer;
          } else
          {
            // Don't send an email because there are no rows marked as 100;
            console.log('\n\nDo not send an email because there are no rows marked as 100.\n\n');
            return;
          }


          var usernames = customerHashByCustomer[cst];
          for (var j = 0; j < usernames.length; j++) {

console.log("\n\n\n------------Sending an Email!-------------");
console.log('email == '+usernames[j]);
console.log('customer == '+cst);
console.log("------------Sending an Email!------------- (end)\n\n\n");

            sendAnEmail(usernames[j], "Fleet Repair Solutions Daily 100% Complete Rows.",
              htmlTrailerTable);
          } // end for var j
        }); // end Trail.find
      } // end var cust

    } // end else
  }); // end user.find


} // end function sendOutDailyEmails()

// this snext route is called when an ADMIN logs in.
// it will send the daily 100% email if it is time
app.get("/senddailyemail", function(req, res) {
  if (req.session.currentuser.customer == "ADMIN") {
    // -1 finds the newest
    Config.findOne({}, {}, {
      sort: {
        'nextsenddailyemail': -1
      }
    }, function(err, cfg) {
      console.log("/senddailyemail called cfg == " + cfg);
      if (cfg == null) // no configuration row was found
      {
        var rightNow = new Date();
        var timeInMillisecondsToAdd = 1000 * 60 * 60 * 24; // every 24 hours

        var dateWithAddedOffset = new Date(rightNow.getTime() + timeInMillisecondsToAdd);

        var tempObj = {
          nextsenddailyemail: dateWithAddedOffset
        };

        var newConfig = new Config(tempObj);
        newConfig.save(function(err) {
          if (err) {
            throw err;
          } else {
            sendOutDailyEmails();
          }
        });
      } else { // cfg was found
        var rightNow = new Date();
        if (cfg.nextsenddailyemail.getTime() < rightNow.getTime()) {
          // add new config row and send emails
          var rightNow = new Date();
          var timeInMillisecondsToAdd = 1000 * 60 * 60 * 24; // every 24 hours

          var dateWithAddedOffset = new Date(rightNow.getTime() + timeInMillisecondsToAdd);

          var tempObj = {
            nextsenddailyemail: dateWithAddedOffset
          };

          var newConfig = new Config(tempObj);
          newConfig.save(function(err) {
            if (err) {
              throw err;
            } else {
              sendOutDailyEmails();
            }
          });
        }
      }
    });

    res.setHeader('content-type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify("{}"));


  }
});



app.get("/archive100", function(req, res) {


  if (req.session.currentuser.customer == "ADMIN") {


    Trailer.find({
      status1: new RegExp('^100%', "i")
    }, function(err, trailers100) {
      for (var i = 0; i < trailers100.length; i++) {
        var currTrailer = trailers100[i];

        var rightNow = new Date();
        if (currTrailer.whentobearchived != undefined && currTrailer.whentobearchived.getTime() < rightNow.getTime()) {
          console.log("------------- " + currTrailer.whentobearchived + " < " + rightNow);

          Trailer.findOneAndRemove({
            '_id': currTrailer._id
          }, function(err, trailer) {
            if (err) {
              return;
            }
            delete trailer._id;

            var trailerArchive = new TrailerArchive(trailer);

            trailerArchive.whenitwasarchived = trailer.whentobearchived;
            delete trailerArchive.whentobearchived;

            trailerArchive.save(function(err) {
              if (err) {
                console.log('ERROR saving trailer archive!!');
              } else {
                console.log("Trailer Archive saved successfully!");
                if (trailerArchive.numberofsupportingdocuments != undefined &&
                  trailerArchive.numberofsupportingdocuments != null &&
                  trailerArchive.numberofsupportingdocuments != 0) {
                  File.find({
                    trailer_id: trailerArchive._id
                  }, function(err, files) {
                    for (var i = 0; i < files.length; i++) {
                      files[i].remove();
                      delete files[i]._id;
                      files[i].trailer_id = trailerArchive._id;
                      var fileArchive = new FileArchive(files[i]);
                      fileArchive.save(function(err) {
                        if (err) {
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
  User.findOne({
    activationtoken: queryData.activationtoken
  }, function(err, user) {
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
  console.log("----------current user in session == " + JSON.stringify(req.session.currentuser));
  if (req.session.currentuser != undefined) {

    var prettyEnvironment = "WTF?";
    if (ENVIRONMENT == 'local_development') // on development
    {
      prettyEnvironment = "Local Development Environment";
    } else if (ENVIRONMENT == 'remote_developmeent') // on testing site
    {
      prettyEnvironment = "Remote Development Environment";
    } else if (ENVIRONMENT == 'production') {
      prettyEnvironment = "Production";
    } else {
      prettyEnvironment = "WTF?";
    }

    res.setHeader('content-type', 'application/json');
    res.writeHead(200);

    res.end('{"environment": "' + prettyEnvironment + '"}');
  }
});

app.post("/login", function(req, res) {
  req.session.currentuser = {};
  req.session.save();

  var str = "";
  for (var prop in req.headers) {
    str += prop + " ";
  }

  // *** note!!! *** headers always come through lowercase!!!!
  console.log("authorization == " + req.headers['authorization']); //Authorization
  if (req.method == 'POST') {
    console.log('1.  POST found');
    var jsonString = '';
    req.on('data', function(data) {
      jsonString += data;
    });
    req.on('end', function() {
      var loginInfoJson = JSON.parse(jsonString)
      console.log('2.  jsonString == ' + jsonString);
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
          
          if (user.numberofsuccessfullogins == undefined
            || user.numberofsuccessfullogins == null)
          {
            user.numberofsuccessfullogins = 1;
          } else
          {
            user.numberofsuccessfullogins += 1;
          }

          user.save(function(err) {
            if (err)
            { 
              throw err;
              console.log ("ERROR in user.save in /login!!");
              return;
            }
            
            res.end('{"email":"' + user.username.toLowerCase() + '","token":"' + token + '","expiresIn":' + expIn + ',"customer":"' + user.customer + '"}');
            req.session.currentuser = {};
            req.session.currentuser.username = user.username.toLowerCase();
            req.session.currentuser.customer = user.customer;
            req.session.save();
            console.log("req.session.currentuser.username == " + req.session.currentuser.username.toLowerCase());
            console.log('login success user looks like:  ' + '{"email":"' + user.username.toLowerCase() + '","token":"' + token + '","expiresIn":' + expIn + ',"customer":"' + user.customer + '"}');
            });
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
        console.log('5. could not log in reasonCouldNotLogIn == ' + reasonCouldNotLogIn);
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);

        res.end("{\"email\":\"" + reasonCouldNotLogIn + "\"}");
      }); // User.getAuthenticated
    });
  }

});

function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}

function sendIfNoSSLRequired(page_path, req, res) {
  if (!DISABLE_SSL) {
    // on heroku production deployment
    if (req.headers['x-forwarded-proto'] == "https") {
      console.log("ssl found - getting encrypted page");
      res.sendFile(page_path)
    } else {
      console.log("ssl not found - sending error message");
      //res.end("Sorry, this must be accessed over https.");
      res.writeHead(301, {
        "Location": "https://" + req.headers['host'] + req.url
      });
      res.end();
    }
  } else {
    // running locally
    console.log("ssl not needed - sending unencrypted admin page");
    res.sendFile(page_path)
  }
}


app.get("/newAdmin", function(req, res) {
  console.log('called /newAdmin!!!!!!!!!!');
  sendIfNoSSLRequired(__dirname + '/newAppManager.html', req, res)
});

app.get("/chat", function(req, res) {
  console.log('called /newAdmin!!!!!!!!!!');
  sendIfNoSSLRequired(__dirname + '/chat.html', req, res)
});


function createExceldocument(trailer_data, callbackfunction, removeDateRSNotified) {
  // Create a random string of nonsense so users can't overwrite their excel files
  var token = randtoken.generate(16);
  var excelFilename = 'sample' + token + '.xlsx';
  // Create a new workbook file in current working-path
  var workbook = excelbuilder.createWorkbook('./', excelFilename)

  // Create a new worksheet with 10 columns and 12 rows
  var sheet1 = workbook.createSheet('Exported Customer Portal Units', 50, trailer_data.length + 10);

  var columnTitles = [];

  columnTitles.push("Unit #");
  columnTitles.push("Customer");
  columnTitles.push("Account");
  columnTitles.push("Vehicle Type");
  columnTitles.push("Location");

  if (!removeDateRSNotified) {
    columnTitles.push("Date FRS Notified");
  }

  columnTitles.push("Date Approved");
  columnTitles.push("Estimated Time of Completion");
  columnTitles.push("Status");

  for (var i = 0; i < columnTitles.length; i++) {
    sheet1.set(i + 1, 1, columnTitles[i]);
  }

  for (var j = 0; j < trailer_data.length; j++) {
    var currentTrailer = trailer_data[j];

    var widthOfEachColumn = 30;

    var columnNumber = 1;
    sheet1.width(columnNumber, widthOfEachColumn);
    sheet1.set(columnNumber, j + 3, currentTrailer.unitnumber);
    columnNumber++;

    sheet1.width(columnNumber, widthOfEachColumn);
    sheet1.set(columnNumber, j + 3, currentTrailer.customer);
    columnNumber++;

    sheet1.width(columnNumber, widthOfEachColumn);
    sheet1.set(columnNumber, j + 3, currentTrailer.account);
    columnNumber++;

    sheet1.width(columnNumber, widthOfEachColumn);
    sheet1.set(columnNumber, j + 3, currentTrailer.vehicletype);
    columnNumber++;

    sheet1.width(columnNumber, widthOfEachColumn);
    sheet1.set(columnNumber, j + 3, currentTrailer.location);
    columnNumber++;

    if (!removeDateRSNotified) {
      sheet1.width(columnNumber, widthOfEachColumn);
      sheet1.set(columnNumber, j + 3, currentTrailer.datersnotified);
      columnNumber++;
    }

    sheet1.width(columnNumber, widthOfEachColumn);
    sheet1.set(columnNumber, j + 3, currentTrailer.dateapproved);
    columnNumber++;

    sheet1.width(columnNumber, widthOfEachColumn);
    sheet1.set(columnNumber, j + 3, currentTrailer.estimatedtimeofcompletion);
    columnNumber++;

    sheet1.width(columnNumber, widthOfEachColumn);
    sheet1.set(columnNumber, j + 3, currentTrailer.status1);
    columnNumber++;

    sheet1.width(columnNumber, widthOfEachColumn);
    sheet1.set(columnNumber, j + 3, currentTrailer.status2);
    columnNumber++;

    sheet1.width(columnNumber, widthOfEachColumn);
    sheet1.set(columnNumber, j + 3, currentTrailer.status3);
    columnNumber++;

  }

  // Fill some data

  // Save it
  workbook.save(function(ok) {
    console.log('------------congratulations, your workbook created');
    callbackfunction(excelFilename);


  });

} // end createExceldocument



app.get("/FleetRepairSolutionsPortalData.xlsx", function(req, res) {


  var trailerRay = [];
  console.log("------------------ req.query.searchTerm == " + req.query.searchTerm);
  //console.log("\n\n/trailers req.session == "+JSON.stringify(req.session))
  if (req.session.currentuser.customer == "ADMIN") {
    var searchStringArray = req.query.searchTerm.split(" ");

    var orclausearray = [];
    for (var i = 0; i < searchStringArray.length; i++) {
      orclausearray.push({
        unitnumber: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        customer: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        account: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        vehicletype: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        location: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        datersnotified: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        dateapproved: new RegExp(req.query.searchTerm)
      })
      orclausearray.push({
        estimatedtimeofcompletion: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        status1: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        status2: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        status3: new RegExp(searchStringArray[i])
      })
    }
    var orclause = {
        $or: orclausearray
      }
      // var orclause =  {$or: [{status1: new RegExp('^10%', "i")}]}

    console.log('               found ADMIN');
    Trailer.find(orclause, function(err, docs) {
      if (err) {
        console.log("ERROR - getting all Trailers.");
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(trailerRay));
      } else {
        trailerRay = docs;
        console.log('            got all Trailer documents length = ' + trailerRay.length);
        // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
        var removeDateRSNotified = false;
        createExceldocument(trailerRay, function(excelFilename) {
          console.log("           in createExelDocument callback -----sending xsl file");
          //res.end(JSON.stringify(trailerRay));
          console.log('!!!!!!!!!!!! path ==' + path.join(__dirname, '/' + excelFilename));
          sendIfNoSSLRequired(path.join(__dirname, '/' + excelFilename), req, res)
        }, removeDateRSNotified);

      }
    });
  } else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined) {
    var searchStringArray = req.query.searchTerm.split(" ");

    var orclausearray = [];
    for (var i = 0; i < searchStringArray.length; i++) {
      orclausearray.push({
        unitnumber: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        customer: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        account: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        vehicletype: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
          location: new RegExp(searchStringArray[i])
        })
        // orclausearray.push({datersnotified: new RegExp(searchStringArray[i])})
      orclausearray.push({
        dateapproved: new RegExp(req.query.searchTerm)
      })
      orclausearray.push({
        estimatedtimeofcompletion: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        status1: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        status2: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        status3: new RegExp(searchStringArray[i])
      })
    }

    var orclause = {
      $or: orclausearray
    }

    var andclause = {
      $and: [orclause, {
        customer: req.session.currentuser.customer
      }]
    }

    Trailer.find(andclause, function(err, docs) {
      if (err) {
        console.log("ERROR - getting all Trailers.");
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(trailerRay));
      } else {
        trailerRay = docs;
        // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
        var removeDateRSNotified = true;
        createExceldocument(trailerRay, function(excelFilename) {
          console.log("           in createExelDocument callback -----sending xsl file");
          //res.end(JSON.stringify(trailerRay));
          console.log('!!!!!!!!!!!! path ==' + path.join(__dirname, '/' + excelFilename));
          sendIfNoSSLRequired(path.join(__dirname, '/' + excelFilename), req, res)
        }, removeDateRSNotified);
      }
    });
  } // END IF









});

app.get("/trailers", function(req, res) {
  var trailerRay = [];

  console.log("\n\n/trailers req.session == " + JSON.stringify(req.session))
  if (req.session.currentuser.customer == "ADMIN") {
    Trailer.find({}, function(err, docs) {
      if (err) {
        console.log("ERROR - getting all Trailers.");
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(trailerRay));
      } else {
        trailerRay = docs;
        // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(trailerRay));
      }
    });
  } else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined) {
    Trailer.find({
      customer: req.session.currentuser.customer
    }, function(err, docs) {
      if (err) {
        console.log("ERROR - getting all Trailers.");
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(trailerRay));
      } else {
        trailerRay = docs;
        // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(trailerRay));
      }
    });
  } // END IF

});


app.get("/getlotwalkthroughinstances", function(req, res) {
  var trailerRay = [];

  console.log("\n\n/trailers req.session == " + JSON.stringify(req.session))
  if (req.session.currentuser.customer == "ADMIN") {
    LotWalkthroughInstance.find({}, null, {
      sort: {
        dateoflotwalkthrough: -1
      }
    }, function(err, docs) {
      if (err) {
        console.log("ERROR - getting all LotWalkthroughInstance.");
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(trailerRay));
      } else {
        trailerRay = docs;
        // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(trailerRay));
      }
    });
  } else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined) {
    LotWalkthroughInstance.find({}, null, {
      sort: {
        dateoflotwalkthrough: -1
      }
    }, function(err, docs) {
      if (err) {
        console.log("ERROR - getting all LotWalkthroughInstance.");
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(trailerRay));
      } else {
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
  var onLotStatuses = ["10%  A/W AUTHORIZATION",
    "10%  A/W PARTS",
    "10%  A/W ESTIMATE",
    "10%  A/W ARRIVAL OF UNIT",
    "25%  A/W REPAIRS",
    "50%  WORK IN PROGRESS",
    "75%  WORK IN PROGRESS",
    "90%  A/W FINAL QUALITY CHECK",
    "100% COMPLETE:  IN TRANSIT TO CUSTOMER",
    "100% COMPLETE:  READY FOR P/U",
    "100% COMPLETE:  RESERVED"
  ];


  var trailerRay = [];
  console.log("------------------ req.query.searchTerm == " + req.query.searchTerm);
  //console.log("\n\n/trailers req.session == "+JSON.stringify(req.session))
  if (req.session.currentuser.customer == "ADMIN") {
    var searchStringArray = req.query.searchTerm.split(" ");

    var orclausearray = [];
    for (var i = 0; i < searchStringArray.length; i++) {
      orclausearray.push({
        unitnumber: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        customer: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        account: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        vehicletype: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        location: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        datersnotified: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        dateapproved: new RegExp(req.query.searchTerm)
      })
      orclausearray.push({
        estimatedtimeofcompletion: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        status1: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        status2: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        status3: new RegExp(searchStringArray[i])
      })
    }
    var orclause = {
      $or: orclausearray
    }

    var orclausearray2 = [];
    for (var i = 0; i < onLotStatuses.length; i++) {
      orclausearray2.push({
        status1: new RegExp(onLotStatuses[i])
      })
    }
    orclausearray2.push({
      status1: undefined
    })
    orclausearray2.push({
      status1: ""
    })
    orclausearray2.push({
      status1: null
    })

    var orclause2 = {
      $or: orclausearray2
    }

    var andclause = {
        $and: [orclause, orclause2, {
          location: "FRS - (GRANTVILLE PA)"
        }]
      }
      // var orclause =  {$or: [{status1: new RegExp('^10%', "i")}]}

    console.log('               found ADMIN');
    Trailer.find(andclause, function(err, docs) {
      if (err) {
        console.log("ERROR - getting all Trailers.");
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(trailerRay));
      } else {
        trailerRay = docs;
        console.log('            got all Trailer documents length = ' + trailerRay.length);
        // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
        createExceldocument(trailerRay, function(excelFilename) {
          console.log("           in createExelDocument callback -----sending xsl file");
          //res.end(JSON.stringify(trailerRay));
          console.log('!!!!!!!!!!!! path ==' + path.join(__dirname, '/' + excelFilename));
          sendIfNoSSLRequired(path.join(__dirname, '/' + excelFilename), req, res)
        }, false); // false keeps RS Notified

      }
    });
  } else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined) {
    var searchStringArray = req.query.searchTerm.split(" ");

    var orclausearray = [];
    for (var i = 0; i < searchStringArray.length; i++) {
      orclausearray.push({
        unitnumber: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        customer: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        account: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        vehicletype: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
          location: new RegExp(searchStringArray[i])
        })
        // orclausearray.push({datersnotified: new RegExp(searchStringArray[i])})
      orclausearray.push({
        dateapproved: new RegExp(req.query.searchTerm)
      })
      orclausearray.push({
        estimatedtimeofcompletion: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        status1: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        status2: new RegExp(searchStringArray[i])
      })
      orclausearray.push({
        status3: new RegExp(searchStringArray[i])
      })
    }

    var orclause = {
      $or: orclausearray
    }


    var orclausearray2 = [];
    for (var i = 0; i < onLotStatuses.length; i++) {
      orclausearray2.push({
        status1: new RegExp(onLotStatuses[i])
      })
    }
    orclausearray2.push({
      status1: undefined
    })
    orclausearray2.push({
      status1: ""
    })
    orclausearray2.push({
      status1: null
    })

    var orclause2 = {
      $or: orclausearray2
    }

    var andclause = {
      $and: [orclause, orclause2, {
        location: "FRS - (GRANTVILLE PA)"
      }, {
        customer: req.session.currentuser.customer
      }]
    }


    Trailer.find(andclause, function(err, docs) {
      if (err) {
        console.log("ERROR - getting all Trailers.");
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(trailerRay));
      } else {
        trailerRay = docs;
        // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
        createExceldocument(trailerRay, function(excelFilename) {
          console.log("           in createExelDocument callback -----sending xsl file");
          //res.end(JSON.stringify(trailerRay));
          console.log('!!!!!!!!!!!! path ==' + path.join(__dirname, '/' + excelFilename));
          sendIfNoSSLRequired(path.join(__dirname, '/' + excelFilename), req, res)
        }, true); // true removed Date FRS Notified
      }
    });
  } // END IF









});






app.get("/trailersonlot", function(req, res) {

  // These are the statuses of the trailers on the lot.
  var onLotStatuses = ["10%  A/W AUTHORIZATION",
    "10%  A/W PARTS",
    "10%  A/W ESTIMATE",
    "10%  A/W ARRIVAL OF UNIT",
    "25%  A/W REPAIRS",
    "50%  WORK IN PROGRESS",
    "75%  WORK IN PROGRESS",
    "90%  A/W FINAL QUALITY CHECK",
    "100% COMPLETE:  IN TRANSIT TO CUSTOMER",
    "100% COMPLETE:  READY FOR P/U",
    "100% COMPLETE:  RESERVED"
  ]



  var trailerRay = [];
  console.log("-----------executing /trailersonlot");

  console.log("\n\n/trailers req.session == " + JSON.stringify(req.session))
  if (req.session.currentuser.customer == "ADMIN") {


    var orclausearray = [];
    for (var i = 0; i < onLotStatuses.length; i++) {
      orclausearray.push({
        status1: new RegExp(onLotStatuses[i])
      })
    }
    orclausearray.push({
      status1: undefined
    })
    orclausearray.push({
      status1: ""
    })
    orclausearray.push({
      status1: null
    })

    var orclause = {
      $or: orclausearray
    }

    var andclause = {
      $and: [orclause, {
        location: "FRS - (GRANTVILLE PA)"
      }]
    }


    Trailer.find(andclause, function(err, docs) {
      if (err) {
        console.log("ERROR - getting all Trailers.");
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(trailerRay));
      } else {
        trailerRay = docs;
        // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(trailerRay));
      }
    });
  } else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined) {

    var orclausearray = [];
    for (var i = 0; i < onLotStatuses.length; i++) {
      orclausearray.push({
        status1: new RegExp(onLotStatuses[i])
      })
    }
    orclausearray.push({
      status1: undefined
    })
    orclausearray.push({
      status1: ""
    })
    orclausearray.push({
      status1: null
    })

    var orclause = {
      $or: orclausearray
    }

    var andclause = {
      $and: [orclause, {
        customer: req.session.currentuser.customer
      }, {
        location: "FRS - (GRANTVILLE PA)"
      }]
    }

    Trailer.find(andclause, function(err, docs) {
      if (err) {
        console.log("ERROR - getting all Trailers.");
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(trailerRay));
      } else {
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

  console.log("\n\n/trailers req.session == " + JSON.stringify(req.session))
  if (req.session.currentuser.customer == "ADMIN") {
    TrailerArchive.find({}, function(err, docs) {
      if (err) {
        console.log("ERROR - getting all Trailers.");
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(trailerRay));
      } else {
        trailerRay = docs;
        // console.log("/trailers - trailerRay == "+JSON.stringify(trailerRay));
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(trailerRay));
      }
    });
  } else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined) {
    TrailerArchive.find({
      customer: req.session.currentuser.customer
    }, function(err, docs) {
      if (err) {
        console.log("ERROR - getting all Trailers.");
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(trailerRay));
      } else {
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
    [2, "100% Complete"]
  ];

  var barchartdata = {
    "wins": wins2,
    "percents": percents2
  };


  var tempChartData = [];
  Trailer.find({
    status1: new RegExp('^10%', "i")
  }, function(err, trailers10) {
    console.log("Number of 10% Trailers:", trailers10.length);
    wins2.push([0, trailers10.length]);

    Trailer.find({
      status1: new RegExp('^50%', "i")
    }, function(err, trailers50) {
      console.log("Number of 50% Trailers:", trailers50.length);
      wins2.push([1, trailers50.length]);

      Trailer.find({
        status1: new RegExp('^75%', "i")
      }, function(err, trailers75) {
        console.log("Number of 75% Trailers:", trailers50.length);
        wins2[1][1] += trailers75.length

        Trailer.find({
          status1: new RegExp('^90%', "i")
        }, function(err, trailers90) {
          console.log("Number of 90% Trailers:", trailers90.length);
          wins2[1][1] += trailers90.length

          Trailer.find({
            status1: new RegExp('^100%', "i")
          }, function(err, trailers100) {
            console.log("Number of 100% Trailers:", trailers100.length);
            wins2.push([2, trailers100.length]);

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
  res.end(JSON.stringify({
    customer: req.session.currentuser.customer
  }));
});

app.post("/piechartdata", function(req, res) {
  var piechartdata = [

  ];

  if (req.session.currentuser.customer == "ADMIN") {


    var tempChartData = [];
    Trailer.count({
      status1: new RegExp('^10%', "i")
    }, function(err, count10) {
      console.log("Number of 10% Trailers:", count10);
      piechartdata.push({
        data: [
          [0, count10]
        ],
        label: "10% Compelete",
        color: "#ff3f0b"
      });

      var or25_50_75_90 = { $or: [
                                  {status1: new RegExp('^50%', "i")},
                                  {status1: new RegExp('^25%', "i")},
                                  {status1: new RegExp('^75%', "i")},
                                  {status1: new RegExp('^90%', "i")}
                                 ]};

      Trailer.count(or25_50_75_90, function(err, count25_50_75_90) {
        console.log("Number of count25_50_75_90 Trailers:", count25_50_75_90);
        piechartdata.push({
          data: [
            [1, count25_50_75_90]
          ],
          label: "25%, 50%,75%,90% Complete",
          color: "#fffc0b"
        });
        Trailer.count({
          status1: new RegExp('^100%', "i")
        }, function(err, count100) {
          console.log("Number of 100% Trailers:", count100);
          piechartdata.push({
            data: [
              [2, count100]
            ],
            label: "100% Complete",
            color: "#00b800"
          });

          res.setHeader('content-type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify(piechartdata));


        }); // end 100%
      }); // end or25_50_75_90
    }); // end 10%
  } else {
    var tempChartData = [];
    var andclause = {
        $and: [{
          status1: new RegExp('^10%', "i")
        }, {
          customer: req.session.currentuser.customer
        }]
      }
      // {status1: new RegExp('^10%', "i")}
    Trailer.count(andclause, function(err, count10) {
      console.log("Number of 10% Trailers:", count10);
      piechartdata.push({
        data: [
          [0, count10]
        ],
        label: "10% Compelete",
        color: "#ff3f0b"
      });

      var or25_50_75_90 = { $or: [
                          {status1: new RegExp('^50%', "i")},
                          {status1: new RegExp('^25%', "i")},
                          {status1: new RegExp('^75%', "i")},
                          {status1: new RegExp('^90%', "i")}
                         ]};

      andclause = {
        $and: [or25_50_75_90, 
        {
          customer: req.session.currentuser.customer
        }]
      }
      Trailer.count(andclause, function(err, count25_50_75_90) {
        console.log("Number of 25_50_75_90 Trailers:", count25_50_75_90);
        piechartdata.push({
          data: [
            [1, count25_50_75_90]
          ],
          label: "25%,50%,75%,90% Complete",
          color: "#fffc0b"
        });

        andclause = {
          $and: [{
            status1: new RegExp('^100%', "i")
          }, {
            customer: req.session.currentuser.customer
          }]
        }
        Trailer.count(andclause, function(err, count100) {
          console.log("Number of 100% Trailers:", count100);
          piechartdata.push({
            data: [
              [2, count100]
            ],
            label: "100% Complete",
            color: "#00b800"
          });

          res.setHeader('content-type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify(piechartdata));


        }); // end 100%


      }); // end count_25_50_75_90

    }); // end 10%
  } // end else clause
});

app.post("/savenewaccount", function(req, res) {
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        saveUserToDatabase(JSON.parse(jsonString), req, res);
      });
    }

    res.setHeader('content-type', 'application/json');
    res.writeHead(200);
    res.end("{}");
  } //end if
});

app.post("/setsendemailoncompleted", function(req, res) {
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        console.log("/setsendemailoncompleted - jsonString == " + jsonString);
        //saveUserToDatabase(JSON.parse(jsonString),req, res);
        var userInfoJson = JSON.parse(jsonString)


        User.find({
          _id: userInfoJson._id
        }, function(err, docs) {
          var foundUser = docs[0];
          foundUser.sendemailoncompleted = userInfoJson.sendemailoncompleted;

          User.findOneAndUpdate({
              _id: foundUser._id
            }, foundUser, {},
            function(err, doc) {
              console.log("!!!!!!!!!!!!!!!!!!!!!!!! found and updated User /setsendemailoncompleted");
              res.setHeader('content-type', 'application/json');
              res.writeHead(200);
              res.end('{"sendemailoncompleted":"set successfully"}');
            }
          ); // end Trailer.findOneAndUpdate


        }); // end User.find




      }); // end req.on("end"...)
    }

  } //end if
});

app.post("/senddailyemail", function(req, res) {
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        console.log("/senddailyemail - jsonString == " + jsonString);
        //saveUserToDatabase(JSON.parse(jsonString),req, res);

        var userInfoJson = JSON.parse(jsonString)


        User.find({
          _id: userInfoJson._id
        }, function(err, docs) {
          var foundUser = docs[0];
          foundUser.senddailyemail = userInfoJson.senddailyemail;

          User.findOneAndUpdate({
              _id: foundUser._id
            }, foundUser, {},
            function(err, doc) {
              console.log("!!!!!!!!!!!!!!!!!!!!!!!! found and updated User /senddailyemail");
              res.setHeader('content-type', 'application/json');
              res.writeHead(200);
              res.end('{"senddailyemail":"set successfully"}');
            }
          ); // end Trailer.findOneAndUpdate


        }); // end Trailer.find






      });
    }

  } //end if
});


// for administrators to change the password of a user
app.post("/resetuserspassword", function(req, res) {
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var userdata = JSON.parse(jsonString);
        console.log("/resetuserspassword - jsonString == " + jsonString);


        User.findOne({
          username: userdata.email
        }, function(err, user) {
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
  console.log("\n\n/doletuserresetpassword---------------customer == " + req.session.currentuser.customer + "\n\n");

  if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined) {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var userdata = JSON.parse(jsonString);




        User.getAuthenticated(req.session.currentuser.username.toLowerCase(), userdata.currentpassword, function(err, user, reason) {



          if (err) throw err;
          console.log('3.  found a user');
          // login was successful if we have a user
          if (user && user.activated) {
            console.log('4.  user is valid and activated');
            // handle login success


            User.findOne({
              username: req.session.currentuser.username
            }, function(err, user) {
              if (err) {
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
          console.log('5. could not log in reasonCouldNotLogIn == ' + reasonCouldNotLogIn);
          res.setHeader('content-type', 'application/json');
          res.writeHead(200);

          res.end("{\"status\":\"" + reasonCouldNotLogIn + "\"}");

        }); // User.getAuthenticated

      });
    }
  } // end if
});

app.post("/savetrailer", function(req, res) {
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var newTrailerObject = JSON.parse(jsonString);

        var statusesToSetToUndefined = ["100% COMPLETE:  IN TRANSIT TO CUSTOMER",
          "100% COMPLETE:  READY FOR P/U",
          "100% COMPLETE:  RESERVED"
        ];

        var markForArchival = true;
        for (var j = 0; j < statusesToSetToUndefined.length; j++) {
          if (statusesToSetToUndefined[j] == newTrailerObject.status1) {
            markForArchival = false;
            break;
          }
        }

        if (markForArchival && newTrailerObject.status1.indexOf("100%") > -1) {
          var currentDateInMillisectonds = new Date().getTime()
          var timeInMillisecondsToAdd = 1000 * 60 * 60 * 24 * 5; // 5 days

          var dateWithAddedOffset = new Date(currentDateInMillisectonds + timeInMillisecondsToAdd);

          newTrailerObject.whentobearchived = dateWithAddedOffset;
        } else {
          newTrailerObject.whentobearchived = undefined;
        }

        var trailer = new Trailer(newTrailerObject);


        trailer.save(function(err) {
          if (err) {
            console.log('ERROR saving trailer!!');
          } else {
            console.log("Trailer saved successfully!");
          }
          // send email if marked as 100%\
          if (newTrailerObject.status1.indexOf("100%") > -1) {
            sendOneTrailerEmailWhenComplete(newTrailerObject)
          }


        });
      });
    }

    res.setHeader('content-type', 'application/json');
    res.writeHead(200);
    res.end("{}");
  } //end if
});

app.post("/savelotwalkthrough", function(req, res) {
  console.log("starting /savelotwalkthrough------------------------------------------");
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var object = {
          "dateoflotwalkthrough": new Date()
        };

        LotWalkthroughInstance.create(object, function(err, lotwalkthroughinstance) {
          if (err) {
            console.log('ERROR saving lotwalkthroughinstance!!');
          } else {
            console.log("LotWalkthroughTrailerInstance saved successfully!");

            console.log("-----------------start-------------------");
            // console.log("newTrailerWalkthroughTrailers string == "+jsonString);
            console.log("-----------------start-------------------");

            var newLotWalkthroughTrailers = JSON.parse(jsonString);
            var count = 0;
            for (var i = 0; i < newLotWalkthroughTrailers.length; i++) {
              delete newLotWalkthroughTrailers[i]._id;
              newLotWalkthroughTrailers[i].lot_walkthrough_trailer_id = lotwalkthroughinstance._id;

              var newlotwalkthroughtrailer = new LotWalkthroughTrailer(newLotWalkthroughTrailers[i]);
              newlotwalkthroughtrailer.save(function(err) {
                if (err) {
                  console.log('error in /savelotwalkthrough');
                } else {
                  count++;
                  if (count == newLotWalkthroughTrailers.length) {
                    res.setHeader('content-type', 'application/json');
                    res.writeHead(200);
                    res.end("{}");
                  }

                  console.log('saved newlotwalkthroughtrailer successfully.');
                }
              });
            } // end for

          } // end else


        }); // lotwalkthroughinstance.save

      }); // req.on('end'
    } // end if (req.method == 'POST')

  } //end if
  console.log("ending /savelotwalkthrough------------------------------------------");

});


app.post("/updatetrailer", function(req, res) {
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var newTrailerObject = JSON.parse(jsonString);
        console.log("/updatetrailer - jsonString == " + jsonString);


        var statusesToSetToUndefined = ["100% COMPLETE:  IN TRANSIT TO CUSTOMER",
          "100% COMPLETE:  READY FOR P/U",
          "100% COMPLETE:  RESERVED"
        ];

        var markForArchival = true;
        for (var j = 0; j < statusesToSetToUndefined.length; j++) {
          if (statusesToSetToUndefined[j] == newTrailerObject.status1) {
            markForArchival = false;
            break;
          }
        }

        if (markForArchival && newTrailerObject.status1.indexOf("100%") > -1) {
          var currentDateInMillisectonds = new Date().getTime()
          var timeInMillisecondsToAdd = 1000 * 60 * 60 * 24 * 5; // 5 days

          var dateWithAddedOffset = new Date(currentDateInMillisectonds + timeInMillisecondsToAdd);

          newTrailerObject.whentobearchived = dateWithAddedOffset;
        } else {
          newTrailerObject.whentobearchived = undefined;
        }
        console.log("\n\n----------------- 1");
        Trailer.findOneAndUpdate({
          _id: newTrailerObject._id
        }, newTrailerObject, {}, function(err, doc) {
          if (err) {
            console.log("ERROR - could not find and update the trailer with _id == " + newTrailerObject._id);
          } else {
            console.log("found in updatetrailer - _id found == " + doc._id);
          }
          console.log("----------------- 2");
          // send email if marked as 100%\
          if (newTrailerObject.status1.indexOf("100%") > -1) {
            sendOneTrailerEmailWhenComplete(newTrailerObject)
          }




          File.find({
            trailer_id: doc._id
          }, function(err, docs) {
            if (err) throw err;

            if (docs.length == 0) {
              res.setHeader('content-type', 'application/json');
              res.writeHead(200);
              res.end("{}");
            }
            console.log("numer of files found == " + docs.length);
            var count = 0;
            for (var i = 0; i < docs.length; i++) {
              var foundFile = docs[i];

              foundFile.customer = newTrailerObject.customer;
              console.log("----------------- 3 foundFile.name == " + foundFile.name);
              foundFile.save(function(err) {
                console.log(" err == " + err);
                if (err) throw err;
                count++;
                console.log("     count == " + count);
                if (count == docs.length) {
                  console.log("sending back content!!!!!!!!!!!!!!!!!!!!!");
                  res.setHeader('content-type', 'application/json');
                  res.writeHead(200);
                  res.end("{}");
                } // end if
              });


            } // end for

          }); // end Trailer.find


        });
        console.log("----------------- 5");

      });

      console.log("----------------- 6   Write empty json response.");


    }
  } // end if
});


app.post("/updateonlottrailers", function(req, res) {
  console.log('------------starting /updateonlottrailers');
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {



        console.log("/updateonlottrailers - jsonString == " + jsonString);
        var newTrailerObjectsArray = JSON.parse(jsonString);
        var countOfTrailerObjects = newTrailerObjectsArray.length;
        var counterOfTrailerObjects = 0;

        console.log('     number of trailer objects to update == ' + countOfTrailerObjects);

        var counterOfFilesRay = [];
        var processedAllFiles = [];
        for (var c = 0; c < countOfTrailerObjects.length; c++) {
          counterOfFilesRay[c] = 0;
          processedAllFiles[c] = false;
        }

        for (var k = 0; k < newTrailerObjectsArray.length; k++) {
          var newTrailerObject = newTrailerObjectsArray[k];

          var statusesToSetToUndefined = ["100% COMPLETE:  IN TRANSIT TO CUSTOMER",
            "100% COMPLETE:  READY FOR P/U",
            "100% COMPLETE:  RESERVED"
          ];

          var markForArchival = true;
          for (var j = 0; j < statusesToSetToUndefined.length; j++) {
            if (statusesToSetToUndefined[j] == newTrailerObjectsArray[k].status1) {
              markForArchival = false;
              break;
            }
          }

          if (markForArchival && newTrailerObjectsArray[k].status1.indexOf("100%") > -1) {
            var currentDateInMillisectonds = new Date().getTime()
            var timeInMillisecondsToAdd = 1000 * 60 * 60 * 24 * 5; // 5 days

            var dateWithAddedOffset = new Date(currentDateInMillisectonds + timeInMillisecondsToAdd);

            newTrailerObjectsArray[k].whentobearchived = dateWithAddedOffset;
          } else {
            newTrailerObjectsArray[k].whentobearchived = undefined;
          }
          var trailerid = newTrailerObjectsArray[k]._id;
          delete newTrailerObjectsArray[k]._id;
          console.log("trailerid == " + trailerid);
          var query = {
            _id: trailerid
          };
          if (query._id.indexOf('newrecordid') > -1) {
            query._id = new mongoose.mongo.ObjectID();
            console.log("found correct trailerid - setting _id == " + query._id);
          }

          console.log("----------------------customer before update findOne - custuer == " + newTrailerObjectsArray[k].customer);
          Trailer.findOneAndUpdate(query, newTrailerObjectsArray[k], {
            'new': true,
            'upsert': true
          }, function(err, doc) {
            if (err) {
              console.log("ERROR - could not find and update the trailer with _id == " + newTrailerObject._id);
              console.log("     ERROR was == " + err);
            } else {
              console.log('     found a unit with unitnumber == ' + doc.unitnumber);

            }


            // send email if marked as 100%\
            if (doc.status1.indexOf("100%") > -1) {
              console.log('     found 100% status so sending email-----------------------------');
              sendOneTrailerEmailWhenComplete(doc)
            }


            var currentTrailer = doc;
            console.log("\n\n-------------------------");
            console.log("         doc.customer == " + doc.customer);
            console.log("-------------------------\n\n");
            var query = {
              "trailer_id": doc._id
            };
            File.update(query, {
                $set: {
                  "customer": doc.customer
                }
              }, {
                multi: true
              },
              function callback(err, numAffected) {
                // numAffected is the number of updated documents
                counterOfTrailerObjects++;

                console.log("documents count so far == " + counterOfTrailerObjects + "         numAffected.nModified == " + numAffected.nModified + "    doc.customer == " + doc.customer);

                if (countOfTrailerObjects == counterOfTrailerObjects) {
                  console.log("   SENDING RESPONSE - UPDATED ALL DOCUMENTS")
                  res.setHeader('content-type', 'application/json');
                  res.writeHead(200);
                  res.end("{}");
                }
              });

          });


        } // end for k

      });

    }
  } // end if
  console.log('------------ending /updateonlottrailers');
});




app.get("/getusers", function(req, res) {
  if (req.session.currentuser.customer == "ADMIN") {
    User.find({}, function(err, obj) {
      if (err) {
        console.log("ERROR! - can not find any users!!!");
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end("[]");
      } else {
        var usersWithJustEmailAndCustomer = [];
        for (var i = 0; i < obj.length; i++) {
          usersWithJustEmailAndCustomer.push({
            email: obj[i].username,
            customer: obj[i].customer
          })
        }

        console.log("found these users == " + JSON.stringify(usersWithJustEmailAndCustomer));
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(usersWithJustEmailAndCustomer));
      }
    });
  } // end if
});

app.get("/users", function(req, res) {
  if (req.session.currentuser.customer == "ADMIN") {
    User.find({}, function(err, obj) {
      if (err) {
        console.log("ERROR! - can not find any users!!!");
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end("[]");
      } else {
        var usersWithJustEmailAndCustomer = [];
        for (var i = 0; i < obj.length; i++) {
          usersWithJustEmailAndCustomer.push({
            _id: obj[i]._id,
            username: obj[i].username,
            customer: obj[i].customer,
            sendemailoncompleted: obj[i].sendemailoncompleted,
            senddailyemail: obj[i].senddailyemail,
            numberofsuccessfullogins: obj[i].numberofsuccessfullogins
          })
        }

        console.log("found these users == " + JSON.stringify(usersWithJustEmailAndCustomer));
        res.setHeader('content-type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(usersWithJustEmailAndCustomer));
      }
    });
  } // end if
});

app.post("/gettrailer", function(req, res) {
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var _idObj = JSON.parse(jsonString);
        Trailer.find({
          _id: _idObj._id
        }, function(err, obj) {
          if (err) {
            console.log("ERROR! - can not find trailer record with _id == " + _id);
          } else {
            console.log("called gettrailer obj == " + JSON.stringify(obj[0]));
            res.setHeader('content-type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(obj[0]));
          }
        });
      });
    }
  } else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined) {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var _idObj = JSON.parse(jsonString);
        Trailer.find({
          _id: _idObj._id,
          customer: req.session.currentuser.customer
        }, function(err, obj) {
          if (err) {
            console.log("ERROR! - can not find trailer record with _id == " + _id);
          } else {
            console.log("called gettrailer obj == " + JSON.stringify(obj[0]));
            res.setHeader('content-type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(obj[0]));
          }
        });
      });
    }
  } // end else if
});

app.post("/getdailywalkthroughtrailers", function(req, res) {
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var _idObj = JSON.parse(jsonString);
        LotWalkthroughTrailer.find({
          lot_walkthrough_trailer_id: _idObj._id
        }, function(err, obj) {
          if (err) {
            console.log("ERROR! - can not find LotWalkthroughTrailer records with _id == " + _id);
          } else {
            console.log("called LotWalkthroughTrailer obj == " + JSON.stringify(obj[0]));
            res.setHeader('content-type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(obj));
          }
        });
      });
    }
  } else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined) {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var _idObj = JSON.parse(jsonString);
        LotWalkthroughTrailer.find({
          lot_walkthrough_trailer_id: _idObj._id,
          customer: req.session.currentuser.customer
        }, function(err, obj) {
          if (err) {
            console.log("ERROR! - can not find trailer record with _id == " + _id);
          } else {
            console.log("called LotWalkthroughTrailer obj == " + JSON.stringify(obj));
            res.setHeader('content-type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(obj));
          }
        });
      });
    }
  } // end else if
});


app.post("/gettrailerarchive", function(req, res) {
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var _idObj = JSON.parse(jsonString);
        TrailerArchive.find({
          _id: _idObj._id
        }, function(err, obj) {
          if (err) {
            console.log("ERROR! - can not find trailer record with _id == " + _id);
          } else {
            console.log("called gettrailer obj == " + JSON.stringify(obj[0]));
            res.setHeader('content-type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(obj[0]));
          }
        });
      });
    }
  } else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined) {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var _idObj = JSON.parse(jsonString);
        TrailerArchive.find({
          _id: _idObj._id,
          customer: req.session.currentuser.customer
        }, function(err, obj) {
          if (err) {
            console.log("ERROR! - can not find trailer record with _id == " + _id);
          } else {
            console.log("called gettrailer obj == " + JSON.stringify(obj[0]));
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
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var _idObj = JSON.parse(jsonString);
        File.findOne({
          _id: _idObj._id
        }, function(err, obj) {
          if (err) {
            console.log("ERROR! - can not find document with _id == " + _id);
          } else {
            var token = randtoken.generate(16);
            var filename = obj.name;
            var pth = path.join(__dirname, 'documentsforreading', token);
            var filenamewithpartialpath = path.join(token, filename);
            var filenamewithpath = path.join(__dirname, 'documentsforreading', token, filename);
            mkdirp(pth, function(err) {
              if (err) console.error(err)
              else console.log('pow!')

              fs.writeFile(filenamewithpath, obj.contents, function(err) {
                if (err) return console.log(err);
                console.log('Hello World > helloworld.txt');

                res.setHeader('content-type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify({
                  "filename": filename,
                  "tokenpath": token
                }));
              }); // end fs.writeFile
            }); // end mkdirp
          }
        });
      });
    }
  } else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined) {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var _idObj = JSON.parse(jsonString);
        File.findOne({
          _id: _idObj._id,
          customer: req.session.currentuser.customer
        }, function(err, obj) {
          if (err) {
            console.log("ERROR! - can not find document with _id == " + _id);
          } else {
            var token = randtoken.generate(16);
            var filename = obj.name;
            var pth = path.join(__dirname, 'documentsforreading', token);
            var filenamewithpartialpath = path.join(token, filename);
            var filenamewithpath = path.join(__dirname, 'documentsforreading', token, filename);

            mkdirp(pth, function(err) {
              if (err) console.error(err)
              else console.log('pow!')

              fs.writeFile(filenamewithpath, obj.contents, function(err) {
                if (err) return console.log(err);
                console.log('Hello World > helloworld.txt');

                res.setHeader('content-type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify({
                  "filename": filename,
                  "tokenpath": token
                }));
              }); // end fs.writeFile
            }); // end mkdirp
          }
        });
      });
    } // end POST if
  } // end else if
});

app.post("/getnameoftrailerarchivedocument", function(req, res) {
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var _idObj = JSON.parse(jsonString);
        FileArchive.findOne({
          _id: _idObj._id
        }, function(err, obj) {
          if (err) {
            console.log("ERROR! - can not find document with _id == " + _id);
          } else {
            var token = randtoken.generate(16);
            var filename = obj.name;
            var pth = path.join(__dirname, 'documentsforreading', token);
            var filenamewithpartialpath = path.join(token, filename);
            var filenamewithpath = path.join(__dirname, 'documentsforreading', token, filename);
            mkdirp(pth, function(err) {
              if (err) console.error(err)
              else console.log('pow!')

              fs.writeFile(filenamewithpath, obj.contents, function(err) {
                if (err) return console.log(err);
                console.log('Hello World > helloworld.txt');

                res.setHeader('content-type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify({
                  "filename": filename,
                  "tokenpath": token
                }));
              }); // end fs.writeFile
            }); // end mkdirp
          }
        });
      });
    }
  } else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined) {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var _idObj = JSON.parse(jsonString);
        FileArchive.findOne({
          _id: _idObj._id,
          customer: req.session.currentuser.customer
        }, function(err, obj) {
          if (err) {
            console.log("ERROR! - can not find document with _id == " + _id);
          } else {
            var token = randtoken.generate(16);
            var filename = obj.name;
            var pth = path.join(__dirname, 'documentsforreading', token);
            var filenamewithpartialpath = path.join(token, filename);
            var filenamewithpath = path.join(__dirname, 'documentsforreading', token, filename);

            mkdirp(pth, function(err) {
              if (err) console.error(err)
              else console.log('pow!')

              fs.writeFile(filenamewithpath, obj.contents, function(err) {
                if (err) return console.log(err);
                console.log('Hello World > helloworld.txt');

                res.setHeader('content-type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify({
                  "filename": filename,
                  "tokenpath": token
                }));
              }); // end fs.writeFile
            }); // end mkdirp
          }
        });
      });
    } // end POST if
  } // end else if
});

app.post("/gettrailerdocuments", function(req, res) {
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var _idObj = JSON.parse(jsonString);
        File.find({
          trailer_id: _idObj._id
        }, function(err, obj) {
          if (err) {
            console.log("ERROR! - can not find trailer record with _id == " + _id);
          } else {
            for (var i = 0; i < obj.length; i++) {
              obj[i].contents = null;
            }

            console.log("called gettrailerdocuments obj == " + JSON.stringify(obj));
            res.setHeader('content-type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(obj));
          }
        });
      });
    }
  } else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined) {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var _idObj = JSON.parse(jsonString);
        console.log("!!!!!!!!!!!executing File.find");
        File.find({
          trailer_id: _idObj._id,
          customer: req.session.currentuser.customer
        }, function(err, obj) {
          if (err) {
            console.log("ERROR! - can not find trailer record with _id == " + _id);
          } else {
            for (var i = 0; i < obj.length; i++) {
              obj[i].contents = null;
            }

            console.log("called gettrailerdocuments obj == " + JSON.stringify(obj));
            res.setHeader('content-type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(obj));
          }
        });
      });
    }

  } // end if
});


app.post("/gettrailerarchivedocuments", function(req, res) {
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var _idObj = JSON.parse(jsonString);
        FileArchive.find({
          trailer_id: _idObj._id
        }, function(err, obj) {
          if (err) {
            console.log("ERROR! - can not find trailer record with _id == " + _id);
          } else {
            for (var i = 0; i < obj.length; i++) {
              obj[i].contents = null;
            }

            console.log("called gettrailerdocuments obj == " + JSON.stringify(obj));
            res.setHeader('content-type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify(obj));
          }
        });
      });
    }
  } else if (req.session.currentuser.customer != "" && req.session.currentuser.customer != undefined) {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var _idObj = JSON.parse(jsonString);
        console.log("!!!!!!!!!!!executing File.find");
        FileArchive.find({
          trailer_id: _idObj._id,
          customer: req.session.currentuser.customer
        }, function(err, obj) {
          if (err) {
            console.log("ERROR! - can not find trailer record with _id == " + _id);
          } else {
            for (var i = 0; i < obj.length; i++) {
              obj[i].contents = null;
            }

            console.log("called gettrailerdocuments obj == " + JSON.stringify(obj));
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
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {
        var newDeleteTrailerObject = JSON.parse(jsonString);
        console.log("jsonString for delete trailer == " + jsonString);
        console.log("newDeleteTrailerObject._id == " + newDeleteTrailerObject._id);

        Trailer.findOneAndRemove({
          '_id': newDeleteTrailerObject._id
        }, function(err, trailer) {

          File.find({
            trailer_id: newDeleteTrailerObject._id
          }).remove(function(err) {
            if (err) throw err;

            res.setHeader('content-type', 'application/json');
            res.writeHead(200);
            res.end("{}");
          });
        });
        //var trailer = new Trailer(newTrailerObject);
      });
    }
  } // end if
});

app.post("/deleteuseraccount", function(req, res) {
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {

        var newDeleteUserObject = JSON.parse(jsonString);


        User.findOne({
          username: newDeleteUserObject.email
        }, function(err, user) {



          if (user.customer == "ADMIN") {
            User.find({
              customer: new RegExp('ADMIN', "i")
            }, function(err, userAdmins) {
              if (userAdmins.length > 1) {

                User.findOneAndRemove({
                    'username': newDeleteUserObject.email
                  },
                  function(err, user) {
                    if (err) {
                      console.log("ERROR in /deleteuseraccount")
                    } else {
                      console.log("COMPLETED /deleteuseraccount successfully")

                      res.setHeader('content-type', 'application/json');
                      res.writeHead(200);
                      res.end("{}");
                    }
                  }); // end User.findOneAndRemove
              } // end useradmins.length != 1
            }); // end User.find
          } // if newDeleteUserObject.customer == 'ADMIN'
          else {
            // User we are deleting isn't and ADMIN
            User.findOneAndRemove({
                'username': newDeleteUserObject.email
              },
              function(err, user) {
                if (err) {
                  console.log("ERROR in /deleteuseraccount")
                } else {
                  console.log("COMPLETED /deleteuseraccount successfully")

                  res.setHeader('content-type', 'application/json');
                  res.writeHead(200);
                  res.end("{}");
                }
              }); // end User.findOneAndRemove
          }


        }); // end User.findOne


      }); // end req.on('end')
    } // end req.method == 'POST'
  } //req.session.currentuser.customer == "ADMIN"


}); // end app.post("/deleteuseraccount"




// this route is used by the table to delete a user
app.post("/deleteuser", function(req, res) {
  if (req.session.currentuser.customer == "ADMIN") {
    if (req.method == 'POST') {
      var jsonString = '';
      req.on('data', function(data) {
        jsonString += data;
      });
      req.on('end', function() {

        var newDeleteUserObject = JSON.parse(jsonString);


        User.findOne({
          _id: newDeleteUserObject._id
        }, function(err, user) {



          if (user.customer == "ADMIN") {
            User.find({
              customer: new RegExp('ADMIN', "i")
            }, function(err, userAdmins) {
              if (userAdmins.length > 1) {

                User.findOneAndRemove({
                    _id: newDeleteUserObject._id
                  },
                  function(err, user) {
                    if (err) {
                      console.log("ERROR in /deleteuser")
                    } else {
                      console.log("COMPLETED /deleteuser successfully")

                      res.setHeader('content-type', 'application/json');
                      res.writeHead(200);
                      res.end("{}");
                    }
                  }); // end User.findOneAndRemove
              } // end useradmins.length != 1
            }); // end User.find
          } // if newDeleteUserObject.customer == 'ADMIN'
          else {
            // User we are deleting isn't and ADMIN
            User.findOneAndRemove({
                _id: newDeleteUserObject._id
              },
              function(err, user) {
                if (err) {
                  console.log("ERROR in /deleteuser")
                } else {
                  console.log("COMPLETED /deleteuser successfully")

                  res.setHeader('content-type', 'application/json');
                  res.writeHead(200);
                  res.end("{}");
                }
              }); // end User.findOneAndRemove
          }


        }); // end User.findOne


      }); // end req.on('end')
    } // end req.method == 'POST'
  } //req.session.currentuser.customer == "ADMIN"


}); // end app.post("/deleteuser"





function getAllObjectsProperties(obj) {
  var str = "";
  for (var prop in obj) {
    str += prop + " ";
  }

  return str;
}

app.get("/greeting", function(req, res) {
  res.setHeader('content-type', 'application/json');
  res.writeHead(200);

  var str = getAllObjectsProperties(req.headers);
  console.log('------header properties == ' + str);
  console.log('----------cookie header == ' + req.headers['cookie']);

  console.log('============req.session.lastPage == ' + req.session.lastPage);
  req.session.lastPage = '/radical';

  if (req.headers['x-forwarded-proto'] == "https") {
    res.end("{\"id\":3433,\"content\":\"This is https!\"}");
  } else {
    res.end("{\"id\":3433,\"content\":\"Hello, World!\"}");
  }
  console.log("DISABLE_SSL == " + DISABLE_SSL);
});

io.on('connection', function(socket) {
  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
  });
});


var port = process.env.PORT || 5000;

http.listen(port, function() {
  console.log('listening on *:' + port);
});


function sendOneTrailerEmailWhenComplete(trailer) {
  User.find({
    customer: trailer.customer,
    sendemailoncompleted: true
  }, function(err, users) {
    for (var i = 0; i < users.length; i++) {
      sendAnEmail(users[i].username, "Unit " + trailer.unitnumber + " marked 100% Complete",
        buildHTMLTrailerTable([trailer]));
    }
  }); // end User.find

}

function buildHTMLTrailerTable(trailers) {
  var htmlString = '';

  htmlString += '<table>';
  htmlString += '<thead>';
  htmlString += '  <tr>';
  htmlString += '   <th>Unit #</th>';
  htmlString += '   <th>Customer</th>';
  htmlString += '   <th>Account</th>';
  htmlString += '   <th>Vehicle Type</th>';
  htmlString += '   <th>Location</th>';
  // htmlString += '   <th>Date FRS Notified</th>';
  htmlString += '   <th>Date Approved</th>';
  htmlString += '   <th>Estimated Time of Completion</th>';
  htmlString += '   <th>Status</th>';
  htmlString += '   <th>Supporting Documents</th>';
  htmlString += '  </tr>';
  htmlString += '</thead>';
  htmlString += '<tbody>';

  for (var i = 0; i < trailers.length; i++) {
    var currentTrailer = trailers[i];
    htmlString += ' <tr>';
    htmlString += '   <td>' + currentTrailer.unitnumber + '</td>';
    htmlString += '   <td>' + currentTrailer.customer + '</td>';
    htmlString += '   <td>' + currentTrailer.account + '</td>';
    htmlString += '   <td>' + currentTrailer.vehicletype + '</td>';
    htmlString += '   <td>' + currentTrailer.location + '</td>';
    // htmlString += '   <td>'+currentTrailer.datersnotified+'</td>';
    htmlString += '   <td>' + currentTrailer.dateapproved + '</td>';
    htmlString += '   <td>' + currentTrailer.estimatedtimeofcompletion + '</td>';
    htmlString += '   <td>' + currentTrailer.status1 + '<br />' + currentTrailer.status2 + '<br />' + currentTrailer.status3 + '</td>';
    htmlString += '   <td>' + getProperDocumentString(currentTrailer.numberofsupportingdocuments) + '<br />' + getNoteString(currentTrailer.note) + '</td>';
    htmlString += ' </tr>';
  }

  htmlString += '</tbody>';
  htmlString += '</table>';

  return htmlString;
}

function getNoteString(note) {
  if (note == undefined || note == null || note == "") {
    return "";
  } else {
    return "1 Note";
  }
  return "";
}

function getProperDocumentString(numberofdocs) {
  if (numberofdocs == undefined || numberofdocs == null || numberofdocs == 0) {
    return "";
  } else if (numberofdocs == 1) {
    return "1 Document"
  } else if (numberofdocs > 1) {
    return numberofdocs + " Documents"
  }
  return "";
}

function sendAnEmail(toEmail, sub, body) {
  // create reusable transporter object using SMTP transport
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'fleetrepinfo@gmail.com',
      pass: 'ubuntu3rbnue4'
    }
  });

  // NB! No need to recreate the transporter object. You can use
  // the same transporter object for all e-mails

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: 'Fleet Repair Solutions ✔ <fleetrepinfo@gmail.com>', // sender address
    to: toEmail + ', ' + toEmail, // list of receivers
    subject: sub, // Subject line
    text: body, // plaintext body
    html: body // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Message sent: ' + info.response);
    }
  });
}
