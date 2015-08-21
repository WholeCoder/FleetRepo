FleetRepManager.module("TrailersApp.UploadDocuments", function(UploadDocuments, VapeBookManager, Backbone, Marionette, $, _){
  UploadDocuments.Trailer = Marionette.ItemView.extend({
    title: "Upload Documents for Unit",

    template: "#admin-upload-supporting-documents-form",

    events: {
/*      "click .js-savetrailer": "saveClicked",
*/      "click .js-doneuploadingdocuments": "doneUploading"

    },    

    doneUploading: function() {
      FleetRepManager.trigger("trailers:list");
    },


    onRender: function(){
      var that = this;

      $.ajax('/gettrailerdocuments' + "?dummyforie="+new Date().getTime().toString(), {
        type: 'POST',
        data: JSON.stringify({_id:this.model.get('_id')}), // trailer/unit id
        contentType: 'text/json',
        success: function(data2) { 
          console.log("/gettrailerdocuments called");
          for (var i = 0; i < data2.length; i++)
          {
            console.log("     name == "+data2[i].name);
            console.log("     contents (should be undefined) == "+data2[i].contents);
            console.log("\n\n");
            that.$(".js-currentfiles").append('<br /><a href="/get/'+data2[i]._id+'" class="js-getfile">'+data2[i].name+'</a>');
            that.$(".js-getfile").on( "click", function(event) {
              //alert("searchInput == "+encodeURIComponent($("#searchInput").val()));
              event.preventDefault();
              var hrf = $(this).attr('href');
              var id = hrf.substring(5);
//              alert("clicked js-getfile   id == "+id);



              $.ajax('/getnameoftrailerdocument' + "?dummyforie="+new Date().getTime().toString(), {
                type: 'POST',
                data: JSON.stringify({_id:id}), // document id
                contentType: 'text/json',
                success: function(data2) { 

                  // alert('name of trailer document is = '+data2.filename);
                  $(location).attr('href','/get/'+data2.tokenpath+"/"+data2.filename+ "?dummyforie="+new Date().getTime().toString());
                },
                error  : function() { alert('Error - could not get trailer row!');}
              }); // end $.post








              //$(location).attr('href','/FleetRepairSolutionsOnLotPortalData.xlsx' + "?dummyforie="+new Date().getTime().toString()+"&searchTerm="+encodeURIComponent($("#searchInput").val()));

              //alert("exported to exel!");
            }); // end js-getfile handler

          }
        },
        error  : function() { alert('Error - could not get trailer row!');}
      }); // end $.post
    },

    saveClicked: function(e){
     
    }
  });
});
