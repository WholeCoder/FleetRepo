FleetRepManager.module("TrailersApp", function(TrailersApp, FleetRepManager, Backbone, Marionette, $, _){
  TrailersApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "trailers(/filter/criterion::criterion)": "listContacts",
      "trailers/:id": "showContact",
      "trailers/:id/edit": "editContact",
      "viewdocumentupload/:id/filetoobig" : "alertTooBigFile",
      "viewdocumentupload/:id/filesizeok" : "alertFileSizeOk"
    }
  });

  var API = {
    startLotWalkthrough: function() {
      // Sets the FleetRepmanager.lot_walkthrough_trailers
      TrailersApp.LotWalkthrough.Controller.listStartLotWalkthroughTrailers();
    },
    resumeLotWalkthrough: function() {
      // Uses the FleetRepmanager.lot_walkthrough_trailers got in call to startLotWAlkthrough
      TrailersApp.LotWalkthrough.Controller.resumeLotWalkthrough();
    },
    cancelLotWalkthrough: function() {
      // this destorys FleetRepManager.lot_walkthrough_trailers
      TrailersApp.LotWalkthrough.Controller.resumeLotWalkthrough();
    },

    alertFileSizeOk: function(id) {
      this.viewDocumentUpload(id);
    },
    alertTooBigFile: function(id) {
      this.viewDocumentUpload(id);
      alert("The file is too big.  It must be less than 100k!  Try reducing image quality.");
    },

    viewDocumentUpload: function(id) {
      //alert("viewDocumentUpload called id == "+id);
      $.ajax('/gettrailer' + "?dummyforie="+new Date().getTime().toString(), {
        type: 'POST',
        data: JSON.stringify({_id:id}),
        contentType: 'text/json',
        success: function(data2) { 
          var trailer = new FleetRepManager.Entities.Trailer(data2);
          var view = new FleetRepManager.TrailersApp.UploadDocuments.Trailer({model: trailer});

          view.on("form:submit", function(data){
              //VapeBookManager.trigger("show:createnewprofile");
          });

          FleetRepManager.regions.table.show(view);

          FleetRepManager.admin = true;
          FleetRepManager.showAdminLinks();
          FleetRepManager.loadCharts();
          //FleetRepManager.trigger("trailers:list");
          FleetRepManager.trigger("user:new");
        },
        error  : function() { alert('Error - could not get trailer row!');}
      }); // end $.post
    },

    loadDummyTrailerData: function() {

      $.ajax('/loaddummytrailerdata' + "?dummyforie="+new Date().getTime().toString(), {
        type: 'GET',
        data: "{}",
        contentType: 'text/json',
        success: function(data2) { 
            FleetRepManager.trigger("trailers:list");
            FleetRepManager.trigger("user:new");
            // refresh the charts in case there is new data
            FleetRepManager.loadCharts()

        },
        error  : function() { alert('Error - could not load dummy trailer data');}
      }); // end $.post

    },

    showNewTrailer: function() {
      console.log("showNewTrailer in controller called");
      TrailersApp.New.Controller.showNewTrailerForm();
    },

    showEditTrailer: function() {
      TrailersApp.Edit.Controller.showEditTrailerForm();
    },

    listContacts: function(criterion){
      //alert('listContacts called.');
        // refresh the charts in case there is new data
        TrailersApp.List.Controller.listContacts(criterion);
        FleetRepManager.loadCharts()
/*      FleetRepManager.execute("set:active:header", "contacts");
*/    },

    listTrailerArchives: function() {
        TrailersApp.ListArchive.Controller.listTrailerArchives();
    },

    listCustomerTrailerArchives: function() {
        TrailersApp.ListArchive.Controller.listCustomerTrailerArchives();
    },

    listTrailersOnlot: function() {
      //alert('called listTrailersOnlot');
      TrailersApp.OnLot.Controller.listOnLotTrailers();
    },
    
    listCustomerOnLotTrailer: function() {
      //alert('called listCustomerOnLotTrailer');
      TrailersApp.OnLot.Controller.listCustomerOnLotTrailers();
    },

    listCustomersContacts: function() {
        TrailersApp.List.Controller.listCustomerContacts();
        FleetRepManager.loadCharts()
        //FleetRepManager.hideAdminLinks();
    },

    showContact: function(id){
      alert('showContact called.');
      TrailersApp.OnLot.Controller.listCustomerOnLotTrailers();
/*      TrailersApp.Show.Controller.showContact(id);
      FleetRepManager.execute("set:active:header", "contacts");
*/    },

    editContact: function(id){
      alert('editContact called.');
      TrailersApp.OnLot.Controller.listOnLotTrailers();
/*      TrailersApp.Edit.Controller.editContact(id);
      FleetRepManager.execute("set:active:header", "contacts");
*/    }
  };

  FleetRepManager.on("lotwalkthrough:start", function() {
    API.startLotWalkthrough();
  });

  FleetRepManager.on("lotwalkthrough:resume", function() {
    API.resumeLotWalkthrough();
  });

  FleetRepManager.on("lotwalkthrough:cancel", function() {
    API.cancelLotWalkthrough();
  });

  FleetRepManager.on("trailers:new", function(){
    //FleetRepManager.navigate("contacts");
    API.showNewTrailer();
  });

  FleetRepManager.on("trailers:edit", function(){
    //FleetRepManager.navigate("contacts");
    API.showEditTrailer();
  });

  FleetRepManager.on("trailers:list", function(){
    //FleetRepManager.navigate("contacts");
    API.listContacts();
  });

  FleetRepManager.on("trailercustomerarchives:list", function(){
    //FleetRepManager.navigate("contacts");
    API.listCustomerTrailerArchives();
  });

  FleetRepManager.on("trailerarchives:list", function(){
    //FleetRepManager.navigate("contacts");
    API.listTrailerArchives();
  });

  FleetRepManager.on("trailercustomeronlot:list", function(){
    //FleetRepManager.navigate("contacts");
    API.listCustomerOnLotTrailer();
  });

  FleetRepManager.on("trailersonlot:list", function(){
    //FleetRepManager.navigate("contacts");
    API.listTrailersOnlot();
  });

  FleetRepManager.on("trailerscustomer:list", function(){
    //FleetRepManager.navigate("contacts");
    API.listCustomersContacts();
  });

  FleetRepManager.on("trailers:filter", function(criterion){
/*    if(criterion){
      FleetRepManager.navigate("contacts/filter/criterion:" + criterion);
    }
    else{
      FleetRepManager.navigate("contacts");
    }
*/
  });

  FleetRepManager.on("trailer:show", function(id){
/*    FleetRepManager.navigate("contacts/" + id);
    API.showContact(id);
*/
  });

  FleetRepManager.on("trailer:edit", function(id){
/*    FleetRepManager.navigate("contacts/" + id + "/edit");
    API.editContact(id);
*/
  });

  TrailersApp.on("start", function(){
    new TrailersApp.Router({
      controller: API
    });
  });
});
