// This script is to see if the unit with 'rubensunit' value is in both secondary and primary mongodb nodes.

var   mongodbconnectionstring = "mongodb://newdatabaseuser:qwertyuiop@ds027293-a0.mongolab.com:27293,ds027293-a1.mongolab.com:27293/heroku_qlr988hb?replicaSet=rs-ds027293";

var mongoose = require("mongoose"),
	Trailer = require('./trailer-model');

var connStr = mongodbconnectionstring;
mongoose.connect(connStr, function(err) {
  if (err) throw err;
  console.log('Successfully connected to MongoDB');
});



Trailer.find({
unitnumber: '50818'
}, function(err, docs) {
	console.log("found "+docs.length+ " units with unitnumber == rubensunit (primary) status1 == "+docs[0].status1);

}); // end Trailer.find



Trailer.find({
unitnumber: '50818'
}, function(err, docs) {
	console.log("found "+docs.length+ " units with unitnumber == rubensunit (secondary) status1 == "+docs[0].status1);

}).read('secondaryPreferred'); // end Trailer.find


