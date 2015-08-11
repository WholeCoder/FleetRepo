FleetRepManager.module("TrailersApp.OnLot", function(OnLot, FleetRepManager, Backbone, Marionette, $, _){

  OnLot.Layout = Marionette.LayoutView.extend({
    template: "#trailer-list-layout",

    regions: {
      //panelRegion: "#panel-region",
      trailersRegion: "#trailers-region"
    }
  });


  OnLot.CustomerOnLotTrailer = Marionette.ItemView.extend({
    tagName: "tr",
    template: "#trailer-onlot-list-item",

    triggers: {
/*      "click td a.js-edit": "trailer:edit",
      "click button.js-delete": "trailer:delete"
*/    },

    events: {
      /*"click": "highlightName"*/
    }
  });


  var NoTrailersView = Marionette.ItemView.extend({
    template: "#trailer-list-none",
    tagName: "tr",
    className: "alert"
  });

  OnLot.NoTrailersView = NoTrailersView;

  
  OnLot.CustomerOnLotTrailers = Marionette.CompositeView.extend({
    tagName: "table",
    className: "tablesorter table table-striped table-bordered table-hover",
    template: "#trailer-onlot-list",
    emptyView: NoTrailersView,
    childView: OnLot.CustomerOnLotTrailer,
    childViewContainer: "tbody",
    id: "myTable",

    disableLink: function(e){
      e.preventDefault();
      //alert('link clicked!');
    },

    events: {
      "click a": "disableLink",
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





  OnLot.OnLotTrailer = Marionette.ItemView.extend({
    tagName: "tr",
    template: "#trailer-onlot-list-item",

    triggers: {
/*      "click td a.js-edit": "trailer:edit",
      "click button.js-delete": "trailer:delete"
*/    },

    events: {
      "click": "highlightName"
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


OnLot.OnLotTrailers = Marionette.CompositeView.extend({
    tagName: "table",
    className: "tablesorter table table-striped table-bordered table-hover",
    template: "#trailer-onlot-list",
    emptyView: NoTrailersView,
    childView: OnLot.OnLotTrailer,
    childViewContainer: "tbody",
    id: "myTable",

    disableLink: function(e){
      e.preventDefault();
      //alert('link clicked!');
    },

    events: {
      "click a": "disableLink",
      
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





