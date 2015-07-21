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

    },

    resetThePassword: function(user) {
      if(confirm("Are you sure you want to reset user "+user.email+"'s password?"))
      {
            $.ajax('/resetuserspassword' + "?dummyforie="+new Date().getTime().toString(), {
                type: 'POST',
                data: JSON.stringify({ email: user.siteusers, password: user.password}),
                contentType: 'text/json',
                success: function() {
                          FleetRepManager.trigger("user:new");
                         },
                error  : function() { if ( callback ) callback(false); }
            }); // end $.ajax
      } // end confirm if
    }
  };

});
