
/* ============ 剪報：編碼分析（圓圈圖） ============
   一進來，上面的大圈是全部年代，下面一排是各年代。
   點一個年代，大圈換成那個年代；點大圈的任何一格，下面列出那些新聞。 */
let newsDim = 'view', newsCat = null, newsEra = null, newsBoth = false, newsLimit = 40;
function newsStep(d){ const order = [null].concat(DECADES); newsEra = order[(order.indexOf(newsEra)+d+order.length)%order.length]; newsLimit = 40; render(); }
const clipRow = a => `<li><span class="nd">${a.d}</span><span class="no">${esc(a.o)}</span><span class="nt">${esc(a.t)}${a.x?'<em>主體非智能障礙者</em>':''}</span>
  <span class="nm"><span><i>用詞：</i>${esc(a.w.join('、')||'未編')}</span><span><i>觀點：</i>${esc(a.v||'未編')}${a.v2&&a.v2!=='無' ? '（次要：'+esc(a.v2)+'）' : ''}</span><span><i>主題：</i>${esc(a.p.join('、')||'未編')}</span></span></li>`;
function newsListHtml(dim,both,cur){
  if(!newsCat) return `<p class="nempty">點圓圈裡的任何一格，這裡會列出那些新聞。</p>`;
  const A = (newsEra==null ? NEWS : NEWS.filter(a=>a.dec===newsEra)).filter(a=>codesOf(a,dim,both).includes(newsCat));
  let sub = '';
  if(dim==='topic'){ const c = {}; A.forEach(a=>a.p.forEach(t=>{ if(topicGroup(t)===newsCat) c[t] = (c[t]||0)+1; }));
    const ks = Object.keys(c).sort((p,q)=>c[q]-c[p]);
    if(ks.length>1){ const mx = c[ks[0]]; sub = `<div class="bars">${ks.map(k=>`<span class="bl">${esc(k.replace(newsCat+'-',''))}</span><span class="bb"><i style="width:${(c[k]/mx*100).toFixed(1)}%"></i></span><span class="bv">${c[k]} 篇</span>`).join('')}</div>`; } }
  return `<h2>${eraName(newsEra)}・${esc(newsCat)}<small>${A.length} 篇，占這個年代新聞的 ${pct(cur.share(newsCat))}</small></h2>${sub}
    <ol class="clips">${A.slice(0,newsLimit).map(clipRow).join('')}</ol>
    ${A.length>newsLimit ? `<button class="btn wide" id="nmore">再看 ${Math.min(40,A.length-newsLimit)} 篇（還有 ${A.length-newsLimit} 篇）</button>` : ''}`;
}
// 右邊的折線圖：目前這個類別（中間數字所屬的那一格）在各年代的比例。每個年代一欄，和下面的小圓圈對齊
let trendCtx = null;
function trendSvg(W){
  const c = trendCtx, cat = c.cur, n = DECADES.length, small = W<460, H = small?150:190, T = 26, B = 12, col = W/n;
  const x = i => col*(i+.5), y = v => T+(H-T-B)*(1-Math.min(v/c.max,1)), vals = c.stDec.map(s=>s.share(cat));
  let g = '';
  // 刻度：分成兩段或三段，取得到 5% 倍數的那一種
  const pm = Math.round(c.max*100), parts = pm%10===0 ? 2 : pm%15===0 ? 3 : 1;
  for(let k=0;k<=parts;k++){ const v = c.max*k/parts, yy = y(v).toFixed(1);
    g += `<line x1="0" x2="${W}" y1="${yy}" y2="${yy}" stroke="var(--line)" stroke-width="1"${k?' stroke-dasharray="2 5"':''}/><text x="2" y="${yy-4}" font-size="11" fill="var(--muted)">${pct(v)}</text>`; }
  if(c.era!=null){ const i = DECADES.indexOf(c.era); g += `<rect x="${(col*i+3).toFixed(1)}" y="6" width="${(col-6).toFixed(1)}" height="${H-6}" rx="8" fill="var(--trk2)"/>`; }
  g += `<polyline points="${vals.map((v,i)=>x(i).toFixed(1)+','+y(v).toFixed(1)).join(' ')}" fill="none" stroke="var(--rose)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>`;
  vals.forEach((v,i)=>{ const on = c.era===DECADES[i];
    g += `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="${on?6.5:4.5}" fill="${on?'var(--rose)':'var(--paper)'}" stroke="var(--rose)" stroke-width="2.5"/>`;
    if(on) g += `<text x="${x(i).toFixed(1)}" y="${(y(v)-12).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)" stroke="var(--paper)" stroke-width="3.5" paint-order="stroke">${pct(v)}</text>`; });
  DECADES.forEach((d,i)=>{ g += `<rect class="tcol" x="${(col*i).toFixed(1)}" y="0" width="${col.toFixed(1)}" height="${H}" data-pick="${d}" data-tip="${esc(d+'年代・'+cat+'\n'+c.stDec[i].count[cat]+' 篇，占這個年代新聞的 '+pct(vals[i]))}"/>`; });
  return `<svg class="trend" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cat+'在各年代的比例：'+DECADES.map((d,i)=>d+'年代 '+pct(vals[i])).join('，'))}">${g}</svg>`;
}
// 中間的數字換成別的類別時（滑鼠移過去、鍵盤聚焦），折線也跟著換
function onRoseCur(svg,key){
  if(page!=='news' || !trendCtx) return; const cat = key||trendCtx.def; if(!cat || cat===trendCtx.cur) return;
  trendCtx.cur = cat; const el = $('.chart[data-ch="trend"]'), h = $('#rzCat');
  if(el) el.innerHTML = trendSvg(Math.floor(el.clientWidth)); if(h) h.textContent = cat;
}
DRAW.news = function(){
  const dim = newsDim, cats = CATS[dim], both = dim==='view' && newsBoth, D = DIM[dim];
  if(newsCat && !cats.some(c=>c.k===newsCat)) newsCat = null;
  const max = newsScale(dim,both), stAll = newsStats(dim,null,both), stDec = DECADES.map(d=>newsStats(dim,d,both));
  const cur = newsEra==null ? stAll : stDec[DECADES.indexOf(newsEra)], en = eraName(newsEra), def = newsCat||cur.top||stAll.top;
  trendCtx = {dim, stDec, max, era:newsEra, def, cur:def};
  const mini = (era,st) => { const on = newsEra===era, top = st.top ? cats.find(c=>c.k===st.top) : null;
    const say = newsCat ? newsCat+'：'+st.count[newsCat]+' 篇，'+pct(st.share(newsCat)) : top ? '比例最高：'+top.k+' '+pct(st.share(st.top)) : '沒有資料';
    return `<button class="rmini${on?' on':''}" data-pick="${era}" aria-pressed="${on}" aria-label="${esc(eraName(era)+'，'+st.n+' 篇新聞。'+say)}" data-tip="${esc(eraName(era)+'・'+st.n+' 篇新聞\n'+say)}">
      ${roseSvg(dim,st,max,{era, sel:newsCat, kind:'glyph', hidden:true})}<span class="rm-y">${era}</span></button>`; };
  view.innerHTML = `<div class="wrap">${pageHead('news',{tabs:CLIP_TABS})}
    <div class="bar">
      <span class="lbl" id="dimLbl">看什麼</span><div class="seg" role="group" aria-labelledby="dimLbl">${Object.keys(DIM).map(k=>`<button data-dim="${k}" aria-pressed="${newsDim===k}">${DIM[k].name}</button>`).join('')}</div>
      ${dim==='view' ? `<label class="chk"><input type="checkbox" id="newsBoth"${newsBoth?' checked':''}><span>加上次要觀點</span></label>` : ''}
    </div>
    <section class="plate rz" aria-label="${esc(en+'的'+D.name)}">
      <div class="rz-a">
        <div class="rz-head">
          <button class="rz-nav" data-step="-1" aria-label="上一個年代">‹</button>
          <div class="rz-title"><h2 class="rz-era">${en}</h2><p class="rz-n">${cur.n} 篇新聞${dim==='view' && cur.none ? `，其中 ${cur.none} 篇沒有編到觀點` : ''}</p></div>
          <button class="rz-nav" data-step="1" aria-label="下一個年代">›</button>
        </div>
        <figure class="rz-fig">${chart('rose', W=>roseSvg(dim,cur,max,{kind:'big', era:newsEra, sel:newsCat, W:Math.min(560,W)}))}</figure>
      </div>
      <div class="rz-b">
        <h2 class="rz-cat"><span id="rzCat">${esc(def||'')}</span><small>在各年代的比例</small></h2>
        ${chart('trend', W=>trendSvg(W))}
        <div class="rstrip">${DECADES.map((d,i)=>mini(d,stDec[i])).join('')}</div>
        <p class="rz-back"${newsEra==null?' hidden':''}><button class="btn" data-pick="all">回到全部年代</button><a href="#tree" data-act="to-hub" data-era="${newsEra}">在時間軸上看這十年</a></p>
      </div>
    </section>
    <section class="plate nlist" id="nlist" aria-live="polite">${newsListHtml(dim,both,cur)}</section>
    <details class="more plate"><summary>看各年代的數字</summary>
      ${heatTable({corner:D.name, unit:'篇', asPct:true, rows:cats.map(c=>({name:c.k})), cols:DECADES.map((d,i)=>({name:d+'年代', short:String(d), n:stDec[i].n})).concat([{name:'全部', n:stAll.n}]),
        get:(ri,ci)=>(ci<DECADES.length ? stDec[ci] : stAll).count[cats[ri].k]})}
      <p class="note">表裡是占那個年代新聞的比例；滑鼠移到格子上（手機用手指點）可以看篇數。</p></details>
    ${routeHtml()}</div>`;
};

