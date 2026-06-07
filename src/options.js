/**
 * @file オプションや各種記憶情報を管理します。
 * @author EarlgreyTea
 */
"use strict";
//--------------------------------------------------------------
//  オプション初期値
//--------------------------------------------------------------
//===============================================================================
// SysPref および InitPref のプロパティの値を書き換えて使うこともできます
// 書き換えたら同梱のビルド環境にてビルドしてください（README.md を参照）
//===============================================================================

/**
 * スキン隠し設定の初期値。
 * @namespace
 * @readonly
 */
var SysPref = {
	//===============================================================================
	// Firefox で「Cookie とサイトデータをブロック」を選択した状態であえて使用したい場合
	// disableStorage を true に設定しておくと関連機能を無効化しエラーダイアログを
	// 出さないようにすることができます
	//===============================================================================
	disableStorage: false,						/** ローカルストレージを使用しない(ex-R) */

	// [ポップアップ]
	enableDefaultUpperPopup: false,				/** ポップアップを上側に表示する(ex) */
	enableEmbedImageWithPopup: true,			/** 画像のインライン表示でポップアップも有効にする(ex) */
	disableRelatedVideo: false,					/** 関連動画を表示しない(YouTube のみ)(ex) */
	enableFullScreenVideo: true,				/** フルスクリーン表示を可能にする(YouTube のみ)(ex) */
	// [カウント表示]
	enableShowIDCountIndex: true,				/** ID の発言回数にインデックス表示を追加する*(ex) */
	enableIDIconforColle: true,					/** colleスタイル使用時にIDアイコン要素の処理を有効にします(ex-R) */
	// [置換]
	valueMaxReplaceStr: 100,					/** 置換対象最大レス数(ex) */
	// [しおり]
	enableDirectBookmarking: true,				/** 修飾キーなしでしおりを操作する(ex) */
	enableCheckReplaceBookmark: true,			/** しおりの置き換えを確認する(ex) */
	// [あぼーん]
	enableReloadChangeNGEx: false,				/** NGExの即時あぼーんイベントでリロードする(ex-R) */
	// [その他]
	valueLazyloadMax: 10,						/** 遅延読込の同時読み込み数の上限値(ex-R) */
	valueLazyloadMin: 2,						/** 遅延読込の同時読み込み数の下限値(ex-R) ※下回ったら追加要求する */

	//==== 各サイトの仕様に依存する設定 ====
	// [2ch]
	valueLiveThreadHost: '.+live.+|.+jikkyo.+',	/** 2ch 実況系掲示板の URL(正規表現) */
	// [YouTube]
	valueYouTubeExtraParams: "&vp=hd1080"		/** YouTube 動画パラメータ(先頭の & を忘れずに) */
};

/**
 * スキン設定の初期値。オプション画面の項目のチェックオン=true、オフ=falseに対応します。
 * @namespace
 * @readonly
 */
