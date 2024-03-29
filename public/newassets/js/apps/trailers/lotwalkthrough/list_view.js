FleetRepManager.module("TrailersApp.LotWalkthrough", function(LotWalkthrough, FleetRepManager, Backbone, Marionette, $, _){

  LotWalkthrough.Layout = Marionette.LayoutView.extend({
    template: "#trailer-list-layout",

    regions: {
      //panelRegion: "#panel-region",
      trailersRegion: "#trailers-region"
    }
  });

  var NoTrailersView = Marionette.ItemView.extend({
    template: "#trailer-list-none",
    tagName: "tr",
    className: "alert"
  });

  LotWalkthrough.NoTrailersView = NoTrailersView;

  LotWalkthrough.LotWalkthroughTrailer = Marionette.ItemView.extend({
    tagName: "tr",
    template: "#lotwalkthrough-list-item",
    className: function() {
      var cName = "";
      if (this.model.get("updatedalready") == true)
      {
        cName = "info";
      } else
      {
        cName = "danger";
      }
      return cName;
    },

    triggers: {
/*      "click td a.js-edit": "trailer:edit",
      "click button.js-delete": "trailer:delete"
*/    },

    events: {
      "click": "highlightName",
      "click .js-notfound" : "editUnit",
      "click .js-notfoundeditlink" : "editUnit",
      "click" : "editUnit"
    },

    onRender: function() {
      if (this.model.get("updatedalready") == true)
      {
        this.$('.js-notfound').text("Found");

        this.$('.js-notfound').removeClass("btn-danger");
        this.$('.js-notfound').addClass("blue-button-style");
      } else
      {
        this.$('.js-notfound').text("Not Found");

        this.$('.js-notfound').removeClass("blue-button-style");
        this.$('.js-notfound').addClass("btn-danger");
      }

    },

    editUnit: function(e)
    {
      e.preventDefault();

      //var trailer = new FleetRepManager.Entities.Trailer(data2);
      // this.className = 'info';
      var view = new FleetRepManager.TrailersApp.LotWalkthrough.Trailer({model: this.model});

      view.on("form:submit", function(data){
          //VapeBookManager.trigger("show:createnewprofile");
      });

      FleetRepManager.regions.table.show(view);
    },

    flash: function(cssClass){
      var $view = this.$el;
      $view.hide().toggleClass(cssClass).fadeIn(800, function(){
        setTimeout(function(){
          $view.toggleClass(cssClass)
        }, 500);
      });
    },

    highlightName: function(e){
      this.$el.toggleClass("warning");
    },

    remove: function(){
      var self = this;
      this.$el.fadeOut(function(){
        Marionette.ItemView.prototype.remove.call(self);
      });
    }
  });


LotWalkthrough.LotWalkthroughTrailers = Marionette.CompositeView.extend({
    tagName: "table",
    className: "tablesorter table table-striped table-bordered table-hover",
    template: "#lotwalkthrough-list",
    emptyView: NoTrailersView,
    childView: LotWalkthrough.LotWalkthroughTrailer,
    childViewContainer: "tbody",
    id: "myTable",

    disableLink: function(e){
      e.preventDefault();
      //alert('link clicked!');
    },

    events: {
      "click a": "disableLink",
      "click .js-submit": "commitAndSaveAllChanges",
      "click .js-addnewtrailer": "addANewTrailer",
      
      "change .js-unitnumbersortbox": "clickedSortBox",
      "change .js-customersort": "clickedSortBox",
      "change .js-accountsortbox": "clickedSortBox",
      "change .js-vehicletypesortbox": "clickedSortBox",
      "change .js-locationsortbox": "clickedSortBox",
      "change .js-datersnotifiedsortbox": "clickedSortBox",
      "change .js-dateapprovedsortbox": "clickedSortBox",
      "change .js-estimatedtimeofcompletesortbox": "clickedSortBox",
      "change .js-statussortbox": "clickedSortBox",

      "click th.js-resetsort" : "clickedSortLinkSoReset"
    },

    addANewTrailer: function(event) {
      event.preventDefault();
      FleetRepManager.trigger("newtraileronlotwalkthrough:new");
    },

    commitAndSaveAllChanges: function(event) {
      event.preventDefault();
      console.log('\n\n saving these trailers == '+JSON.stringify(FleetRepManager.lot_walkthrough_trailers.models));

      var allUpdated = true;
      for (var i = 0; i < FleetRepManager.lot_walkthrough_trailers.models.length; i++)
      {
        if (!FleetRepManager.lot_walkthrough_trailers.models[i].attributes.updatedalready)
        {
          allUpdated = false;
          break;
        }
      }

      var shouldUpdate = true;
      if (!allUpdated)
      {
        shouldUpdate = confirm("Some trailers were missing and not updated.  Are you sure you would like to save this walkthrough?");
      } else
      {
        shouldUpdate = confirm("Are you sure you would like to save this walkthrough?");        
      }

      if (shouldUpdate)
      {
        $.ajax('/updateonlottrailers' + "?dummyforie="+new Date().getTime().toString(), {
          type: 'POST',
          data: JSON.stringify(FleetRepManager.lot_walkthrough_trailers.models),
          contentType: 'text/json',
          success: function(data2) { 
  
  console.log("/updateonlottrailers      trailers == "+JSON.stringify(FleetRepManager.lot_walkthrough_trailers.models));

            $.ajax('/savelotwalkthrough' + "?dummyforie="+new Date().getTime().toString(), {
              type: 'POST',
              data: JSON.stringify(FleetRepManager.lot_walkthrough_trailers.models),
              contentType: 'text/json',
              success: function(data3) { 
      console.log("successfully called /savelotwalkthrough");
                FleetRepManager.showAdminLinks();
                FleetRepManager.loadCharts();
                FleetRepManager.trigger("trailers:list");
                FleetRepManager.trigger("lotwalkthroughsnapshopinstances:view");
                 //FleetRepManager.trigger("user:new");
              },
              error  : function() { alert('Error - could not save the /savelotwalkthrough');}
            }); // end $.post

          },
          error  : function() { alert('Error - could not save the /updateonlottrailers');}
        }); // end $.post
      } // end shouldUpdate

    },

    clickedSortLinkSoReset: function(event) {

      for (var pr in this.sortClassObject) // contains all class names
      {
          this.sortRay = [[]];
          this.nextSortColumn = 1;
          this.colsAlreadySorted = [];

          this.$("."+pr).find('option')
                        .remove()
                        .end();
          //alert("appending sel with class == ."+pr+" equal to "+this.nextSortColumn);
          this.$("."+pr).append('<option value="" selected></option>');
          this.$("."+pr).append('<option value="'+1+'">'+1+'</option>');
      }
    },

    clickedSortBox: function(event) {
      event.preventDefault();

      

      var currentSelectedClass = $(event.target).attr('class');

      $(event.target).find('option')
                    .remove()
                    .end();

      $(event.target).append('<option value="'+this.nextSortColumn+'">'+this.nextSortColumn+'</option>');
      this.nextSortColumn++;


      this.sortRay[0].push([this.sortClassObject[currentSelectedClass],0]);
      this.colsAlreadySorted.push(currentSelectedClass);
//alert("class found == "+currentSelectedClass);
      console.log("\n\n --- found list -----");
      for (var pr in this.sortClassObject) // contains all class names
      {
        var found = false;
        for (var i = 0;i < this.colsAlreadySorted.length; i++) // ones that were already sorted
        {
          var curr = this.colsAlreadySorted[i];
          console.log("       seeing if "+pr +"  ==  "+curr);
          if (pr == curr)
          {
            found = true;
            break;
          }
        }

        if (!found)
        {
          console.log("   did not find - "+pr);
          this.$("."+pr).find('option')
                        .remove()
                        .end();
          //alert("appending sel with class == ."+pr+" equal to "+this.nextSortColumn);
          this.$("."+pr).append('<option value="" selected></option>');
          this.$("."+pr).append('<option value="'+this.nextSortColumn+'">'+this.nextSortColumn+'</option>');
        }
      }


      $("#myTable").trigger("sorton",this.sortRay);
      //alert("js-unitnumbersortbox changed! sort array == "+this.sortRay);
    },

    initialize: function(){
/*      this.listenTo(this.collection, "reset", function(){
        this.attachHtml = function(collectionView, childView, index){
          collectionView.$el.append(childView.el);
        }
      });
*/
      this.sortRay = [[]];
      this.nextSortColumn = 1;
      this.colsAlreadySorted = [];

      this.sortClassObject = {};
        this.sortClassObject["js-unitnumbersortbox"] = 0;
        this.sortClassObject["js-customersort"] = 1;
        this.sortClassObject["js-accountsortbox"] = 2;
        this.sortClassObject["js-vehicletypesortbox"] = 3;
        this.sortClassObject["js-locationsortbox"] = 4;
        this.sortClassObject["js-datersnotifiedsortbox"] = 5;
        this.sortClassObject["js-dateapprovedsortbox"] = 6;
        this.sortClassObject["js-estimatedtimeofcompletesortbox"] = 7;
        this.sortClassObject["js-statussortbox"] = 8;
    },

    onRenderCollection: function(){
      this.attachHtml = function(collectionView, childView, index){
        collectionView.$el.prepend(childView.el);
      }
    }
  });

});





