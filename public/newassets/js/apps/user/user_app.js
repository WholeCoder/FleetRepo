FleetRepManager.module("UserApp", function(UserApp, FleetRepManager, Backbone, Marionette, $, _){
  UserApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
/*      "loginuser" : "showUserLogin",
      "newuser" : "showNewUser",
      "showuserprofile": "showUserProfile",
      "showinputcreditcardinfo": "showInputCreditCardInfo"
*/    }
  });

  var API = {
    showUserLogin: function(){
/*      UserApp.Login.Controller.showUserLogin();
*/      //ContactManager.execute("set:active:header", "about");
    },
    showNewUser: function(){
      UserApp.New.Controller.showNewUser();
    },
    showUserProfile: function(){
/*      console.log("executing showUserProfile()");
      UserApp.Show.Controller.showContact();
*/    },
    showInputCreditCardInfo: function(){
/*      UserApp.CreditCard.Controller.showCreditCardInput();
*/    },
    showCreateNewUserProfile: function() {
/*      UserApp.NewUser.Controller.showNewProfile();
*/    },
    showResetPassword: function() {
      UserApp.ResetPassword.Controller.showResetPassword();
    }
  };

  FleetRepManager.on("show:resetpassword", function(){
    //ContactManager.navigate("about");
    API.showResetPassword();
  });

  FleetRepManager.on("show:createnewprofile", function(){
    //ContactManager.navigate("about");
    API.showCreateNewUserProfile();
  });

  FleetRepManager.on("creditcard:enter", function(){
    //ContactManager.navigate("about");
    API.showInputCreditCardInfo();
  });

  FleetRepManager.on("user:view", function(){
    //ContactManager.navigate("about");
    API.showUserProfile();
  });

  FleetRepManager.on("user:new", function(){
    //ContactManager.navigate("about");
    API.showNewUser();
  });

  FleetRepManager.on("user:login", function(){
    //ContactManager.navigate("about");
    API.showUserLogin();
  });

  UserApp.on("start", function(){
    new UserApp.Router({
      controller: API
    });
  });
});