var InitPref = {
	//====　隠しフラグ　====
	hasConfig: false,							/** スキンの設定が存在する(FAQ を表示したか)(ex) */

	//====　一般　====
	// [ポップアップ]
	enableResPopup: true,						/** アンカーポップアップ */
	enableIDPopup: true,						/** IDポップアップ [即時反映] */
	enableIDPopupOnClick: false,				/** IDポップアップ - クリック (マウスオーバー) でポップアップ [要リロード] */
	enableIDPopupAll: false,					/** IDポップアップ　- すべてのレスを一度に表示する */
	enableNamePopup: true,						/** 名前ポップアップ [即時反映] */
	enableNamePopupOnClick: false,				/** 名前ポップアップ - クリック (マウスオーバー) でポップアップ [要リロード] */
	enableNamePopupAll: false,					/** 名前ポップアップ　- すべてのレスを一度に表示する */
	enableDivideSLIP: false,					/** 名前ポップアップ - 2chのSLIPコテハンを分割して処理する [要リロード] */
	enableImagePopup: true,						/** 画像ポップアップ */
	valuePixelationMethod: 0,					/** 画像ポップアップ - フィルタ ("疑似モザイク"=0, "ガウスぼかし"=1) */
	valuePixelationSize: 1,						/** 画像ポップアップ - フィルタレベル ("強"=0, "中"=1, "弱"=2) */
	enableDefaultPixelation: false,				/** 画像ポップアップ - デフォルトでぼかす */
	enableImageGroCheck: true,					/** 画像ポップアップ - グロチェックをする(ex-R) */
	valueImageGroPattern: "(^ ?グロ|^ ?グロテスク|注意|危険|ブラクラ)([ 　!！\(（\:.．。だで]|$)",	/** 画像ポップアップ - グロ判定パターン(ex-R) */
	valueShadeLevel: 1,							/** 画像ポップアップ - 透明度(ex) ("85%"=0, "70%"=1, "50%"=2, "0%(そのまま)"=3) */
	enableImagePopupShadeOverCancel: true,		/** 画像ポップアップ - マウスオーバーで透明度を解除する(ex) */
	enableUrlPopup: true,						/** リンク先サムネイルポップアップ */
	valueThumbnailSite: 2,						/** リンク先サムネイルポップアップ - サムネイル画像取得先 ("×Snap Shots(TM)"=0, ""SimpleAPI"=1, "HeartRails Capture"=2, "websnapr"=3) */
	valueUrlPopupSize: 0,						/** リンク先サムネイルポップアップ - サムネイルサイズ ("大"=0, "小"=1) ※ SimpleAPI では無効 */
	enableVideoPopup: true,						/** 動画ポップアップ */
	valuePopupVideoSize: 0,						/** 動画ポップアップ - ポップアップ動画のサイズ(ex-R) (小=0, 大=1) */
	videoPopupAutoStart: false,					/** 動画ポップアップ - YouTube自動再生 */
	enableTrackBackPopup: true,					/** 逆参照ポップアップ */
	enableTrackBackPopupAll: false,				/** 逆参照ポップアップ - すべてのレスを一度に表示する　*/
	enableThreadInfoPopup: false,				/** スレッド情報ポップアップ */
	enableThreadInfoPopupAutoBookmark: false,	/** スレッド情報ポップアップ - 未読スレッドに自動でしおりを設定する */

	//====　一般2　====
	// [表示スタイル]
	valueSkinStyle: 4,							/** 表示スタイル選択値 (SelOpts.StyleName 参照) */
	nameSkinStyle: "simple-light",					/** 表示スタイル名称 (SelOpts.StyleFile 参照) */
	// [新着時動作]
	enableScrollToNewRes: true,					/** 新着レスに移動する(ex) ※読込/更新時に使用されます */
	enableUpdateSound: false,					/** 音を鳴らす(ex) ※読込/更新時に使用されます */
	// [自分/返信レス]
	enableHighlightMyPost: true,				/** 自分/返信レス - 自分のレスを強調表示する(ex-R) */
	stringMyPostBgColor: "#c1c1c1",				/** 自分/返信レス - 自分のレスの強調色(ex-R) */
	enableHighlightReply: true,					/** 自分/返信レス - 返信レスを強調表示する(ex-R) */
	stringReplyBgColor: "#b0c4de",				/** 自分/返信レス - 返信レスの強調色(ex-R) */
	enableNotifyReply: true,					/** 自分/返信レス - 新着の返信レスがあったら通知する(ex-R) */
	// [置換]
	enableReplaceBadAnchor: false,				/** 正しくないレスアンカーの置換 [置換/リロード] */
	enableReplaceWideAnchor: false,				/** 正しくないレスアンカーの置換 - ＞』と全角数字(ex) [置換/リロード] */
	enableReplaceCommaAnchor: false,			/** 正しくないレスアンカーの置換 - カンマ区切り(ex) [置換/リロード] */
	enableReplacePlusAnchor: false,				/** 正しくないレスアンカーの置換 - プラス区切り(ex-R) 置換/リロード] */
	enableReplace1000Anchor: false,				/** 正しくないレスアンカーの置換 - 2ch の >>1000(ex-R) 置換/リロード] */
	enableReplaceStr: false,					/** ReplaceStr.txt を使う(ex) [置換/リロード] */
	enableReplaceIDNAnchor: false,				/** 日本語ドメイン名のリンク置換(ex) [置換/リロード] */
	// [設定反映]
	valueReloadForPrefApply: 0,					/** リロードが必要な設定変更後 ("何もしない"=0, "リロードする前に確認"=1, "すぐにリロードする"=2) */

	//====　詳細　====
	// [リンク]
	enableLinkNewWindow: true,					/** リンクを新しいウィンドウで開く [リロード] */
	enableLinkNoReferer: true,					/** リファラを送信しない [リロード] */
	enableLinkForChaika: true,					/** スレッドリンクをchaikaで開く [リロード] */
	enableLinkTypeIcon: false,					/** リンクの種類を示すアイコンを表示する [リロード] */
	// [ヘッダ]
	valueHideTitleBar: 0,						/** ヘッダの表示*(ex) ("常に表示"=0, "ダブルクリックで隠す"=1, "自動で隠す"=2) [リロード] */
	enableContract: false,						/** ヘッダにスレッドタイトルを表示幅に合わせて省略表示する [リロード] */
	enableBoardName: true,						/** ヘッダに板名を表示する(ex-R) [リロード] */
	enableFavicon: false,						/** ヘッダにfaviconを表示する(ex-R) [リロード] */
	enableShowDatSize: false,					/** ヘッダにスレッドサイズを表示する(ex) [リロード] */
	// [視覚効果]
	enablePopupFade: true,						/** ポップアップのフェードアウトを有効にする */
	valuePopupFadeStep: 1,						/** フェードのステップ (0.1=0, 0.2=1, 0.25=2, 0.33=3, 0.5=4) */
	valueTrackBackDivNums: 10,					/** 参照アンカーの改行区切り数(ex) */
	// [ブラウズ]
	enableHookReload: true,						/** F5 キーをフックして動的に更新を行う */
	enableSmoothScroll: true,					/** スムーズスクロールを有効にする */
	valueSmoothScrollFrames: 1,					/** フレーム数 ("最小"=0, "中"=1, "最大"=2)　*/
	valueReadBandWidth: 1,						/** 「前へ」「次へ」の移動レス数(ex) (25=0, 50=1, 100=2) */
	// [コピー]
	enableCopyWithQuotationMark: false,			/** レスのコピーに引用記号をつける(ex-R) [即時反映] */

	//====　詳細2　====
	// [オートパイロット]
	enableAutoReloadOnLiveThread: false,		/** 実況板では自動更新をデフォルトにする [リロード] */
	enableAutoReloadWhenInactive: true,			/** 非アクティブ時でも自動更新を強制する [リロード] */
	enableStatusClearWhenInactive: true,		/** 更新毎に新着状態をクリアする(ex) [リロード] */
	valueAutoReloadInterval: 1,					/** 自動更新の間隔 ("15 秒"=0, "30 秒"=1, "1 分"=2, "3 分"=3, "5 分"=4, "10 分"=5) */
	enableChangeInterval: true,					/** おまかせ更新を使う(ex) */
	enableForceAutoScroll: false,				/** オートスクロールを自動停止しない(ex) */
	// [検索]
	enableFindHighlight: false,					/** 検索時に強調表示を行う */
	enableFxFind: false,						/** 検索結果がヘッダの裏に隠れないように補正(ex) [リロード] */
	enableMoveAfterFind: true,					/** 検索完了時にヒットした先頭のレスに移動(ex)　*/
	// [IDピックアップ]
	valueIDPickupHotkey: 1,						/** ピックアップ実行(ex) ("クリック"=0, "CTRL + クリック"=1) */
	valueIDPickupResult: 0,						/** ピックアップ結果(ex) ("検索の選択状態"=0, "抽出"=1, "強調"=2) */
	// [カウント表示]
	enableShowIDCount: true,					/** ID の発言回数を表示する(ex) [リロード] */
	enableColoringID: true,						/** ID を発言回数で色分けする(ex-R) */
	valueColoringIDThreshold: "2,5",			/** 発言回数のしきい値(ex-R) */
	valueColoringIDColor: "#096CE6,#FE5D47",	/** 各しきい値に対応する色(ex-R) */
	enableShowTrackbackCount: true,				/** 参照されているレス数を表示する(ex) [リロード] */
	enableColoringSLIP: false,					/** 2chのSLIPコテハンを出現回数で色分けする(ex-R) */
	valueColoringSLIPThreshold: "2,5",			/** 発言回数のしきい値(ex-R) */
	valueColoringSLIPBgColor: "#B0C4DE,#FFB6C1",/** 各しきい値に対応する背景色 */
	// [人気レス]
	valuePopularPostThreshold: 4,				/** 人気レスの参照数しきい値(ex-R) */

	//====　詳細3　====
	// [ポップアップ制限]
	valuePopupResMax: 3,						/** 最大レス数(ex) (5=0, 10=1, 15=2, 20=3, 30=4, 50=5, 100=6, 200=7, 500=8, 1000=9) [即時反映] */
	// [テンプレ表示]
	valueTemplateRes: 0,						/** レス数(ex) (10=0, 15=1, 20=2, 25=3, 30=4) [即時反映] */
	valueTemplateSelectHotkey: 1,				/** 絞込み表示(ex) ("クリック"=0, "CTRL + クリック"=1) [即時反映] */
	valueTemplateSelectCheckTime: 10,			/** ID がない場合の表示対象時間(ex) 分 [即時反映] */
	// [しおり]
	enableShowMarkToNew: true,					/** しおり～新着レス間も表示(ex) [リロード] */
	// [その他]
	enableEmbedImage: false,					/** 画像・動画をインライン表示する(ex) [埋込み/リロード]　*/
	enableEmbedImageWithCheck: false,			/** インライン表示 - グロチェックをする(ex) [埋込み/リロード] */
	enableEmbedImageGroup: false,				/** インライン表示 - レスの最後にまとめる(ex) [リロード] */
	enableEmbedImageAutoLoad: false,			/** インライン表示 - 自動で読み込む(ex-R) [リロード] */
	valueLazyloadInterval: 200,					/** インライン表示 - 遅延読込の要求間隔(ex-R) msec [リロード] */
	enableEmbedImagePreLoad: false,				/** インライン表示 - 表示範囲外も読み込む(ex-R) [リロード] */
	enableEmbedLoadOnLinkMouseOver: false,		/** インライン表示 - リンクにマウスオーバーで読み込む(ex-R) [リロード] */
	enableEmbedImageWithoutVideo: false,		/** インライン表示 - 動画を除外する(ex) [リロード] */
	enableThumbnailImage: true,					/** インライン表示 - 画像をサムネイルにする(ex-R) [リロード] */
	enableThumbnailWithoutGif: true,			/** インライン表示 - GIFは除外する(ex-R) [リロード] */
	valueEmbedImageSize: 0,						/** インライン表示 - 埋め込み画像のサイズ(ex-R) (小=0, 大=1) [リロード] */
	valueEmbedVideoSize: 0,						/** インライン表示 - 埋め込み動画のサイズ(ex-R) (小=0, 大=1) [リロード]　*/
	enableMultiResSelect: true,					/** 複数レス選択を使用する(ex) [リロード] */
	enableMultiResSelectNoModify: true,			/** クリックのみで選択追加(ex) [リロード] */
	enablePopupPreventer: true,					/** スクロール中のポップアップを抑制する(ex) [リロード] */

	end: 0
};

