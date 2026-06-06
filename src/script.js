/**
 * @file メインのスクリプトです。
 * @author EarlgreyTea
 */
"use strict";

/**
 * グローバルオブジェクト documentの短縮エイリアス
 * @type {element}
 */
var _doc = document;

/**
 * ネットワークリクエストを制御する静的ユーティリティクラス
 */
class Http {
	/**
	 * 指定URLからリソースを非同期でテキストとして取得します。
	 * @param {string}		url		リクエストするURL
	 * @param {boolean}		[force]	強制取得（キャッシュを無視する場合にtrue）
	 * @return {Promise<string>}	レスポンスのテキストを解決するPromise
	 */
	static get(url, force) {
		const options = {};
		if(typeof force !== "undefined" && force){
			options.headers = {
				"If-Modified-Since": "Wed, 15 Nov 1995 00:00:00 GMT"
			};
		}

		return fetch(url, options)
			.then(response => {
				if(response.ok){
					return response.text();
				}
				throw new Error(response.statusText || `HTTP error! status: ${response.status}`);
			});
	}
}

/**
 * 後方互換性のためのグローバルラッパー関数。
 * 既存の他モジュールや巨大スクリプトの呼び出し箇所を破壊しないために維持します。
 * @deprecated 新しいコードでは直接 Http.get(url, force) を利用してください。
 */
function AjaxGet(url, force){
	return Http.get(url, force);
}

// ダイアログ
var OptionsDialog = null;
var AnalyseDialog = null;

/**
 * スタイルシートを動的に作成・制御します。
 */
// eslint-disable-next-line no-redeclare
class StyleSheet {
	/**
	 * 指定IDのスタイルシートを取得または作成します。
	 * @param {string}	id	スタイルシートのID
	 */
	constructor(id){
		let style = _doc.getElementById(id);
		if(!style){
			style = _doc.createElement("style");
			style.type = "text/css";
			style.id = id;
			(_doc.head ?? _doc.getElementsByTagName("head")[0]).appendChild(style);
		}
		this._style = style;
	}
	/**
	 * スタイルシートを削除します。
	 */
	remove(){
		this._style.parentNode?.removeChild(this._style);
	}
	/**
	 * スタイルルールを挿入します。
	 * @param {string} rule		CSSルール
	 */
	insert(rule){
		this._style.sheet?.insertRule(rule, 0);
	}
	/**
	 * スタイルルールを全消去します。
	 */
	clear(){
		const sheet = this._style.sheet;
		if(!sheet) return;
		const l = sheet.cssRules.length;
		for(let i = l - 1; i >= 0; i--){
			sheet.deleteRule(i);
		}
	}
}


/**
 * 表示範囲の指定に従ってスレッドをリロードします。
 */
function ReloadThread(){
	const log = new SkinLog("", SkinLogLvl.WARNING);
	const fn = "ReloadThread()";
	log.info(fn);
	const r = _doc.getElementById("reloadMenu");
	if (!r) return;
	const v = r.value;
	if(v === "X") return;

	const url = TD.serverUrl + TD.threadUrl;
	if(v === "input"){
		const res = prompt("番号?", "1-25");
		if(res !== null){
			location.href = url + res;
		}else{
			r.selectedIndex = r.length - 1;
		}
	}else{
		location.href = url + v;
	}
}


/**
 * DOM 操作のために、スキンの静的なノードを格納して管理するクラス
 */
class NodesManager {
	constructor() {
		/**
		 * 静的ノードのキャッシュ
		 * @type {Element}
		 * @private
		 */
		this._content = null;
	}
	/**
	 * ヘッダ部
	 * @type {Element}
	 */
	get header(){ return _doc.getElementById("header"); }
	/**
	 * フッタ部
	 * @type {Element}
	 */
	get footer(){ return _doc.getElementById("footer"); }
	/**
	 * スレッド表示の上端y座標
	 * @type {number}
	 */
	get threadViewTop(){
		const hd = this.header;
		return hd ? (hd.offsetTop + hd.offsetHeight) : 0;
	}
	/**
	 * ヘッダ部の右側のコマンドバー
	 * @type {Element}
	 */
	get command(){ return _doc.getElementById("command"); }
	/**
	 * 検索/抽出ボックス
	 * @type {Element}
	 */
	get findBox(){ return _doc.getElementById("findbox"); }
	/**
	 * 検索/抽出ボックスのテキストボックス
	 * @type {Element}
	 */
	get findBoxText(){ return _doc.getElementById("findboxText"); }
	/**
	 * レス数
	 * @type {Element}
	 */
	get resCount(){ return _doc.getElementById("resCount"); }
	/**
	 * ステータス表示
	 * @type {Element}
	 */
	get statusText(){ return _doc.getElementById("statusText"); }
	/**
	 * DAT サイズ
	 * @type {Element}
	 */
	get datSize(){ return _doc.getElementById("datSize"); }
	/**
	 * スレッドタイトル
	 * @type {Element}
	 */
	get threadName(){ return _doc.getElementById("threadName"); }
	/**
	 * 板の名称
	 * @type {Element}
	 */
	get boardName(){ return _doc.getElementById("boardName"); }
	/**
	 * 検索対象（レス本文/レス番号/名前欄/メール欄/日付/ID/BeID）のセレクトボックス
	 * @type {Element}
	 */
	get findObject(){ return _doc.getElementById("findObject"); }
	/**
	 * 検索条件（を含む/を含まない）のセレクトボックス
	 * @type {Element}
	 */
	get findContent(){ return _doc.getElementById("findContent"); }
	/**
	 * 表示指定（抽出/強調）のセレクトボックス
	 * @type {Element}
	 */
	get findShow(){ return _doc.getElementById("findShow"); }
	/**
	 * 反転指定のチェックボックス
	 * @type {Element}
	 */
	get findStrong(){ return _doc.getElementById("findStrong"); }
	/**
	 * 自動更新の状態表示
	 * @type {Element}
	 */
	get reloadInfo(){ return _doc.getElementById("moremoreInfo"); }
	/**
	 * 既読レスと新着レスとの境界
	 * @type {Element}
	 */
	get newMark(){ return _doc.getElementById("NewMark"); }
	/**
	 * スレッド表示のルート
	 * @type {Element}
	 */
	get content(){ return (!this._content) ? (this._content = _doc.getElementById("content")) : this._content; }
	/**
	 * ポップアップ表示のルート
	 * @type {Element}
	 */
	get popupRoot(){ return _doc.getElementById("popupdummy"); }
	/**
	 * 指定のレス番号のレスを取得します。
	 * @param {number}		resNum	レス番号
	 * @return {Element}	レス要素
	 */
	getRes(resNum){ return _doc.getElementById("res" + resNum); }
	/**
	 * 指定のレス要素内のレスヘッダ要素を取得します。
	 * @param {Element}		node	レス要素
	 * @return {Element}	レスヘッダ要素
	 */
	getResHeader(node){ return node?.children[0] || null; }
	/**
	 * 指定のレス要素内のレス本文要素を取得します。
	 * @param {Element}		node	レス要素
	 * @return {Element}	レス本文要素
	 */
	getResBody(node){ return node?.children[1] || null; }
	/**
	 * 指定のレス要素内の名前欄要素を取得します。
	 * @param {Element}		resHeader	レスヘッダ部要素
	 * @return {Element}	名前欄要素
	 */
	getResName(resHeader){ return resHeader?.children[1] || null; }
	/**
	 * 指定のレス要素内のメール欄要素を取得します。
	 * @param {Element}		resHeader	レスヘッダ部要素
	 * @return {Element}	メール欄要素
	 */
	getResMail(resHeader){ return resHeader?.children[2] || null; }
	/**
	 * 指定のレス要素内の日付欄要素を取得します。
	 * @param {Element}		resHeader	レスヘッダ部要素
	 * @return {Element}	日付欄要素
	 */
	getResDate(resHeader){ return resHeader?.children[3] || null; }
	/**
	 * 指定のレス要素内のID欄要素を取得します。
	 * @param {Element}		resHeader	レスヘッダ部要素
	 * @return {Element}	ID欄要素
	 */
	getResID(resHeader){ return resHeader?.children[4] || null; }
	/**
	 * 指定のレス要素内のBeID欄要素を取得します。
	 * @param {Element}		resHeader	レスヘッダ部要素
	 * @return {Element}	BeID欄要素
	 */
	getResBeID(resHeader){ return resHeader?.children[5] || null; }
	/**
	 * 指定のレス要素内のIDアイコン要素を取得します。
	 * @param {Element}		resHeader	レスヘッダ部要素
	 * @return {Element}	IDアイコン要素
	 */
	getResIDIcon(resHeader){ return resHeader?.children[6] || null; }
	/**
	 * 指定のレス要素内のあぼーん表示要素を取得します。
	 * @param {Element}		resHeader	レスヘッダ部要素
	 * @return {Element}	あぼーん表示要素
	 */
	getInfoAbone(resHeader){ return resHeader?.children[7] || null; }
	/**
	 * レス要素から、レス番号を取得します。
	 * @param {Element} node	レス要素
	 * @return {number} レス番号
	 */
	getResNumByContainer(node){ return node ? parseInt(node.getAttribute("res"), 10) : 0; }
	/**
	 * ID要素からレス番号を取得します。
	 * @param {Element} node	ID要素
	 * @return {number} レス番号
	 */
	getResNumByID(node){ return node ? parseInt(node.parentNode.parentNode.getAttribute("res"), 10) : 0; }
	/**
	 * 名前要素からレス番号を取得します。
	 * @param {Element} node	名前要素
	 * @return {number} レス番号
	 */
	getResNumByName(node){ return node ? parseInt(node.parentNode.parentNode.getAttribute("res"), 10) : 0; }
}
// グローバル変数名へのマッピング
var Nodes = new NodesManager();

/**
 * DOM 操作のために、主に動的なノードを管理するクラス
 */
class ResNodesManager {
	constructor() {
		this.log = new SkinLog("ResNodes", SkinLogLvl.WARNING);
	}
	errUndef(fn){ this.log.err(fn + " 有効な引数が指定されていません"); }
	errNotFound(fn){ this.log.err(fn + " 要素が見つかりません"); }
	/**
	 * レス要素の子要素から、レスのコンテナ要素を検索します。
	 * @param {Element} node		レス要素の子要素
	 * @return {Element} コンテナ要素
	 */
	getParentContainer(node){
		const fn = "getParentContainer(node)";
		let parent = this.getParentByClassName(node, "resContainer");
		if(parent) return parent;
		parent = this.getParentByClassName(node, "resPopup");
		if(!parent) this.errNotFound(fn);
		return parent;
	}
	/**
	 * レス要素の子要素から、指定したクラス名を持つ親要素を検索します。
	 * @param {Element} node		レス要素の子要素
	 * @param {boolean} classname	親要素のクラス名
	 * @return {Element} 親要素
	 */
	getParentByClassName(node, classname){
		const fn = "getParentByClassName(node,'" + classname + "')";
		if(!node || !classname){ this.errUndef(fn); return null; }
		let parent = node.parentNode;
		while(parent){
			if(parent.className && parent.classList.contains(classname)) return parent;
			parent = parent.parentNode;
		}
		return null;
	}
	/**
	 * 外部リンク要素からレス番号を取得します。
	 * @param {Element} node	外部リンク要素
	 * @return {number} レス番号
	 */
	getResNumByOutLink(node){
		if(!node) return 0;
		if(node.hasAttribute("res")){
			// スレッド情報ダイアログのリンク
			return parseInt(node.getAttribute("res"), 10);
		}
		const parent = this.getParentContainer(node);
		if(!parent) return 0;
		// レス本文のリンク
		return parseInt(parent.getAttribute("res"), 10);
	}
	/**
	 * 指定されたレス番号から、レス要素を取得します。
	 * @param {number}		resNum	レス番号
	 * @return {Element}	レス要素
	 */
	getContainerByResNum(resNum){
		const fn = "getContainerByResNum(" + resNum +")";
		if(!resNum){ this.errUndef(fn); return null; }
		return _doc.getElementById("res" + resNum);
	}
	/**
	 * 指定されたレス番号から、本文要素を取得します。
	 * @param {number}		resNum	レス番号
	 * @return {Element}	レス要素
	 */
	getBodyByResNum(resNum){
		const fn = "getBodyByResNum(" + resNum + ")";
		if(!resNum){ this.errUndef(fn); return null; }
		return _doc.getElementById("body" + resNum);
	}
	/**
	 * すべてのレス要素を取得します。
	 * @param {Element}		node		親ノード
	 * @param {boolean}		[selected]	選択されたレスのみ
	 * @return {Array<Element>}	要素の配列
	 */
	getContainers(node, selected){
		const fn = "getContainers(node," + selected + ")";
		let elems = Array.from((node || Nodes.content).querySelectorAll(selected ? ".resSelected" : ".resContainer"));
		if(elems && elems.length > 0) return elems;
		elems = Array.from((node || Nodes.popupRoot).getElementsByClassName("resPopup"));
		if(!elems || elems.length === 0) this.errNotFound(fn);
		return elems || [];
	}
	/**
	 * すべての既読レスヘッダ要素を取得します。
	 * @param {Element}	node	親ノード
	 * @return {Array<Element>}	要素の配列
	 */
	getHeaders(node){
		const fn = "getHeaders(node)";
		const elems = Array.from((node || Nodes.content).getElementsByClassName("resHeader"));
		if(!elems || elems.length === 0) this.errNotFound(fn);
		return elems || [];
	}
	/**
	 * すべての新着レスヘッダ要素を取得します。
	 * @param {Element}	node	親ノード
	 * @return {Array<Element>}	要素の配列
	 */
	getNewHeaders(node){
		const fn = "getNewHeaders(node)";
		const elems = Array.from((node || Nodes.content).getElementsByClassName("resNewHeader"));
		if(!elems || elems.length === 0) this.errNotFound(fn);
		return elems || [];
	}
	/**
	 * すべてのレス番号要素を取得します。
	 * @param {Element}	node	親ノード
	 * @return {Array<Element>}	要素の配列
	 */
	getNumbers(node){
		const fn = "getNumbers(node)";
		const elems = Array.from((node || Nodes.content).querySelectorAll(".resNumber > a"));
		if(!elems || elems.length === 0) this.errNotFound(fn);
		return elems || [];
	}
	/**
	 * すべての名前欄要素を取得します。
	 * @param {Element}	node	親ノード
	 * @return {Array<Element>}	要素の配列
	 */
	getNames(node){
		const fn = "getNames(node)";
		const elems = Array.from((node || Nodes.content).getElementsByClassName("resName"));
		if(!elems || elems.length === 0) this.errNotFound(fn);
		return elems || [];
	}
	/**
	 * すべてのメール欄要素を取得します。
	 * @param {Element}	node	親ノード
	 * @return {Array<Element>}	要素の配列
	 */
	getMails(node){
		const fn = "getMails(node)";
		const elems = Array.from((node || Nodes.content).getElementsByClassName("resMail"));
		if(!elems || elems.length === 0) this.errNotFound(fn);
		return elems || [];
	}
	/**
	 * すべての日付欄要素を取得します。
	 * @param {Element}	node	親ノード
	 * @return {Array<Element>}	要素の配列
	 */
	getDates(node){
		const fn = "getDates(node)";
		const elems = Array.from((node || Nodes.content).getElementsByClassName("resDate"));
		if(!elems || elems.length === 0) this.errNotFound(fn);
		return elems || [];
	}
	/**
	 * すべての ID 欄要素を取得します。
	 * @param {Element}	node	親ノード（ポップアップは対象外なので無意味）
	 * @return {Array<Element>}	要素の配列
	 */
	getIDs(node){
		const fn = "getIDs(node)";
		const elems = Array.from((node || Nodes.content).querySelectorAll(".resContainer .resID[rel]"));
		if(!elems || elems.length === 0) this.errNotFound(fn);
		return elems || [];
	}


	/**
	 * すべての BeID 欄要素を取得します。
	 * @param {Element}	node	親ノード
	 * @return {Array<Element>}	要素の配列
	 */
	getBeIDs(node){
		const fn = "getBeIDs(node)";
		const elems = Array.from((node || Nodes.content).getElementsByClassName("resBeID"));
		if(!elems || elems.length === 0) this.errNotFound(fn);
		return elems || [];
	}
	/**
	 * すべての有効なあぼーん情報要素を取得します。
	 * @param {Element}	node	親ノード
	 * @return {Array<Element>}	要素の配列
	 */
	getInfoAbones(node){
		return Array.from((node || Nodes.content).querySelectorAll(".resContainer[aboned='true'] .resInfoAbone"));
	}
	/**
	 * すべての本文要素を取得します。
	 * @param {Element}	node	親ノード
	 * @return {Array<Element>}	要素の配列
	 */
	getBodies(node){
		const fn = "getBodies(node)";
		const elems = Array.from((node || Nodes.content).getElementsByClassName("resBody"));
		if(!elems || elems.length === 0) this.errNotFound(fn);
		return elems || [];
	}
	/**
	 * すべてのレスアンカー要素を取得します。
	 * @param {Element}	node	親ノード
	 * @return {Array<Element>}	要素の配列
	 */
	getResAnchors(node){
		const fn = "getResAnchors(node)";
		const elems = Array.from((node || Nodes.content).querySelectorAll(".resBody .resPointer"));
		if(!elems || elems.length === 0) this.errNotFound(fn);
		return elems || [];
	}
	/**
	 * すべてのIDアンカーの外側span要素を取得します。
	 * @param {Element}	node	親ノード
	 * @return {Array<Element>}	要素の配列
	 */
	getResMesIDs(node){
		return Array.from((node || Nodes.content).getElementsByClassName("resMesID"));
	}
	/**
	 * すべての外部リンク要素を取得します。
	 * @param {Element}	node	親ノード
	 * @return {Array<Element>}	要素の配列
	 */
	getOutLinks(node){
		return Array.from((node || Nodes.content).querySelectorAll(".resBody .outLink, .ivurLink, .ivurBlockedLink"));
	}
	/**
	 * 表示中のスレッドのレス範囲を取得します。
	 */
	getResRange(){
		const resItems = this.getContainers();
		return {
			first: Nodes.getResNumByContainer(resItems[0]),
			last: Nodes.getResNumByContainer(resItems[resItems.length - 1])
		};
	}
	/**
	 * Favicon の link 要素を取得します。
	 * @return {Element}	要素
	 */
	getFavicon(){
		return _doc.querySelectorAll("link[rel='icon']")[0];
	}
	/**
	 * すべてのレス要素の親要素である div 要素を取得します。
	 * @param	{Element}	node	親ノード
	 * @return	{Element}	要素
	 */
	getContent(node){
		return (node || _doc).querySelectorAll('div#content')[0];
	}
	/**
	 * レス番号から、指定された形式でレスの内容を取得。
	 */
	getEntireTextByIndex(resNum, format){
		const fn = "getEntireTextByIndex(" + resNum + ",'" + format + "')";
		this.log.info(fn);
		const container = this.getContainerByResNum(resNum);
		if(!container) return null;
		const name = this.getNameText(container);
		const mail = this.getMailText(container);
		const date = this.getDateText(container);
		const id   = this.getIDText(container);
		const beid = this.getBeIDText(container);
		const body = this.getBodyText(container);

		let str = "";
		if(!format) format = "V2C";
		switch(format){
		case "Jane":
			str = resNum + " 名前：" + name + "[" + mail + "]" + " 投稿日：" + date;
			break;
		case "Report":
			str = resNum + " " + date.replace(/([^ ]+)\(.*\)( [^ ]+)/, "$1$2");
			break;
		default: /* "V2C" etc */
			str = resNum + " ：" + name + " ：" + date;
			break;
		}
		if(id) str += " " + id;
		if(format === "Report"){
			str += "\n";
		}else{
			if(beid) str += " " + beid;
			str += "\n" + body;
		}
		return str;
	}
	/**
	 * 名前欄の文字列を取得します。
	 */
	getNameText(node){
		return this.getNames(node)[0]?.textContent || "";
	}
	/**
	 * メール欄の文字列を取得します。
	 */
	getMailText(node){
		return (this.getMails(node)[0]?.textContent || "").replace(/^ | $/g, "");
	}
	/**
	 * 日付欄の文字列を取得します。
	 */
	getDateText(node){
		return (this.getDates(node)[0]?.textContent || "").replace(/^ | $/g, "");
	}
	/**
	 * ID 欄の文字列を取得します。
	 */
	getIDText(node){
		return (this.getIDs(node)[0]?.textContent || "").replace(/^ *(ID:[^ ]*).*/, "$1");
	}
	/**
	 * BeID 欄の文字列を取得します。
	 */
	getBeIDText(node){
		return (this.getBeIDs(node)[0]?.textContent || "").replace(/^ *([^ ]*).*/, "$1");
	}
	/**
	 * 本文の文字列を取得します。
	 */
	getBodyText(node){
		return ThreadDocument.getInnerText(this.getBodies(node)[0], false).replace(/ \n /g, "\n").replace(/^ | $/g, "") + "\n";
	}
}
// グローバル変数名へのマッピング
var ResNodes = new ResNodesManager();


/**
 * ドキュメント全体を管理するクラス
 */
