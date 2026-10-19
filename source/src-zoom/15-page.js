/* ============ 頁面：狀態、網址、工具列、重畫 ============
   這一頁只有一條可縮放的時間軸，下方是選到的那件事的介紹卡。不連到其他頁面。
   網址：?e=事件&tracks=軌道&from=年&to=年，可以分享；設定（易讀版、大字、減少動態）記在瀏覽器裡。 */
const S = {e:null, tracks:new Set(TK)};
const shown = () => EV.filter(e=>S.tracks.has(e.track));
const allTracks = () => S.tracks.size===TK.length;
const mastEl = $('#mast'), tipEl = $('#tip');
const mastBottom = () => Math.round(mastEl.getBoundingClientRect().bottom);
// 設定：記不住也沒關係，照預設值顯示
const pref = (k,d) => { try{ const v = localStorage.getItem('idtree.zoom.'+k); return v==null ? d : v==='1'; }catch(e){ return d; } };
const setPref = (k,v) => { try{ localStorage.setItem('idtree.zoom.'+k, v?'1':'0'); }catch(e){} };
let easyOn = pref('easy', true), big = pref('big', false);

function readUrl(){
  const q = new URLSearchParams(location.search);
  S.e = byId[q.get('e')] ? q.get('e') : null;
  const t = (q.get('tracks')||'').split(',').filter(k=>TRACKS[k]);
  S.tracks = new Set(t.length ? t : TK);
  if(S.e && !S.tracks.has(byId[S.e].track)) S.tracks.add(byId[S.e].track);
  zUrlIn(q);
}
function writeUrl(){
  const q = new URLSearchParams();
  if(S.e) q.set('e', S.e); if(!allTracks()) q.set('tracks', TK.filter(k=>S.tracks.has(k)).join(','));
  Object.entries(zUrlOut()).forEach(([k,v])=>q.set(k,v));
  const qs = q.toString();
  try{ window.history.replaceState(null, '', location.pathname+(qs?'?'+qs:'')); }catch(e){}
}
function toolsHtml(){
  return `<div class="tl-filter" role="group" aria-label="要看哪幾條軌道">
      <span class="lbl" aria-hidden="true">軌道</span>
      ${TK.map(k=>`<button class="bchip" data-track="${k}" aria-pressed="${S.tracks.has(k)}" style="--c:${colorOf(k)}">${icon(k,!S.tracks.has(k))}${esc(TRACKS[k].name)}</button>`).join('')}
      <button class="bchip all" data-track="all" aria-pressed="${allTracks()}">全部</button>
    </div>
    <div class="tl-filter">
      <form class="jumpf" id="jumpF"><label for="jumpY">跳到年份</label><input id="jumpY" type="number" inputmode="numeric" min="${AX0}" max="${AX1-1}" placeholder="例如 1990" autocomplete="off"><button class="btn" type="submit">跳到</button></form>
      <span class="sep" aria-hidden="true"></span>
      <button class="btn" data-act="easy" aria-pressed="${easyOn}">易讀版</button>
      <button class="btn" data-act="big" aria-pressed="${big}"><span class="big-a" aria-hidden="true">大</span>大字</button>
      <button class="btn" data-act="calm" aria-pressed="${calm()}">減少動態</button>
    </div>`;
}
/* ---------- 重畫：畫完把鍵盤焦點放回原本的元素 ---------- */
function focusKey(){
  const a = document.activeElement; if(!a || a===document.body) return null;
  if(a.id) return '#'+a.id;
  for(const at of ['data-id','data-track','data-act','data-zoom','data-cluster']){ const el = a.closest('['+at+']');
    if(el) return (el.closest('#card') ? '#card ' : el.closest('#zArea') ? '#zArea ' : '#tools ')+'['+at+'="'+String(el.getAttribute(at)).replace(/["\\]/g,'\\$&')+'"]'; }
  return null;
}
function restoreFocus(k){ if(!k) return; let el; try{ el = $$(k).find(x=>x.matches('a,button,input,select,summary,[tabindex]')); }catch(e){} if(el && el!==document.activeElement){ try{ el.focus({preventScroll:true}); }catch(e){} } }
function render(o){
  o = o||{};
  const fk = o.focus===false ? null : focusKey(), area = $('#zArea'), sy = window.scrollY;
  document.documentElement.classList.toggle('big', big);
  document.documentElement.classList.toggle('calm', calm());
  $('#tools').innerHTML = toolsHtml();
  // 重畫時先撐住原本的高度，頁面才不會在內容清空的一瞬間變短、把捲動位置拉回上面
  area.style.minHeight = area.offsetHeight+'px';
  zDraw(area);
  area.style.minHeight = '';
  $('#card').innerHTML = cardHtml();
  restoreFocus(fk);
  // 重畫的過程中頁面可能短暫變短，瀏覽器會把捲動位置往上拉；畫完放回原處，時間軸才不會跑掉
  if(window.scrollY!==sy) window.scrollTo(0, sy);
}
const say = t => { const s = $('#status'); s.textContent = ''; setTimeout(()=>{ s.textContent = t; }, 60); };
// 把元素捲到看得到的地方，不被固定的頁首遮住（2.4.11）
function reveal(el, where){
  const r = el.getBoundingClientRect(), top = mastBottom()+12, bot = window.innerHeight-12;
  if(r.top<top || r.bottom>bot) window.scrollTo({top:Math.max(0, window.scrollY+r.top-top-(where==='top' ? 0 : Math.max(0,(bot-top-r.height)/2))), behavior:calm()?'auto':'smooth'});
}
// 選一件事。o.key：用鍵盤選的，焦點移到介紹卡的標題；用滑鼠選的，畫面不捲動，時間軸留在原處
function select(id, o){
  o = o||{};
  S.e = id||null; writeUrl(); render();
  if(!S.e) return;
  const c = $('#card .ecard'); if(!c) return;
  if(o.key){ const h = $('#card h2'); if(h){ try{ h.focus({preventScroll:true}); }catch(e){} } reveal(c, 'top'); }
}
function unselect(){ const id = S.e; select(null); const el = id && $('#zFig [data-id="'+id+'"]'); if(el){ $$('#zFig [data-x]').forEach(x=>x.setAttribute('tabindex', x===el?'0':'-1')); try{ el.focus({preventScroll:true}); }catch(e){} } }

/* ---------- 事件處理 ---------- */
document.addEventListener('click', e=>{
  const t = e.target; let el;
  if((el = t.closest('[data-track]'))){ const k = el.dataset.track;
    if(k==='all') S.tracks = new Set(allTracks() ? [] : TK);
    else { S.tracks.has(k) ? S.tracks.delete(k) : S.tracks.add(k); }
    if(!S.tracks.size) S.tracks = new Set(TK);
    if(S.e && !S.tracks.has(byId[S.e].track)) S.e = null;
    writeUrl(); render(); say('顯示 '+shown().length+' 件事件'); return; }
  if((el = t.closest('[data-act]'))){ const a = el.dataset.act;
    if(a==='easy'){ easyOn = !easyOn; setPref('easy', easyOn); render(); say(easyOn ? '介紹卡先顯示易讀版' : '介紹卡直接顯示完整說明'); return; }
    if(a==='big'){ big = !big; setPref('big', big); render(); say(big ? '大字' : '一般字級'); return; }
    if(a==='calm'){ calmPick = !calm(); try{ localStorage.setItem('idtree.tl.calm', calmPick?'1':'0'); }catch(err){} render(); return; }
    if(a==='close') return unselect();
    return; }
  if((el = t.closest('#zFig [data-id]'))){
    // 再點一次同一件：收起介紹
    if(S.e===el.dataset.id) return unselect();
    return select(el.dataset.id, {key:e.detail===0});          // 鍵盤（Enter、空白鍵）觸發的 click，detail 是 0
  }
});
document.addEventListener('submit', e=>{
  if(e.target.id!=='jumpF') return; e.preventDefault();
  const y = parseInt($('#jumpY').value,10);
  if(!(y>=AX0 && y<AX1)){ say('請輸入 '+AX0+' 到 '+(AX1-1)+' 之間的年份'); return; }
  const target = shown().find(x=>x.y>=y) || shown()[shown().length-1];
  if(!target) return;
  zJump(y); select(target.id);
  say(y+' 年起的第一件事：'+whenLong(target)+'，'+target.title);
  const el = $('#zFig [data-id="'+target.id+'"]'); if(el){ $$('#zFig [data-x]').forEach(x=>x.setAttribute('tabindex', x===el?'0':'-1')); try{ el.focus({preventScroll:true}); }catch(err){} }
});
document.addEventListener('keydown', e=>{
  const t = e.target;
  // 圖裡的按鈕：Enter 或空白鍵等於點一下
  if((e.key==='Enter' || e.key===' ') && t instanceof SVGElement && t.getAttribute('role')==='button'){ e.preventDefault(); t.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})); return; }
  if(t.closest && t.closest('#zFig') && zKey(e)===true){ e.preventDefault(); return; }
  if(e.key==='Escape' && S.e){ e.preventDefault(); hideTip(); unselect(); }
});