/**
 * リロードが必要な設定項目。
 * @namespace
 * @readonly
 */
var ReloadPref = {
	enableIDPopupOnClick: 0,
	enableNamePopupOnClick: 0,
	enableDivideSLIP: 0,
	enableLinkNewWindow: 0,
	enableLinkNoReferer: 0,
	enableLinkForChaika: 0,
	enableLinkTypeIcon: 0,
	valueHideTitleBar: 0,
	enableContract: 0,
	enableBoardName: 0,
	enableFavicon: 0,
	enableShowDatSize: 0,
	enableAutoReloadOnLiveThread: 0,
	enableAutoReloadWhenInactive: 0,
	enableStatusClearWhenInactive: 0,
	enableFxFind: 0,
	enableShowIDCount: 0,
	enableShowTrackbackCount: 0,
	enableShowMarkToNew: 0,
	enableEmbedImageGroup: 0,
	enableEmbedImageAutoLoad: 0,
	valueLazyloadInterval: 0,
	enableEmbedImagePreLoad: 0,
	enableEmbedLoadOnLinkMouseOver: 0,
	enableEmbedImageWithoutVideo: 0,
	enableThumbnailImage: 0,
	enableThumbnailWithoutGif: 0,
	valueEmbedImageSize: 0,
	valueEmbedVideoSize: 0,
	enableMultiResSelect: 0,
	enableMultiResSelectNoModify: 0,
	enablePopupPreventer: 0
};

