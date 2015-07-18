FleetRepManager.module("UserApp.ResetPassword", function(ResetPassword, VapeBookManager, Backbone, Marionette, $, _){
  ResetPassword.User = Marionette.ItemView.extend({
    title: "Reset Password",

        template: "#reset-user-password-form",

    events: {
      "click .js-submit": "submitClicked",
      "click .js-resetuserpassword" : "resetUserPassword",
      "click .js-canceluserreset" : "cancelRestUserPassword"
    },

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
      //FleetRepManager.trigger("trailers:list");
      alert('Reset User Password Not Implemented Yet');
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
