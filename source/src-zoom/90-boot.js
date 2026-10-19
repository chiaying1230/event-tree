/* ============ 啟動 ============ */
$('#pageLead').textContent = EV.length+' 件事件（重大事件、剪報、研究、學生人數）畫在同一條時間軸上，放大會寫出更多事件。按住 Ctrl（Mac 為 ⌘）滾動滾輪、拖曳，或用下方的按鈕與滑桿都可以縮放。點一件事，下方會出現它的介紹。';
$('#skipMain').addEventListener('click', e=>{ e.preventDefault(); const t = $('#zFig [tabindex="0"]')||$('#zArea'); t.focus(); reveal($('#zArea'), 'top'); });
readUrl();
render({focus:false});
if(S.e){ const c = $('#card .ecard'); if(c) reveal($('#zArea'), 'top'); }
