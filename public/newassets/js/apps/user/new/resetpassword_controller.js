FleetRepManager.module("UserApp.ResetPassword", function(ResetPassword, FleetRepManager, Backbone, Marionette, $, _){
  ResetPassword.Controller = {

    showResetPassword: function() {
      // alert ('showNewUser triggered!');


      var view = new FleetRepManager.UserApp.ResetPassword.User({});

      view.on("form:submit", function(data){
        //alert('submitted the new user form!');
          //VapeBookManager.trigger("show:createnewprofile");
      });

      FleetRepManager.regions.userRegion.show(view);

    }
  };

});
