module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'javascript/main.js',
        dest: 'javascript/main.min.js'
      }
    },

    sass: {
      dist: {
        options: {
          //style: 'compressed'
        },
        files: {
          'css/styles.css': 'css/styles.scss'
        }
      }
    },

    cssmin: {
      combine: {
        files: {
          'css/styles.css': ['css/styles.css']
        }
      }
    },

    autoprefixer: {
      options: {
        // Task-specific options go here.
      },
      single_file: {
        src: 'css/styles.css',
        dest: 'css/styles.css'
      }
    },

    watch: {
      css: {
        files: '**/*.scss',
        tasks: ['sass', 'autoprefixer']
      },
      grunt: {
        files: ['Gruntfile.js']
      }
      // ,
      // javascript: {
      //   files: '**/*.js',
      //   tasks: ['uglify']
      // }
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
