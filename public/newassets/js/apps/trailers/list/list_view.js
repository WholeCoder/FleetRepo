FleetRepManager.module("TrailersApp.List", function(List, FleetRepManager, Backbone, Marionette, $, _){
  List.Layout = Marionette.LayoutView.extend({
    template: "#trailer-list-layout",

    regions: {
      //panelRegion: "#panel-region",
      trailersRegion: "#trailers-region"
    }
  });

  
  List.Trailer = Marionette.ItemView.extend({
    tagName: "tr",
    template: "#trailer-list-item",

    triggers: {
      "click td a.js-edit": "trailer:edit",
      "click button.js-delete": "trailer:delete"
    },

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

  var NoTrailersView = Marionette.ItemView.extend({
    template: "#trailer-list-none",
    tagName: "tr",
    className: "alert"
  });

  List.NoTrailersView = NoTrailersView;

  List.Trailers = Marionette.CompositeView.extend({
    tagName: "table",
    className: "tablesorter table table-striped table-bordered table-hover",
    template: "#trailer-list",
    emptyView: NoTrailersView,
    childView: List.Trailer,
    childViewContainer: "tbody",
    id: "myTable",

    disableLink: function(e){
      e.preventDefault();
      //alert('link clicked!');
    },

    events: {
      "click a": "disableLink"
    },

    initialize: function(){
/*      this.listenTo(this.collection, "reset", function(){
        this.attachHtml = function(collectionView, childView, index){
          collectionView.$el.append(childView.el);
        }
      });
*/
    },

    onRenderCollection: function(){
      this.attachHtml = function(collectionView, childView, index){
        collectionView.$el.prepend(childView.el);
      }
    }
  });
});
