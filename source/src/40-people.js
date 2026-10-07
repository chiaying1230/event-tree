
/* ============ 人數：各障別的學生人數 ============ */
let region = 'nation';
const PSER = [['ID','智能障礙','var(--d1)'],['LD','學習障礙','var(--d2)'],['ASD','自閉症','var(--d3)'],['CP','腦性麻痺','var(--d4)'],['OTHER','其他障礙','var(--d5)']];
const REGIONS = {nation:{name:'全台', src:'通報網全台數據'}, taipei:{name:'台北市', src:'台北市年報＿各障別'}};
DRAW.people = function(){
  const P = PEOPLE[region], RG = REGIONS[region], years = Object.keys(P.ID).map(Number).sort((a,b)=>a-b), ya = years[0], yb = years[years.length-1];
  const chg = (a,b) => { const p = (b-a)/a; return (p<0?'減少 ':'增加 ')+Math.abs(Math.round(p*100))+'%'; };
  const sh = y => P.ID[y]/P.TOTAL[y], p1 = v => (v*100).toFixed(1)+'%';
  // 智能障礙和學習障礙、自閉症的人數在哪一年交叉：找前後兩年大小互換的地方
  const crosses = [];
  [['LD','學習障礙'],['ASD','自閉症']].forEach(s=>{ for(let i=0;i<years.length-1;i++){
    const a0 = P[s[0]][years[i]], a1 = P[s[0]][years[i+1]], b0 = P.ID[years[i]], b1 = P.ID[years[i+1]];
    if(a0==null || a1==null) continue; const d0 = a0-b0, d1 = a1-b1; if(d0*d1>=0) continue;
    const f = d0/(d0-d1); crosses.push({xi:i+f, v:b0+f*(b1-b0), head:years[i+1]+' 年起', text:d1>0 ? s[1]+'多於智能障礙' : '智能障礙多於'+s[1]}); } });
  crosses.sort((a,b)=>a.xi-b.xi);
  const crossText = crosses.map(c=>c.head+c.text).join('，')+(crosses.length?'。':'');
  const stat = (lab,val,unit,sub) => `<div class="stat"><dt>${lab}</dt><dd class="v">${val}${unit?`<small>${unit}</small>`:''}</dd><dd class="sub">${sub}</dd></div>`;
  // 數字表的小表：一欄年份、一欄人數
  // （為了排成幾欄，這張表的版面不是一般表格的排法，所以每一格都標明它在表格裡的角色）
  const twoCol = (cap,ys,get) => `<p class="tcap">${cap}</p><table class="tbl two" role="table" aria-label="${cap}"><thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col">年</th><th role="columnheader" scope="col">人數</th></tr></thead>
    <tbody role="rowgroup">${ys.map(y=>`<tr role="row"><th role="rowheader" scope="row">${y}</th><td role="cell">${fmtN(get(y))}</td></tr>`).join('')}</tbody></table>`;
  let third, thirdTbl;
  if(region==='nation'){ const M = PEOPLE.mohw, my = Object.keys(M).map(Number).sort((a,b)=>a-b);
    thirdTbl = twoCol('智能障礙總人數（衛福部，年底）', my, y=>M[y]);
    third = `<section class="fig plate"><h2>智能障礙總人數（衛福部）</h2>
      <p class="note">取自「衛福部全台數據」工作表，以年底計。${my[0]} 年 ${fmtN(M[my[0]])} 人，${my[my.length-1]} 年 ${fmtN(M[my[my.length-1]])} 人。</p>
      ${chart('mohw', W=>lineSvg({id:'mohw', W, band:eraBand(my), xs:my.map(String), H:230, endLabels:false, label:'衛福部智能障礙總人數', tipHead:i=>my[i]+' 年底', series:[{name:'智能障礙', color:'var(--d1)', bold:true, vals:my.map(y=>M[y])}]}))}</section>`;
  } else { const S = P.SCHOOL_ID, sy = Object.keys(S).map(Number).sort((a,b)=>a-b);
    thirdTbl = twoCol('台北市四所特教學校的智能障礙學生', sy, y=>S[y]);
    third = `<section class="fig plate"><h2>台北市四所特教學校的智能障礙學生</h2>
      <p class="note">${sy[0]} 年 ${S[sy[0]]} 人，${sy[sy.length-1]} 年 ${S[sy[sy.length-1]]} 人。取自「台北市年報＿特教學校」工作表的四所特校加總。資料表備註：「93、94年的數據都一樣，94年的年報有些圖表是寫93年，不太確定是否有誤植」。</p>
      ${chart('school', W=>lineSvg({id:'school', W, band:eraBand(sy), xs:sy.map(String), H:230, endLabels:false, label:'台北市四所特教學校的智能障礙學生數', tipHead:i=>sy[i]+' 年', series:[{name:'智能障礙', color:'var(--d1)', bold:true, vals:sy.map(y=>S[y])}]}))}</section>`; }
  view.innerHTML = `<div class="wrap">${pageHead('people')}
    <div class="bar">
      <span class="lbl" id="regLbl">地區</span><div class="seg" role="group" aria-labelledby="regLbl">${Object.keys(REGIONS).map(k=>`<button data-region="${k}" aria-pressed="${region===k}">${REGIONS[k].name}</button>`).join('')}</div>
      <p class="src">${RG.name}各障別的特教學生人數，取自「${RG.src}」工作表（${ya}–${yb} 年）。</p>
    </div>
    ${focusChip()}
    <dl class="stats" aria-label="智能障礙學生與特教學生總數">
      ${stat(yb+' 年的智能障礙學生', fmtN(P.ID[yb]), '人', '比 '+ya+' 年的 '+fmtN(P.ID[ya])+' 人'+chg(P.ID[ya],P.ID[yb]))}
      ${stat(yb+' 年的特教學生總數', fmtN(P.TOTAL[yb]), '人', '比 '+ya+' 年的 '+fmtN(P.TOTAL[ya])+' 人'+chg(P.TOTAL[ya],P.TOTAL[yb]))}
      ${stat(yb+' 年智能障礙占特教學生', p1(sh(yb)), '', ya+' 年是 '+p1(sh(ya)))}
    </dl>
    <section class="fig plate"><h2>各障別的學生人數</h2>
      <p class="note">粗線是智能障礙。${crossText}腦性麻痺在 ${Math.min(...Object.keys(P.CP).map(Number))} 年以前資料表填 0，圖上不畫。</p>
      ${chart('cat', W=>lineSvg({id:'cat', W, band:eraBand(years), xs:years.map(String), marks:crosses, label:RG.name+'各障別學生人數', tipHead:i=>years[i]+' 年（特教學生共 '+fmtN(P.TOTAL[years[i]])+' 人）',
        series:PSER.map(s=>({name:s[1], color:s[2], bold:s[0]==='ID', vals:years.map(y=>P[s[0]][y]==null ? null : P[s[0]][y])}))}))}</section>
    <div class="grid2">
      <section class="fig plate"><h2>智能障礙占特教學生的比例</h2>
        <p class="note">${ya} 年 ${p1(sh(ya))}，${yb} 年 ${p1(sh(yb))}。</p>
        ${chart('share', W=>lineSvg({id:'share', W, band:eraBand(years), xs:years.map(String), H:230, endLabels:false, max:niceMax(Math.max(...years.map(sh))*100)/100, fmt:pct, label:'智能障礙占特教學生的比例', tipHead:i=>years[i]+' 年',
          series:[{name:'智能障礙', color:'var(--d1)', bold:true, vals:years.map(sh)}]}))}</section>
      ${third}
    </div>
    <details class="more plate"><summary>看數字表</summary>
      <table class="tbl vcols"><caption>${RG.name}各障別的學生人數</caption><thead><tr><th scope="col">年</th>${PSER.map(s=>`<th scope="col"><span>${s[1]}</span></th>`).join('')}<th scope="col"><span>特教學生總數</span></th></tr></thead>
      <tbody>${years.map(y=>`<tr><th scope="row">${y}</th>${PSER.map(s=>`<td>${P[s[0]][y]==null ? '–' : fmtN(P[s[0]][y])}</td>`).join('')}<td>${fmtN(P.TOTAL[y])}</td></tr>`).join('')}</tbody></table>
      ${thirdTbl}</details>
    ${routeHtml()}</div>`;
};

