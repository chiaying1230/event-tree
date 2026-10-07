/**
 * 智能障礙事件樹
 * 把同一個專案裡的 Index.html 發布成網頁應用程式。
 *
 * 發布：右上角「部署」→「新增部署作業」→ 類型選「網頁應用程式」
 *       執行身分選「我」，誰可以存取選「所有人」→「部署」，會得到一個結尾是 /exec 的網址。
 * 之後改了內容：「部署」→「管理部署作業」→ 編輯（鉛筆）→ 版本選「新版本」→「部署」，網址不變。
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('智能障礙事件樹')
    // 手機上要有這一行，版面才會照手機的寬度排（寫在 HTML 檔裡的 viewport 會被忽略）
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    // 允許把這個網頁嵌進 Google 協作平台或其他網頁
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
