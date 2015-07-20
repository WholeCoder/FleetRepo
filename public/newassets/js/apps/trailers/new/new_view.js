FleetRepManager.module("TrailersApp.New", function(New, VapeBookManager, Backbone, Marionette, $, _){
  New.Trailer = Marionette.ItemView.extend({
    title: "New Trailer",

    template: "#trailer-form",

    events: {
      "click .js-savetrailer": "saveClicked",
      "click .js-cancelsavetrailer": "cancelClicked"
    },

    cancelClicked: function(e) {
      e.preventDefault();
      /*var data = Backbone.Syphon.serialize(this);
      this.trigger("form:submit", data);*/
      FleetRepManager.trigger("trailers:list");
    },

    saveClicked: function(e){
      e.preventDefault();
      var data = Backbone.Syphon.serialize(this);
      //alert('save trailer submit button clicked! - Not implemented yet!');
      this.trigger("form:submit", data);

console.log('new trailer data == '+JSON.stringify(data));

      $.ajax('/savetrailer', {
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'text/json',
        success: function(data2) { 
/*          if (data2.email == data.email)
          {
*/            FleetRepManager.loadCharts();
            FleetRepManager.trigger("trailers:list");
            //FleetRepManager.trigger("trailers:new");
            FleetRepManager.trigger("user:new");
/*          } else
          {
            alert("Could not authenticate user - "+data2.email);
  */
/*          }
*/        },
        error  : function() { alert('Error - could not save the trailer');}
      }); // end $.post

    }
  });
});
