requirejs.config({
  baseUrl: 'javascripts',
  //urlArgs: 'bust=' + (new Date()).getTime(),
  paths: {
    'jquery': 'support/jquery',
    'underscore': 'support/underscore',
    'backbone': 'support/backbone',
    'q': 'support/q',
    'handlebars': 'support/handlebars',
    'overviewer': 'support/overviewer'
  },
  shim: {
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    'underscore': {
      exports: '_'
    },
    'handlebars': {
      exports: 'Handlebars'
    },
    'handlebars/templates': {
      deps: ['handlebars'],
      exports: 'Handlebars.templates'
    },
    'overviewer/config': {
      deps: ['backbone', 'underscore'],
      exports: 'overviewerConfig'
    },
    'overviewer': {
      deps: ['overviewer/config'],
      exports: 'overviewer'
    },
    'overviewer/basemarkers': {
      deps: ['overviewer'],
      exports: 'overviewer'
    }
  }
});

require(['app'], function(App) {
  // TODO: ?
  window.app = new App();
});