/* ============ 研究：學術文獻的編碼 ============ */
const LIT_DEC = [1970,1980,1990,2000,2010,2020];
const DCOL = ['var(--d1)','var(--d2)','var(--d3)','var(--d4)','var(--d5)','var(--d6)'];
const LTERM_NAMES = ['智能不足','智能障礙','其他'];          // 文獻用詞的三類，順序和資料裡的代碼（0、1、2）一致
// 每年一列的數字表：長條圖的文字版
const yearTable = (cap,ys,names,get) => `<table class="tbl${names.length>4?' vcols':''}"><caption class="vh">${cap}</caption><thead><tr><th scope="col">年</th>${names.map(n=>`<th scope="col"><span>${esc(n)}</span></th>`).join('')}<th scope="col"><span>合計</span></th></tr></thead>
  <tbody>${ys.map(y=>{ const v = names.map((_,k)=>get(y,k)), s = v.reduce((a,b)=>a+b,0); return `<tr><th scope="row">${y}</th>${v.map(x=>`<td>${x||'–'}</td>`).join('')}<td>${s||'–'}</td></tr>`; }).join('')}</tbody></table>`;
function binShare(lo,hi){
  const A = NEWS.filter(a=>a.y>=lo&&a.y<=hi), B = RAW.litTerms.filter(r=>r[0]>=lo&&r[0]<=hi);
  return {nn:A.length, news:A.length ? A.filter(a=>a.wg.includes('智能障礙')).length/A.length : null, ln:B.length, lit:B.length ? B.filter(r=>r[1]===1).length/B.length : null};
}
DRAW.research = function(){
  const y0 = LIT[0].y, y1 = LIT[LIT.length-1].y, years = []; for(let y=y0;y<=y1;y++) years.push(y);
  const byYD = {}; LIT.forEach(r=>{ byYD[r.y+'|'+r.d] = (byYD[r.y+'|'+r.d]||0)+1; });
  const decN = LIT_DEC.map(d=>LIT.filter(r=>r.dec===d).length);
  const cols = LIT_DEC.map((d,i)=>({name:d+'年代', short:String(d), n:decN[i]}));
  const themes = RAW.litThemes.map(t=>{ const m = t.match(/^(.*?)（(.*)）$/); return m ? {name:m[1], sub:m[2]} : {name:t}; });
  const extra = RAW.litRights.map((n,i)=>({name:n, f:r=>r.r===i+1})).concat([{name:'輔助科技（AT 欄為有）', f:r=>r.at===1}]);
  const anyRights = LIT.filter(r=>r.r>0).length, anyAT = LIT.filter(r=>r.at).length;
  const tyears = [], ty0 = RAW.litTerms[0][0], ty1 = RAW.litTerms[RAW.litTerms.length-1][0]; for(let y=ty0;y<=ty1;y++) tyears.push(y);
  const byYT = {}; RAW.litTerms.forEach(r=>{ byYT[r[0]+'|'+r[1]] = (byYT[r[0]+'|'+r[1]]||0)+1; });
  const bins = []; for(let y=1970;y<=2020;y+=5) bins.push([y,Math.min(y+4,2022)]);
  const bs = bins.map(b=>binShare(b[0],b[1])), blab = bins.map(b=>b[0]+'–'+String(b[1]).slice(2));
  const before = LIT.filter(r=>r.y<2000).length;
  const hl = eraFocus==null ? -1 : LIT_DEC.indexOf(eraFocus);
  view.innerHTML = `<div class="wrap">${pageHead('research')}
    ${focusChip()}
    <dl class="stats" aria-label="研究文獻的篇數">
      <div class="stat"><dt>研究文獻（${y0}–${y1} 年）</dt><dd class="v">${LIT.length}<small>篇</small></dd><dd class="sub">取自「Design_themes」工作表</dd></div>
      <div class="stat"><dt>2000 年以前</dt><dd class="v">${before}<small>篇</small></dd><dd class="sub">占 ${pct(before/LIT.length)}</dd></div>
      <div class="stat"><dt>2000 年以後</dt><dd class="v">${LIT.length-before}<small>篇</small></dd><dd class="sub">占 ${pct(1-before/LIT.length)}</dd></div>
    </dl>
    <section class="fig plate"><h2>每年的篇數與研究設計</h2>
      ${chart('design', W=>stackSvg({W, band:eraBand(years), years, unit:'篇', label:'每年的研究篇數，依研究設計堆疊', series:RAW.litDesigns.map((n,k)=>({name:n, color:DCOL[k]})), val:(i,k)=>byYD[years[i]+'|'+k]||0}))}</section>
    <section class="fig plate"><h2>研究主題</h2>
      <p class="note">格子裡是篇數，底色越深，代表這個主題在那個年代的研究裡占得越多。</p>
      ${heatTable({corner:'主題', hl, unit:'篇', rows:themes, cols, get:(ri,ci)=>LIT.filter(r=>r.t===ri&&r.dec===LIT_DEC[ci]).length, total:ri=>LIT.filter(r=>r.t===ri).length})}</section>
    <section class="fig plate"><h2>權利議題與輔助科技</h2>
      <p class="note">${LIT.length} 篇裡，Rights 欄編為性相關調查、自我倡議/自我決策或性教育介入的有 ${anyRights} 篇（${pct(anyRights/LIT.length)}），AT 欄編為「有」的有 ${anyAT} 篇（${pct(anyAT/LIT.length)}）。</p>
      ${heatTable({corner:'類別', hl, unit:'篇', rows:extra, cols, get:(ri,ci)=>LIT.filter(r=>extra[ri].f(r)&&r.dec===LIT_DEC[ci]).length, total:ri=>LIT.filter(extra[ri].f).length})}</section>
    <div class="grid2">
      <section class="fig plate"><h2>文獻使用的名詞</h2>
        <p class="note">${RAW.litTerms.length} 筆文獻（含非研究類文章）各自使用的名詞。</p>
        ${chart('lterms', W=>stackSvg({W, band:eraBand(tyears), years:tyears, unit:'筆', H:240, label:'每年文獻使用的名詞', series:LTERM_NAMES.map((n,k)=>({name:n, color:['var(--d2)','var(--d1)','var(--ctl)'][k]})), val:(i,k)=>byYT[tyears[i]+'|'+k]||0}))}</section>
      <section class="fig plate"><h2>文獻與新聞使用「智能障礙」一詞的比例</h2>
        <p class="note">每五年為一段。新聞一篇可以編多個用詞，有用到「智能障礙」就計入；文獻一筆一個用詞。</p>
        ${chart('cmp', W=>lineSvg({id:'cmp', W, band:eraBand(bins.map(b=>b[0])), xs:blab, max:1, fmt:pct, dots:true, H:240, endLabels:false, label:'文獻與新聞使用智能障礙一詞的比例', tipHead:i=>blab[i]+' 年',
          series:[{name:'文獻', color:'var(--d2)', vals:bs.map(b=>b.lit), tipExtra:i=>'（共 '+bs[i].ln+' 筆）'},{name:'新聞', color:'var(--d1)', vals:bs.map(b=>b.news), tipExtra:i=>'（共 '+bs[i].nn+' 篇）'}]}))}</section>
    </div>
    <details class="more plate"><summary>看數字表</summary>
      <details class="sub"><summary>每年的篇數與研究設計（篇）</summary>${yearTable('每年的篇數與研究設計（篇）', years, RAW.litDesigns, (y,k)=>byYD[y+'|'+k]||0)}</details>
      <details class="sub"><summary>每年文獻使用的名詞（筆）</summary>${yearTable('每年文獻使用的名詞（筆）', tyears, LTERM_NAMES, (y,k)=>byYT[y+'|'+k]||0)}</details>
      <details class="sub"><summary>文獻與新聞使用「智能障礙」一詞的比例</summary><table class="tbl"><caption class="vh">文獻與新聞使用「智能障礙」一詞的比例</caption><thead><tr><th scope="col">年</th><th scope="col">文獻</th><th scope="col">文獻筆數</th><th scope="col">新聞</th><th scope="col">新聞篇數</th></tr></thead>
      <tbody>${bins.map((b,i)=>`<tr><th scope="row">${b[0]}–${b[1]}</th><td>${bs[i].lit==null ? '–' : pct(bs[i].lit)}</td><td>${bs[i].ln}</td><td>${bs[i].news==null ? '–' : pct(bs[i].news)}</td><td>${bs[i].nn}</td></tr>`).join('')}</tbody></table></details>
    </details>
    ${routeHtml()}</div>`;
};
TOURS.people = () => [
  {sel:'#view .bar .seg', title:'地區', text:'可以切換全台與台北市的資料。'},
  {sel:'#view [data-ch="cat"]', title:'各障別的學生人數', text:'粗線是智能障礙。滑鼠移到圖上（手機用手指點）會顯示那一年每個障別的人數。'},
  {sel:'#view .xmark', title:'交叉的位置', text:'圓圈標出智能障礙與學習障礙、自閉症人數交叉的地方；把滑鼠移上去或點一下，會顯示從哪一年起誰比較多。'},
  {sel:'#view .more', title:'數字表', text:'每張圖完整的數字在這裡，點一下展開。'}
];
TOURS.research = () => [
  {sel:'#view [data-ch="design"]', title:'每年的篇數', text:'每年一根長條，顏色代表研究設計。滑鼠移到長條上（手機用手指點）會顯示那一年各種設計的篇數。'},
  {sel:'#view .heat', title:'表格', text:'格子裡是篇數；底色越深，代表在那個年代的研究裡占得越多。'},
  {sel:'#view [data-ch="cmp"]', title:'文獻與新聞的用詞', text:'兩條線分別是文獻與新聞使用「智能障礙」一詞的比例，每五年一段。'},
  {sel:'#view .more', title:'數字表', text:'每張圖完整的數字在這裡，點一下展開。'}
];
view.addEventListener('click', e=>{
  const b = e.target.closest('[data-region]'); if(b && page==='people'){ region = b.dataset.region; render(); }
  const x = e.target.closest('.xmark'); if(x) x.classList.toggle('on');
});
