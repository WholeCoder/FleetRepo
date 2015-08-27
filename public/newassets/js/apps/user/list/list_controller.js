FleetRepManager.module("UserApp.List", function(List, FleetRepManager, Backbone, Marionette, $, _){
  List.Controller = {
    
    listUsers: function(criterion){
      var fetchingUsers = FleetRepManager.request("user:entities");
      // var trailersListLayout = new List.Layout();
      var noUsersView = new List.NoUsersView();

      FleetRepManager.regions.table.show(noUsersView);
      
$.when(fetchingUsers).done(function(users){

        var userssListView = new List.Users({
          collection: users
        });

/*      trailersListLayout.on("show", function(){
        trailersListLayout.trailersRegion.show(contactsListView);

        //$('[data-toggle="tooltip"]').tooltip();
      });
*/
      FleetRepManager.regions.userRegion.show(userssListView);
}); // end $.when


      // FleetRepManager.regions.table.show(trailersListLayout);
    }
  }
});
