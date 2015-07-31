FleetRepManager.module("UserApp.LetUserResetPassword", function(LetUserResetPassword, VapeBookManager, Backbone, Marionette, $, _){
  LetUserResetPassword.User = Marionette.ItemView.extend({
    title: "Reset Password",

        template: "#let-user-reset-password-form",

    events: {
      "click .js-resetuserpassword" : "resetUserPassword"
    },

    resetUserPassword: function(e) {
      e.preventDefault();
      var data = Backbone.Syphon.serialize(this);
      //alert('submit form clicked! -resetUserPassword()');
      this.trigger("form:submit", data);
      //FleetRepManager.trigger("show:resetpassword");
      //data.siteusers = FleetRepManager.siteusers;
      FleetRepManager.trigger("trailer:letuserresetpassword", data);
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
      //this.$('#resetemail').val(FleetRepManager.siteusers);
    }
  });
});