/* ---------- 提示框：滑鼠移上去或鍵盤聚焦時顯示 ---------- */
function tipAt(text,x,y){
  const lines = String(text).split('\n'); tipEl.replaceChildren();
  const b = document.createElement('b'); b.textContent = lines[0]; tipEl.appendChild(b);
  lines.slice(1).forEach(l=>{ const d = document.createElement('div'); d.textContent = l; tipEl.appendChild(d); });
  tipEl.hidden = false;
  const r = tipEl.getBoundingClientRect(), w = vw(), h = window.innerHeight; let left = x+14, top = y+16;
  if(left+r.width>w-8) left = Math.max(8, x-r.width-14); if(top+r.height>h-8) top = Math.max(8, y-r.height-14);
  tipEl.style.left = left+'px'; tipEl.style.top = top+'px';
}
const hideTip = () => { tipEl.hidden = true; };
document.addEventListener('pointermove', e=>{ const el = e.target.closest && e.target.closest('[data-tip]'); el && !zDrag ? tipAt(el.getAttribute('data-tip'), e.clientX, e.clientY) : hideTip(); });
document.addEventListener('focusin', e=>{ const el = e.target.closest && e.target.closest('[data-tip]'); if(el){ const r = el.getBoundingClientRect(); tipAt(el.getAttribute('data-tip'), r.left+r.width/2, r.bottom); } else hideTip(); });
document.addEventListener('focusout', hideTip);
window.addEventListener('scroll', hideTip, true);
let rT, rW = vw();
window.addEventListener('resize', ()=>{ clearTimeout(rT); rT = setTimeout(()=>{ if(vw()!==rW){ rW = vw(); render(); } }, 140); });
