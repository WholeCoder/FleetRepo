var FleetRepManager = new Marionette.Application();

FleetRepManager.navigate = function(route,  options){
  options || (options = {});
  Backbone.history.navigate(route, options);
};

FleetRepManager.getCurrentRoute = function(){
  return Backbone.history.fragment
};

FleetRepManager.on("before:start", function(){
  var RegionContainer = Marionette.LayoutView.extend({
    el: "#app-container",

    regions: {
      table: "#table-region",
      userRegion: "#user-admin-region",
      lotWalkthroughRegion: "#lot-walkthrough-region"
    }
  });

  FleetRepManager.regions = new RegionContainer();
/*  FleetRepManager.regions.dialog.onShow = function(view){
    var self = this;
    var closeDialog = function(){
      self.stopListening();
      self.empty();
      self.$el.dialog("destroy");
    };

    this.listenTo(view, "dialog:close", closeDialog);

    this.$el.dialog({
      modal: true,
      title: view.title,
      width: "auto",
      close: function(e, ui){
        closeDialog();
      }
    });
  };*/
});

FleetRepManager.on("start", function(){
  if(Backbone.history){
    Backbone.history.start();

    if(this.getCurrentRoute() === ""){
      //FleetRepManager.trigger("trailers:list");
      //FleetRepManager.trigger("trailercustomerarchives:list");
      FleetRepManager.trigger("show:login");
      //FleetRepManager.trigger("user:new");
    }
  }
});