class ThreadDocumentManager {
	constructor() {
		this.log = new SkinLog("ThreadDocument", SkinLogLvl.WARNING);
		/**
		 * スレッドタイトル
		 * @type {string}
		 */
		this.title = "";
		/**
		 * ステータス文字列
		 * @type {string}
		 */
		this.status = "";
		/**
		 * すべてのレスの件数
		 * @type {number}
		 */
		this.countAll = null;
		/**
		 * DAT サイズ
		 * @type {string}
		 */
		this.datsize = null;
		/**
		 * 既読レスの件数
		 * @type {number}
		 */
		this.countRead = null;
		/**
		 * 新着レスの件数
		 * @type {number}
		 */
		this.countUnread = null;
		/**
		 * chaika内部サーバURL
		 * @type {string}
		 */
		this.serverUrl = "";
		/**
		 * スレッドのURL
		 * @type {string}
		 */
		this.threadUrl = "";
		/**
		 * 板のURL
		 * @type {string}
		 */
		this.boardUrl = "";
		/**
		 * スキンのURL
		 * @type {string}
		 */
		this.skinPath = "";
		/**
		 * サーバのホスト名
		 * @type {string}
		 */
		this.host = "";
		/**
		 * 板名
		 * @type {string}
		 */
		this.boardName = "";
		/**
		 * スレッド番号
		 * @type {string}
		 */
		this.threadID = "";
		/**
		 * スレッド表示のオプション文字列
		 * @type {string}
		 */
		this.option = "";
		/**
		 * 最後に再読み込みを行った日付
		 * @type {Date}
		 */
		this.date = new Date();
		/**
		 * ブックマークのレス番号
		 * @type {number}
		 */
		this.toBookMark = 0;
		/**
		 * 新着レスへスクロールするか
		 * @type {boolean}
		 */
		this.toNewRes = false;
		this._loaded = false;
	}
	/*
	 * 読み込み完了したか
	 */
	isLoaded(){
		return this._loaded;
	}
	/**
	 * イベントを処理します。
	 */
	handleEvent(e){
		switch(e.type){
		case "load":
			this.onLoad();
			break;
		case "resize":
			this.contractCaption(e);
			break;
		case "contextmenu":
			this.onContextMenu(e);
			break;
		}
	}
	/**
	 * スキンの処理を開始します。
	 */
	run(){
		const fn = "run()";
		this.log.info(fn);

		this.title = Nodes.threadName.textContent;
		this.serverUrl = Nodes.header.getAttribute("serverurl");
		this.boardUrl = Nodes.header.getAttribute("boardurl");
		this.threadUrl = Nodes.header.getAttribute("threadurl");
		this.skinPath = Nodes.header.getAttribute("skinpath");
		this.status = Nodes.footer.getAttribute("status");
		this.countRead = parseInt(Nodes.footer.getAttribute("getres"), 10);
		this.countUnread = parseInt(Nodes.footer.getAttribute("newres"), 10);
		this.countAll = parseInt(Nodes.footer.getAttribute("allres"), 10);
		this.datsize = parseInt(Nodes.footer.getAttribute("size"), 10);

		const matchOption = _doc.location.href.match(/read\.cgi\/.*\/(.*)$/);
		if(matchOption){
			this.option = matchOption[1];
			this.log.dbg("option:" + this.option);
		}

		Nodes.boardName.href = "chaika://board/" + this.boardUrl;
		if(SkinPref.get("enableBoardName")){
			Nodes.boardName.textContent = Board.getName(this.boardUrl) || "";
		}

		const boardHost = this.boardUrl.replace(/^https?:\/\/([^\/]+)\/.+$/, "$1");
		_doc.body.setAttribute("host", boardHost);
		if(SkinPref.get("enableFavicon")){
			const boardStyle = Nodes.boardName.style;
			boardStyle.paddingLeft = '19px';
			boardStyle.background = 'url(http://www.google.com/s2/favicons?domain=' + boardHost + ') no-repeat left center';
		}

		ThreadNameContextMenu.init();
		ResNumberContextMenu.init();
		IDExtract.init();
		Titlebar.init();
		Clipboard.init();
		ImagePopup.init();
		ID.init();
		Name.init();
		ResImage.init();
		MyAndRep.init();

		this.setStatus(true);

		PopupPreventer.startup();
		FxFindHandler.startup();

		this.toBookMark = Bookmark.init();
		this.toNewRes = SkinPref.get("enableScrollToNewRes");

		if(SkinPref.get("enableContract")){
			window.addEventListener("resize", this, false);
		}
		window.addEventListener("load", this, false);
		window.addEventListener("contextmenu", this, false);

		this.modifyContent(Nodes.content);

		AutoReload.startup();
		b2rAboneHandler.startup();
		KeyInput.startup();
		ResNumber.startup();
		ResPopup.startup();
		IDPopup.startup();
		NamePopup.startup();
		MultipleResSelector.startup();
	}
	/**
	 * loadイベントを処理します。
	 */
	onLoad(){
		const fn = "onLoad()";
		this.log.info(fn);
		this._loaded = true;
		if(_doc.getElementById("skinstyle").sheet.cssRules.length === 0){
			alert("スタイルの読み込みに失敗しましたので、標準スタイルに設定変更しました。\n"
			    + "オプションダイアログで、有効な表示スタイルを再度選択して下さい。");
			SkinPref.set("nameSkinStyle", "lego-ex");
			SkinPref.set("valueSkinStyle", 0);
			SkinPref.save();
			_doc.getElementById("skinstyle").href = this.skinPath + "style-lego-ex.css";
		}else{
			if(this.toBookMark){
				Bookmark.jumpTo();
			}else if(this.toNewRes){
				this.scrollToNewRes();
			}
			if(SkinPref.get("enableEmbedImage") && SkinPref.get("enableEmbedImageAutoLoad")){
				ResImage.startLazyload();
			}
		}
	}
	/**
	 * contextmenu イベントを処理します。
	 */
	onContextMenu(e){
		const fn = "onContextMenu(e)";
		this.log.info(fn);
		const node = e.target;
		const cl = node.classList;
		if(!cl.contains("resID") && !cl.contains("resSystem") && !cl.contains("resName")) return;
		if(cl.contains("resSystem") && !node.parentNode.classList.contains("resName")) return;

		const text = node.textContent;
		const selection = window.getSelection();
		const matchID = text.match(/^ID:([^\(\)\? ]{3,})/);
		const matchTrip = text.match(/^(\u25C6\S+)/);

		if(matchID){
			selection.removeAllRanges();
			const range = _doc.createRange();
			range.setStart(node.firstChild, 3);
			range.setEnd(node.firstChild, 3 + matchID[1].length);
			selection.addRange(range);
		}else if(matchTrip){
			selection.removeAllRanges();
			const range = _doc.createRange();
			range.setStart(node.firstChild, 0);
			range.setEnd(node.firstChild, matchTrip[1].length);
			selection.addRange(range);
		}else{
			selection.selectAllChildren(node);
		}
	}
	/**
	 * 指定されたノードの文字列を正しく取得します。
	 */
	getInnerText(node, multi){
		const fn = "getInnerText(node," + multi +")";
		this.log.info(fn);
		const nodes = node.childNodes;
		const ret = [];
		Array.from(nodes).forEach((n) => {
			if(n.hasChildNodes()){
				ret.push(this.getInnerText(n, false));
			}else if(n.tagName === "BR"){
				ret.push("\n");
			}else if(n.nodeType === Node.TEXT_NODE){
				ret.push(n.nodeValue);
			}else if(n.alt){
				ret.push(n.alt);
			}
		});
		if(!multi) return ret.join("");
		return ret;
	}
	/**
	 * スレッドの情報をクリップボードにコピーします。
	 */
	copyThreadInfo(){
		this.log.info("copyThreadInfo()");
		Clipboard.setClipboard(this.title + "\n" + this.threadUrl + "\n");
	}
	/**
	 * 書き込みウィザードを開きます。
	 */
	writeTo(repAnchorNums){
		const fn = "writeTo(" + repAnchorNums + ")";
		this.log.info(fn);
		if(!repAnchorNums) repAnchorNums = "";
		try{ location.href = "chaika://post/" + this.threadUrl + repAnchorNums; }
		catch(e){ this.log.warn("エラーを無視しました: " + e); }
	}
	/**
	 * すべての新着レスを既読状態にします。
	 */
	markAsRead(){
		this.log.info("markAsRead()");
		ResNodes.getNewHeaders().forEach((header) => header.classList.remove("resNewHeader"));
	}
	/**
	 * 新着レスまでスクロールします。
	 */
	scrollToNewRes(){
		const fn = "scrollToNewRes()";
		this.log.info(fn);
		if(_doc.location.href.indexOf("#") !== -1) return;
		if(this.option.match(/^\d+/)){
			this.log.dbg("log pick-up mode");
			window.scrollTo(0, 0);
			return;
		}
		window.scrollTo(0, Nodes.newMark ? (Nodes.newMark.offsetTop - Nodes.threadViewTop) : 0);
	}
	/**
	 * Favicon を設定します。
	 */
	setFavicon(filename, inactive){
		const fn = "setFavicon()";
		this.log.info(fn);
		const FAVICON_PATH = "img/favicon/favicon";
		const favicon = ResNodes.getFavicon();
		if(favicon){
			const link = favicon.cloneNode(true);
			const filebase = this.skinPath + FAVICON_PATH + filename;
			link.href = filebase + (filename === "throbber" ? ".gif" : (
				(AutoReload.enabled ? "auto" + (inactive ? "inactive" : "") : "") + ".png"
			));
			favicon.parentNode.appendChild(link);
			favicon.parentNode.removeChild(favicon);
		}
		if(inactive) this.unfocusUnread = 0;
	}
	/**
	 * ステータスを設定して、表示を更新します。
	 */
	setStatus(updateStatus){
		const fn = "setStatus()";
		this.log.info(fn);
		Nodes.resCount.textContent = this.countAll;
		if(updateStatus){
			if((this.countUnread > 0) && (this.status !== "( ｰωｰ)「ふー」")){
				Nodes.statusText.className = "ok";
				if(SkinPref.get("enableUpdateSound") && this.status !== "up") SoundUnit.play();
				this.status = this.countUnread + "件の新着レス";
				this.setFavicon("new");
			}else{
				const matchErr = this.status.match(/\(´・ω・`\)「エラー : (.+)」/);
				switch(this.status){
				case "( ｰωｰ)「DAT 落ち」":
					Nodes.statusText.className = "warning";
					this.status = "DAT 落ち";
					this.setFavicon("warning");
					break;
				case "(｀・ω・´)「OK」":
				case "( ｰωｰ)「新着なし」":
					Nodes.statusText.className = "ok";
					this.status = "新着なし";
					this.setFavicon("");
					break;
				case "(´・ω・`)「あぼーん発生。右下のバッテンを押してログを消した後再読み込みしてね」":
					Nodes.statusText.className = "warning";
					this.status = "あぼーんが発生しました。ログを消して、再読み込みして下さい。";
					this.setFavicon("warning");
					break;
				case "( ｰωｰ)「オフラインモード」":
					Nodes.statusText.className = "warning";
					this.status = "オフラインモード";
					this.setFavicon("warning");
					break;
				case "( ｰωｰ)「ログピックアップモード」":
					Nodes.statusText.className = "warning";
					this.status = "ログピックアップモード";
					this.setFavicon("warning");
					break;
				case "( ｰωｰ)「ふー」":
					Nodes.statusText.className = "warning";
					this.status = "リロード制限（残り" + Math.ceil((5000 - ((new Date()).getTime() - this.date.getTime())) / 1000) + "秒）";
					this.setFavicon("warning");
					break;
				default:
					Nodes.statusText.className = "error";
					if(matchErr) this.status = matchErr[1];
					this.setFavicon("error");
				}
			}
		}
		Nodes.statusText.textContent = this.status;
		if(SkinPref.get("enableShowDatSize")) Nodes.datSize.textContent = this.datsize + "KB";
		if(SkinPref.get("enableContract"))	this.contractCaption();
	}
	/**
	 * スレッドタイトルを省略表示します。
	 */
	contractCaption(){
		const maxLeft = ((Math.abs(Nodes.threadName.offsetTop - Nodes.command.offsetTop) > 30) ?
						window.innerWidth : Nodes.command.offsetLeft) - Nodes.datSize.offsetWidth;
		Nodes.threadName.textContent = this.title;
		if(Nodes.datSize.offsetLeft > maxLeft){
			for(let i = this.title.length - 1; i >= 0; i--){
				Nodes.threadName.textContent = this.title.substring(0, i) + "...";
				if(Nodes.datSize.offsetLeft <= maxLeft) break;
			}
		}
	}
	/**
	 * 各レスについて参照レスを調べ、参照されているレス番号にはポップアップと参照レス数の設定をします。
	 */
	markTrackbackedResNumbers(node){
		if(!SkinPref.get("enableShowTrackbackCount")) return;
		const fn = "markTrackbackedResNumbers(node)";
		this.log.info(fn);
		const isIDIcon = SysPref.enableIDIconforColle && (SkinPref.get("valueSkinStyle") === 5);

		Trackback.traverse();
		const div = _doc.createElement("div");
		div.className = "count";

		ResNodes.getNumbers(node).forEach((elem) => {
			const resNum = elem.textContent;
			const tb = Trackback.items[resNum];
			const icon = isIDIcon ? Nodes.getResIDIcon(elem.parentNode.parentNode) : null;
			if(!tb){
				this.log.dbg("tb[" + resNum + "] is undefined");
				if(icon) icon.removeAttribute("tb");
				return;
			}

			if(elem.className){
				elem.nextElementSibling.textContent = tb.length;
				elem.addEventListener("mouseover", TrackbackPopup, false);
				this.log.dbg("tb[" + resNum + "] length=" + tb.length + " (popup)");
			}else{
				elem.className = "tbNum";
				const count = div.cloneNode(false);
				count.textContent = tb.length;
				elem.parentNode.appendChild(count);
				elem.addEventListener("mouseover", TrackbackPopup, false);
				this.log.dbg("tb[" + resNum + "] length=" + tb.length + " (div.count)");
			}
			if(icon) icon.setAttribute("tb", tb.length);
		});
	}
	/**
	 * 設定に応じて外部リンクを改変します。
	 */
	modifyOutLinks(node){
		const fn = "modifyOutLinks(node)";
		this.log.info(fn);

		const enableNewWindow = SkinPref.get("enableLinkNewWindow");
		const enableNoReferer = SkinPref.get("enableLinkNoReferer");
		const enableForChaika = SkinPref.get("enableLinkForChaika");
		const enableIDN       = SkinPref.get("enableReplaceIDNAnchor");

		ResNodes.getOutLinks(node).forEach((elem) => {
			let idn = "";
			elem.addEventListener("mouseover", OutlinkPopup, false);
			if(enableIDN && elem.href.match(/[\/\.]\/$/i)){
				const ns = elem.nextSibling;
				if(ns){
					const matchIDN = ns.textContent.match(/^([^\s\.]{1,20})(\.(?:[a-z]{2}|com|net)(?:\/[\-_\.\!\~\*\"\(\)a-z0-9\;\/\?\:\@\&\=\+\$\,\%\#]+)?)/i);
					if(matchIDN){
						const domain = matchIDN[1];
						const rest   = matchIDN[2];
						const all    = domain + rest;
						const puny   = "xn--" + Punycode.encode(domain);
						elem.appendChild(_doc.createTextNode(all));
						ns.data = ns.textContent.substr(all.length);
						idn = elem.href.substr(0, elem.href.length - 1) + puny + rest;
						elem.href = idn;
					}
				}
			}
			if(!elem.hasAttribute("rel")){
				elem.setAttribute("rel", !idn ? elem.href.replace(this.serverUrl, "") : idn);
			}
			if(enableNewWindow && elem.target !== "_blank") elem.target = "_blank";

			if(elem.href.indexOf("read.cgi") !== -1){
				if(enableForChaika && elem.href.indexOf(this.serverUrl) === -1){
					elem.href = this.serverUrl + elem.href;
				}
			}else if(!ImagePopup.isImage(elem.href)){
				if(enableNoReferer && elem.href.indexOf("ime.nu.html?url=") === -1){
					elem.href = this.skinPath + "ime.nu.html?url=" + elem.href;
					if(idn || elem.textContent.indexOf("xn--") !== -1){
						elem.href = elem.href + "&b64url=" + btoa(unescape(encodeURIComponent(idn ? idn : elem.href)));
					}
				}
			}
		});
	}
	/**
	 * レスアンカーの内容を改変します
	 */
	replaceContextAnchor(node, force_bad){
		const fn = "replaceContextAnchor(node," + force_bad + ")";
		this.log.info(fn);

		const f1 = (event) => { event.preventDefault(); this.jumpTo(event); };
		const do_bad   = SkinPref.get("enableReplaceBadAnchor");
		const do_wide  = force_bad || (do_bad && SkinPref.get("enableReplaceWideAnchor"));
		const do_comma = force_bad || (do_bad && SkinPref.get("enableReplaceCommaAnchor"));
		const do_plus  = force_bad || (do_bad && SkinPref.get("enableReplacePlusAnchor"));
		const do_1000  = force_bad || (do_bad && SkinPref.get("enableReplace1000Anchor"));

		if(do_wide){
			ResNodes.getBodies(node).forEach((elem) => {
				elem.innerHTML = elem.innerHTML
					.replace(/((?:&gt;){1,2}([\uFF10-\uFF19]{1,4})([\-\uFF0D][0-9\uFF10-\uFF19]{0,4})?)/g,
						"<a href=\"#res$2\" class=\"resPointer\">$1</a>")
					.replace(/(\uFF1E{1,2}([0-9\uFF10-\uFF19]{1,4})([\-\uFF0D][0-9\uFF10-\uFF19]{0,4})?)/g,
						"<a href=\"#res$2\" class=\"resPointer\">$1</a>");
			});
		}

		ResNodes.getResAnchors(node).forEach((anchorItem) => {
			anchorItem.addEventListener("click", f1, false);
			if(do_wide || do_comma || do_plus || do_1000){
				const ns = anchorItem.nextSibling;
				if(!ns) return;
				while(ns.textContent.length > 0){
					let found = false;
					const match1000 = anchorItem.textContent.match(/^>{1,2}\d{3}$/) && ns.textContent.match(/^(\d) ?$/);
					const matchWide = ns.textContent.match(/^([\uFF10-\uFF19][0-9\uFF10-\uFF19]{0,2}([\-\uFF0D][0-9\uFF10-\uFF19]{0,4})?)/);
					const matchComma = ns.textContent.match(/^(\,\s*[0-9\uFF10-\uFF19]{1,4}([\-\uFF0D][0-9\uFF10-\uFF19]{0,4})?)/);
					const matchPlus = ns.textContent.match(/^(\+\s*[0-9\uFF10-\uFF19]{1,4}([\-\uFF0D][0-9\uFF10-\uFF19]{0,4})?)/);

					if(do_1000 && match1000){
						const text = match1000[1];
						anchorItem.appendChild(_doc.createTextNode(text));
						ns.textContent = ns.textContent.substr(text.length);
						found = true;
					}
					if(do_wide && matchWide){
						const text = matchWide[1];
						anchorItem.appendChild(_doc.createTextNode(text));
						ns.textContent = ns.textContent.substr(text.length);
						found = true;
					}
					if(do_comma && matchComma){
						const text = matchComma[1];
						anchorItem.appendChild(_doc.createTextNode(text));
						ns.textContent = ns.textContent.substr(text.length);
						found = true;
					}
					if(do_plus && matchPlus){
						const text = matchPlus[1];
						anchorItem.appendChild(_doc.createTextNode(text));
						ns.textContent = ns.textContent.substr(text.length);
						found = true;
					}
					if(!found) break;
				}
			}
		});
	}
	/**
	 * 本文の内容を改変します。
	 */
	modifyContent(node, forceBadAnchor, forceReplace){
		this.replaceContextAnchor(node, forceBadAnchor);
		if(!node || node.className !== "popupBody"){
			Name.countSLIPs();
			ID.countIDs();
		}
		this.markTrackbackedResNumbers(node);
		if(forceReplace || SkinPref.get("enableReplaceStr")){
			ReplaceStr.replace(this.threadUrl, this.title, node);
		}
		this.modifyOutLinks(node);
		if(SkinPref.get("enableEmbedImage")){
			ResImage.embed(node, !SkinPref.get("enableEmbedImageWithCheck"));
		}
		MyAndRep.scanMyPostAndReply();
	}
	/**
	 * XMLHttpRequest を利用して、動的にレスを挿入します。
	 */
	asyncInsert(start, end, before, scrollToTop, func, noUpdate, noScroll){
		const fn = "asyncInsert()";
		if(!noUpdate){
			Nodes.statusText.className = "throbber";
			this.setFavicon("throbber");
		}
		AjaxGet(this.serverUrl + this.threadUrl + start + "-" + end + "n" + "?AS=1")
		.then((html) => {
			const divTemp  = _doc.createElement("div");
			divTemp.innerHTML = html;
			const newContent = ResNodes.getContent(divTemp);
			newContent.id = "";
			const oldItems = ResNodes.getContainers(Nodes.content);

			let resStart = null;
			if(before){
				resStart = ResNodes.getContainerByResNum(1);
				resStart = (resStart) ? oldItems[1] : oldItems[0];
				ResNodes.getContainers(newContent)
					.forEach((res) => Nodes.content.insertBefore(res, resStart));
			}else{
				ResNodes.getContainers(newContent)
					.forEach((res) => Nodes.content.appendChild(res, resStart));
			}

			if(scrollToTop){
				window.scrollTo(0,0);
			}else{
				if(!noScroll){
					resStart = ResNodes.getContainerByResNum(start);
					if(resStart) window.scrollTo(0, resStart.offsetTop - (Nodes.header.offsetTop + Nodes.header.offsetHeight));
				}
			}

			window.setTimeout(() => {
				this.modifyContent(Nodes.content);
			}, 1);

			this.flagDigest = false;
			if(func) func();
			if(!noUpdate){
				Nodes.statusText.className = "ok";
				this.setFavicon("");
			}
		})
		.catch((e) => {
			this.log.err(fn + ":" + e.message);
		});
	}
	/**
	 * 表示域外のレスをすべて表示します。
	 */
	showAll(){
		const nodes = ResNodes.getContainers();
		for(let i = 0, n = nodes.length; i < n; i++){
			this.resShow(nodes[i]);
		}
		this.flagDigest = false;

		const resStart = ResNodes.getContainerByResNum(1);
		const addFirst = !resStart;
		const startIndex = Nodes.getResNumByContainer(resStart ? nodes[1] : nodes[0]);
		const endIndex   = Nodes.getResNumByContainer(nodes[nodes.length - 1]);

		if(addFirst) this.asyncInsert(1, 1, true, true);
		if(startIndex > 2) this.asyncInsert(2, startIndex - 1, true, true);
		if(endIndex < this.countAll) this.asyncInsert(endIndex + 1, this.countAll, false, true);
	}
	/**
	 * 更新をチェックし新着レスがあれば挿入します。
	 */
	reload(noScroll, background){
		const fn = "reload()";
		this.log.info(fn);

		const now = new Date();
		if((now.getTime() - this.date.getTime()) < 5000){
			this.status = "( ｰωｰ)「ふー」";
			this.setStatus(true);
			return;
		}
		Nodes.statusText.className = "throbber";
		this.setFavicon("throbber");
		if(Nodes.newMark){
			Nodes.newMark.parentNode.removeChild(Nodes.newMark);
		}
		this.date = now;
		if(!background){
			this.markAsRead();
		}

		AjaxGet(this.serverUrl + this.threadUrl + (this.countAll + 1) + "-" + "?AS=1")
		.then((html) => {
			const divTemp  = _doc.createElement("div");
			divTemp.innerHTML = html;
			const newContent = ResNodes.getContent(divTemp);
			newContent.id = "";
			const newItems = ResNodes.getContainers(newContent);
			if(newItems.length <= 1){
				if(!background || this.countUnread === 0){
					this.status = "( ｰωｰ)「新着なし」";
					this.countUnread = 0;
					this.countRead   = this.countAll;
				}else{
					this.status = "up";
				}
				this.setStatus(true);
				const newDiv = _doc.createElement("div");
				newDiv.id = "NewMark";
				Nodes.content.appendChild(newDiv);
				return;
			}
			const newres = newItems.length - 1;
			if(!background){
				this.countRead   = this.countAll;
				this.countUnread = newres;
			}else{
				this.countUnread += newres;
			}

			this.countAll = this.countRead + this.countUnread;
			this.setStatus(true);

			const newDiv = _doc.createElement("div");
			newDiv.id = "NewMark";
			Nodes.content.appendChild(newDiv);
			for(let i = 1; i < newItems.length; i++){
				Nodes.content.appendChild(newItems[i]);
			}

			window.setTimeout(() => {
				this.modifyContent(Nodes.content);
			}, 1);

			if(!noScroll && SkinPref.get("enableScrollToNewRes")){
				this.scrollToNewRes();
			}
			this.flagDigest = false;
		})
		.catch((e) => {
			this.log.err(fn + ":" + e.message);
		});
	}
	/**
	 * 指定されたレスまでスクロールします。
	 */
	jumpTo(e){
		const node = e.target;
		if(!node.classList.contains("resPointer")) return;

		const range = ResPopup.getAnchorItems(node.textContent);
		if(!range) return;

		const destination = Nodes.getRes(range.start);
		if(destination){
			window.scrollTo(0, destination.offsetTop - (Nodes.header.offsetTop + Nodes.header.offsetHeight));
		}else{
			const resItems = ResNodes.getContainers();
			const resStart = Nodes.getRes(1);
			const startIndex = Nodes.getResNumByContainer(resStart ? resItems[1] : resItems[0]);
			if(range.start < startIndex) this.asyncInsert(range.start, startIndex - 1, true, false);
		}
	}
	/**
	 * 改ページ処理を行います。
	 */
  movePage(type){
		const fn = "movePage(" + type + ")";
		this.log.info(fn);
		const ridx = SkinPref.get("valueReadBandWidth");
		const range = SelOpts.ReadBandWidth[(ridx < 0 || 2 < ridx) ? 0 : ridx];
		let pen = 0;
		let psn = 0;

		const matchRange = this.option.match(/^(\d{1,4})(\-)?(\d{1,4})?(n)?(#res\d{1,4})?$/);
		const matchLatest = this.option.match(/^l(\d{1,4})(n)?(#res\d{1,4})?$/);

		switch(type){
		case "prev":
			if      (matchRange){
				pen = parseInt(matchRange[1], 10) - 1;
				psn = pen - range + 1;
			}else if(matchLatest){
				pen = this.countRead - parseInt(matchLatest[1], 10);
				psn = pen - range + 1;
			}
			break;
		case "next": { // ブロックスコープを作成
			const matchNextRange2 = this.option.match(/^(\d{1,4})\-(\d{1,4})(n)?(#res\d{1,4})?$/);
			const matchNextRange1 = this.option.match(/^(\d{1,4})(\-)?(n)?(#res\d{1,4})?$/);
			const matchNextLatest = this.option.match(/^l(\d{1,4})(n)?$/);

			if      (matchNextRange2){
				psn = parseInt(matchNextRange2[2], 10) + 1;
				pen = psn + range - 1;
			}else if(matchNextRange1){
				psn = parseInt(matchNextRange1[1], 10) + range + 1;
				pen = psn + range - 1;
			}else if(matchNextLatest){
				pen = this.countAll;
				psn = pen - range + 1;
			}
			break;
		} // ブロックスコープの終了
		}

		if(psn < 1){
			psn = 1;
		}else if(psn > this.countAll){
			psn = this.countAll;
		}
		if(pen < 1){
			pen = range;
			location.href = this.serverUrl + this.threadUrl + psn + "-" + pen;
		}else{
			location.href = this.serverUrl + this.threadUrl + psn + "-" + pen + (type === "prev" ? "#res" + pen : "");
		}
	}
	resShow(node){
		node.removeAttribute("hide");
	}
	resHide(node){
		node.setAttribute("hide", "true");
	}
	isShow(node){
		return !node.hasAttribute("hide");
	}
}
// グローバル変数名へのマッピング
var ThreadDocument = new ThreadDocumentManager();
var TD = ThreadDocument; // エイリアスマッピング


/**
 * 名前を走査して、レス番号と名前の対応テーブルを管理するクラス
 */
class NameManager {
	constructor() {
		this.log = new SkinLog("Name", SkinLogLvl.WARNING);
		this.items = [];
		this.count = null;
		this.slipItems = [];
		this.countResSys = null;
		this.node_cache = null;
		this._style = null;
		this._colors = [];
		this._thresholds = [];
		this._lvnum = 0;
		this._isDivide = false;
		this._isColor = false;
	}
	/**
	 * プロパティを初期設定します。
	 */
	init(){
		this.count = 0;
		this._isColor = SkinPref.get("enableColoringSLIP");
		this._isDivide = SkinPref.get("enableDivideSLIP");
	}
	/**
	 * 処理を再度行って表示を更新します。
	 */
	update(){
		this.init();
		this.countSLIPs();
	}
	/**
	 * 名前欄のresSystemクラスの要素を調べ、SLIPコテハンなら要素に分解して対応テーブルを作ります。
	 */
	scanResSys(){
		const isDivide = this._isDivide;
		this.slipItems = [];
		Array.from(Nodes.content.querySelectorAll('.resName .resSystem')).forEach((elem) => {
			let html = elem.innerHTML;
			const matchv6 = html.match(/^\((\S+) (\S{4})-(\S{4}) \[(\S+)( \[上級国民\])?\]\)$/);
			const matchv5 = html.match(/^\((\S+) (\S{4})-(\S{4})\)$/);
			const matchv4 = html.match(/^\((\S+) (\S+)\)(●)?$/);
			const matchv3 = html.match(/^\((\S+)\)$/);

			if(matchv6){
				if(isDivide){
					const ronin = matchv6[5] ? matchv6[5] : '';
					html = '(<span class="slipName">' + matchv6[1] + '</span> <span class="slipAB">' +
						   matchv6[2] + '</span>-<span class="slipC">' + matchv6[3] + '</span> [<span class="slipIP">' +
						   matchv6[4] + '</span>' + ronin + '])';
					elem.innerHTML = html;
				}else{
					this.add(this.slipItems, elem.textContent, elem);
				}
			}
			else if(matchv5){
				if(isDivide){
					html = '(<span class="slipName">' + matchv5[1] + '</span> <span class="slipAB">' +
						   matchv5[2] + '</span>-<span class="slipC">' + matchv5[3] + '</span>)';
					elem.innerHTML = html;
				}else{
					this.add(this.slipItems, elem.textContent, elem);
				}
			}
			else if(matchv4){
				if(isDivide){
					const ronin = matchv4[3] ? matchv4[3] : '';
					html = '(<span class="slipName">' + matchv4[1] + '</span> <span class="slipIP">' +
						   matchv4[2] + '</span>)' + ronin;
					elem.innerHTML = html;
				}else{
					this.add(this.slipItems, elem.textContent, elem);
				}
			}
			else if(matchv3){
				const name = matchv3[1];
				if(/^[｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ0-9A-Z]+$/.test(name)){
					elem.className = "resSystem resSlip";
					if(isDivide){
						html = '(<span class="slipName">' + name + '</span>)';
						elem.innerHTML = html;
					}else{
						this.add(this.slipItems, elem.textContent, elem);
					}
				}else{
					const spName = ["HappyNewYear!","FAX!","HappyBirthday!","漢字の日","税","選挙行ったか？"];
					for(let i = 0, n = spName.length; i < n; i++){
						if(name === spName[i]){
							if(isDivide){
								html = '(<span class="slipName">' + name + '</span>)';
								elem.innerHTML = html;
							}else{
								this.add(this.slipItems, elem.textContent, elem);
							}
							break;
						}
					}
				}
			}
		});

		if(isDivide){
			Array.from(Nodes.content.querySelectorAll('.slipAB,.slipIP')).forEach((slip) => {
				const name = (slip.className === "slipAB") ? (slip.textContent + "-") : slip.textContent;
				this.add(this.slipItems, name, slip);
			});
		}
	}
	/**
	 * 名前欄を走査して対応テーブルを作ります。
	 */
	traverse(){
		const fn = "traverse()";
		this.log.info(fn);

		const nameItems = ResNodes.getNames();
		const n = nameItems.length;
		if(n === this.count) return false;
		if(this._isColor || this._isDivide) this.scanResSys();
		this.node_cache = nameItems;
		this.count = n;
		this.items = [];
		nameItems.forEach((elem) => {
			const resNum = parseInt(elem.parentNode.parentNode.getAttribute("res"), 10);
			if(resNum) this.add(this.items, elem.textContent, resNum);
		});
		return true;
	}
	/**
	 * 指定テーブルにデータを追加します。
	 */
	add(table,key,data){
		this.log.dbg("add(table," + key + ",data)");
		if(!table[key]) table[key] = [];
		table[key].push(data);
	}
	/**
	 * SLIPコテハンの色分けスタイルを作成します。
	 */
	createStyle(){
		if(this._style) this._style.clear();
		this._style = new StyleSheet('SLIPColorStyle');
		if(this._isDivide){
			this._colors.forEach((color, i) => this._style.insert('.slipAB[lv="' + (i + 1) + '"],.slipIP[lv="' + (i + 1) + '"] { background-color: ' + color + '; }'));
		}else{
			this._colors.forEach((color, i) => this._style.insert('.resSystem[lv="' + (i + 1) + '"] { background-color: ' + color + '; }'));
		}
	}
	/**
	 * 名前ごとのレスを集計し、オプションで2chのSLIPコテハン部の色分けを行います。
	 */
	countSLIPs(){
		if(Name.traverse()){
			let thrsStr = "", colorStr = "";
			if(this._isColor){
				thrsStr = SkinPref.get("valueColoringSLIPThreshold").split(",");
				colorStr = SkinPref.get("valueColoringSLIPBgColor").split(",");
				if(colorStr.length < thrsStr.length){
					thrsStr.length = colorStr.length;
				}else{
					colorStr.length = thrsStr.length;
				}
				this._colors = colorStr.map(color => color + "");
				this._thresholds = thrsStr.map(thrs => thrs - 0);
				this.createStyle();
			}

			for(let key in this.slipItems){
				let lv = 0;
				if(this._isColor){
					const cnt = this.slipItems[key].length;
					this._thresholds.every(thrs => (cnt < thrs) ? false : ++lv);
				}
				if(lv > 0){
					this.slipItems[key].forEach((elem) => elem.setAttribute("lv", lv));
				}else{
					this.slipItems[key].forEach((elem) => elem.removeAttribute("lv"));
				}
			}
		}
	}
}
// グローバル変数名へのマッピング
var Name = new NameManager();


/**
 * ID を走査して、レス番号と ID の対応テーブルを管理するクラス
 */
class IDManager {
	constructor() {
		this.log = new SkinLog("ID", SkinLogLvl.WARNING);
		this.items = [];
		this.count = null;
		this.node_cache = null;
		this._style = null;
		this._colors = [];
		this._thresholds = [];
		this._isCount = false;
		this._isColor = false;
		this._isIDIcon = false;
		this._isShowIdx = false;
	}
	/**
	 * プロパティを初期設定します。
	 */
	init(){
		this.count = 0;
		this._isCount = SkinPref.get("enableShowIDCount");
		this._isColor = SkinPref.get("enableColoringID");
		this._isIDIcon = SysPref.enableIDIconforColle && (SkinPref.get("valueSkinStyle") === 5);
		this._isShowIdx = SkinPref.get("enableShowIDCountIndex");
	}
	/**
	 * 処理を再度行って表示を更新します。
	 */
	update(){
		this.init();
		this.countIDs();
	}
	/**
	 * 有効なIDか判定します。
	 */
	isValidID(id){
		if(!id || id.length < 3 || id.indexOf("???") !== -1) return false;
		return true;
	}
	/**
	 * ID を走査して、対応テーブルを作ります。
	 */
	traverse(){
		const fn = "traverse()";
		this.log.info(fn);

		const idItems = ResNodes.getIDs();
		const n = idItems.length;
		if(n === this.count) return false;

		this.node_cache = idItems;
		this.count = n;
		this.items = [];
		idItems.forEach((node) => {
			const id = node.getAttribute("rel");
			if(this.isValidID(id)){
				const resNum = parseInt(node.parentNode.parentNode.getAttribute("res"), 10);
				if(resNum){
					if(!this.items[id]) this.items[id] = [];
					this.items[id].push(resNum);
				}
			}
		});
		return true;
	}
	/**
	 * IDの色分けスタイルを作成
	 */
	createStyle(){
		if(this._style) this._style.clear();

		this._style = new StyleSheet('IDColorStyle');
		this._colors.forEach((color, i) => {
			this._style.insert('.resID[lv="' + (i + 1) + '"], .resMesID span[lv="' + (i + 1) + '"] { color: ' + color + '; }');
		});
	}
	/**
	 * IDごとのレスを集計し、ID欄の色分けおよび発言回数表示を追加します。
	 */
	countIDs(){
		if(ID.traverse()){
			let thrsStr = "", colorStr = "";
			if(this._isColor){
				thrsStr = SkinPref.get("valueColoringIDThreshold").split(",");
				colorStr = SkinPref.get("valueColoringIDColor").split(",");
				if(colorStr.length < thrsStr.length){
					thrsStr.length = colorStr.length;
				}else{
					colorStr.length = thrsStr.length;
				}
				this._colors = colorStr.map(color => color + "");
				this._thresholds = thrsStr.map(thrs => thrs - 0);
				this.createStyle();
			}

			const nth = [];
			ID.node_cache.forEach((elem) => {
				const id = elem.getAttribute("rel");
				const icon = this._isIDIcon ? Nodes.getResIDIcon(elem.parentNode) : null;
				let lv = 0;
				if(ID.isValidID(id) && ID.items[id]){
					const cnt = ID.items[id].length;
					if(cnt > 1){
						if(this._isCount){
							let str = ["ID:" + id + " (", "", cnt + ")"];
							if(this._isShowIdx){
								nth[id] = !nth[id] ? 1 : nth[id] + 1;
								str[1] = nth[id] + "/";
							}
							elem.textContent = str.join("");
						}
						elem.addEventListener("click", IDExtract, false);
					}
					if(this._isColor){
						this._thresholds.every(thrs => (cnt < thrs) ? false : ++lv);
						elem.setAttribute("lv", lv);
						if(icon) icon.setAttribute("lv", lv);
						return;
					}
				}
				if(lv === 0){
					elem.removeAttribute("lv");
					if(icon) icon.removeAttribute("lv");
				}
			});

			ResNodes.getResMesIDs().forEach((elem) => {
				const anchorNode = elem.children[0];
				let lv = 0;
				const matchMesID = anchorNode.className.match(/mesID_([^\s]+)/);
				if(matchMesID){
					const id = matchMesID[1];
					if(ID.items[id]){
						if(this._isColor){
							const cnt = ID.items[id].length;
							this._thresholds.every(thrs => (cnt < thrs) ? false : ++lv);
							anchorNode.setAttribute("lv", lv);
							return;
						}
						anchorNode.addEventListener("click", IDExtract, false);
					}
				}
				if(lv === 0){
					anchorNode.removeAttribute("lv");
				}
			});
		}
	}
}
// グローバル変数名へのマッピング
var ID = new IDManager();


/**
 * レスアンカーを走査して、レス番号とレス元の番号との対応テーブルを管理するクラス
 */
class TrackbackManager {
	constructor() {
		this.log = new SkinLog("Trackback", SkinLogLvl.WARNING);
		/**
		 * レス番号とレス元の番号との対応テーブル
		 * @type {Object}
		 */
		this.items = [];
		/**
		 * 走査したレスの件数
		 * @type {number}
		 */
		this.count = null;
	}
	/**
	 * 全角文字で表記された数字を、数値型に変換します。
	 */
	toNarrow(str){
		return parseInt(str.replace(/([\uFF10-\uFF19])/g, (n) => { return String.fromCharCode(n.charCodeAt(0) - 0xFEE0); }), 10);
	}
	/**
	 * 指定のレス番号についたレスの数を取得します。
	 */
	getCount(resNum){
		this.log.info("getCount(" + resNum + ")");
		if(!this.items[resNum]) return 0;
		return this.items[resNum].length;
	}
	/**
	 * 指定のレス番号についたレスについて、レスアンカーのリストを生成して返します。
	 */
	getAnchorElements(resNum){
		if(!this.items[resNum]) return null;
		const content = _doc.createDocumentFragment();
		const span = _doc.createElement("span");
		const a = _doc.createElement("a");
		a.className = "resPointer";
		const f = ThreadDocument.jumpTo.bind(ThreadDocument);

		for(let i = 0, n = this.items[resNum].length; i < n; i++){
			const item = a.cloneNode(false);
			item.appendChild(_doc.createTextNode(">>" + this.items[resNum][i]));
			item.addEventListener("click", f, false);
			content.appendChild(item);
			if(i !== n - 1){
				const space = span.cloneNode(false);
				space.appendChild(_doc.createTextNode(" "));
				content.appendChild(space);
			}
		}
		return content;
	}
	/**
	 * 指定の要素に、逆参照情報を追加します。
	 */
	appendTo(content, resNum){
		if(!this.items[resNum]) return;
		const e = _doc.createElement("span");
		e.className = "trackBack";
		e.appendChild(_doc.createTextNode("(参照:"));
		e.appendChild(this.getAnchorElements(resNum));
		e.appendChild(_doc.createTextNode(")"));
		content.appendChild(e);
	}
	/**
	 * レスを走査して、対応テーブルを作ります。
	 */
	traverse(force){
		if(force) this.count = 0;
		const TRACKBACK_LIMIT = 20;
		const expAnchor = new RegExp(/([0-9\uFF10-\uFF19]{1,4})[\-\uFF0D]?([0-9\uFF10-\uFF19]{0,4})/);
		const num = ResNodes.getResAnchors().length;
		if(num === this.count) return;
		this.count = num;
		this.items = [];

		ResNodes.getResAnchors().forEach((anchor) => {
			const parent_node = anchor.parentNode;
			anchor.textContent.split(",").forEach((str) => {
				const matchAnchor = str.match(expAnchor);
				if(matchAnchor){
					const start = this.toNarrow(matchAnchor[1]);
					let end = matchAnchor[2];
					end = end ? this.toNarrow(end) : start;
					if((end - start) < TRACKBACK_LIMIT){
						let srcIndex = parent_node.id.slice(4);
						srcIndex = srcIndex ? srcIndex : parent_node.parentNode.id.slice(4);
						if(srcIndex){
							for(let destIndex = start; destIndex <= end; destIndex++){
								if(!this.items[destIndex]){
									this.items[destIndex] = [];
									this.items[destIndex].push(srcIndex);
								}else if(this.items[destIndex].indexOf(srcIndex) === -1){
									this.items[destIndex].push(srcIndex);
								}
							}
						}
					}
				}
			});
		});
	}
}
// グローバル変数名へのマッピング
var Trackback = new TrackbackManager();


/**
 * IDの抽出機能を管理するクラス
 */
class IDExtractManager {
	constructor() {
		this.log = new SkinLog("IDExtract", SkinLogLvl.WARNING);
		/**
		 * 抽出中の ID
		 * @type {string}
		 */
		this.id = "";
		/**
		 * Ctrlキー必要
		 * @type {boolean}
		 */
		this._hotkey = false;
		/**
		 * 抽出する
		 * @type {boolean}
		 */
		this._pickup = false;
	}
	/**
	 * スレッド表示のオプションで抽出が要求された場合、指定された ID を持つレスのみを表示します。
	 */
	init(){
		const fn = "init()";
		this.log.info(fn);
		this._hotkey = (SkinPref.get("valueIDPickupHotkey") > 0);
		this._pickup = (SkinPref.get("valueIDPickupResult") > 0);

		if(!location.href.match(/\?id=/)) return;
		const id = RegExp.rightContext;
		if(!id.match(/^ID:/)) return;
		const idvalue = RegExp.rightContext;
		if(idvalue.length < 3) return;
		if(idvalue.indexOf("???") !== -1) return;

		Trackback.traverse();
		let idCount  = 0;
		ResNodes.getContainers().forEach((elem) => {
			if(Nodes.getResID(Nodes.getResHeader(elem)).textContent.indexOf(id) !== -1){
				Trackback.appendTo(Nodes.getResBody(elem), Nodes.getResNumByContainer(elem));
				TD.resShow(elem);
				idCount++;
			}else{
				TD.resHide(elem);
			}
		});

		ThreadDocument.status = id + " のレス (" + idCount + "回)";
		ThreadDocument.setStatus();
		this.id = id;
	}
	/**
	 * プロパティを更新します。
	 */
	update(){
		this._hotkey = (SkinPref.get("valueIDPickupHotkey") > 0);
		this._pickup = (SkinPref.get("valueIDPickupResult") > 0);
	}
	/**
	 * イベントを処理します。
	 */
	handleEvent(e){
		let class_name = e.target.className;
		switch(e.type){
		case "click":
			if(this._hotkey && !e.ctrlKey) return;
			if(class_name.match(/^resID/)){
				Nodes.findBoxText.value = "id:"  + e.target.getAttribute("rel");
			}else if(class_name.match(/mesID_/)){
				const pos = class_name.indexOf(" ");
				if(pos > -1) class_name = class_name.slice(0, pos);
				Nodes.findBoxText.value = "id:"  + class_name.slice(6);
			}else{
				return;
			}
			if(!FindBox.isVisible) FindBox.show();
			FindBox.find(true, this._pickup);
		}
	}
}
// グローバル変数名へのマッピング
var IDExtract = new IDExtractManager();


/**
 * レス番号部のイベント処理を管理するクラス
 */
class ResNumberManager {
	constructor() {
		this.log = new SkinLog("ResNumber", SkinLogLvl.WARNING);
	}
	/**
	 * イベントリスナを登録します。
	 */
	startup(){
		this.log.info("init()");
		window.addEventListener("click", this, true);
	}
	/**
	 * イベントを処理します。
	 */
	handleEvent(e){
		if(e.type !== "click") return;
		try{
			if(!e.target.parentNode.classList.contains("resNumber")) return;
		}catch(err){
			return;
		}
		const container = ResNodes.getParentContainer(e.target);
		const resNum = Nodes.getResNumByContainer(container);
		switch(e.button){
		case 0:
			ThreadDocument.writeTo(resNum);
			e.preventDefault();
			break;
		case 1:
			ResImage.embed(container, e.ctrlKey);
			e.preventDefault();
		}
	}
}
// グローバル変数名へのマッピング
var ResNumber = new ResNumberManager();



/**
 * 画像・動画のインライン表示を管理するクラス
 */
class ResImageManager {
	constructor() {
		this.log = new SkinLog("ResImage", SkinLogLvl.WARNING);
		/**
		 * 埋め込み画像・動画フレームの配列
		 * @type {Array<Element>}
		 */
		this.imageList = [];
		/**
		 * マウスオーバー監視中
		 * @type {boolean}
		 */
		this.enableMouseOver = false;
		/**
		 * 遅延読み込み処理中
		 * @type {boolean}
		 */
		this.isLoading = false;
		/**
		 * 表示範囲外もすべて読み込む
		 * @type {boolean}
		 */
		this.isPreload = false;
		/**
		 * 埋め込み画像をサムネイルにする
		 * @type {boolean}
		 */
		this.isThumbnailImg = false;
		/**
		 * 埋め込みGIFをサムネイルにする
		 * @type {boolean}
		 */
		this.isThumbnailGif = false;
		/**
		 * 遅延読込用タイムアウトID
		 * @type {number}
		 */
		this.timeoutID = null;
		/**
		 * 遅延読込予約リスト
		 * @type {Array<Element>}
		 */
		this.lazyItem = [];
		/**
		 * 同時読み込みカウンタ
		 * @type {number}
		 */
		this.loadCount = 0;
		/**
		 * 読み込み完了数
		 * @type {number}
		 */
		this.doneCount = 0;
		/**
		 * 読み込みエラー数
		 * @type {number}
		 */
		this.errorCount = 0;
		/**
		 * 同時読み込み上限数
		 * @type {number}
		 */
		this.loadMax = 0;
		/**
		 * 同時読み込み下限数
		 * @type {number}
		 */
		this.loadMin = 0;
		/**
		 * 読込間隔msec
		 * @type {number}
		 */
		this.interval = 0;
		this.imageSizeIdx = 0;
		this.videoSizeIdx = 0;
		this.isEmbedVideo = false;
		this.isNoPopup = false;
		this.isGroup = false;
		this.isThumnailImg = false;
		this.isThumnailGif = false;
		/**
		 * 強制埋め込みモード
		 * @type {boolean}
		 */
		this.forceEmbed = false;
	}
	/**
	 * 埋め込み画像のサイズ
	 * @type {Object}
	 */
	get imageSize(){
		return SelOpts.EmbedImageSize[this.imageSizeIdx];
	}
	/**
	 * 埋め込み動画のサイズ
	 * @type {Object}
	 */
	get videoSize(){
		return SelOpts.EmbedVideoSize[this.videoSizeIdx];
	}
	/**
	 * プロパティを初期設定します。
	 */
	init(){
		this.imageSizeIdx = SkinPref.get("valueEmbedImageSize");
		this.videoSizeIdx = SkinPref.get("valueEmbedVideoSize");
		this.isEmbedVideo = !SkinPref.get("enableEmbedImageWithoutVideo");
		this.interval = SkinPref.get("valueLazyloadInterval");
		this.loadMax = SkinPref.get("valueLazyloadMax");
		this.loadMin = SkinPref.get("valueLazyloadMin");
		this.isPreload = SkinPref.get("enableEmbedImagePreLoad");
		this.isNoPopup = !SkinPref.get("enableEmbedImageWithPopup");
		this.isGroup = SkinPref.get("enableEmbedImageGroup");
		this.isThumnailImg = SkinPref.get("enableThumbnailImage");
		this.isThumnailGif = !SkinPref.get("enableThumbnailWithoutGif");
	}
	/**
	 * プロパティを更新します。
	 */
	update(){
		this.init();
	}
	/**
	 * イベントを処理します。
	 */
	handleEvent(e){
		switch(e.type){
			case "scroll": {
				this.checkLazyload();
				break;
			}
			case "mouseover": {
				const target = e.target;
				if(target.className.match(/embedInline|embedLast/) && target.getAttribute("state") === "ready"){
					if(target.getAttribute("type").indexOf("image") === 0){
						this.loadImage(target, target.getAttribute("src"));
					}else{
						this.loadVideo(target, target.getAttribute("src"));
					}
				}
				break;
			}
			case "load": {
				let target = e.target;
				const parent = target.parentNode;
				if(parent.className.match(/embedInline|embedLast/)){
					target.removeEventListener("load", this, false);
					this.loadCount--;
					parent.setAttribute("state", "done");
					this.log.dbg("<load> src=" + parent.getAttribute("src"));
					this.doneCount++;
					if(parent.getAttribute("type").indexOf("image") === 0){
						const isGif = parent.getAttribute("type") === "image-gif";
						const maxW = this.imageSize.width, maxH = this.imageSize.height;
						const srcW = target.naturalWidth,  srcH = target.naturalHeight;
						const f = (srcW > srcH ? maxW / srcW : maxH / srcH) * 2;
						if(!this.isThumnailImg || (isGif && !this.isThumnailGif)){
							target.className = "embedImage";
							target.style.maxWidth = maxW + "px";
							target.style.maxHeight = maxH + "px";
							target.style.visibility = "visible";
							parent.style.width = target.offsetWidth + "px";
							parent.style.height = target.offsetHeight + "px";
						}else{
							const dstW = f * srcW;
							const dstH = f * srcH;
							const canvas = _doc.createElement("canvas");
							canvas.width  = dstW;
							canvas.height = dstH;
							canvas.className = "embedImage";
							canvas.style.maxWidth = maxW + "px";
							canvas.style.maxHeight = maxH + "px";
							const ctx = canvas.getContext("2d");
							try{
								ctx.drawImage(target, 0, 0, srcW, srcH, 0, 0, dstW, dstH);
							}catch(err){
								this.log.warn(err);
							}
							parent.removeChild(target);
							target = null;
							parent.appendChild(canvas);
							parent.style.width = canvas.offsetWidth + "px";
							parent.style.height = canvas.offsetHeight + "px";
						}
					}else{
						parent.style.width = target.offsetWidth + "px";
						parent.style.height = target.offsetHeight + "px";
					}

					if(this.isLoading && this.loadCount < this.loadMin) this.checkLazyload();
				}
				this.checkFinish();
				break;
			}
			case "error": {
				const target = e.target;
				const parent = target.parentNode;
				if(parent.className.match(/embedInline|embedLast/)){
					target.removeEventListener("load", this, false);
					this.loadCount--;
					parent.setAttribute("state", "error");
					parent.title = "エラー";
					this.log.err("<error> src=" + parent.getAttribute("src"));
					this.errorCount++;
					parent.removeChild(target);
					parent.style.width = "16px";
					parent.style.height = "16px";

					if(this.isLoading && this.loadCount < this.loadMin) this.checkLazyload();
				}
				this.checkFinish();
				break;
			}
		}
	}
	/**
	 * 埋め込み画像・動画の遅延読込を開始します。
	 */
	startLazyload(){
		const fn = "startLazyload()";
		this.log.info(fn);
		if(this.isLoading){
			this.endLazyload();
		}
		let sel = 'div[aboned="false"] div[type|="image"]';
		if(this.isEmbedVideo){
			sel += ',div[aboned="false"] div[type="video"]';
		}

		const middleOffset = _doc.body.scrollTop + _doc.body.clientHeight / 2 - window.pageYOffset;
		this.imageList = Array.from(_doc.querySelectorAll(sel)).sort((a, b) => {
			return Math.abs((a.getBoundingClientRect()).top - middleOffset) -
			       Math.abs((b.getBoundingClientRect()).top - middleOffset);
		});

		this.lazyItem = [];
		this.loadCount = 0;
		this.doneCount = 0;
		this.errorCount = 0;
		this.isLoading = true;
		this.checkLazyload();
		if(!this.isPreload){
			window.addEventListener("scroll", this, false);
		}
	}
	/**
	 * 埋め込み画像・動画の遅延読込を終了します。
	 */
	endLazyload(){
		this.log.info("endLazyload()");
		if(!this.isPreload){
			window.removeEventListener("scroll", this, false);
		}
		this.isLoading = false;
	}
	/**
	 * 埋め込み画像・動画要素に対して遅延読込を予約します。
	 */
	checkLazyload(){
		const viewTop = _doc.body.scrollTop;
		const viewBottom = viewTop + _doc.body.clientHeight;
		let remain = 0;
		const fn = "checkLazyload()";
		this.log.info(fn);
		if(!this.imageList) return;
		this.imageList.forEach((frame) => {
			this.log.dbg("src=" + frame.getAttribute("src"));
			if(frame.getAttribute("state") === "ready"){
				const top = (frame.getBoundingClientRect()).top + window.pageYOffset;
				if(this.loadCount < this.loadMax){
					this.log.dbg("viewTop=" + viewTop + ", viewBottom=" + viewBottom + ", top=" + top);
					if((viewTop < top && top < viewBottom) || this.isPreload){
						frame.setAttribute("state", "lazy");
						this.lazyItem.push(frame);
						this.loadCount++;
						return;
					}
				}
				remain++;
			}
		});
		this.log.info("checkLazyload() queue=" + this.lazyItem.length + ", remain=" + remain + "/" + this.imageList.length);
		if(remain === 0) this.endLazyload();

		if(this.lazyItem.length > 0){
			if(this.timeoutID){
				window.clearTimeout(this.timeoutID);
			}
			this.timeoutID = window.setTimeout(this.execLazyload.bind(this), this.interval);
		}
	}
	/**
	 * 予約済みの画像・動画の遅延読込を実行します。
	 */
	execLazyload(){
		this.log.dbg("execLazyload()");
		this.timeoutID = null;

		const frame = this.lazyItem.shift();
		if(!frame) return;
		if(frame.getAttribute("type").indexOf("image") === 0){
			this.loadImage(frame, frame.getAttribute("src"));
		}else{
			this.loadVideo(frame, frame.getAttribute("src"));
		}

		if(this.lazyItem.length > 0){
			this.timeoutID = window.setTimeout(this.execLazyload.bind(this), this.interval);
		}
	}
	/**
	 * 埋め込み画像要素を作成して読み込みます。
	 */
	loadImage(frame, src){
		this.log.dbg("loadImage(frame,src=" + src + ")");
		const size = this.imageSize;
		frame.removeEventListener("mouseover", this, false);
		frame.setAttribute("state", "loading");
		const img = new Image();
		img.style.maxWidth = size.width + "px";
		img.style.maxHeight = size.height + "px";
		img.style.visibility = "hidden";
		img.addEventListener("load", this, false);
		img.addEventListener("error", this, false);
		img.src = src;
		frame.appendChild(img);
	}
	/**
	 * 埋め込み動画要素を作成して読み込みます。
	 */
	loadVideo(frame, src){
		this.log.dbg("loadVideo(frame,src=" + src + ")");
		frame.removeEventListener("mouseover", this, false);
		frame.setAttribute("state", "loading");
		const video = VideoPopup.getElement(src, true);
		if(!video) return;
		video.addEventListener("load", this, false);
		video.addEventListener("error", this, false);
		frame.appendChild(video);
	}
	/**
	 * 画像・動画の読込監視を開始します。
	 */
	watch(){
		this.log.info("watch()");
		if(SkinPref.get("enableEmbedImageAutoLoad")){
			if(this.enableMouseOver){
				window.removeEventListener("mouseover", this, false);
				this.enableMouseOver = false;
			}
			if(ThreadDocument.isLoaded()) this.startLazyload();
		}else{
			if(!this.enableMouseOver){
				window.addEventListener("mouseover", this, false);
				this.enableMouseOver = true;
			}
		}
	}
	/**
	 * 画像・動画の読込が完了したときに呼ばれます。
	 */
	checkFinish(){
		if(this.imageList.length === (this.doneCount + this.errorCount)){
			this.imageList = [];
			this.log.info("Lazyload Finished: success=" + this.doneCount + ", error=" + this.errorCount);
		}
	}
	/**
	 * 画像・動画をインライン表示します
	 */
	embed(contextNode, noCheck){
		const fn = "embed(contextNode," + noCheck + ")";
		this.log.info(fn);
		const embed_class = (this.isGroup) ? "embedLast" : "embedInline";
		const imageSize = this.imageSize;
		const videoSize = this.videoSize;

		if(this.forceEmbed){
			for(let node of (contextNode || Nodes.content).querySelectorAll(".resBody ." + embed_class)){
				const parent = node.parentNode;
				parent.removeChild(node);
			}
		}

		ResNodes.getOutLinks(contextNode).forEach((node) => {
			const blocked = node.className === "ivurBlockedLink";
			const ivurLink = node.className === "ivurLink";
			const src = (ivurLink ? "/ivur/" : "") + node.href;

			if(blocked) return;
			if(ImagePopup.isImage(src)){
				if(!noCheck){
					if(ImagePopup.isImageGrotesque(ResNodes.getResNumByOutLink(node))) return;
				}
				this.log.dbg("embed(): image url=" + node.href);
				if(this.forceEmbed || !node.getAttribute("is_embed")){
					if(this.isNoPopup) node.setAttribute("no_popup", "true");

					const frame = _doc.createElement("div");
					frame.className = embed_class;
					frame.style.width = imageSize.width + "px";
					frame.style.height = imageSize.height + "px";
					frame.setAttribute("type", "image" + (ImagePopup.isGif(node.href) ? "-gif" : ""));
					frame.setAttribute("src", src);
					frame.setAttribute("state", "ready");
					if(this.isGroup){
						if(node.parentNode.lastChild.className !== "embedGroup"){
							const box = _doc.createElement("div");
							box.className = "embedGroup";
							node.parentNode.appendChild(box);
						}
						node.parentNode.lastChild.appendChild(frame);
					}else{
						node.parentNode.insertBefore(frame, node.nextSibling);
					}
					node.setAttribute("is_embed", "true");
				}
			}
			else if(this.isEmbedVideo){
				if(this.forceEmbed || !node.getAttribute("is_embed")){
					if(this.isNoPopup) node.setAttribute("no_popup", "true");

					const videoSrc = VideoPopup.getVideoSource(node.href, true);
					if(!videoSrc) return;
					if(!noCheck){
						if(ImagePopup.isImageGrotesque(ResNodes.getResNumByOutLink(node))) return;
					}
					this.log.dbg("embed: video url=" + node.href);
					const frame = _doc.createElement("div");
					frame.className = embed_class;
					frame.style.width = videoSize.width + "px";
					frame.style.height = videoSize.height + "px";
					frame.setAttribute("type", "video");
					frame.setAttribute("src", videoSrc);
					frame.setAttribute("state", "ready");
					if(this.isGroup){
						if(node.parentNode.lastChild.className !== "embedGroup"){
							const box = _doc.createElement("div");
							box.className = "embedGroup";
							node.parentNode.appendChild(box);
						}
						node.parentNode.lastChild.appendChild(frame);
					}else{
						node.parentNode.insertBefore(frame, node.nextSibling);
					}
					node.setAttribute("is_embed", "true");
				}
			}
		});

		this.watch();
	}
}
// グローバル変数名へのマッピング
var ResImage = new ResImageManager();


/**
 * ショートカットキーを管理するクラス
 */
class KeyInputManager {
	constructor() {
		this.log = new SkinLog("KeyInput", SkinLogLvl.WARNING);
		this.keymap = {
			'Escape': 		'Cancel',
			'F5': 			'UpdateThread',
			'n':			'ScrollToNew',
			'Shift+Alt+l':	'ScrollToNew',
			'j':			'ScrollToPrevPost',
			'ArrowLeft':	'ScrollToPrevPost',
			'k':			'ScrollToNextPost',
			'ArrowRight':	'ScrollToNextPost',
			'Control+ArrowUp':	'ScrollToTop',
			'Control+ArrowDown':'ScrollToEnd',
			'h':					'ScrollToPrevPage',
			'Control+ArrowLeft':	'ScrollToPrevPage',
			'l':					'ScrollToNextPage',
			'Control+ArrowRight':	'ScrollToNextPage',
			'Alt+ArrowDown':	'AutoScroll',
			'w':			'OpenPostWizard',
			'Control+Enter':'OpenPostWizard',
			'Control+ ':	'ShowThreadAll',
			'a':			'ToggleAutoReload',
			'd':			'ToggleDigest',
			'p':			'TogglePopular',
			'f':				'ShowFindBox',
			'Control+Alt+f':	'ShowFindBox',
			'z':				'ShowAnalyseDialog',
			'o':				'ShowOptionDialog',
			'Alt+i': 		'EmbedImage',
			'Control+Alt+i':'EmbedImageNoCheck'
		};
		/**
		 * レス番号バッファ
		 * @type {string}
		 */
		this._numStr = "";
		/**
		 * 連続した数字キー入力と認識する間隔の最大値[ms]
		 * @type {number}
		 */
		this._thresholdTime = 800;
		/**
		 * タイムアウトID
		 * @type {number}
		 */
		this._timeoutId = null;
	}
	/**
	 * イベントリスナを登録します。
	 */
	startup(){
		this.log.info("init()");
		window.addEventListener("keypress", this, false);
	}
	/**
	 * イベントの処理を行います。
	 */
	handleEvent(e){
		let keyValue = e.key;
		switch(e.type){
		case "keypress":
			if(e.defaultPrevented) return;
			if(/textarea|input|select|button/i.test(e.target.tagName)) return;
			if(e.target === Nodes.findBoxText) return;
			if(AnalyseDialog && (AnalyseDialog.content.style.display !== "none")) return;
			if(OptionsDialog && OptionsDialog.isDisplay()) return;

			if(keyValue.length === 1){
				keyValue = keyValue.toLowerCase();
			}
			['Alt', 'Control', 'Shift'].forEach((modkey) => { if(e.getModifierState(modkey)) keyValue = modkey + "+" + keyValue; });
			this.log.dbg("key=" + keyValue);

			if(/^\d$/.test(keyValue)){
				e.preventDefault();
				this._numStr += keyValue;
				this.log.dbg("resNum=" + this._numStr);
				const node = ResNodes.getContainerByResNum(this._numStr);
				if(node) window.scrollTo(0, node.offsetTop - (Nodes.header.offsetTop + Nodes.header.offsetHeight));

				if(this._timeoutId) clearTimeout(this._timeoutId);
				this._timeoutId = window.setTimeout(() => { this._numStr = ""; }, this._thresholdTime);
			}else{
				this._numStr = "";
			}

			if(!this.keymap[keyValue]) return;
			switch(this.keymap[keyValue]){
			case 'UpdateThread':
				if(SkinPref.get("enableHookReload")){
					e.preventDefault();	ThreadDocument.reload();
				}
				break;
			case 'Cancel':
				e.preventDefault();
				{
					Popup.remove_last();
					AutoScroll.stop();
					Digest.enabled = false;
					Popular.enabled = false;
				}
				break;
			case 'ShowThreadAll':
				e.preventDefault();		ThreadDocument.showAll();
				break;
			case 'OpenPostWizard':
				e.preventDefault();		ThreadDocument.writeTo();
				break;
			case 'ToggleAutoReload':
				e.preventDefault();		AutoReload.toggle();
				break;
			case 'ToggleDigest':
				e.preventDefault();		Digest.toggle();
				break;
			case 'TogglePopular':
				e.preventDefault();		Popular.toggle();
				break;
			case 'ShowFindBox':
				e.preventDefault();		FindBox.show();
				break;
			case 'EmbedImage':
				e.preventDefault();		ResImage.embed(null, false);
				break;
			case 'EmbedImageNoCheck':
				e.preventDefault();		ResImage.embed(null, true);
				break;
			case 'ShowAnalyseDialog':
				e.preventDefault();		Dialog.showAnalyse();
				break;
			case 'ShowOptionDialog':
				e.preventDefault();		Dialog.showOption();
				break;
			case 'ScrollToNew':
				e.preventDefault();		ThreadDocument.scrollToNewRes();
				break;
			case 'ScrollToPrevPost':
				e.preventDefault();		PageScroller.prev();
				break;
			case 'ScrollToNextPost':
				e.preventDefault();		PageScroller.next();
				break;
			case 'ScrollToTop':
				e.preventDefault();		PageScroller.scrollTopEnd("top");
				break;
			case 'ScrollToEnd':
				e.preventDefault();		PageScroller.scrollTopEnd("end");
				break;
			case 'ScrollToPrevPage':
				e.preventDefault();		ThreadDocument.movePage("prev");
				break;
			case 'ScrollToNextPage':
				e.preventDefault();		ThreadDocument.movePage("next");
				break;
			case 'AutoScroll':
				e.preventDefault();		AutoScroll.start();
			}
		}
	}
}
// グローバル変数名へのマッピング
var KeyInput = new KeyInputManager();


/**
 * [検索/抽出] 機能を管理するクラス
 */
class FindBoxManager {
	constructor() {
		this.log = new SkinLog("FindBox", SkinLogLvl.WARNING);
		/**
		 * 既に初期化済みかどうか
		 * @type {boolean}
		 */
		this.inited = false;
		/**
		 * 検索/抽出実行前のスクロール位置
		 * @type {number}
		 */
		this.scrollY = -1;
		/**
		 * 強調表示か
		 * @type {boolean}
		 */
		this.is_strong = false;
	}
	/**
	 * 検索/抽出ボックスが表示されているかどうか
	 * @type {boolean}
	 */
	get isVisible(){
		return (Nodes.findBox.style.display === "block");
	}
	/**
	 * 検索/抽出ボックスを表示します。
	 */
	show(){
		this.log.info("show()");
		if(Nodes.findBox.style.display !== "block"){
			Titlebar.showBar();
			Nodes.findStrong.checked = SkinPref.get("enableFindHighlight");
			Nodes.findBox.style.display = "block";
			Nodes.content.setAttribute("find", "true");
			Nodes.findBoxText.focus();
		}else{
			this.hide();
		}
		if(!this.inited){
			this.inited = true;
			window.addEventListener("click",     this, false);
			window.addEventListener("mousedown", this, false);
			window.addEventListener("keypress",  this, false);
			Nodes.findBoxText.addEventListener("change", this, false);
		}
	}
	/**
	 * イベントを処理します。
	 */
	handleEvent(e){
		const regexp = /(find|findbox|findboxClear|findboxText|findObject|findContent|findShow|findStrong)/;
		switch(e.type){
		case "keypress":
			switch (e.keyCode){
			case 13: //Enter
				if(e.target === Nodes.findBoxText){
					this.find();
				}
				break;
			case 27: //Esc
				if(this.isVisible){
					if(Nodes.findBoxText.value.length === 0){
						this.hide();
					}
					this.clear();
				}
				break;
			}
			break;
		case "click":
			if(e.target.id === "findboxClear") this.clear();
			break;
		case "mousedown":
			if(!e.target.id.match(regexp) && e.target.tagName !== "OPTION" && !Nodes.findBoxText.value.length){
				this.hide();
			}
			break;
		case "change":
		}
	}
	/**
	 * 検索/抽出ボックスを非表示します。
	 */
	hide(){
		Nodes.findBox.style.display = "none";
		Nodes.content.removeAttribute("find");
	}
	/**
	 * 検索/抽出ボックスをクリアします。
	 */
	clear(){
		Nodes.findBoxText.value = "";
		Nodes.findBoxText.className = "";
		if(this.is_strong) window.setTimeout(this.unhighlight.bind(this), 1);
		ResNodes.getContainers().forEach((resItem) => {
			TD.resShow(resItem);
			resItem.classList.remove("resMatch");
		});
		if(this.scrollY !== -1) window.scrollTo(0, this.scrollY);
		this.scrollY = -1;
	}
	/**
	 * 正規表現に使用される文字列をエスケープします。
	 */
	escapeExpression(str){
		return str.replace(/([.*+?^${}()|[\]\/\\])/g, "\\$1");
	}
	/**
	 * 指定された文字列を強調表示します。
	 */
	highlight(str){
		const x = window.scrollX;
		const y = window.scrollY;
		const strong = _doc.createElement("strong");
		while(window.find(str)){
			const range = window.getSelection().getRangeAt(0);
			range.surroundContents(strong.cloneNode(false));
		}
		window.getSelection().removeAllRanges();
		window.scrollTo(x, y);
		this.is_strong = true;
	}
	/**
	 * 指定された文字列の強調表示を解除します。
	 */
	unhighlight(){
		const result = _doc.evaluate("//strong", _doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		const clearHighlight = (n) => {
			const doc = _doc.createDocumentFragment();
			for(let i = 0, len = n.childNodes.length; i < len; i++){
				doc.appendChild(n.childNodes[i]);
			}
			n.parentNode.replaceChild(doc, n);
		};

		for(let i = 0, n = result.snapshotLength; i < n; i++){
			const node = result.snapshotItem(i);
			window.setTimeout(clearHighlight, 1, node);
		}
		this.is_strong = false;
	}
	/**
	 * 検索/抽出を実行します。
	 */
	find(force, type){
		const scrollY = window.scrollY;
		const isNot  = (Nodes.findContent.value === "out") ? true : false;
		const isMark = (Nodes.findShow.value === "mark") ? true : false;
		if(isMark && Nodes.findBoxText.value === "") return;

		const setShow = (node, isShow, isMark, isNot) => {
			if(!isMark){
				((!isNot) ^ isShow) ? TD.resHide(node) : TD.resShow(node);
			}else{
				((!isNot) ^ isShow) ? node.classList.remove("resMatch") : node.classList.add("resMatch");
			}
		};

		const xpaths = {
			"name": ResNodes.getNames.bind(ResNodes),
			"num":  ResNodes.getNumbers.bind(ResNodes),
			"mail": ResNodes.getMails.bind(ResNodes),
			"date": ResNodes.getDates.bind(ResNodes),
			"id":   ResNodes.getIDs.bind(ResNodes),
			"beid": ResNodes.getBeIDs.bind(ResNodes),
			"body": ResNodes.getBodies.bind(ResNodes)
		};

		if(force){
			Nodes.findObject.value = "resOrg";
			Nodes.findContent.value = "in";
			if(type) Nodes.findShow.value = (type === 1 ? "only" : "mark");
		}

		let verb = null;
		let target = Nodes.findBoxText.value;

		switch(Nodes.findObject.value){
		case "resNumber":	verb = "num";	break;
		case "resName":		verb = "name";	break;
		case "resMail":		verb = "mail";	break;
		case "resDate":		verb = "date";	break;
		case "resID":		verb = "id";	break;
		case "resBeID":		verb = "beid";	break;
		case "resBody":		verb = "body";	break;
		default:
			if(Nodes.findBoxText.value.match(/^(name|num|mail|date|id|body):(.*)/i)){
				verb = RegExp.$1.toLowerCase();
				target = RegExp.$2;
			}
		}

		let isFound = false;
		let isNotFound = true;
		let topY = -1;
		if(verb){
			xpaths[verb]().forEach((elem) => {
				const text = (verb === "id") ? elem.getAttribute("rel") : elem.textContent;
				const node = ResNodes.getParentContainer(elem);
				if(text.indexOf(target) !== -1){
					isFound = true;
					setShow(node, true, isMark, isNot);
					if(topY === -1) topY = node.offsetTop;
				}else{
					isNotFound = false;
					setShow(node, false, isMark, isNot);
				}
			});
		}else{
			ResNodes.getContainers().forEach((node) => {
				if(node.textContent.match(this.escapeExpression(Nodes.findBoxText.value))){
					isFound = true;
					setShow(node, true, isMark, isNot);
					if(topY === -1) topY = node.offsetTop;
				}else{
					isNotFound = false;
					setShow(node, false, isMark, isNot);
				}
			});
		}

		if(isNot) isFound = ! isNotFound;
		Nodes.findBoxText.className = (isFound) ? "found" : "notfound";
		if(isFound){
			if(this.scrollY === -1) this.scrollY = scrollY;
			if(SkinPref.get("enableMoveAfterFind")){
				window.scrollTo(0, topY - Nodes.threadViewTop);
			}
			if(Nodes.findStrong.checked){
				window.setTimeout(this.highlight.bind(this), 1, Nodes.findBoxText.value);
			}
		}
	}
}
// グローバル変数名へのマッピング
var FindBox = new FindBoxManager();


/**
 * 自動更新機能を管理するクラス
 */
class AutoReloadManager {
	constructor() {
		this.log = new SkinLog("AutoReload", SkinLogLvl.WARNING);
		/**
		 * 自動更新に使うタイマー ID
		 * @type {number}
		 */
		this.timerID = 0;
		/**
		 * 開いているスレッドがアクティヴ状態かどうか
		 * @type {boolean}
		 */
		this.isActive = true;
		/**
		 * 実際に更新を要求するかどうか
		 * @type {boolean}
		 */
		this.requestReload = false;
		/**
		 * このスレッドが閉じられようとしているかどうか
		 * @type {boolean}
		 */
		this.isUnloading = false;
		/**
		 * インターバルの配列
		 * @type {Array<number>}
		 */
		this.INTERVAL = [15000, 30000, 60000, 180000, 300000, 600000];
		/**
		 * レス無しのカウンタ
		 * @type {number}
		 */
		this.noResCount = 0;
		/**
		 * さぼりレベル
		 * @type {number}
		 */
		this.saborinLv = 1;
		/**
		 * インターバル時間 (msec)
		 * @type {number}
		 */
		this.intervalMSec = 0;
		this.isBackground = false;
	}
	/**
	 * 各種イベントリスナを登録し、初期化を行います。
	 */
	startup(){
		const fn = "startup()";
		this.log.info(fn);
		if(SkinPref.get("enableAutoReloadOnLiveThread")){
			const regUrl = new RegExp(SkinPref.get("valueLiveThreadHost"));
			if(regUrl.test(TD.threadUrl)) this.enabled = true;
		}
		if(!SkinPref.get("enableAutoReloadWhenInactive")){
			window.addEventListener("beforeunload", () => { this.isUnloading = true; }, false);
			window.addEventListener("focus", () => {
				if(this.enabled && !this.isActive){
					this.isActive = true;
					ThreadDocument.setFavicon("", false);
					if(this.requestReload){
						if(!this.isUnloading){
							this.timerProc();
							this.enabled = true;
						}
						this.requestReload = false;
					}
				}
			}, false);
			window.addEventListener("blur", () => {
				if(this.enabled && this.isActive){
					this.isActive = false;
					ThreadDocument.setFavicon("", true);
				}
			}, false);
		}
		else{
			if(!SkinPref.get("enableStatusClearWhenInactive")){
				window.addEventListener("focus", () => { if(this.enabled) this.isBackground = false; }, false);
				window.addEventListener("blur",  () => { if(this.enabled) this.isBackground = true;  }, false);
			}
		}
	}
	/**
	 * 自動更新（固定インターバル）処理を行います。
	 */
	timerProc(){
		if(this.isActive){
			const items = ResNodes.getContainers();
			const lastItem = items[items.length - 1];
			const noScroll = (window.scrollY + window.innerHeight > lastItem.offsetTop + lastItem.offsetHeight) ? false : true;
			ThreadDocument.reload(noScroll, this.isBackground);
			this.requestReload = false;
		}else{
			this.requestReload = true;
		}
	}
	/**
	 * おまかせ更新（可変インターバル）処理を行います。
	 */
	timerProcAuto(){
		const lastIndex = ThreadDocument.countAll;
		const resItems = ResNodes.getContainers();
		const timePerRes = (new Date().getTime() - Analyse.getDate(Nodes.getResNumByContainer(resItems[0])).getTime()) / lastIndex;
		const pace = Analyse.toStringfromTimeDiff(timePerRes);

		let reloadSecond = 60 * 60;
		const matchMin = pace.match(/^(\d+)分/);
		const matchSec = pace.match(/^(\d+)([.]\d+)?秒/);
		if(matchMin){
			reloadSecond = parseInt(matchMin[1], 10) * 60;
		}else if(matchSec){
			reloadSecond = parseInt(matchSec[1], 10);
		}else{
			const idx = SkinPref.get("valueAutoReloadInterval");
			reloadSecond = this.INTERVAL[(idx < 0 || 5 < idx) ? 1 : idx] / 1000;
		}

		//無レスが続くと仕事を手を抜き始める。
		if(ThreadDocument.countUnread === 0){
			this.noResCount = this.noResCount + 1;
			if(this.noResCount === 3){
				this.noResCount = 0;
				this.saborinLv = this.saborinLv + 1;
			}
		}else{
			this.noResCount = 0;
			if(this.saborinLv > 1) this.saborinLv = this.saborinLv - 1;
		}
		this.setInterval(reloadSecond);
		this.timerProc();

		this.timerID = window.setTimeout(this.timerProcAuto.bind(this), this.intervalMSec);
		this.showIntervalText(1);
	}
	/**
	 * 自動更新の有効/無効をトグルで切り替えます。
	 */
	toggle(){
		this.enabled = !this.enabled;
	}
	/**
	 * インターバル時間を設定します。
	 */
	setInterval(sec){
		let reloadSec = ((sec < 15) ? 15 : sec) * this.saborinLv;
		if(reloadSec > 3600){
			reloadSec = 3600;
		}else if(reloadSec >= 60){
			reloadSec = Math.round(reloadSec / 60) * 60;
		}
		this.intervalMSec = reloadSec * 1000;
	}
	/**
	 * インターバル時間を表示します。
	 */
	showIntervalText(type){
		const MINUTE = 60000;
		const SECOND = 1000;
		const text = (this.intervalMSec >= MINUTE) ?
			(this.intervalMSec / MINUTE) + "分" :
			(this.intervalMSec / SECOND) + "秒";
		Nodes.reloadInfo.textContent = "【" + ((type === 1) ? "おまかせ" : "自動") + "更新中】 → " + text + "間隔...";
		Nodes.reloadInfo.style.visibility = "visible";
	}
	/**
	 * 自動更新の有効/無効
	 * @type {boolean}
	 */
	get enabled(){
		return (this.timerID !== 0);
	}
	set enabled(value){
		if(this.timerID){
			Nodes.reloadInfo.style.visibility = "hidden";
			if(SkinPref.get("enableChangeInterval")){
				window.clearTimeout(this.timerID);
			}else{
				window.clearInterval(this.timerID);
			}
			this.timerID = 0;
		}
		if(value){
			if(SkinPref.get("enableChangeInterval")){
				this.timerProcAuto();
			}else{
				const idx = SkinPref.get("valueAutoReloadInterval");
				const msec = this.INTERVAL[(idx < 0 || 5 < idx) ? 1 : idx];
				this.timerID = window.setInterval(this.timerProc.bind(this), msec);
				this.setInterval(msec / 1000);
				this.showIntervalText(0);
			}
		}
		ThreadDocument.setFavicon("");
	}
}
// グローバル変数名へのマッピング
var AutoReload = new AutoReloadManager();


/**
 * 要約機能を管理するクラス
 */
class DigestManager {
	constructor() {
		/**
		 * 要約が有効か
		 * @type {boolean}
		 */
		this._enabled = false;
	}
	/**
	 * 要約の有効/無効をトグルで切り替えます。
	 */
	toggle(){
		this.enabled = !this.enabled;
	}
	/**
	 * 要約機能の有効/無効
	 * @type {boolean}
	 */
	get enabled(){
		return this._enabled;
	}
	set enabled(value){
		this._enabled = value;
		const expSingleAnchor = new RegExp(/(>?>|\uFF1E)([0-9\uFF10-\uFF19]{1,4})/);
		Trackback.traverse();
		if(!Trackback.items) return;
		if(this._enabled){
			ResNodes.getBodies().forEach((body) => {
				if((Trackback.items[body.id.slice(4)]) || (body.textContent.match(expSingleAnchor))){
					TD.resShow(body.parentNode);
				}else{
					TD.resHide(body.parentNode);
				}
			});
		}else{
			ResNodes.getBodies().forEach((body) => TD.resShow(body.parentNode));
		}
	}
}
// グローバル変数名へのマッピング
var Digest = new DigestManager();


/**
 * 人気レス機能を管理するクラス
 */
class PopularManager {
	constructor() {
		/**
		 * 人気レス抽出表示が有効か
		 * @type {boolean}
		 */
		this._enabled = false;
	}
	/**
	 * 人気レス抽出表示の有効/無効をトグルで切り替えます。
	 */
	toggle(){
		this.enabled = !this.enabled;
	}
	/**
	 * 人気レス抽出表示の有効/無効
	 * @type {boolean}
	 */
	get enabled(){
		return this._enabled;
	}
	set enabled(value){
		this._enabled = value;
		const thrs = SkinPref.get("valuePopularPostThreshold");

		if(this._enabled){
			Trackback.traverse();
			ResNodes.getNumbers().forEach((elem) => {
				const resNum = elem.textContent;
				const tb = Trackback.items[resNum];
				const node = ResNodes.getContainerByResNum(resNum);
				(!tb || tb.length < thrs) ? TD.resHide(node) : TD.resShow(node);
			});
		}else{
			ResNodes.getContainers().forEach((node) => TD.resShow(node));
		}
	}
}
// グローバル変数名へのマッピング
var Popular = new PopularManager();


/**
 * しおり機能を管理するクラス
 */
class BookmarkManager {
	constructor() {
		this.log = new SkinLog("Bookmark", SkinLogLvl.WARNING);
		/**
		 * しおりが挿んであるレス番号
		 * @type {number}
		 */
		this.index = 0;
		/**
		 * しおり要素の幅
		 * @type {number}
		 */
		this.width = 0;
	}
	/**
	 * イベントリスナを登録し、しおりが挿んであるレスが非表示であれば表示させます。
	 * @return {number}		しおりが挿んであるレス番号
	 */
	init(){
		const fn = "init()";
		this.log.info(fn);

		if(!SysPref.disableStorage){
			window.addEventListener("mouseover", this, false);
			window.addEventListener("mouseout",  this, false);
			window.addEventListener("click",     this, false);
			if(TD.threadUrl){
				this.index = this.load(TD.threadUrl);
				if(this.index){
					let resStart = Nodes.getRes(this.index);
					if(resStart){
						this.jumpTo(resStart);
						this.insert(this.index, true);
					}else{
						const resItems = ResNodes.getContainers();
						resStart = Nodes.getRes(1);
						const startIndex = Nodes.getResNumByContainer(resStart ? resItems[1] : resItems[0]);

						let fromNo, toNo, isBefore;
						if(SkinPref.get("enableShowMarkToNew")){
							if(this.index < startIndex){
								fromNo = this.index;
								toNo = startIndex - 1;
								isBefore = true;
							}else{
								fromNo = this.index;
								toNo   = this.index;
								isBefore = false;
							}
						}else{
							fromNo = this.index;
							toNo =   this.index;
							isBefore = (this.index < startIndex);
						}
						ThreadDocument.asyncInsert(fromNo, toNo, isBefore, false, () => { this.insert(this.index, true); }, true);
					}
				}
			}
		}
		return this.index;
	}
	/**
	 * イベントを処理します。
	 * @param {event}	e	イベント
	 */
	handleEvent(e){
		const node = e.target;
		if((node.nodeType !== 1) || !node.classList.contains("resContainer")) return;

		switch(e.type){
		case "mouseover":
			if(e.clientX > _doc.body.clientWidth - 64){
				node.style.cursor = "pointer";
				node.title = (Nodes.getResNumByContainer(node) === this.index) ? "しおりを外す" : "しおりを挿入";
				node.title = node.title + "(" + (SkinPref.get("enableDirectBookmarking") ? "" : "CTRL+") + "クリック)";
			}else if(node.style.cursor === "pointer"){
				node.style.cursor = "auto";
				node.title = "";
			}
			break;
		case "mouseout":
			if(node.style.cursor === "pointer"){
				node.style.cursor = "auto";
				node.title = "";
			}
			break;
		case "click":
			if(SkinPref.get("enableDirectBookmarking") || e.ctrlKey){
				if((e.button === 0) && (e.clientX > _doc.body.clientWidth - 75)){
					const index = Nodes.getResNumByContainer(node);
					this.log.dbg("index=" + index);
					if(index === this.index){
						this.hide();
					}else{
						if(this.index && SkinPref.get("enableCheckReplaceBookmark")){
							if(!window.confirm("しおりを置き換えてもいいですか？")) return;
						}
						this.insert(index);
					}
				}
			}
		}
	}
	/**
	 * しおりを読み込みます。
	 */
	load(url){
		const bmkTbl = Storage.get("valueBookmarkIndex");
		if(!bmkTbl) return 0;

		const resNum = (bmkTbl[url] || 0);
		this.log.dbg("load(" + url + ") = " + resNum);
		return resNum;
	}
	/**
	 * しおりを保存します。
	 */
	save(url, resNum){
		this.log.dbg("save(" + url + "," + resNum + ")");
		const bmkTbl = Storage.get("valueBookmarkIndex");
		if(!bmkTbl) return;

		bmkTbl[url] = this.index = resNum;
		Storage.set("valueBookmarkIndex", bmkTbl);
	}
	/**
	 * しおりを挿入します。
	 */
	insert(resNum, noAnimation){
		const node = Nodes.getRes(resNum);
		if(node){
			let div = _doc.getElementById("bookmark");
			if(div) div.parentNode.removeChild(div);
			div = _doc.createElement("div");
			div.id = "bookmark";
			div.title = "しおりを外す";
			if(!SkinPref.get("enableDirectBookmarking")) div.title = div.title + "(CTRL+クリック)";
			div.onmousedown = (e) => { if(SkinPref.get("enableDirectBookmarking") || e.ctrlKey) this.hide(); };

			this.save(TD.threadUrl, resNum);

			node.parentNode.insertBefore(div, node);
			this.width = div.clientWidth;
			if(!noAnimation) this.show();
		}
	}
	/**
	 * しおりを実際に表示します。
	 */
	show(step){
		if(!step) step = 1;
		const div = _doc.getElementById("bookmark");
		if(div){
			if(step < this.width){
				div.style.width = step + "px";
				window.setTimeout(this.show.bind(this), 1, step * 4);
			}else{
				div.style.width = this.width + "px";
			}
		}
	}
	/**
	 * しおりを非表示します。
	 */
	hide(step){
		if(!step) step = 1;
		const div = _doc.getElementById("bookmark");
		if(div){
			if(step < this.width){
				div.style.width = (this.width - step) + "px";
				window.setTimeout(this.hide.bind(this), 1, step * 4);
			}else{
				const bmkTbl = Storage.get("valueBookmarkIndex");
				if(!bmkTbl) return;

				this.index = 0;
				if(TD.threadUrl in bmkTbl) delete bmkTbl[TD.threadUrl];
				Storage.set("valueBookmarkIndex", bmkTbl);
				div.parentNode.removeChild(div);
			}
		}
	}
	/**
	 * しおりのレスまでスクロールします。
	 */
	jumpTo(node){
		const fn = "jumpTo(node)";
		this.log.info(fn);
		if(this.index){
			if(!node){
				node = Nodes.getRes(this.index);
				if(!node) return;
				window.scrollTo(0, node.offsetTop - (Nodes.header.offsetTop + Nodes.header.offsetHeight));
			}
		}
	}
}
// グローバル変数名へのマッピング
var Bookmark = new BookmarkManager();


/**
 * オートスクロール機能を管理するクラス
 */
class AutoScrollManager {
	constructor() {
		this.log = new SkinLog("AutoScroll", SkinLogLvl.WARNING);
		this.timerID = null;
	}
	/**
	 * イベントを処理します。
	 */
	handleEvent(e){
		if(e.type !== "mousedown") return;
		if(e.target.id !== "autoScroll") this.stop();
	}
	/**
	 * オートスクロールを停止する。
	 */
	stop(force){
		this.log.info("stop(" + force + ")");
		if(force || !SkinPref.get("enableForceAutoScroll")){
			window.removeEventListener("mousedown", this, false);
			window.clearTimeout(this.timerID);
			this.timerID = null;
			_doc.getElementById("autoScroll").className = "scrolloff";
		}
	}
	/**
	 * オートスクロールを開始します。
	 */
	start(){
		this.log.info("start()");
		_doc.getElementById("autoScroll").className = "scrollon";
		window.addEventListener("mousedown", this, false);
		this.timerID = window.setInterval(() => {
			if(window.pageYOffset < _doc.documentElement.clientHeight - window.innerHeight){
				PageScroller.requestScroll(100);
			}else{
				this.stop();
			}
		}, 2000);
	}
	/**
	 * オートスクロールの動作を切り替えます。
	 */
	toggle(){
		if(this.timerID) this.stop(true); else this.start();
	}
}
// グローバル変数名へのマッピング
var AutoScroll = new AutoScrollManager();


/**
 * 左右カーソルキーによるスムーズスクロール機能を管理するクラス
 */
class PageScrollerManager {
	constructor() {
		this.log = new SkinLog("PageScroller", SkinLogLvl.WARNING);
		/**
		 * スクロール位置
		 * @type {number}
		 */
		this.y = null;
		/**
		 * 現在のスクロール対象のレス番号
		 * @type {number}
		 */
		this.index = null;
		/**
		 * 速度
		 * @type {number}
		 */
		this.currentVelocity = 0;
		/**
		 * 初速
		 * @type {number}
		 */
		this.initialVelocity = 0;
		/**
		 * ジェネレータ・イテレータ
		 * @type {iterator}
		 */
		this.gen = null;
		/**
		 * まだスクロール中かどうか
		 * @type {boolean}
		 */
		this.isBusy = false;
		/**
		 * ジェネレータの実行をリスタートすべきかどうか
		 * @type {boolean}
		 */
		this.shouldRestart = false;
	}
	/**
	 * 先頭/最後のレスへスクロールします。
	 */
	scrollTopEnd(to){
		this.log.info("scrollTopEnd(" + to + ")");
		const resArray = ResNodes.getContainers();
		let dest = null;
		if(to === "top"){
			dest = resArray[0];
		}else if(to === "end"){
			dest = resArray[resArray.length - 1];
		}
		if(dest){
			this.y = dest.offsetTop - (Nodes.header.offsetTop + Nodes.header.offsetHeight);
			this.requestScroll();
		}
	}
	/**
	 * 前のレスへスクロールします。
	 */
	prev(){
		this.log.info("prev()");
		const resItems = ResNodes.getContainers();
		if(this.isBusy){
			this.index--;
			for(let i = this.index ; i >= 0 ; i--){
				if(TD.isShow(resItems[i])) break;
				this.index--;
			}
			const res = resItems[this.index];
			if(res){
				this.y = res.offsetTop - (Nodes.header.offsetTop + Nodes.header.offsetHeight);
				this.requestScroll();
			}
		}else{
			const top = window.pageYOffset + (Nodes.header.offsetTop + Nodes.header.offsetHeight);
			for(let i = resItems.length - 1; i >= 0 ; --i){
				const resTop = resItems[i];
				if(TD.isShow(resTop) && (resTop.offsetTop < top)){
					if(resTop){
						this.index = i;
						this.y = resTop.offsetTop - (Nodes.header.offsetTop + Nodes.header.offsetHeight);
						this.requestScroll();
					}
					break;
				}
			}
		}
	}
	/**
	 * 次のレスへスクロールします。
	 */
	next(){
		this.log.info("next()");
		const resItems = ResNodes.getContainers();
		const n = resItems.length;
		if(this.isBusy){
			this.index++;
			for(let i = this.index ; i < n; i++){
				if(resItems[i].style.display !== "none") break;
				this.index++;
			}
			const res = resItems[this.index];
			if(res){
				this.y = res.offsetTop - (Nodes.header.offsetTop + Nodes.header.offsetHeight);
				this.requestScroll();
			}
		}else{
			const top    = window.pageYOffset + (Nodes.header.offsetTop + Nodes.header.offsetHeight);
			let resTop = null;
			for(let i = 0; i < n; i++){
				if(TD.isShow(resItems[i]) && (resItems[i].offsetTop > top)){
					resTop = resItems[i];
					if(resTop){
						this.index = i;
						this.y = resTop.offsetTop - (Nodes.header.offsetTop + Nodes.header.offsetHeight);
						this.requestScroll();
					}
					break;
				}
			}
			if(!resTop){
				this.index = n - 1;
				this.y = _doc.body.offsetHeight;
				this.requestScroll();
			}
		}
	}
	/**
	 * スクロールを要求します。
	 */
	requestScroll(diff){
		const fn = "requestScroll(diff)";
		this.log.info(fn);
		if(diff) this.y = window.pageYOffset + diff;
		if(!(SkinPref.get("enableSmoothScroll"))){
			window.scrollTo(0, this.y);
		}else if(this.isBusy){
			this.shouldRestart = true;
		}else{
			this.scroll();
		}
	}
	/**
	 * スクロール処理を実行・管理します。
	 */
	scroll(){
		this.log.info("scroll()");

		this.gen = this.execScroll();
		this.isBusy = true;
		const id = setInterval(() => {
			if(this.shouldRestart){
				this.gen.return(0);
				this.gen = this.execScroll();
				this.shouldRestart = false;
			}
			if(this.gen.next().done){
				clearInterval(id);
				this.isBusy = false;
			}
		}, 0, this.y);
	}
	/**
	 * 実際のスクロール処理を行います。これは yield を使ったジェネレータ（コルーチン）です。
	 */
	*execScroll(){
		const y1 = window.pageYOffset;
		let   y2 = parseInt(this.y, 10);
		if(isNaN(y2)) y2 = 0;
		if(y2 < 0) y2 = 0;
		if((y2 + window.innerHeight) > _doc.body.offsetHeight) y2 = _doc.body.offsetHeight - window.innerHeight;
		const delta = y2 - y1;
		let steps_half;
		switch (SkinPref.get("valueSmoothScrollFrames")){
			case 0: steps_half = 8; break;
			case 1: steps_half = 12; break;
			case 2: steps_half = 16; break;
			default: steps_half = 12;
		}
		this.initialVelocity = this.currentVelocity;
		const a1 = (((delta / 2) - this.initialVelocity) * 2) / (steps_half * steps_half);
		const ha1 = a1 / 2;

		let stepIdx = 0;
		for(let x = 0; x < steps_half; ++x){
			yield stepIdx++;
			window.scrollTo(0, this.initialVelocity + y1 + (ha1 * (x * x)));
			this.currentVelocity = (a1 * x);
		}

		const a2 = delta / (steps_half * steps_half);
		const ha2 = a2 / 2;
		for(let x = steps_half - 1; x >= 0; --x){
			yield stepIdx++;
			window.scrollTo(0, y2 - (ha2 * (x * x)));
			this.currentVelocity = (a2 * x);
		}

		window.scrollTo(0, y2);
		this.initialVelocity = 0;
		this.currentVelocity = 0;
	}
}
// グローバル変数名へのマッピング
var PageScroller = new PageScrollerManager();


/**
 * 複数レスの選択を管理するクラス
 */
class MultipleResSelectorManager {
	constructor() {
		this.log = new SkinLog("MultipleResSelector", SkinLogLvl.WARNING);
		/**
		 * マウスボタンが押されているかどうか
		 * @type {boolean}
		 */
		this.isButtonDown = false;
		/**
		 * 選択が開始された要素
		 * @type {Element}
		 */
		this.nodeFrom = null;
		/**
		 * 選択モード (true: 選択, false: 非選択)
		 * @type {boolean}
		 */
		this.modeSelect = false;
		/**
		 * ContextMenu オブジェクト
		 * @type {ContextMenu}
		 */
		this.customMenu = null;
		/**
		 * メニューを開いているか。
		 */
		this.is_open = false;
	}
	/**
	 * イベントリスナを登録します。
	 */
	startup(){
		this.log.info("startup()");
		if(SkinPref.get("enableMultiResSelect")){
			Nodes.content.addEventListener("mousedown",   this, true);
			Nodes.content.addEventListener("mouseup",     this, true);
			Nodes.content.addEventListener("mouseover",   this, true);
			Nodes.content.addEventListener("contextmenu", this, true);
		}
	}
	/**
	 * 選択されたレスのリストを取得します。
	 */
	getAnchorString(){
		const items = ResNodes.getContainers(Nodes.content, true);
		if(!items.length) return "";

		const indexes = [];
		let prevIndex = Nodes.getResNumByContainer(items[0]);
		let seqStart = 0;
		let index = null;
		for(let i = 1, n = items.length; i < n; i++){
			index = Nodes.getResNumByContainer(items[i]);
			if(index === (prevIndex + 1)){
				seqStart = (seqStart > 0) ? seqStart : prevIndex;
			}else{
				if(seqStart > 0){
					indexes.push(seqStart + "-" + prevIndex);
					seqStart = 0;
				}else{
					indexes.push(prevIndex);
				}
			}
			prevIndex = index;
		}
		if(index) indexes.push((seqStart > 0) ? seqStart + "-" + index : index);
		else      indexes.push(prevIndex);

		return indexes.join(",");
	}
	/**
	 * 要素の表示を強制します。
	 */
	ensureVisible(node){
		this.log.info("ensureVisible(node)");
		if(node.offsetTop < (window.scrollY + Nodes.header.offsetTop + Nodes.header.offsetHeight)){
			window.scrollTo(0, node.offsetTop - (Nodes.header.offsetTop + Nodes.header.offsetHeight));
		}else if((node.offsetTop + node.offsetHeight) > (window.scrollY + window.innerHeight)){
			window.scrollTo(0, node.offsetTop - window.innerHeight + node.offsetHeight);
		}
	}
	/**
	 * レスの選択状態を解除します。
	 */
	clear(){
		this.log.info("clear()");
		ResNodes.getContainers(Nodes.content, true).forEach((node) => node.classList.remove("resSelected"));
	}
	/**
	 * イベントから、マウスの座標が有効範囲内にあるかどうかを取得します。
	 */
	isEventInRange(e){
		return ((e.target.classList.contains("resContainer")) && (e.clientX <= 75)) ? true : false;
	}
	/**
	 * レス要素を選択します。
	 */
	selectNodes(nodeTo){
		this.log.info("selectNodes(nodeTo)");
		this.clear();
		const items = ResNodes.getContainers(Nodes.content);
		let firstItem = null;
		for(let i = 0, n = items.length; i < n; i++){
			const node = items[i];
			if(!firstItem) firstItem = (node === this.nodeFrom) ? this.nodeFrom : null;
			if(!firstItem) firstItem = (node === nodeTo)        ? nodeTo        : null;
			if( firstItem) node.classList.add("resSelected");

			if(firstItem !== node && (node === this.nodeFrom || node === nodeTo)) break;
		}
	}
	/**
	 * イベントを処理します。
	 */
	handleEvent(e){
		const node = e.target;
		const isLeftClick = (e.button === 0) ? true : false;
		const isClickOnly = (SkinPref.get("enableMultiResSelectNoModify"));
		switch(e.type){
		case "mouseup":
			this.isButtonDown = false;
			break;
		case "mousedown":
			this.isButtonDown = (this.isEventInRange(e) && isLeftClick) ? true : false;
			if(!this.isButtonDown){
				if(isLeftClick) this.clear();
				break;
			}
			if(!isClickOnly && !(e.ctrlKey || e.shiftKey) && !node.classList.contains("resSelected")){
				this.clear();
			}
			e.preventDefault();
			this.nodeFrom = node;
			if(this.isButtonDown && node.classList.contains("resContainer")){
				node.classList.toggle("resSelected");
				this.ensureVisible(node);
			}
			break;
		case "contextmenu":
			this.onContextMenu(e);
		}
	}
	/**
	 * contextmenu イベントを処理します。
	 */
	onContextMenu(e){
		if(this.isEventInRange(e)){
			this.customMenu = new ContextMenu(ResNumberContextMenu.items);
			this.customMenu.onClick = (caption, menuid) => {
				const numlistStr = this.getAnchorString();
				if(numlistStr === ""){
					this.log.warn("no selectors");
					return;
				}

				if(menuid === "reply"){
					ThreadDocument.writeTo(numlistStr);
				}else{
					const items = ResNodes.getContainers(Nodes.content, true);
					if(menuid.indexOf("copy") === 0){
						const buf = [];
						items.forEach((sel) => buf.push(ResNumberContextMenu.getCopyText(Nodes.getResNumByContainer(sel), menuid)));
						const sep = (menuid.indexOf("Jane") !== -1 || menuid.indexOf("Report") !== -1 || menuid === "copyUrl") ? "" : "\n";
						Clipboard.setClipboard(buf.join(sep));
					}else if(menuid === "toggleMyPost"){
						items.forEach((sel) => MyAndRep.toggleMyPost(Nodes.getResNumByContainer(sel)));
					}else if(menuid === "toggleMyID"){
						const ids = [];
						items.forEach((sel) => ids.push(ResNodes.getIDs(sel)[0].getAttribute("rel")));
						const uniqueIds = ids.filter((x, i, self) => (self.indexOf(x) === i));
						uniqueIds.forEach((id) => MyAndRep.toggleMyID(id));
					}else if(menuid.indexOf("replace") === 0){
						const forceBadAnchor = (menuid === "replaceStr") ? false : true;
						const forceReplace = (menuid === "replaceAnchor") ? false : true;
						items.forEach((sel) => ThreadDocument.modifyContent(sel, forceBadAnchor, forceReplace));
					}else if(menuid.indexOf("embedImage") === 0){
						const nocheck = (menuid === "embedImageAll") ? true : false;
						items.forEach((sel) => ResImage.embed(sel, nocheck));
					}
				}
			};
			this.customMenu.onRemove = () => {
				this.customMenu = null;
				this.is_open = false;
			};
			this.customMenu.show(e.clientX, e.clientY);
			this.is_open = true;
			e.preventDefault();
			e.stopPropagation();
		}
	}
}
// グローバル変数名へのマッピング
var MultipleResSelector = new MultipleResSelectorManager();


/**
 * Firefox の検索でヘッダが隠れる問題に対する対処を行うクラス
 */
class FxFindHandlerManager {
	constructor() {
		this.log = new SkinLog("FxFindHandler", SkinLogLvl.WARNING);
		/**
		 * ドラッグ中かどうか
		 * @type {boolean}
		 */
		this.isDragging = false;
		/**
		 * Shift キーが押されているかどうか
		 * @type {boolean}
		 */
		this.isShiftKeyPressed = false;
		/**
		 * 前回の選択範囲
		 * @type {Object}
		 */
		this.prevRange = null;
	}
	/**
	 * 要素の位置とサイズを取得します。
	 */
	getRect(src){
		return ContextMenu.getRect(src);
	}
	/**
	 * 要素の表示を強制します。
	 */
	ensureVisible(node){
		const rc = this.getRect(node);
		if(rc.top < (window.scrollY + Nodes.header.offsetTop + Nodes.header.offsetHeight)){
			window.scrollTo(0, rc.top - (Nodes.header.offsetTop + Nodes.header.offsetHeight));
		}
	}
	/**
	 * 選択範囲を保存します。
	 */
	preventScroll(){
		const selection = window.getSelection();
		if(!selection.rangeCount) return;
		const range = selection.getRangeAt(0);
		if(range.collapsed) return;
		this.prevRange = range;
	}
	/**
	 * イベントリスナを登録します。
	 */
	startup(){
		this.log.info("startup()");
		if(SkinPref.get("enableFxFind")){
			window.addEventListener("mousedown", (e) => {
				this.isDragging = (e.button === 0) ? true : false;
			}, false);
			window.addEventListener("mouseup",   () => {
				this.isDragging = false;
				this.preventScroll();
			}, false);
			window.addEventListener("keypress",  (e) => {
				this.isShiftKeyPressed = e.shiftKey;
				this.preventScroll();
			}, false);
			window.setInterval(() => {
				if(this.isDragging || this.isShiftKeyPressed) return;
				const selection = window.getSelection();
				if(!selection.rangeCount) return;
				const range = selection.getRangeAt(0);
				if(range.collapsed) return;
				if(range === this.prevRange) return;
				const node = (range.startContainer.nodeType === 3) ? range.startContainer.parentNode : range.startContainer;
				this.ensureVisible(node);
				this.prevRange = range;
			}, 10);
		}
	}
}
// グローバル変数名へのマッピング
var FxFindHandler = new FxFindHandlerManager();


/**
 * 不用意なポップアップを禁止するクラス
 */
class PopupPreventerManager {
	constructor() {
		this.log = new SkinLog("PopupPreventer", SkinLogLvl.WARNING);
		/**
		 * スクロールされたかどうか
		 * @type {boolean}
		 */
		this.isScrolled = false;
		/**
		 * 最後にスクロールされたとき時間
		 * @type {number}
		 */
		this.lastScrolledTime = null;
	}
	/**
	 * イベントリスナを登録します。
	 */
	startup(){
		this.log.info("startup()");
		if(SkinPref.get("enablePopupPreventer")){
			window.addEventListener("mouseover", (e) => {
				if(this.isScrolled){
					e.preventDefault();
					e.stopPropagation();
				}
			}, true);
			window.addEventListener("scroll", () => {
				this.isScrolled = true;
				this.lastScrolledTime = new Date().getTime();
			}, true);
			window.addEventListener("mousemove", () => {
				const diffTime = new Date().getTime() - this.lastScrolledTime;
				if(diffTime > 500){
					this.log.dbg("isScrolled=false");
					this.isScrolled = false;
				}else{
					this.log.dbg("isScrolled=true [diffTime=" + diffTime + "]");
				}
			}, true);
		}
	}
}
// グローバル変数名へのマッピング
var PopupPreventer = new PopupPreventerManager();


/**
 * タイトルバーを管理するクラス
 */
class TitlebarManager {
	constructor() {
		this.log = new SkinLog("Titlebar", SkinLogLvl.WARNING);
	}
	/**
	 * 初期設定を行います。
	 */
	init(){
		this.log.info("init()");
		const hide = SkinPref.get("valueHideTitleBar");
		if(hide === 1){
			Nodes.header.ondblclick = () => {
				Nodes.header.style.visibility = "hidden";
				_doc.getElementById("showBar").style.visibility = "visible";
			};
		}else if(hide === 2){
			Nodes.header.style.opacity = "0";
			Nodes.header.onmouseover = () => { Nodes.header.style.opacity = "1"; };
			Nodes.header.onmouseout = () => {
				if(!FindBox.isVisible && !ChevronContextMenu.is_open && !ThreadNameContextMenu.is_open){
					Nodes.header.style.opacity = "0";
				}
			};
		}
	}
	/**
	 * タイトルバーを戻します。
	 */
	showBar(){
		Nodes.header.style.opacity = "1";
		Nodes.header.style.visibility = "visible";
		_doc.getElementById("showBar").style.visibility = "hidden";
	}
}
// グローバル変数名へのマッピング
var Titlebar = new TitlebarManager();


/**
 * 自分のレスにマークを付け、それにアンカーを付けたレスもマークして通知を行うクラス
 */
class MyAndRepManager {
	constructor() {
		this.log = new SkinLog("MyAndRep", SkinLogLvl.WARNING);
		/**
		 * スタイルシート
		 * @type {StyleSheet}
		 */
		this._style = null;
		this.mycolor = "";
		this.repcolor = "";
		this.isMyPost = false;
		this.isReply = false;
		this.isNotify = false;
	}
	/**
	 * プロパティを初期設定します。
	 */
	init(){
		this.mycolor = SkinPref.get("stringMyPostBgColor");
		this.repcolor = SkinPref.get("stringReplyBgColor");
		this.isMyPost = SkinPref.get("enableHighlightMyPost");
		this.isReply = SkinPref.get("enableHighlightReply");
		this.isNotify = SkinPref.get("enableNotifyReply"); // enableNotifyReplayのタイポ修正反映
	}
	/**
	 * 処理を再度行って表示を更新します。
	 */
	update(){
		this.init();
		this.scanMyPostAndReply();
	}
	/**
	 * 自分/返信レスの強調スタイルを作成
	 */
	createStyle(){
		if(this._style) this._style.clear();
		this._style = new StyleSheet('myandrepStyle');
		this._style.insert('.my-post .resName::before	{ content: "自分: "; }');
		this._style.insert('.highlighted.my-post .resHeader { background-color: ' + this.mycolor + '; }');
		this._style.insert('.reply-to-me .resName::before { content: "返信: "; }');
		this._style.insert('.highlighted.reply-to-me .resHeader { background-color: ' + this.repcolor + '; }');
	}
	/**
	 * 利用者に Web Notification の許可を問い合わせます。
	 */
	isPermitNotify(){
		this.log.info("isPermitNotify()");
		if(!Notification || Notification.permission === 'denied'){
			return false;
		}else if(Notification.permission === 'granted'){
			return true;
		}else{
			Notification.requestPermission((status) => {
				if(Notification.permission !== status){
					Notification.permission = status;
				}
			});
			return (Notification.permission === 'granted');
		}
	}
	/**
	 * Web Notification を生成して通知を発行します。
	 */
	notify(msg){
		this.log.info("notify(" + msg + ")");
		if(this.isPermitNotify()){
			new Notification("lego-ex-R", { tag: "lego-ex-R", body: msg });
		}
	}
	/**
	 * 指定したレス番号を自分のレスとして登録/解除します。
	 */
	toggleMyPost(resNum){
		if(SysPref.disableStorage) return;
		const dbMyPosts = Storage.get("valueMyPosts") || {};
		const url = TD.threadUrl;
		if(!dbMyPosts[url]) dbMyPosts[url] = [];

		const idx = dbMyPosts[url].indexOf(resNum);
		if(idx !== -1){
			dbMyPosts[url].splice(idx, 1);
		}else{
			dbMyPosts[url].push(resNum);
		}

		Storage.set("valueMyPosts", dbMyPosts);
		this.scanMyPostAndReply();
	}
	/**
	 * 指定したIDを自分のIDとして登録/解除します。
	 */
	toggleMyID(id){
		if(SysPref.disableStorage || !ID.isValidID(id)) return;
		const dbMyIDs = Storage.get("valueMyIDs") || {};
		const url = TD.boardUrl;
		if(!dbMyIDs[url]) dbMyIDs[url] = [];

		const idx = dbMyIDs[url].indexOf(id);
		if(idx !== -1){
			dbMyIDs[url].splice(idx, 1);
		}else{
			dbMyIDs[url].push(id);
		}

		Storage.set("valueMyIDs", dbMyIDs);
		this.scanMyPostAndReply();
	}
	/**
	 * 表示中のスレッドの登録済みレス番号を全消去する
	 */
	clearMyPosts(){
		if(SysPref.disableStorage) return;
		const dbMyPosts = Storage.get("valueMyPosts") || {};
		if(!dbMyPosts[TD.threadUrl]){
			alert("このスレッドで登録済みのレス番号はありません");
		}else if(confirm("このスレッドで登録済みのレス番号を全て消去してよろしいですか？")){
			delete dbMyPosts[TD.threadUrl];
			Storage.set("valueMyPosts", dbMyPosts);
			this.scanMyPostAndReply();
		}
	}
	/**
	 * 表示中のスレッドの板の登録済みIDを全消去する
	 */
	clearMyIDs(){
		if(SysPref.disableStorage) return;
		const dbMyIDs = Storage.get("valueMyIDs") || {};
		if(!dbMyIDs[TD.boardUrl]){
			alert("このスレッドで登録済みのIDはありません");
		}else if(confirm("この板で登録済みのIDを全て消去してよろしいですか？")){
			delete dbMyIDs[TD.boardUrl];
			Storage.set("valueMyIDs", dbMyIDs);
			this.scanMyPostAndReply();
		}
	}
	/**
	 * 自分レスと返信レスをチェック
	 */
	scanMyPostAndReply(){
		if(SysPref.disableStorage) return;

		const dbMyPosts = Storage.get("valueMyPosts") || {};
		const dbMyIDs = Storage.get("valueMyIDs") || {};
		const myPosts = dbMyPosts[TD.threadUrl] || [];
		const myIDs = dbMyIDs[TD.boardUrl] || [];

		Array.from(Nodes.content.querySelectorAll('.my-post, .reply-to-me')).forEach((container) => {
			container.classList.remove('highlighted');
			container.classList.remove('my-post');
			container.classList.remove('reply-to-me');
		});

		this.createStyle();

		ID.traverse();
		Trackback.traverse();

		let myPostList = [];
		myIDs.forEach((id) => { myPostList = myPostList.concat(ID.items[id] || []); });
		myPostList = myPostList.concat(myPosts);

		let repCount = 0;
		const maptbl = {};
		myPostList.forEach((resNum) => {
			if(!resNum)			return;
			if(!maptbl[resNum]) maptbl[resNum] = true;
			else				return;

			const mypost = ResNodes.getContainerByResNum(resNum);
			if(!mypost) return;

			mypost.classList.add("my-post");
			if(this.isMyPost) mypost.classList.add("highlighted");

			const repList = Trackback.items[resNum];
			if(repList) repList.forEach((num) => {
				const reply = ResNodes.getContainerByResNum(num);
				if(!reply) return;

				reply.classList.add('reply-to-me');
				if(this.isReply) reply.classList.add("highlighted");

				if(reply.getAttribute("new")){
					repCount++;
				}
			});
		});

		if(this.isNotify && (repCount > 0)){
			this.notify("あなたのレスにアンカーをつけた新着レスがあります" + "  ( " + repCount + " res )");
		}
	}
}
// グローバル変数名へのマッピング
var MyAndRep = new MyAndRepManager();

//======================================
// ポップアップ関連
//======================================
/**
 * ポップアップの要素を管理します。
 */
class PopupItem {
	/**
	 * ポップアップの要素を作成します。
	 * @param {Element} source			ポップアップとして表示する要素
	 * @param {boolean} [useFade]		フェードアウトを有効にするかどうか
	 * @param {boolean} [hideOnHover]	ポップアップ上でホバーしたときに非表示にするかどうか
	 */
	constructor(source, useFade, hideOnHover){
		const divPopupContainer        = _doc.createElement("div");
		divPopupContainer.className    = "popupContainer";
		const divShadowTopRight        = _doc.createElement("div");
		divShadowTopRight.className    = "shadowTopRight";
		const divShadowBottomLeft      = _doc.createElement("div");
		divShadowBottomLeft.className  = "shadowBottomLeft";
		const divShadowBottomRight     = _doc.createElement("div");
		divShadowBottomRight.className = "shadowBottomRight";
		const divPopupBorder           = _doc.createElement("div");
		divPopupBorder.className       = "popupBorder";
		const divShadowRight           = _doc.createElement("div");
		divShadowRight.className       = "shadowRight";
		const divShadowBottom          = _doc.createElement("div");
		divShadowBottom.className      = "shadowBottom";
		const divPopupBody             = _doc.createElement("div");
		divPopupBody.className         = "popupBody";

		divShadowBottom.appendChild(divPopupBody);
		divShadowRight.appendChild(divShadowBottom);
		divPopupBorder.appendChild(divShadowRight);
		divShadowBottomRight.appendChild(divPopupBorder);
		divShadowBottomLeft.appendChild(divShadowBottomRight);
		divShadowTopRight.appendChild(divShadowBottomLeft);
		divPopupContainer.appendChild(divShadowTopRight);

		this.container = divPopupContainer;
		this.content = divPopupBody;
		this.source = source;
		this.useFade = !!useFade;
		this.hideOnHover = !!hideOnHover;
	}
}


/**
 * 複数のポップアップをまとめて管理するクラス
 */
class PopupManager {
	constructor() {
		/**
		 * PopupItem を格納した配列
		 * @type {Array<PopupItem>}
		 */
		this.items = [];
		/**
		 * すでに初期化されたかどうかを表すフラグ
		 * @type {boolean}
		 */
		this.inited = false;
	}
	/**
	 * 要素の位置とサイズを取得します。
	 * @param  {Element}	src	要素
	 * @return {object}		left, top, width, height, right, bottom の各メンバから成るオブジェクト
	 */
	getRect(src){
		const rect = src.getBoundingClientRect();
		const x = rect.left + window.scrollX;
		const y = rect.top + window.scrollY;
		return {
			left:	x,
			top:	y,
			width:	src.offsetWidth,
			height:	src.offsetHeight,
			right:	x + src.offsetWidth,
			bottom:	y + src.offsetHeight
		};
	}
	/**
	 * 指定された座標が要素の領域内にあるかどうかを調べます。
	 * @param  {number}  x			x 座標（スクリーン座標）
	 * @param  {number}  y			y 座標（スクリーン座標）
	 * @param  {Element} element	要素
	 * @return {boolean} 座標が要素の領域内にあれば true
	 */
	isPtInElement(x, y, element){
		const rc = this.getRect(element);
		return (x >= rc.left) && (x < rc.right) && (y >= rc.top) && (y < rc.bottom);
	}
	/**
	 * 要素がすでにポップアップとして存在しているかどうかを調べます。
	 * @param  {Element} source 	要素
	 * @return {boolean} 要素がすでに存在していれば true
	 */
	sourceExists(source){
		return this.items.some(item => item.source === source);
	}
	/**
	 * ポップアップのサイズに応じて、適切な位置に移動します。
	 * @param  {Element} item	要素
	 */
	reposition(item){
		const POPUP_MAX_HEIGHT = 600;
		const rectSource = this.getRect(item.source);
		item.container.style.visibility = "hidden";
		if(item.container.offsetHeight > POPUP_MAX_HEIGHT){
			item.content.style.height = POPUP_MAX_HEIGHT + "px";
			item.content.style.overflow = "auto";
		}
		const popupHeight = item.container.offsetHeight;

		let top, oppositeY;
		if(!SkinPref.get("enableDefaultUpperPopup")){
			top = rectSource.bottom;
			if(top + popupHeight > window.scrollY + window.innerHeight){
				oppositeY = (rectSource.top - popupHeight);
				if(oppositeY >= window.scrollY + Nodes.header.offsetHeight) top = oppositeY;
			}
		}else{
			top = rectSource.top - popupHeight;
			if(top < window.scrollY){
				oppositeY = (rectSource.bottom + popupHeight);
				if(oppositeY <= window.scrollY + window.innerHeight) top = rectSource.bottom;
			}
		}

		let left = rectSource.left;
		if(item.container.offsetWidth > _doc.body.clientWidth){
			left = 0;
		}else{
			if(rectSource.left + item.container.offsetWidth > window.scrollX + _doc.body.clientWidth){
				left = _doc.body.clientWidth - item.container.offsetWidth - window.scrollX;
			}
		}
		item.container.style.left = left + "px";
		item.container.style.top  = top + "px";
		item.container.style.visibility = "visible";
	}
	/**
	 * イベントを処理します。
	 * @param  {event}	e	イベント
	 */
	handleEvent(e){
		switch(e.type){
		case "mouseout": // falls through
		case "mousemove":
			this.remove(e);
		}
	}
	/**
	 * 初期設定を行います。
	 */
	init(){
		if(!this.inited){
			window.addEventListener("mouseout",  this, false);
			window.addEventListener("mousemove", this, false);
			this.inited = true;
		}
	}
	/**
	 * 終了処理を行います。
	 */
	finish(){
		if(this.items.length === 0){
			this.inited = false;
			window.removeEventListener("mouseout",  this, false);
			window.removeEventListener("mousemove", this, false);
		}
	}
	/**
	 * ポップアップとして要素を追加、表示します。
	 * @param  {Element} content		表示する要素
	 * @param  {Element} source			トリガー元の要素（位置の調整に使用される）
	 * @param  {boolean} hideOnHover	ポップアップ上でホバーしたときに非表示にするかどうか
	 */
	add(content, source, hideOnHover){
		if(this.sourceExists(source)) return false;

		const item = new PopupItem(source, SkinPref.get("enablePopupFade"), hideOnHover);
		this.items.push(item);
		item.content.appendChild(content);
		_doc.getElementById("popupdummy").appendChild(item.container);
		this.reposition(item);
		this.init();
		return item;
	}
	/**
	 * ポップアップを削除します。
	 * @param  {event}	e	イベント
	 */
	remove(e){
		if(ResNumberContextMenu.is_open) return;
		const x = e.pageX;
		const y = e.pageY;
		for(let i = this.items.length - 1; i >= 0; i--){
			if(this.isPtInElement(x, y, this.items[i].source))    return;
			if(!this.items[i].hideOnHover) if(this.isPtInElement(x, y, this.items[i].container)) return;
			if(x < 10) return;
			if(this.items[i].useFade){
				this.removeChildWithFade(this.items[i].container);
			}else{
				_doc.getElementById("popupdummy").removeChild(this.items[i].container);
			}
			this.items.pop();
		}
		this.finish();
	}
	/**
	 * 最後のポップアップ要素を削除します。
	 */
	remove_last(){
		const idx = this.items.length - 1;
		if(idx < 0) return;

		const lastItem = this.items[idx];
		if(lastItem.useFade){
			this.removeChildWithFade(lastItem.container);
		}else{
			_doc.getElementById("popupdummy").removeChild(lastItem.container);
		}
		this.items.pop();
		this.finish();
	}
	/**
	 * 指定された要素が載っているポップアップを探します。
	 * @param  {Element}	content		要素
	 * @return {PopupItem}	マッチした PopupItem
	 */
	findPopup(content){
		return this.items.find(item => item.content.firstChild === content) || null;
	}
	/**
	 * ポップアップのフェードアウト処理を行います。removeChildWithFade() から呼ばれます。
	 * @param  {string} id	要素の ID
	 */
	fadeOutProc(id){
		const node = _doc.getElementById(id);
		if(node){
			const idx = SkinPref.get("valuePopupFadeStep");
			const fadeStep = SelOpts.PopupFadeStep[(idx < 0 || 4 < idx) ? 1 : idx];
			node.style.opacity = parseFloat(node.style.opacity) - fadeStep;
			if(parseFloat(node.style.opacity) <= 0.0){
				_doc.getElementById("popupdummy").removeChild(node);
			}else{
				window.setTimeout(this.fadeOutProc.bind(this), 1, id);
			}
		}
	}
	/**
	 * ポップアップをフェードアウトしながら削除します。
	 * @param  {Element}	node	要素
	 */
	removeChildWithFade(node){
		const id = "#" + new Date().getTime() + Math.random();
		node.id = id;
		if(!node.style.opacity){
			node.style.opacity = 1.0;
		}
		window.setTimeout(this.fadeOutProc.bind(this), 1, id);
	}
}
// グローバル変数名へのマッピング
var Popup = new PopupManager();


/**
 * すべての個別ポップアップマネージャの共通基底クラス
 */
class PopupBase {
	constructor(moduleName) {
		this.log = new SkinLog(moduleName, SkinLogLvl.WARNING);
	}

	/**
	 * 要素を複製し、不要な子要素（埋め込み画像・動画）を除去した安全なノードを返します。
	 * @param  {Element} src	複製元のレス要素
	 * @return {Element} 複製・クリーンアップされたレス要素
	 */
	getCloneNode(src){
		const dest = src.cloneNode(true);
		// ポップアップ中のインライン画像・動画を排除
		Array.from(dest.querySelectorAll(".embedGroup, .embedLast, .embedInline"))
			.forEach((elem) => { elem.parentNode.removeChild(elem); });
		ResNodes.getOutLinks(dest).forEach((elem) => {
			if(elem.hasAttribute("is_embed")) elem.removeAttribute("is_embed");
		});
		if(dest.id) dest.id = "";
		dest.removeAttribute("name");
		Array.from(dest.getElementsByTagName("*")).forEach((elem) => {
			if(elem.id) elem.id = "";
			if(elem.hasAttribute("name")) elem.removeAttribute("name");
		});
		TD.resShow(dest);
		return dest;
	}
}

/**
 * レスアンカーのポップアップを管理するクラス
 */
class ResPopupManager extends PopupBase {
	constructor() {
		super("ResPopup");
	}
	/**
	 * イベントリスナを登録します。（漏れていたメソッドを追加）
	 */
	startup(){
		window.addEventListener("mouseover", this, false);
	}
	/**
	 * ポップアップの最大レス数を取得します。
	 * @type {number}
	 * @readonly
	 */
	get popup_limit(){
		const idx = SkinPref.get("valuePopupResMax");
		const limit = SelOpts.PopupResMax[(idx < 0 || 9 < idx) ? 3 : idx];
		return limit;
	}
	/**
	 * レスアンカーから有効なレス範囲を取得します。
	 * @param {string}	text	レスアンカーの文字列
	 * @return {Object}	レス範囲
	 */
	getAnchorItems(text){
		const resMax = ThreadDocument.countAll;
		const range = {start: resMax + 1, end: 0, items:{}};
		let rest = this.popup_limit;

		text.split(/[\,\+]/).forEach((anchor) => {
			if(anchor.match(/([0-9\uFF10-\uFF19]{1,4})([\-\uFF0D]([0-9\uFF10-\uFF19]{0,4}))?/)){
				let st = RegExp.$1;
				let en = RegExp.$3;
				st = Trackback.toNarrow(st);
				en = en ? Trackback.toNarrow(en) : st;
				if(st > en){
					const tmp = st;
					st = en;
					en = tmp;
				}
				if(st > resMax) return;
				if(en > resMax) en = resMax;

				if(st < range.start) range.start = st;
				for(let j = st; j <= en; j++){
					if(j > range.end) range.end = j;
					range.items[j] = 1;
					rest--;
					if(rest <= 0) return;
				}
			}
		});
		return (range.start > resMax) ? null : range;
	}
	/**
	 * イベントを処理します。
	 * @param  {event}	e	イベント
	 */
	handleEvent(e){
		const node = e.target;
		const text = node.textContent;
		if(node.classList.contains("resPointer")){
			const range = this.getAnchorItems(text);
			if(range){
				this.show(node, range.start, range.end, range.items);
			}
		}
	}
	/**
	 * レス範囲を指定してレスのポップアップを表示します。
	 */
	show(source, start, end, items, func){
		if(!SkinPref.get("enableResPopup")) return;
		if(end < start){
			const tmp = end;
			end = start;
			start = tmp;
		}
		if(start < 1)  start = 1;
		if(ThreadDocument.countAll >= ThreadDocument.countRead){
			if(start > ThreadDocument.countAll) return;
			if(end > ThreadDocument.countAll) end = ThreadDocument.countAll;
		}
		let force = false;
		if(!items){
			items = {"0" : 1};
			force = true;
			if((end - start) > this.popup_limit) end = start + this.popup_limit - 1;
		}
		Trackback.traverse();
		const content = _doc.createDocumentFragment();
		for(let i = start; i <= end; i++){
			if(force || items[i]){
				const resNode = Nodes.getRes(i);
				if(!resNode){
					this.showExceeded(source, start, end, items, func);
					return;
				}
				if(func && !func(resNode)) continue;
				const dlPopup = this.getCloneNode(resNode);
				dlPopup.className = "resPopup";
				Trackback.appendTo(Nodes.getResBody(dlPopup), i);	// 逆参照
				content.appendChild(dlPopup);
			}
		}
		const popupItem = Popup.add(content, source);
		if(popupItem) ThreadDocument.modifyContent(popupItem.content);
	}
	/**
	 * レス範囲を指定して表示域外のレスのポップアップを表示します。
	 */
	showExceeded(source, start, end, items, func){
		AjaxGet(TD.serverUrl + TD.threadUrl + start + "-" + end + "n" + "?AS=true")
		.then((html) => {
			const content = _doc.createDocumentFragment();
			const divTemp  = _doc.createElement("div");
			divTemp.innerHTML = html;
			const container = divTemp.querySelectorAll("div.resContainer");
			const force = !!items["0"];
			for(let i = 0, n = container.length; i < n; i++){
				if(force || items[start + i]){
					if(func && !func(container[i])) continue;

					const dlPopup = this.getCloneNode(container[i]);
					dlPopup.className = "resPopup";
					Trackback.appendTo(Nodes.getResBody(dlPopup), start + i);	// 逆参照
					content.appendChild(dlPopup);
				}
			}
			const popupItem = Popup.add(content, source);
			if(popupItem) ThreadDocument.modifyContent(popupItem.content);
		})
		.catch((e) => {
			this.log.err("showExceeded: " + e.message);
		});
	}
}
// グローバル変数名へのマッピング
var ResPopup = new ResPopupManager();


/**
 * ID のポップアップを管理するクラス
 */
class IDPopupManager extends PopupBase {
	constructor() {
		super("IDPopup");
	}
	/**
	 * イベントリスナを登録します。
	 */
	startup(){
		if(SkinPref.get("enableIDPopupOnClick")){
			window.addEventListener("click", this, false);
		}else{
			window.addEventListener("mouseover", this, false);
		}
	}
	/**
	 * イベントを処理します。
	 * @param  {event}	e	イベント
	 */
	handleEvent(e){
		if(e.button !== 0) return;

		const node = e.target;
		if(node.nodeType !== 1) return;
		if(node.className.match(/^resID/)){
			this.show(node, node.getAttribute("rel"));
		}else if(node.className.match(/mesID_/)){
			const pos = node.className.indexOf(" ");
			const className = (pos === -1) ? node.className : node.className.slice(0, pos);
			this.show(node, className.slice(6));
		}
	}
	/**
	 * IDに対応するレスのポップアップを表示します。
	 */
	show(source, id){
		if(!SkinPref.get("enableIDPopup")) return;

		const isAppendAll = SkinPref.get("enableIDPopupAll");
		const popupid = "IDPopup:" + id;
		if(_doc.getElementById(popupid)) return;

		ID.traverse();
		const items = ID.items[id];
		let n = !items ? 0 : items.length;
		if(n < 1) return;
		if(n > ResPopup.popup_limit) n = ResPopup.popup_limit;

		const content = _doc.createDocumentFragment();
		if(!isAppendAll){
			const div = _doc.createElement("div");
			div.id = popupid;
			div.className = "popupHeader";
			div.appendChild(_doc.createTextNode("参照: "));
			content.appendChild(div);

			const span = _doc.createElement("span");
			const br = _doc.createElement("br");
			const div_num = SkinPref.get("valueTrackBackDivNums");
			const a = _doc.createElement("a");
			a.className = "resPointer";
			a.onclick = ThreadDocument.jumpTo.bind(ThreadDocument);

			for(let i = 0; i < n; i++){
				const anchor = a.cloneNode(false);
				anchor.appendChild(_doc.createTextNode(">>" + items[i]));
				div.appendChild(anchor);
				if(i !== n - 1){
					const space = span.cloneNode(false);
					space.appendChild(_doc.createTextNode(" "));
					div.appendChild(space);
					if((i + 1) % div_num === 0){
						const newline = br.cloneNode(false);
						div.appendChild(newline);
					}
				}
			}
		}else{
			for(let i = 0; i < n; i++){
				const resNum = items[i];
				const dlPopup = this.getCloneNode(Nodes.getRes(resNum));
				if(i === 0) dlPopup.id = popupid;
				dlPopup.className = "resPopup";
				Trackback.appendTo(Nodes.getResBody(dlPopup), resNum);	// 逆参照
				content.appendChild(dlPopup);
			}
		}

		const nodePopup = Popup.add(content, source);
		if(!isAppendAll) nodePopup.container.className = "popupResList";
		if(nodePopup) ThreadDocument.modifyContent(nodePopup.content);
	}
}
// グローバル変数名へのマッピング
var IDPopup = new IDPopupManager();

/**
 * 名前のポップアップを管理するクラス
 */
class NamePopupManager extends PopupBase {
	constructor() {
		super("NamePopup");
	}
	/**
	 * イベントリスナを登録します。
	 */
	startup(){
		if(SkinPref.get("enableNamePopupOnClick")){
			window.addEventListener("click", this, false);
		}else{
			window.addEventListener("mouseover", this, false);
		}
	}
	/**
	 * イベントを処理します。
	 * @param  {event}	e	イベント
	 */
	handleEvent(e){
		if(e.button !== 0) return;

		const node = e.target;
		const text = node.textContent;
		const parent = node.parentNode;
		const cname = node.className;

		switch(cname){
		case "resName":
			if(text.match(/^([0-9\uFF10-\uFF19]{1,4})(?:\s*(?:\u25C6|\())?/)){
				const anchor = parseInt(Trackback.toNarrow(RegExp.$1), 10);
				ResPopup.show(node, anchor, anchor);
			}else{
				this.show(node, text);
			}
			break;
		case "popupName":
			this.show(node, text);
			break;
		case "resSystem":
			if(parent && parent.className === "resName"){
				this.show(node, text);
			}
			break;
		case "slipName":
			this.show(node, text);
			break;
		case "slipAB":
			this.show(node, text + "-");
			break;
		case "slipC":
			this.show(node, "-" + text);
			break;
		case "slipIP":
			this.show(node, text);
		}
	}
	/**
	 * 指定した名前のレスのポップアップを表示します。
	 */
	show(source, name){
		if(!SkinPref.get("enableNamePopup")) return;

		const isAppendAll = SkinPref.get("enableNamePopupAll");
		const popupid = "NamePopup:" + name;
		if(_doc.getElementById(popupid)) return;

		Name.traverse();
		const push = Array.prototype.push;
		let items = [];
		if(source.className === "popupName"){
			items = Name.items[name];
		}else{
			for(let key in Name.items){
				if(key.indexOf(name) !== -1){
					push.apply(items, Name.items[key]);
				}
			}
		}

		if(!items) return;
		items = items.filter((x, i, self) => (self.indexOf(x) === i)).sort((a, b) => (a - b));
		let n = !items ? 0 : items.length;
		if(n < 1) return;
		if(n > ResPopup.popup_limit) n = ResPopup.popup_limit;

		const content = _doc.createDocumentFragment();
		if(!isAppendAll){
			const div = _doc.createElement("div");
			div.id = popupid;
			div.className = "popupHeader";
			div.appendChild(_doc.createTextNode("参照: "));
			content.appendChild(div);

			const span = _doc.createElement("span");
			const br = _doc.createElement("br");
			const div_num = SkinPref.get("valueTrackBackDivNums");
			const a = _doc.createElement("a");
			a.className = "resPointer";
			a.onclick = ThreadDocument.jumpTo.bind(ThreadDocument);

			for(let i = 0; i < n; i++){
				const anchor = a.cloneNode(false);
				anchor.appendChild(_doc.createTextNode(">>" + items[i]));
				div.appendChild(anchor);
				if(i !== n - 1){
					const space = span.cloneNode(false);
					space.appendChild(_doc.createTextNode(" "));
					div.appendChild(space);
					if((i + 1) % div_num === 0){
						const newline = br.cloneNode(false);
						div.appendChild(newline);
					}
				}
			}
		}else{
			for(let i = 0; i < n; i++){
				const resNum = items[i];
				const dlPopup = this.getCloneNode(Nodes.getRes(resNum));
				if(i === 0) dlPopup.id = popupid;
				dlPopup.className = "resPopup";
				Trackback.appendTo(Nodes.getResBody(dlPopup), resNum);	// 逆参照
				content.appendChild(dlPopup);
			}
		}

		const nodePopup = Popup.add(content, source);
		if(!isAppendAll) nodePopup.container.className = "popupResList";
		if(nodePopup) ThreadDocument.modifyContent(nodePopup.content);
	}
}
// グローバル変数名へのマッピング
var NamePopup = new NamePopupManager();

/**
 * 逆参照のポップアップを管理するクラス
 */
class TrackbackPopupManager extends PopupBase {
	constructor() {
		super("TrackbackPopup");
	}
	/**
	 * イベントを処理します。
	 * @param  {event}	e	イベント
	 */
	handleEvent(e){
		const node = e.target;
		if(e.type === "mouseover"){
			if(node.textContent.match(/^([0-9\uFF10-\uFF19]{1,4})$/)){
				this.show(node, RegExp.$1);
			}
		}
	}
	/**
	 * 指定レスを参照しているレスのポップアップを表示します。
	 */
	show(source, resNum){
		if(!SkinPref.get("enableTrackBackPopup")) return;

		Trackback.traverse();
		const tb = Trackback.items[resNum];
		if(!tb || tb.length < 1) return;

		const appendAll = SkinPref.get("enableTrackBackPopupAll") || tb.length === 1;
		const content = _doc.createDocumentFragment();
		if(appendAll){
			for(let i = 0, n = tb.length; i < n; i++){
				const node = this.getCloneNode(ResNodes.getContainerByResNum(tb[i]));
				node.className = "resPopup";
				Trackback.appendTo(Nodes.getResBody(node), tb[i]);
				content.appendChild(node);
			}
		}else{
			const div = _doc.createElement("div");
			div.className = "popupHeader";
			div.appendChild(_doc.createTextNode("参照: "));
			div.appendChild(Trackback.getAnchorElements(resNum));
			content.appendChild(div);
		}
		const nodePopup = Popup.add(content, source);
		if(!appendAll) nodePopup.container.className = "popupResList";
		if(nodePopup) ThreadDocument.modifyContent(nodePopup.content);
	}
}
// グローバル変数名へのマッピング
var TrackbackPopup = new TrackbackPopupManager();


/**
 * 画像のポップアップを管理するクラス
 */
class ImagePopupManager extends PopupBase {
	constructor() {
		super("ImagePopup");
		/**
		 * 画像の URI を判別する正規表現
		 * @type {RegExp}
		 */
		this._imgRegExp = /\.(jpg|jpeg|gif|png|mng|tiff|tif|bmp|pict)([?:].*)?$/i;
		this._gifRegExp = /\.gif([?:].*)?$/i;
		/**
		 * グロチェックの正規表現
		 * @type {RegExp}
		 */
		this._groRegExp = null;
		/**
		 * ぼかしフィルターレベル
		 * @type {number}
		 */
		this._psLvl = 1;
		/**
		 * ぼかしフィルターサイズのテーブル
		 * @type {Array<number>}
		 */
		this._psTbl = [8, 4, 2];
		/**
		 * 透明度レベル
		 * @type {number}
		 */
		this._opLvl = 1;
		/**
		 * 透明度のテーブル
		 * @type {Array<number>}
		 */
		this._opTbl = [0.15, 0.3, 0.5, 1.0];
		/**
		 * ポップアップ時のパディング
		 * @type {number}
		 */
		this._padding = 7;
	}
	/**
	 * モザイクサイズを取得します。
	 */
	getPixelationSize(isGro){
		return this._psTbl[isGro ? 0 : this._psLvl];
	}
	/**
	 * 透明度を取得します。
	 */
	getOpacity(){
		return this._opTbl[this._opLvl];
	}
	/**
	 * プロパティを初期設定します。
	 */
	init(){
		this._groRegExp = new RegExp(SkinPref.get("valueImageGroPattern"));
		const sz = SkinPref.get("valuePixelationSize");
		this._psLvl = (sz < 0 || 2 < sz) ? 1 : sz;
		const lvl = SkinPref.get("valueShadeLevel");
		this._opLvl = (lvl < 0 || 3 < lvl) ? 1 : lvl;
	}
	/**
	 * プロパティを更新します。
	 */
	update(){
		this.init();
	}
	/**
	 * 対象の URI が画像かどうかを判別します。
	 */
	isImage(src){
		return this._imgRegExp.test(src) || src.startsWith("/ivur/");
	}
	isGif(src){
		return this._gifRegExp.test(src);
	}
	/**
	 * 対象のレス番号にグロテスク画像への注意を喚起するレスがついているか調べます。
	 */
	isImageGrotesque(resNum){
		if(!resNum) return false;

		Trackback.traverse();
		const nodes = Array.apply(null, Trackback.items[resNum] || []);
		nodes.unshift(resNum + 1);
		return nodes.some((num) => {
			const node = ResNodes.getBodyByResNum(num);
			if(!node) return false;
			return ThreadDocument.getInnerText(node, true).some((line) => this._groRegExp.test(line));
		});
	}
	/**
	 * イベントを処理します。
	 */
	handleEvent(e){
		const node  = e.currentTarget;
		const popup = Popup.findPopup(node);
		switch(e.type){
		case "click":
			if(popup){
				if(node.className === "imgPopup"){
					if(node.hasAttribute("blur")){
						node.style.filter = "none";
						node.removeAttribute("blur");
					}else{
						node.className =  "imgLargePopup";
						popup.content.style.maxWidth  = "none";
						popup.content.style.maxHeight = "none";
						popup.content.style.maxWidth  = (e.currentTarget.offsetWidth  - this._padding) + "px";
						popup.content.style.maxHeight = (e.currentTarget.offsetHeight - this._padding) + "px";
					}
				}else{
					if(node.tagName.match(/(canvas|svg)/i)){
						popup.container.style.opacity = 1.0;
						node.parentNode.childNodes[1].style.opacity = 1.0;
						node.parentNode.removeChild(node);
					}else{
						e.currentTarget.className =  "imgPopup";
						popup.content.style.maxWidth  = (e.currentTarget.offsetWidth  - this._padding) + "px";
						popup.content.style.maxHeight = (e.currentTarget.offsetHeight - this._padding) + "px";
					}
				}
			}
			break;
		case "error":
			if(popup) popup.source.setAttribute("title", popup.source.title ? "エラー " + popup.source.title : "エラー");
			e.currentTarget.parentNode.removeChild(e.currentTarget);
		}
	}
	/**
	 * 画像のリサイズを監視します。
	 */
	resize(nodePopup){
		if(!nodePopup) return;
		const last = nodePopup.content.lastChild;
		if(!last) return;

		if((last.offsetWidth > 0) && (last.offsetHeight > 0) && (last.offsetWidth !== 24) && (last.offsetHeight !== 24)){
			nodePopup.content.style.maxWidth  = (last.offsetWidth  - this._padding) + "px";
			nodePopup.content.style.maxHeight = (last.offsetHeight - this._padding) + "px";
			Popup.reposition(nodePopup);
			nodePopup.container.style.visibility = "visible";
			nodePopup.container.style.opacity = this.getOpacity();
			return;
		}
		window.setTimeout(this.resize.bind(this), 50, nodePopup);
	}
	/**
	 * ポップアップを表示します。
	 */
	show(source, href){
		if(!SkinPref.get("enableImagePopup")) return;
		source.removeAttribute("title");
		const img = _doc.createElement("img");
		img.addEventListener("error", this, false);
		img.addEventListener("click", this, false);
		const nodePopup = Popup.add(img, source);
		if(nodePopup){
			nodePopup.container.className = "popupImage";
			if(SkinPref.get("enableImagePopupShadeOverCancel")) nodePopup.container.className = "popupImageC";
			img.className = "imgPopup";
			nodePopup.container.style.visibility = "hidden";
			nodePopup.useFade = false;
			img.src = href;
			window.setTimeout(this.resize.bind(this), 50, nodePopup);
		}
	}
	/**
	 * 画像を疑似モザイク化してポップアップを表示します。
	 */
	pixelateShow(source, href, is_gro){
		if(!SkinPref.get("enableImagePopup")) return;
		source.removeAttribute("title");
		const img = _doc.createElement("img");
		img.addEventListener("error", this, false);
		img.addEventListener("click", this, false);
		img.style.opacity = 0.2;
		const nodePopup = Popup.add(img, source);
		if(nodePopup){
			nodePopup.container.className = "popupImage";
			if(SkinPref.get("enableImagePopupShadeOverCancel")) nodePopup.container.className = "popupImageC";
			img.className = "imgPopup";
			nodePopup.container.style.visibility = "hidden";
			nodePopup.useFade = false;
			img.onload = () => {
				const canvas = _doc.createElement("canvas");
				canvas.width  = img.offsetWidth;
				canvas.height = img.offsetHeight;
				canvas.addEventListener("click", this, false);
				canvas.style.position = "absolute";
				canvas.style.zIndex = "1";

				const ps = this.getPixelationSize(is_gro);
				const w = canvas.width  / ps;
				const h = canvas.height / ps;
				const buffer = _doc.createElement("canvas");
				buffer.getContext("2d").drawImage(img, 0, 0, w, h);

				const ctx = canvas.getContext("2d");
				ctx.globalCompositeOperation = "copy";
				try{ ctx.drawImage(buffer, 0, 0, w, h, 0, 0, canvas.width, canvas.height); }
				catch(e){ this.log.warn(e); }
				nodePopup.content.insertBefore(canvas, nodePopup.content.firstChild);
			};
			img.src = href;
			window.setTimeout(this.resize.bind(this), 50, nodePopup);
		}
	}
	/**
	 * 画像にガウスぼかしをかけてポップアップを表示します。
	 */
	blurShow(source, href, is_gro){
		if(!SkinPref.get("enableImagePopup")) return;
		source.removeAttribute("title");
		const img = _doc.createElement("img");
		img.addEventListener("error", this, false);
		img.addEventListener("click", this, false);
		const nodePopup = Popup.add(img, source);
		if(nodePopup){
			nodePopup.container.className = "popupImage";
			if(SkinPref.get("enableImagePopupShadeOverCancel")) nodePopup.container.className = "popupImageC";
			img.className = "imgPopup";
			const ps = this.getPixelationSize(is_gro);
			img.style.filter = "blur(" + ps + "px)";
			img.setAttribute("blur", true);
			nodePopup.container.style.visibility = "hidden";
			nodePopup.useFade = false;
			img.src = href;
			window.setTimeout(this.resize.bind(this), 50, nodePopup);
		}
	}
}
// グローバル変数名へのマッピング
var ImagePopup = new ImagePopupManager();


/**
 * リンク先のサムネイルプレビューのポップアップを管理するクラス
 */
class UrlPopupManager extends PopupBase {
	constructor() {
		super("UrlPopup");
	}
	/**
	 * URI がサムネイル画像へのリクエストを発行すべきか判別します。
	 */
	isValid(src){
		const matchExt = src.match(/(http|https):\/\/.+\/.*\.([a-zA-Z0-9]+)$/);
		if(matchExt){
			const ext = matchExt[2];
			return /^(htm|html|shtm|shtml|stm|xml|xhtml|php|php3|php4|cgi|jsp|cfm|asp|aspx|pl|plx|py|rb|)$/i.test(ext);
		}
		return true;
	}
	/**
	 * イベントを処理します。
	 */
	handelEvent(e){
		if(e.type !== "error") return;
		const popup = Popup.findPopup(e.currentTarget.parentNode);
		if(popup) popup.source.setAttribute("title", "エラー");
		e.currentTarget.parentNode.removeChild(e.currentTarget);
	}
	/**
	 * 画像のリサイズを監視します。
	 */
	resize(nodePopup){
		if(!nodePopup) return;
		const first = nodePopup.content.firstChild.firstChild;
		if(!first) return;

		if((first.offsetWidth > 0) && (first.offsetHeight > 0) && (first.offsetWidth !== 28) && (first.offsetHeight !== 28)){
			nodePopup.container.className = "popupImage";
			first.className = "urlPopup";
			nodePopup.content.style.maxWidth  = (first.offsetWidth  - 7) + "px";
			nodePopup.content.style.maxHeight = (first.offsetHeight - 7) + "px";
			Popup.reposition(nodePopup);
			nodePopup.container.style.visibility = "visible";
			return;
		}
		window.setTimeout(this.resize.bind(this), 10, nodePopup);
	}
	/**
	 * ポップアップを表示します。
	 */
	show(source, href){
		if(!SkinPref.get("enableUrlPopup")) return;
		source.removeAttribute("title");
		const a = _doc.createElement("a");
		a.href = href;
		if(SkinPref.get("enableLinkNewWindow")){
			a.target = "_blank";
		}
		const img = _doc.createElement("img");
		let src;
		if(SkinPref.get("valueThumbnailSite") === 1){
			src = "http://img.simpleapi.net/small/" + href;
		}else{
			src = "http://capture.heartrails.com/" + (SkinPref.get("valueUrlPopupSize") === 0 ? "large" : "small") + "?" + href;
		}
		img.addEventListener("error", this, false);
		img.src = src;
		a.appendChild(img);

		const nodePopup = Popup.add(a, source, true);
		if(nodePopup){
			nodePopup.container.style.visibility = "hidden";
			window.setTimeout(this.resize.bind(this), 10, nodePopup);
		}
	}
}
// グローバル変数名へのマッピング
var UrlPopup = new UrlPopupManager();

/**
 * 動画サイトのポップアップを管理するクラス
 */
class VideoPopupManager extends PopupBase {
	constructor() {
		super("VideoPopup");
	}
	/**
	 * ポップアップ動画のサイズ
	 * @type {Object}
	 */
	get videoSize(){
		return SelOpts.PopupVideoSize[SkinPref.get("valuePopupVideoSize")];
	}
	/**
	 * URI から動画のプレビューのための正しいソース URI を取得します。
	 */
	getVideoSource(src, is_embed){
		let href = null;

		if(src.match(/(?:\.youtube\.com\/watch\?.*v=|youtu\.be\/)([^&#\? ]+)(.*)/)){
			const videoId = RegExp.$1;
			const param = RegExp.$2 || "";
			const tm = /.*[\?&#]+t=((\d+)m)?(\d+)s?/.exec(param);
			let start = 0, min = 0;
			if(tm){
				if(tm[2])	min = parseInt(tm[2], 10);
				start = min * 60 + parseInt(tm[3], 10);
			}
			let option = "?start=" + start;
			if(SkinPref.get("disableRelatedVideo")) option += "&rel=0";
			if(SkinPref.get("enableFullScreenVideo")) option += "&fs=1";
			if(!is_embed && SkinPref.get("videoPopupAutoStart")) option += "&autoplay=1";
			href = "https://www.youtube.com/embed/" + videoId + option;
		}else if(src.match(/\.nicovideo.jp\/watch\/([^&\? ]+)/)){
			const videoId = RegExp.$1;
			const videoSize = is_embed ? ResImage.videoSize : this.videoSize;
			href = TD.skinPath + "nicovideo.html?url=http://ext.nicovideo.jp/thumb_watch/" +
				videoId + "?w=" + videoSize.width + "&h=" + videoSize.height;
	    }else if(src.match(/(?:\.dailymotion\.com\/video|dai\.ly)\/([^&\?_ ]+)/)){
			const videoId = RegExp.$1;
			href = "http://www.dailymotion.com/embed/video/" + videoId;
		}else if(src.match(/\.veoh\.com\/watch\/([^&\? ]+)/)){
			const videoId = RegExp.$1;
			const option = "&player=videodetailsembedded&videoAutoPlay=0";
			href = "http://www.veoh.com/swf/webplayer/WebPlayer.swf?permalinkId=" + videoId + option;
		}else if(src.match(/vimeo\.com\/(?:.*\/)?([^&\? ]+)/)){
			const videoId = RegExp.$1;
			href = "https://player.vimeo.com/video/" + videoId;
		}else if(src.match(/\.metacafe\.com\/watch\/([^\/&\?_ ]+)/)){
			const videoId = RegExp.$1;
			href = "http://www.metacafe.com/embed/" + videoId;
		}
		return href;
	}
	/**
	 * ポップアップを表示します。
	 */
	show(source, href, obj){
		const nodePopup = Popup.add(obj, source);
		if(nodePopup){
			nodePopup.container.className = "popupVideo";
			Popup.reposition(nodePopup);
		}
	}
	/**
	 * 動画を埋め込んだオブジェクトを生成します。
	 */
	getElement(href, is_embed){
		if(!href) return null;

		const _htmlToDOM = (html) => {
			const parent = document.createElement("div");
			parent.innerHTML = html || "";
			return (parent.childNodes.length > 1) ? parent.childNodes : parent.firstChild;
		};
		const videoSize = is_embed ? ResImage.videoSize : this.videoSize;
		const html = [
			'<iframe width="', videoSize.width,
			'" height="', videoSize.height,
			'" src="', href,
			'" frameborder="0" scrolling="no" allowfullscreen></iframe>'
		].join("");
		return _htmlToDOM(html);
	}
}
// グローバル変数名へのマッピング
var VideoPopup = new VideoPopupManager();


/**
 * スレッド情報のポップアップを管理するクラス
 */
class ThreadInfoPopupManager extends PopupBase {
	constructor() {
		super("ThreadInfoPopup");
		/**
		 * スレッド情報のキャッシュ
		 */
		this._threadInfoCache = [];
	}
	/**
	 * スレッドURLか判定します。
	 */
	isThread(href){
		const reThread = [ /\/test\/read\.cgi\//, /\/bbs\/read\.cgi\// ];
		return reThread.some((re) => re.test(href));
	}
	/**
	 * ポップアップを表示します。
	 */
	show(source, href){
		if(!SkinPref.get("enableThreadInfoPopup")) return;
		if(!this.isThread(href)) return;

		const popup = (info) => {
			const content = _doc.createDocumentFragment();
			const div = _doc.createElement("div");
			div.className = "popupHeader";
			div.appendChild(_doc.createTextNode(info.boardText));
			const br = _doc.createElement("br");
			div.appendChild(br.cloneNode(false));
			div.appendChild(_doc.createTextNode(info.titleText));
			div.appendChild(br.cloneNode(false));
			div.appendChild(_doc.createTextNode(info.numsText));
			content.appendChild(div);
			Popup.add(content, source);
		};

		const matchPath = href.match(/(.+)\/[^\/]*$/);
		if (!matchPath) return;
		const url = matchPath[1] + "/";

		if(url in this._threadInfoCache){
			popup(this._threadInfoCache[url]);
		}else{
			this._threadInfoCache[url] = {};
			const boardUrl = Board.getUrlByThread(url);
			const name = Board.getName(boardUrl);
			this._threadInfoCache[url].boardText = "板名：" + ((typeof name === "undefined") ? "不明" : name);
			this._threadInfoCache[url].titleText = "スレッド名：不明";
			this._threadInfoCache[url].numsText = "件数：不明";

			AjaxGet(TD.serverUrl + url + "1n", true)
			.then((html) => {
				if(!html) return;
				const tmpDoc = document.createElement("div");
				tmpDoc.innerHTML = html;
				const title = tmpDoc.querySelector("#threadName")?.textContent;
				this._threadInfoCache[url].titleText = "スレッド名：" + ((typeof title === "undefined") ? "不明" : title);

				const footer = tmpDoc.querySelector("#footer");
				if(footer){
					const allCount = footer.getAttribute("allres");
					const getCount = parseInt(footer.getAttribute("getres"), 10);
					if(Bookmark.load(url) === 0){
						if(SkinPref.get("enableThreadInfoPopupAutoBookmark") && getCount <= 0){
							Bookmark.save(url, 1);
						}
					}
					this._threadInfoCache[url].numsText = "件数：" + ((typeof allCount === "undefined") ? "不明" : allCount + " 件");
				}
				popup(this._threadInfoCache[url]);
			})
			.catch((e) => {
				this.log.err("show error: " + e.message);
				this._threadInfoCache[url].titleText = "スレッド名：不明";
				this._threadInfoCache[url].numsText = "件数：不明";
				popup(this._threadInfoCache[url]);
			});
		}
	}
}
// グローバル変数名へのマッピング
var ThreadInfoPopup = new ThreadInfoPopupManager();

/**
 * スレッドテンプレートのポップアップを管理するクラス
 */
class TemplatePopupManager extends PopupBase {
	constructor() {
		super("TemplatePopup");
		/**
		 * >>1 のID
		 * @type {string}
		 */
		this._builderId = null;
		/**
		 * >>1 の日付の1970/1/1 00:00:00 (UTC)からのミリ秒値
		 * @type {number}
		 */
		this._startTime = null;
	}
	/**
	 * 指定のレス要素がテンプレートポップアップ対象かどうかを判定します。
	 */
	selectRes(node){
		if(!this._builderId){
			const resOne = Nodes.getRes(1);
			const id = resOne ? Nodes.getResID(Nodes.getResHeader(resOne)).getAttribute("rel") : null;
			if(ID.isValidID(id)) this._builderId = id;
			else                 this._builderId = '???';
		}

		if(this._builderId !== '???'){
			if(Nodes.getResID(Nodes.getResHeader(node)).getAttribute("rel") !== this._builderId) return false;
		}else{
			const date = Analyse.getDateFromString(ResNodes.getDateText(node));
			const time = date.getTime();
			if(!this._startTime) this._startTime = time;
			const minute = SkinPref.get("valueTemplateSelectCheckTime");
			if((this._startTime + minute * 60 * 1000) < time) return false;
		}
		return true;
	}
	/**
	 * ポップアップを表示します。
	 */
	show(e){
		const template = _doc.getElementById("TemplateBody");
		if (!template) return;
		const top = _doc.getElementById("header").offsetHeight;
		template.style.top = (top + window.scrollY) + "px";
		const div = _doc.createElement("div");
		template.appendChild(div);

		const resIdx = SkinPref.get("valueTemplateRes");
		const end = SelOpts.TemplateRes[(resIdx < 0 || 4 < resIdx) ? 0 : resIdx];
		const hotkey = SkinPref.get("valueTemplateSelectHotkey");
		if(hotkey === e.ctrlKey){
			ResPopup.show(div, 1, end, null, this.selectRes.bind(this));
		}else{
			ResPopup.show(div, 1, end);
		}
	}
}
// グローバル変数名へのマッピング
var TemplatePopup = new TemplatePopupManager();


/**
 * ポップアップのイベント処理を扱うクラス
 */
class OutlinkPopupManager extends PopupBase {
	constructor() {
		super("OutlinkPopup");
	}
	/**
	 * イベントを処理します。
	 */
	handleEvent(e){
		if(e.type !== "mouseover") return;
		const node = e.target;
		const blocked = node.className === "ivurBlockedLink";
		const ivurLink = node.className === "ivurLink" && !VideoPopup.getVideoSource(node.rel, false);
		const src = (ivurLink ? "/ivur/" : "") + node.rel;

		if(ThreadInfoPopup.isThread(src)){
			ThreadInfoPopup.show(node, src);
		}else if(blocked){
			const ft = _doc.createElement("div");
			const content = _doc.createElement("div");
			content.textContent = "ImageViewURLReplace.dat によって無効化されたリンクです";

			if(ImagePopup.isImage(src)){
				const show = _doc.createElement("div");
				show.textContent = "画像を表示する";
				show.title = src;
				show.style.display = "inline-block";
				show.style.margin = "8px 0 4px 0";
				show.style.padding = "6px";
				show.style.border = "1px solid";
				show.style.cursor = "pointer";
				show.addEventListener("click", () => {
					Popup.remove_last();
					node.className = "outLink";
					this.handleEvent(e);
				}, { once: true });

				ft.style.textAlign = "center";
				ft.appendChild(show);
			}

			content.appendChild(ft);
			Popup.add(content, node);
		}else if(ImagePopup.isImage(src)){
			if(node.getAttribute("no_popup")) return;
			const resNum = ResNodes.getResNumByOutLink(node);
			const is_gro = SkinPref.get("enableImageGroCheck") && ImagePopup.isImageGrotesque(resNum);
			const ctrl = e.ctrlKey;
			if(ctrl ^ SkinPref.get("enableDefaultPixelation") || is_gro){
				const gro_level = is_gro ^ ctrl;
				const m = SkinPref.get("valuePixelationMethod");
				switch(m){
				case 0:
					ImagePopup.pixelateShow(node, src, gro_level); break;
				case 1:
					ImagePopup.blurShow(node, src, gro_level); break;
				default:
					ImagePopup.pixelateShow(node, src, gro_level);
				}
			}else{
				ImagePopup.show(node, src);
			}
			if(is_gro) node.setAttribute("title", "表示注意");
			if(SkinPref.get("enableEmbedLoadOnLinkMouseOver")){
				const body = ResNodes.getBodyByResNum(resNum);
				if(!body) return;
				Array.from(body.querySelectorAll('.embedInline[state="ready"], .embedLast[state="ready"]'))
				.forEach((frame) => (frame.getAttribute("src") === src) && ResImage.loadImage(frame, src));
			}
		}else{
			const embedSrc = VideoPopup.getVideoSource(src, false);
			if(embedSrc){
				if(node.getAttribute("no_popup")) return;
				const element = VideoPopup.getElement(embedSrc, false);
				if(element && SkinPref.get("enableVideoPopup")) VideoPopup.show(node, embedSrc, element);
			}else if(UrlPopup.isValid(src)){
				UrlPopup.show(node, src);
			}
		}
	}
}
// グローバル変数名へのマッピング
var OutlinkPopup = new OutlinkPopupManager();

//======================================
// コンテキストメニュー関連
//======================================

/**
 * コンテキストメニューの枠組みを提供します。
 */
class ContextMenu {
	/**
	 * ContextMenu オブジェクトを作成します。
	 * @param {Array<Array, string>}	メニュー項目
	 */
	constructor(items){
		this.log = new SkinLog("ContextMenu", SkinLogLvl.WARNING);
		this.log.info("new(items)");
		/**
		 * コンテキストメニューとして表示するメニュー項目
		 * @type {Array}
		 * @example
		 * [
		 *     ["MenuItem 1", "IDM_MENUITEM1"], // キャプション, ID
		 *     [["MenuItem 2 with icon", "foobar.png"], "IDM_MENUITEM2"], // アイコン付(旧仕様)
		 *     [["MenuItem 2 with icon", "FooBar"], "IDM_MENUITEM2"], // アイコン付(スタイル ID 指定)
		 *     ["-"], // 区切り線
		 *     ["SubMenu 1", [ // サブメニュー
		 *         ["SubMenuItem 1", "IDM_SUBMENUITEM1"],
		 *         ["SubMenuItem 2", "IDM_SUBMENUITEM2"]
		 *     ]]
		 * ]
		 */
		this.items = items;
		/**
		 * コンテキストメニューで使用する PopupItem オブジェクト
		 * @type {PopupItem}
		 */
		this.popupItem =  null;
		/**
		 * メニュー項目がクリックされたときに呼ばれる関数
		 * @type {function(string, string, event)}
		 */
		this.onClick = null;
		/**
		 * コンテキストメニューが削除されるときに呼ばれる関数
		 * @type {function()}
		 */
		this.onRemove = null;
		/**
		 * サブメニューが親のコンテキストメニューを指し示す ContextMenu オブジェクト
		 * @type {ContextMenu}
		 */
		this.parentMenu = null;
		/**
		 * 親のコンテキストメニューがサブメニューを指し示す ContextMenu オブジェクト
		 * @type {ContextMenu}
		 */
		this.childMenu = null;
		/**
		 * イベントハンドラ
		 * @type {function()}
		 */
		this.f = this.onMouseDown.bind(this);
		/**
		 * メニューIDを記憶しておきます。
		 * @type {number}
		 */
		this.prev_id = null;

		window.addEventListener("mousedown", this.f, false);
	}
	/**
	 * mousedown イベントを処理します。
	 * @param {event}	e	イベント
	 */
	onMouseDown(e){
		if(this.popupItem){
			if((e.target.rel ? e.target.rel : e.target.parentNode.rel) === "ContextMenu"){
				if(e.button === 1){
					e.preventDefault();
					e.stopPropagation();
				}
			}else{
				this.remove();
			}
		}
	}
	/**
	 * コンテキストメニューを表示します。
	 * @param {number} 		x1		メニューが表示される原点の X 座標
	 * @param {number} 		y1		メニューが表示される原点の Y 座標
	 * @param {number} 		[y2]	メニューが表示しきれないときに使用される原点の X 座標
	 * @param {number} 		[y2]	メニューが表示しきれないときに使用される原点の Y 座標
	 * @param {ContextMenu}	[parentMenu]	サブメニューを表示するときに使用される親メニューの ContextMenu オブジェクト
	 */
	show(x1, y1, x2, y2, parentMenu){
		this.popupItem = new PopupItem(null);
		this.popupItem.container.className = "contextMenu";
		const ul = _doc.createElement("ul");
		ul.customMenu = this;
		ul.popupItemContainer = this.popupItem.container;
		ul.rel = "ContextMenu";
		if(parentMenu){
			this.parentMenu = parentMenu;
			this.parentMenu.childMenu = this;
		}

		this.items.forEach((it) => {
			if(it[0] === "-"){
				ul.appendChild(_doc.createElement("hr"));
				return;
			}
			let a = null;
			const li = _doc.createElement("li");
			const span = _doc.createElement("span");
			span.className = "icon";
			if(it[0] instanceof Array){
				span.innerHTML = it[0][0];
				span.id = "context" + it[0][1];
			}else{
				span.innerHTML = it[0];
			}
			span.rel = "ContextMenu";
			li.appendChild(span);
			li.id = it[1];
			li.rel = "ContextMenu";
			li.ref = it[0];
			if(it[1] instanceof Array){
				li.className = "more";
				li.menuItems = it[1];
				li.onmouseover = (e) => {
					const current = e.currentTarget;
					const parent = current.parentNode;
					const parent_menu = parent.customMenu;
					if(parent_menu){
						if(parent_menu.prev_id === current.id) return;
						parent_menu.prev_id = current.id;
						parent_menu.removeChild();
					}
					current.className = "selectedMore";
					const menu = new ContextMenu(current.menuItems);
					menu.onClick = parent_menu ? parent_menu.onClick : null;
					menu.show(
						parent.popupItemContainer.offsetLeft + parent.popupItemContainer.offsetWidth - 6,
						parent.popupItemContainer.offsetTop + current.offsetTop,
						parent.popupItemContainer.offsetLeft + 6,
						parent.popupItemContainer.offsetTop + current.offsetTop + current.offsetHeight,
						parent_menu
					);
				};
			}else{
				li.onmouseover = (e) => {
					const parent_menu = e.currentTarget.parentNode.customMenu;
					if(parent_menu){ //customMenu){
						parent_menu.prev_id = "";
						parent_menu.removeChild();
					}
				};
				li.onmousedown = (e) => {
					if(e.button !== 0) return; // 左クリック以外で反応しないように
					const parent_menu = e.currentTarget.parentNode.customMenu;
					if(parent_menu){
						parent_menu.remove();
						parent_menu.onClick(e.currentTarget.textContent, e.currentTarget.id, e);
					}
				};
				if(li.id.match(/^a:/i)){
					a = _doc.createElement("a");
					a.rel = "ContextMenu";
					a.href = RegExp.rightContext;
					a.appendChild(li);
				}
			}
			if(it.checked) li.classList.add("checked");

			ul.appendChild(a ? a : li);
		});

		this.popupItem.content.appendChild(ul);
		if(!x2) x2 = x1;
		if(!y2) y2 = y1;
		const popup = this.popupItem.container;
		popup.style.visibility = "hidden";
		_doc.body.appendChild(popup);
		if((window.innerWidth < (x1 + popup.offsetWidth)) && (x2 > popup.offsetWidth)){
			popup.style.left = x2 - popup.offsetWidth;
		}else{
			popup.style.left = x1;
		}
		if((window.innerHeight < (y1 + popup.offsetHeight)) && (y2 > popup.offsetHeight)){
			popup.style.top = y2 - popup.offsetHeight + 12;
		}else{
			popup.style.top = y1;
		}
		popup.style.visibility = "visible";
		this.popupItem.content.focus();
	}
	/**
	 * コンテキストメニューを削除します。
	 */
	remove(){
		let next = this;
		let prev;
		while(next.parentMenu){
			if(next.parentMenu.popupItem.container.parentNode){
				next.parentMenu.popupItem.container.parentNode.removeChild(next.parentMenu.popupItem.container);
			}
			prev = next;
			next = next.parentMenu;
			prev.parentMenu = null;
		}
		next = this;
		while(next.childMenu){
			if(next.childMenu.popupItem.container.parentNode){
				next.childMenu.popupItem.container.parentNode.removeChild(next.childMenu.popupItem.container);
			}
			prev = next;
			next = next.childMenu;
			prev.childMenu = null;
		}
		if(this.popupItem.container.parentNode){
			this.popupItem.container.parentNode.removeChild(this.popupItem.container);
		}
		window.removeEventListener("mousedown", this.f, false);
		if(this.onRemove) this.onRemove(this);
	}
	/**
	 * コンテキストメニューのサブメニューを削除します。
	 */
	removeChild(){
		let next = this.childMenu;
		while(next){
			next.popupItem.container.parentNode.removeChild(next.popupItem.container);
			next = next.childMenu;
		}
		const li = this.popupItem.content.childNodes[0].childNodes;
		for(let i = 0, n = li.length; i < n; i++){
			const classlist = li[i].classList;
			if(classlist.contains("selectedMore")){
				classlist.remove("selectedMore");
				classlist.add("more");
			}
		}
		this.childMenu = null;
	}
	/**
	 * 要素の位置とサイズを取得します。
	 * @param  {Element}	src		要素
	 * @return {Object}		left, top, width, height, right, bottom の各メンバから成るオブジェクト
	 */
	getRect(src){
		let parent = src;
		let x = 0;
		let y = 0;
		while(parent){
			x += parent.offsetLeft;
			y += parent.offsetTop;
			parent = parent.offsetParent;
		}
		return {
			left:	x,
			top:	y,
			width:	src.offsetWidth,
			height:	src.offsetHeight,
			right:	x + src.offsetWidth,
			bottom:	y + src.offsetHeight
		};
	}
}

/**
 * スレッドタイトル部のコンテキストメニューを管理します。
 * @namespace
 */
var ThreadNameContextMenu = {
	/**
	 * コンテキストメニューのメニュー項目
	 * @type {Array}
	 */
	items: [],
	/**
	 * ContextMenu オブジェクト
	 * @type ContextMenu
	 */
	customMenu: null,
	/**
	 * メニュー項目を作成する
	 */
	init(){
		this.items.push(
			[["コピー","Copy"],[
				["タイトルと URL", "copyTitleAndUrl"],
				["-"],
				["タイトル", "copyTitle"],
				["URL", "copyUrl"]
			]]);
		this.items.push(["-"]);
		this.items.push(
			["置換",[
				["アンカー", "replaceAnchor"],
				["Replace.txt", "replaceStr"],
				["-"],
				["すべて", "replaceAll"]
			]]);
		this.items.push(
			["埋込み",[
				["グロチェックあり", "embedImageWithCheck"],
				["-"],
				["すべて", "embedImageAll"]
			]]);
		this.items.push(["-"])
		this.items.push(
			["あぼーん切り替え", "toggleAbone"]
			);
		if(!SysPref.disableStorage){
			this.items.push(
			["自分のレス",[
				["このスレのレス番号を全消去", "clearMyPosts"],
				["この板のIDを全消去", "clearMyIDs"]
			]]);
		}
	},
	/**
	 * メニューを開いているか。
	 */
	is_open: false,
	/**
	 * メニュー項目がクリックされたときの処理をします。
	 * @param {string} caption メニュー項目のキャプション
	 * @param {string} id      メニュー項目の ID
	 * @param {event}  e       オリジナルの click イベントの Event オブジェクト
	 */
	onClick(caption, id){
		switch (id){
		case "copyTitleAndUrl":
			Clipboard.setClipboard(ThreadDocument.title + "\n" + TD.threadUrl + "\n");
			break;
		case "copyTitle":
			Clipboard.setClipboard(ThreadDocument.title);
			break;
		case "copyUrl":
			Clipboard.setClipboard(TD.threadUrl);
			break;
		case "replaceAnchor":
		case "replaceStr":
		case "replaceAll":
			ThreadDocument.modifyContent(Nodes.content, (id === "replaceStr") ? false : true, (id === "replaceAnchor") ? false : true);
			break;
		case "embedImageWithCheck":
		case "embedImageAll":
			ResImage.embed(null, (id === "embedImageAll"));
			break;
		case "toggleAbone":
			b2rAboneHandler.reloadThread(true);
			break;
		case "clearMyPosts":
			MyAndRep.clearMyPosts();
			break;
		case "clearMyIDs":
			MyAndRep.clearMyIDs();
		}
	},
	/**
	 * コンテキストメニューが削除されたときの処理をします。
	 */
	onRemove(){
		this.customMenu = null;
		this.is_open = false;
	},
	/**
	 * contextmenu イベントを処理します。
	 * @param {event}	e	イベント
	 */
	onContextMenu(e){
		if(e.target.id === "threadName"){
			this.customMenu = new ContextMenu(this.items);
			this.customMenu.onClick = this.onClick;
			this.customMenu.onRemove = this.onRemove.bind(this);
			this.customMenu.show(e.target.offsetLeft, e.target.offsetTop + e.target.offsetHeight);
			this.is_open = true;
			return true;
		}
		return false;
	}
};

/**
 * レス番号部のコンテキストメニューを管理します。
 * @namespace
 */
var ResNumberContextMenu = {
	/**
	 * コンテキストメニューのメニュー項目
	 * @type {Array<Array, string>}
	 */
	items: [],
	/**
	 * ContextMenu オブジェクト
	 * @type {ContextMenu}
	 */
	customMenu: null,
	/**
	 * トリガー元の要素
	 * @type {Element}
	 */
	target: null,
	/**
	 * メニュー項目を作成する
	 */
	init(){
		this.items.push(
			["<b>返信...</b>", "reply"]
			);
		this.items.push(["-"]);
		this.items.push(
			[["コピー","Copy"],[
				["すべて(V2C 形式)", "copyV2C"],
				["すべて(Jane 形式)", "copyJane"],
				["URL+すべて(V2C 形式)", "copyV2CWithUrl"],
				["URL+すべて(Jane 形式)", "copyJaneWithUrl"],
				["-"],
				["本文", "copyBody"],
				["名前", "copyName"],
				["メール", "copyMail"],
				["日付", "copyDate"],
				["ID", "copyID"],
				["BeID", "copyBeID"],
				["-"],
				["このレスのURL", "copyUrl"],
				["2ch荒らし報告形式", "copyVandalismReport"]
			]]);
		if(!SysPref.disableStorage){
			this.items.push(["-"]);
			this.items.push(
			["自分のレス",[
				["レス番号(登録/消去)", "toggleMyPost"],
				["ID(登録/消去)", "toggleMyID"]
			]]);
		}
		this.items.push(["-"]);
		this.items.push(
			["必死チェッカー...", "hissiID"]
			);
		this.items.push(["-"]);
		this.items.push(
			["置換",[
				["アンカー", "replaceAnchor"],
				["Replace.txt", "replaceStr"],
				["-"],
				["すべて", "replaceAll"]
			]]);
		this.items.push(
			["埋込み(強制)",[
				["グロチェックあり", "embedImageWithCheck"],
				["-"],
				["すべて", "embedImageAll"]
			]]);
	},
	/**
	 * メニューを開いているか。
	 */
	is_open: false,
	/**
	 * コピーするテキストを取得します。
	 * @param 	{number}　resNum		レス番号
	 * @param 	{string} menuid		メニュー項目のID
	 * @return	{string} コピーするテキスト
	 */
	getCopyText(resNum, menuid){
		const quotation = SkinPref.get("enableCopyWithQuotationMark");
		const quote = (str, flag) => {
			if(flag){
				const lines = str.split('\n');
				for(let i = 0, n = lines.length; i < n-1; i++){
					lines[i] = '> ' + lines[i];
				}
				return lines.join('\n');
			}else{
				return str;
			}
		};

		let text = "";
		switch(menuid){
		case "copyV2C":
			text = quote(ResNodes.getEntireTextByIndex(resNum, "V2C"), quotation);
			break;
		case "copyJane":
			text = quote(ResNodes.getEntireTextByIndex(resNum, "Jane"), quotation) + "\n";
			break;
		case "copyV2CWithUrl":
			text = TD.threadUrl + resNum + "\n" + quote(ResNodes.getEntireTextByIndex(resNum, "V2C"), quotation);
			break;
		case "copyJaneWithUrl":
			text = TD.threadUrl + resNum + "\n\n" + quote(ResNodes.getEntireTextByIndex(resNum, "Jane"), quotation) + "\n";
			break;
		case "copyVandalismReport":
			text = TD.threadUrl + ResNodes.getEntireTextByIndex(resNum, "Report");
			break;
		case "copyBody":
			text = quote(ResNodes.getBodyText(Nodes.getRes(resNum)), quotation);
			break;
		case "copyName":
			text = ResNodes.getNameText(Nodes.getRes(resNum));
			break;
		case "copyMail":
			text = ResNodes.getMailText(Nodes.getRes(resNum));
			break;
		case "copyDate":
			text = ResNodes.getDateText(Nodes.getRes(resNum));
			break;
		case "copyID":
			text = ResNodes.getIDText(Nodes.getRes(resNum));
			break;
		case "copyBeID":
			text = ResNodes.getBeIDText(Nodes.getRes(resNum));
			break;
		case "copyUrl":
			text = TD.threadUrl + resNum + "\n";
		}
		return text;
	},
	/**
	 * メニュー項目がクリックされたときの処理をします。
	 * @param {string} caption	メニュー項目のキャプション
	 * @param {string} menuid	メニュー項目の ID
	 */
	onClick(caption, menuid){
		const res = ResNodes.getParentContainer(this.target);
		const resNum = Nodes.getResNumByContainer(res);
		const resID = Nodes.getResID(Nodes.getResHeader(res)).getAttribute("rel");
		if(menuid === "reply"){
			ThreadDocument.writeTo(resNum);
		}else if(menuid.indexOf("copy") === 0){
			Clipboard.setClipboard(this.getCopyText(resNum, menuid));
		}else if(menuid === "hissiID"){
			const date = /(\d{4}).(\d{2}).(\d{2})/.exec(ResNodes.getDateText(res)) !== null ? (RegExp.$1 + RegExp.$2 + RegExp.$3) : "";
			this.checkHissi(date, resID);
		}else if(menuid === "toggleMyPost"){
			MyAndRep.toggleMyPost(resNum);
		}else if(menuid === "toggleMyID"){
			MyAndRep.toggleMyID(resID);
		}else if(menuid.indexOf("replace") === 0){
			ThreadDocument.modifyContent(res, (menuid === "replaceStr") ? false : true, (menuid === "replaceAnchor") ? false : true);
		}else if(menuid.indexOf("embedImage") === 0){
			const nocheck = (menuid === "embedImageAll") ? true : false;
			ResImage.forceEmbed = true;
			ResImage.embed(res, nocheck);
			ResImage.forceEmbed = false;
		}
		this.onRemove(); //TN 逆参照のポップアップを削除するために必要(要確認)
	},
	/**
	 * コンテキストメニューが削除されたときの処理をします。
	 */
	onRemove(){
		this.customMenu = null;
		this.is_open = false;
	},
	/**
	 * contextmenu イベントを処理します。
	 * @param {event}	e	イベント
	 */
	onContextMenu(e){
		try{
			if(!e.target.parentNode.classList.contains("resNumber")) return false;
		}catch(e){
			return false;
		}
		this.target = e.target;
		this.customMenu = new ContextMenu(this.items);
		this.customMenu.onClick = this.onClick.bind(this);
		this.customMenu.onRemove = this.onRemove.bind(this);
		const rc = this.customMenu.getRect(this.target);
		this.customMenu.show(rc.left - window.scrollX, rc.top + rc.height - window.scrollY);
		this.is_open = true;
		return true;
	},
	/**
	 * IDを必死チェッカーもどきで検索します。
	 * @param {string}	date	日時文字列 YYYYMMDD
	 * @param {string}	id		レスID
	 */
	checkHissi(date, id){
		const boardUrl = ThreadDocument.boardUrl;
		const idbase64 = _doc.defaultView.btoa(id).replace(/=/g, "");
		const url = boardUrl.replace(/.*\/([^\/]+)\//, "http://hissi.org/read.php/$1/") + date + "/" + idbase64 + ".html";
		const ret = window.confirm("ID:" + id + " を必死チェッカーもどきで検索します。");
		if(ret) window.open(url);
	}
};

/**
 * >> 部のコンテキストメニューを管理します。
 * @namespace
 */
var ChevronContextMenu = {
	/**
	 * コンテキストメニューのメニュー項目
	 * @type {Array<Array, string>}
	 */
	items: ([
		["自動更新", "enableAutoReload"],
		["-"],
		["テンプレ表示", "template"],
		["-"],
		["要約", "digest"],
		["人気レス", "popular"],
		["スレッド情報...", "showInfo"],
		["-"],
		[["コピー","Copy"],[
			["タイトルと URL", "copyTitleAndUrl"],
			["-"],
			["タイトル", "copyTitle"],
			["URL", "copyUrl"]
		]],
		["-"],
		["オプション...", "showOption"],
		["-"],
		["README を開く", "openReadme"],
		["変更履歴を開く", "openChangelog"]
		]),
	/**
	 * ContextMenu オブジェクト
	 * @type {ContextMenu}
	 */
	customMenu: null,
	/**
	 * メニューを開いているか。
	 */
	is_open: false,
	/**
	 * メニュー項目がクリックされたときの処理をします。
	 * @param {string} caption	メニュー項目のキャプション
	 * @param {string} id		メニュー項目の ID
	 * @param {event}  e		イベント
	 */
	onClick(caption, id, e){
		let menu;
		switch(id){
		case "enableAutoReload":
			menu = this.items[0];
			menu.checked = menu.checked ? false : true;
			AutoReload.enabled = menu.checked;
			break;
		case "template":
			TemplatePopup.show(e);
			break;
		case "digest":
			menu = this.items[4];
			menu.checked = menu.checked ? false : true;
			Digest.enabled = menu.checked;
			break;
		case "popular":
			menu = this.items[5];
			menu.checked = menu.checked ? false : true;
			Popular.enabled = menu.checked;
			break;
		case "showInfo":
			Dialog.showAnalyse();
			break;
		case "copyTitleAndUrl":
			Clipboard.setClipboard(ThreadDocument.title + "\n" + TD.threadUrl + "\n");
			break;
		case "copyTitle":
			Clipboard.setClipboard(ThreadDocument.title);
			break;
		case "copyUrl":
			Clipboard.setClipboard(TD.threadUrl);
			break;
		case "showOption":
			Dialog.showOption();
			break;
		case "openReadme":
			window.open(TD.skinPath + 'README.md');
			break;
		case "openChangelog":
			window.open(TD.skinPath + 'CHANGELOG.md');
		}
	},
	/**
	 * コンテキストメニューが削除されたときの処理をします。
	 */
	onRemove(){
		this.customMenu = null;
		this.is_open = false;
	},
	/**
	 * mousedown イベントを処理します。
	 * @param {event}	e	イベント
	 */
	onMouseDown(e){
		// Chevron メニューの表示位置補正(いまいちなやり方…)
		const nAddY = 6;		// 縦方向の補正 pixel 量(標準スタイルデフォルト:+6)

		const node = e.target;
		if(node) if(node.id === "chevron" || node.id === "chevronText"){
			if(this.customMenu){
				this.customMenu.remove();
				this.customMenu = null;
				return true;
			}
			this.items[0].checked = AutoReload.enabled;
			this.items[4].checked = Digest.enabled;
			this.items[5].checked = Popular.enabled;
			this.customMenu = new ContextMenu(this.items);
			this.customMenu.onClick = this.onClick.bind(this);
			this.customMenu.onRemove = this.onRemove.bind(this);
			e.cancelBubble = true;
			e.preventDefault();
			const rc = this.customMenu.getRect(node);
			const is_right = (rc.left + 100 > _doc.body.clientWidth);
			const is_bottom = (rc.top + 100 > _doc.body.clientHeight);
			const x = rc.left + (is_right ? rc.width : 0);
			const y = rc.top + (is_bottom ? -1 : 1) * rc.height + (is_bottom ? 2 : 1) * nAddY;
			this.customMenu.show(x, y);
			this.is_open = true;
		}
		return true;
	}
};

/**
 * 独自ダイアログを管理するクラス
 */
class DialogManager {
	showOption(){
		if(OptionsDialog === null){
			OptionsDialog = new dialogOptions();
		}
		OptionsDialog.show();
	}
	showAnalyse(){
		if(AnalyseDialog === null){
			AnalyseDialog = new dialogAnalyse();
		}
		AnalyseDialog.analyse();
	}
}
// グローバル変数名へのマッピング
var Dialog = new DialogManager();

/**
 * コンテキストメニューのイベントリスナを登録します。
 */
_doc.addEventListener("contextmenu", (e) => {
	if(ThreadNameContextMenu.onContextMenu(e) || ResNumberContextMenu.onContextMenu(e)){
		e.stopPropagation();
		e.preventDefault();
	}
}, true);
window.addEventListener("mousedown", ChevronContextMenu.onMouseDown.bind(ChevronContextMenu), true);

//======================================
// [オプション] ダイアログ関連
//======================================

/**
 * [オプション] ダイアログを管理します。
 */
class dialogOptions {
	/**
	 * dialogOptions オブジェクトを作成します。
	 */
	constructor(){
		this.log = new SkinLog("dialogOptions", SkinLogLvl.WARNING);
		this.log.info("new()");
		/**
		 * 初期設定済か
		 * @type {boolean}
		 */
		this._init = false;
		/**
		 * スタイル名称のリスト
		 * @type {Array<string>}
		 */
		this._style_name = [];
		/**
		 * スタイル定義ファイル名（ベースのみ）のリスト
		 * @type {Array<string>}
		 */
		this._style_file = [];
		/**
		 * 非表示時に（縦スクロールバーが出た場合の）スクロール位置を記憶し再表示時に戻します。
		 * @type {number}
		 */
		this._scrollTop = 0;
		/**
		 * ブラウザーの表示領域のサイズを記憶しておきます。
		 * @type {Object}
		 */
		this._winSize = {width:0, height:0};
		/**
		 * ダイアログの親要素
		 * @type {Element}
		 */
		this._content = null;
		/**
		 * ダイアログのヘッダ要素
		 * @type {Element}
		 */
		this._header = null;
		/**
		 * ダイアログのページのコンテナ要素
		 * @type {Element}
		 */
		this._pageTop = null;
		/**
		 * ページIDのリスト
		 * @type {Array<string>}
		 */
		this._pageIdList = ["General","General2","Special","Special2","Special3","Help","FAQ","About"];
		/**
		 * 現在選択中のページ要素のインデックス
		 * @type {number}
		 */
		this._pageIdx = 0;
		/**
		 * ダイアログのフッタ要素
		 * @type {Element}
		 */
		this._footer = null;
		/**
		 * フレーム要素の算出されたスタイル情報
		 * @type {CSSStyleDeclaration}
		 */
		this._styleFrame = null;
		/**
		 * ダイアログのヘッダの高さ
		 * @type {number}
		 */
		this._headerHeight = 52;
	}
	/**
	 * [OK] ボタンが押されたときの処理をします。
	 */
	onOK(){
		const fn = "onOK()";
		this.log.info(fn);

		if(SkinPref.init()){
			// 各要素の値を取得して設定に保存
			const selector = 'label.dialogOptionsLabel > input, label.dialogOptionsLabel > select';
			Array.from(_doc.querySelectorAll(selector)).forEach((elem) => {
				if(elem.tagName === "INPUT"){
					switch(elem.getAttribute('type')){
						case 'checkbox':
						case 'radio':
							SkinPref.set(elem.id, elem.checked);
							break;
						case 'text':
							SkinPref.set(elem.id, elem.value);
							break;
						default:
							this.log.warn("id=" + elem.id + ", type=" + elem.getAttribute('type'));
					}
				}else if(elem.tagName === "SELECT"){
					SkinPref.set(elem.id, elem.selectedIndex);
				}
			});
			// RelplaceStr.txt 読み込み
			if(SkinPref.get("enableReplaceStr")){
				const REPLACESTR = "ReplaceStr.txt";
				this.log.info("Loading " + REPLACESTR + "...");

				ReplaceStr.init();

				AjaxGet(TD.skinPath + REPLACESTR, true)
				.then((text) => {
					try {
						ReplaceStr.parseRule(text);
					}
					catch(e){
						const errmsg = "RelplaceStr.txt の読み込みでエラーが発生しました。\n" +
									   "以下のエラーメッセージを参考にして\n" +
									   "ReplaceStr.txt を修正してください。\n\n" +
									   e.message;
						alert(errmsg);
						return;
					}
					ReplaceStr.save();
					this.finishOK();
				})
				.catch((e) => {
					this.log.err(fn + ":" + e.message);
					this.finishOK();
				});
			}else{
				this.finishOK();
			}
		}
	}
	/**
	 * [OK] ボタンが押された後の終了処理をします。
	 */
	finishOK(){
		const fn = "finishOK()";
		this.log.info(fn);

		this.hide();
		this.clear();
		const idx = SkinPref.get("valueSkinStyle");
		const skinName = this._style_file[idx];
		SkinPref.set("nameSkinStyle", skinName);
		_doc.getElementById("skinstyle").href = TD.skinPath + "style-" + skinName + ".css";
		SkinPref.set("hasConfig", true);

		const needReload = SkinPref.save();
		const modeApply  = SkinPref.get("valueReloadForPrefApply");
		if(needReload && modeApply !== 0){
			if(modeApply === 2 || window.confirm("リロードが必要な項目が変更されました。リロードしますか？")){
				// リロード
				const url = location.href;
				location.href = url;
			}
		}

		// オプションの即時反映
		// [画像ポップアップ]
		ImagePopup.update();
		// [IDピックアップ]
		IDExtract.update();
		// [カウント表示]
		ID.update();
		Name.update();
		// [自分/返信レス]
		MyAndRep.update();
		// [その他]
		ResImage.update();
	}
	/**
	 * [キャンセル] ボタンが押されたときの処理をします。
	 */
	onCancel(){
		this.log.info("onCancel()");
		this.hide();
		this.clear();
	}
	/**
	 * [設定初期化] ボタンが押されたときの処理をします。
	 */
	onClear(){
		this.log.info("onClear()");
		if(window.confirm("設定を初期化しますか？")){
			this.hide();
			SkinPref.clear();
			this.clear();
		}
	}
	/**
	 * リサイズされたときの処理をします。
	 */
	onResize(){
		this.log.info("onResize()");
		if(!this._content) return;
		if(this.setOverflow()){
			this._content.style.left = (_doc.body.offsetWidth - this._content.offsetWidth) / 2;
			this._content.style.top  = (window.innerHeight - this._content.offsetHeight) / 2;
		}
		this._winSize.width  = window.innerWidth;
		this._winSize.height = window.innerHeight;
	}
	/**
	 * ダイアログやブラウザーウインドウのサイズ変更によりはみ出した場合の調整を行います。
	 * @return {boolean}	ダイアログの位置調整が必要か
	 */
	setOverflow(){
		this.log.info("setOverflow()");
		if(!this._content) return;
		this._content.style.maxHeight = "100%";

		// 現在選択ページの高さサイズ（マージンも加える）
		if(!this._styleFrame){
			this._styleFrame = getComputedStyle(_doc.getElementById("Frame_FAQ_FAQ"), "");
		}
		const sf = this._styleFrame;
		const divPage = this._pageTop.childNodes[this._pageIdx];
		const pageHeight = parseInt(sf.marginTop, 10) + divPage.offsetHeight + parseInt(sf.marginBottom, 10);
		const orgHeight = this._header.offsetHeight + pageHeight + this._footer.offsetHeight + 2;

		// はみ出す場合はサイズ調整
		if(orgHeight > window.innerHeight){
			this._content.style.height = "100%";
			this._pageTop.style.height = this._content.offsetHeight - (this._header.offsetHeight + this._footer.offsetHeight);
			return true;
		}
		this._content.style.height = orgHeight - 2;
		this._pageTop.style.height = pageHeight;

		if((this._winSize.height !== window.innerHeight) || (this._winSize.width !== window.innerWidth)){
			return true;
		}else if((this._content.offsetTop + orgHeight) > window.innerHeight){
			return true;
		}
		return false;
	}
	/**
	 * ダイアログが表示中かどうかを返します。
	 * @return {boolean}	表示中か
	 */
	isDisplay(){
		return !!this._content;
	}
	/**
	 * ダイアログを表示します。
	 */
	show(){
		const fn = "show()";
		this.log.info(fn);
		if(!this._init){
			// スタイル情報を読み込む
			const STYLE_LIST = "style-list.txt";
			this.log.info("loading " + STYLE_LIST + "...");
			this._style_name = SelOpts.StyleName;
			this._style_file = SelOpts.StyleFile;
			AjaxGet(TD.skinPath + STYLE_LIST, true)
			.then((txt) => {
				const lineData = txt.replace("\r", "\n").split(/\n+/);
				for(let i = 0, n = lineData.length; i < n; i++){
					this.log.dbg(lineData[i]);
					const cols = lineData[i].split(/\t+/);
					if(cols.length > 1){
						if(!cols[0].match(/^;|'|#|\/\//)){
							this._style_name.push(cols[0]);
							this._style_file.push(cols[1]);
						}
					}
				}
				this.log.info("done");
				this.initPages();
				this.init();
			})
			.catch((e) => {
				if(e.message === "Not Found"){
					this.log.warn(STYLE_LIST + "はありません");
				}else{
					this.log.err(fn + ":" + e.message);
				}
				this.initPages();
				this.init();
			});
		}
		else{
			// ダイアログ初期設定（パージ内容は設定済み）
			this.init();
		}
	}
	/**
	 * ダイアログを非表示にします。
	 */
	hide(){
		this.log.info("hide()");
		this._content.style.display = "none";
		const bg = _doc.getElementById("dialogOptionsBackground");
		if(bg) _doc.body.removeChild(bg);
		window.removeEventListener("resize", this.onResize, false);
		const body = _doc.getElementsByTagName("body").item(0);
		body.style.overflow = "auto";
		body.scrollTop = this._scrollTop;
		this._winSize = {width:0, height:0};
	}
	/**
	 * ダイアログの内容をクリアします。
	 */
	clear(){
		this.log.info("clear()");
		if(this._content){
			_doc.body.removeChild(this._content);
			this._content = null;
		}
		this._init = false;
	}
	/**
	 * ダイアログのページを切り替えます。
	 * @param {string}	id	ページの ID
	 */
	selectPage(id){
		const fn = "selectPage(" + id + ")";
		this.log.info(fn);
		if(id === "Initial") id = this._pageIdList[0];

		const iconId = "dialogOptionsIcon_" + id;
		for(let i = 0, n = this._header.childNodes.length; i < n; i++){
			const icon = this._header.childNodes[i];
			if(icon.id === iconId){
				icon.classList.add("selected");
			}else{
				icon.classList.remove("selected");
			}
		}

		const pageId = "Page_" + id;
		for(let i = 0, n = this._pageTop.childNodes.length; i < n; i++){
			const elem = this._pageTop.childNodes[i];
			if(elem.id.indexOf("Page_") === 0){
				if(elem.id === pageId){
					elem.style.display = "block";
					this._pageIdx = i;
				}else{
					elem.style.display = "none";
				}
			}
		}

		this.onResize();
	}
	/**
	 * ページを追加します。
	 * @param {string}	id		ID
	 * @param {string}	caption	キャプション
	 */
	addPage(id, caption){
		this.log.info("addPage(" + id + "," + caption + ")");

		const divIcon = _doc.createElement("div");
		divIcon.id = "dialogOptionsIcon_" + id;
		divIcon.className = "icon";
		divIcon.textContent = caption;
		divIcon.onclick = () => OptionsDialog.selectPage(id);
		this._header.appendChild(divIcon);

		const divPage = _doc.createElement("div");
		divPage.id = "Page_" + id;
		divPage.style.display = "none";
		divPage.style.width = "100%";
		divPage.style.overflowY = "visible";
		this._pageTop.appendChild(divPage);
	}
	/**
	 * フレームを追加します。
	 * @param {string} page		追加するページの ID
	 * @param {string} id		ID
	 * @param {string} caption	キャプション
	 */
	addFrame(page, id, caption){
		this.log.info("addFrame(" + page + "," + id + "," + caption + ")");

		const fieldset = _doc.createElement("fieldset");
		fieldset.id = "Frame_" + page + "_" + id;
		const legend  = _doc.createElement("legend");
		legend.textContent = caption;
		fieldset.appendChild(legend);
		fieldset.appendChild(_doc.createElement("ul"));
		const divPage = _doc.getElementById("Page_" + page);
		if(divPage) divPage.appendChild(fieldset);
	}
	/**
	 * UI要素にインデントを追加します。
	 * @param {Element}	parent	親要素
	 * @param {number}	level	インデントする階層
	 * @return {Element}		インデント追加後の要素を返す
	 */
	addIndent(parent, level){
		if(typeof level !== "undefined" && level){
			for(let i = 1; i <= level; i++){
				parent.appendChild(_doc.createElement("ul"));
				parent = parent.lastChild;
			}
		}
		return parent;
	}
	/**
	 * ラベルを追加します。
	 * @param {string} page		追加するページの ID
	 * @param {string} frame	フレームの ID
	 * @param {string} id		ID
	 * @param {string} caption	キャプション
	 * @param {string} [level]	インデントする階層
	 */
	addLabel(page, frame, id, caption, level){
		this.log.info("addLabel(" + page + "," + frame + "," + id + "," + caption + "," + level + ")");

		const parent = this.addIndent(_doc.getElementById("Frame_" + page + "_" + frame).lastChild, level);
		const li = _doc.createElement("li");
		const label = _doc.createElement("label");
		label.className = "dialogOptionsLabel";
		const span = _doc.createElement("span");
		span.textContent = caption;
		label.appendChild(span);
		li.appendChild(label);
		parent.appendChild(li);
	}
	/**
	 * リンクを追加します。
	 * @param {string} page		追加するページの ID
	 * @param {string} frame	フレームの ID
	 * @param {string} id		ID
	 * @param {string} caption	キャプション
	 * @param {string} uri		URI
	 * @param {number} [level]	インデントする階層
	 */
	addLink(page, frame, id, caption, uri, level){
		this.log.info("addLink(" + page + "," + frame + "," + id + "," + caption + "," + uri + "," + level + ")");

		const parent = this.addIndent(_doc.getElementById("Frame_" + page + "_" + frame).lastChild, level);
		const li = _doc.createElement("li");
		const label = _doc.createElement("label");
		label.className = "dialogOptionsLabel";
		const a = _doc.createElement("a");
		a.setAttribute("href", uri);
		a.setAttribute("target", "_blank");
		a.textContent = caption;
		label.appendChild(a);
		li.appendChild(label);
		parent.appendChild(li);
	}
	/**
	 * イベントハンドラから呼ばれて、設定項目がデフォルト値から変更されていたら該当項目をボールド表示にします。
	 * @param {element}					ターゲット要素
	 * @param {string|boolean|number}	設定項目の値
	 */
	checkChange(target,val){
		const label = target.parentNode;
		const id = target.id;
		const defval = InitPref[id];
		this.log.dbg("id=" + id + ",val=" + val + ",defval=" + defval);
		if(val !== defval){
			label.style.fontWeight = "bold";
		}else{
			label.style.fontWeight = "normal";
		}
	}
	/**
	 * チェックボックスを追加します。
	 * @param {string} page		追加するページの ID
	 * @param {string} frame	フレームの ID
	 * @param {string} id		ID
	 * @param {string} caption	キャプション
	 * @param {number} [level]	インデントする階層
	 */
	addCheckBox(page, frame, id, caption, level){
		const fn = "addCheckBox(" + page + "," + frame + "," + id + "," + caption + "," + level + ")";
		this.log.info(fn);

		const onClick = (e) => { this.checkChange(e.target, e.target.checked); };

		const parent = this.addIndent(_doc.getElementById("Frame_" + page + "_" + frame).lastChild, level);
		const li = _doc.createElement("li");
		const label = _doc.createElement("label");
		label.className = "dialogOptionsLabel";
		const input = _doc.createElement("input");
		input.setAttribute("type", "checkbox");
		input.id = id;
		input.checked = SkinPref.get(id);
		input.addEventListener('click', onClick, false);
		label.appendChild(input);
		const span = _doc.createElement("span");
		span.textContent = caption;
		label.appendChild(span);
		this.checkChange(input, input.checked);
		li.appendChild(label);
		parent.appendChild(li);
	}
	/**
	 * ラジオボタンを追加します。
	 * @param {string}	page	追加するページの ID
	 * @param {string}	frame	フレームの ID
	 * @param {string}	id		ID
	 * @param {string}	caption	キャプション
	 * @param {number}	[level]	インデントする階層
	 */
	addRadio(page, frame, id, caption, level){
		const fn = "addRadio(" + page + "," + frame + "," + id + "," + caption + "," + level + ")";
		this.log.info(fn);

		const onChange = (e) => { this.checkChange(e.target, e.target.checked); };

		const parent = this.addIndent(_doc.getElementById("Frame_" + page + "_" + frame).lastChild, level);
		const li = _doc.createElement("li");
		const label = _doc.createElement("label");
		label.className = "dialogOptionsLabel";
		const input = _doc.createElement("input");
		input.setAttribute("type", "radio");
		input.setAttribute("name", frame);
		input.id = id;
		input.checked = SkinPref.get(id);
		input.addEventListener('change', onChange, false);
		label.appendChild(input);
		const span = _doc.createElement("span");
		span.textContent = caption;
		label.appendChild(span);
		this.checkChange(input, input.checked);
		li.appendChild(label);
		parent.appendChild(li);
	}
	/**
	 * エディットボックスを追加します。
	 * @param {string} page				追加するページの ID
	 * @param {string} frame			フレームの ID
	 * @param {string} id				ID
	 * @param {string} caption			キャプション
	 * @param {string} [caption_post]	キャプション(後付け)
	 * @param {number} [size]			サイズ
	 * @param {number} [level]			インデントする階層
	 */
	addEditBox(page, frame, id, caption, caption_post, size, level){
		const fn = "addEditBox(" + page + "," + frame + "," + id + "," + caption +
		         "," + caption_post + "," + size + "," + level + ")";
		this.log.info(fn);

		const onInput = (e) => { this.checkChange(e.target, e.target.value); };

		const parent = this.addIndent(_doc.getElementById("Frame_" + page + "_" + frame).lastChild, level);
		const li = _doc.createElement("li");
		const label = _doc.createElement("label");
		label.className = "dialogOptionsLabel";
		const span = _doc.createElement("span");
		span.textContent = caption;
		label.appendChild(span);
		const input = _doc.createElement("input");
		input.setAttribute("type", "text");
		if(size){
			input.style.width = size + "em";
		}
		input.id = id;
		input.value = SkinPref.get(id);
		input.addEventListener('input', onInput, false);
		label.appendChild(input);
		if(caption_post){
			const span2 = _doc.createElement("span");
			span2.textContent = caption_post;
			label.appendChild(span2);
		}
		this.checkChange(input, input.value);
		li.appendChild(label);
		parent.appendChild(li);
	}
	/**
	 * 整数値のみを入力できるエディットボックスを追加します。
	 * @param {string} page				追加するページの ID
	 * @param {string} frame			フレームの ID
	 * @param {string} id				ID
	 * @param {string} caption			キャプション
	 * @param {string} [caption_post]	キャプション(後付け)
	 * @param {number} [size]			サイズ
	 * @param {number} [level]			インデントする階層
	 */
	addIntBox(page, frame, id, caption, caption_post, size, level){
		const fn = "addIntBox(" + page + "," + frame + "," + id + "," + caption +
		         "," + caption_post + "," + size + "," + level + ")";
		this.log.info(fn);

		const parent = this.addIndent(_doc.getElementById("Frame_" + page + "_" + frame).lastChild, level);
		const li = _doc.createElement("li");
		const label = _doc.createElement("label");
		label.className = "dialogOptionsLabel";
		const span = _doc.createElement("span");
		span.textContent = caption;
		label.appendChild(span);
		const input = _doc.createElement("input");
		input.setAttribute("type", "text");
		input.style.textAlign = "right";
		if(size){
			input.style.width = size + "em";
		}
		input.id = id;
		input.value = SkinPref.get(id);
		input.setAttribute("oldval", input.value);
		input.addEventListener('input', (e) => {
			let newval = e.target.value;
			if(! /^\d*$/.test(newval)){
				// 整数値以外の入力は前に戻す
				newval = input.getAttribute("oldval");
				e.target.value = newval;
			}else{
				// 頭の0を消す
				if(newval.match(/^0(\d+)$/)){
					newval = RegExp.$1;
					e.target.value = newval;
				}
				e.target.setAttribute("oldval", newval);
			}
			this.checkChange(e.target, 　parseInt(newval));
		}, false);
		label.appendChild(input);
		if(caption_post){
			const span2 = _doc.createElement("span");
			span2.textContent = caption_post;
			label.appendChild(span2);
		}
		this.checkChange(input, parseInt(input.value));
		li.appendChild(label);
		parent.appendChild(li);
	}
	/**
	 * コンボボックスを追加します。
	 * @param {string} page				追加するページの ID
	 * @param {string} frame			フレームの ID
	 * @param {string} id				ID
	 * @param {string} caption			キャプション
	 * @param {string} [caption_post]	キャプション(後付け)
	 * @param {Array}  value			選択項目のリスト
	 * @param {number} [size]			サイズ
	 * @param {number} [level]			インデントする階層
	 */
	addComboBox(page, frame, id, caption, caption_post, value, level){
		const fn = "addComboBox(" + page + "," + frame + "," + id + "," + caption +
		         "," + caption_post + "," + value + "," + level + ")";
		this.log.info(fn);

		const onChange = (e) => { this.checkChange(e.target, e.target.selectedIndex); };

		const parent = this.addIndent(_doc.getElementById("Frame_" + page + "_" + frame).lastChild, level);
		const li = _doc.createElement("li");
		const label = _doc.createElement("label");
		label.className = "dialogOptionsLabel";
		const span = _doc.createElement("span");
		span.textContent = caption;
		label.appendChild(span);
		const select = _doc.createElement("select");
		select.id = id;
		const n = value.length;
		for(let i = 0; i < n; i++){
			const option = _doc.createElement("option");
			option.textContent = value[i];
			option.setAttribute("value", value[i]);
			select.appendChild(option);
		}
		let index = SkinPref.get(id);
		if(index < 0 || n <= index){
			this.log.warn("コンボボックスの値(" + index + ")が範囲外");
			index = 0;
		}
		select.selectedIndex = index;
		select.addEventListener('change', onChange, false);
		label.appendChild(select);
		if(caption_post){
			const span2 = _doc.createElement("span");
			span2.textContent = " " + caption_post;
			label.appendChild(span2);
		}
		this.checkChange(select, select.selectedIndex);

		li.appendChild(label);
		parent.appendChild(li);
	}
	/**
	 * [オプション] ダイアログを初期設定します。
	 */
	init(){
		this.log.info("init()");
		this._scrollTop = _doc.body.scrollTop;
		_doc.body.style.overflow = "hidden";

		const bg = _doc.createElement("div");
		bg.id = "dialogOptionsBackground";
		bg.style.width = "100%";
		bg.style.height = "100%";
		bg.style.overflow = "auto";
		_doc.body.appendChild(bg);

		this.selectPage("Initial");
		this._content.style.display = "block";
		window.addEventListener("resize", this.onResize.bind(this), false);
		this.onResize();

		if(!SkinPref.get("hasConfig")) this.selectPage("FAQ");
	}
	/**
	 * [オプション] ダイアログの表示内容を初期設定します。
	 */
	initPages(){
		this.log.info("initPages()");
		const origin = Storage.origin;

		// ダイアログ
		const dlg = _doc.createElement("div");
		dlg.id = "dialogOptions";
		dlg.className = "contentDialog";
		dlg.style.position   = "fixed";
		dlg.style.width      = 512;
		dlg.style.visibility = "visible";
		dlg.style.overflow   = "visible";
		_doc.body.appendChild(dlg);
		this._content = dlg;

		// ヘッダ
		const hd = _doc.createElement("div");
		hd.id = "dialogOptionsHeader";
		hd.className = "header";
		hd.style.position = "relative";
		hd.style.display = "block";
		hd.style.height = this._headerHeight;
		hd.style.width = "100%";
		dlg.appendChild(hd);
		this._header = hd;

		// ページのコンテナ
		const pg = _doc.createElement("div");
		pg.id = "dialogOptionsPageTop";
		pg.style.position = "relative";
		pg.style.overflowY = "scroll";
		pg.style.width = "100%";
		dlg.appendChild(pg);
		this._pageTop = pg;

		// フッタ
		const ft = _doc.createElement("div");
		ft.id = "dialogOptionsFooter";
		ft.className = "footer";
		ft.style.width = "100%";
		const btnOk = _doc.createElement("input");
		btnOk.type = "submit";
		btnOk.value = "OK";
		btnOk.onclick = () => this.onOK();
		if(SysPref.disableStorage) btnOk.disabled = true;
		ft.appendChild(btnOk);
		const btnCancel = _doc.createElement("input");
		btnCancel.type = "button";
		btnCancel.value = "キャンセル";
		btnCancel.onclick = () => this.onCancel();
		ft.appendChild(btnCancel);
		const btnClear = _doc.createElement("input");
		btnClear.type = "button";
		btnClear.value = "設定初期化";
		btnClear.onclick = () => this.onClear();
		ft.appendChild(btnClear);
		dlg.appendChild(ft);
		this._footer = ft;

		// 各ページ
		((pg) => {
			this.addPage(pg, "一般");
			((fm) => {
				this.addFrame	(pg, fm, "ポップアップ");
				this.addCheckBox(pg, fm, "enableResPopup", "アンカー");
				this.addCheckBox(pg, fm, "enableIDPopup", "ID");
				this.addCheckBox(pg, fm, "enableIDPopupOnClick", "クリックしてポップアップ　(*1)", 1);
				this.addCheckBox(pg, fm, "enableIDPopupAll", "すべてのレスを一度に表示する", 1);
				this.addCheckBox(pg, fm, "enableNamePopup", "名前(ex-R)");
				this.addCheckBox(pg, fm, "enableNamePopupOnClick", "クリックしてポップアップ(ex-R)　(*1)", 1);
				this.addCheckBox(pg, fm, "enableNamePopupAll", "すべてのレスを一度に表示する(ex-R)", 1);
				this.addCheckBox(pg, fm, "enableDivideSLIP", "5ch の SLIPコテハンを分割して処理する(ex-R) (*1)", 1);
				this.addCheckBox(pg, fm, "enableImagePopup", "画像");
				this.addComboBox(pg, fm, "valuePixelationMethod",   "フィルタ: ", "", SelOpts.PixelationMethod, 1);
				this.addComboBox(pg, fm, "valuePixelationSize",     "レベル: ", "", SelOpts.PixelationSize, 1);
				this.addCheckBox(pg, fm, "enableDefaultPixelation", "デフォルトでぼかす", 1);
				this.addCheckBox(pg, fm, "enableImageGroCheck", "グロチェックをする(ex-R)", 1);
				this.addEditBox	(pg, fm, "valueImageGroPattern", "グロチェック条件(ex-R): ", " (*3)", 18, 2);
				this.addComboBox(pg, fm, "valueShadeLevel", "透明度(ex): ", "", SelOpts.ShadeLevel, 1);
				this.addCheckBox(pg, fm, "enableImagePopupShadeOverCancel", "マウスオーバーで透明度を解除する(ex)", 2);
				this.addCheckBox(pg, fm, "enableUrlPopup", "リンク先サムネイル");
				this.addComboBox(pg, fm, "valueThumbnailSite", "サムネイル画像取得先: ", "", SelOpts.ThumbnailSite, 1);
				this.addComboBox(pg, fm, "valueUrlPopupSize", "サイズ: ", "", SelOpts.UrlPopupSize, 1);
				this.addCheckBox(pg, fm, "enableVideoPopup", "動画");
				const selOptLabel = [];
				SelOpts.PopupVideoSize.forEach((size) => selOptLabel.push(size.width + " x " + size.height));
				this.addComboBox(pg, fm, "valuePopupVideoSize", "ポップアップ動画のサイズ(ex-R): ", "", selOptLabel, 1);
				this.addCheckBox(pg, fm, "videoPopupAutoStart", "YouTube 自動再生", 1);
				this.addCheckBox(pg, fm, "enableTrackBackPopup", "逆参照");
				this.addCheckBox(pg, fm, "enableTrackBackPopupAll", "すべてのレスを一度に表示する", 1);
				this.addCheckBox(pg, fm, "enableThreadInfoPopup", "スレッド情報(ex)");
				if(!SysPref.disableStorage){
				this.addCheckBox(pg, fm, "enableThreadInfoPopupAutoBookmark", "未読スレッドに自動でしおりを設定する(ex-R)", 1);
				}
			})("Popup");
		})("General");

		((pg) => {
			this.addPage(pg, "一般2");
			((fm) => {
				this.addFrame	(pg, fm, "表示スタイル");
				this.addComboBox(pg, fm, "valueSkinStyle", "スタイル名(ex): ", "", this._style_name);
			})("Style");

			((fm) => {
				this.addFrame	(pg, fm, "新着時動作");
				this.addCheckBox(pg, fm, "enableScrollToNewRes", "新着レスに移動する(ex)");
				this.addCheckBox(pg, fm, "enableUpdateSound", "音を鳴らす(ex)");
			})("Update");

			((fm) => {
				this.addFrame	(pg, fm, "自分/返信レス");
				if(!SysPref.disableStorage){
				this.addCheckBox(pg, fm, "enableHighlightMyPost", "自分のレスを強調表示する(ex-R)");
				this.addEditBox	(pg, fm, "stringMyPostBgColor", "自分のレスの強調色(ex-R): ", "", 8, 1);
				this.addCheckBox(pg, fm, "enableHighlightReply", "返信レスを強調表示する(ex-R)");
				this.addEditBox	(pg, fm, "stringReplyBgColor", "返信レスの強調色(ex-R): ", "", 8, 1);
				this.addCheckBox(pg, fm, "enableNotifyReply", "新着の返信レスがあったら通知する(ex-R) ※要 Firefox 22+");
				this.addLabel	(pg, fm, "", "※ [chaikaライク]の場合は強調のスタイルは独自になります",1);
				}
			})("MyRep");

			((fm) => {
				this.addFrame	(pg, fm, "置換");
				this.addCheckBox(pg, fm, "enableReplaceBadAnchor", "正しくないレスアンカー(ex)　(*2)");
				this.addCheckBox(pg, fm, "enableReplaceWideAnchor", "全角『＞』と全角数字(ex)　(*2)", 1);
				this.addCheckBox(pg, fm, "enableReplaceCommaAnchor", "カンマ区切り(ex)　(*2)", 1);
				this.addCheckBox(pg, fm, "enableReplacePlusAnchor", "プラス区切り(ex-R) (*2)", 1);
				this.addCheckBox(pg, fm, "enableReplace1000Anchor", "5ch の >>1000(ex-R) (*2)", 1);
				if(!SysPref.disableStorage){
				this.addCheckBox(pg, fm, "enableReplaceStr", "ReplaceStr.txt を使う(ex)　(*2)");
				}
				this.addCheckBox(pg, fm, "enableReplaceIDNAnchor", "日本語ドメイン名(ex)　(*2)");
			})("Replace");

			((fm) => {
				this.addFrame	(pg, fm, "設定反映");
				this.addComboBox(pg, fm, "valueReloadForPrefApply", "リロードが必要な設定を変更後(ex-R): ", "", SelOpts.ReloadForPrefApply);
			})("Apply");
		})("General2");

		((pg) => {
			this.addPage(pg, "詳細");
			((fm) => {
				this.addFrame	(pg, fm, "リンク");
				this.addCheckBox(pg, fm, "enableLinkNewWindow", "リンクを新しいウィンドウで開く　(*1)");
				this.addCheckBox(pg, fm, "enableLinkNoReferer", "リファラを送信しない　(*1)");
				this.addCheckBox(pg, fm, "enableLinkForChaika", "スレッドリンクを chaika で開く　(*1)");
				this.addCheckBox(pg, fm, "enableLinkTypeIcon", "リンクの種類を示すアイコンを表示する (*1)");
			})("Link");

			((fm) => {
				this.addFrame	(pg, fm, "ヘッダ");
				this.addComboBox(pg, fm, "valueHideTitleBar", "ヘッダの表示(ex): ", "　(*1)", SelOpts.HideTitleBar);
				this.addCheckBox(pg, fm, "enableContract", "スレッドタイトルを表示幅に合わせて省略表示する　(*1)");
				this.addCheckBox(pg, fm, "enableBoardName", "板名を表示する(ex-R) *1)");
				this.addCheckBox(pg, fm, "enableFavicon", "favicon を表示する(ex-R)　(*1)");
				this.addCheckBox(pg, fm, "enableShowDatSize", "スレッドサイズを表示する(ex)　(*1)");
			})("TitleBar");

			((fm) => {
				this.addFrame	(pg, fm, "視覚効果");
				this.addCheckBox(pg, fm, "enablePopupFade", "ポップアップのフェードアウトを有効にする");
				this.addComboBox(pg, fm, "valuePopupFadeStep", "フェードのステップ: ", "", SelOpts.PopupFadeStep, 1);
				this.addIntBox	(pg, fm, "valueTrackBackDivNums", "参照アンカーの改行区切り数(ex): ", "", 2);
			})("Effect");

			((fm) => {
				this.addFrame	(pg, fm, "ブラウズ");
				this.addCheckBox(pg, fm, "enableHookReload", "F5 キーをフックして動的に更新を行う");
				this.addCheckBox(pg, fm, "enableSmoothScroll", "スムーズスクロールを有効にする");
				this.addComboBox(pg, fm, "valueSmoothScrollFrames", "フレーム数: ", "", SelOpts.SmoothScrollFrames, 1);
				this.addComboBox(pg, fm, "valueReadBandWidth", "「前へ」「次へ」の移動レス数(ex): ", "", SelOpts.ReadBandWidth);
			})("Browse");

			((fm) => {
				this.addFrame	(pg, fm, "コピー");
				this.addCheckBox(pg, fm, "enableCopyWithQuotationMark", "レスのコピーに引用記号をつける(ex-R)");
			})("Copy");
		})("Special");

		((pg) => {
			this.addPage(pg, "詳細2");
			((fm) => {
				this.addFrame	(pg, fm, "オートパイロット");
				this.addCheckBox(pg, fm, "enableAutoReloadOnLiveThread", "実況板では自動更新をデフォルトにする　(*1)");
				this.addCheckBox(pg, fm, "enableAutoReloadWhenInactive", "非アクティブ時でも自動更新を強制する　(*1)");
				this.addCheckBox(pg, fm, "enableStatusClearWhenInactive", "更新毎に新着状態をクリアする(ex)　(*1)", 1);
				this.addComboBox(pg, fm, "valueAutoReloadInterval", "自動更新の間隔: ", "", SelOpts.AutoReloadInterval);
				this.addCheckBox(pg, fm, "enableChangeInterval", "おまかせ更新を使う(ex)");
				this.addCheckBox(pg, fm, "enableForceAutoScroll", "オートスクロールを自動停止しない(ex)");
			})("AutoPilot");

			((fm) => {
				this.addFrame	(pg, fm, "検索");
				this.addCheckBox(pg, fm, "enableFindHighlight", "検索時にハイライト表示を行う");
				this.addCheckBox(pg, fm, "enableFxFind", "検索結果がヘッダの裏に隠れないように補正(ex) (*1)");
				this.addCheckBox(pg, fm, "enableMoveAfterFind", "検索完了時にヒットした先頭のレスに移動(ex)");
			})("Find");

			((fm) => {
				this.addFrame	(pg, fm, "ID ピックアップ");
				this.addComboBox(pg, fm, "valueIDPickupHotkey", "ピックアップ実行(ex): ", "", SelOpts.IDPickupHotkey);
				this.addComboBox(pg, fm, "valueIDPickupResult", "ピックアップ結果(ex): ", "", SelOpts.IDPickupResult);
			})("Pickup");

			((fm) => {
				this.addFrame	(pg, fm, "カウント表示");
				this.addCheckBox(pg, fm, "enableShowIDCount", "ID の発言回数を表示する(ex)　(*1)");
				this.addCheckBox(pg, fm, "enableColoringID","ID を発言回数で色分けする(ex-R)");
				this.addEditBox (pg, fm, "valueColoringIDThreshold", "発言回数のしきい値(ex-R): ", "", 10, 1);
				this.addEditBox (pg, fm, "valueColoringIDColor", "各しきい値に対応する色(ex-R): ", "", 18, 1);
				this.addCheckBox(pg, fm, "enableShowTrackbackCount", "参照されているレス数を表示する(ex)　(*1)");
				this.addCheckBox(pg, fm, "enableColoringSLIP", "5ch の SLIPコテハンを出現回数で色分けする(ex-R)");
				this.addEditBox (pg, fm, "valueColoringSLIPThreshold", "出現回数のしきい値(ex-R): ", "", 10, 1);
				this.addEditBox (pg, fm, "valueColoringSLIPBgColor", "各しきい値に対応する背景色(ex-R): ", "", 18, 1);
			})("Count");

			((fm) => {
				this.addFrame	(pg, fm, "人気レス");
				this.addIntBox	(pg, fm, "valuePopularPostThreshold", "人気レスの参照数しきい値(ex-R): ", "", 2);
			})("Popular");
		})("Special2");

		((pg) => {
			this.addPage(pg, "詳細3");
			((fm) => {
				this.addFrame	(pg, fm, "ポップアップ制限");
				this.addComboBox(pg, fm, "valuePopupResMax", "最大レス数(ex): ", "　(*1)", SelOpts.PopupResMax);
			})("Popup");

			((fm) => {
				this.addFrame	(pg, fm, "テンプレ表示");
				this.addComboBox(pg, fm, "valueTemplateRes", "レス数(ex): ", "　(*1)", SelOpts.TemplateRes);
				this.addComboBox(pg, fm, "valueTemplateSelectHotkey", "絞込み表示(ex): ", "", ["クリック", "CTRL + クリック"]);
				this.addIntBox	(pg, fm, "valueTemplateSelectCheckTime", "ID がない場合の表示対象時間(ex): ", "分", 2, 1);
			})("Template");

			((fm) => {
				this.addFrame	(pg, fm, "しおり");
				if(!SysPref.disableStorage){
				this.addCheckBox(pg, fm, "enableShowMarkToNew", "しおり～新着レス間も表示(ex)　(*1)");
				}
			})("Bookmark");

			((fm) => {
				let selOptLabel;
				this.addFrame	(pg, fm, "その他");
				this.addCheckBox(pg, fm, "enableEmbedImage", "画像・動画をインライン表示する(ex)　(*3)");
				this.addCheckBox(pg, fm, "enableEmbedImageWithCheck", "グロチェックをする(ex)　(*3)", 1);
				this.addCheckBox(pg, fm, "enableEmbedImageGroup", "レスの最後にまとめる(ex)　(*1)", 1);
				this.addCheckBox(pg, fm, "enableEmbedImageAutoLoad", "自動で読み込む(ex-R) (*1)", 1);
				this.addIntBox	(pg, fm, "valueLazyloadInterval", "遅延読込の要求間隔(ex-R): ", "msec (*1)", 3, 2);
				this.addCheckBox(pg, fm, "enableEmbedImagePreLoad", "表示範囲外も読み込む(ex-R) (*1)", 2);
				this.addCheckBox(pg, fm, "enableEmbedLoadOnLinkMouseOver", "リンクにマウスオーバーで読み込む(ex-R) (*1)", 1);
				this.addCheckBox(pg, fm, "enableEmbedImageWithoutVideo", "動画を除外する(ex)　(*1)", 1);
				selOptLabel = [];
				SelOpts.EmbedImageSize.forEach((size) => selOptLabel.push(size.width + " x " + size.height));
				this.addComboBox(pg, fm, "valueEmbedImageSize", "埋め込み画像のサイズ(ex-R): ", " (*1)", selOptLabel, 1);
				this.addCheckBox(pg, fm, "enableThumbnailImage", "画像をサムネイルにする(ex-R) (*1)", 2);
				this.addCheckBox(pg, fm, "enableThumbnailWithoutGif", "GIFは除外する(ex-R) (*1)", 3);
				selOptLabel = [];
				SelOpts.EmbedVideoSize.forEach((size) => selOptLabel.push(size.width + " x " + size.height));
				this.addComboBox(pg, fm, "valueEmbedVideoSize", "埋め込み動画のサイズ(ex-R): ", " (*1)", selOptLabel, 1);
				this.addCheckBox(pg, fm, "enableMultiResSelect", "複数レス選択を使用する(ex)　(*1)");
				this.addCheckBox(pg, fm, "enableMultiResSelectNoModify", "クリックのみで選択追加(ex)　(*1)", 1);
				this.addCheckBox(pg, fm, "enablePopupPreventer", "スクロール中のポップアップを抑制する(ex)　(*1)");
			})("Other");
		})("Special3");

		((pg) => {
			this.addPage(pg, "補足説明");
			((fm) => {
				this.addFrame	(pg, fm, "対応ブラウザーについて");
				this.addLabel	(pg, fm, "", "このスキンは Firefox 52 以上相当のブラウザーにてご利用ください");
				this.addLabel	(pg, fm, "", "なお、Pale Moon 27 は初期状態のままですと動作しません");
				this.addLabel	(pg, fm, "", "詳細は README.md をご確認ください");
			})("Require");

			((fm) => {
				this.addFrame	(pg, fm, "Firefox のプライバシー設定について");
				this.addLabel	(pg, fm, "", "本スキンは「" + origin + "」サイトのローカルストレージにスキン設定");
				this.addLabel	(pg, fm, "", "などの各種データを保存します");
				this.addLabel	(pg, fm, "", "Firefox の「プライバシー」(※Firefox ESR60は「ブラウザープライバシー」)");
				this.addLabel	(pg, fm, "", "設定画面で、上記サイトから送られてきた Cookie を保存する必要があります");
				this.addLabel	(pg, fm, "", "(※Firefox ESR60は「Cookie とサイトデータ」)");
				this.addLabel	(pg, fm, "", "保存を許可していないと以下の機能が動作しません");
				this.addLabel	(pg, fm, "", "・スキン設定の保存");
				this.addLabel	(pg, fm, "", "・しおり機能");
				this.addLabel	(pg, fm, "", "・自分/返信マーク機能");
				this.addLabel	(pg, fm, "", "・ReplaceStr.txt による置換機能");
				this.addLabel	(pg, fm, "", "なお、サイトごと個別に許可設定したい場合は、chaikaでスレッドを開いた状態で");
				this.addLabel	(pg, fm, "", "ロケーションバーの(i)アイコンから「ページ情報」を開き、「サイト別設定」で");
				this.addLabel	(pg, fm, "", "「Cookieデータを保存」を「許可」に設定してください");
				this.addLabel	(pg, fm, "", "履歴を消去する際は、「Cookie」「ウェブサイトのオフライン作業用データ」の");
				this.addLabel	(pg, fm, "", "項目のチェックは外してください");
			})("Privacy");

			((fm) => {
				this.addFrame	(pg, fm, "設定の反映について");
				this.addLabel	(pg, fm, "", "*1 が付いている設定項目は変更した後にリロードが必要です");
				this.addLabel	(pg, fm, "", "*2 は置換メニュー/リロード、*3 は埋込みメニュー/リロードで反映です");
				this.addLabel	(pg, fm, "", "初期設定値から変更した項目は太字で表示されます");
				this.addLabel	(pg, fm, "", "置換定義は、ReplaceStr.txt を使うにチェックを付けた状態で設定を確定すると");
				this.addLabel	(pg, fm, "", "反映されます");
			})("Update");

			((fm) => {
				this.addFrame	(pg, fm, "保存されない状態について");
				this.addLabel	(pg, fm, "", "以下の状態は保存されません");
				this.addLabel	(pg, fm, "", "・オートスクロール, 自動更新, 要約表示の On/Off");
				this.addLabel	(pg, fm, "", "・検索ボックスの選択内容");
				this.addLabel	(pg, fm, "", "・検索(ID ピックアップを含む)の抽出と強調結果");
				this.addLabel	(pg, fm, "", "・レスの複数選択状態");
				this.addLabel	(pg, fm, "", "・タイトルバーの非表示状態");
			})("Alert");
		})("Help");

		((pg) => {
			this.addPage	(pg, "FAQ");
			((fm) => {
				this.addFrame	(pg, fm, "はじめに");
				this.addLabel	(pg, fm, "", "スキン設定を一度も保存していないと、この「FAQ」タブが最初に表示されます");
				this.addLabel	(pg, fm, "", "設定を保存したはずなのに「FAQ」が表示される場合は次をお読みください");
			})("FAQ");

			((fm) => {
				this.addFrame	(pg, fm, "スキン設定が保存されない(Firefoxを再起動すると元に戻る)");
				this.addLabel	(pg, fm, "", "まず「補足説明」タブ「ブラウザープライバシー設定について」をお読みください");
				this.addLabel	(pg, fm, "", "「Firefox の終了時に履歴を消去する」設定にしていて、消去設定で「Cookie」や");
				this.addLabel	(pg, fm, "", "「ウェブサイトのオフライン作業用データ」がチェックされていると、スキン設定");
				this.addLabel	(pg, fm, "", "などのデータも消去されてしまいます");
				this.addLabel	(pg, fm, "", "履歴や Cookie を管理する拡張機能、外部のユーティリティソフトなどを使っている");
				this.addLabel	(pg, fm, "", "場合は、chaika や本スキンが使用する「" + origin + "」サイトの");
				this.addLabel	(pg, fm, "", "データをブロックや消去する設定になっていないか確認してください");
			})("FAQ2");

			((fm) => {
				this.addFrame	(pg, fm, "「" + origin + "」の Cookieを許可しないで使いたい");
				this.addLabel	(pg, fm, "", "サイトデータに保存させずにお好みのスキン設定を維持したい場合、options.js ");
				this.addLabel	(pg, fm, "", "スクリプト内の初期値を直接書き換えて対応してください");
				this.addLabel	(pg, fm, "", "また、同スクリプトの disableStorage を true に設定しておくと、関連機能を");
				this.addLabel	(pg, fm, "", "無効化してエラーダイアログを出さないようにすることができます");
			})("FAQ3");

			((fm) => {
				this.addFrame	(pg, fm, "Firefox の戻るボタンでスレッド表示に戻すと最後のレスにスクロールする");
				this.addLabel	(pg, fm, "", "この現象はキャッシュが破棄されてリロードが発生してしまうために起こります");
				this.addLabel	(pg, fm, "", "オプション/詳細2/オートパイロット/「非アクティブ時でも自動更新を強制する」");
				this.addLabel	(pg, fm, "", "のチェックを外していると発生します（初期設定でチェック入るようにしました）");
				this.addLabel	(pg, fm, "", "リロードしても読みかけの位置に戻したい場合はしおりを使ってください");
			})("FAQ4");

			((fm) => {
				this.addFrame	(pg, fm, "マークした自分のレスに返信がついたのに通知されない");
				this.addLabel	(pg, fm, "", "返信の通知は Notifications API を使っています");
				this.addLabel	(pg, fm, "", "通知を出すためにはchaika動作サイトからの通知を許可する設定が事前に必要です");
				this.addLabel	(pg, fm, "", "スレッドを表示したタブで「ページ情報」（ツールメニュー/ページ情報）を開いて");
				this.addLabel	(pg, fm, "", "「サイト別設定」の「サイトからの通知の表示」の項目を「許可」としてください");
				this.addLabel	(pg, fm, "", "下記の MDNページにて Notifications API の動作を確認できます");
				this.addLink	(pg, fm, "labelSeeURI", "Notifications API を使用する - WebAPI | MDN", "https://developer.mozilla.org/ja/docs/WebAPI/Using_Web_Notifications");
			})("FAQ5");

			((fm) => {
				this.addFrame	(pg, fm, "ポップアップのブロック警告が出る");
				this.addLabel	(pg, fm, "", "以下の機能はポップアップとして通常別タブに開きます");
				this.addLabel	(pg, fm, "", "・必死チェッカー");
				this.addLabel	(pg, fm, "", "・README を開く");
				this.addLabel	(pg, fm, "", "・変更履歴を開く");
				this.addLabel	(pg, fm, "", "ページ上部にオレンジの警告の帯が表示されましたら、「設定」を押して");
				this.addLabel	(pg, fm, "", "「このサイト (127.0.0.1) からのポップアップを許可する」を選んでください");
			})("FAQ6");
		})("FAQ");

		((pg) => {
			this.addPage(pg, "スキン情報");

			((fm) => {
				if(VerInfo._skinDerivedName){
					this.addFrame(pg, fm, "このスキン(派生版)について");
					this.addLabel(pg, fm, "labelSkinDerivedName", VerInfo._skinDerivedName);
					if(VerInfo._skinDerivedVersion){
						this.addLabel(pg, fm, "labelSkinDerivedVersion", "バージョン: " + VerInfo._skinDerivedVersion);
					}
					this.addLink (pg, fm, "labelSkinDerivedURI", "EarlgreyTea ‏@earlgreypicard", "https://twitter.com/earlgreypicard");
					if(VerInfo._skinDerivedDisclaimer){
						this.addLabel(pg, fm, "labelSkinDerivedCaution", VerInfo._skinDerivedDisclaimer);
					}
				}
			})("InfoDerived");

			((fm) => {
				this.addFrame    (pg, fm, "このスキン" + (VerInfo._skinDerivedName ? "(オリジナル版)" : "") + "について");
				if(VerInfo._skinName){
					this.addLabel(pg, fm, "labelSkinName", VerInfo._skinName);
				}
				if(VerInfo._skinVersion){
					this.addLabel(pg, fm, "labelSkinVersion", "バージョン: " + VerInfo._skinVersion);
				}
				if(VerInfo._skinURI){
					this.addLink (pg, fm, "labelSkinURI", VerInfo._skinURI, VerInfo._skinURI);
				}
				if(VerInfo._skinMail){
					this.addLink (pg, fm, "labelSkinMail", VerInfo._skinMail, "mailto:" + VerInfo._skinMail);
				}
			})("Info");

			const dataTypeID = ["pref", "mypost", "bookmark"];
			const dataTypeName = ["オプション", "自分のレス", "しおり"];
			const num = dataTypeID.length;
			const addInlineCheckbox = (parent, id, caption, visible) => {
				const label = _doc.createElement("label");
				label.className = "inlineCheckboxLabel";
				label.id = "label-" + id;
				const input = _doc.createElement("input");
				input.type = "checkbox";
				input.id = id;
				label.appendChild(input);
				const text = _doc.createElement("span");
				text.textContent = caption;
				label.appendChild(text);
				label.style.visibility = visible ? "visible" : "hidden";
				parent.appendChild(label);
			};
			let btnImport, infile, btnExport, aDownload;
			const resetImportFrame = () => {
				dataTypeID.forEach((type) => {
					const chklabel = _doc.getElementById("label-chk-import-" + type);
					chklabel.style.visibility = "hidden";
				});
				btnImport.value = "参照...";
				btnImport.onclick = () => {
					resetExportFrame();
					infile.click();
				};
			};
			const resetExportFrame = () => {
				dataTypeID.forEach((type) => {
					const chkbox = _doc.getElementById("chk-export-" + type);
					chkbox.checked = false;
				});
				aDownload.style.display = "none";
				btnExport.style.display = "block";
				Backup.removeExportURL();
			};

			((fm) => {
				this.addFrame(pg, fm, "インポート");
				const fl = _doc.getElementById("Frame_About_Import");

				infile = _doc.createElement("input");
				infile.type = "file";
				infile.id = "input-import-file";
				infile.style.display = "none";
				infile.onchange = () => {
					const file = infile.files[0];
					Backup.readFile(file)
					.then((chk) => {
						dataTypeID.forEach((type) => {
							// 読み込んだJSONに含まれている項目のチェックボックスを表示し初期状態でチェック済みにする
							const chklabel = _doc.getElementById("label-chk-import-" + type);
							if(chk[type]){
								chklabel.style.visibility = "visible";
								chklabel.checked = true;
								chklabel.firstChild.checked = true;
							}else{
								chklabel.style.visibility = "hidden";
								chklabel.checked = false;
								chklabel.firstChild.checked = false;
							}
						});
						btnImport.value = "インポート";
						btnImport.onclick = () => {
							// チェックボックスで選択した項目のインポート実行
							const select = {};
							let isEmpty = true;
							dataTypeID.forEach((type) => {
								select[type] = _doc.getElementById("chk-import-" + type).checked;
								if(select[type]) isEmpty = false;
							});
							if(isEmpty){
								alert("インポートする項目を選択してください");
								return;
							}
							Backup.execImport(select);
							// インポート後にダイアログは速やかに終了させる必要あるためリロードかダイアログ終了を選択させる
							if(window.confirm("すぐにリロードしますか？（キャンセルの場合は[オプション]ダイアログを閉じます）")){
								const url = location.href;
								location.href = url;
							}
							this.onCancel();
						};
					}).catch((errmsg) => {
						alert("有効な設定を読み込めませんでした\n" + errmsg);
						this.log.err(errmsg);
					});
				};
				fl.appendChild(infile);

				for(let i = 0; i < num; i++){
					addInlineCheckbox(fl, "chk-import-" + dataTypeID[i], dataTypeName[i], false);
				}

				btnImport = _doc.createElement("input");
				btnImport.type = "button";
				btnImport.value = "参照...";
				btnImport.onclick = () => {
					resetExportFrame();
					infile.click();
				};
				fl.appendChild(btnImport);
			})("Import");

			((fm) => {
				this.addFrame(pg, fm, "エクスポート");
				const fl = _doc.getElementById("Frame_About_Export");

				for(let i = 0; i < num; i++){
					addInlineCheckbox(fl, "chk-export-" + dataTypeID[i], dataTypeName[i], true);
				}

				aDownload = _doc.createElement("a");
				aDownload.textContent = "クリックしてダウンロード";
				aDownload.style = "float:right; display:none;";
				fl.appendChild(aDownload);

				btnExport = _doc.createElement("input");
				btnExport.type = "button";
				btnExport.value = "エクスポート";
				btnExport.onclick = () => {
					resetImportFrame();
					Backup.removeExportURL();
					const select = {};
					let isEmpty = true;
					let filename = "lego-ex-R";
					dataTypeID.forEach((type) => {
						const chkbox = _doc.getElementById("chk-export-" + type);
						select[type] = chkbox.checked;
						if(select[type]){
							filename += ("-" + type);
							isEmpty = false;
						}
					});
					if(isEmpty){
						alert("エクスポートする項目を選択してください");
						return;
					}
					filename += ".json";

					const exportUrl = Backup.execExport(select);

					btnExport.style.display = "none";
					aDownload.href = exportUrl;
					aDownload.download = filename;
					aDownload.style.display = "block";
					aDownload.onclick = () => {
						aDownload.style.display = "none";
						btnExport.style.display = "block";
					};
				};
				fl.appendChild(btnExport);
			})("Export");

			((fm) => {
				const range = SelOpts.ReadBandWidth[SkinPref.get("valueReadBandWidth")];
				const alt_key = (navigator.platform.indexOf('Mac') !== -1) ? 'Option' : 'Alt';
				this.addFrame	(pg, fm, "キーボードショートカット");
				this.addLabel	(pg, fm, "", "F5: スレッドを更新");
				this.addLabel	(pg, fm, "", "N, " + alt_key + " + Shift + L: 新着レスへ移動");
				this.addLabel	(pg, fm, "", "J/K, ←/→: 前/次のレスへ移動");
				this.addLabel	(pg, fm, "", "Ctrl + ↑/↓: 先頭/末尾のレスへ移動(ex)");
				this.addLabel	(pg, fm, "", "H/L, Ctrl + ←/→: 前/次[" + range + "]件のレスを表示(ex)");
				this.addLabel	(pg, fm, "", alt_key + " + ↓: オートスクロール開始(ex-R)");
				this.addLabel	(pg, fm, "", "W, Ctrl + Enter: 書き込む");
				this.addLabel	(pg, fm, "", "Ctrl + Space: すべて表示 (動的に取得し、リロードすると元に戻ります)");
				this.addLabel	(pg, fm, "", "A: 自動更新 On/Off(ex)");
				this.addLabel	(pg, fm, "", "D: 要約 On/Off(ex-R)");
				this.addLabel	(pg, fm, "", "F, Ctrl + " + alt_key + " + F: 検索ボックス表示");
				this.addLabel	(pg, fm, "", "O: オプションダイアログ表示(ex)");
				this.addLabel	(pg, fm, "", "Z: スレッド情報ダイアログ表示(ex-R)");
				this.addLabel	(pg, fm, "", "I, " + alt_key + " + I: 画像・動画のインライン表示(ex) (Ctrl ありでグロチェックなし)");
				this.addLabel	(pg, fm, "", "数字キー: 入力されたレス番号へスクロール");
			})("Keymap");
		})("About");

		this._init = true;
	}
}

//======================================
// スレッド情報解析関連
//======================================

/**
 * スレッドから情報を解析してまとめて表示するクラス
 */
class AnalyseManager {
	/**
	 * 指定されたレス番号の日付欄の内容をDate型に変換して返します。
	 * @param  {number} resNum	レス番号
	 * @return {Date}	日付値
	 */
	getDate(resNum){
		const res = Nodes.getRes(resNum);
		if (!res) return new Date();
		const str = Nodes.getResDate(Nodes.getResHeader(res)).textContent;
		return this.getDateFromString(str);
	}
	/**
	 * 日付欄の文字列をDate型に変換します。
	 * @param  {string} str		日付欄の文字列
	 * @return {Date}	日付値
	 */
	getDateFromString(str){
		const matchDate = str.match(/^(\d{4}|\d{2})\/(\d{2})\/(\d{2})/);
		if (!matchDate) return new Date();

		let fullYear = parseInt(matchDate[1], 10);
		if(fullYear < 100) fullYear += (fullYear >= 90) ? 1900 : 2000;
		const date = new Date(`${matchDate[2]}/${matchDate[3]}/${fullYear}`);

		const matchTime4 = str.match(/(\d{2}):(\d{2}):(\d{2}).(\d{2})(\s|$)/);
		const matchTime3 = str.match(/(\d{2}):(\d{2}):(\d{2})(\s|$)/);
		const matchTime2 = str.match(/(\d{2}):(\d{2})(\s|$)/);

		if(matchTime4){
			date.setHours(parseInt(matchTime4[1], 10));
			date.setMinutes(parseInt(matchTime4[2], 10));
			date.setSeconds(parseInt(matchTime4[3], 10));
			date.setMilliseconds(parseInt(matchTime4[4], 10));
		}else if(matchTime3){
			date.setHours(parseInt(matchTime3[1], 10));
			date.setMinutes(parseInt(matchTime3[2], 10));
			date.setSeconds(parseInt(matchTime3[3], 10));
		}else if(matchTime2){
			date.setHours(parseInt(matchTime2[1], 10));
			date.setMinutes(parseInt(matchTime2[2], 10));
		}
		return date;
	}
	/**
	 * ミリ秒を日本語の時間表記に変換します。
	 * @param  {number} msec	時間（ミリ秒）
	 * @return {string} 変換された文字列
	 */
	toStringfromTimeDiff(msec){
		const SEC_MSEC = 1000;
		const MIN_MSEC = 60000;
		const HOUR_MSEC = 3600000;
		const DAY_MSEC = 86400000;
		const MON_MSEC = 2628000000;
		const YEAR_MSEC = 31536000000;

		let str = "";
		let val;

		val = Math.floor(msec / YEAR_MSEC);
		if(val > 0) str += val + "年";
		msec %= YEAR_MSEC;

		val = Math.floor(msec / MON_MSEC);
		if(val > 0) str += val + "ヶ月";
		msec %= MON_MSEC;

		val = Math.floor(msec / DAY_MSEC);
		if(val > 0) str += val + "日 ";
		msec %= DAY_MSEC;

		val = Math.floor(msec / HOUR_MSEC);
		if(val > 0) str += val + "時間";
		msec %= HOUR_MSEC;

		val = Math.floor(msec / MIN_MSEC);
		if(val > 0) str += val + "分";
		msec %= MIN_MSEC;

		if(str.length === 0){
			val = Math.floor(msec / SEC_MSEC * 1000) / 1000;
		}else{
			val = Math.floor(msec / SEC_MSEC);
		}
		if(val > 0) str += val + "秒";

		return str;
	}
	/**
	 * スレッドの勢いを取得します。
	 * @param {Object}	resRange	表示中のレス番号範囲
	 * @param {boolean}	bIsPerDate	勢いタイプ指定 true:1日あたりレス数、false:1レスあたり時間
	 * @return {string}	勢い表示
	 */
	getPaceString(resRange, bIsPerDate){
		const countAll = resRange.last - resRange.first + 1;
		const totalTime = this.getDate(resRange.last).getTime() - this.getDate(resRange.first).getTime();
		if(bIsPerDate){
			let pase = (Math.floor(countAll / totalTime * 864000000) / 10).toString();
			pase += (pase.indexOf(".") !== -1) ? "" : ".0";
			return pase + "レス / 日";
		}else{
			return this.toStringfromTimeDiff(totalTime / countAll) + " / レス";
		}
	}
}
// グローバル変数名へのマッピング
var Analyse = new AnalyseManager();

//======================================
// [スレッド情報] ダイアログ関連
//======================================

/**
 * [スレッド情報] ダイアログを扱います。
 */
class dialogAnalyse {
	/**
	 * dialogAnalyse オブジェクトを作成します。
	 */
	constructor(){
		this.log = new SkinLog("dialogAnalyse", SkinLogLvl.WARNING);
		this.log.info("new()");
		/**
		 * ダイアログの親要素
		 * @type {element}
		 */
		this.content = _doc.createElement("div");
	}
	/**
	 * [OK] ボタンが押されたときの処理をします。
	 */
	onOK(){
		this.log.info("onOK()");
		this.hide();
	}
	/**
	 * リサイズされたときの処理をします。
	 */
	onResize(){
		AnalyseDialog.setOverflow();
		AnalyseDialog.content.style.left = (_doc.body.offsetWidth - AnalyseDialog.content.offsetWidth) / 2;
		AnalyseDialog.content.style.top  = (window.innerHeight - AnalyseDialog.content.offsetHeight) / 2;
	}
	/**
	 * はみ出しの処理をします。
	 */
	setOverflow(){
		if(this.content.offsetHeight > window.innerHeight){
			this.content.style.maxHeight = "100%";
			this.content.style.overflowY = "scroll";
		}else{
			this.content.style.maxHeight = "none";
			this.content.style.overflowY = "auto";
		}
	}
	/**
	 * ダイアログを表示します。
	 */
	show(){
		this.log.info("show()");
		_doc.body.style.overflow = "hidden";

		const bg = _doc.createElement("div");
		bg.id = "dialogAnalyseBackground";
		bg.style.width  = "100%";
		bg.style.height = "100%";
		_doc.body.appendChild(bg);

		this.content.style.position   = "fixed";
		this.content.style.width      = 512;
		this.content.style.visibility = "hidden";
		this.content.style.display    = "block";
		this.selectPage(this.content.childNodes[1].id.replace("Page_", ""));
		this.content.style.left = (_doc.body.offsetWidth - this.content.offsetWidth) / 2;
		this.content.style.top  = (window.innerHeight - this.content.offsetHeight) / 2;
		this.content.style.visibility = "visible";
		window.addEventListener("resize", AnalyseDialog.onResize, false);
	}
	/**
	 * ダイアログを非表示にします。
	 */
	hide(){
		this.log.info("hide()");
		this.content.style.display = "none";
		const bg = _doc.getElementById("dialogAnalyseBackground");
		if(bg) _doc.body.removeChild(bg);
		window.removeEventListener("resize", AnalyseDialog.onResize, false);
		const body = _doc.getElementsByTagName("body").item(0);
		body.style.overflow = "";
	}
	/**
	 * ダイアログの内容をクリアします。
	 */
	clear(){
		if(_doc.getElementById("dialogAnalyse")){
			_doc.body.removeChild(_doc.getElementById("dialogAnalyse"));
			this.content = _doc.createElement("div");
		}
	}
	/**
	 * ダイアログのページを切り替えます。
	 * @param {string} id	ページのID
	 */
	selectPage(id){
		const divHeader = _doc.getElementById("dialogAnalyseHeader");
		for(let i = 0, n = divHeader.childNodes.length - 1; i < n; i++){
			const icon = divHeader.childNodes[i];
			icon.className = "icon" + ((icon.id === "dialogAnalysisIcon_" + id) ? " selected" : "");
		}
		for(let i = 1, n = this.content.childNodes.length - 1; i < n; i++){
			const page = this.content.childNodes[i];
			page.style.display = (page.id === "Page_" + id) ? "block" : "none";
		}
		if((this.content.offsetTop + this.content.offsetHeight) > window.innerHeight){
			this.onResize();
		}else{
			this.setOverflow();
		}
	}
	/**
	 * ページを追加します。
	 * @param {string} id		ID
	 * @param {string} caption	キャプション
	 */
	addPage(id, caption){
		if(!this.content.id){
			this.content.id = "dialogAnalyse";
			this.content.className = "contentDialog";
		}
		if(!_doc.getElementById("dialogAnalyse")){
			_doc.body.appendChild(this.content);
		}
		let divHeader = _doc.getElementById("dialogAnalyseHeader");
		if(!divHeader){
			divHeader = _doc.createElement("div");
			divHeader.id = "dialogAnalyseHeader";
			divHeader.className = "header";
			const divHeaderEnd = _doc.createElement("div");
			divHeaderEnd.id = "dialogAnalyseHeaderEnd";
			divHeaderEnd.className = "null";
			divHeader.appendChild(divHeaderEnd);
			this.content.appendChild(divHeader);

			const p  = _doc.createElement("p");
			const ok = _doc.createElement("input");
			ok.setAttribute("type",  "submit");
			ok.setAttribute("value", "OK");
			ok.onclick = () => AnalyseDialog.onOK();
			p.appendChild(ok);
			this.content.appendChild(p);
		}

		const divIcon = _doc.createElement("div");
		divIcon.id = "dialogAnalysisIcon_" + id;
		divIcon.className = "icon";
		divIcon.textContent = caption;
		divIcon.onclick = () => AnalyseDialog.selectPage(id);
		divHeader.insertBefore(divIcon, _doc.getElementById("dialogAnalyseHeaderEnd"));

		const divPage = _doc.createElement("div");
		divPage.id = "Page_" + id;
		divPage.style.display = "none";
		this.content.insertBefore(divPage, this.content.lastChild);
	}
	/**
	 * フレームを追加します。
	 * @param {string} page			追加するページの ID
	 * @param {string} id			ID
	 * @param {string} caption		キャプション
	 * @param {number} maxheight	最大の高さ
	 */
	addFrame(page, id, caption, maxheight){
		const fieldset = _doc.createElement("fieldset");
		fieldset.id = "Frame_" + page + "_" + id;
		const legend  = _doc.createElement("legend");
		legend.textContent = caption;
		fieldset.appendChild(legend);
		const ul = _doc.createElement("ul");
		if(maxheight) ul.style.maxHeight = maxheight;
		fieldset.appendChild(ul);
		const divPage = _doc.getElementById("Page_" + page);
		if(divPage) divPage.appendChild(fieldset);
	}
	/**
	 * ラベルを追加します。
	 * @param {string} page		追加するページの ID
	 * @param {string} frame	フレームの ID
	 * @param {string} id		ID
	 * @param {string} caption	キャプション
	 * @param {number} [index]	表示するレス番号へのアンカー
	 * @param {number} [level]	インデントする階層
	 */
	addLabel(page, frame, id, caption, index, level){
		let parentObject = _doc.getElementById("Frame_" + page + "_" + frame).lastChild;
		if(level > 0){
			for(let i = 1; i <= level; i++){
				parentObject.appendChild(_doc.createElement("ul"));
				parentObject = parentObject.lastChild;
			}
		}
		const li = _doc.createElement("li");
		const label = _doc.createElement("label");
		label.className = "dialogAnalyseLabel";
		const span = _doc.createElement("span");
		span.textContent = caption;
		label.appendChild(span);
		if(index){
			const a = _doc.createElement("a");
			a.setAttribute("className", "resPointer");
			a.textContent = "(>>" + index + ")";
			label.appendChild(a);
		}
		li.appendChild(label);
		parentObject.appendChild(li);
	}
	/**
	 * リンクを追加します。
	 * @param {string} page		追加するページのID
	 * @param {string} frame	フレームのID
	 * @param {string} id		ID
	 * @param {string} caption	キャプション
	 * @param {string} uri		URI
	 * @param {number} [index]	表示するレス番号へのアンカー
	 * @param {number} [level]	インデントする階層
	 */
	addLink(page, frame, id, caption, uri, index, level){
		let parentObject = _doc.getElementById("Frame_" + page + "_" + frame).lastChild;
		if(level > 0){
			for(let i = 1; i <= level; i++){
				parentObject.appendChild(_doc.createElement("ul"));
				parentObject = parentObject.lastChild;
			}
		}
		const li = _doc.createElement("li");
		const label = _doc.createElement("label");
		label.className = "dialogAnalyseLabel";
		const a = _doc.createElement("a");
		a.setAttribute("href", uri);
		a.setAttribute("rel", caption);
		a.setAttribute("res", index);	// レス番号を紐付けしておく
		a.addEventListener("mouseover", OutlinkPopup, false);
		a.setAttribute("target", "_blank");
		a.className = "outLink";
		a.textContent = caption;
		label.appendChild(a);
		if(index){
			label.appendChild(_doc.createTextNode(" ("));
			const a = _doc.createElement("a");
			a.className = "resPointer";
			a.textContent = ">>" + index;
			label.appendChild(a);
			label.appendChild(_doc.createTextNode(")"));
		}
		li.appendChild(label);
		parentObject.appendChild(li);
	}
	/**
	 * 名前を追加します。
	 * @param {string} page		追加するページのID
	 * @param {string} frame	フレームのID
	 * @param {string} name		名前
	 * @param {string} caption	キャプション
	 * @param {number} count	名前の発言回数
	 * @param {number} [level]	インデントする階層
	 */
	addName(page, frame, name, caption, count, level){
		let parentObject = _doc.getElementById("Frame_" + page + "_" + frame).lastChild;
		if(level > 0){
			for(let i = 1; i <= level; i++){
				parentObject.appendChild(_doc.createElement("ul"));
				parentObject = parentObject.lastChild;
			}
		}
		const li = _doc.createElement("li");
		const label = _doc.createElement("label");
		label.className = "dialogAnalyseLabel";
		const span = _doc.createElement("span");
		span.className = "popupName";
		span.textContent = caption;
		label.appendChild(span);
		label.appendChild(_doc.createTextNode("(" + count + ")"));
		li.appendChild(label);
		parentObject.appendChild(li);
	}
	/**
	 * ID を追加します。
	 * @param {string} page		追加するページのID
	 * @param {string} frame	フレームのID
	 * @param {string} id		ID
	 * @param {string} caption	キャプション
	 * @param {number} count	IDの発言回数
	 * @param {number} [level]	インデントする階層
	 */
	addID(page, frame, id, caption, count, level){
		let parentObject = _doc.getElementById("Frame_" + page + "_" + frame).lastChild;
		if(level > 0){
			for(let i = 1; i <= level; i++){
				parentObject.appendChild(_doc.createElement("ul"));
				parentObject = parentObject.lastChild;
			}
		}
		const li = _doc.createElement("li");
		const label = _doc.createElement("label");
		label.className = "dialogAnalyseLabel";
		const span = _doc.createElement("span");
		span.className = "mesID_" + caption + " resID2";
		span.textContent = "ID:" + caption;
		label.appendChild(span);
		label.appendChild(_doc.createTextNode("(" + count + ")"));
		li.appendChild(label);
		parentObject.appendChild(li);
	}
	/**
	 * 逆参照を追加します。
	 * @param {string} page		追加するページのID
	 * @param {string} frame	フレームのID
	 * @param {string} id		ID
	 * @param {number} index	レス番号
	 * @param {number} count	レス番号に対する言及回数
	 * @param {number} [level]	インデントする階層
	 */
	addTrackback(page, frame, id, index, count, level){
		let parentObject = _doc.getElementById("Frame_" + page + "_" + frame).lastChild;
		if(level > 0){
			for(let i = 1; i <= level; i++){
				parentObject.appendChild(_doc.createElement("ul"));
				parentObject = parentObject.lastChild;
			}
		}
		const li = _doc.createElement("li");
		const label = _doc.createElement("label");
		label.className = "dialogAnalyseLabel";
		const a = _doc.createElement("a");
		//a.setAttribute("target", "_blank");
		a.className = "resPointer";
		a.textContent = ">>" + index;
		label.appendChild(a);
		label.appendChild(_doc.createTextNode("(" + count + ")"));
		li.appendChild(label);
		parentObject.appendChild(li);
	}
	/**
	 * [スレッド情報] ダイアログを表示します。
	 */
	analyse(){
		this.log.info("analyse()");
		const f = (a,b) => (b.count - a.count);
		this.clear();

		// ------------- スレッド
		this.addPage ("Thread", "スレッド");
		this.addFrame("Thread", "Summary", "概要");
		this.addLabel("Thread", "Summary", "", "タイトル:");
		this.addLabel("Thread", "Summary", "", TD.title, null, 1);
		this.addLabel("Thread", "Summary", "", "URL:");
		this.addLink ("Thread", "Summary", "", TD.threadUrl, null, 1);
		this.addLabel("Thread", "Summary", "", "総レス数:");
		this.addLabel("Thread", "Summary", "", TD.countAll, null, 1);
		this.addLabel("Thread", "Summary", "", "期間:");
		const resRange = ResNodes.getResRange();
		const strFromTime = Analyse.getDate(resRange.first).toLocaleString();
		const strToTime = Analyse.getDate(resRange.last).toLocaleString();
		this.addLabel("Thread", "Summary", "", strFromTime + " ～ " + strToTime, null, 1);
		const diffTime = Analyse.getDate(resRange.last).getTime() - Analyse.getDate(resRange.first).getTime();
		this.addLabel("Thread", "Summary", "", "(" + Analyse.toStringfromTimeDiff(diffTime) + ")", null, 1);
		this.addLabel("Thread", "Summary", "", "勢い:");
		this.addLabel("Thread", "Summary", "", Analyse.getPaceString(resRange, false), null, 1);
		this.addLabel("Thread", "Summary", "", Analyse.getPaceString(resRange, true), null, 1);

		// ------------- 中の人
		// --- 名前
		this.addPage ("User", "中の人");
		this.addFrame("User", "Name", "名前",96);
		const nameArray = [];
		for(let name in Name.items){
			nameArray.push({name: name, count: Name.items[name].length});
		}
		nameArray.sort(f);
		for(let i = 0, n = nameArray.length; i < n; i++){
			this.addName("User", "Name", "", nameArray[i].name, nameArray[i].count);
		}
		// --- ID
		this.addFrame("User", "ID", "ID",96);
		const idArray = [];
		for(let id in ID.items){
			idArray.push({id: id, count: ID.items[id].length});
		}
		idArray.sort(f);
		this.addLabel("User", "ID", "", "合計 " + idArray.length + " 個のID");
		for(let i = 0, n = idArray.length; i < n; i++){
			this.addID("User", "ID", "", idArray[i].id, idArray[i].count);
		}
		// --- 人気レス
		this.addFrame("User", "Trackback", "人気レス",96);
		const trackbackArray = [];
		Trackback.traverse();
		for(let index in Trackback.items){
			trackbackArray.push({index: index, count: Trackback.items[index].length});
		}
		trackbackArray.sort(f);
		let hasbeenAdded = false;
		for(let i = 0, n = trackbackArray.length; i < n; i++){
			this.addTrackback("User", "Trackback", "", trackbackArray[i].index, trackbackArray[i].count);
			hasbeenAdded = true;
		}
		if(!hasbeenAdded) this.addLabel("User", "Trackback", "", "なし");
		// ------------- リンク
		this.addPage ("Link", "リンク");
		this.addFrame("Link", "Internal", "内部リンク", 128);
		this.addFrame("Link", "External", "外部リンク",128);
		this.addPage ("Image", "画像");
		this.addFrame("Image", "Image", "一覧",256);
		this.addPage ("Video", "動画");
		this.addFrame("Video", "Video", "一覧",256);

		const urlTable = [];
		let imageCount = 0;
		let videoCount = 0;
		let extCount = 0;
		let chCount = 0;

		const domain = TD.threadUrl.replace(/^https?:\/\/[^.]+(\.[^.\/]+\.[^.\/]+)\/.+/, "$1");
		ResNodes.getOutLinks().forEach((node) => {
			const href = node.rel;
			if(!urlTable[href]){
				urlTable[href] = true;
				const container = ResNodes.getParentContainer(node);
				if(!container) return;
				const resNum = Nodes.getResNumByContainer(container);
				if(!resNum) return;
				if(ImagePopup.isImage(href)){
					imageCount++;
					this.addLink ("Image", "Image", "", href, node.href, resNum);
				}else if(VideoPopup.getVideoSource(href)){
					videoCount++;
					this.addLink ("Video", "Video", "", href, node.href, resNum);
				}else{
					if(href.indexOf(domain) === -1){
						extCount++;
						this.addLink ("Link", "External", "", href, node.href, resNum);
					}else{
						chCount++;
						this.addLink ("Link", "Internal", "", href, node.href, resNum);
					}
				}
			}
		});

		if(!imageCount) this.addLabel ("Image", "Image", "", "なし");
		if(!videoCount) this.addLabel ("Video", "Video", "", "なし");
		if(!extCount)   this.addLabel ("Link", "External", "", "なし");
		if(!chCount)    this.addLabel ("Link", "Internal", "", "なし");
		// -------------
		this.show();
	}
}

//======================================
// ReplaceStr.txt 関連
//======================================

/**
 * ReplaceStr.txt を扱います。
 */
var ReplaceStr = {
	log: new SkinLog("ReplaceStr", SkinLogLvl.WARNING),
	/**
	 * 変換用データ(DB に格納する内部フォーマット)
	 * @type {Array<string,number>}
	 * @example
	 * [
	 *     [ 1, ""  ,""             ,"msg"  ,"gi" ,"ほげ" ,"ふが" ],
	 *     [ 3, "0" ,"/software/"   ,"msg"  ,"g"  ,/foo/g ,"bar"  ],
	 *     [ 4, "4" ,/\/software\// ,"date" ,"gi" ,"2008" ,"今年" ]
	 * ]
	 */
	items_org: [],
	/**
	 * 変換用データ(対象 URL のみ抽出)
	 * @type {Array<string,Array>}
	 * @example
	 * [
	 *     ["msg"   ,[
	 *                ["gi" ,"ほげ" ,"ふが" ],
	 *                ["g"  ,/foo/g ,"bar"  ]
	 *     ]],
	 *     [ "date" ,[
	 *                ["gi" ,"2008" ,"今年" ]
	 *     ]]
	 * ]
	 */
	items: [],
	target_max: 0,
	/**
	 * 変換用データを読み込み前に初期化します。
	 */
	init(){
		this.items_org = [];
		this.items = [];
	},
	/**
	 * ReplaceStr.txtファイルの内容をパースして内部フォーマットにします。
	 * @param {string}	text	ReplaceStr.txtファイルから読み込んだテキスト
	 *
	 * @see {@link http://janestyle.s11.xrea.com/help/first/ReplaceStr.html}
	 */
	parseRule(text){
		const table = ReplaceStr.parseTabText(text);
		for(let ary of table){
			try {
				let [ , cmd_src, dst, target, url ] = ary;
				let type = "";
				let term = "";
				let flags = "";
				let   src;

				// 置換対象
				if(target !== "name" && target !== "mail" && target !== "date" && target !== "id"){
					target = "msg";
				}

				// 置換対象の文字列
				if(cmd_src.match(/^<([er])x(2?)>(.+)/)){
					const is_regex = (RegExp.$1 === "r");
					flags = (RegExp.$2 === "2" ? "g" : "gi");
					src = (is_regex ? RegExp.$3 : this.escape(RegExp.$3));
				}else{
					flags = "gi";
					src = this.escape(cmd_src);
				}
				src = new RegExp(src, flags);

				// <n>対象URL/タイトル
				// 指定しない場合はすべてのスレッドが対象
				if(url && url.match(/^(?:<(\d)>)?(.*)/)){
					type = RegExp.$1 || "0";
					url  = RegExp.$2 || "";
					switch (type){
						case "0":
						case "1":
							term = new RegExp(this.escape(url));
							break;
						case "2":
						case "3":
							term = new RegExp('^' + this.escape(url) + '$');
							break;
						case "4":
						case "5":
							term = new RegExp(url);
							break;
						default:
							throw new Error("invalid type");
					}
				}
				this.items_org.push([ type, term, target, flags, src, dst ]);
			}
			catch(e){
				throw new Error(ary[0] + " 行目\n" + e.message);
			}
		}
		// ソートしてからストレージに保存
		ReplaceStr.items_org.sort((a, b) => {
			if(a[3] === b[3]) return (a[0] > b[0]) ? 1 : -1;
			else              return (a[3] > b[3]) ? 1 : -1;
		});
	},
	/**
	 * タブ区切りの文字列をパースします。
	 * @param {string} tabText	タブ区切りの文字列
	 */
	parseTabText(tabText){
		this.log.dbg("parseTabText(url,title,contextNode,popup)");

		const lineData = tabText.split("\r\n");
		const lines = lineData.length;
		let table = [];
		let idx = 0;
		for(let i = 0; i < lines; i++){
			const wCount = lineData[i].split("\t");
			const cols = wCount.length;
			if(cols === 3 || cols === 4){
				if(!wCount[0].match(/^;|'|#|\/\//)){
					table[idx] = [];
					table[idx][0] = i + 1;
					for(let j = 0; j < cols; j++){
						table[idx][j + 1] = wCount[j];
					}
					idx++;
				}
			}
		}
		return table;
	},
	/**
	 * localStorage に変換のデータを eval() で評価できる形で保存します。
	 */
	save(){
		this.log.dbg("save()");

		// 正規表現を文字列化する
		let temp = this.items_org.map(ary => ary.map(v => v instanceof RegExp ? v.source : v));
		Storage.set("valueReplaceStr", JSON.stringify(temp));
	},
	/**
	 */
	escape(e){
		return e.replace(/[.*+?^=!:${}()|[\]\/\\]/g, '\\$&');
	},
	/**
	 * 変換用データを読み込み eval() で評価します。結果は自動的に items プロパティに格納されます。
	 */
	load(url, title){
		this.log.dbg("load(" + url + ", " + title + ")");
		const replaceStr = Storage.get("valueReplaceStr") || "[]";
		this.items_org = JSON.parse(replaceStr);
		const max = SkinPref.get("valueMaxReplaceStr");
		this.target_max = (max > 1000 ? 1000 : (max < 0 ? 0 : max));

		// とりあえずべたべたに(2)
		this.items = [];
		for(let ary of this.items_org){
			const [ type, term, target, flags, src, dst ] = ary;
			const re = new RegExp(term);
			let use = true;

			//  <0>:含む <1>:含まない <2>:一致 <3>:一致しない <4>:含む（正規） <5>:含まない（正規）
			//  ※ <n>を指定しない場合は<0>が指定されたとみなす
			switch (type){
				case "0":
				case "2":
				case "4":
					use = re.test(url) || re.test(title);
					break;
				case "1":
				case "3":
				case "5":
					use = !re.test(url) && !re.test(title);
					break;
			}
			if(use){
				if(!this.items[target]){
					this.items[target] = [];
				}
				this.items[target].push([ new RegExp(src, flags), dst ]);
			}
		}
	},
	/**
	 * 変換用のデータを削除します。
	 */
	clear(){
		this.log.dbg("clear()");
		Storage.remove("valueReplaceStr");
		this.items_org = [];
		this.items = [];
	},
	/**
	 * 変換を実行します。
	 */
	replace(url, title, node){
		this.log.dbg("replace(url,title,node)");
		this.load(url, title);
		if(!this.items) return;

		const xpaths = {
			"name":	ResNodes.getNames.bind(ResNodes),
			"mail":	ResNodes.getMails.bind(ResNodes),
			"date":	ResNodes.getDates.bind(ResNodes),
			"id":	ResNodes.getIDs.bind(ResNodes),
			"msg":	ResNodes.getBodies.bind(ResNodes)
		};

		const resItems = ResNodes.getContainers(node);
		const num = resItems.length;
		const start = (num > this.target_max ? num - this.target_max : 0);
		const last = num - 1;

		for(let i = last; i >= start; i--){
			for(let t in this.items){
				const ary = this.items[t];
				const cur_node = xpaths[t](resItems[i])[0];
				const org_str = cur_node.innerHTML;
				let tmp_str = org_str;
				for(let line of ary){
					tmp_str = tmp_str.replace(...line);
				}
				if(org_str !== tmp_str) cur_node.innerHTML = tmp_str;
			}
		}
	}
};

//======================================
// あぼーん関連
//======================================

/**
 * 即時あぼーんやあぼーんレスの展開/折り畳み動作に対応するクラス
 */
class b2rAboneHandlerManager {
	constructor() {
		this.log = new SkinLog("b2rAboneHandler", SkinLogLvl.WARNING);
	}
	/**
	 * イベントリスナを登録します。
	 */
	startup(){
		this.log.info("startup()");
		_doc.addEventListener("click", this, false);
		_doc.addEventListener("chaika-abone-add", this, false);
		_doc.addEventListener("chaika-abone-remove", this, false);
	}
	/**
	 * あぼーん追加/削除時のイベントを処理します。
	 */
	handleEvent(aEvent){
		const fn = "handleEvent()";
		this.log.info(fn);

		if(aEvent.type === "click"){
			const node = aEvent.target;
			if((node.nodeType === 1) && node.classList.contains("resInfoAbone")){
				const res = ResNodes.getParentContainer(node);
				const is_hide = res.getAttribute("concealed");
				res.setAttribute("concealed", is_hide === "true" ? "false" : "true");
			}
		}else{
			const isAdd = (aEvent.type === "chaika-abone-add");
			const ngType = aEvent.sourceEvent.type;
			const ngWord = aEvent.sourceEvent.detail;
			const ngClass = {name:"resName", mail:"resMail", id:"resID", word: "resBody"}[ngType];
			if(!ngClass){
				if(SkinPref.get("enableReloadChangeNGEx")){
					this.reloadThread(false);
					return;
				}
			}

			Array.from(Nodes.content.getElementsByClassName(ngClass)).forEach((elem) => {
				if(elem.textContent.indexOf(ngWord) !== -1){
					const res = ResNodes.getParentContainer(elem);
					const infoAbone = Nodes.getInfoAbone(Nodes.getResHeader(res));
					if(isAdd){
						res.setAttribute("concealed", "true");
						res.setAttribute("aboned", "true");
						infoAbone.title = ngWord;
						infoAbone.style.display = "block";
					}else{
						res.removeAttribute("concealed");
						res.removeAttribute("aboned");
						infoAbone.title = "";
						infoAbone.style.display = "none";
					}
				}
			});
		}
	}
	/**
	 * あぼーんの設定変更を反映させるためスレッドをリロードします。
	 */
	reloadThread(toggle){
		this.log.info("reloadThread()");
		const url = location.href;
		if(toggle){
			const disableAboneFlag = "?chaika_disable_abone=1";
			const flag = location.search;
			if(flag.indexOf(disableAboneFlag) !== -1){
				location.search = "";
			}else{
				location.search = disableAboneFlag;
			}
		}else{
			location.href = url;
		}
	}
}
// グローバル変数名へのマッピング
var b2rAboneHandler = new b2rAboneHandlerManager();
b2rAboneHandler.startup();

//======================================
// Flashプラグイン関連
//======================================

/**
 * 新着時に音を鳴らす処理を管理するクラス
 */
class SoundUnitManager {
	constructor(){
		this.audio = null;
	}
	/**
	 * 新着時の音を再生します。
	 */
	play(){
		try {
			if (!this.audio) {
				this.audio = new Audio(TD.skinPath + "flash/sound.mp3");
			}
			this.audio.currentTime = 0;
			this.audio.play().catch(err => {
				console.warn("Audio playback failed (user interaction required?):", err);
			});
		} catch (e) {
			console.error("Audio initialization failed:", e);
		}
	}
	// 互換性のためのダミー
	playMP3() { return true; }
	playSWF() {}
}
// グローバル変数名へのマッピング
var SoundUnit = new SoundUnitManager();

/**
 * クリップボード操作を行うクラス
 */
class ClipboardManager {
  constructor(){
		this.cb = null;
		// 互換用プロパティ
		this.copy_text = null;
	}
	doCopy() { return this.copy_text; }
	/**
	 * 仮想クリップボードを準備します。
	 */
	init(){
		this.cb = _doc.getElementById('div-clipboard');
	}
	/**
	 * 文字列をクリップボードにコピーします。（モダン非同期API優先）
	 * @param {string}	text	文字列
	 */
	setClipboard(text){
		if (navigator.clipboard) {
			navigator.clipboard.writeText(text).catch(err => {
				console.warn("Async clipboard failed, falling back to document.execCommand:", err);
				this.fallbackCopy(text);
			});
		} else {
			this.fallbackCopy(text);
		}
	}
	/**
	 * 旧来のクリップボードコピーロジック（フォールバック用）
	 */
	fallbackCopy(text) {
		if (!this.cb) return;
		this.cb.innerHTML = text.replace(/\n/g, "<br>");
		const range = document.createRange();
		range.selectNode(this.cb);
		const selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
		try{
			document.execCommand('copy');
		}catch(err){
			console.error("Fallback clipboard copy failed:", err);
		}
		selection.removeAllRanges();
		this.cb.innerHTML = "";
	}
}
// グローバル変数名へのマッピング
var Clipboard = new ClipboardManager();



//======================================
// Punycode エンコーダ関連
//======================================

/**
 * Punycode エンコーダクラス
 */
class PunycodeEncoder {
	constructor(){
		this.BASE = 36;
		this.TMIN = 1;
		this.TMAX = 26;
		this.SKEW = 38;
		this.DAMP = 700;
		this.INITIAL_BIAS = 72;
		this.INITIAL_N = 0x80;
		this.DELIMITER = 0x2d;
		this._char_code_a = "a".charCodeAt(0);
		this._char_code_0 = "0".charCodeAt(0);
	}

	encode_digit(d){
		return (d < 26 ? this._char_code_a + d: this._char_code_0 + (d - 26));
	}

	adapt(delta, numpoints, firsttime){
		delta  = firsttime ? parseInt(delta / this.DAMP, 10) : delta >> 1;
		delta += parseInt(delta / numpoints, 10);

		let k = 0;
		const cond = ((this.BASE - this.TMIN) * this.TMAX) >> 1;
		for( ; delta > cond; k += this.BASE){
			delta = parseInt(delta / (this.BASE - this.TMIN), 10);
		}
		return k + parseInt((this.BASE - this.TMIN + 1) * delta / (delta + this.SKEW), 10);
	}

	encode(input){
		const input_array = [];
		for(let i = 0, len = input.length; i < len; i++){
			input_array.push(input.charCodeAt(i));
		}
		const output = this.encode_main(input_array);
		for(let i = 0, len = output.length; i < len; i++){
			const c = output[i];
			if(!(c >= 0 && c <= 127)) break;
			output[i] = String.fromCharCode(c);
		}
		return output.join("");
	}

	encode_main(input){
		const output = [];

		let n = this.INITIAL_N;
		let delta = 0;
		let bias = this.INITIAL_BIAS;

		for(let i = 0, len = input.length; i < len; i++){
			if(input[i] < n) output.push(input[i]);
		}

		const bcp = output.length;
		let handled = bcp;

		if(bcp > 0) output.push(this.DELIMITER);

		while(handled < input.length){
			let m = Infinity;
			for(let i = 0, len = input.length; i < len; i++){
				if(input[i] >= n && input[i] < m) m = input[i];
			}

			if(m - n > (Infinity - delta) / (handled + 1)){
				throw new Error("punycode overflow (1)");
			}
			delta += (m - n) * (handled + 1);
			n = m;

			for(let i = 0, len = input.length; i < len; i++){
				if(input[i] < n && ++delta === 0){
					throw new Error("punycode overflow (2)");
				}
				if(input[i] === n){
					let q = delta;
					let k = this.BASE;
					for( ; ;k += this.BASE){
						const t = (k <= bias) ? this.TMIN : (k >= bias + this.TMAX) ? this.TMAX : k - bias;

						if(q < t) break;

						output.push(this.encode_digit(t + (q - t) % (this.BASE - t)));
						q = parseInt((q - t) / (this.BASE - t), 10);
					}
					output.push(this.encode_digit(q));
					bias = this.adapt(delta, handled + 1, handled === bcp);
					delta = 0;
					handled++;
				}
			}
			delta++;
			n++;
		}
		return output;
	}
}
// グローバル変数名へのマッピング
var Punycode = new PunycodeEncoder();


// DOM要素の欠落時にもスクリプトが落ちないよう安全ガード付きで登録します
Nodes.threadName && (Nodes.threadName.onclick = () => TD.reload());
_doc.getElementById("autoReload") && (_doc.getElementById("autoReload").onclick = () => AutoReload.toggle());
_doc.getElementById("autoScroll") && (_doc.getElementById("autoScroll").onclick = () => AutoScroll.toggle());
_doc.getElementById("reloadMenu") && (_doc.getElementById("reloadMenu").onchange = () => ReloadThread());
_doc.getElementById("goPrev") && (_doc.getElementById("goPrev").onclick = () => TD.movePage('prev'));
_doc.getElementById("showAll") && (_doc.getElementById("showAll").onclick = () => TD.showAll());
_doc.getElementById("writeTo") && (_doc.getElementById("writeTo").onclick = () => TD.writeTo());
_doc.getElementById("find") && (_doc.getElementById("find").onclick = () => FindBox.show());

Nodes.findBoxText && (Nodes.findBoxText.onfocus = () => Nodes.findBoxText.select());
Nodes.findObject && (Nodes.findObject.onchange = () => FindBox.find());
Nodes.findContent && (Nodes.findContent.onchange = () => FindBox.find());
_doc.getElementById("showBar") && (_doc.getElementById("showBar").onclick = () => Titlebar.showBar());

Nodes.statusText && (Nodes.statusText.onfocus = () => Nodes.statusText.select());
Nodes.statusText && (Nodes.statusText.onclick = () => TD.scrollToNewRes());


TD.run();
//---- end of script ----
