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
          "Dedicated: Other Than Hershey",
          "Dedicated Hershey",
          "Unknown",
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

          }); // end change


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
          }          

          //that.$("select#status1 option") .each(function() { this.selected = (this.text == that.model.get('status1')); });
          that.$('#status1').val(that.model.get('status1'));

          that.$('#status1').trigger('change');
          // initially set the other status to their current values
          that.$("#status2").val(that.model.get("#status2".substring(1)));
          that.$("#status3").val(that.model.get("#status3".substring(1)));


        } // end function makeOtherStatusInputBoxesUseOnlyThisPercentOption
        // "#status1" is the master status box
        makeOtherStatusInputBoxesUseOnlyThisPercentOption("#status1");

        // set the vehicletype
        //js-vehicletype
        this.$(".js-vehicletype").val(that.model.get("vehicletype"));

      var locationsTags = [
            "HERSHEY-EDC3 (PALMYRA PA)",
            "WEST HERSHEY - (HERSHEY PA)",
            "HERSHEY-Y & S CANDIES (Lancaster PA)",
            "HERSHEY-REESE'S (HERSHEY PA)",
            "AMERICOLD-MANCHESTER (MANCHESTER PA)",
            "CRESCENT (MECHANICSBURG PA)",
            "HERSHY-HAZLETON (HAZLETON PA)",
            "AMERICOLD-FOGLESVILLE (FOGELSVILLE PA)",
            "VANTAGE FOODS (CAMP HILL PA)",
            "WAKEFERN FOODS (BREINIGSVILLE PA)",
            "GEORGIA PACIFIC (QUAKERTOWN PA)",
            "KEYSTONE FOOD (EASTON PA)",
            "GEORGIA PACIFIC (EASTON PA)",
            "GEORGIA PACIFIC (MILFORD NJ 08332)",
            "WALMART DC (TOBYHANNA PA)",
            "SAM ADAMS (BREINIGSVILLE PA)",
            "CR ENGLAND DROP LOT (MECHANICSBURG PA)",
            "AMAZON HAZLETON (HAZLETON PA)",
            "UPS - ALLENTOWN (ALLENTOWN PA)",
            "UPS - HARRISBURG (HARRISBURG PA)",
            "UPS - STEELTON (STEELTON PA)",
            "UPS - SCRANTON (SCRANTON PA)",
            "SONOCO (RESESONIS PA)",
            "YRC (CARLISLE PA)",
            "PET SMART (BETHEL PA)",
            "FRS - (GRANTVILLE PA)"
          ];
          this.$( ".js-location" ).autocomplete({
            source: locationsTags
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
      if (data.status1 == null)
      {
        data.status1 = '';
      }
      if (data.status2 == null)
      {
        data.status2 = '';
      }
      if (data.status3 == null)
      {
        data.status3 = '';
      }

     if (data.status1.indexOf("100%") == 0)
     {
        var currentDateInMillisectonds = new Date().getTime()
        var timeInMillisecondsToAdd = 1000*60*60*24*5; // 5 days

        var dateWithAddedOffset = new Date(currentDateInMillisectonds + timeInMillisecondsToAdd);

        data.whentobearchived = dateWithAddedOffset;
     }

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
