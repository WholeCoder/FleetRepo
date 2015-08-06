FleetRepManager.module("TrailersApp.ListArchive", function(ListArchive, FleetRepManager, Backbone, Marionette, $, _){
  ListArchive.Controller = {
    listCustomerTrailerArchives: function() {
      var fetchingTrailers = FleetRepManager.request("trailerarchive:entities");
      var trailersListLayout = new ListArchive.Layout();
      var noTrailersView = new ListArchive.NoTrailersView();

      FleetRepManager.regions.table.show(noTrailersView);
      
        $.when(fetchingTrailers).done(function(trailers){

                var contactsListView = new ListArchive.CustomerTrailerArchives({
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
    listTrailerArchives: function() {
      var fetchingTrailers = FleetRepManager.request("trailerarchive:entities");
      var trailersListLayout = new ListArchive.Layout();
      var noTrailersView = new ListArchive.NoTrailersView();

      FleetRepManager.regions.table.show(noTrailersView);
      
        $.when(fetchingTrailers).done(function(trailers){

                var contactsListView = new ListArchive.TrailerArchives({
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

    }
  }
});
