
"use strict";

var SysPref = {
	disableStorage: false,
	enableDefaultUpperPopup: false,
	enableEmbedImageWithPopup: true,
	disableRelatedVideo: false,
	enableFullScreenVideo: true,
	enableShowIDCountIndex: true,
	enableIDIconforColle: true,
	valueMaxReplaceStr: 100,
	enableDirectBookmarking: true,
	enableCheckReplaceBookmark: true,
	enableReloadChangeNGEx: false,
	valueLazyloadMax: 10,
	valueLazyloadMin: 2,
	valueLiveThreadHost: '.+live.+|.+jikkyo.+',
	valueYouTubeExtraParams: "&vp=hd1080" };

var InitPref = {
	hasConfig: false,
	enableResPopup: true,
	enableIDPopup: true,
	enableIDPopupOnClick: false,
	enableIDPopupAll: false,
	enableNamePopup: true,
	enableNamePopupOnClick: false,
	enableNamePopupAll: false,
	enableDivideSLIP: false,
	enableImagePopup: true,
	valuePixelationMethod: 0,
	valuePixelationSize: 1,
	enableDefaultPixelation: false,
	enableImageGroCheck: true,
	valueImageGroPattern: "(^ ?グロ|^ ?グロテスク|注意|危険|ブラクラ)([ 　!！\(（\:.．。だで]|$)",
	valueShadeLevel: 1,
	enableImagePopupShadeOverCancel: true,
	enableUrlPopup: true,
	valueThumbnailSite: 2,
	valueUrlPopupSize: 0,
	enableVideoPopup: true,
	valuePopupVideoSize: 0,
	videoPopupAutoStart: false,
	enableTrackBackPopup: true,
	enableTrackBackPopupAll: false,
	enableThreadInfoPopup: false,
	enableThreadInfoPopupAutoBookmark: false,
	valueSkinStyle: 4,
	nameSkinStyle: "simple-light",
	enableScrollToNewRes: true,
	enableUpdateSound: false,
	enableHighlightMyPost: true,
	stringMyPostBgColor: "#c1c1c1",
	enableHighlightReply: true,
	stringReplyBgColor: "#b0c4de",
	enableNotifyReply: true,
	enableReplaceBadAnchor: false,
	enableReplaceWideAnchor: false,
	enableReplaceCommaAnchor: false,
	enableReplacePlusAnchor: false,
	enableReplace1000Anchor: false,
	enableReplaceStr: false,
	enableReplaceIDNAnchor: false,
	valueReloadForPrefApply: 0,
	enableLinkNewWindow: true,
	enableLinkNoReferer: true,
	enableLinkForChaika: true,
	enableLinkTypeIcon: false,
	valueHideTitleBar: 0,
	enableContract: false,
	enableBoardName: true,
	enableFavicon: false,
	enableShowDatSize: false,
	enablePopupFade: true,
	valuePopupFadeStep: 1,
	valueTrackBackDivNums: 10,
	enableHookReload: true,
	enableSmoothScroll: true,
	valueSmoothScrollFrames: 1,
	valueReadBandWidth: 1,
	enableCopyWithQuotationMark: false,
	enableAutoReloadOnLiveThread: false,
	enableAutoReloadWhenInactive: true,
	enableStatusClearWhenInactive: true,
	valueAutoReloadInterval: 1,
	enableChangeInterval: true,
	enableForceAutoScroll: false,
	enableFindHighlight: false,
	enableFxFind: false,
	enableMoveAfterFind: true,
	valueIDPickupHotkey: 1,
	valueIDPickupResult: 0,
	enableShowIDCount: true,
	enableColoringID: true,
	valueColoringIDThreshold: "2,5",
	valueColoringIDColor: "#096CE6,#FE5D47",
	enableShowTrackbackCount: true,
	enableColoringSLIP: false,
	valueColoringSLIPThreshold: "2,5",
	valueColoringSLIPBgColor: "#B0C4DE,#FFB6C1",
	valuePopularPostThreshold: 4,
	valuePopupResMax: 3,
	valueTemplateRes: 0,
	valueTemplateSelectHotkey: 1,
	valueTemplateSelectCheckTime: 10,
	enableShowMarkToNew: true,
	enableEmbedImage: false,
	enableEmbedImageWithCheck: false,
	enableEmbedImageGroup: false,
	enableEmbedImageAutoLoad: false,
	valueLazyloadInterval: 200,
	enableEmbedImagePreLoad: false,
	enableEmbedLoadOnLinkMouseOver: false,
	enableEmbedImageWithoutVideo: false,
	enableThumbnailImage: true,
	enableThumbnailWithoutGif: true,
	valueEmbedImageSize: 0,
	valueEmbedVideoSize: 0,
	enableMultiResSelect: true,
	enableMultiResSelectNoModify: true,
	enablePopupPreventer: true,

	end: 0
};

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

