"use strict";

(() => {
	const footer = document.getElementById("footer");
	if (!footer) return;

	footer.style.display = "none";

	const head = document.head;
	const body = document.body;
	const skinPath = footer.getAttribute("skinpath") || "";
	const status = footer.getAttribute("status") || "";
	const pageTitle = "読み込みエラー -chaika-";
	const threadPattern = /.+\/thread\/((http:\/\/[\w.]+)\/test\/read\.cgi\/([\w.]+)\/\d+)\/?/;

	document.title = pageTitle;

	const addLink = (rel, href) => {
		const link = document.createElement("link");
		link.rel = rel;
		link.href = href;
		head.appendChild(link);
	};

	addLink("stylesheet", skinPath + "style-common.css");
	addLink("icon", skinPath + "img/favicon/favicon.img");

	body.className = "errorBody";

	const createElement = (tag, { id, text, href } = {}) => {
		const el = document.createElement(tag);
		if (id) el.id = id;
		if (text != null) el.textContent = text;
		if (href != null) el.href = href;
		return el;
	};

	const appendMessages = (container, messages) => {
		const fragment = document.createDocumentFragment();

		for (const text of messages) {
			fragment.appendChild(createElement("li", { text }));
		}

		container.appendChild(fragment);
	};

	const errorHeader = createElement("div", {
		id: "errorHeader",
		text: pageTitle
	});
	const errorInfo = createElement("div", { id: "errorInfo" });
	const errorTitle = createElement("div", { id: "errorTitle" });
	const errorMessage = createElement("ul", { id: "errorMessage" });

	errorInfo.append(errorTitle, errorMessage);
	body.append(errorHeader, errorInfo);

	const match = location.href.match(threadPattern);

	switch (status) {
		case "( ｰωｰ)「DAT 落ち」": {
			errorTitle.textContent = "- スレッドがありません -";
			appendMessages(errorMessage, [
				"このスレッドは既にdat落ちしているか、URLが違う可能性があります。",
				"chaika内に該当するスレッドのログはありません。"
			]);

			if (!match) break;

			const threadUrl = match[1] + "/?chaika_force_browser=1";
			const boardUrl = "chaika://board/" + match[2] + "/" + match[3] + "/";
			const errorLinks = createElement("div", { id: "errorLinks" });

			const openBoard = createElement("a", {
				text: "スレッド一覧",
				href: boardUrl
			});

			const viewBrowser = createElement("a", {
				text: "ブラウザー表示",
				href: threadUrl
			});

			const viewFrame = createElement("a", {
				text: "フレーム表示",
				href: "#"
			});

			const showFrame = (event) => {
				event.preventDefault();

				const iframe = createElement("iframe", { id: "errorIFrame" });
				iframe.src = threadUrl;

				viewFrame.removeEventListener("click", showFrame);
				errorInfo.appendChild(iframe);
			};

			viewFrame.addEventListener("click", showFrame, false);
			errorLinks.append(openBoard, viewBrowser, viewFrame);
			errorInfo.appendChild(errorLinks);
			break;
		}

		case "(´・ω・`)「ネットワークエラー」":
			errorTitle.textContent = "- ネットワークエラーです -";
			appendMessages(errorMessage, [
				"chaikaからインターネットに接続できません。"
			]);
			break;
	}
})();
