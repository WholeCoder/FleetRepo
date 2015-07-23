FleetRepManager.module("UserApp.Login", function(Login, FleetRepManager, Backbone, Marionette, $, _){
  Login.Controller = {

    showUserLogin: function() {
      // alert ('showNewUser triggered!');


      var view = new FleetRepManager.UserApp.Login.User({});

      view.on("form:submit", function(data){
          //VapeBookManager.trigger("show:createnewprofile");
      });
      FleetRepManager.regions.table.show(view);

    }
  };

});
