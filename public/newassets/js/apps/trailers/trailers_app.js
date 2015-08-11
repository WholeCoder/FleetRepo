FleetRepManager.module("TrailersApp", function(TrailersApp, FleetRepManager, Backbone, Marionette, $, _){
  TrailersApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "trailers(/filter/criterion::criterion)": "listContacts",
      "trailers/:id": "showContact",
      "trailers/:id/edit": "editContact"
    }
  });

  var API = {
    loadDummyTrailerData: function() {

      $.ajax('/loaddummytrailerdata' + "?dummyforie="+new Date().getTime().toString(), {
        type: 'GET',
        data: "{}",
        contentType: 'text/json',
        success: function(data2) { 
            FleetRepManager.trigger("trailers:list");
            FleetRepManager.trigger("user:new");
            // refresh the charts in case there is new data
            FleetRepManager.loadCharts()

        },
        error  : function() { alert('Error - could not load dummy trailer data');}
      }); // end $.post

    },

    showNewTrailer: function() {
      console.log("showNewTrailer in controller called");
      TrailersApp.New.Controller.showNewTrailerForm();
    },

    showEditTrailer: function() {
      TrailersApp.Edit.Controller.showEditTrailerForm();
    },

    listContacts: function(criterion){
      //alert('listContacts called.');
        // refresh the charts in case there is new data
        TrailersApp.List.Controller.listContacts(criterion);
        FleetRepManager.loadCharts()
/*      FleetRepManager.execute("set:active:header", "contacts");
*/    },

    listTrailerArchives: function() {
        TrailersApp.ListArchive.Controller.listTrailerArchives();
    },

    listCustomerTrailerArchives: function() {
        TrailersApp.ListArchive.Controller.listCustomerTrailerArchives();
    },

    listTrailersOnlot: function() {
      alert('called listTrailersOnlot');
      TrailersApp.OnLot.Controller.listOnLotTrailers();
    },
    
    listCustomerOnLotTrailer: function() {
      alert('called listCustomerOnLotTrailer');
      TrailersApp.OnLot.Controller.listCustomerOnLotTrailers();
    },

    listCustomersContacts: function() {
        TrailersApp.List.Controller.listCustomerContacts();
        FleetRepManager.loadCharts()
        //FleetRepManager.hideAdminLinks();
    },

    showContact: function(id){
      alert('showContact called.');
      TrailersApp.OnLot.Controller.listCustomerOnLotTrailers();
/*      TrailersApp.Show.Controller.showContact(id);
      FleetRepManager.execute("set:active:header", "contacts");
*/    },

    editContact: function(id){
      alert('editContact called.');
      TrailersApp.OnLot.Controller.listOnLotTrailers();
/*      TrailersApp.Edit.Controller.editContact(id);
      FleetRepManager.execute("set:active:header", "contacts");
*/    }
  };


  FleetRepManager.on("trailers:new", function(){
    //FleetRepManager.navigate("contacts");
    API.showNewTrailer();
  });

  FleetRepManager.on("trailers:edit", function(){
    //FleetRepManager.navigate("contacts");
    API.showEditTrailer();
  });

  FleetRepManager.on("trailers:list", function(){
    //FleetRepManager.navigate("contacts");
    API.listContacts();
  });

  FleetRepManager.on("trailercustomerarchives:list", function(){
    //FleetRepManager.navigate("contacts");
    API.listCustomerTrailerArchives();
  });

  FleetRepManager.on("trailerarchives:list", function(){
    //FleetRepManager.navigate("contacts");
    API.listTrailerArchives();
  });

  FleetRepManager.on("trailercustomeronlot:list", function(){
    //FleetRepManager.navigate("contacts");
    API.listCustomerOnLotTrailer();
  });

  FleetRepManager.on("trailersonlot:list", function(){
    //FleetRepManager.navigate("contacts");
    API.listTrailersOnlot();
  });

  FleetRepManager.on("trailerscustomer:list", function(){
    //FleetRepManager.navigate("contacts");
    API.listCustomersContacts();
  });

  FleetRepManager.on("trailers:filter", function(criterion){
/*    if(criterion){
      FleetRepManager.navigate("contacts/filter/criterion:" + criterion);
    }
    else{
      FleetRepManager.navigate("contacts");
    }
*/
  });

  FleetRepManager.on("trailer:show", function(id){
/*    FleetRepManager.navigate("contacts/" + id);
    API.showContact(id);
*/
  });

  FleetRepManager.on("trailer:edit", function(id){
/*    FleetRepManager.navigate("contacts/" + id + "/edit");
    API.editContact(id);
*/
  });

  TrailersApp.on("start", function(){
    new TrailersApp.Router({
      controller: API
    });
  });
});
