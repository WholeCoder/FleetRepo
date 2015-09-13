FleetRepManager.module("TrailersApp.LotWalkthrough", function(LotWalkthrough, VapeBookManager, Backbone, Marionette, $, _) {

    LotWalkthrough.LotWalkthroughViewTrailer = Marionette.ItemView.extend({
        tagName: "tr",
        template: "#view-lotwalkthrough-list-item",
        className: function() {
            var cName = "";
            if (this.model.get("updatedalready") == true) {
                cName = "info";
            } else {
                cName = "danger";
            }
            return cName;
        },

        triggers: {
            /*      "click td a.js-edit": "trailer:edit",
                  "click button.js-delete": "trailer:delete"
            */
        },

        events: {
            "click": "highlightName",
            "click .js-viewnote" : "viewNote"
        },

        viewNote: function(e) {
          e.preventDefault();
          alert('Show the note here!');
        },

        onRender: function() {
            if (this.model.get("updatedalready") == true) {
                this.$('.js-notfound').text("Found");

                this.$('.js-notfound').removeClass("btn-danger");
                this.$('.js-notfound').addClass("blue-button-style");
            } else {
                this.$('.js-notfound').text("Not Found");

                this.$('.js-notfound').removeClass("blue-button-style");
                this.$('.js-notfound').addClass("btn-danger");
            }

        },

        flash: function(cssClass) {
            var $view = this.$el;
            $view.hide().toggleClass(cssClass).fadeIn(800, function() {
                setTimeout(function() {
                    $view.toggleClass(cssClass)
                }, 500);
            });
        },

        highlightName: function(e) {
            this.$el.toggleClass("warning");
        },

        remove: function() {
            var self = this;
            this.$el.fadeOut(function() {
                Marionette.ItemView.prototype.remove.call(self);
            });
        }
    });


    LotWalkthrough.LotWalkthroughViewTrailers = Marionette.CompositeView.extend({
        tagName: "table",
        className: "tablesorter table table-striped table-bordered table-hover",
        template: "#view-lotwalkthrough-list",
        emptyView: LotWalkthrough.NoTrailersView,
        childView: LotWalkthrough.LotWalkthroughViewTrailer,
        childViewContainer: "tbody",
        id: "myWalkthroughViewTable",

        disableLink: function(e) {
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
            "change .js-foundsortbox": "clickedSortBox",
            "change .js-notesortbox": "clickedSortBox",

            "click th.js-resetsort" : "clickedSortLinkSoReset"
        },
        
        clickedSortLinkSoReset: function(event) {
          $("#myWalkthroughViewTable").tablesorter(/*{sortList: [[10,1]]}*/);

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

            $(event.target).append('<option value="' + this.nextSortColumn + '">' + this.nextSortColumn + '</option>');
            this.nextSortColumn++;


            this.sortRay[0].push([this.sortClassObject[currentSelectedClass], 0]);
            this.colsAlreadySorted.push(currentSelectedClass);
            //alert("class found == "+currentSelectedClass);
            console.log("\n\n --- found list -----");
            for (var pr in this.sortClassObject) // contains all class names
            {
                var found = false;
                for (var i = 0; i < this.colsAlreadySorted.length; i++) // ones that were already sorted
                {
                    var curr = this.colsAlreadySorted[i];
                    console.log("       seeing if " + pr + "  ==  " + curr);
                    if (pr == curr) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    console.log("   did not find - " + pr);
                    this.$("." + pr).find('option')
                        .remove()
                        .end();
                    //alert("appending sel with class == ."+pr+" equal to "+this.nextSortColumn);
                    this.$("." + pr).append('<option value="" selected></option>');
                    this.$("." + pr).append('<option value="' + this.nextSortColumn + '">' + this.nextSortColumn + '</option>');
                }
            }


            $("#myWalkthroughViewTable").trigger("sorton", this.sortRay);
            //alert("js-unitnumbersortbox changed! sort array == "+this.sortRay);
        },

        initialize: function() {
            /*      this.listenTo(this.collection, "reset", function(){
                    this.attachHtml = function(collectionView, childView, index){
                      collectionView.$el.append(childView.el);
                    }
                  });
            */
            this.sortRay = [
                []
            ];
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
            this.sortClassObject["js-notesortbox"] = 10;
            this.sortClassObject["js-foundsortbox"] = 11;
        },

        onRenderCollection: function() {
            this.attachHtml = function(collectionView, childView, index) {
                collectionView.$el.prepend(childView.el);
            }
        }
    });




    LotWalkthrough.LotWalkthroughInstance = Marionette.ItemView.extend({
        title: "View All Days There Exist Walthroughs",

        template: "#admin-list-trailer-walkthroughs",

        events: {
            /*      "click .js-savetrailer": "saveClicked",
                  "click .js-doneuploadingdocuments": "doneUploading"*/

        },

        /*    doneUploading: function() {
              FleetRepManager.trigger("trailers:list");
            },
        */

        onRender: function() {
            var that = this;

            $.ajax('/getlotwalkthroughinstances' + "?dummyforie=" + new Date().getTime().toString(), {
                type: 'GET',
                data: JSON.stringify({}), // trailer/unit id
                contentType: 'text/json',
                success: function(data2) {
                    console.log("/getlotwalkthroughinstances called");

                    for (var i = 0; i < data2.length; i++) {
                        that.$(".js-dailywalkthroughs").append('<br /><a href="/get/' + data2[i]._id + '" class="js-gettrailerlistforawalkthrough">' + new Date(data2[i].dateoflotwalkthrough).toLocaleDateString() + '</a>');
                        
                        var lwalkthroughdate = new Date(data2[i].dateoflotwalkthrough);
                        that.$(".js-gettrailerlistforawalkthrough").on("click", function(event) {
                            //alert("searchInput == "+encodeURIComponent($("#searchInput").val()));
                            event.preventDefault();
                            var hrf = $(this).attr('href');
                            var id = hrf.substring(5);
                            //              alert("clicked js-getfile   id == "+id);
                            FleetRepManager.setViewWalthroughDate(lwalkthroughdate);


                            $.ajax('/getdailywalkthroughtrailers' + "?dummyforie=" + new Date().getTime().toString(), {
                                type: 'POST',
                                data: JSON.stringify({
                                    _id: id
                                }), // document id
                                contentType: 'text/json',
                                success: function(data3) {
                                    //alert('TODO:  display lot walkthroughs now');
                                    // alert('name of trailer document is = '+data2.filename);
                                    // $(location).attr('href','/get/'+data2.tokenpath+"/"+data2.filename+ "?dummyforie="+new Date().getTime().toString());
                                    console.log("/getdailywalkthroughtrailers returned trailers == " + JSON.stringify(data3));
                                    var trailersListLayout = new LotWalkthrough.Layout();
                                    var contactsListView = new LotWalkthrough.LotWalkthroughViewTrailers({
                                        collection: new FleetRepManager.TrailersOnlotCollection(data3)
                                    });

                                    trailersListLayout.on("show", function() {
                                        trailersListLayout.trailersRegion.show(contactsListView);

                                    });

                                    FleetRepManager.regions.lotWalkthroughRegion.show(trailersListLayout);

                                },
                                error: function() {
                                    alert('Error - could not get /getdailywalkthroughtrailers!');
                                }
                            }); // end $.post




                            //$(location).attr('href','/FleetRepairSolutionsOnLotPortalData.xlsx' + "?dummyforie="+new Date().getTime().toString()+"&searchTerm="+encodeURIComponent($("#searchInput").val()));

                            //alert("exported to exel!");
                        }); // end js-getfile handler

                    }
                },
                error: function() {
                    alert('Error - could not get /getlotwalkthroughinstances!');
                }
            }); // end $.post
        },

        saveClicked: function(e) {

        }
    });

});