/**
 * 選択項目の値リスト。
 * @namespace
 * @readonly
 */
var SelOpts = {
	StyleName:			["lego-ex", "本家ライク", "mix ライク", "chaikaライク", "シンプル(軽量)", "colleライク"],
	StyleFile:			["lego-ex", "smorgas", "mix", "chaika", "simple-light", "colle"],
	PixelationMethod: 	["疑似モザイク", "ガウスぼかし"],
	PixelationSize:		["強", "中", "弱"],
	ShadeLevel:			["85%","70%","50%","0%(そのまま)"],
	ThumbnailSite:		["×Snap Shots (TM)", "SimpleAPI", "HeartRails Capture", "×websnapr"],
	UrlPopupSize:		["大", "小"],
	ReloadForPrefApply:	["何もしない", "リロードする前に確認", "すぐにリロードする"],
	HideTitleBar:		["常に表示", "ダブルクリックで隠す", "自動で隠す"],
	PopupFadeStep:		[0.1,0.2,0.25,0.33,0.5],
	SmoothScrollFrames:	["最小","中","最大"],
	ReadBandWidth:		[25, 50, 100],
	AutoReloadInterval:	["15 秒","30 秒","1 分","3 分","5 分","10 分"],
	IDPickupHotkey:		["クリック", "CTRL + クリック"],
	IDPickupResult:		["検索の選択状態", "抽出", "強調"],
	PopupResMax:		[5, 10, 15, 20, 30, 50, 100, 200, 500, 1000],
	EmbedImageSize:		[{width: 200, height: 200}, {width: 500, height: 250}],
	EmbedVideoSize:		[{width: 360, height: 270}, {width: 560, height: 315}],
	PopupVideoSize:		[{width: 480, height: 360}, {width: 640, height: 360}],
	TemplateRes:		[10, 15, 20, 25, 30]
};

