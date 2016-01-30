module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ["dist"],

    nodemon: {
      dev: {
        script: 'index.js'
      }
    },

    copy: {
      main: {
        files: [
          // includes files within path and its sub-directories 
          {expand: true, src: ['**',  
                               '!**/node_modules/**',  
                               '!**/documentsforreading/**',  
                               '!**/uploads/**',
                               '!**/public/newassets/js/apps/**',
                               '!**/public/newassets/js/entities/**',
                               '!**/public/newassets/js/app.js'
                               ], dest: 'dist/'}/*,
     
          // makes all src relative to cwd 
          {expand: true, cwd: 'path/', src: ['**'], dest: 'dest/'},
     
          // flattens results to a single level 
          {expand: true, flatten: true, src: ['path/**'], dest: 'dest/', filter: 'isFile'},*/
        ],
      },
    },

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['public/newassets/**/*.js',
              '!**/public/newassets/js/vendor/**'],
        dest: 'dist/<%= pkg.name %>_newassest_javascript.js'
      },
      distVendor: {
        /* **WARKING**  BE SURE TO ADD THE JAVASCRIPT FILES TO THIS THAT ARE IN THE INDEX.HTML FILE!!! */
        src: ['public/newassets/js/vendor/jquery.js',
              'public/newassets/js/vendor/jquery-ui-1.10.3.js',
              'public/newassets/js/vendor/json2.js',
              'public/newassets/js/vendor/underscore.js',
              'public/newassets/js/vendor/backbone.js',
              'public/newassets/js/vendor/backbone.picky.js',
              'public/newassets/js/vendor/backbone.syphon.js',
              'public/newassets/js/vendor/backbone.marionette.js',
              'public/newassets/js/vendor/spin.js',
              'public/newassets/js/vendor/spin.jquery.js',
              'public/newassets/js/vendor/jquery.tablesorter.combined.js',
              'public/newassets/js/vendor/datepicker/js/bootstrap-datepicker.js',
              'public/newassets/js/vendor/datepicker/locales/bootstrap-datepicker.el.min.js'
              ],
        dest: 'dist/<%= pkg.name %>_vendor_javascript.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/public/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      },
      distVendor: {
        files: {
          'dist/public/<%= pkg.name %>_vendor.min.js': ['<%= concat.distVendor.dest %>']
        }
      }
    }
  });

  grunt.registerTask('replaceindexhtmlwithminedscripttag', function(){
    var file = grunt.file.read('index.html');
    var fileRay = file.split('\n');
    var outputTemplate = '';
    var foundStartTemplateMarker = false;
    var foundEndTemplateMarket = false;
    var concatenatedMinifiedFileScriptTagAlready = false;

    var foundVendorStartTemplateMarker = false;
    var foundVendorEndTemplateMarket = false;
    var concatenatedMinifiedVendorFileScriptTagAlready = false;

    for (var i = 0; i < fileRay.length; i++)
    {

      // This is for the vendor insert code.
      if(fileRay[i].indexOf('<!-- ReplaceTheseWithMinVersionForVendor-Start -->') >= 0)
      {
        console.log('!!!!!!!!!!!!!!! STARTING TO REPLACE VENDOR MIN');
        foundVendorStartTemplateMarker = true;
      }
      if(fileRay[i].indexOf('<!-- ReplaceTheseWithMinVersionForVendor-End -->') >= 0)
      {
        console.log('!!!!!!!!!!!!!!!!!!!ENDING REPLACE VENDOR NIM');
        foundVendorEndTemplateMarket = true;
      }

      if (foundVendorStartTemplateMarker && !foundVendorEndTemplateMarket && !concatenatedMinifiedVendorFileScriptTagAlready)
      {
        console.log('inserting FleetRepo_vendor.min.js-------------------');
        outputTemplate += '<script src="./FleetRepo_vendor.min.js"></script>';  
        concatenatedMinifiedVendorFileScriptTagAlready = true;
      } else if (foundVendorStartTemplateMarker == foundVendorEndTemplateMarket)
      {
        if(fileRay[i].indexOf('<!-- ReplaceTheseWthMinVersion-Start -->') >= 0)
        {
          foundStartTemplateMarker = true;
        }
        if(fileRay[i].indexOf('<!-- ReplaceTheseWthMinVersion-End -->') >= 0)
        {
          foundEndTemplateMarket = true;
        }

        if (foundStartTemplateMarker && !foundEndTemplateMarket && !concatenatedMinifiedFileScriptTagAlready)
        {
          outputTemplate += '<script src="./FleetRepo.min.js"></script>';  
          concatenatedMinifiedFileScriptTagAlready = true;
        } else if (foundStartTemplateMarker == foundEndTemplateMarket)
        {
          outputTemplate += fileRay[i] +'\n';
        }
      }
    }

    grunt.file.write('./dist/index.html', outputTemplate);
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['clean', 
                                 'copy:main', 
                                 'replaceindexhtmlwithminedscripttag', 
                                 'concat', 
                                 'uglify']);

};