FleetRepManager.module("TrailersApp.Edit", function(Edit, VapeBookManager, Backbone, Marionette, $, _){
  Edit.Trailer = Marionette.ItemView.extend({
    title: "Edit Trailer",

    template: "#trailer-form",

    events: {
      "click .js-savetrailer": "saveClicked",
      "click .js-cancelsavetrailer": "cancelClicked"
    },

    onRender: function(){
      this.$('.js-datersnotified').datepicker({autoclose: true});
      this.$('.js-estimatedtimeofcompletion').datepicker({autoclose: true});
      this.$('.js-dateapproved').datepicker({autoclose: true});

      var availableTags = [
          "Dedicated Hershey",
          "OTR",
          "Intermodal"
          ];
      this.$( ".js-account" ).autocomplete({
        source: availableTags
      });


      var vehicleTypeTags = [
            "Dry Van",
            "Flat Bed",
            "Reefer Trailer",
            "Container Chassis",
            "Tractor/Condo",
            "Tractor/Daycab"
          ];
          this.$( ".js-vehicletype" ).autocomplete({
            source: vehicleTypeTags
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

console.log('update trailer data == '+JSON.stringify(this.model));
data._id = this.model.get('_id');
      $.ajax('/updatetrailer' + "?dummyforie="+new Date().getTime().toString(), {
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'text/json',
        success: function(data2) { 
console.log("successfully called /updatetrailer");
           FleetRepManager.trigger("trailers:list");
           FleetRepManager.trigger("user:new");
        },
        error  : function() { alert('Error - could not save the trailer');}
      }); // end $.post

    }
  });
});
