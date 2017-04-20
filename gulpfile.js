var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var minifyCss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var livereload = require('gulp-livereload');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var browserify = require("browserify");
var babelify = require("babelify");

gulp.task('build', function() {
    return browserify({
            entries: ['./src/index.js'],
            debug: true
        })
        .transform(babelify.configure({
            presets: ["es2015"]
        }))
        .bundle()
        .pipe(source("bundle.js"))
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('build-x', function() {
    return gulp.src('./src/index.js') // #1. select all js files in the app folder
        .pipe(babel({
            presets: ['es2015']
        })) // #3. transpile ES2015 to ES5 using ES2015 preset
        .pipe(gulp.dest('./public/js/')); // #4. copy the results to the build folder
});

gulp.task('build-css', function() {
    return gulp.src('src/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(sourcemaps.init())
        .pipe(minifyCss())
        .pipe(concat('styles.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/styles/'));
});

gulp.task('nodemon', function() {
    return nodemon({
        script: './app.js',
        watch: ['app.js', 'routes']
    });
});

gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('src/**/*.js', ['build']);
    gulp.watch('src/**/*.scss', ['build-css']);
});

gulp.task('default', ['build', 'watch', 'nodemon']);
