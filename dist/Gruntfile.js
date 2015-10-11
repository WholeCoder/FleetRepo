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
                               '!**/public/newassets/**'
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
        src: ['public/newassets/**/*.js'],
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

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['clean', 'copy:main', 'concat', 'uglify']);

};