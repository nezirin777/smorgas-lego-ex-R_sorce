const fs = require('fs');
const spawn = require('cross-spawn').spawn;
const vinylPaths = require('vinyl-paths');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const cleanCSS = require('gulp-clean-css');
const open = require('gulp-open');

// npm でインストールしたCLIコマンドを同期実行する関数
function npmCliSync(cmd, args) {
    let actualCmd = cmd;
    let actualArgs = args;

    if (process.platform === 'win32') {
        actualCmd = 'cmd.exe';
        actualArgs = ['/c', '.\\node_modules\\.bin\\' + cmd].concat(args);
    }
    console.log('run: ' + cmd + ' ' + args.join(' '));

    const exited = spawn.sync(actualCmd, actualArgs, { stdio: ['ignore', 1, 2] });
    if (exited.status !== 0) {
        console.error('Error: ' + cmd + ' exited by ' + exited.status);
        return false;
    }
    return true;
}

// Node.js標準APIを使ったディレクトリのクリーンアップ＆再作成関数
async function cleanDir(dirPath) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    fs.mkdirSync(dirPath, { recursive: true });
}

// ----------------------------------------------------------------------
// タスク定義
// ----------------------------------------------------------------------

// お掃除
gulp.task('clean.dist', () => cleanDir('./dist'));
gulp.task('clean.doc', () => cleanDir('./doc'));
gulp.task('clean.tmp', () => cleanDir('./tmp'));
gulp.task('clean', gulp.parallel('clean.dist', 'clean.doc', 'clean.tmp'));

// utf8 のファイルにBOMを付けます
gulp.task('bom.dist', () => {
    return gulp.src('./dist/*.js')
        .pipe(vinylPaths((filename) => {
            npmCliSync('add-bom', ['-f', filename]);
            return Promise.resolve();
        }));
});

// jsファイルをESLintでチェックします
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
gulp.task('build.doc', async () => {
    npmCliSync('jsdoc', ['-c', 'conf.json', '-t', 'node_modules/jaguarjs-jsdoc', '-d', './doc', './src', './README.md']);
});

// 作成したドキュメントを規定のブラウザで開きます
gulp.task('open.doc', () => gulp.src('./doc/index.html').pipe(open()));

gulp.task('doc', gulp.series('clean.doc', 'build.doc', 'open.doc'));

// jsファイルをモダンブラウザ向けにトランスパイルします
gulp.task('build.js', () => {
    let option = {
        comments: false,
        presets: [
            ['@babel/preset-env', {
                targets: "> 0.25%, not dead" // モダンブラウザ向けの標準設定
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
});

// jsファイルをトランスパイルせずに ./dist に入れます
gulp.task('dev.js', () => {
    return gulp.src('./src/*.js')
        .pipe(plumber({
            errorHandler: (error) => { console.error('Error: ' + error.message); }
        }))
        .pipe(plumber.stop())
        .pipe(gulp.dest('./dist'));
});

// cssファイルをminify（圧縮）します (UTF-8出力)
gulp.task('build.css', () => {
    // encoding指定を外すことで、デフォルトのUTF-8として処理されます
    return gulp.src('./src/*.css')
        .pipe(plumber({
            errorHandler: (error) => { console.error('Error: ' + error.message); }
        }))
        .pipe(cleanCSS({
            rebase: false,
            level: { 1: { removeNegativePaddings: false } }
        }))
        .pipe(plumber.stop())
        // dest()も同様にデフォルトでUTF-8出力になります
        .pipe(gulp.dest('./dist'));
});

// ----------------------------------------------------------------------
// 統合タスク
// ----------------------------------------------------------------------

// メインビルド
gulp.task('build', gulp.series('clean.dist', 'lint', gulp.parallel('build.js', 'build.css')));

// 開発用ビルド
gulp.task('dev', gulp.series('clean.dist', 'lint', gulp.parallel('dev.js', 'build.css')));

// 成果物ファイルをコピーします
gulp.task('dist', gulp.series('bom.dist', async () => {
    npmCliSync('cpx', ['./dist/*.*', '.']);
}));
