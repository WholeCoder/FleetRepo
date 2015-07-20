FleetRepManager.module("TrailersApp.Edit", function(Edit, FleetRepManager, Backbone, Marionette, $, _){
  Edit.Controller = {

    showEditTrailerForm: function() {
      // alert ('showEditUser triggered!');

      var trailer = new FleetRepManager.Entities.Trailer();
      var view = new FleetRepManager.TrailersApp.Edit.Trailer({model: trailer});

      view.on("form:submit", function(data){
          //VapeBookManager.trigger("show:createEditprofile");
      });

      FleetRepManager.regions.table.show(view);

    }
  };

});
