FleetRepManager.module("Entities", function(Entities, FleetRepManager, Backbone, Marionette, $, _){
//alert('Backbone.Model.extend == '+Backbone.Model.extend);
  Entities.Trailer = Backbone.Model.extend({
    urlRoot: "trailers",
    idAttribute: "_id", /* If this changes then update trailer-list-item or be in for a world of trouble! */

    defaults: {
      unitnumber: "",
      customer: "",
      account: "",
      vehicletype: "",
      location: "",
      datersnotified: "",
      dateapproved: "",
      estimatedtimeofcompletion: "",
      status: "Completed",
      percentcomplete: ""
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

  Entities.TrailerCollection = Backbone.Collection.extend({
    urlRoot: "/trailers",

    url: function() {
      // send the url along with the serialized query params
      console.log("accessing url function!!! in fetch TrailerColections == "+this.urlRoot + "?dummyforie="+new Date().getTime().toString());
      return this.urlRoot + "?dummyforie="+new Date().getMilliseconds().toString();
    },
    model: Entities.Trailer,
    comparator: "unitnumber"
  });

  //Entities.configureStorage("FleetRepManager.Entities.TrailerCollection");

  var initializeTrailers = function(){
    var trailers = new Entities.TrailerCollection([
      { _id: 1, unitnumber: "1245",  customer: "UPS", account: "Account1", vehicletype: "tractor trailer", location: "EDC III",  datersnotified: "11/19/2015",  estimatedtimeofcompletion: "11/27/2015",  percentcomplete: "75%",  status: "Completed",  dateapproved: "11/3/2015"},
      { _id: 2, unitnumber: "1238",  customer: "FEDEX", account: "Account2", vehicletype: "tractor trailer", location: "FRS",  datersnotified: "11/19/2015",  estimatedtimeofcompletion: "11/20/2015",  percentcomplete: "20%",  status: "Completed",  dateapproved: "11/18/2015"},
      { _id: 3, unitnumber: "1294",  customer: "USMAIL", account: "Account3", vehicletype: "tractor trailer", location: "FRS",  datersnotified: "11/19/2015",  estimatedtimeofcompletion: "11/26/2015",  percentcomplete: "10%",  status: "EIP",  dateapproved: "11/1/2015"},
      { _id: 4, unitnumber: "1134",  customer: "NENGLAND", account: "Account4", vehicletype: "tractor trailer", location: "HW",  datersnotified: "11/19/2015",  estimatedtimeofcompletion: "11/25/2015",  percentcomplete: "0%",  status: "WIP",  dateapproved: "11/19/2015"}
    ]);
    /*trailers.forEach(function(trailer){
      trailer.save();
    });*/
    return trailers.models;
  };

  var API = {
    getContactEntities: function(){
      var trailers = new Entities.TrailerCollection();
      var defer = $.Deferred();
      trailers.fetch({
        success: function(data){
          console.log("successfully got all trailers");
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
    },

    getContactEntity: function(contactId){
      var contact = new Entities.Trailer({_id: contactId});
      var defer = $.Deferred();
      setTimeout(function(){
        contact.fetch({
          success: function(data){
            defer.resolve(data);
          },
          error: function(data){
            defer.resolve(undefined);
          }
        });
      }, 2000);
      return defer.promise();
    }
  };

  FleetRepManager.reqres.setHandler("trailer:entities", function(){
    return API.getContactEntities();
  });

  FleetRepManager.reqres.setHandler("contact:entity", function(id){
    return API.getContactEntity(id);
  });
});
