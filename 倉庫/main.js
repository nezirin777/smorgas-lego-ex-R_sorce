// src/main.js

// =====================================================================
// 1. 各モジュールからクラス（設計図）をインポート
// =====================================================================

// --- Core & Util ---
import { NodesManager } from './core/Nodes.js';
import { ResNodesManager } from './core/ResNodes.js';
import { ClipboardManager } from './util/Clipboard.js';
import { SoundUnitManager } from './util/SoundUnit.js';

// --- Thread (スレッド解析・状態管理) ---
import { IDManager } from './thread/ID.js';
import { NameManager } from './thread/Name.js';
import { ThreadDocumentManager } from './thread/ThreadDocument.js';
import { TrackbackManager } from './thread/Trackback.js';

// --- Popup (ポップアップ系) ---
import { IDPopupManager } from './popup/IDPopup.js';
import { ImagePopupManager } from './popup/ImagePopup.js';
import { NamePopupManager } from './popup/NamePopup.js';
import { PopupManager } from './popup/PopupManager.js';
import { ResPopupManager } from './popup/ResPopup.js';
import { TrackbackPopupManager } from './popup/TrackbackPopup.js';
import { VideoPopupManager } from './popup/VideoPopup.js';

// --- UI & Tool (画面操作系) ---
import { AutoReloadManager } from './ui/AutoReload.js';
import { BookmarkManager } from './ui/Bookmark.js';
import { DigestManager } from './ui/Digest.js';
import { FindBoxManager } from './ui/FindBox.js';
import { AutoScrollManager, PageScrollerManager } from './ui/PageScroller.js';
// (※お手元の環境に合わせて必要なものをすべて追加します)


// =====================================================================
// 2. 実体化（インスタンス生成）とエクスポート
// =====================================================================
// ※ここで生成する順番が重要です。依存されない土台（Core）から順に生成します。
// ※ES Modulesの仕組みにより、他ファイルがこれらを import してメソッドを使う瞬間には
//   すべて生成済みとなるため、循環参照エラーになりません。

export const Nodes = new NodesManager();
export const ResNodes = new ResNodesManager();
export const Clipboard = new ClipboardManager();
export const SoundUnit = new SoundUnitManager();

export const ID = new IDManager();
export const Name = new NameManager();
export const Trackback = new TrackbackManager();

// メインコントローラー
export const TD = new ThreadDocumentManager();

export const Popup = new PopupManager();
export const ResPopup = new ResPopupManager();
export const IDPopup = new IDPopupManager();
export const NamePopup = new NamePopupManager();
export const TrackbackPopup = new TrackbackPopupManager();
export const ImagePopup = new ImagePopupManager();
export const VideoPopup = new VideoPopupManager();

export const FindBox = new FindBoxManager();
export const AutoReload = new AutoReloadManager();
export const Bookmark = new BookmarkManager();
export const AutoScroll = new AutoScrollManager();
export const PageScroller = new PageScrollerManager();
export const Digest = new DigestManager();


// =====================================================================
// 3. グローバルイベントのバインド（script.js の末尾にあった処理）
// =====================================================================
// すべてのインスタンス生成が完了した後に、画面の固定ボタンなどへのイベントを紐付けます。
Nodes.threadName.onclick = () => TD.reload();
_doc.getElementById("autoReload").onclick = () => AutoReload.toggle();
_doc.getElementById("autoScroll").onclick = () => AutoScroll.toggle();
_doc.getElementById("reloadMenu").onchange = () => ReloadThread();
_doc.getElementById("goPrev").onclick = () => TD.movePage('prev');
_doc.getElementById("showAll").onclick = () => TD.showAll();
_doc.getElementById("writeTo").onclick = () => TD.writeTo();
_doc.getElementById("find").onclick = () => FindBox.show();
Nodes.findBoxText.onfocus = () => Nodes.findBoxText.select();
Nodes.findObject.onchange = () => FindBox.find();
Nodes.findContent.onchange = () => FindBox.find();
_doc.getElementById("showBar").onclick = () => Titlebar.showBar();
Nodes.statusText.onclick = () => TD.scrollToNewRes();

TD.run();