/**
 *  スキンのバージョン情報。
 *  @namespace
 *  @readonly
 */
var VerInfo = {
	//==== オリジナル smorgasbordスキンのバージョン情報 ====
	_skinName: "smorgasbord",
	_skinVersion: "2007/09/25 afternoon (still unstable)",
	_skinURI: "http://smorgasbord.drwatson.nobody.jp/",
	_skinMail: "\u0064\u0072\u0077\u0061\u0074\u0073\u006f\u006e\u002e\u0065\u0078\u0065\u002b\u0073\u006d\u006f\u0072\u0067\u0061\u0073\u0062\u006f\u0072\u0064\u0040\u0067\u006d\u0061\u0069\u006c\u002e\u0063\u006f\u006d",
	//==== この派生スキンのバージョン情報 ====
	_skinDerivedName: "smorgas lego-ex-R 改",
	_skinDerivedVersion: "2026/06/6(ex-R) [ 2018/05/22(ex-R) ベース ]",
	_skinDerivedDisclaimer: "※本スキンは派生版ですので、不具合等の連絡は本家作者様にしないで下さい"
};

/**
 * ログ出力レベル
 * @enum {number}
 * @readonly
 */
var SkinLogLvl = {
	NONE: 10,
	ERROR: 8,
	WARNING: 6,
	INFO: 4,
	DEBUG: 2
};

/**
 * コンソールログを出力します。
 */
