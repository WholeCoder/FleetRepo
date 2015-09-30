FleetRepManager.module("TrailersApp.List", function(List, FleetRepManager, Backbone, Marionette, $, _){
  List.Controller = {
    listCustomerContacts: function() {
      var fetchingTrailers = FleetRepManager.request("trailer:entities");
      var trailersListLayout = new List.Layout();
      var noTrailersView = new List.NoTrailersView();

      FleetRepManager.regions.table.show(noTrailersView);
      
        $.when(fetchingTrailers).done(function(trailers){

                var contactsListView = new List.CustomerTrailers({
                  collection: trailers
                });

              trailersListLayout.on("show", function(){
                trailersListLayout.trailersRegion.show(contactsListView);

                // sort by status
                $("#myTable").tablesorter({sortList: [[8,1]]});
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

    },

    listContacts: function(criterion){
      var fetchingTrailers = FleetRepManager.request("trailer:entities");
      var trailersListLayout = new List.Layout();
      var noTrailersView = new List.NoTrailersView();


      $('#searchInput').val("");

      FleetRepManager.regions.table.show(noTrailersView);
      
$.when(fetchingTrailers).done(function(trailers){

        var contactsListView = new List.Trailers({
          collection: trailers
        });

      trailersListLayout.on("show", function(){
        trailersListLayout.trailersRegion.show(contactsListView);

        // sort by status
        $("#myTable").tablesorter({sortList: [[8,1]]});
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
