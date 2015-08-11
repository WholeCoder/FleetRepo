FleetRepManager.module("TrailersApp.OnLot", function(OnLot, FleetRepManager, Backbone, Marionette, $, _){
  OnLot.Controller = {
    listCustomerOnLotTrailers: function() {
      var fetchingTrailers = FleetRepManager.request("trailersonlot:entities");
      var trailersListLayout = new OnLot.Layout();
      var noTrailersView = new OnLot.NoTrailersView();

      FleetRepManager.regions.table.show(noTrailersView);
      
        $.when(fetchingTrailers).done(function(trailers){

                var contactsListView = new OnLot.CustomerOnLotTrailers({
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
    listOnLotTrailers: function() {
      var fetchingTrailers = FleetRepManager.request("trailersonlot:entities");
      var trailersListLayout = new OnLot.Layout();
      var noTrailersView = new OnLot.NoTrailersView();

      FleetRepManager.regions.table.show(noTrailersView);
      
        $.when(fetchingTrailers).done(function(trailers){

                var contactsListView = new OnLot.OnLotTrailers({
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