class SkinLog {
	/**
	 * SkinLog オブジェクトを作成します。
	 * @param {string}	module	モジュール名
	 * @param {number}	level	出力レベル指定
	 */
	constructor(module, level){
		this.mod = module;
		this.lvl = (level < SKIN_LOGLVL) ? level : SKIN_LOGLVL;
	}
	_log(type, msg){ console.log("lego-ex-R:[" + type + "]:" + this.mod + ":" + msg); }
	/**
	 * エラーレベルのログを出力します。
	 * @param {string}	msg		出力メッセージ
	 */
	err(msg) { if(this.lvl <= SkinLogLvl.ERROR  ) this._log('ERROR',   msg); }
	/**
	 * 警告レベルのログを出力します。
	 * @param {string}	msg		出力メッセージ
	 */
	warn(msg){ if(this.lvl <= SkinLogLvl.WARNING) this._log('WARNING', msg); }
	/**
	 * 情報レベルのログを出力します。
	 * @param {string}	msg		出力メッセージ
	 */
	info(msg){ if(this.lvl <= SkinLogLvl.INFO   ) this._log('INFO',    msg); }
	/**
	 * デバッグレベルのログを出力します。
	 * @param {string}	msg		出力メッセージ
	 */
	dbg(msg) { if(this.lvl <= SkinLogLvl.DEBUG  ) this._log('DEBUG',   msg); }
}

/**
 * 全体へのログ出力レベル設定
 * @type {number}
 * @readonly
 */
var SKIN_LOGLVL = SkinLogLvl.WARNING;

/**
 * ローカルストレージへのアクセスを管理するクラス
 */
class SkinStorageManager {
	constructor() {
		/**
		 * @type {SkinLog}
		 * @private
		 */
		this.log = new SkinLog("Storage", SkinLogLvl.WARNING);
		/**
		 * ローカルストレージオブジェクト
		 * @type {Object}
		 * @private
		 */
		this._storage = null;
		/**
		 * ローカルストレージのオリジン
		 * @type {string}
		 */
		this.origin = location.href.replace(/\/thread\/.+$/, "");
	}
	/**
	 * エラーダイアログ（alert）を表示します。
	 * @param {Object}	exception	キャッチした例外
	 * @param {string}	message 	表示メッセージ（省略時はエラーダイアログを表示しません）
	 * @private
	 */
	_showAlert(exception, message){
		this.log.err(exception);
		if(!message) return;
		alert("logo-ex-R:[ERROR]:" + message);
	}
	/**
	 * ストレージキーを取得します。
	 * @param {string} name	項目名
	 * @return {string} ストレージキー
	 * @private
	 */
	_key(name){
		return "lego-ex-R-" + name;
	}
	/**
	 * ローカルストレージへのアクセスが可能か調べます。
	 * @return {boolean} ローカルストレージへアクセス可能ならtrue、不可ならfalseを返します。
	 */
	init(){
		try{
			this._storage = localStorage;
		}
		catch(e){
			this._showAlert(e, "ストレージへアクセスできません\n" +
			                  "「" + this.origin + "」サイトから送られてきた Cookie の保存を許可設定してください");
			this._storage = null;
		}
		if(!this._storage) return false;
		return true;
	}
	/**
	 * ローカルストレージから指定データを読み出します。
	 * @param {string}	name	項目名
	 * @return {Object|null} 読み出したデータまたはnullを返します。
	 */
	get(name){
		let data = null;
		if(this._storage){
			try{
				data = JSON.parse(this._storage.getItem(this._key(name)));
			}
			catch(e){
				this._showAlert(e, "ストレージからの読み出しでエラーが発生しました");
			}
		}
		return data;
	}
	/**
	 * ローカルストレージへデータを保存します。
	 * @param {string}	name	項目名
	 * @param {Object} data	保存するデータ
	 */
	set(name, data){
		if(this._storage){
			try{
				this._storage.setItem(this._key(name), JSON.stringify(data));
			}
			catch(e){
				this._showAlert(e, "ストレージへの書き込みでエラーが発生しました");
			}
		}
	}
	/**
	 * ローカルストレージから指定データを削除する。
	 * @param {string} name	項目名
	 */
	remove(name){
		try{
			this._storage.removeItem(this._key(name));
		}
		catch(e){
			this._showAlert(e, "ストレージのデータの削除でエラーが発生しました.");
		}
	}
}
// eslint-disable-next-line no-redeclare
var Storage = new SkinStorageManager();


/**
 * インポート/エクスポート機能を扱うクラス
 */
