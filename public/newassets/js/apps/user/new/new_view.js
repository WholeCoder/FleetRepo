FleetRepManager.module("UserApp.New", function(New, VapeBookManager, Backbone, Marionette, $, _){
  New.User = Marionette.ItemView.extend({
    title: "Create Account",

        template: "#new-user-form",

    events: {
      "click .js-submit": "submitClicked",
      "click .js-cancelusercreate": "cancelCreateNewUser"
    },

    onRender: function(){
// <option value="rpierich@hotmail.com" style="background-color: red; color: white;">  ADMIN - rpierich@hotmail.com</option>

      var that = this;

      var availableTags = [
          "Dedicated Hershey",
          "OTR",
          "Intermodal"
          ];
      this.$( ".js-account" ).autocomplete({
        source: availableTags
      });

      var customerTypeTags = [
          "ADMIN",
          "CHAMBERSBURG WASTE PAPER",
          "CONTRACT LEASING CORP.",
          "CR ENGLAND",
          "EMERGENCY BREAKDOWN SERVICE",
          "FORWARD AIR, INC.",
          "LOGISTICS & DISTRIBUTION SERVICES",
          "NEW ERA TRANSPORTATION",
          "PREMIER TRAILER LEASING",
          "ROAD & RAIL SERVICES",
          "UNITED PARCEL SERVICE",
          "WESTERN  EXPRESS INC.",
          "WHITE ARROW"
          ];
          this.$( ".js-customer" ).autocomplete({
            source: customerTypeTags
          });


    },

    cancelCreateNewUser: function(e) {
      e.preventDefault();
      FleetRepManager.trigger("user:listusers");
    },

    submitClicked: function(e){
      e.preventDefault();
      var data = Backbone.Syphon.serialize(this);
      //alert('submit form clicked!');
      this.trigger("form:submit", data);
      $.ajax('/savenewaccount' + "?dummyforie="+new Date().getTime().toString(), {
          type: 'POST',
          data: JSON.stringify({ email: data.email, password: data.password, customer: data.customer, account: data.account}),
          contentType: 'text/json',
          success: function() {
                    //if ( callback ) callback(true); 

                    //alert("successfully created user");
                    //$().style("display:block;")

                    alert('New User Created!');
                    FleetRepManager.trigger("user:listusers");

                   },
          error  : function() { if ( callback ) callback(false); }
      }); // end $.ajax
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
    }
  });
});
