/* ============ 版本切換、篩選、網址、事件說明 ============
   每個版本用 VERS.push({...}) 登記：id、名稱、研究依據、適合的情境、取捨，以及 draw(root) 把版本畫進 root。
   panel:false 的版本自己在原處展開細節，不用右邊（手機是下方）的說明。 */
const VERS = [];
const S = {v:null, e:null, tracks:new Set(TK)};
const view = $('#vpanel'), wrapEl = $('#tlWrap'), sheet = $('#sheet'), tipEl = $('#tip'), mastEl = $('#mast');
const ver = () => VERS.find(x=>x.id===S.v) || VERS[0];
const shown = () => EV.filter(e=>S.tracks.has(e.track));
const allTracks = () => S.tracks.size===TK.length;
const mastBottom = () => Math.round(mastEl.getBoundingClientRect().bottom);

/* ---------- 網址：?v=版本&e=事件&tracks=軌道 ---------- */
function readUrl(){
  const q = new URLSearchParams(location.search);
  S.v = SOLO || (VERS.some(x=>x.id===q.get('v')) ? q.get('v') : VERS[0].id);
  if(ver().urlIn) ver().urlIn(q);
  S.e = byId[q.get('e')] ? q.get('e') : null;
  const t = (q.get('tracks')||'').split(',').filter(k=>TRACKS[k]);
  S.tracks = new Set(t.length ? t : TK);
  if(S.e && !S.tracks.has(byId[S.e].track)) S.tracks.add(byId[S.e].track);
}
function writeUrl(push){
  const q = new URLSearchParams();
  if(!SOLO) q.set('v', S.v); if(S.e) q.set('e', S.e);
  if(ver().urlOut) Object.entries(ver().urlOut()).forEach(([k,v])=>q.set(k,v)); if(!allTracks()) q.set('tracks', TK.filter(k=>S.tracks.has(k)).join(','));
  const url = location.pathname+'?'+q.toString()+location.hash;
  try{ window.history[push?'pushState':'replaceState'](null, '', url); }catch(e){}
}

/* ---------- 版本分頁列（左右鍵換分頁，Home／End 到頭尾） ---------- */
function tabsHtml(){
  if(SOLO) return '';
  return VERS.map((x,i)=>`<button role="tab" id="tab-${x.id}" data-v="${x.id}" aria-selected="${x.id===S.v}" aria-controls="vpanel" tabindex="${x.id===S.v?0:-1}"><small>${x.no||''}</small><b>${esc(x.name)}</b></button>`).join('');
}
// 版本說明：手機上預設收起來，時間軸才不會被推到很下面；打開後換版本也保持打開
const VI = {open:false};
function infoHtml(){
  const x = ver();
  if(SOLO) return `<details${VI.open ? ' open' : ''}><summary><h2>關於這個時間軸</h2><span class="lm">研究依據、怎麼操作</span></summary><dl>
    <div><dt>研究依據</dt><dd>${esc(x.basis)}</dd></div><div><dt>取捨</dt><dd>${esc(x.tradeoff)}</dd></div></dl><p class="vkeys"><b>操作：</b>${esc(x.keys)}</p><p class="vkeys"><a href="timelines.html?v=${x.id}">和其他時間軸版本比較</a></p></details>`;
  return `<details${vw()>=720 || VI.open ? ' open' : ''}><summary><h2>${esc(x.name)}</h2><span class="lm">研究依據、適合的情境與取捨</span></summary><dl>
    <div><dt>研究依據</dt><dd>${esc(x.basis)}</dd></div>
    <div><dt>適合</dt><dd>${esc(x.fit)}</dd></div>
    <div><dt>取捨</dt><dd>${esc(x.tradeoff)}</dd></div></dl>${x.keys ? `<p class="vkeys"><b>操作：</b>${esc(x.keys)}</p>` : ''}${x.solo ? `<p class="vkeys"><a href="${x.solo}">單獨開啟這個版本（畫面更大）</a></p>` : ''}</details>`;
}
/* ---------- 工具列：軌道篩選、跳到某一年、減少動態 ---------- */
function toolsHtml(){
  const x = ver();
  if(x.noTools) return '';
  return `<div class="tl-filter" role="group" aria-label="要看哪幾條軌道">
      <span class="lbl" aria-hidden="true">軌道</span>
      ${TK.map(k=>`<button class="bchip" data-track="${k}" aria-pressed="${S.tracks.has(k)}" style="--c:${colorOf(k)}">${icon(k,!S.tracks.has(k))}${esc(TRACKS[k].name)}</button>`).join('')}
      <button class="bchip all" data-track="all" aria-pressed="${allTracks()}">全部</button>
    </div>
    <div class="tl-filter">
      <form class="jumpf" id="jumpF"><label for="jumpY">跳到年份</label><input id="jumpY" type="number" inputmode="numeric" min="${AX0}" max="${AX1-1}" placeholder="例如 1990" autocomplete="off"><button class="btn" type="submit">跳到</button></form>
      <button class="btn" data-act="calm" aria-pressed="${calm()}">減少動態</button>
      <button class="btn" data-act="clear"${S.e?'':' hidden'}>清除選取</button>
    </div>`;
}

