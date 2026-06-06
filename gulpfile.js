/**
 * @file smorgas-lego-ex-R 改 ビルドスクリプト (Gulpfile)
 * @author EarlgreyTea
 */
"use strict";

const fs = require('fs');
const path = require('path');
const https = require('https');
const spawn = require('cross-spawn').spawn;
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const cleanCSS = require('gulp-clean-css');
const open = require('gulp-open');

// 共通パス定義
const PATHS = {
    src: {
        js: './src/*.js',
        css: './src/*.css',
        html: './*.html'
    },
    dist: './dist',
    tmp: './tmp',
    doc: './doc',
    boardsXml: './_update_boardtable/boards.xml', // 解析対象の boards.xml
    targetTable: './src/boardtable.js'
};

// ----------------------------------------------------------------------
// ヘルパー関数
// ----------------------------------------------------------------------

function npmCliSync(cmd, args) {
    let actualCmd = cmd;
    let actualArgs = args;

    if (process.platform === 'win32') {
        actualCmd = 'cmd.exe';
        actualArgs = ['/c', path.join('.', 'node_modules', '.bin', cmd)].concat(args);
    }
    console.log(`run: ${cmd} ${args.join(' ')}`);

    const exited = spawn.sync(actualCmd, actualArgs, { stdio: ['ignore', 1, 2] });
    if (exited.status !== 0) {
        console.error(`Error: ${cmd} exited with status ${exited.status}`);
        return false;
    }
    return true;
}

async function cleanDir(dirPath) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * ウェブからリソース（ArrayBuffer）をフェッチします。
 * セキュリティフィルターを安全にすり抜けるため、ブラウザ標準のリクエストヘッダを網羅して付与します。
 * @param {string} url 取得先のURL
 * @returns {Promise<ArrayBuffer>} 取得したデータのバッファ
 */
function fetchBuffer(url) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    };

    return new Promise((resolve, reject) => {
        if (typeof fetch === 'function') {
            fetch(url, { headers })
                .then(res => {
                    if (!res.ok) return reject(new Error(`HTTP ${res.status}`));
                    return res.arrayBuffer();
                })
                .then(resolve)
                .catch(reject);
            return;
        }

        // 旧Node.js環境用の安全ガード (https.get)
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            headers: headers
        };

        https.get(options, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
            });
            res.on('error', reject);
        }).on('error', reject);
    });
}

// ----------------------------------------------------------------------
// 各種個別タスク
// ----------------------------------------------------------------------

const cleanDist = () => cleanDir(PATHS.dist);
const cleanDoc = () => cleanDir(PATHS.doc);
const cleanTmp = () => cleanDir(PATHS.tmp);
const clean = gulp.parallel(cleanDist, cleanDoc, cleanTmp);

// ESLint 静的解析
const lint = () => {
    return gulp.src(PATHS.src.js)
        .pipe(plumber({
            errorHandler: (error) => { console.error(`ESLint Error: ${error.message}`); }
        }))
        .pipe(concat('allscript.js'))
        .pipe(gulp.dest(PATHS.tmp))
        .pipe(eslint({ useEslintrc: true }))
        .pipe(eslint.format())
        .pipe(plumber.stop())
        .pipe(eslint.failOnError());
};

// JSDoc3 ドキュメント生成
const buildDoc = async () => {
    npmCliSync('jsdoc', ['-c', 'conf.json', '-t', 'node_modules/jaguarjs-jsdoc', '-d', PATHS.doc, './src', './README.md']);
};

// ドキュメント表示
const openDoc = () => gulp.src(path.join(PATHS.doc, 'index.html')).pipe(open());
const doc = gulp.series(cleanDoc, buildDoc, openDoc);

// JSトランスパイル (Babel)
const buildJs = () => {
    const babelOptions = {
        comments: false,
        presets: [
            ['@babel/preset-env', {
                targets: "> 0.25%, not dead"
            }]
        ]
    };
    return gulp.src(PATHS.src.js)
        .pipe(plumber({
            errorHandler: (error) => { console.error(`Babel Error: ${error.message}`); }
        }))
        .pipe(babel(babelOptions))
        .pipe(plumber.stop())
        .gulp.dest(PATHS.dist);
};

// 開発用コピー
const devJs = () => {
    return gulp.src(PATHS.src.js)
        .pipe(plumber({
            errorHandler: (error) => { console.error(`DevCopy Error: ${error.message}`); }
        }))
        .pipe(plumber.stop())
        .pipe(gulp.dest(PATHS.dist));
};