TOURS.news = () => { const dim = newsDim, D = DIM[dim], both = dim==='view' && newsBoth;
  const what = dim==='view' ? '編為這種觀點' : dim==='topic' ? '編為這類主題' : '使用這個詞';
  return [
    {sel:'#view .rz-fig', title:'圓圈圖', text:`圓圈外面平分成 ${CATS[dim].length} 格，每格是${D.one}。凸出越多，代表越高比例的新聞${what}；凸到最外面是 ${pct(newsScale(dim,both))}。格子順時針依這個類別平均出現的年份由早到晚排。`},
    {sel:'#view .rose.big .hub', title:'中間的數字', text:'屬於外圈標成深色的那個類別：平常是比例最高的一格；把滑鼠移到別的格子上，或點一下，就換成那一格。點了之後，下面會列出那些新聞。'},
    {sel:'#view .rz-b', title:'各年代的變化', text:'折線是同一個類別在各年代的比例，會跟著你移到或點選的那一格更換。下面每個年代一個小圓圈，點一下，左邊的大圈就換成那個年代，再點一次回到全部年代。'+(vw()<720 ? '也可以在大圈上左右滑。' : '')},
    {sel:'#view .bar', title:'看什麼', text:'可以改看主題或用詞。'+(dim==='view' ? '沒有編到觀點的新聞不在圓圈裡。' : '')+'主題與用詞一篇新聞可能同時屬於好幾類，所以比例加起來會超過 100%。'},
    {sel:'#view .more', title:'完整的數字', text:'每個類別在每個年代的比例，都在這張表裡。'}
  ]; };