class BackupManager {
	constructor() {
		/**
		 * @type {SkinLog}
		 * @private
		 */
		this.log = new SkinLog("Backup", SkinLogLvl.WARNING);
		/**
		 * インポート/エクスポートの一時データ
		 * @type {Object}
		 * @private
		 */
		this._tempData = null;
		/**
		 * エクスポートするデータのJSONを出力したファイルのオブジェクトURL
		 * @type {DOMString}
		 * @private
		 */
		this._objectURL = null;
	}
	/**
	 * 含まれているデータをチェックします。
	 * @return {Object|null}		pref, mypost, bookmarkの判定結果をオブジェクトで返す すべて含まれていない場合は null
	 */
	checkData(){
		const fn = "checkData()";
		this.log.info(fn);
		if(!this._tempData){
			this.log.err("Not yet read file.");
			return null;
		}
		const check = {};
		check.pref = ("pref" in this._tempData);
		check.mypost = ("valueMyPosts" in this._tempData) || ("valueMyIDs" in this._tempData);
		check.bookmark = ("valueBookmarkIndex" in this._tempData);
		if(!check.pref && !check.mypost && !check.bookmark) return null;
		return check;
	}
	/**
	 * JSON形式のファイルを読み込みます。
	 * @param {File}	file	指定されたエキスポートファイル
	 * @return {Promise}
	 */
	readFile(file){
		const fn = "readFile(" + file.name + ")";
		this.log.info(fn);
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				// 読込完了
				const text = e.target.result;
				this.log.dbg(text);
				try{
					this._tempData = JSON.parse(text);
					// 読み込んだデータをチェック
					const check = this.checkData();
					if(!check){
						this._tempData = null;
						reject("NotExportFile");
					}else{
						resolve(check);
					}
				}
				catch(err){
					this.log.err(err.message);
					this._tempData = null;
					reject(err.message);
				}
			};
			reader.onerror = (e) => {
				// 読込エラー発生
				this.log.err(e.target.error.name);
				this._tempData = null;
				reject(e.target.error.name);
			};
			reader.readAsText(file);
		});
	}
	/**
	 * 指定されたインポートデータをローカルストレージに反映します。
	 * @param {Object}	select	反映するデータ種別の指定
	 */
	execImport(select){
		const fn = "execImport(" + JSON.stringify(select) + ")";
		this.log.info(fn);
		const keys = [];
		if(select.pref){
			keys.push("pref");
		}
		if(select.mypost){
			if("valueMyPosts" in this._tempData){
				keys.push("valueMyPosts");
			}
			if("valueMyIDs" in this._tempData){
				keys.push("valueMyIDs");
			}
		}
		if(select.bookmark){
			keys.push("valueBookmarkIndex");
		}

		keys.forEach((key) => { Storage.set(key, this._tempData[key]); });
		this._tempData = null;
		if(select.pref){
			SkinPref.load();
		}
	}
	/**
	 * 指定したデータからJSON形式のエクスポートファイルのオブジェクトを作成してURLを返します。
	 * @param  {Object}		select	出力するデータ種別の指定
	 * @return {DOMString}	エクスポートファイルのオブジェクトURL
	 */
	execExport(select){
		const fn = "execExport(" + JSON.stringify(select) + ")";
		this.log.info(fn);
		this._tempData = {};
		const keys = [];
		if(select.pref){
			keys.push("pref");
		}
		if(select.mypost){
			keys.push("valueMyPosts");
			keys.push("valueMyIDs");
		}
		if(select.bookmark){
			keys.push("valueBookmarkIndex");
		}

		keys.forEach((key) => { this._tempData[key] = Storage.get(key); });

		const jsonStr = JSON.stringify(this._tempData);
		this.log.dbg(jsonStr);
		const blob = new Blob([ jsonStr ], { "type":"application/x-msdownload" });
		this._objectURL = window.URL.createObjectURL(blob);
		return this._objectURL;
	}
	/**
	 * エクスポートファイルを開放します。
	 */
	removeExportURL(){
		const fn = "removeExportURL()";
		this.log.info(fn);
		this._tempData = null;
		if(this._objectURL){
			window.URL.revokeObjectURL(this._objectURL);
			this._objectURL = null;
		}
	}
}
var Backup = new BackupManager();

/**
 * スキン設定を管理するクラス
 */
