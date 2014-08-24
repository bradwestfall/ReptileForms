var gulp = require('gulp');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");

var paths = {
	styles: ['./src/styles/**/*'],
	scripts: ['./src/*.js']
};

gulp.task('sass', function () {
    gulp.src(paths.styles)
        .pipe(sass())
        .pipe(prefix("last 1 version", "> 1%", "ie 8", "ie 7"))
        .pipe(rename('reptileforms.min.css'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('compress', function() {
  gulp.src(paths.scripts)
    .pipe(rename('reptileforms.js'))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename('reptileforms.min.js'))
    .pipe(gulp.dest('dist'))
});

// Rerun the task when a file changes
gulp.task('watch', function() {
	gulp.watch(paths.styles, ['sass']);
	gulp.watch(paths.scripts, ['compress']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['sass', 'compress', 'watch']);