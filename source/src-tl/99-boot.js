/* ============ 啟動 ============ */
if(SOLO){
  $('#pageTitle').textContent = '智能障礙事件：可縮放時間軸'; $('.mast-sub').textContent = '可縮放時間軸'; $('#vtabs').hidden = true;
  $('#pageLead').textContent = EV.length+' 件事件（重大事件、剪報、研究、學生人數）畫在同一條時間軸上。放大會寫出更多事件；按住 Ctrl（Mac 為 ⌘）滾動滾輪、拖曳，或用下方的按鈕與滑桿都可以。';
} else $('#pageLead').textContent = '同一份 '+EV.length+' 件事件（重大事件、剪報、研究、學生人數，附照片與訪談節選），用不同的時間軸畫法呈現。上方的分頁可以切換版本，每個版本都寫了它來自研究報告的哪一節、適合什麼情境。';
document.documentElement.classList.toggle('calm', calm());
$('#skipMain').addEventListener('click', e=>{ e.preventDefault(); view.focus(); });
readUrl();
render({focus:false});
if(S.e){ const el = $('#vpanel [data-id="'+S.e+'"]'); if(el) reveal(el); }
