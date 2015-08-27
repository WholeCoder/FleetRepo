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
    showUserList: function() {
      UserApp.List.Controller.listUsers();
    },

    showUserLogin: function(){
      UserApp.Login.Controller.showUserLogin();
      //ContactManager.execute("set:active:header", "about");
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
    // for admin to change user password
    showResetPassword: function() {
      UserApp.ResetPassword.Controller.showResetPassword();
    },
    // for user to change their own password
    showLetUserResetPassword: function() {
      UserApp.LetUserResetPassword.Controller.showResetPassword();
    },
    resetUsersPassword: function(user) {
      // this is so the admin can reset the user's password
      UserApp.ResetPassword.Controller.resetThePassword(user)
    },
    letUserResetPassword: function(user) {
      // this is so the user can change their own password
      UserApp.LetUserResetPassword.Controller.resetThePassword(user);
      //alert("user is resetting user's password");
    }
  };

  FleetRepManager.on("user:listusers", function() {
    API.showUserList();
  });

  // this is so the admin can reset the user's password
  FleetRepManager.on("trailer:resetuserspassword", function(user){
    //FleetRepManager.navigate("contacts");
    API.resetUsersPassword(user);
  });

  // this is so the user can change their own password
  FleetRepManager.on("trailer:letuserresetpassword", function(user){
    //FleetRepManager.navigate("contacts");
    API.letUserResetPassword(user);
  });

  // this is so the admin can reset the user's password
  FleetRepManager.on("show:resetpassword", function(){
    //ContactManager.navigate("about");
    API.showResetPassword();
  });

  // this is so the user can change their own password
  FleetRepManager.on("show:letuserresetpassword", function(){
    //ContactManager.navigate("about");
    API.showLetUserResetPassword();
  });

  FleetRepManager.on("show:login", function(){
    //ContactManager.navigate("about");
    API.showUserLogin();
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

  UserApp.on("start", function(){
    new UserApp.Router({
      controller: API
    });
  });
});
