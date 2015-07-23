FleetRepManager.module("TrailersApp.New", function(New, VapeBookManager, Backbone, Marionette, $, _){
  New.Trailer = Marionette.ItemView.extend({
    title: "New Trailer",

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

        var that = this;

        // statusid parameter = #statusN - N is the number 1,2, or 3
        function makeOtherStatusInputBoxesUseOnlyThisPercentOption(statusid)
        {
          var slaveStatus1 = "";
          var slaveStatus2 = "";
          if(statusid == "#status1")
          {
            var slaveStatus1 = "#status2";
            var slaveStatus2 = "#status3";
          } else if(statusid == "#status2")
          {
            var slaveStatus1 = "#status1";
            var slaveStatus2 = "#status3";
          } else if(statusid == "#status3")
          {
            var slaveStatus1 = "#status1";
            var slaveStatus2 = "#status2";
          }
          that.$( statusid ).change(function() {
            var data1 = FleetRepManager.statuses;
            var lightFileName = FleetRepManager.getLightImage(that.$( statusid ).val()).substring(2);
            console.log(statusid+" == "+that.$( statusid ).val());
            console.log("lightFileName == "+lightFileName);
            
            var status2Image = FleetRepManager.getLightImage(that.$( slaveStatus1 ).val()).substring(2);
            var status3Image = FleetRepManager.getLightImage(that.$( slaveStatus2 ).val()).substring(2);

            if(status2Image != lightFileName)
            {
              that.$(slaveStatus1)
                    .find('option')
                    .remove()
                    .end();

              that.$(slaveStatus1).append('<option value=""></option>');
            }

            if(status3Image != lightFileName)
            {
              that.$(slaveStatus2)
                    .find('option')
                    .remove()
                    .end();
  
              that.$(slaveStatus2).append('<option value=""></option>');
            }

  
            for (var i = 0; i < data1.length; i++)
            { 
              //that.$('#status1').append('<option value="'+data[i][0]+'" '+'>  '+data[i][0]+'</option>');
              if (data1[i][1] == lightFileName)
              {              
                if(status2Image != lightFileName)
                {
                  that.$(slaveStatus1).append('<option value="'+data1[i][0]+'" '+'>  '+data1[i][0]+'</option>');
                }
                if(status3Image != lightFileName)
                {
                  that.$(slaveStatus2).append('<option value="'+data1[i][0]+'" '+'>  '+data1[i][0]+'</option>');
                }
              } // end if
            } // end for         

          });
/*
          that.$('#status1')
                .find('option')
                .remove()
                .end();
*/

          var data = FleetRepManager.statuses;
          for (var i = 0; i < data.length; i++)
          { 
            that.$('#status1').append('<option value="'+data[i][0]+'" '+'>  '+data[i][0]+'</option>');
            that.$('#status2').append('<option value="'+data[i][0]+'" '+'>  '+data[i][0]+'</option>');
            that.$('#status3').append('<option value="'+data[i][0]+'" '+'>  '+data[i][0]+'</option>');
              // .val('whatever');
          }          

        } // end function

        makeOtherStatusInputBoxesUseOnlyThisPercentOption("#status1");
        makeOtherStatusInputBoxesUseOnlyThisPercentOption("#status2");
        makeOtherStatusInputBoxesUseOnlyThisPercentOption("#status3");

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

      $.ajax('/savetrailer' + "?dummyforie="+new Date().getTime().toString(), {
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'text/json',
        success: function(data2) { 
/*          if (data2.email == data.email)
          {
*/          FleetRepManager.trigger("trailers:list");
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
