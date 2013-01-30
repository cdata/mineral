module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-handlebars');
  grunt.loadNpmTasks('grunt-requirejs');
  grunt.loadNpmTasks('grunt-csso');
  grunt.initConfig({
    watch: {
      templates: {
        files: 'static/templates/*.handlebars',
        tasks: 'handlebars'
      },
      javascripts: {
        files: [
          'static/javascripts/app.js',
          'static/javascripts/view.js',
          'static/javascripts/model.js',
          'static/javascripts/mineral.js',
          'static/javascripts/support/handlebars/templates.js',
          'static/javascripts/{view,model,collection,support}/*.js'
        ],
        tasks: 'requirejs'
      },
      css: {
        files: [
          'static/stylesheets/support/normalize.css',
          'static/stylesheets/mineral.css'
        ],
        tasks: 'css'
      }
    },
    handlebars: {
      all: {
        src: 'static/templates',
        dest: 'static/javascripts/support/handlebars/templates.js'
      }
    },
    concat: {
      css: {
        src: [
          'static/stylesheets/support/normalize.css',
          'static/stylesheets/static.css'
        ],
        dest: 'static/stylesheets/all.css'
      }
    },
    csso: {
      'static/stylesheets/all.min.css': 'static/stylesheets/all.css'
    },
    requirejs: {
      default: {
        baseUrl: './static/javascripts',
        name: 'mineral',
        mainConfigFile: './static/javascripts/mineral.js',
        out: './static/javascripts/mineral-release.js'
      }
    }
  });

  grunt.registerTask('css', 'concat csso');
};
