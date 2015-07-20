FleetRepManager.module("UserApp.New", function(New, VapeBookManager, Backbone, Marionette, $, _){
  New.User = Marionette.ItemView.extend({
    title: "Create Account",

        template: "#new-user-form",

    events: {
      "click .js-submit": "submitClicked",
      "click .js-resetuserpassword": "showResetPasswordForm",
      "click .js-deleteuser": "deleteUser"
    },

    deleteUser: function(e) {
      e.preventDefault();
      alert("Delete User Not Implemented Yet.");
    },

    showResetPasswordForm: function(e) {
      e.preventDefault();
      FleetRepManager.trigger("show:resetpassword");
    },

    submitClicked: function(e){
      e.preventDefault();
      var data = Backbone.Syphon.serialize(this);
      //alert('submit form clicked!');
      this.trigger("form:submit", data);
      $.ajax('/savenewaccount' + "?dummyforie="+new Date().getTime().toString(), {
          type: 'POST',
          data: JSON.stringify({ email: data.email, password: data.password, customer: data.customer}),
          contentType: 'text/json',
          success: function() {
                    //if ( callback ) callback(true); 

                    //alert("successfully created user");
                    //$().style("display:block;")

                    alert('New User Created!');

                   },
          error  : function() { if ( callback ) callback(false); }
      });
      //FleetRepManager.trigger("show:resetpassword");
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
