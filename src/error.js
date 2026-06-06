/**
 * @file エラーページを出力します。
 * @author EarlgreyTea
 */
"use strict";

/**
 * エラーページの構築と表示を管理するクラスです。
 */
class ErrorPageRenderer {
	constructor() {
		/**
		 * フッタ要素
		 * @type {Element|null}
		 */
		this.ft = document.getElementById("footer");
		/**
		 * ドキュメントの head 要素
		 * @type {Element|null}
		 */
		this.head = document.head || document.getElementsByTagName("head")[0] || null;
		/**
		 * ドキュメントの body 要素
		 * @type {Element|null}
		 */
		this.body = document.body || document.getElementsByTagName("body")[0] || null;
	}

	/**
	 * 指定された属性値を持つ link 要素を head に追加します。
	 * @param {string} rel   rel 属性値
	 * @param {string} type  type 属性値
	 * @param {string} href  href 属性値
	 */
	addLink(rel, type, href) {
		if (!this.head) return;
		const link = document.createElement("link");
		link.setAttribute("rel", rel);
		link.setAttribute("type", type);
		link.href = href;
		this.head.appendChild(link);
	}

	/**
	 * エラーページの構築処理を実行します。
	 */
	render() {
		if (!this.ft) return;
		this.ft.style.display = "none";

		// title 要素の安全な取得と設定 (潜在的な型エラーの修正)
		let title = document.getElementsByTagName("title")[0];
		if (!title) {
			title = document.createElement("title");
			if (this.head) {
				this.head.appendChild(title);
			}
		}
		title.textContent = "読み込みエラー -chaika-";

		const skinPath = this.ft.getAttribute("skinpath") || "";
		this.addLink("stylesheet", "text/css", skinPath + "style-common.css");
		this.addLink("icon", "image/png", skinPath + "img/favicon/favicon.img");

		if (this.body) {
			this.body.className = "errorBody";
		} else {
			this.body = document.createElement("body");
			this.body.className = "errorBody";
			document.documentElement.appendChild(this.body);
		}

		const errHeader = document.createElement("div");
		errHeader.id = "errorHeader";
		errHeader.textContent = title.textContent;
		this.body.appendChild(errHeader);

		const errInfo = document.createElement("div");
		errInfo.id = "errorInfo";
		this.body.appendChild(errInfo);

		const errTitle = document.createElement("div");
		errTitle.id = "errorTitle";
		errInfo.appendChild(errTitle);

		const errMsg = document.createElement("ul");
		errMsg.id = "errorMessage";
		errInfo.appendChild(errMsg);

		const matchUrl = /.+\/thread\/((http:\/\/[\w\.]+)\/test\/read.cgi\/([\w\.]+)\/[\d]+)\/?/.exec(location.href);

		switch (this.ft.getAttribute("status")) {
			case "( ｰωｰ)「DAT 落ち」":
				errTitle.textContent = "- スレッドがありません -";
				errMsg.innerHTML = "<li>このスレッドは既にdat落ちしているか、URLが違う可能性があります。</li>"
				                 + "<li>chaika内に該当するスレッドのログはありません。</li>";
				if (matchUrl) {
					const threadUrl = matchUrl[1] + "/?chaika_force_browser=1";
					const boardUrl = "chaika://board/" + matchUrl[2] + "/" + matchUrl[3] + "/";
					const errLinks = document.createElement("div");
					errLinks.id = "errorLinks";
					errInfo.appendChild(errLinks);

					const openBoard = document.createElement("a");
					openBoard.textContent = "スレッド一覧";
					openBoard.href = boardUrl;
					errLinks.appendChild(openBoard);

					const viewBrowser = document.createElement("a");
					viewBrowser.textContent = "ブラウザー表示";
					viewBrowser.href = threadUrl;
					errLinks.appendChild(viewBrowser);

					const viewFrame = document.createElement("a");
					viewFrame.textContent = "フレーム表示";
					viewFrame.href = "#";
					errLinks.appendChild(viewFrame);

					const onclick = () => {
						const iframe = document.createElement("iframe");
						iframe.id = "errorIFrame";
						iframe.setAttribute("src", threadUrl);
						viewFrame.removeEventListener("click", onclick);
						errInfo.appendChild(iframe);
					};
					viewFrame.addEventListener("click", onclick, false);
				}
				break;
			case "(´・ω・`)「ネットワークエラー」":
				errTitle.textContent = "- ネットワークエラーです -";
				errMsg.innerHTML = "<li>chaikaからインターネットに接続できません。</li>";
		}
	}
}

// レンダリング実行
const renderer = new ErrorPageRenderer();
renderer.render();