/* ---------- 事件說明 ---------- */
const clipHtml = i => { const a = NEWS[i]; return `<li class="clip"><b>${esc(a.t)}</b><span>${esc(a.o)}・<time datetime="${a.d}">${esc(a.d.replace(/-/g,'.'))}</time></span><span class="lm">用詞：${esc(a.wg.join('、')||'沒有編碼')}｜觀點：${esc(RAW.viewShort[a.v]||a.v||'沒有編碼')}</span></li>`; };
function mediaHtml(e){
  let h = '';
  const own = e.media.filter(m=>m.kind==='clip' && !m.rel), rel = e.media.filter(m=>m.kind==='clip' && m.rel);
  e.media.filter(m=>m.kind==='photo').forEach(m=>{ const p = m.ph;
    h += `<figure class="pn-photo"><img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy"><figcaption>${p.sample?'<span class="tag">示意</span>':''}${esc(p.title)}（${esc(p.year)}）。${esc(p.caption||'')}<small>${esc(p.credit||'')}</small></figcaption></figure>`; });
  if(own.length) h += `<div class="pn-rel"><h3>剪報</h3><ul class="evclips">${own.map(m=>clipHtml(m.i)).join('')}</ul></div>`;
  e.media.filter(m=>m.kind==='audio').forEach(m=>{ const a = m.iv;
    h += `<div class="pn-rel pn-iv"><h3>訪談節選${a.sample?'<span class="tag">示意</span>':''}</h3><p class="lm">${esc(a.title)}・${esc(a.who)}・${esc(a.date)}</p>
      <blockquote>${a.segs.slice(0,2).map(s=>`<p><b>${esc(s[1])}：</b>${esc(s[2])}</p>`).join('')}</blockquote></div>`; });
  if(rel.length) h += `<div class="pn-rel"><h3>同一年的政策類剪報</h3><ul class="evclips">${rel.map(m=>clipHtml(m.i)).join('')}</ul></div>`;
  return h;
}
function detailHtml(e, o){
  o = o||{};
  const VO = shown(), i = VO.indexOf(e), prev = VO[i-1], next = VO[i+1];
  const causes = e.parents.map(p=>byId[p]), effects = kidsOf(e);
  const jb = x => `<button class="jump" data-id="${x.id}" style="--c:${colorOf(x.track)}">${icon(x.track)}<span>${esc(x.title)}</span><small>${esc(whenShort(x))}</small></button>`;
  const H = o.h||'h2';
  return `<p class="pn-kind">${icon(e.track)}${esc(kindLabel(e))}</p>
    ${o.inline ? '' : `<${H} tabindex="-1">${esc(e.title)}</${H}><p class="pn-date">${timeTag(e)}</p>`}
    <div class="pn-desc">${e.summary.split('\n').map(s=>`<p>${esc(s)}</p>`).join('')}</div>
    ${e.memo ? `<div class="memo"><h3>備註</h3>${e.memo.split('\n').map(s=>`<p>${esc(s)}</p>`).join('')}</div>` : ''}
    ${mediaHtml(e)}
    ${causes.length ? `<div class="pn-rel"><h3>往前看</h3>${causes.map(jb).join('')}</div>` : ''}
    ${effects.length ? `<div class="pn-rel"><h3>往後看</h3>${effects.map(jb).join('')}</div>` : ''}
    <dl class="pn-meta"><div><dt>日期精確度</dt><dd>${PREC[e.precision]}${e.certainty==='approx'?'（約略）':''}</dd></div><div><dt>出處</dt><dd>${esc(e.source)}</dd></div>${e.why ? `<div><dt>挑選理由</dt><dd>${esc(e.why)}</dd></div>` : ''}</dl>
    ${o.inline ? '' : `<div class="pager"><button class="btn" data-id="${prev?prev.id:''}"${prev?'':' disabled'}>‹ 上一件</button><span>${i+1} / ${VO.length}</span><button class="btn" data-id="${next?next.id:''}"${next?'':' disabled'}>下一件 ›</button></div>`}`;
}
function introHtml(){
  const n = t => EV.filter(e=>e.type===t).length;
  return `<h2 tabindex="-1">50 件事件</h2><div class="pn-desc"><p>重大事件表的 ${n('event')} 件，加上從剪報（${n('news')} 件）、研究（${n('lit')} 件）與學生人數（${n('people')} 件）挑出的里程碑。每一件都寫了出處與挑選理由。</p><p>點任何一件事，這裡會顯示說明、剪報、照片與訪談節選。</p></div>
    <p class="pn-start"><button class="btn solid" data-id="${shown()[0] ? shown()[0].id : ''}">從最早的事件開始看</button></p>`;
}
const usesPanel = () => ver().panel!==false;
const widePanel = () => usesPanel() && vw()>=1040;
function drawPanel(){
  const p = $('#panel');
  if(p){ p.innerHTML = S.e ? detailHtml(byId[S.e]) : introHtml(); p.scrollTop = 0; closeSheet(true); return; }
  if(usesPanel() && S.e) openSheet(detailHtml(byId[S.e]));
  else closeSheet(true);
}
function openSheet(html){
  $('#sheetBody').innerHTML = html; $('#sheetBody').scrollTop = 0;
  if(sheet.hidden){ sheet.hidden = false; void sheet.offsetWidth; sheet.classList.add('open'); document.body.classList.add('has-sheet'); }
}
function closeSheet(){ if(sheet.hidden) return; sheet.classList.remove('open'); sheet.hidden = true; document.body.classList.remove('has-sheet'); }