class SkinPrefManager {
	constructor() {
		/**
		 * @type {SkinLog}
		 * @private
		 */
		this.log = new SkinLog("SkinPref", SkinLogLvl.WARNING);
		/**
		 * @type {StorageManager}
		 * @private
		 */
		this._storage = null;
		/**
		 * @type {Object}
		 * @private
		 */
		this._pref = null;
		/**
		 * @type {boolean}
		 * @private
		 */
		this._update = false;
	}
	/**
	 * 初期処理を行います。
	 * @return {boolean}	ストレージ有効なら true 無効なら false を返します。
	 */
	init(){
		this.log.info("init()");
		if(!SysPref.disableStorage){
			this._storage = Storage;
			return this._storage.init();
		}else{
			return false;
		}
	}
	/**
	 * スキン設定を読み込みます。
	 */
	load(){
		let pref = null;
		this.log.info("load()");
		if(!SysPref.disableStorage && this._storage){
			pref = this._storage.get("pref");
		}
		if(pref){
			let name;
			for(name in pref){
				this.log.dbg("pref[" + name + "] = " + pref[name]);
				if(!(name in InitPref)){
					this.log.warn("delete pref[" + name + "]");
					delete pref[name];
				}
			}
			for(name in InitPref){
				if(!(name in pref)){
					let val;
					if(InitPref[name] instanceof Array){
						val = InitPref[name].slice();
					}else{
						val = InitPref[name];
					}
					pref[name] = val;
					this.log.warn("not found pref[" + name + "] then copy from InitPref[" + name + "] = " + val);
				}
			}
		}else{
			this.log.info("replace SkinPref with InitPref");
			pref = JSON.parse(JSON.stringify(InitPref));
		}
		this._pref = pref;
		this._update = false;
	}
	/**
	 * 指定した設定項目の値を取得します。
	 * @param {string} name	項目名
	 * @return {number|boolean|string|null} 	取得した設定値またはnullを返します。
	 */
	get(name){
		if(!name) return null;
		let val;
		if(name in VerInfo){
			val = VerInfo[name];
		}else if(name in SysPref){
			val = SysPref[name];
		}else{
			val = this._pref[name];
		}
		this.log.dbg("get(" + name + ") = " + val);
		return val;
	}
	/**
	 * 指定した設定項目に値を設定します。
	 * @param {string} name	項目名
	 * @param {number|string|boolean}	val		値
	 */
	set(name,val){
		if(!name) return;
		this.log.dbg("set(" + name +"," + val + ")");
		if(name in this._pref){
			if(this._pref[name] === val) return;
			if(name in ReloadPref) this._update = true;
			this._pref[name] = val;
		}
	}
	/**
	 * スキン設定を保存します。
	 * @return {boolean} リロードが必要な変更があったか
	 */
	save(){
		if(SysPref.disableStorage){
			return false;
		}else{
			this.log.info("save()");
			if(this._storage){
				this._storage.set("pref", this._pref);
			}
			return this._update;
		}
	}
	/**
	 * スキン設定を初期化します。ローカルストレージの設定値データを削除し初期値を展開します。
	 */
	clear(){
		this.log.info("clear()");
		if(!SysPref.disableStorage && this._storage){
			this._storage.remove("pref");
		}
		this._pref = JSON.parse(JSON.stringify(InitPref));
		this._update = false;
	}
}
var SkinPref = new SkinPrefManager();

SkinPref.init();
SkinPref.load();

// スタイル設定読込の<link>タグを安全にDOMへ追加 (非推奨のdocument.writelnを完全に排除)
(() => {
	const SKIN_PATH = location.href.replace(/\/thread\/.+$/, "/skin/");
	const SKIN_NAME = "style-" + SkinPref.get("nameSkinStyle") + ".css";

	const createLink = (id, href) => {
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.type = "text/css";
		link.id = id;
		link.href = href;
		return link;
	};

	const head = document.head || document.getElementsByTagName("head")[0];
	if (head) {
		head.appendChild(createLink("commonstyle", SKIN_PATH + "style-common.css"));
		if (SkinPref.get("enableLinkTypeIcon")) {
			head.appendChild(createLink("outlinkstyle", SKIN_PATH + "style-outlink.css"));
		}
		head.appendChild(createLink("skinstyle", SKIN_PATH + SKIN_NAME));
		head.appendChild(createLink("mystyle", SKIN_PATH + "style-my.css"));
	}
})();
