FleetRepManager.module("TrailersApp.UploadDocuments", function(UploadDocuments, FleetRepManager, Backbone, Marionette, $, _){
  UploadDocuments.Controller = {

    showUploadDocumentsTrailerForm: function() {
      // alert ('showUploadDocumentsUser triggered!');

      //var trailer = new FleetRepManager.Entities.Trailer();
      var view = new FleetRepManager.TrailersApp.UploadDocuments.Trailer(/*{model: trailer}*/);

      view.on("form:submit", function(data){
          //VapeBookManager.trigger("show:createUploadDocumentsprofile");
      });

      FleetRepManager.regions.table.show(view);

    }
  };

});