var SelOpts = {
	StyleName: ["lego-ex", "本家ライク", "mix ライク", "chaikaライク", "シンプル(軽量)", "colleライク"],
	StyleFile: ["lego-ex", "smorgas", "mix", "chaika", "simple-light", "colle"],
	PixelationMethod: ["疑似モザイク", "ガウスぼかし"],
	PixelationSize: ["強", "中", "弱"],
	ShadeLevel: ["85%", "70%", "50%", "0%(そのまま)"],
	ThumbnailSite: ["×Snap Shots (TM)", "SimpleAPI", "HeartRails Capture", "×websnapr"],
	UrlPopupSize: ["大", "小"],
	ReloadForPrefApply: ["何もしない", "リロードする前に確認", "すぐにリロードする"],
	HideTitleBar: ["常に表示", "ダブルクリックで隠す", "自動で隠す"],
	PopupFadeStep: [0.1, 0.2, 0.25, 0.33, 0.5],
	SmoothScrollFrames: ["最小", "中", "最大"],
	ReadBandWidth: [25, 50, 100],
	AutoReloadInterval: ["15 秒", "30 秒", "1 分", "3 分", "5 分", "10 分"],
	IDPickupHotkey: ["クリック", "CTRL + クリック"],
	IDPickupResult: ["検索の選択状態", "抽出", "強調"],
	PopupResMax: [5, 10, 15, 20, 30, 50, 100, 200, 500, 1000],
	EmbedImageSize: [{ width: 200, height: 200 }, { width: 500, height: 250 }],
	EmbedVideoSize: [{ width: 360, height: 270 }, { width: 560, height: 315 }],
	PopupVideoSize: [{ width: 480, height: 360 }, { width: 640, height: 360 }],
	TemplateRes: [10, 15, 20, 25, 30]
};

var VerInfo = {
	_skinName: "smorgasbord",
	_skinVersion: "2007/09/25 afternoon (still unstable)",
	_skinURI: "http://smorgasbord.drwatson.nobody.jp/",
	_skinMail: "drwatson.exe+smorgasbord@gmail.com",

	_skinDerivedName: "smorgas lego-ex-R",
	_skinDerivedVersion: "2018/05/22(ex-R) [ 2012/06/05(lego-ex) ベース ]",
	_skinDerivedDisclaimer: "※本スキンは派生版ですので、不具合等の連絡は本家作者様にしないで下さい"
};

var SkinLogLvl = {
	NONE: 10,
	ERROR: 8,
	WARNING: 6,
	INFO: 4,
	DEBUG: 2
};

class SkinLog {
	constructor(module, level) {
		this.mod = module;
		this.lvl = level < SKIN_LOGLVL ? level : SKIN_LOGLVL;
	}
	_log(type, msg) {
		console.log("lego-ex-R:[" + type + "]:" + this.mod + ":" + msg);
	}

	err(msg) {
		if (this.lvl <= SkinLogLvl.ERROR) this._log('ERROR', msg);
	}

	warn(msg) {
		if (this.lvl <= SkinLogLvl.WARNING) this._log('WARNING', msg);
	}

