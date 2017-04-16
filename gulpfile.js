var gulp = require('gulp'),
	gutil = require('gulp-util'),
	browserSync = require('browser-sync'),
	plugins = require('gulp-load-plugins')({camelize: true});

gulp.task('html', function() {
	return gulp.src('contents/**/*.html')
		.pipe(plugins.plumber({errorHandler: plugins.notify.onError("Error: <%= error.message %>")}))
		.pipe(gulp.dest('debug'))
		.pipe(plugins.htmlmin({
			collapseWhitespace: true,
			removeComments: true
		}))
		.pipe(plugins.plumber.stop())
		.pipe(gulp.dest('master'))
		.pipe(browserSync.stream())
		.pipe(plugins.notify({message: 'HTMLMin task complete', onLast: true}));
});

gulp.task('images', function() {
	return gulp.src('assets/images/*.{gif,jpg,png}')
		.pipe(plugins.plumber({errorHandler: plugins.notify.onError("Error: <%= error.message %>")}))
		.pipe(gulp.dest('debug'))
		.pipe(plugins.imagemin([
			plugins.imagemin.optipng({optimizationLevel: 7}),
			plugins.imagemin.jpegtran({progressive: true}),
			plugins.imagemin.gifsicle({interlaced: true})
		]))
		.pipe(plugins.plumber.stop())
		.pipe(gulp.dest('master/images'))
		.pipe(browserSync.stream())
		.pipe(plugins.notify({message: 'Imagemin task complete', onLast: true}));
});

gulp.task('concat', function() {
	return gulp.src('assets/js/*.js')
		.pipe(plugins.plumber({errorHandler: plugins.notify.onError("Error: <%= error.message %>")}))
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter('jshint-stylish'))
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.concat('main.js'))
		.pipe(plugins.sourcemaps.write('/'))
		.pipe(plugins.plumber.stop())
		.pipe(gulp.dest('debug/js'))
		.pipe(browserSync.stream())
		.pipe(plugins.notify({message: 'Concat task complete', onLast: true}));
});

gulp.task('uglify', function() {
	return gulp.src(['debug/js/*.js','!debug/js/*.min.js'])
		.pipe(plugins.plumber({errorHandler: plugins.notify.onError("Error: <%= error.message %>")}))
		.pipe(plugins.uglify({
			preserveComments: 'license'
		}))
		.pipe(plugins.rename({suffix: '.min'}))
		.pipe(plugins.plumber.stop())
		.pipe(gulp.dest('master/js'))
		.pipe(browserSync.stream())
		.pipe(plugins.notify({message: 'Uglify task complete', onLast: true}));
});

gulp.task('scripts', ['concat'], function() {
    gulp.start('uglify');
});

gulp.task('sass', function() {
	return gulp.src('assets/sass/**/*.s+(a|c)ss')
		.pipe(plugins.plumber({errorHandler: plugins.notify.onError("Error: <%= error.message %>")}))
		.pipe(plugins.sassLint())
		.pipe(plugins.sassLint.format())
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.sass({
			outputStyle: 'expanded'
		}))
		.pipe(plugins.autoprefixer({
			browsers: '> 1%',
			remove: false
		}))
		.pipe(plugins.sourcemaps.write('/'))
		.pipe(plugins.plumber.stop())
		.pipe(gulp.dest('debug/css'))
		.pipe(browserSync.stream())
		.pipe(plugins.notify({message: 'Sass task complete', onLast: true}));
});

gulp.task('cssnano', function() {
	return gulp.src(['debug/css/*.css','!debug/css/*.min.css'])
		.pipe(plugins.plumber({errorHandler: plugins.notify.onError("Error: <%= error.message %>")}))
		.pipe(plugins.cssnano({
			discardComments: {removeAllButFirst: true}
		}))
		.pipe(plugins.rename({suffix: '.min'}))
		.pipe(plugins.plumber.stop())
		.pipe(gulp.dest('master/css'))
		.pipe(browserSync.stream())
		.pipe(plugins.notify({message: 'Cssnano task complete', onLast: true}));
});

gulp.task('styles', ['sass'], function() {
    gulp.start('cssnano');
});

gulp.task('watch', function() {
	gulp.watch('contents/**/*.html', ['html']);
	gulp.watch('assets/images/**/*.{gif,jpg,png}', ['images']);
	gulp.watch('assets/js/**/*.js', ['scripts']);
	gulp.watch('assets/sass/**/*.{scss,sass}', ['styles']);
});

gulp.task('serve', ['watch'], function() {
	base = (gutil.env.prod ? 'master' : 'debug')
	browserSync.init({
		server: base,
		open: false,
		notify: false
	});
});

gulp.task('build', ['html', 'images', 'scripts', 'styles']);
gulp.task('default', ['build'], function() {
    gulp.start('serve');
});
