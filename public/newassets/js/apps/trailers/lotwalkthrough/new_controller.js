FleetRepManager.module("TrailersApp.LotWalkthrough", function(LotWalkthrough, FleetRepManager, Backbone, Marionette, $, _){
  LotWalkthrough.Controller = {

    showNewOnLotTrailerForm: function() {
      // alert ('showLotWalkthroughUser triggered!');

      var trailer = new FleetRepManager.Entities.Trailer();
      var view = new FleetRepManager.TrailersApp.LotWalkthrough.Trailer({model: trailer});

      view.on("form:submit", function(data){
          //VapeBookManager.trigger("show:createnewprofile");
      });

      FleetRepManager.regions.table.show(view);

    }
  };

});