	info(msg) {
		if (this.lvl <= SkinLogLvl.INFO) this._log('INFO', msg);
	}

	dbg(msg) {
		if (this.lvl <= SkinLogLvl.DEBUG) this._log('DEBUG', msg);
	}
}

var SKIN_LOGLVL = SkinLogLvl.WARNING;

var Storage = {
	log: new SkinLog("Storage", SkinLogLvl.WARNING),

	_storage: null,

	_showAlert(exception, message) {
		this.log.err(exception);
		if (!message) return;
		alert("logo-ex-R:[ERROR]:" + message);
	},

	_key(name) {
		return "lego-ex-R-" + name;
	},

	origin: location.href.replace(/\/thread\/.+$/, ""),

	init() {
		try {
			this._storage = localStorage;
		} catch (e) {
			this._showAlert(e, "ストレージへアクセスできません\n" + "「" + Storage.origin + "」サイトから送られてきた Cookie の保存を許可設定してください");
			this._storage = null;
		}
		if (!this._storage) return false;
		return true;
	},

	get(name) {
		let data = null;
		if (this._storage) {
			try {
				data = JSON.parse(this._storage.getItem(this._key(name)));
			} catch (e) {
				this._showAlert(e, "ストレージからの読み出しでエラーが発生しました");
			}
		}
		return data;
	},

	set(name, data) {
		if (this._storage) {
			try {
				this._storage.setItem(this._key(name), JSON.stringify(data));
			} catch (e) {
				this._showAlert(e, "ストレージへの書き込みでエラーが発生しました");
			}
		}
	},

	remove(name) {
		try {
			this._storage.removeItem(this._key(name));
		} catch (e) {
			this._showAlert(e, "ストレージのデータの削除でエラーが発生しました.");
		}
	}
};

var Backup = {
	log: new SkinLog("Backup", SkinLogLvl.WARNING),

	_tempData: null,

	_objectURL: null,

	checkData() {
		const fn = "checkData()";
		this.log.info(fn);
		if (!this._tempData) {
			this.log.err("Not yet read file.");
			return null;
		}
		const check = {};
		check.pref = "pref" in this._tempData;
		check.mypost = "valueMyPosts" in this._tempData || "valueMyIDs" in this._tempData;
		check.bookmark = "valueBookmarkIndex" in this._tempData;
		if (!check.pref && !check.mypost && !check.bookmark) return null;
		return check;
	},

	readFile(file) {
		const fn = "readFile(" + file.name + ")";
		this.log.info(fn);
		return new Promise((resoluve, reject) => {
			const reader = new FileReader();
			reader.onload = e => {
				const text = e.target.result;
				this.log.dbg(text);
				try {
					this._tempData = JSON.parse(text);

					const check = this.checkData();
					if (!check) {
						this._tempData = null;
						reject("NotExportFile");
					} else {
						resoluve(check);
					}
				} catch (err) {
					this.log.err(err.message);
					this._tempData = null;
					reject(err.message);
				}
			};
			reader.onerror = e => {
				this.log.err(e.target.error.name);
				this._tempData = null;
				reject(e.target.error.name);
			};
			reader.readAsText(file);
		});
	},

	execImport(select) {
		const fn = "execImport(" + JSON.stringify(select) + ")";
		this.log.info(fn);
		const keys = [];
		if (select.pref) {
			keys.push("pref");
		}
		if (select.mypost) {
			if ("valueMyPosts" in this._tempData) {
				keys.push("valueMyPosts");
			}
			if ("valueMyIDs" in this._tempData) {
				keys.push("valueMyIDs");
			}
		}
		if (select.bookmark) {
			keys.push("valueBookmarkIndex");
		}

		keys.forEach(key => {
			Storage.set(key, this._tempData[key]);
		});
		this._tempData = null;
		if (select.pref) {
			SkinPref.load();
		}
	},

	execExport(select) {
		const fn = "execExport(" + JSON.stringify(select) + ")";
		this.log.info(fn);
		this._tempData = {};
		const keys = [];
		if (select.pref) {
			keys.push("pref");
		}
		if (select.mypost) {
			keys.push("valueMyPosts");
			keys.push("valueMyIDs");
		}
		if (select.bookmark) {
			keys.push("valueBookmarkIndex");
		}

		keys.forEach(key => {
			this._tempData[key] = Storage.get(key);
		});

		const jsonStr = JSON.stringify(this._tempData);
		this.log.dbg(jsonStr);
		const blob = new Blob([jsonStr], { "type": "application/x-msdownload" });
		this._objectURL = window.URL.createObjectURL(blob);
		return this._objectURL;
	},

	removeExportURL() {
		const fn = "removeExportURL()";
		this.log.info(fn);
		this._tempData = null;
		if (this._objectURL) {
			window.URL.revokeObjectURL(this._objectURL);
			this._objectURL = null;
		}
	}
};

