FleetRepManager.module("UserApp.LetUserResetPassword", function(LetUserResetPassword, FleetRepManager, Backbone, Marionette, $, _){
  LetUserResetPassword.Controller = {

    showResetPassword: function() {
      // alert ('showNewUser triggered!');


      var view = new FleetRepManager.UserApp.LetUserResetPassword.User({});

      view.on("form:submit", function(data){
        //alert('submitted the new user form!');
          //VapeBookManager.trigger("show:createnewprofile");
      });

      FleetRepManager.regions.userRegion.show(view);

    },

    resetThePassword: function(user) {
      if(confirm("Are you sure you want to reset your password?"))
      {
//        alert("this is where we would reset the user's password!");
            $.ajax('/doletuserresetpassword' + "?dummyforie="+new Date().getTime().toString(), {
                type: 'POST',
                data: JSON.stringify({ currentpassword: user.currentpassword, password: user.password}),
                contentType: 'text/json',
                success: function(data2) {
                    if (data2.status == "successful") 
                    {
                      alert("Successfully changed your password.");
                    } else {
                      alert("Could not change password - server message:  "+data2.status);
                    }
                          FleetRepManager.trigger("show:letuserresetpassword");
                },
                error  : function() { if ( callback ) callback(false); alert("Could not reset your password!")}
            }); // end $.ajax

      } // end confirm if
    }
  };

});
