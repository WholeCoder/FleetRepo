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

    for (var i = 0; i < fileRay.length; i++)
    {
      if(fileRay[i].indexOf('<!-- ReplaceTheseWthMinVersion-Start -->') > 0)
      {
        foundStartTemplateMarker = true;
      }
      if(fileRay[i].indexOf('<!-- ReplaceTheseWthMinVersion-End -->') > 0)
      {
        foundEndTemplateMarket = true;
      }

      if (foundStartTemplateMarker && !foundEndTemplateMarket && !concatenatedMinifiedFileScriptTagAlready)
      {
        outputTemplate += '<script src="./FleetRepo.min.js"></script>';  
        concatenatedMinifiedFileScriptTagAlready = true;
      } else if (foundStartTemplateMarker == foundEndTemplateMarket)
      {
        outputTemplate += fileRay[i];
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