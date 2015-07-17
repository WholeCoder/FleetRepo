FleetRepManager.module("TrailersApp.List", function(List, FleetRepManager, Backbone, Marionette, $, _){
  List.Controller = {
    listContacts: function(criterion){
      var fetchingTrailers = FleetRepManager.request("trailer:entities");
      var trailersListLayout = new List.Layout();

$.when(fetchingTrailers).done(function(trailers){

        var contactsListView = new List.Trailers({
          collection: trailers
        });

      trailersListLayout.on("show", function(){
        trailersListLayout.trailersRegion.show(contactsListView);
      });

});


      FleetRepManager.regions.table.show(trailersListLayout);
    }
  }
});