// CSS圧縮
const buildCss = () => {
    return gulp.src(PATHS.src.css)
        .pipe(plumber({
            errorHandler: (error) => { console.error(`cleanCSS Error: ${error.message}`); }
        }))
        .pipe(cleanCSS({
            rebase: false,
            level: { 1: { removeNegativePaddings: false } }
        }))
        .pipe(plumber.stop())
        .pipe(gulp.dest(PATHS.dist));
};

// HTMLコピー
const copyHtml = () => {
    return gulp.src(PATHS.src.html)
        .pipe(gulp.dest(PATHS.dist));
};

// JSファイルへのBOM付加
const addBomToDist = async () => {
    if (!fs.existsSync(PATHS.dist)) return;
    const files = fs.readdirSync(PATHS.dist).filter(file => file.endsWith('.js'));
    for (const file of files) {
        const filePath = path.join(PATHS.dist, file);
        const buffer = fs.readFileSync(filePath);

        if (buffer.length < 3 || buffer[0] !== 0xEF || buffer[1] !== 0xBB || buffer[2] !== 0xBF) {
            const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
            fs.writeFileSync(filePath, Buffer.concat([bom, buffer]));
            console.log(`[BOM Added] ${file}`);
        } else {
            console.log(`[BOM Skipped] ${file}`);
        }
    }
};

