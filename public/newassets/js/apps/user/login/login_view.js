FleetRepManager.module("UserApp.Login", function(Login, VapeBookManager, Backbone, Marionette, $, _){
  Login.User = Marionette.ItemView.extend({
    title: "Log In",

        template: "#login-form",

    events: {
      "click .js-submit": "submitClicked"
/*      "click .js-resetuserpassword" : "resetUserPassword",
      "click .js-canceluserreset" : "cancelRestUserPassword"
*/    },

    cancelRestUserPassword: function(e) {
      e.preventDefault();
      FleetRepManager.trigger("user:new");
    },

    resetUserPassword: function(e) {
      e.preventDefault();
      var data = Backbone.Syphon.serialize(this);
      alert('submit form clicked! -resetUserPassword()');
      this.trigger("form:submit", data);
      //FleetRepManager.trigger("show:resetpassword");
    },

    submitClicked: function(e){
      e.preventDefault();
      var data = Backbone.Syphon.serialize(this);
      //alert('submit form clicked!');
      this.trigger("form:submit", data);

      $.ajax('/login' + "?dummyforie="+new Date().getTime().toString(), {
        type: 'POST',
        data: JSON.stringify({ email: data.email, password: data.password}),
        contentType: 'text/json',
        success: function(data2) { 
          if (data2.email.toLowerCase() == data.email.toLowerCase())
          {
            if (data2.customer == "ADMIN")
            {

              // /archive100
              $.ajax('/archive100' + "?dummyforie="+new Date().getTime().toString(), {
                type: 'GET',
                data: "{}",
                contentType: 'text/json',
                success: function(data2) { 
                  FleetRepManager.admin = true;
                  FleetRepManager.showAdminLinks();
                  FleetRepManager.loadCharts();
                  FleetRepManager.trigger("trailers:list");
                  //FleetRepManager.trigger("user:new");
                  FleetRepManager.trigger("user:listusers");
                },
                error  : function() { alert('Error - could not archive 100% complete records.');}
              }); // end $.ajax GET

            } else
            {
              FleetRepManager.admin = false;
              FleetRepManager.showCustomerTrailerLinks();
              FleetRepManager.loadCharts();
              FleetRepManager.trigger("trailerscustomer:list");
              FleetRepManager.trigger("show:letuserresetpassword");
            }
          } else
          {
            alert("Could not authenticate user - "+data2.email);
          }
        },
        error  : function() { alert('Error - could not login');}
      });

    },

    onFormDataInvalid: function(errors){
      var $view = this.$el;

      var clearFormErrors = function(){
        var $form = $view.find("form");
        $form.find(".help-inline.error").each(function(){
          $(this).remove();
        });
        $form.find(".control-group.error").each(function(){
          $(this).removeClass("error");
        });
      }

      var markErrors = function(value, key){
        var $controlGroup = $view.find("#contact-" + key).parent();
        var $errorEl = $("<span>", { class: "help-inline error", text: value });
        $controlGroup.append($errorEl).addClass("error");
      }

      clearFormErrors();
      _.each(errors, markErrors);
    },

    onRender: function(){
      //this.$(".js-submit").text("Log In");
      //this.$('.agreetoterms').datepicker({autoclose: true});
    }
  });
});
