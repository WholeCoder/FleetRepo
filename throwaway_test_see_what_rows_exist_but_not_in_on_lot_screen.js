var mongodbconnectionstring = "mongodb://localhost/test";

var Trailer = require('./trailer-model'),
	LotWalkthroughInstance = require('./lot-walkthrough-instance-model');


var mongoose = require("mongoose");

var connStr = mongodbconnectionstring;
mongoose.connect(connStr, function(err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});

var foundInTrailerButNotLotInstance = []

Trailer.find({
	            location: "FRS - (GRANTVILLE PA)"
	        }, function(err, docs) {
	        	console.log("Trailers length == "+docs.length);
	       	for (var i = 0; i < docs.length; i++)
	       	{
		        LotWalkthroughInstance.find({lot_walkthrough_trailer_id: docs[0]._id},
		        	function(err, objs) {
		        		if (objs.length != 0)
		        		{
		        			foundInTrailerButNotLotInstance.push({walkthroughid:  objs[0].lot_walkthrough_trailer_id, unitnumber: docs[i].unitnumber});
		        		}
		        	});
	    	}
});

console.log("\nDidn't find these unitnumbers in lot instance.");
for (var i = 0; i < foundInTrailerButNotLotInstance.length; i++)
{
	console.log(foundInTrailerButNotLotInstance[i].unitnumber);
}