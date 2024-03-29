FleetRepManager.module("Entities", function(Entities, FleetRepManager, Backbone, Marionette, $, _){
//alert('Backbone.Model.extend == '+Backbone.Model.extend);
  Entities.User = Backbone.Model.extend({
    urlRoot: "users",
    idAttribute: "_id", /* If this changes then update trailer-list-item or be in for a world of trouble! */

    defaults: {
      username: "",
      customer: "",
      sendemailoncompleted: false,
      senddailyemail: false,
      numberofsuccessfullogins: 0
    }/*,

    validate: function(attrs, options) {
      var errors = {}
      if (! attrs.firstName) {
        errors.firstName = "can't be blank";
      }
      if (! attrs.lastName) {
        errors.lastName = "can't be blank";
      }
      else{
        if (attrs.lastName.length < 2) {
          errors.lastName = "is too short";
        }
      }
      if( ! _.isEmpty(errors)){
        return errors;
      }
    }
*/
  });

  //Entities.configureStorage("FleetRepManager.Entities.Trailer");

  Entities.UserCollection = Backbone.Collection.extend({
    urlRoot: "/users",

    url: function() {
      // send the url along with the serialized query params
      console.log("accessing url function!!! in fetch UserColections == "+this.urlRoot + "?dummyforie="+new Date().getTime().toString());
      return this.urlRoot + "?dummyforie="+new Date().getMilliseconds().toString();
    },
    model: Entities.User,
    comparator: "username"
  });

  //Entities.configureStorage("FleetRepManager.Entities.TrailerCollection");

  var initializeTrailers = function(){
/*    var trailers = new Entities.TrailerCollection([
      { unitnumber: "1245",  customer: "CHAMBERSBURG WASTE PAPER", account: "Dedicated Hershey",  vehicletype: "Flat Bed", location: "EDC III",  assignedto: "Mary",  datersnotified: "11/19/2015",  estimatedtimeofcompletion: "11/27/2015",  status1: "10% - A/Estimate", status2: "10% - A/Parts", status3: "10% - A/Authorization",  dateapproved: "11/3/2015"},
      { unitnumber: "1238",  customer: "CONTRACT LEASING CORP.", account: "Intermodal", vehicletype: "Reefer Trailer",  location: "GRANTVILLE CRENGLAND",  datersnotified: "11/19/2015",  estimatedtimeofcompletion: "11/20/2015",   status1: "50% - Work In Progress", status2: "50% - Work In Progress", status3: "",  dateapproved: "11/18/2015"},
      { unitnumber: "1294",  customer: "CR ENGLAND", account: "OTR",  vehicletype: "Container Chassis", location: "GRANTVILLE CRENGLAND",  datersnotified: "11/19/2015",  estimatedtimeofcompletion: "11/26/2015",  status1: "100% - Complete - Reserved for Driver", status2: "100% - Complete - Released to Customer", status3: "100% - Complete - Ready for P/U",  dateapproved: "11/1/2015"},
      { unitnumber: "1134",  customer: "WHITE ARROW", account: "Intermodal",  vehicletype: "Tractor/Condo", location: "GRANTVILLE CRENGLAND",  datersnotified: "11/19/2015",  estimatedtimeofcompletion: "11/25/2015",  status1: "100% - Complete - Reserved for Driver", status2: "100% - Complete - Ready for P/U", status3: "",  dateapproved: "11/19/2015"}
    ]);
*/    /*trailers.forEach(function(trailer){
      trailer.save();
    });*/
    //return trailers.models;
  };

  var API = {
    getUserEntities: function(){
      var users = new Entities.UserCollection();
      var defer = $.Deferred();
      users.fetch({
        success: function(data){
          console.log("successfully got all users");
          //console.log("trailers == "+JSON.stringify(data));
          defer.resolve(data);
        }
      });
      var promise = defer.promise();
      $.when(promise).done(function(fetchedtrailers){
/*        if(fetchedtrailers.length === 0){
          // if we don't have any trailers yet, create some for convenience
          var models = initializeTrailers();
          trailers.reset(models);
        }

*/
      });
      return promise;
    }
  };

  FleetRepManager.reqres.setHandler("user:entities", function(){
    return API.getUserEntities();
  });

});