/* ---------- 重畫：畫完把鍵盤焦點放回原本的元素 ---------- */
function focusKey(){
  const a = document.activeElement; if(!a || a===document.body) return null;
  if(a.id) return {sel:'#'+a.id};
  for(const at of ['data-id','data-track','data-v','data-act','data-sort','data-lane','data-zoom','data-cluster']){ const el = a.closest('['+at+']'); if(el){ const zone = ['#panel','#sheet','#vpanel','#tools','#vtabs'].find(z=>el.closest(z));
    return {sel:(zone ? zone+' ' : '')+'['+at+'="'+String(el.getAttribute(at)).replace(/["\\]/g,'\\$&')+'"]'}; } }
  return null;
}
function restoreFocus(k){ if(!k) return; let el; try{ el = $$(k.sel).find(x=>x.matches('a,button,input,select,summary,[tabindex]')); }catch(e){} if(el && el!==document.activeElement){ try{ el.focus({preventScroll:true}); }catch(e){} } }
function render(o){
  o = o||{};
  const fk = o.focus===false ? null : focusKey(), x = ver();
  $('#vtabs').innerHTML = tabsHtml();
  $('#vinfo').innerHTML = infoHtml();
  $('#tools').innerHTML = toolsHtml();
  const wide = widePanel();
  wrapEl.classList.toggle('wide', wide);
  const old = $('#panel'); if(old && !wide) old.remove();
  if(wide && !$('#panel')) wrapEl.insertAdjacentHTML('beforeend', '<aside class="panel plate" id="panel" aria-label="事件說明"></aside>');
  if(SOLO){ view.removeAttribute('role'); view.setAttribute('aria-label', '可縮放時間軸'); } else view.setAttribute('aria-labelledby', 'tab-'+x.id);
  view.className = 'tl-main v-'+x.id;
  // 重畫時先撐住原本的高度，頁面才不會在內容清空的一瞬間變短、把捲動位置拉回上面
  view.style.minHeight = view.offsetHeight+'px';
  x.draw(view);
  view.style.minHeight = '';
  drawPanel();
  document.title = SOLO ? '可縮放時間軸｜智能障礙事件樹' : x.name+'｜時間軸版本比較｜智能障礙事件樹';
  restoreFocus(fk);
}
const say = t => { const s = $('#status'); s.textContent = ''; setTimeout(()=>{ s.textContent = t; }, 60); };
// 選一件事。from：按的是哪個元素，關掉說明後焦點回到它
function select(id, o){
  o = o||{};
  S.e = id||null; writeUrl(false); render();
  if(!S.e) return;
  const el = $('#vpanel [data-id="'+id+'"]');
  if(el && o.reveal!==false) reveal(el);
  if(o.focusPanel){ const h = $('#panel h2')||$('#sheetBody h2'); if(h){ try{ h.focus({preventScroll:true}); }catch(e){} } }
}
// 把元素捲到看得到的地方：不被固定的頁首、下方的說明遮住（2.4.11）
function reveal(el){
  const r = el.getBoundingClientRect(), top = mastBottom()+12, bot = window.innerHeight-(sheet.hidden?0:sheet.offsetHeight)-12;
  if(r.top<top || r.bottom>bot) window.scrollTo({top:Math.max(0, window.scrollY+r.top-top-Math.max(0,(bot-top-r.height)/2)), behavior:calm()?'auto':'smooth'});
}
function setVersion(id, focusTab){
  if(id===S.v) return;
  S.v = id; writeUrl(true); render({focus:false});
  if(focusTab){ const t = $('#tab-'+id); if(t) t.focus(); }
}

/* ---------- 事件處理 ---------- */
document.addEventListener('click', e=>{
  const t = e.target; let el;
  if((el = t.closest('[data-v]'))) return setVersion(el.dataset.v, true);
  if((el = t.closest('[data-track]'))){ const k = el.dataset.track;
    if(k==='all') S.tracks = new Set(allTracks() ? [] : TK);
    else { S.tracks.has(k) ? S.tracks.delete(k) : S.tracks.add(k); }
    if(!S.tracks.size) S.tracks = new Set(TK);
    if(S.e && !S.tracks.has(byId[S.e].track)) S.e = null;
    writeUrl(false); render(); say('顯示 '+shown().length+' 件事件'); return; }
  if((el = t.closest('[data-act]'))){ const a = el.dataset.act;
    if(a==='calm'){ calmPick = !calm(); try{ localStorage.setItem('idtree.tl.calm', calmPick?'1':'0'); }catch(err){} document.documentElement.classList.toggle('calm', calm()); render(); return; }
    if(a==='clear'){ const id = S.e; select(null); const b = id && $('#vpanel [data-id="'+id+'"]'); if(b) b.focus({preventScroll:true}); return; }
  }
  if(t.closest('#sheetX')){ const id = S.e; closeSheet(); S.e = null; writeUrl(false); render(); const b = id && $('#vpanel [data-id="'+id+'"]'); if(b) b.focus({preventScroll:true}); return; }
  if((el = t.closest('[data-id]')) && el.dataset.id){
    if(el.closest('#vpanel') && ver().onPick && ver().onPick(el.dataset.id, el)===false) return;
    const inPanel = !!el.closest('#panel,#sheet');
    // 在圖上再點一次同一件：取消選取
    if(!inPanel && S.e===el.dataset.id && usesPanel()) return select(null);
    return select(el.dataset.id, {focusPanel:!inPanel && !widePanel()});
  }
});
document.addEventListener('submit', e=>{
  if(e.target.id!=='jumpF') return; e.preventDefault();
  const y = parseInt($('#jumpY').value,10);
  if(!(y>=AX0 && y<AX1)){ say('請輸入 '+AX0+' 到 '+(AX1-1)+' 之間的年份'); return; }
  const target = shown().find(x=>x.y>=y) || shown()[shown().length-1];
  if(!target) return;
  if(ver().onJump) ver().onJump(y, target);
  select(target.id);
  say(y+' 年起的第一件事：'+whenLong(target)+'，'+target.title);
  const el = $('#vpanel [data-id="'+target.id+'"]'); if(el){ try{ el.focus({preventScroll:true}); }catch(err){} }
});
document.addEventListener('keydown', e=>{
  const t = e.target;
  // 版本分頁列：左右鍵換分頁
  if(t.closest && t.closest('#vtabs') && ['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
    e.preventDefault(); const i = VERS.findIndex(x=>x.id===S.v), n = VERS.length;
    const j = e.key==='Home' ? 0 : e.key==='End' ? n-1 : (i+(e.key==='ArrowRight'?1:-1)+n)%n; return setVersion(VERS[j].id, true); }
  // 圖裡的按鈕：Enter 或空白鍵等於點一下
  if((e.key==='Enter' || e.key===' ') && t instanceof SVGElement && t.getAttribute('role')==='button'){ e.preventDefault(); t.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})); return; }
  if(ver().onKey && t.closest && t.closest('#vpanel') && ver().onKey(e)===true){ e.preventDefault(); return; }
  if(e.key==='Escape' && S.e && usesPanel()){ const id = S.e; select(null); const b = $('#vpanel [data-id="'+id+'"]'); if(b) b.focus({preventScroll:true}); }
});
// 一組事件裡用方向鍵移動（roving tabindex：整組只有一個 Tab 停點）
function roveTo(el){ if(!el) return; const g = el.closest('[data-rove]'); if(g) $$('[data-id]', g).forEach(x=>x.setAttribute('tabindex', x===el?'0':'-1')); el.focus(); reveal(el); }

/* ---------- 提示框：滑鼠移上去或鍵盤聚焦時顯示（也可以按 Esc 關掉） ---------- */
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
document.addEventListener('pointermove', e=>{ const el = e.target.closest && e.target.closest('[data-tip]'); el ? tipAt(el.getAttribute('data-tip'), e.clientX, e.clientY) : hideTip(); });
document.addEventListener('focusin', e=>{ const el = e.target.closest && e.target.closest('[data-tip]'); if(el){ const r = el.getBoundingClientRect(); tipAt(el.getAttribute('data-tip'), r.left+r.width/2, r.bottom); } else hideTip(); });
document.addEventListener('focusout', hideTip);
document.addEventListener('keydown', e=>{ if(e.key==='Escape') hideTip(); }, true);
window.addEventListener('scroll', hideTip, true);

document.addEventListener('toggle', e=>{ if(e.target.closest && e.target.closest('#vinfo') && (SOLO || vw()<720)) VI.open = e.target.open; }, true);
window.addEventListener('popstate', ()=>{ readUrl(); render({focus:false}); });
let rT, rW = vw();
window.addEventListener('resize', ()=>{ clearTimeout(rT); rT = setTimeout(()=>{ if(vw()!==rW){ rW = vw(); render(); } }, 140); });
