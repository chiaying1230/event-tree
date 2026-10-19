/* ============ 啟動 ============ */
$('#pageLead').textContent = '同一份 '+EV.length+' 件事件（重大事件、剪報、研究、學生人數，附照片與訪談節選），用不同的時間軸畫法呈現。上方的分頁可以切換版本，每個版本都寫了它來自研究報告的哪一節、適合什麼情境。';
document.documentElement.classList.toggle('calm', calm());
$('#skipMain').addEventListener('click', e=>{ e.preventDefault(); view.focus(); });
readUrl();
render({focus:false});
if(S.e){ const el = $('#vpanel [data-id="'+S.e+'"]'); if(el) reveal(el); }
