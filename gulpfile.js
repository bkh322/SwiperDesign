'use strict';
/* jshint node: true */

// Gulp ëª¨ë“ˆ í˜¸ì¶œ
var gulp = require('gulp'),
    fileinclude = require('gulp-file-include');
var imagemin = require('gulp-imagemin'),
    pngquant = require("imagemin-pngquant"),
    mozjpeg = require('imagemin-mozjpeg'),
    spritesmith = require('gulp.spritesmith');
var changed = require('gulp-changed'),
    watch = require('gulp-watch');
var rename = require("gulp-rename");
var del = require('del');
var sass = require("gulp-sass"),
	concat = require('gulp-concat'),
	csso = require('gulp-csso');
var sourcemaps = require('gulp-sourcemaps'); // sourcemaps 호출
var newer = require("gulp-newer");

// paths
var DevSRC = 'source';
var PubSRC = 'result';
var PRJ = '/Swiper';

var SRC = {
    GUIDE: DevSRC + '/_guide/**',
    INDEX: DevSRC + '/index.html',
    INCLUDE: DevSRC + PRJ + "/_include/**/*.html",
    HTML: DevSRC + PRJ + '/html/**/*.html',
    ASSETS: DevSRC + PRJ + '/assets/**/**/*',
	SASS: DevSRC + PRJ + '/_scss/**/*.scss',
    CSS: DevSRC + PRJ + '/styles/**/*.css',
    JS: DevSRC + PRJ + '/assets/scripts/**/*.js',
    IMG: DevSRC + PRJ + '/assets/images/**/*',
    FONT: DevSRC + PRJ + '/assets/fonts/**/*'
};
var DEST = {
    GUIDE: PubSRC + '/_guide/',
    INDEX: PubSRC + '/',
    HTML: PubSRC + PRJ + '/html/',
    ASSETS: PubSRC + PRJ + '/assets/',
    CSS: PubSRC + PRJ + '/assets/styles/',
    JS: PubSRC + PRJ + '/assets/scripts/',
    IMG: PubSRC + PRJ + '/assets/images/',
    FONT: PubSRC + PRJ + '/assets/fonts/'
};

/* DEL */
function clean() {
    return del([PubSRC], {
        force: true
    });
}

// guide
function copyGuide() {
    return gulp.src(SRC.GUIDE).pipe(gulp.dest(DEST.GUIDE));
}
function copyIndex() {
    return gulp.src(SRC.INDEX).pipe(gulp.dest(DEST.INDEX));
}

/* html -include */
function include() {
    return gulp
        .src([SRC.HTML])
        .pipe(
            fileinclude({
                prefix: "@@",
                basepath: "@file"
            })
        )
        .pipe(gulp.dest(DEST.HTML));
}

/*  SCSS : SCSS Config(환경설정)  */
var scssOptions = {
	outputStyle: "compact",
	indentType: "tab",
	indentWidth: 1,
	precision: 6,
	sourceComments: false
};

/* Sass */
function scss() {
	return gulp.src(SRC.SASS)
		.pipe(sourcemaps.init()) // 소스맵 초기화(소스맵을 생성) 
		.pipe(sass(scssOptions).on('error', sass.logError)) // SCSS 함수에 옵션갑을 설정, SCSS 작성시 watch 가 멈추지 않도록 logError 를 설정 
		.pipe(sourcemaps.write()) // 위에서 생성한 소스맵을 사용한다. 
		.pipe(gulp.dest(DEST.CSS)) // 목적지(destination)을 설정 
		.pipe(csso()) // 압축
		.pipe(rename(function (path) { // 파일명 변경
			path.basename += ".min";
			/*
			path.dirname += "/폴더";
			path.basename += "-뒤에이름";
			path.extname = ".확장자";

			dirname: "main/text/ciao",
			basename: "aloha",
			prefix: "bonjour-",
			suffix: "-hola",
			extname: ".md"
			*/
		}))
		.pipe(gulp.dest(DEST.CSS));
}


/* files - copy */
function copyAssets() {
    return gulp.src(SRC.ASSETS).pipe(gulp.dest(DEST.ASSETS));
}
 function copyCss() {
    return gulp.src(SRC.CSS).pipe(gulp.dest(DEST.CSS));
}
function copyJs() {
    return gulp.src(SRC.JS).pipe(gulp.dest(DEST.JS));
}
function copyImg() {
    return gulp
        .src(SRC.IMG)
        .pipe(newer(DEST.IMG))
        .pipe(imagemin())
        .pipe(gulp.dest(DEST.IMG));
}
function copyFont() {
    return gulp.src(SRC.FONT).pipe(gulp.dest(DEST.FONT));
}
 


/* watch */
function change() {
    gulp.watch(SRC.GUIDE, copyGuide);
    gulp.watch(SRC.INDEX, copyIndex);
    gulp.watch(SRC.INCLUDE, include);
    gulp.watch(SRC.HTML, include);
	gulp.watch(SRC.SASS, scss);
    gulp.watch(SRC.ASSETS, copyAssets);
}

/* exports */
exports.clean = clean;
exports.copyGuide = copyGuide;
exports.copyIndex = copyIndex;

exports.include = include;

exports.copyAssets = copyAssets;
exports.scss = scss;
/* exports.copyCss = copyCss;
exports.copyJs = copyJs;
exports.copyImg = copyImg;
exports.copyFont = copyFont; */

exports.change = change;


/* series & parallel */
var file = gulp.series(gulp.parallel(include, scss));
var copy = gulp.series(gulp.parallel(copyAssets), copyGuide, copyIndex);

var build = gulp.series(gulp.parallel(copy), file);

gulp.task("default", gulp.series(clean, gulp.parallel(build), change));

