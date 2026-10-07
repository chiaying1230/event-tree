
/* ============ 共用：工具、提示框、展區切換 ============ */
const $ = (s,r) => (r||document).querySelector(s);
const $$ = (s,r) => Array.from((r||document).querySelectorAll(s));
const esc = s => String(s??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const view = $('#view'), tipEl = $('#tip'), heroEl = $('#hero'), mastEl = $('#mast');
const vw = () => document.documentElement.clientWidth;
// 頁首下緣在畫面上的位置，以及手機上下系統列占的高度（一般螢幕是 0）
const mastBottom = () => Math.round(mastEl.getBoundingClientRect().bottom);
const safeTop = () => parseFloat(getComputedStyle(mastEl).paddingTop)||0;
const safeBottom = () => { const el = document.getElementById('safeB'); return el ? el.offsetHeight : 0; };
const calm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// 粗估一段文字畫出來有多寬：中文字算一個字寬，英數字大約半個多一點
const textW = (s,fs) => [...String(s)].reduce((a,ch)=>a+(ch.charCodeAt(0)<256 ? (ch===' '?.3:.58) : 1)*fs, 0);

const SITE = '智能障礙事件樹';
// 是不是發布在 Google Apps Script 的網頁應用程式裡（頁面會被放在一個內框中，網址上的 #展區 要透過 google.script 讀寫）
const GAS = typeof google!=='undefined' && !!(google.script && google.script.history && google.script.url);
let gasReady = false;          // 先讀完網址上原本的 #展區，才開始改寫網址
const NAV = [['home','導覽'],['tree','時間軸'],['people','人數'],['research','研究'],['news','剪報'],['photos','照片'],['audio','訪談'],['about','關於']];
const GROUP = {list:'news'};          // 子頁屬於哪一個展區
const SECTIONS = {
  home:{name:'導覽'},
  tree:{no:'01', name:'時間軸', title:'時間軸：重大事件'},
  people:{no:'02', name:'人數', title:'學生人數', lead:'各障別的特教學生人數，以及衛福部的智能障礙總人數。'},
  research:{no:'03', name:'研究', title:'研究文獻', lead:LIT.length+' 篇學術文獻的編碼結果：研究設計、研究主題、權利議題與輔助科技、使用的名詞。'},
  news:{no:'04', name:'剪報・編碼分析', title:'剪報：編碼分析', lead:NEWS.length+' 篇報紙新聞（'+NEWS[0].y+'–'+NEWS[NEWS.length-1].y+' 年）的編碼結果，依年代畫成圓圈圖。'},
  list:{no:'04', name:'剪報・清單', title:'剪報：清單', lead:NEWS.length+' 篇剪報的清單，可以用關鍵字、年代與報別篩選。標題取自整理時的檔名。'},
  photos:{no:'05', name:'照片', title:'照片', lead:'照片依年代排序，以投影片的方式一張一張播放。可以按左右鍵或左右滑動換張，也可以開啟自動播放。'},
  audio:{no:'06', name:'訪談', title:'訪談', lead:'每段訪談可以播放錄音；逐字稿會跟著播放位置標示，也可以點時間跳到那一段。'},
  about:{name:'關於', title:'關於本站', lead:'計畫資訊、資料來源與整理方式、圖表閱讀方式與無障礙說明。'}
};
// 剪報展區有兩種看法：圓圈圖（編碼分析）與清單
const CLIP_TABS = [['news','編碼分析','各年代的圓圈圖'],['list','清單',NEWS.length+' 篇，可以搜尋']];
let page = 'home';
const DRAW = {};          // 各展區的繪製函式，由後面的檔案填入
const LEAVE = [];         // 離開展區時要做的事（停止播放等）

// 展區的標題區：小標、標題、一句說明，以及展區裡的子頁籤
function pageHead(p,o){
  o = o||{}; const S = SECTIONS[p];
  const tabs = o.tabs ? `<nav class="subnav" aria-label="這個展區的內容">${o.tabs.map(t=>`<a href="#${t[0]}" data-go="${t[0]}" data-how="sub"${t[0]===p?' aria-current="page"':''}><b>${t[1]}</b>${t[2]?`<small>${t[2]}</small>`:''}</a>`).join('')}</nav>` : '';
  return `<header class="ph">
    <p class="ph-over"><span class="ph-site">${SITE}</span>${S.no?`<span class="ph-no">展區 ${S.no}</span>`:''}</p>
    <div class="ph-row"><h1 id="pageTitle" tabindex="-1">${esc(S.title)}</h1><div class="ph-tools">${o.tools||''}${TOURS[p]?'<button class="btn how" id="howBtn" data-act="tour" aria-haspopup="dialog">怎麼看</button>':''}</div></div>
    <p class="ph-lead">${esc(o.lead||S.lead||'')}</p>
  </header>${tabs}`;
}
// 每一頁最下面的「上一頁／下一頁」，照展區的順序走
function routeHtml(){
  const i = NAV.findIndex(n=>n[0]===(GROUP[page]||page)), prev = NAV[i-1], next = NAV[i+1];
  const a = (n,cls,lab) => n ? `<a class="rt ${cls}" href="#${n[0]}" data-go="${n[0]}"><small>${lab}</small><b>${n[1]}</b></a>` : '<span></span>';
  return `<nav class="route" aria-label="上一頁與下一頁">${a(prev,'prev','上一頁')}${a(next,'next','下一頁')}</nav>`;
}
function drawNav(){
  const g = GROUP[page]||page;
  $('#nav').innerHTML = NAV.map(n=>`<a href="#${n[0]}" data-go="${n[0]}"${g===n[0]?' aria-current="page"':''}>${n[1]}</a>`).join('');
}

/* 圖表要知道自己有多寬才能畫：先放一個空格子，等版面排好再依寬度畫進去；視窗改變大小時重畫 */
const CH = {};
function chart(id,fn,cls){ CH[id] = fn; return `<div class="chart${cls?' '+cls:''}" data-ch="${id}"></div>`; }
function fillCharts(root){
  $$('.chart[data-ch]', root||document).forEach(el=>{ const fn = CH[el.dataset.ch], w = Math.floor(el.clientWidth); if(fn && w>0){ el.innerHTML = fn(w); el.dataset.w = w; } });
}

/* 重新繪製後把鍵盤焦點放回原本的元素，避免焦點跑回頁首 */
const FOCUS_ATTRS = ['data-branch','data-id','data-cat','data-pick','data-step','data-dim','data-region','data-term','data-era','data-jump','data-pager','data-act','data-go'];
function focusKey(){
  const a = document.activeElement; if(!a || a===document.body) return null;
  if(a.id) return {id:a.id};
  for(const at of FOCUS_ATTRS){ const el = a.closest('['+at+']'); if(el) return {at, v:el.getAttribute(at), zone:el.closest('#panel')?'#panel ':el.closest('#sheet')?'#sheet ':el.closest('#view')?'#view ':''}; }
  return null;
}
let quietFocus = false;          // 重新繪製後把焦點放回原處時，不要再跳出一次提示框
function restoreFocus(k){
  if(!k) return; let el;
  if(k.id) el = document.getElementById(k.id);
  else el = $$(k.zone+'['+k.at+'="'+String(k.v).replace(/["\\]/g,'\\$&')+'"]').find(x=>x.matches('a,button,input,select,[tabindex]'));
  if(el && el!==document.activeElement){ quietFocus = true; try{ el.focus({preventScroll:true}); }catch(e){} quietFocus = false; }
}

function render(){
  const fk = focusKey();
  drawNav();
  document.body.dataset.view = page;
  heroEl.hidden = page!=='home'; if(page!=='home') heroEl.innerHTML = '';
  DRAW[page]();
  fillCharts();
  document.title = (page==='home' ? '' : SECTIONS[page].name+'｜')+SITE;
  restoreFocus(fk); syncMast();
}
// 網址：每個展區有自己的網址（#tree、#news…）。獨立的網站上，換展區會留下一筆紀錄，瀏覽器的「返回」可以回到上一個展區；
// 被放在別的網頁裡（內框）時只改寫目前這一筆，不去動外層網頁的返回鍵
const EMBED = (()=>{ try{ return window.top!==window; }catch(e){ return true; } })();
const urlFor = p => p==='home' ? location.pathname+location.search : '#'+p;
function setUrl(p, push){
  try{
    if(GAS){ if(gasReady) google.script.history[push?'push':'replace'](null, null, p==='home' ? '' : p); }
    else if(push && !EMBED) window.history.pushState({p}, '', urlFor(p));
    else window.history.replaceState({p}, '', urlFor(p));
  }catch(e){}
}
// 年代互連：從時間軸的年代摘要連到人數或研究時，把那個年代標出來；之後換到別的展區就取消
let eraFocus = null, pendingEra = null;
function goEra(p,d){ pendingEra = d; go(p, undefined, {quiet:true}); }
function focusChip(){
  return eraFocus==null ? '' : `<p class="focus"><span class="fchip">標出 ${eraFocus}年代<button data-act="era-clear" aria-label="取消標出 ${eraFocus}年代">×</button></span><a href="#tree" data-act="to-hub" data-era="${eraFocus}">在時間軸上看這十年</a></p>`;
}
const eraBand = ys => { if(eraFocus==null) return null; const ix = ys.map((y,i)=>decadeOf(y)===eraFocus ? i : -1).filter(i=>i>=0); return ix.length ? [ix[0], ix[ix.length-1]] : null; };
// how：'sub'＝在展區裡換子頁（焦點留在頁籤上）；其他＝換展區（焦點移到標題）
// o.hist：是瀏覽器的返回／前進帶來的，網址已經換好了　o.quiet：這一次不要自動跳出導覽
function go(p,how,o){
  o = o||{};
  if(!SECTIONS[p]) p = 'home';
  if(tour) endTour();
  eraFocus = pendingEra; pendingEra = null;
  LEAVE.forEach(fn=>fn()); closeSheet(true); hideTip();
  const changed = p!==page; page = p; render();
  if(!o.hist) setUrl(p, changed);
  window.scrollTo(0,0);
  view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter');
  const t = how==='sub' ? $('.subnav [aria-current="page"]') : ($('#pageTitle')||$('#heroTitle'));
  if(t){ try{ t.focus({preventScroll:true}); }catch(e){} }
  if(!o.quiet) autoTour();
}
// 首頁：頁首疊在主視覺上；捲過主視覺之後換回一般的底色
function syncMast(){ const over = page==='home' && window.scrollY < heroEl.offsetHeight-mastEl.offsetHeight-4; mastEl.classList.toggle('over', over); setBarColor(over); }
window.addEventListener('scroll', syncMast, {passive:true});
// 手機瀏覽器上方工具列的顏色，跟著頁首的底色走（頁面裡沒有 theme-color 的設定時，這一段不做事）
const barMeta = $$('meta[name="theme-color"]'); let barOver = null;
function setBarColor(over){
  if(over===barOver || !barMeta.length) return; barOver = over;
  const c = getComputedStyle(document.documentElement).getPropertyValue(over ? '--hero-bg' : '--paper').trim();
  if(c) barMeta.forEach(m=>{ m.removeAttribute('media'); m.setAttribute('content', c); });
}
try{ window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ()=>{ barOver = null; syncMast(); }); }catch(e){}

/* ============ 新手導覽 ============
   每個展區第一次進來時，用幾個步驟說明怎麼看；之後可以按標題旁的「怎麼看」重看。
   看過哪些展區記在瀏覽器裡（記不住也沒關係，只是下次會再出現一次） */
const TOURS = {};
const tourEl = $('#tour'), tourSeen = {};
let tour = null;
const seenTour = p => { if(tourSeen[p]) return true; try{ return localStorage.getItem('idtree.tour.'+p)==='1'; }catch(e){ return false; } };
function markTour(p){ tourSeen[p] = 1; try{ localStorage.setItem('idtree.tour.'+p,'1'); }catch(e){} }
const toursOff = () => { if(tourSeen['*']) return true; try{ return localStorage.getItem('idtree.tour.off')==='1'; }catch(e){ return false; } };
function autoTour(){ const p = page; if(TOURS[p] && !seenTour(p) && !toursOff()) setTimeout(()=>{ if(!tour && page===p) startTour(p); }, 450); }
function startTour(p){
  const all = typeof TOURS[p]==='function' ? TOURS[p]() : TOURS[p]; if(!all) return;
  const steps = all.filter(s=>!s.sel || $(s.sel)); if(!steps.length) return;
  closeSheet(true); hideTip();
  tour = {p, steps, i:0, back:document.activeElement}; tourEl.hidden = false; $('#tourOff').hidden = toursOff(); showTourStep();
}
function showTourStep(){
  const s = tour.steps[tour.i], n = tour.steps.length, el = s.sel ? $(s.sel) : null;
  $('#tourStep').textContent = (tour.i+1)+' / '+n; $('#tourTitle').textContent = s.title; $('#tourText').textContent = s.text;
  $('#tourPrev').hidden = tour.i===0; $('#tourNext').textContent = tour.i===n-1 ? '知道了' : '下一步';
  if(el){ const r = el.getBoundingClientRect(); if(r.top<mastBottom()+8 || r.bottom>window.innerHeight-8) el.scrollIntoView({block: r.height>window.innerHeight*.7 ? 'start' : 'center'}); }
  placeTour(); try{ $('#tourNext').focus({preventScroll:true}); }catch(e){}
}
// 把要說明的地方框起來，說明的卡片放在它旁邊放得下的位置
function placeTour(){
  if(!tour) return;
  const s = tour.steps[tour.i], el = s.sel ? $(s.sel) : null, hole = $('#tourHole'), card = $('#tourCard'), W = vw(), H = window.innerHeight, cw = card.offsetWidth, ch = card.offsetHeight;
  if(!el){ hole.style.cssText = 'left:50%;top:50%;width:0;height:0'; card.style.left = Math.round((W-cw)/2)+'px'; card.style.top = Math.round((H-ch)/2)+'px'; return; }
  const b = el.getBoundingClientRect(), r = {l:Math.max(4,b.left-6), t:Math.max(4,b.top-6), r:Math.min(W-4,b.right+6), b:Math.min(H-4,b.bottom+6)};
  hole.style.cssText = `left:${r.l}px;top:${r.t}px;width:${Math.max(0,r.r-r.l)}px;height:${Math.max(0,r.b-r.t)}px`;
  const g = 14, lo = safeTop()+12, hi = H-ch-12-safeBottom(), cx = v => Math.min(Math.max(v,12), W-cw-12), cy = v => Math.min(Math.max(v,lo), Math.max(lo,hi)); let x, y;
  if(W>=900 && W-r.r>=cw+g+12){ x = r.r+g; y = cy(r.t); }
  else if(W>=900 && r.l>=cw+g+12){ x = r.l-g-cw; y = cy(r.t); }
  else if(H-safeBottom()-r.b>=ch+g+12){ x = cx((r.l+r.r)/2-cw/2); y = r.b+g; }
  else if(r.t-safeTop()>=ch+g+12){ x = cx((r.l+r.r)/2-cw/2); y = r.t-g-ch; }
  else { x = cx((r.l+r.r)/2-cw/2); y = (r.t+r.b)/2<H/2 ? Math.max(lo,hi) : mastBottom()+10; }
  card.style.left = Math.round(x)+'px'; card.style.top = Math.round(y)+'px';
}
function endTour(){
  if(!tour) return; const t = tour; tour = null; tourEl.hidden = true; markTour(t.p);
  const b = $('#howBtn')||t.back; if(b && document.contains(b)){ try{ b.focus({preventScroll:true}); }catch(e){} }
}
tourEl.addEventListener('click', e=>{
  if(!tour) return;
  if(e.target.closest('#tourNext')){ if(tour.i<tour.steps.length-1){ tour.i++; showTourStep(); } else endTour(); }
  else if(e.target.closest('#tourPrev')){ if(tour.i>0){ tour.i--; showTourStep(); } }
  else if(e.target.closest('#tourSkip')) endTour();
  else if(e.target.closest('#tourOff')){ tourSeen['*'] = 1; try{ localStorage.setItem('idtree.tour.off','1'); }catch(err){} endTour(); }
});
document.addEventListener('keydown', e=>{
  if(!tour) return;
  if(e.key==='Escape'){ e.preventDefault(); e.stopPropagation(); endTour(); return; }
  if(e.key==='Tab'){ const f = $$('button:not([hidden])', $('#tourCard')), i = f.indexOf(document.activeElement); e.preventDefault(); f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus(); }
}, true);
window.addEventListener('scroll', ()=>{ if(tour) placeTour(); }, {passive:true});
window.addEventListener('resize', ()=>{ if(tour) placeTour(); });

/* ============ 手機上的說明：從畫面下方滑出來的一張紙 ============ */
const sheet = $('#sheet'); let sheetClosed = null;
function openSheet(html, onClose){
  $('#sheetBody').innerHTML = html; sheetClosed = onClose||null;
  if(sheet.hidden){ sheet.hidden = false; void sheet.offsetWidth; sheet.classList.add('open'); document.body.classList.add('has-sheet'); document.documentElement.classList.add('has-sheet'); }
}
function closeSheet(silent){
  if(sheet.hidden) return;
  sheet.classList.remove('open'); sheet.hidden = true; document.body.classList.remove('has-sheet'); document.documentElement.classList.remove('has-sheet');
  const fn = sheetClosed; sheetClosed = null; if(!silent && fn) fn();
}

/* ============ 提示框（滑鼠移上去、手指點一下或鍵盤聚焦時顯示數字） ============ */
function tipAt(text,x,y){
  const lines = String(text).split('\n');
  tipEl.replaceChildren();
  const b = document.createElement('b'); b.textContent = lines[0]; tipEl.appendChild(b);
  lines.slice(1).forEach(l=>{ const d = document.createElement('div'); d.textContent = l; tipEl.appendChild(d); });
  tipEl.hidden = false;
  const r = tipEl.getBoundingClientRect(), w = vw(), h = window.innerHeight;
  let left = x+14, top = y+16;
  if(left+r.width>w-8) left = Math.max(8, x-r.width-14);
  if(top+r.height>h-8) top = Math.max(8, y-r.height-14);
  tipEl.style.left = left+'px'; tipEl.style.top = top+'px';
}
function hideTip(){ tipEl.hidden = true; $$('.xh').forEach(l=>l.setAttribute('visibility','hidden')); }
function tipFromEvent(e){
  const t = e.target; if(!t || !t.closest) return hideTip();
  if(t.closest('.xmark')) return hideTip();
  const lc = t.closest('svg.lc'); if(lc) return lineHover(lc,e);
  const el = t.closest('[data-tip]');
  if(el){ $$('.xh').forEach(l=>l.setAttribute('visibility','hidden')); tipAt(el.getAttribute('data-tip'), e.clientX, e.clientY); } else hideTip();
}
document.addEventListener('pointermove', tipFromEvent);
document.addEventListener('pointerdown', tipFromEvent);
document.addEventListener('focusin', e=>{ if(quietFocus) return; const el = e.target.closest && e.target.closest('[data-tip]'); if(el){ const r = el.getBoundingClientRect(); tipAt(el.getAttribute('data-tip'), r.left+r.width/2, r.top+r.height/2); } });
document.addEventListener('focusout', hideTip);
window.addEventListener('scroll', hideTip, true);

/* 左右滑：照片換張、圓圈圖換年代。回傳 -1（往右滑，上一個）或 1（往左滑，下一個） */
function onSwipe(sel, fn){
  let s = null;
  document.addEventListener('touchstart', e=>{ const el = e.target.closest && e.target.closest(sel); s = (el && e.touches.length===1) ? {x:e.touches[0].clientX, y:e.touches[0].clientY, el} : null; }, {passive:true});
  document.addEventListener('touchend', e=>{ if(!s) return; const t = e.changedTouches[0], dx = t.clientX-s.x, dy = t.clientY-s.y, el = s.el; s = null;
    if(Math.abs(dx)>44 && Math.abs(dx)>Math.abs(dy)*1.5) fn(dx<0?1:-1, el); }, {passive:true});
}
