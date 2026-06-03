# smorgas-lego-ex-R 改
--------------------------------------------------------------------------------

本スキンは、smorgas lego-ex 2012/06/05版（724.zip）をベースにした派生スキンsmorgas-lego-ex-Rを
さらにベースにした改良スキンです



## 動作要件



## ファイル説明

    smorgas-lego-ex-R/
     ├ _update_boardtable/     板名テーブルの更新方法の説明
     │
     ├ src/                    js、cssのソースファイル
     │  │                      ※ エンコードはjs：BOM付きUTF-8、css：Shift_JIS
     │  ├ boardtable.js           板名テーブル
     │  ├ error.js                エラーページ出力
     │  ├ options.js              オプション関連の初期値と処理
     │  ├ script.js               メインスクリプト
     │  ├ style-common.css        共通スタイル（最初に読み込む）
     │  ├ style-outlink.css       外部リンクスタイル（オプションで読み込む）
     │  ├ style-lego-ex.css       「lego-ex」スタイル
     │  ├ style-smorgas.css       「本家ライク」スタイル
     │  ├ style-mix.css           「mixライク」スタイル
     │  ├ style-chaika.css        「chaikaライク」スタイル
     │  ├ style-simple-light.css  「シンプル(軽量)」スタイル
     │  ├ style-colle.css         「colleライク」スタイル
     │  └ style-my.css            追加スタイル定義ファイル（最後に読み込む）
     │
     ├ flash/                  コピーや音を鳴らす用のFlashファイルなど
     │
     ├ img/                    画像ファイル
     │
     ├ package.json            ビルド環境の設定
     ├ gulpfile.js             gulpのタスク設定
     ├ .eslintrc.js            ESLintの設定
     ├ conf.json               JSDocの設定
     │
     ├ README.md               このファイル
     ├ CHANGELOG.md            変更履歴
     ├ TODO.txt                TODOメモ
     │
     ├ Header.html             各種htmlファイル群
     ├ Footer.html
     ├ Res.html
     ├ NewRes.html
     ├ NGRes.html
     ├ NGNewRes.html
     ├ NewMark.html
     ├ ime.nu.html
     ├ nicovide.html
     │
     ├ boardtable.js           [変換済]板名テーブル
     ├ error.js                [変換済]エラーページ出力
     ├ options.js              [変換済]オプション関連の初期値と処理
     ├ script.js               [変換済]メインスクリプト
     │
     ├ ReplaceStr.txt          ReplaceStr.txt 定義ファイル
     ├ ReplaceStr-example.txt  ReplaceStr.txt のサンプルと説明
     │
     ├ style-list-example.txt  追加スタイル定義ファイルのサンプル
     │                         （ファイル名を style-list.txtに変更して使用）
     ├ style-common.css        [変換済]共通スタイル
     ├ style-outlink.css       [変換済]外部リンクスタイル
     ├ style-lego-ex.css       [変換済]「lego-ex」スタイル
     ├ style-smorgas.css       [変換済]「本家ライク」スタイル
     ├ style-mix.css           [変換済]「mixライク」スタイル
     ├ style-chaika.css        [変換済]「chaikaライク」スタイル
     ├ style-simple-light.css  [変換済]「シンプル(軽量)」スタイル
     ├ style-colle.css         [変換済]「colleライク」スタイル
     └ style-my.css            [変換済]追加スタイル定義ファイル


## ビルド環境について

スクリプトやスタイルのカスタマイズをする際は、`./src`フォルダのファイルを修正・追加し、
それを（必須ではないですが）ビルドツールを使って変換してからトップフォルダに配置します。

以下、ビルド環境のインストールと使い方を説明します。

### インストール

1. まず Node.js環境が必要になりますのでインスールを行います。
	* Windows環境の場合は、[https://nodejs.org/ja/](https://nodejs.org/ja/) から LTS版のインストーラーをダウンロードし、インストーラーに従って進めるだけで問題ないはずです。
	* Ubuntu系Linux や Mac環境の場合は、下記を参考にしてみてください。
		- [Ubuntuに最新のNode.jsを難なくインストールする - Qiita](http://qiita.com/seibe/items/36cef7df85fe2cefa3ea)
		- [Macにnode.jsをインストールする手順。 - Qiita](http://qiita.com/akakuro43/items/600e7e4695588ab2958d)

2. ターミナルを起動してこのスキンのフォルダに移動してください。
	* Windows環境の場合は、`Node.js command prompt` というショートカットが出来ているはずですので、それによりコマンドプロンプトを起動してください。
	* 以降の作業はこのコマンドプロントやターミナルで行います。

3. 下記のコマンドを実行すると、必要なパッケージをダウンロードしてインストールします。
	```
	npm install
	```
	* プロキシでネット接続している環境では npm にプロキシの設定が必要になります。
		- [proxy環境下でのnpm config設定 - Qiita](http://qiita.com/tenten0213/items/7ca15ce8b54acc3b5719)

### ビルド手順

1. js/cssのカスタマイズ、板名テーブルの更新、スタイル追加などを `./src` フォルダで行います。

2. 下記コマンドで、jsスクリプトのチェックを行います。
	```
	npm run lint
	```
	* 赤字のエラーが表示されたら修正が必要です。
		- なお、チェックはすべてのjsファイルを `./tmp/allscript.js` に連結してから行っています。
		  エラー表示された箇所を `allscript.js` で確認し、元ファイルの該当箇所を修正してください。

3. 下記コマンドを実行すると、js/cssファイルが変換されて ./dist フォルダに出力されます。
	```
	npm run build
	```
	* 実際の変換処理前にスクリプトチェックが再度行われます。

4. Pale Moon 27 で使う場合は、build の代わりに buildpm を指定してビルドしてください。
	```
	npm run buildpm
	```

5. 最後に `./dist` フォルダの変換済ファイルをコピーします。
	```
	npm run dist
	```
	* jsファイルは変換時に UTF-8 の BOM が抜け落ちてるので再度付加しています。

6. スキン利用前にブラウザのキャッシュをクリアしてください。
	* これをしないとエラーになる場合があります。


### ドキュメント作成

jsのソースファイルには JSDoc 3 に準拠したドックコメントを書いており、ドキュメントを作成できます

1. 下記コマンドでドキュメントが `./doc`フォルダに作成されます。
	```
	npm run doc
	```

2. 作成されたドキュメントが自動的にOS規定のブラウザで開かれます。開かない場合は `./doc/index.html` を開いてください。



## 謝辞

smorgasbord や、その派生スキン、スタイルの作者の方々
bbs2chreader/chaika の開発・メンテナンスに携わってこられた方々
その他関連ソフトウェアの作者の方々に感謝いたします。


## 再配布／改変


----
