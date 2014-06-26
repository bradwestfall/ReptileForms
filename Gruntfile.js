module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
 
    copy: {
      main: {
        src: 'src/source.js',
        dest: 'dist/reptileforms.js',
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      my_target: {
        files: {
          'dist/reptileforms.min.js': ['src/source.js']
        }
      }
    },

    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'src/styles/reptileforms.min.css': 'src/styles/source.scss'
        }
      }
    },

    autoprefixer: {
      single_file: {
        src: 'src/styles/reptileforms.min.css',
        dest: 'dist/reptileforms.min.css'
      }
    },

    watch: {
      css: {
        files: '**/*.scss',
        tasks: ['sass', 'autoprefixer']
      },
      scripts: {
        files: 'src/source.js',
        tasks: ['copy', 'uglify']
      }
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s)
  grunt.registerTask('default', ['sass', 'autoprefixer', 'copy', 'uglify', 'watch']);

};
