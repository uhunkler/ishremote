'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      }
//      lib: {
//         src: ['lib/**/*.js']
//      }
    },
    coffee: {
      compile: {
        options: {
          bare: false
        },
        files: {
          'ish/js/browserio.js': 'src/browserio.coffee',
          'ish/js/remoteio.js': 'src/remoteio.coffee'
        }
      },
      compilebare: {
        options: {
          bare: true
        },
        files: {
          'config.js': 'src/config.coffee',
          'lib/ishremote.js': 'src/ishremote.coffee'
        }
      }
    },
    less: {
      compile: {
        src: ['less/*.less'],
        dest: 'ish/css/remote.css'
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      coffee: {
        options: {
          spawn: false
        },
        files: ['src/**/*.coffee'],
        tasks: ['coffee']
      },
      less: {
        files: ['less/**/*.less'],
        tasks: ['less']
      }
//      lib: {
//        files: '<%= jshint.lib.src %>',
//        tasks: ['jshint:lib', 'nodeunit']
//      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint']);

};
