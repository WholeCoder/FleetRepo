FleetRepManager.module("UserApp.New", function(New, FleetRepManager, Backbone, Marionette, $, _){
  New.Controller = {

    showNewUser: function() {
      // alert ('showNewUser triggered!');


      var view = new FleetRepManager.UserApp.New.User({});

      view.on("form:submit", function(data){
        //alert('submitted the new user form!');
          //VapeBookManager.trigger("show:createnewprofile");
      });

      FleetRepManager.regions.userRegion.show(view);

    }
  };

});
