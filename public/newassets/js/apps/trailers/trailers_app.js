FleetRepManager.module("TrailersApp", function(TrailersApp, FleetRepManager, Backbone, Marionette, $, _){
  TrailersApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "trailers(/filter/criterion::criterion)": "listContacts",
      "trailers/:id": "showContact",
      "trailers/:id/edit": "editContact"
    }
  });

  var API = {
    listContacts: function(criterion){
      //alert('listContacts called.');
      TrailersApp.List.Controller.listContacts(criterion);
/*      FleetRepManager.execute("set:active:header", "contacts");
*/    },

    showContact: function(id){
      alert('showContact called.');
/*      TrailersApp.Show.Controller.showContact(id);
      FleetRepManager.execute("set:active:header", "contacts");
*/    },

    editContact: function(id){
      alert('editContact called.');
/*      TrailersApp.Edit.Controller.editContact(id);
      FleetRepManager.execute("set:active:header", "contacts");
*/    }
  };

  FleetRepManager.on("trailers:list", function(){
    //FleetRepManager.navigate("contacts");
    API.listContacts();
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