/* ============ 剪報：清單 ============ */
let clipQ = '', clipDec = '', clipOut = '', clipLimit = 50;
function clipFiltered(){
  const q = clipQ.trim();
  return NEWS.filter(a=>(!clipDec || a.dec===+clipDec) && (!clipOut || a.o===clipOut) &&
    (!q || a.t.includes(q) || a.w.some(w=>w.includes(q)) || a.p.some(p=>p.includes(q)) || (a.v||'').includes(q) || (a.v2||'').includes(q)));
}
function updateClipList(){
  const A = clipFiltered();
  $('#clipStatus').textContent = '符合 '+A.length+' 篇，共 '+NEWS.length+' 篇。';
  $('#clipRows').innerHTML = A.slice(0,clipLimit).map(clipRow).join('');
  const more = $('#clipMore'); more.hidden = A.length<=clipLimit;
  more.textContent = '再看 '+Math.min(50,A.length-clipLimit)+' 篇（還有 '+Math.max(A.length-clipLimit,0)+' 篇）';
}
DRAW.list = function(){
  const outs = [...new Set(NEWS.map(a=>a.o))].sort((p,q)=>NEWS.filter(a=>a.o===q).length-NEWS.filter(a=>a.o===p).length);
  view.innerHTML = `<div class="wrap">${pageHead('list',{tabs:CLIP_TABS})}
    <div class="form" role="search" aria-label="篩選剪報">
      <label class="field grow">關鍵字（標題、用詞、觀點或主題）<input type="search" id="clipQ" value="${esc(clipQ)}" autocomplete="off"></label>
      <label class="field">年代<select id="clipDec"><option value="">全部年代</option>${DECADES.map(d=>`<option value="${d}"${String(d)===clipDec?' selected':''}>${d}年代</option>`).join('')}</select></label>
      <label class="field">報別<select id="clipOut"><option value="">全部報別</option>${outs.map(o=>`<option${o===clipOut?' selected':''}>${esc(o)}</option>`).join('')}</select></label>
    </div>
    <p class="status" id="clipStatus" role="status"></p>
    <div class="plate nlist"><ol class="clips" id="clipRows"></ol><button class="btn wide" id="clipMore" hidden></button></div>
    ${routeHtml()}</div>`;
  updateClipList();
};
function clipInput(e){
  const t = e.target; if(page!=='list' || !t || !t.id) return;
  if(t.id==='clipQ') clipQ = t.value; else if(t.id==='clipDec') clipDec = t.value; else if(t.id==='clipOut') clipOut = t.value; else return;
  clipLimit = 50; updateClipList();
}
view.addEventListener('input', clipInput);
view.addEventListener('change', e=>{ clipInput(e); if(e.target.id==='newsBoth'){ newsBoth = e.target.checked; newsLimit = 40; render(); } });
view.addEventListener('click', e=>{
  const t = e.target; let el;
  if(page==='list'){ if(t.closest('#clipMore')){ clipLimit += 50; updateClipList(); } return; }
  if(page!=='news') return;
  if(t.closest('#nmore')){ newsLimit += 40; return render(); }
  if((el = t.closest('[data-step]'))) return newsStep(+el.dataset.step);
  if((el = t.closest('[data-dim]'))){ newsDim = el.dataset.dim; newsCat = null; newsLimit = 40; return render(); }
  if((el = t.closest('[data-pick]'))){ const v = el.dataset.pick; newsEra = (v==='all' || newsEra===+v) ? null : +v; newsLimit = 40; return render(); }
  if((el = t.closest('[data-cat]'))){ const c = el.dataset.cat; newsCat = newsCat===c ? null : c; newsLimit = 40; return render(); }
});
onSwipe('.rz-fig', d=>{ if(page==='news') newsStep(d); });
