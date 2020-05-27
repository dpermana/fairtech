const { gulp, series, parallel, src, dest, watch } = require('gulp');
const path  = require('path'),
      browserSync = require('browser-sync').create(),
      sass = require('gulp-sass'),
      sourcemaps = require('gulp-sourcemaps'),
      flatten = require('gulp-flatten'),
      handlebars = require('gulp-compile-handlebars'),
      rename = require("gulp-rename");

const config = {
    build: "../",
    dest: {
        dir: '../*',
        css: '../'
    },
    src: {
        css: "scss/",
        templates: "templates/"
    }
};

function styleSheets(cb) {
  return src(config.src.css + '*.scss')
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(sourcemaps.write('./maps'))
      .pipe(dest(config.dest.css));
  cb();
}

function HTML(cb) {
  var templateData = ""; //JSON.parse(fs.readFileSync(config.src.variables + "dataClientsCompiled.js"));
  var options = {
    ignorePartials: true, //ignores the unknown footer2 partial in the handlebars template, defaults to false 
    partials : {
      footer : '<footer>the end</footer>'
    },
    batch : [
      config.src.templates + 'partials'

    ],
    helpers : {
      capitals : function(str){
        return str.toUpperCase();
      }
    }
  };
  
  var sources = [config.src.templates + "*.hbs", 
        "!" + config.src.templates + "partials/*.hbs"];

  return src(sources)
    .pipe(handlebars(templateData, options))
    .pipe(rename(function(path) {
      path.extname = '.html';
    }))
    .pipe(flatten())
    .pipe(dest( config.build ))
    .pipe(browserSync.stream());

  cb();
}



exports.watch = function() {
  watch(config.src.css, { events: 'all' }, function(cb) {
    styleSheets();
    console.log("SCSS changed.");
    cb();
  });

  watch(config.src.templates, { events: 'all' }, function(cb) {
    HTML();
    console.log("HTML changed.");
    cb();
  });
};

exports.default = series( HTML, styleSheets );