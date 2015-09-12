FleetRepManager.module("TrailersApp.LotWalkthrough", function(LotWalkthrough, FleetRepManager, Backbone, Marionette, $, _){
  LotWalkthrough.Controller = {
    listStartLotWalkthroughTrailers: function() {
      var fetchingTrailers = FleetRepManager.request("trailersonlot:entities");
      var trailersListLayout = new LotWalkthrough.Layout();
      var noTrailersView = new LotWalkthrough.NoTrailersView();

      FleetRepManager.regions.table.show(noTrailersView);
//      alert('fetching trailers for walkthrough');
        $.when(fetchingTrailers).done(function(trailers){
          //alert('got trailers for walkthrough - length == '+trailers.length);
FleetRepManager.lot_walkthrough_trailers = trailers;
                var contactsListView = new LotWalkthrough.LotWalkthroughTrailers({
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

    }, // end listStartLotWalkthroughTrailers
    resumeLotWalkthrough: function() {
      //var fetchingTrailers = FleetRepManager.request("trailersLotWalkthrough:entities");
      var trailersListLayout = new LotWalkthrough.Layout();
      var noTrailersView = new LotWalkthrough.NoTrailersView();

      FleetRepManager.regions.table.show(noTrailersView);
      
      // Note: We are using the same walkthrough_trailers we got when starting the walkthrough
      var contactsListView = new LotWalkthrough.LotWalkthroughTrailers({
        collection: FleetRepManager.lot_walkthrough_trailers
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


    } // end resumeLotWAlkthrough
  }
});
