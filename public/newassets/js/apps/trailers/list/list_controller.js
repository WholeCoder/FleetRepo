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

        $("#myTable").tablesorter();
        $("#searchInput").keyup(function () {
            var rows = $("#fbody").find("tr").hide();
            if (this.value.length) {
                var data = this.value.split(" ");
                $.each(data, function (i, v) {
                    rows.filter(":contains('" + v + "')").show();
                });
            } else rows.show();
        });

        $('[data-toggle="tooltip"]').tooltip();
      });

      FleetRepManager.regions.table.show(trailersListLayout);
});


      // FleetRepManager.regions.table.show(trailersListLayout);
    }
  }
});
