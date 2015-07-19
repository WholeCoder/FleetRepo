FleetRepManager.module("TrailersApp.New", function(New, FleetRepManager, Backbone, Marionette, $, _){
  New.Controller = {

    showNewTrailerForm: function() {
      // alert ('showNewUser triggered!');

      var trailer = new FleetRepManager.Entities.Trailer();
      var view = new FleetRepManager.TrailersApp.New.Trailer({model: trailer});

      view.on("form:submit", function(data){
          //VapeBookManager.trigger("show:createnewprofile");
      });

      FleetRepManager.regions.table.show(view);

    }
  };

});