// ----------------------------------------------------------------------
// boards.xml から全ての板名を完全パース・同期するタスク
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// boards.xml から全ての板名を完全パース・同期するタスク
// ----------------------------------------------------------------------
const updateBoardTableFromXml = async () => {
    if (!fs.existsSync(PATHS.boardsXml)) {
        throw new Error(`[Error] ${PATHS.boardsXml} が見つかりません。ファイルを配置してください。`);
    }

    console.log(`Analyzing local configuration: ${PATHS.boardsXml}`);
    let xmlText = fs.readFileSync(PATHS.boardsXml, 'utf-8');

    // 誤動作防止のため、事前にXML内のコメントアウトブロック (<!-- -->) を完全に除去
    xmlText = xmlText.replace(/<!--[\s\S]*?-->/g, '');

    const nameTblEntries = new Map(); // 重複排除Map

    // 1. 直書きされている個別板の抽出
    const boardAttrRegex = /<board\s+([^>]+)\/?>/g;
    let boardMatch;
    while ((boardMatch = boardAttrRegex.exec(xmlText)) !== null) {
        const attrs = boardMatch[1];
        const titleMatch = /title="([^"]+)"/.exec(attrs);
        const urlMatch = /url="([^"]+)"/.exec(attrs);

        if (titleMatch && urlMatch) {
            const title = titleMatch[1].trim();
            const rawUrl = urlMatch[1].trim();

            if (rawUrl.startsWith('http://127.0.0.1')) continue;

            // プロトコル（大文字小文字、相対URL //）を完全に除去し、末尾スラッシュを保証
            let hostAndPath = rawUrl.replace(/^(?:https?:)?\/\//i, '');
            if (!hostAndPath.endsWith('/')) {
                hostAndPath += '/';
            }

            nameTblEntries.set(hostAndPath, title);
        }
    }
    console.log(`Parsed direct boards: ${nameTblEntries.size} entries`);

    // 2. 外部BBSMENUリンク定義の抽出
    const bbsmenuRegex = /<bbsmenu\s+([^>]+)\/?>/g;
    const externalSources = [];
    let menuMatch;
    while ((menuMatch = bbsmenuRegex.exec(xmlText)) !== null) {
        const attrs = menuMatch[1];
        const srcMatch = /src="([^"]+)"/.exec(attrs);
        const filterMatch = /filter="([^"]+)"/.exec(attrs);

        if (srcMatch) {
            if (srcMatch[1] === 'default') continue;

            externalSources.push({
                url: srcMatch[1],
                filter: filterMatch ? filterMatch[1] : null
            });
        }
    }

    // 3. 各外部BBSMENUから同期フェッチ＆抽出
    for (const source of externalSources) {
        try {
            console.log(`Fetching external BBSMENU: ${source.url}`);
            const arrayBuf = await fetchBuffer(source.url);

            const decoder = new TextDecoder('shift_jis');
            const htmlText = decoder.decode(arrayBuf);

            // Aタグの大文字小文字、他属性、さらに【クォーテーションの有無（href=url）】に完全対応する超柔軟な正規表現
            const anchorRegex = /<a\s+[^>]*href=(?:"([^"]*)"|'([^']*)'|([^>\s]+))[^>]*>([\s\S]*?)<\/a>/gi;
            let anchorMatch;
            const filterRegex = source.filter ? new RegExp(source.filter) : null;
            let subCount = 0;

            while ((anchorMatch = anchorRegex.exec(htmlText)) !== null) {
                // クォーテーションあり/なしのいずれかにマッチしたURLを抽出
                const boardUrl = (anchorMatch[1] || anchorMatch[2] || anchorMatch[3] || '').trim();
                const title = anchorMatch[4].replace(/<[^>]*>/g, '').trim(); // 内包するHTMLタグを除去してプレーンテキスト化

                if (!boardUrl) continue;

                if (
                    boardUrl.includes('test/read.cgi') ||
                    boardUrl.includes('wiki') ||
                    boardUrl.includes('html') ||
                    title.includes('■') ||
                    title.includes('★') ||
                    title.startsWith('2ch')
                ) {
                    continue;
                }

                if (filterRegex && !filterRegex.test(boardUrl)) {
                    continue;
                }

                // プロトコル（大文字小文字、相対URL //）を完全に除去し、末尾スラッシュを保証
                let hostAndPath = boardUrl.replace(/^(?:https?:)?\/\//i, '');
                if (!hostAndPath.endsWith('/')) {
                    hostAndPath += '/';
                }

                nameTblEntries.set(hostAndPath, title);
                subCount++;
            }
            console.log(`  -> Synced ${subCount} boards from ${source.url}`);
        } catch (error) {
            console.warn(`[Warning] Failed to fetch external source: ${source.url} (${error.message})`);
        }
    }

    if (nameTblEntries.size === 0) {
        throw new Error('[Error] 板一覧を1件も抽出できませんでした。xmlのパスまたはネットワーク状況を確認してください。');
    }

    // キーをアルファベット順にソートして出力用の配列を作成
    const sortedKeys = Array.from(nameTblEntries.keys()).sort();
    const entriesArray = sortedKeys.map(key => {
        return `\t\t\t"${key}": "${nameTblEntries.get(key)}"`;
    });

    // 4. boardtable.js を読み込み、マーカー間の定義データ部分のみをインプレース置換
    if (!fs.existsSync(PATHS.targetTable)) {
        throw new Error(`[Error] 置換対象の ${PATHS.targetTable} が見つかりません。`);
    }

    let boardTableContent = fs.readFileSync(PATHS.targetTable, 'utf-8');

    const markerRegex = /(\/\/ \[BEGIN_BOARD_TABLE\])[\s\S]*?(\/\/ \[END_BOARD_TABLE\])/;

    if (!markerRegex.test(boardTableContent)) {
        throw new Error(`[Error] ${PATHS.targetTable} 内にマーカー // [BEGIN_BOARD_TABLE] または // [END_BOARD_TABLE] が見つかりません。`);
    }

    const replacement = `// [BEGIN_BOARD_TABLE]\n${entriesArray.join(',\n')}\n            // [END_BOARD_TABLE]`;
    boardTableContent = boardTableContent.replace(markerRegex, replacement);

    fs.writeFileSync(PATHS.targetTable, boardTableContent, 'utf-8');
    console.log(`[Success] ${PATHS.targetTable} の定義データ部を自動更新しました。登録板数: ${nameTblEntries.size}件 (個別板・外部ソース統合済)`);
};

// ------------------------------------------------------------
// 統合・配備タスク exports
// ----------------------------------------------------------------------

const build = gulp.series(
    cleanDist,
    lint,
    gulp.parallel(buildJs, buildCss, copyHtml)
);

const dev = gulp.series(
    cleanDist,
    lint,
    gulp.parallel(devJs, buildCss, copyHtml)
);

const dist = gulp.series(addBomToDist, async () => {
    npmCliSync('cpx', [path.join(PATHS.dist, '*.*'), '.']);
});

exports.clean = clean;
exports.lint = lint;
exports.doc = doc;
exports.build = build;
exports.dev = dev;
exports.dist = dist;
exports.updateTable = updateBoardTableFromXml;
exports.default = build;
