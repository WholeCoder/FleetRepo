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
/*      "click td a.js-edit": "trailer:edit",
      "click button.js-delete": "trailer:delete"
*/    },

    events: {
      "click": "highlightName",
      "click td a.js-edit": "showEditTrailer",
      "click button.js-delete": "deleteTrailer"
    },

    showEditTrailer: function(e) {
      e.preventDefault();
      e.stopPropagation();
      alert("Edit Trailer not implemented yet!");
    },

    deleteTrailer: function(e) {
      e.preventDefault();
      e.stopPropagation();

if(confirm("Are you sure you want to delete this record? This row will be lost forever if deleted!"))
{
      $.ajax('/deletetrailer', {
        type: 'POST',
        data: JSON.stringify({_id:this.model.get('_id')}),
        contentType: 'text/json',
        success: function(data2) { 
/*          if (data2.email == data.email)
          {
*/            FleetRepManager.trigger("trailers:list");
            //FleetRepManager.trigger("trailers:new");
            FleetRepManager.trigger("user:new");
/*          } else
          {
            alert("Could not authenticate user - "+data2.email);
  */
/*          }
*/        },
        error  : function() { alert('Error - could not delete trailer row!');}
      }); // end $.post
} // end if      
      //alert("Delete trailer not implemented yet! - model's _id == "+this.model.get('_id'));
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