var SkinPref = {
	log: new SkinLog("SkinPref", SkinLogLvl.WARNING),

	_storage: null,
	_pref: null,
	_update: false,

	init() {
		this.log.info("init()");
		if (!SysPref.disableStorage) {
			this._storage = Storage;
			return this._storage.init();
		} else {
			return false;
		}
	},

	load() {
		let pref = null;
		this.log.info("load()");
		if (!SysPref.disableStorage) {
			pref = this._storage.get("pref");
		}
		if (pref) {
			let name;
			for (name in pref) {
				this.log.dbg("pref[" + name + "] = " + pref[name]);
				if (!(name in InitPref)) {
					this.log.warn("delete pref[" + name + "]");
					delete pref[name];
				}
			}
			for (name in InitPref) {
				if (!(name in pref)) {
					let val;
					if (InitPref[name] instanceof Array) {
						val = InitPref[name].slice();
					} else {
						val = InitPref[name];
					}
					pref[name] = val;
					this.log.warn("not found pref[" + name + "] then copy from InitPref[" + name + "] = " + val);
				}
			}
		} else {
			this.log.info("replace SkinPref with InitPref");
			pref = JSON.parse(JSON.stringify(InitPref));
		}
		this._pref = pref;
		this._update = false;
	},

	get(name) {
		if (!name) return null;
		let val;
		if (name in VerInfo) {
			val = VerInfo[name];
		} else if (name in SysPref) {
			val = SysPref[name];
		} else {
			val = this._pref[name];
		}
		this.log.dbg("get(" + name + ") = " + val);
		return val;
	},

	set(name, val) {
		if (!name) return;
		this.log.dbg("set(" + name + "," + val + ")");
		if (name in this._pref) {
			if (this._pref[name] === val) return;
			if (name in ReloadPref) this._update = true;
			this._pref[name] = val;
		}
	},

	save() {
		if (SysPref.disableStorage) {
			return false;
		} else {
			this.log.info("save()");
			this._storage.set("pref", this._pref);
			return this._update;
		}
	},

	clear() {
		this.log.info("clear()");
		if (SysPref.disableStorage) {
			this._storage.remove("pref");
		}
		this._pref = JSON.parse(JSON.stringify(InitPref));
		this._update = false;
	}
};
SkinPref.init();
SkinPref.load();

(() => {
	const SKIN_PATH = location.href.replace(/\/thread\/.+$/, "/skin/");
	const SKIN_NAME = "style-" + SkinPref.get("nameSkinStyle") + ".css";
	document.writeln('<link rel="stylesheet" type="text/css" id="commonstyle" href="' + SKIN_PATH + 'style-common.css" />');
	if (SkinPref.get("enableLinkTypeIcon")) {
		document.writeln('<link rel="stylesheet" type="text/css" id="outlinkstyle" href="' + SKIN_PATH + 'style-outlink.css" />');
	}
	document.writeln('<link rel="stylesheet" type="text/css" id="skinstyle" href="' + SKIN_PATH + SKIN_NAME + '" />');
	document.writeln('<link rel="stylesheet" type="text/css" id="mystyle" href="' + SKIN_PATH + 'style-my.css" />');
})();