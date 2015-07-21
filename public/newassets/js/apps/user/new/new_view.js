FleetRepManager.module("UserApp.New", function(New, VapeBookManager, Backbone, Marionette, $, _){
  New.User = Marionette.ItemView.extend({
    title: "Create Account",

        template: "#new-user-form",

    events: {
      "click .js-submit": "submitClicked",
      "click .js-resetuserpassword": "showResetPasswordForm",
      "click .js-deleteuser": "deleteUser"
    },

    onRender: function(){
// <option value="rpierich@hotmail.com" style="background-color: red; color: white;">  ADMIN - rpierich@hotmail.com</option>

      var that = this;

      $.ajax('/getusers' + "?dummyforie="+new Date().getTime().toString(), {
          type: 'GET',
          data: "",
          contentType: 'text/json',
          success: function(data) {
                    //if ( callback ) callback(true); 

                    //alert("successfully created user");
                    //$().style("display:block;")
                    that.$('#siteusers')
                          .find('option')
                          .remove()
                          .end();

                      for (var i = 0; i < data.length; i++)
                      { 
                        var stylestring = '';
                        if (data[i].customer == 'ADMIN')
                        {
                          stylestring = 'style="background-color: red; color: white;"'
                        } else
                        {
                          stylestring = ''
                        }
                        
                        that.$('#siteusers').append('<option value="'+data[i].email+'" '+stylestring+'>  '+data[i].customer+' - '+data[i].email+'</option>');
                          // .val('whatever');
                      }
                    // alert('New Got Usernames data == '+data[0].email);

                   },
          error  : function() { if ( callback ) callback(false); }
      });

    },

    deleteUser: function(e) {
      e.preventDefault();
//      alert("Delete User Not Implemented Yet.");

      var data = Backbone.Syphon.serialize(this);
if(confirm("Are you sure you want to delete user "+data.siteusers+"?"))
{
      $.ajax('/deleteuseraccount' + "?dummyforie="+new Date().getTime().toString(), {
          type: 'POST',
          data: JSON.stringify({ email: data.siteusers}),
          contentType: 'text/json',
          success: function() {
                    //if ( callback ) callback(true); 

                    //alert("successfully created user");
                    //$().style("display:block;")

                    FleetRepManager.trigger("user:new");
                    //alert('User Deleted!');

                   },
          error  : function() { if ( callback ) callback(false); }
      }); // end $.ajax
}
    },

    showResetPasswordForm: function(e) {
      e.preventDefault();
      var data = Backbone.Syphon.serialize(this);
      FleetRepManager.siteusers = data.siteusers;
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
                    FleetRepManager.trigger("user:new");

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
    }
  });
});
