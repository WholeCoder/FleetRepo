FleetRepManager.module("TrailersApp.NewLotWalkthrough", function(NewLotWalkthrough, FleetRepManager, Backbone, Marionette, $, _){
  NewLotWalkthrough.Controller = {

    showNewOnLotTrailerForm: function() {
      // alert ('showNewLotWalkthroughUser triggered!');

      var trailer = new FleetRepManager.Entities.Trailer();
      var view = new FleetRepManager.TrailersApp.NewLotWalkthrough.Trailer({model: trailer});

      view.on("form:submit", function(data){
          //VapeBookManager.trigger("show:createnewprofile");
      });

      FleetRepManager.regions.table.show(view);

    }
  };

});
