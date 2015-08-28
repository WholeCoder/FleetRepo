FleetRepManager.module("UserApp.List", function(List, FleetRepManager, Backbone, Marionette, $, _){
/*  List.Layout = Marionette.LayoutView.extend({
    template: "#trailer-list-layout",

    regions: {
      //panelRegion: "#panel-region",
      trailersRegion: "#trailers-region"
    }
  });

*/  
  List.User = Marionette.ItemView.extend({
    tagName: "tr",
    template: "#user-list-item",

    triggers: {
/*      "click td a.js-edit": "trailer:edit",
      "click button.js-delete": "trailer:delete"
*/    },

    events: {
      "click": "highlightName",
/*      "click td a.js-edit": "showEditTrailer",
*/      "click button.js-delete": "deleteUser",
      "click .js-sendemailoncompleted": "setSendEmailOnCompleted",
      "click .js-senddailyemail": "setSendDailyEmail",
      "click .js-resetpassword" : "showResetPassword"

/*,
      "click td a.js-uploaddocuments": "showUploadDocuments"*/
    },

    showResetPassword: function(e) {
      FleetRepManager.siteusers = this.model.get("username");
      e.preventDefault();
      FleetRepManager.trigger("show:resetpassword");
    },

    setSendEmailOnCompleted: function(e) {
      var isItChecked = this.$(".js-sendemailoncompleted").is(':checked');
      var username = this.model.get("username");

      if (username.indexOf("@")>0)
      {
        // username is an email
      } else
      {
        // username is not an email!
        alert("Sorry, this username is not an email so we can not send it mail!");
        this.$(".js-sendemailoncompleted").prop('checked', false);
      }
      //alert("clicked on sendemailoncompled checked == "+this.$(".js-sendemailoncompleted").is(':checked'));
    },

    setSendDailyEmail: function(e) {
      var isItChecked = this.$(".js-senddailyemail").is(':checked');
      var username = this.model.get("username");

      if (username.indexOf("@")>0)
      {
        // username is an email
      } else
      {
        // username is not an email!
        alert("Sorry, this username is not an email so we can not send it mail!");
        this.$(".js-senddailyemail").prop('checked', false);
      }
    },

    deleteUser: function(e) {
      e.preventDefault();
      e.stopPropagation();

if(confirm("Are you sure you want to delete this user? This row will be lost forever if deleted!"))
{
      $.ajax('/deleteuser' + "?dummyforie="+new Date().getTime().toString(), {
        type: 'POST',
        data: JSON.stringify({_id:this.model.get('_id')}),
        contentType: 'text/json',
        success: function(data2) { 
          FleetRepManager.trigger("user:listusers");
        },
        error  : function() { alert('Error - could not delete user row!');}
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

  var NoUsersView = Marionette.ItemView.extend({
    template: "#user-list-none",
    tagName: "tr",
    className: "alert"
  });

  List.NoUsersView = NoUsersView;

  List.Users = Marionette.CompositeView.extend({
    tagName: "table",
    className: "tablesorter table table-striped table-bordered table-hover",
    template: "#user-list",
    emptyView: NoUsersView,
    childView: List.User,
    childViewContainer: "tbody",
    id: "myUserTable",

    disableLink: function(e){
      e.preventDefault();
      //alert('link clicked!');
    },

    events: {
      "click a": "disableLink"/*,
      
      "change .js-unitnumbersortbox": "clickedSortBox",
      "change .js-customersort": "clickedSortBox",
      "change .js-accountsortbox": "clickedSortBox",
      "change .js-vehicletypesortbox": "clickedSortBox",
      "change .js-locationsortbox": "clickedSortBox",
      "change .js-datersnotifiedsortbox": "clickedSortBox",
      "change .js-dateapprovedsortbox": "clickedSortBox",
      "change .js-estimatedtimeofcompletesortbox": "clickedSortBox",
      "change .js-statussortbox": "clickedSortBox",

      "click th.js-resetsort" : "clickedSortLinkSoReset"*/
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
