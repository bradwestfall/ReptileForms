module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
 
    uglify: {
      my_target: {
        files: {
          '../dist/reptileforms.min.js': ['source.js']
        }
      }
    },

    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'styles/reptileforms.min.css': 'styles/source.scss'
        }
      }
    },

    autoprefixer: {
      single_file: {
        src: 'styles/reptileforms.min.css',
        dest: '../dist/reptileforms.min.css'
      }
    },

    watch: {
      css: {
        files: '**/*.scss',
        tasks: ['sass', 'autoprefixer']
      },
      scripts: {
        files: '*.js',
        tasks: ['uglify']
      }
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s)
  grunt.registerTask('default', ['watch']);

};
