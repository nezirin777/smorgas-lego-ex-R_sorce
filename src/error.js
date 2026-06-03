/**
 * @file エラーページを出力します。
 * @author EarlgreyTea
 */
"use strict";
(() => {
	const ft = document.getElementById("footer");
	ft.style.display = "none";

	const head = document.head || document.getElementsByTagName("head")[0];
	const title = document.title || document.createElement("title")
	title.textContent = "読み込みエラー -chaika-";
	head.appendChild(title);
	const addLink = (rel, type, href) => {
		const link = document.createElement("link");
		link.setAttribute("rel", rel);
		link.setAttribute("type", type);
		link.href = href;
		head.appendChild(link);
	};
	const SKIN_PATH  = ft.getAttribute("skinpath");
	addLink("stylesheet", "text/css", SKIN_PATH + "style-common.css");
	addLink("icon", "image/png", SKIN_PATH + "img/favicon/favicon.img");

	const body = document.body || document.createElement("body");
	body.className = "errorBody";

	const errHeader = document.createElement("div");
	errHeader.id = "errorHeader"
	errHeader.textContent = title.textContent;
	body.appendChild(errHeader);

	const errInfo = document.createElement("div");
	errInfo.id = "errorInfo"
	body.appendChild(errInfo);

	const errTitle = document.createElement("div");
	errTitle.id = "errorTitle"
	errInfo.appendChild(errTitle);

	const errMsg = document.createElement("ul");
	errMsg.id = "errorMessage";
	errInfo.appendChild(errMsg);

	const r = /.+\/thread\/((http:\/\/[\w\.]+)\/test\/read.cgi\/([\w\.]+)\/[\d]+)\/?/.exec(location.href);

	switch(ft.getAttribute("status")){
	case "( ｰωｰ)「DAT 落ち」":
		errTitle.textContent = "- スレッドがありません -";
		errMsg.innerHTML = "<li>このスレッドは既にdat落ちしているか、URLが違う可能性があります。</li>"
		                 + "<li>chaika内に該当するスレッドのログはありません。</li>";
		if(r){
			const THREAD_URL = r[1] + "/?chaika_force_browser=1";
			const BOARD_URL  = "chaika://board/" + r[2] + "/" + r[3] + "/";
			const errLinks = document.createElement("div");
			errLinks.id = "errorLinks";
			errInfo.appendChild(errLinks);

			const openBoard = document.createElement("a");
			openBoard.textContent = "スレッド一覧";
			openBoard.href = BOARD_URL;
			errLinks.appendChild(openBoard);

			const viewBrowser = document.createElement("a");
			viewBrowser.textContent = "ブラウザー表示";
			viewBrowser.href = THREAD_URL;
			errLinks.appendChild(viewBrowser);

			const viewFrame = document.createElement("a");
			viewFrame.textContent = "フレーム表示";
			viewFrame.href ="#";
			errLinks.appendChild(viewFrame);

			const onclick = () => {
				const iframe = document.createElement("iframe");
				iframe.id = "errorIFrame";
				iframe.setAttribute("src", THREAD_URL);
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
})();
