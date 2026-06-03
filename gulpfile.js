// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//   Pale Moon 27 で使う場合は、98行目の'firefox >= 52'
//   と書いてある部分の数字を 28 に書き換えてビルド
//   しなおす必要があります
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
var spawn = require('cross-spawn').spawn;
var runSequence = require('run-sequence');
var vinylPaths = require('vinyl-paths');
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var eslint = require('gulp-eslint');
var babel = require('gulp-babel');
var cleanCSS = require('gulp-clean-css');
var open = require('gulp-open');
var convertEncoding = require('gulp-convert-encoding');


// npm でインストールしたCLIコマンドを同期実行する関数
function npmCliSync(cmd, args){
	let	actualCmd = cmd;
	let actualArgs = args;

	if(process.platform === 'win32'){
		actualCmd = 'cmd.exe';
		actualArgs = ['/c', '.\\node_modules\\.bin\\' + cmd].concat(args);
	}
	console.log('run: ' + cmd + ' ' + args.join(' '));

	const exited = spawn.sync(actualCmd, actualArgs, { stdio: ['ignore', 1, 2] });
	if(exited.status !== 0){
		console.error('Error: ' + cmd + ' exited by ' + exited.status);
		return false;
	}
	return true;
}

// ターゲットブラウザ指定してトランスパイルをします
function doBuild(target) {
	let option = {
		comments: false,
		presets: [
			['env', {
				targets: { browsers: [ target ] },
				exclude: [ 'transform-regenerator' ]
			}]
		]
	};
	return gulp.src('./src/*.js')
		.pipe(plumber({
			errorHandler: (error) => { console.error('Error: ' + error.message); }
		}))
		.pipe(babel(option))
		.pipe(plumber.stop())
		.pipe(gulp.dest('./dist'));
}

// お掃除
gulp.task('clean.dist', () => {
	return npmCliSync('rimraf', ['./dist']) && npmCliSync('mkdirp', ['./dist']);
});
gulp.task('clean.doc', () => {
	return npmCliSync('rimraf', ['./doc']) && npmCliSync('mkdirp', ['./doc']);
});
gulp.task('clean.tmp', () => {
	return npmCliSync('rimraf', ['./tmp']) && npmCliSync('mkdirp', ['./tmp']);
});
gulp.task('clean', ['clean.dist', 'clean.doc', 'clean.tmp']);

// utf8 のファイルにBOMを付けます
gulp.task('bom.dist', () => {
	return gulp.src('./dist/*.js')
		.pipe(vinylPaths((filename) => {
			npmCliSync('add-bom', ['-f', filename]);
			return Promise.resolve();
		}));
});

// jsファイルをESLintでチェックします
//		各ファイルを link.js に連結してチェックしますので
//		エラーが検出された場合は link.js で該当箇所を確認し、src/ のファイルを修正してください 
gulp.task('lint', () => {
	return gulp.src('./src/*.js')
		.pipe(plumber({
			errorHandler: (error) => { console.error('Error: ' + error.message); }
		}))
		.pipe(concat('allscript.js'))
		.pipe(gulp.dest('./tmp'))
		.pipe(eslint({ useEslintrc: true }))
		.pipe(eslint.format())
		.pipe(plumber.stop())
		.pipe(eslint.failOnError());
});

// jsファイルからJSDoc3でドキュメントを作成します
gulp.task('build.doc', () => {
	return npmCliSync('jsdoc', ['-c', 'conf.json', '-t', 'node_modules/jaguarjs-jsdoc', '-d', './doc', './src', './README.md']);
});
// 作成したドキュメントを規定のブラウザで開きます
gulp.task('open.doc', () => {
	gulp.src('./doc/index.html').pipe(open());
});
gulp.task('doc', (cb) => {
	runSequence('clean.doc', 'build.doc', 'open.doc', cb);
});

// jsファイルをFirefox 52向けにトランスパイルします
gulp.task('build.js', () => {
	return doBuild('firefox >= 52');
});

// jsファイルをPale Moon 27向けにトランスパイルします
gulp.task('buildpm.js', () => {
	return doBuild('firefox >= 28');
});

// jsファイルを ./dist に入れます
gulp.task('dev.js', () => {
	return gulp.src('./src/*.js')
		.pipe(plumber({
			errorHandler: (error) => { console.error('Error: ' + error.message); }
		}))
		.pipe(plumber.stop())
		.pipe(gulp.dest('./dist'));
});

// cssファイルをminify（圧縮）します
gulp.task('build.css', () => {
	return gulp.src('./src/*.css')
		.pipe(plumber({
			errorHandler: (error) => { console.error('Error: ' + error.message); }
		}))
		.pipe(convertEncoding({from: 'Shift_JIS', to: 'utf8'}))
		.pipe(cleanCSS({
			rebase: false,
			level: { 1: { removeNegativePaddings: false } }
		}))
		.pipe(convertEncoding({from: 'utf8', to: 'Shift_JIS'}))
		.pipe(plumber.stop())
		.pipe(gulp.dest('./dist'));
});

// ビルドします
gulp.task('build', (cb) => {
	runSequence('clean.dist', 'lint', ['build.js', 'build.css'], cb);
});

// Pale Moon 27向けにビルドします
gulp.task('buildpm', (cb) => {
	runSequence('clean.dist', 'lint', ['buildpm.js', 'build.css'], cb);
});

// ビルドせずに ./dist に入れます
gulp.task('dev', (cb) => {
	runSequence('clean.dist', 'lint', ['dev.js', 'build.css'], cb);
});

// 成果物ファイルをコピーします
gulp.task('dist', ['bom.dist'], () => {
	return npmCliSync('cpx', ['./dist/*.*', '.']);
});
