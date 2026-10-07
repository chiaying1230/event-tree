
/* ============ 啟動 ============ */
document.documentElement.lang = 'zh-Hant-TW';
// 所有換展區的連結（頁首、目錄、上一頁／下一頁）
document.addEventListener('click', e=>{
  if(e.target.closest('[data-act="tour"]')) return startTour(page);
  let el;
  if((el = e.target.closest('[data-act="era-clear"]'))){ eraFocus = null; render(); const h = $('#pageTitle'); if(h) h.focus({preventScroll:true}); return; }
  // 回到時間軸的年代摘要
  if((el = e.target.closest('[data-act="to-hub"]'))){ e.preventDefault(); tSel = tTerm = null; tEra = +el.dataset.era; tList = false; go('tree', undefined, {quiet:true}); if(!$('#panel')) revealSelected();
    const h = $('#panel h2')||$('#sheetBody h2'); if(h){ try{ h.focus({preventScroll:true}); }catch(err){} } return; }
  const a = e.target.closest('[data-go]'); if(!a) return;
  e.preventDefault(); go(a.dataset.go, a.dataset.how);
});
document.addEventListener('keydown', e=>{
  // 圖裡的按鈕（事件、年代、圓圈圖的格子、交叉點）：Enter 或空白鍵等於點一下
  if((e.key==='Enter' || e.key===' ') && e.target instanceof SVGElement && e.target.getAttribute('role')==='button'){
    e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})); return; }
  if(e.key!=='Escape') return;
  if(page==='tree' && tAny()){ const id = tSel; tlClear(); render(); const el = id && $('#view [data-id="'+id+'"]'); if(el){ try{ el.focus({preventScroll:true}); }catch(err){} } }
  else if(page==='news' && newsCat){ newsCat = null; render(); }
});
$('#skipMain').addEventListener('click', e=>{ e.preventDefault(); const h = $('#pageTitle')||$('#heroTitle'); if(h) h.focus(); });
{ const h = (location.hash||'').slice(1); if(SECTIONS[h]) page = h; }
try{ window.history.scrollRestoration = 'manual'; }catch(e){}
render();
// 瀏覽器的返回／前進，或直接改網址上的 #展區
const fromUrl = h => { h = h||'home'; if(SECTIONS[h] && h!==page) go(h, undefined, {hist:true}); };
if(GAS){
  // Apps Script：網址上的 #展區 要向外層詢問；中鍵開新分頁會開到內框自己的網址，所以擋掉
  try{
    google.script.url.getLocation(loc=>{ gasReady = true; const h = (loc && loc.hash)||''; if(SECTIONS[h] && h!==page) go(h, undefined, {hist:true}); else autoTour(); });
  }catch(e){ gasReady = true; autoTour(); }
  try{ google.script.history.setChangeHandler(e=>fromUrl(e && e.location && e.location.hash)); }catch(e){}
  document.addEventListener('auxclick', e=>{ if(e.target.closest && e.target.closest('[data-go]')) e.preventDefault(); });
} else { setUrl(page, false); autoTour(); }
window.addEventListener('popstate', ()=>fromUrl((location.hash||'').slice(1)));
window.addEventListener('hashchange', ()=>fromUrl((location.hash||'').slice(1)));
// 視窗改變大小：圖表依新的寬度重畫；樹狀圖還要配合高度
let rT, rW = vw(), rH = window.innerHeight;
window.addEventListener('resize', ()=>{ clearTimeout(rT); rT = setTimeout(()=>{
  const w = vw(), h = window.innerHeight; if(w===rW && h===rH) return; const wChanged = w!==rW; rW = w; rH = h;
  if(page==='tree'){ if(wChanged || (TL && TL.mode==='tree' && !tList)) render(); }
  else if(page==='photos') fitShow();
  else if(wChanged){ if(page==='news') render(); else fillCharts(); }
  syncMast();
}, 140); });
