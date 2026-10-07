
/* ============ 時間軸：重大事件 ============
   寬的畫面畫成一棵由下往上長的樹（事件名稱寫在節點旁邊）；
   窄的畫面（手機）改成由上往下的直式時間軸，左邊是枝條，右邊一行一件事。
   兩種畫法的背景都是同一時間報紙用詞的比例。 */
const THEMES = TREE.themes, SUBS = TREE.subs, EVENTS = TREE.events, byId = Object.fromEntries(EVENTS.map(e=>[e.id,e]));
const Y0 = TREE.axis[0], Y1 = TREE.axis[1]+1;                 // 時間軸的範圍：1962 年初到 2025 年底
EVENTS.forEach(e=>{
  e.lines = TITLE_LINES[e.id]||[e.title]; e.gap = e.title===e.lines.join(' ') ? ' ' : '';      // 換行的地方原本有沒有空格
  if(!e.date) return;
  const p = String(e.date).split('-').map(Number);
  e.y = p[0]; e.mo = p[1]||0; e.dd = p[2]||0; e.t = p[0]+((p[1]||1)-1)/12+((p[2]||1)-1)/372; e.dec = decadeOf(p[0]);
});
const whenLong = e => e.when || (e.dd ? `${e.y}年${e.mo}月${e.dd}日` : e.mo ? `${e.y}年${e.mo}月` : `${e.y}年`);
const whenShort = e => e.when || (e.dd ? `${e.y}.${e.mo}.${e.dd}` : e.mo ? `${e.y}.${e.mo}` : `${e.y}`);
const kidsOf = id => EVENTS.filter(e=>e.parents[0]===id).sort((a,b)=>a.t-b.t);
const subOf = e => e.sub ? SUBS[e.sub] : null;
const shapeOf = e => subOf(e) ? subOf(e).shape : THEMES[e.theme].shape;
const colorOf = e => 'var(--c-'+e.theme+')';
const branchName = e => THEMES[e.theme].name+(subOf(e) ? '・'+subOf(e).name : '');
const ORDER = EVENTS.filter(e=>e.id!=='root').sort((a,b)=>a.t-b.t).map(e=>e.id);     // 依時間先後
// 除了顏色，每一支也用不同形狀的節點區分
function mark(shape,x,y,r,attrs){
  attrs = attrs||'';
  if(shape==='square') return `<rect x="${(x-r*.9).toFixed(1)}" y="${(y-r*.9).toFixed(1)}" width="${(r*1.8).toFixed(1)}" height="${(r*1.8).toFixed(1)}" rx="1.5" ${attrs}/>`;
  if(shape==='diamond') return `<polygon points="${x.toFixed(1)},${(y-r*1.25).toFixed(1)} ${(x+r*1.25).toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${(y+r*1.25).toFixed(1)} ${(x-r*1.25).toFixed(1)},${y.toFixed(1)}" ${attrs}/>`;
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" ${attrs}/>`;
}
const icon = (shape,color) => `<svg class="ico" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">${mark(shape,7,7,4.6,`fill="${color}"`)}</svg>`;
// 每個事件排在第幾欄：葉子一欄一個，分支點放在它的分支中間
const COL = {}; let LEAFN = 0;
(function walk(e){ const ch = kidsOf(e.id); let c; if(ch.length){ const cs = ch.map(walk); c = (cs[0]+cs[cs.length-1])/2; } else c = LEAFN++; COL[e.id] = c; return c; })(byId.root);

/* 背景：報紙用哪個詞。每個詞在某個時間點占四個主要用詞的比例 */
const TERMS = TREE.trends, TERM_IDS = Object.keys(TERMS);
TERM_IDS.forEach(k=>{ TERMS[k].pts = TERMS[k].curve.map(c=>{ const p = c[0].split('-').map(Number); return [p[0]+((p[1]||1)-1)/12, c[1]]; }); });
const TR_LO = Math.min(...TERM_IDS.map(k=>TERMS[k].pts[0][0])), TR_HI = Math.max(...TERM_IDS.map(k=>TERMS[k].pts[TERMS[k].pts.length-1][0])), DATA_END = Math.ceil(TR_HI);
// 疊成色帶時，依各個詞的「重心年代」由早到晚排
const STACK = (()=>{ const c = k => { const p = TERMS[k].pts, w = p.reduce((a,x)=>a+x[1],0)||1; return p.reduce((a,x)=>a+x[0]*x[1],0)/w; }; return [...TERM_IDS].sort((a,b)=>c(a)-c(b)); })();
STACK.forEach((k,i)=>TERMS[k].color = 'var(--g'+Math.min(i+1,4)+')');
function termLevel(k,t){
  const p = TERMS[k].pts; if(t<=p[0][0]) return p[0][1];
  for(let i=0;i<p.length-1;i++){ if(t<=p[i+1][0]){ const x = (t-p[i][0])/((p[i+1][0]-p[i][0])||1), s = x*x*(3-2*x); return p[i][1]+(p[i+1][1]-p[i][1])*s; } }
  return p[p.length-1][1];
}
function shares(t){
  t = Math.min(Math.max(t,TR_LO),TR_HI);          // 超出資料範圍時，沿用最近一段的比例
  const lv = STACK.map(k=>termLevel(k,t)), sum = lv.reduce((a,b)=>a+b,0);
  let c = 0; return STACK.map((k,i)=>{ const w = sum ? lv[i]/sum : 0, r = [c,c+w]; c += w; return r; });
}

/* 狀態：選了哪個事件、哪個用詞、哪個年代；是否改看文字清單 */
let tSel = null, tTerm = null, tEra = null, tList = false, TL = null;
const tAny = () => !!(tSel || tTerm || tEra!=null);
function relatedSet(){
  if(tSel){ const e = byId[tSel]; return new Set([tSel, ...e.parents.filter(p=>p!=='root'), ...EVENTS.filter(x=>x.parents.includes(tSel)).map(x=>x.id)]); }
  if(tTerm) return new Set(EVENTS.filter(e=>(e.trends||[]).includes(tTerm)).map(e=>e.id));
  if(tEra!=null) return new Set(EVENTS.filter(e=>e.dec===tEra).map(e=>e.id));
  return null;
}

/* ---------- 排版 ---------- */
const curveD = (A,B) => { const my = ((A.y+B.y)/2).toFixed(1); return `M${A.x.toFixed(1)} ${A.y.toFixed(1)} C${A.x.toFixed(1)} ${my} ${B.x.toFixed(1)} ${my} ${B.x.toFixed(1)} ${B.y.toFixed(1)}`; };
const curvePts = (A,B,n) => { const my = (A.y+B.y)/2, out = []; for(let i=0;i<=n;i++){ const t = i/n, u = 1-t; out.push({x:A.x*(u*u*u+3*u*u*t)+B.x*(3*u*t*t+t*t*t), y:A.y*u*u*u+my*(3*u*u*t+3*u*t*t)+B.y*t*t*t}); } return out; };
// 枝條：同一條主幹有兩支以上從樹根長出來時，先合成一條，再分支
function treeSegments(pos, juncY){
  const junc = {}, segs = [];
  Object.keys(THEMES).forEach(t=>{ const ks = kidsOf('root').filter(e=>e.theme===t); if(ks.length<2) return;
    const xs = ks.map(e=>pos[e.id].x); junc[t] = {x:(Math.min(...xs)+Math.max(...xs))/2, y:juncY(ks)};
    segs.push({a:pos.root, b:junc[t], theme:t, w:7, from:'root', to:null}); });
  EVENTS.forEach(e=>{ if(e.id==='root') return; const p = e.parents[0], A = (p==='root' && junc[e.theme]) || pos[p];
    let d = 0, q = p; while(q && q!=='root'){ d++; q = byId[q].parents[0]; }
    segs.push({a:A, b:pos[e.id], theme:e.theme, w:Math.max(3.2, 6.4-d*.85), from:p, to:e.id}); });
  return {junc, segs};
}
// 寬的畫面：樹狀。名稱寫在節點旁邊，先試右邊，會壓到枝條或別的名稱時換位置
function layoutTree(W,H){
  const AX = 50, T = 44, B = 46, fs = 13, lh = 16.5, base = H-B;
  const lw = e => Math.ceil(Math.max(...e.lines.map(s=>textW(s,fs))))+12, lhh = e => e.lines.length*lh+7;
  const lastW = Math.max(...EVENTS.filter(e=>e.id!=='root' && COL[e.id]===LEAFN-1).map(lw));
  const x0 = AX+30; let pitch = (W-x0-lastW-28)/(LEAFN-1), shift = 0;
  if(pitch>184){ shift = (pitch-184)*(LEAFN-1)/2; pitch = 184; }
  const X = c => x0+shift+c*pitch, Y = t => base-(t-Y0)/(Y1-Y0)*(base-T);
  const pos = {}; EVENTS.forEach(e=>{ pos[e.id] = e.id==='root' ? {x:X(COL.root), y:base} : {x:X(COL[e.id]), y:Y(e.t)}; });
  const {junc, segs} = treeSegments(pos, ks=>base-Math.max(12, Math.min(40, (base-Math.max(...ks.map(e=>pos[e.id].y)))*.5)));
  // 不能壓到的東西：枝條上的點、其他事件的節點、分支點
  const obst = [];
  segs.forEach(s=>curvePts(s.a,s.b,24).forEach(p=>obst.push({x:p.x, y:p.y, r:s.w/2+2.5, ids:[s.from,s.to]})));
  EVENTS.forEach(e=>obst.push({x:pos[e.id].x, y:pos[e.id].y, r:9.5, ids:[], node:e.id}));
  Object.values(junc).forEach(j=>obst.push({x:j.x, y:j.y, r:7, ids:[]}));
  const boxes = [{x:AX+4, y:Y(DATA_END)-19, w:150, h:17}];          // 虛線上方那一行小字的位置先留下來
  const free = (b,id) => b.x>=AX+3 && b.x+b.w<=W-3 && b.y>=3 && b.y+b.h<=base-1 &&
    !boxes.some(p=>b.x<p.x+p.w+4 && p.x<b.x+b.w+4 && b.y<p.y+p.h+3 && p.y<b.y+b.h+3) &&
    !obst.some(o=>{ if(id && o.node===id) return false; if(id && o.ids.includes(id) && Math.hypot(o.x-pos[id].x,o.y-pos[id].y)<13) return false;
      return o.x>b.x-o.r && o.x<b.x+b.w+o.r && o.y>b.y-o.r && o.y<b.y+b.h+o.r; });
  const labels = [];
  ORDER.map(id=>byId[id]).forEach(e=>{
    const p = pos[e.id], w = lw(e), h = lhh(e), g = 12;
    const cands = [[p.x+g,p.y-h/2,'R'],[p.x+g,p.y-h+5,'R'],[p.x+g,p.y-5,'R'],[p.x-g-w,p.y-h/2,'L'],[p.x-g-w,p.y-h+5,'L'],[p.x-g-w,p.y-5,'L']];
    for(let k=1;k<=10;k++) cands.push([p.x+g,p.y-h/2-k*7,'R'],[p.x+g,p.y-h/2+k*7,'R'],[p.x-g-w,p.y-h/2-k*7,'L'],[p.x-g-w,p.y-h/2+k*7,'L']);
    let b = null; for(const c of cands){ const t = {x:c[0], y:c[1], w, h, side:c[2]}; if(free(t,e.id)){ b = t; break; } }
    if(!b) b = {x:p.x+g, y:p.y-h/2, w, h, side:'R'};
    b.id = e.id; b.far = Math.abs(b.y+h/2-p.y)>h/2+1; boxes.push(b); labels.push(b);
  });
  // 兩個分支的名稱寫在那一支的最上面；兩條主幹的名稱寫在主幹旁邊
  const names = [], put = (text,shape,theme,cands,w,h) => { let b = null; for(const c of cands){ const t = {x:c[0], y:c[1], w, h}; if(free(t,null)){ b = t; break; } } if(!b) b = {x:cands[0][0], y:cands[0][1], w, h}; boxes.push(b); names.push(Object.assign(b,{text,shape,theme})); };
  Object.keys(SUBS).forEach(k=>{ const ev = EVENTS.filter(e=>e.sub===k); if(!ev.length) return; const lf = ev.filter(e=>!kidsOf(e.id).length);
    const cx = lf.reduce((a,e)=>a+pos[e.id].x,0)/lf.length, top = Math.min(...ev.map(e=>pos[e.id].y-10), ...labels.filter(b=>byId[b.id].sub===k).map(b=>b.y));
    const w = textW(SUBS[k].name,13)+26, h = 20, c = []; for(let i=0;i<24;i++) c.push([cx-w/2, top-h-5-i*5]);
    put(SUBS[k].name, SUBS[k].shape, ev[0].theme, c, w, h); });
  Object.keys(THEMES).forEach(t=>{ const w = textW(THEMES[t].name,13)+26, h = 20, c = [];
    if(junc[t]){ const j = junc[t]; for(let i=0;i<8;i++) c.push([j.x-10-w, j.y-h/2+6+i*4]); for(let i=1;i<8;i++) c.push([j.x-10-w, j.y-h/2+6-i*5]); }
    else { const s = segs.find(s=>s.from==='root' && s.theme===t), m = curvePts(s.a,s.b,10)[5]; for(let i=0;i<10;i++) c.push([m.x+12, m.y-h/2+i*5]); for(let i=1;i<10;i++) c.push([m.x+12, m.y-h/2-i*5]); }
    put(THEMES[t].name, THEMES[t].shape, t, c, w, h); });
  const samples = []; for(let i=0;i<=110;i++){ const t = Y0+(DATA_END-Y0)*i/110; samples.push({y:Y(t), t}); }     // 背景只畫到有新聞資料的最後一年
  return {mode:'tree', W, H, AX, T, base, pos, junc, segs, labels, names, samples, bx0:AX, bx1:W, yOfT:Y, lh};
}
// 窄的畫面：直式時間軸。一行一件事，年代之間有分隔線；背景的時間跟著每一行的位置伸縮
function layoutLanes(W){
  const roomy = W>=480, LP = roomy?24:18, X0 = roomy?30:22, X = c => X0+c*LP;
  const yearX = X(LEAFN-1)+(roomy?26:18), titleX = yearX+(roomy?60:52), RH = 46, DH = 36, TOP = 26;
  const pos = {root:{x:X(COL.root), y:TOP}}, rows = [], seps = [{d:DECADES[0], y:TOP}], anchors = [[TOP,Y0]];
  let y = TOP+32;
  DECADES.slice(1).forEach(d=>{
    const sy = y+DH/2; seps.push({d, y:sy}); anchors.push([sy,d]); y += DH;
    ORDER.map(id=>byId[id]).filter(e=>e.dec===d).forEach(e=>{ const ry = y+RH/2; pos[e.id] = {x:X(COL[e.id]), y:ry}; rows.push({e, y:ry}); anchors.push([ry, Math.max(e.t,d+.3)]); y += RH; });
  });
  const H = y+22; anchors.push([H,Y1]);
  const seg = (v,k) => { for(let i=1;i<anchors.length;i++) if(v<=anchors[i][k]) return [anchors[i-1],anchors[i]]; return [anchors[anchors.length-2],anchors[anchors.length-1]]; };
  const tOfY = yy => { const [a,b] = seg(yy,0); return a[1]+(b[1]-a[1])*Math.min(1,Math.max(0,(yy-a[0])/((b[0]-a[0])||1))); };
  const yOfT = t => { const [a,b] = seg(t,1); return a[0]+(b[0]-a[0])*Math.min(1,Math.max(0,(t-a[1])/((b[1]-a[1])||1))); };
  const yEnd = yOfT(DATA_END), samples = []; for(let yy=TOP; yy<yEnd; yy+=5) samples.push({y:yy, t:tOfY(yy)}); samples.push({y:yEnd, t:DATA_END});     // 背景只畫到有新聞資料的最後一年
  const {junc, segs} = treeSegments(pos, ks=>TOP+Math.min(20, (Math.min(...ks.map(e=>pos[e.id].y))-TOP)*.4));
  return {mode:'lanes', W, H, pos, junc, segs, rows, seps, samples, bx0:0, bx1:W, yOfT, yearX, titleX, RH, DH, TOP, roomy};
}

/* ---------- 畫圖 ---------- */
function timelineSvg(L){
  const W = L.W, H = L.H, tree = L.mode==='tree', rel = relatedSet(), f = v => v.toFixed(1);
  let g = '';
  // 背景：報紙用詞的比例
  const S = L.samples.map(s=>({y:s.y, sh:shares(s.t)})), bw = L.bx1-L.bx0;
  STACK.forEach((k,i)=>{
    const l = S.map(p=>f(L.bx0+p.sh[i][0]*bw)+','+f(p.y)), r = S.map(p=>f(L.bx0+p.sh[i][1]*bw)+','+f(p.y)).reverse();
    g += `<g class="band" data-tip="${esc('背景：報紙用詞「'+TERMS[k].name+'」的比例')}"><polygon points="${l.concat(r).join(' ')}" fill="${TERMS[k].color}" opacity="${tTerm ? (tTerm===k?.95:.16) : .62}"/><polyline points="${r.join(' ')}" fill="none" stroke="var(--paper)" stroke-width="1.5" opacity=".7"/></g>`;
  });
  // 沒有新聞資料的年份：背景留白，只畫一條虛線標出資料的終點
  { const ye = L.yOfT(DATA_END);
    g += `<line x1="${L.bx0}" x2="${L.bx1}" y1="${f(ye)}" y2="${f(ye)}" stroke="var(--muted)" stroke-width="1.2" stroke-dasharray="5 4" pointer-events="none"/>`;
    g += tree ? `<text class="cav" x="${L.AX+8}" y="${f(ye-5.5)}" font-size="11">2023 年起沒有新聞資料</text>` : `<text class="cav" x="${W-10}" y="${H-7}" text-anchor="end" font-size="11">2023 年起沒有新聞資料</text>`; }
  // 年代：樹狀時是左邊的刻度，直式時是分隔線；都可以點
  const decLabel = d => `${d}年代：這十年的事件、剪報、研究與學生人數`;
  if(tree){
    DECADES.forEach(d=>{ const t0 = Math.max(d,Y0), y = L.yOfT(t0), on = tEra===d;
      if(on){ const ya = L.yOfT(Math.min(d+10,Y1)); g += `<rect x="${L.AX}" y="${f(ya)}" width="${W-L.AX}" height="${f(y-ya)}" fill="var(--ink)" opacity=".08" pointer-events="none"/>`; }
      if(d>Y0) g += `<line x1="${L.AX}" x2="${W}" y1="${f(y)}" y2="${f(y)}" stroke="var(--ink)" stroke-width="1" opacity=".16" pointer-events="none"/>`;
      g += `<g class="dec${on?' on':''}" data-era="${d}" tabindex="0" role="button" aria-pressed="${on}" aria-label="${(t0!==d ? t0+'，' : '')+decLabel(d)}"${on ? '' : ` data-tip="${esc(d+'年代\n點一下看這十年的資料')}"`}><rect class="dbox" x="4" y="${f(y-12)}" width="${L.AX-9}" height="24" rx="12"/><text x="${L.AX/2-.5}" y="${f(y+4.4)}" text-anchor="middle" font-size="12.5">${t0}</text></g>`; });
    g += `<line x1="${L.AX}" x2="${L.AX}" y1="${L.T}" y2="${L.base}" stroke="var(--ink)" stroke-width="1" opacity=".3"/>`;
  } else {
    L.seps.forEach((s,i)=>{ const on = tEra===s.d, y2 = i<L.seps.length-1 ? L.seps[i+1].y : H;
      if(on) g += `<rect x="0" y="${f(s.y)}" width="${W}" height="${f(y2-s.y)}" fill="var(--ink)" opacity=".08" pointer-events="none"/>`;
      if(i) g += `<line x1="0" x2="${W}" y1="${f(s.y)}" y2="${f(s.y)}" stroke="var(--ink)" stroke-width="1" opacity=".2" pointer-events="none"/>`;
      g += `<g class="dec${on?' on':''}" data-era="${s.d}" tabindex="0" role="button" aria-pressed="${on}" aria-label="${decLabel(s.d)}"><rect x="${W-110}" y="${f(s.y-L.DH/2+1)}" width="110" height="${L.DH-2}" fill="transparent"/><rect class="dbox" x="${W-84}" y="${f(s.y-12)}" width="76" height="24" rx="12"/><text x="${W-46}" y="${f(s.y+4.4)}" text-anchor="middle" font-size="12">${s.d}年代</text></g>`; });
  }
  // 選到的事件：樹狀時在左邊的刻度上標出日期
  if(tree && tSel){ const e = byId[tSel], p = L.pos[tSel], lab = whenShort(e).replace('年代',''), w = Math.max(L.AX-8, textW(lab,11.5)+12);
    g += `<line x1="${L.AX}" x2="${f(p.x)}" y1="${f(p.y)}" y2="${f(p.y)}" stroke="${colorOf(e)}" stroke-width="1.2" stroke-dasharray="3 3" pointer-events="none"/><g pointer-events="none"><rect x="3" y="${f(p.y-11)}" width="${f(w)}" height="22" rx="4" fill="var(--ink)"/><text class="inv" x="${f(3+w/2)}" y="${f(p.y+4.2)}" text-anchor="middle" font-size="11.5" font-weight="700">${esc(lab)}</text></g>`; }
  // 枝條
  L.segs.forEach(s=>{
    const lit = !rel || (s.to ? rel.has(s.to) && (!tSel || rel.has(s.from) || (s.from==='root' && s.to===tSel)) : [...rel].some(id=>byId[id].theme===s.theme && (!tSel || byId[id].parents[0]==='root')));
    g += `<path d="${curveD(s.a,s.b)}" fill="none" stroke="var(--c-${s.theme})" stroke-width="${f(tree?s.w:Math.max(2.6,s.w-1.6))}" stroke-linecap="round" opacity="${lit?.85:.16}" pointer-events="none"/>`; });
  Object.keys(L.junc).forEach(t=>{ g += `<circle cx="${f(L.junc[t].x)}" cy="${f(L.junc[t].y)}" r="4.6" fill="var(--c-${t})" pointer-events="none"/>`; });
  const R = L.pos.root;
  g += `<circle cx="${f(R.x)}" cy="${f(R.y)}" r="${tree?7:6}" fill="var(--ink)" pointer-events="none"/>`;
  g += tree ? `<text class="rootlab" x="${f(R.x)}" y="${f(R.y+25)}" text-anchor="middle" font-size="15.5">${esc(byId.root.title)}</text>`
            : `<text class="rootlab" x="${L.titleX}" y="${f(R.y+5.5)}" font-size="16">${esc(byId.root.title)}</text>`;
  // 分支與主幹的名稱（樹狀）
  if(tree) L.names.forEach(n=>{ g += `<g class="bname" pointer-events="none">${mark(n.shape, n.x+9, n.y+n.h/2, 4.4, `fill="var(--c-${n.theme})"`)}<text x="${f(n.x+19)}" y="${f(n.y+n.h/2+4.6)}" font-size="13">${esc(n.text)}</text></g>`; });
  // 事件
  const evAttr = (e,cls,name) => { const on = tSel===e.id; return `class="ev ${cls}${on?' on':''}${rel ? (rel.has(e.id) ? (on?'':' rel') : ' dim') : ''}" data-id="${e.id}" style="--c:${colorOf(e)}" tabindex="0" role="button" aria-pressed="${on}" aria-label="${esc(name)}"`; };
  if(tree){
    L.labels.forEach(b=>{ const e = byId[b.id], p = L.pos[e.id], tx = b.side==='L' ? b.x+b.w-6 : b.x+6;
      const hx = Math.min(p.x-11,b.x), hy = Math.min(p.y-11,b.y-4), hw = Math.max(p.x+11,b.x+b.w)-hx, hh = Math.max(p.y+11,b.y+b.h+4)-hy;
      g += `<g ${evAttr(e,'node',e.title+'，'+whenLong(e)+'，'+branchName(e))} data-tip="${esc(whenLong(e)+'\n'+branchName(e))}"><rect x="${f(hx)}" y="${f(hy)}" width="${f(hw)}" height="${f(hh)}" fill="transparent"/>
        ${b.far ? `<path d="M${f(p.x)} ${f(p.y)} L${f(b.side==='L'?b.x+b.w:b.x)} ${f(b.y+b.h/2)}" stroke="var(--c)" stroke-width="1.4" fill="none"/>` : ''}
        <rect class="lb" x="${f(b.x)}" y="${f(b.y)}" width="${b.w}" height="${f(b.h)}" rx="5"/>
        <text class="lt" text-anchor="${b.side==='L'?'end':'start'}" font-size="13">${e.lines.map((s,i)=>`<tspan x="${f(tx)}" y="${f(b.y+3.5+L.lh*(i+1)-4.4)}">${esc(s)}</tspan>`).join(e.gap)}</text>
        ${mark(shapeOf(e),p.x,p.y,6.4,'class="mk"')}</g>`; });
  } else {
    L.rows.forEach(r=>{ const e = r.e, p = L.pos[e.id], yr = String(e.when||e.y), day = (e.dd||e.mo) && whenLong(e)!==yr ? whenLong(e) : '';
      const third = L.roomy ? (day||branchName(e)) : '';          // 寬一點的時候，右邊多寫一欄：有月日就寫日期，沒有就寫分支
      const name = [[yr, e.title, third].filter(Boolean).join(' ')].concat(day && third!==day ? [day] : [], third!==branchName(e) ? [branchName(e)] : []).join('，');
      g += `<g ${evAttr(e,'row',name)}><rect class="rowbg" x="5" y="${f(r.y-L.RH/2+3)}" width="${W-10}" height="${L.RH-6}" rx="9"/>
        <line class="lead" x1="${f(p.x+10)}" x2="${L.yearX-7}" y1="${f(r.y)}" y2="${f(r.y)}"/>
        <text class="yr" x="${L.yearX}" y="${f(r.y+4.5)}" font-size="${e.when?10.5:12.5}">${esc(e.when||e.y)}</text>
        <text class="lt" x="${L.titleX}" y="${f(r.y+5.2)}" font-size="14.5">${esc(e.title)}</text>
        ${third ? `<text class="yr" x="${W-16}" y="${f(r.y+4.5)}" text-anchor="end" font-size="12">${esc(third)}</text>` : ''}
        ${mark(shapeOf(e),p.x,p.y,6,'class="mk"')}</g>`; });
  }
  return `<svg class="tsvg ${L.mode}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="group" aria-label="${tree?'重大事件的樹狀圖，由下往上越來越晚':'重大事件的時間軸，由上往下越來越晚'}">${g}</svg>`;
}

/* ---------- 說明：寬的畫面在右邊一欄，窄的畫面從下方滑出 ---------- */
const jumpBtn = x => `<button class="jump" data-jump="${x.id}" style="--c:${colorOf(x)}">${icon(shapeOf(x),colorOf(x))}<span>${esc(x.title)}</span><small>${esc(whenShort(x))}</small></button>`;
function eventHtml(e){
  const i = ORDER.indexOf(e.id), prev = ORDER[i-1], next = ORDER[i+1];
  const causes = e.parents.filter(p=>p!=='root').map(p=>byId[p]), effects = EVENTS.filter(x=>x.parents.includes(e.id)).sort((a,b)=>a.t-b.t);
  const lines = e.desc.split('\n'), k = lines.findIndex(s=>s.startsWith('備註：'));
  const main = (k<0?lines:lines.slice(0,k)).map(s=>`<p>${esc(s)}</p>`).join('');
  const memo = k<0 ? '' : `<div class="memo"><h3>備註</h3>${lines.slice(k).map((s,j)=>`<p>${esc(j?s:s.replace(/^備註：/,''))}</p>`).join('')}</div>`;
  return `<p class="pn-kind">${icon(shapeOf(e),colorOf(e))}${esc(branchName(e))}</p>
    <h2 tabindex="-1">${esc(e.title)}</h2>
    <p class="pn-date">${esc(whenLong(e))}</p>
    <div class="pn-desc">${main}${memo}</div>
    ${e.trends&&e.trends.length ? `<p class="pn-terms">法規裡用的詞${e.trends.map(t=>`<button class="tchip sm" data-term="${t}" style="--c:${TERMS[t].color}"><i></i>${esc(TERMS[t].name)}</button>`).join('')}</p>` : ''}
    ${causes.length ? `<div class="pn-rel"><h3>往前看</h3>${causes.map(jumpBtn).join('')}</div>` : ''}
    ${effects.length ? `<div class="pn-rel"><h3>往後看</h3>${effects.map(jumpBtn).join('')}</div>` : ''}
    <div class="pager"><button class="btn" data-act="tl-prev" data-to="${prev||''}"${prev?'':' disabled'}>‹ 上一件</button><span>${i+1} / ${ORDER.length}</span><button class="btn" data-act="tl-next" data-to="${next||''}"${next?'':' disabled'}>下一件 ›</button></div>`;
}
function termHtml(k){
  const t = TERMS[k], evs = EVENTS.filter(e=>(e.trends||[]).includes(k)).sort((a,b)=>a.t-b.t);
  return `<p class="pn-kind"><i class="sw" style="background:${t.color}"></i>新聞用詞</p>
    <h2 tabindex="-1">${esc(t.name)}</h2>
    <p class="pn-date">${esc(t.span)}</p>
    <div class="pn-desc">${t.desc.split('\n').map(s=>`<p>${esc(s)}</p>`).join('')}</div>
    ${evs.length ? `<div class="pn-rel"><h3>法規用到這個詞的事件</h3>${evs.map(jumpBtn).join('')}</div>` : ''}
    <p class="pn-go"><a href="#news" data-act="to-terms">到剪報展區看用詞的圓圈圖</a></p>`;
}
// 年代：把四份資料在這十年的狀況放在一起
function eraHtml(d){
  const A = NEWS.filter(a=>a.dec===d), Lt = LIT.filter(r=>r.dec===d), ev = ORDER.map(id=>byId[id]).filter(e=>e.dec===d);
  const st = newsStats('view',d,false), tm = newsStats('term',d,false);
  // 每一列：[名稱, 數字, 可以連過去的展區, 展區的名稱]
  const li = [['重大事件', ev.length+' 件'], ['新聞', A.length+' 篇', A.length ? 'news' : '', '剪報']];
  if(tm.top) li.push(['新聞比例最高的用詞', tm.top+' '+pct(tm.share(tm.top))]);
  if(st.top) li.push(['新聞比例最高的觀點', (RAW.viewShort[st.top]||st.top)+' '+pct(st.share(st.top))]);
  li.push(['研究', Lt.length+' 篇', Lt.length ? 'research' : '', '研究']);
  const ys = Object.keys(PEOPLE.nation.ID).map(Number).filter(y=>decadeOf(y)===d).sort((a,b)=>a-b);
  if(ys.length) li.push(['智能障礙學生', ys[0]+' 年 '+fmtN(PEOPLE.nation.ID[ys[0]])+' 人'+(ys.length>1 ? '，'+ys[ys.length-1]+' 年 '+fmtN(PEOPLE.nation.ID[ys[ys.length-1]])+' 人' : ''), 'people', '人數']);
  // 數字太長要換行時，在逗號的地方換；箭頭代表「可以連過去」，跟著最後一段
  const nb = (s,tail) => { const a = String(s).split('，'); return a.map((t,i)=>`<span class="nb">${esc(t)}${i<a.length-1 ? '，' : (tail||'')}</span>`).join(''); };
  const row = x => `<div><dt>${x[0]}</dt><dd>${x[2] ? `<a href="#${x[2]}" data-act="to-era" data-to="${x[2]}" data-era="${d}" aria-label="${esc(x[0]+' '+x[1]+'，到'+x[3]+'展區看 '+d+'年代')}">${nb(x[1],'<span aria-hidden="true"> →</span>')}</a>` : nb(x[1])}</dd></div>`;
  return `<p class="pn-kind">年代</p>
    <h2 tabindex="-1">${d}年代</h2>
    <dl class="pn-sum">${li.map(row).join('')}</dl>
    ${A.length ? `<div class="pn-rose"><h3>這十年新聞的觀點</h3>${roseSvg('view',st,newsScale('view',false),{era:d, kind:'mini'})}</div>` : ''}
    ${ev.length ? `<div class="pn-rel"><h3>這十年的事件</h3>${ev.map(jumpBtn).join('')}</div>` : ''}`;
}
function introHtml(){
  return `<h2 tabindex="-1">${esc(byId.root.title)}</h2>
    <div class="pn-desc"><p>${esc(byId.root.desc)}</p></div>
    <dl class="pn-sum"><div><dt>主幹</dt><dd>${Object.keys(THEMES).length} 條</dd></div><div><dt>事件</dt><dd>${ORDER.length} 件</dd></div><div><dt>新聞</dt><dd>${NEWS.length} 篇</dd></div><div><dt>研究</dt><dd>${LIT.length} 篇</dd></div></dl>
    <p class="pn-start"><button class="btn solid" data-act="tl-first">從最早的事件開始看</button></p>`;
}
const panelHtml = () => tSel ? eventHtml(byId[tSel]) : tTerm ? termHtml(tTerm) : tEra!=null ? eraHtml(tEra) : introHtml();
function tlClear(){ tSel = tTerm = null; tEra = null; }
function drawPanel(){
  const p = $('#panel');
  if(p){ closeSheet(true); p.innerHTML = panelHtml(); p.scrollTop = 0; return; }
  if(tAny()){ openSheet(panelHtml(), ()=>{ const id = tSel; tlClear(); render(); const el = id && $('#view [data-id="'+id+'"]'); if(el){ try{ el.focus({preventScroll:true}); }catch(e){} } }); $('#sheetBody').scrollTop = 0; }
  else closeSheet(true);
}
// 手機：選了事件後，把它捲到說明上方看得到的位置
function revealSelected(){
  const el = tSel ? $('#view [data-id="'+tSel+'"]') : tEra!=null ? $('#view [data-era="'+tEra+'"]') : null; if(!el || sheet.hidden) return;
  const r = el.getBoundingClientRect(), top = mastBottom()+10, bot = window.innerHeight-sheet.offsetHeight-14;
  if(r.top<top || r.bottom>bot) window.scrollTo({top:Math.max(0, window.scrollY+r.top-top-Math.max(0,(bot-top-r.height)/2)), behavior:calm()?'auto':'smooth'});
}
// 文字清單：依年代排列，方便鍵盤與螢幕報讀軟體使用
function listHtml(){
  const rel = relatedSet();
  return `<div class="tlist plate">${DECADES.map(d=>{ const ev = ORDER.map(id=>byId[id]).filter(e=>e.dec===d); if(!ev.length) return '';
    return `<h2>${d}年代</h2><ol>${ev.map(e=>`<li><button class="litem${rel&&!rel.has(e.id)?' dim':''}" data-id="${e.id}" aria-pressed="${tSel===e.id}" style="--c:${colorOf(e)}"><span class="ld">${esc(whenLong(e))}</span><b>${esc(e.title)}</b><span class="lm">${icon(shapeOf(e),colorOf(e))}${esc(branchName(e))}</span></button></li>`).join('')}</ol>`; }).join('')}</div>`;
}
function drawTimeline(){
  const fig = $('#tlFig'); if(!fig) return;
  const W = Math.floor(fig.clientWidth), tree = W>=620, keys = $('#tlKeys');
  if(keys) keys.hidden = tree;                    // 樹狀圖上已經直接寫了每一支的名稱，不用另外放圖例
  if(tree){ const top = fig.getBoundingClientRect().top+window.scrollY, below = ($('.tl-terms') ? $('.tl-terms').offsetHeight : 0)+28;
    TL = layoutTree(W, Math.max(400, Math.min(780, Math.floor(window.innerHeight-top-below)))); }
  else TL = layoutLanes(W);
  fig.innerHTML = timelineSvg(TL);
  const lead = $('.ph-lead'); if(lead) lead.textContent = treeLead(tree);
}
const treeLead = tree => `重大事件表的 ${ORDER.length} 件事，${tree?'由下往上':'由上往下'}依時間排列，分成「測驗」與「法規與鑑定」兩條主幹。背景色塊是同一時間報紙新聞使用名詞的比例。`;
DRAW.tree = function(){
  const wide = vw()>=1040;
  view.innerHTML = `<div class="wrap">${pageHead('tree',{lead:treeLead(wide), tools:`<button class="btn" data-act="tl-clear"${tAny()?'':' hidden'}>清除選取</button><button class="btn" id="tlListBtn" data-act="tl-list" aria-pressed="${tList}">文字清單</button>`})}
    <div class="tl${wide?' wide':''}">
      <div class="tl-main">
        <ul class="keys" id="tlKeys" aria-label="圖例：節點的形狀" hidden>
          ${Object.keys(SUBS).map(k=>`<li>${icon(SUBS[k].shape,'var(--c-test)')}${esc(SUBS[k].name)}</li>`).join('')}<li>${icon(THEMES.law.shape,'var(--c-law)')}${esc(THEMES.law.name)}</li>
        </ul>
        ${tList ? listHtml() : '<div class="plate tl-fig" id="tlFig"></div>'}
        <div class="tl-terms"${tList?' hidden':''}><span class="lbl">背景：報紙用詞的比例</span>${STACK.map(k=>`<button class="tchip" data-term="${k}" aria-pressed="${tTerm===k}" style="--c:${TERMS[k].color}"><i></i>${esc(TERMS[k].name)}</button>`).join('')}</div>
      </div>
      ${wide ? '<aside class="panel plate" id="panel" aria-live="polite" aria-label="說明"></aside>' : ''}
    </div>${routeHtml()}</div>`;
  if(!tList) drawTimeline();
  drawPanel();
};
TOURS.tree = () => { const tree = TL && TL.mode==='tree' && !tList;
  return [
    {sel:tList?'.tlist':'#tlFig', title:'時間軸', text:(tList ? '事件依年代排成清單。' : tree ? '這棵樹由下往上越來越晚。' : '由上往下越來越晚；左邊是枝條，右邊一行一件事。')+'兩條主幹是「測驗」與「法規與鑑定」，節點的形狀代表不同的分支。'},
    {sel:'#view [data-id="'+ORDER[0]+'"]', title:'點事件看說明', text:'點任何一個事件，會顯示日期與說明；可以用「上一件／下一件」依時間順序一件一件看。'},
    {sel:'#tlFig [data-era="1980"]', title:'點年代', text:'會列出那十年的重大事件、剪報、研究與學生人數；點後面有箭頭的數字，可以到那個展區看同一個年代。'},
    {sel:'.tl-terms', title:'背景是報紙用詞的比例', text:'點一個詞，可以單獨看它在各個時間占的比例；法規裡用到這個詞的事件會保持清楚，其他的變淡。'},
    {sel:'#tlListBtn', title:'文字清單', text:'把事件排成純文字的清單。按 Esc 或「清除選取」可以取消選取。'}
  ]; };
function tlPick(kind,v,toggle){
  const inSheet = sheet.contains(document.activeElement);
  if(kind==='ev'){ tSel = (toggle && tSel===v) ? null : v; tTerm = null; tEra = null; }
  else if(kind==='term'){ tTerm = (tTerm===v) ? null : v; tSel = null; tEra = null; }
  else { tEra = (tEra===v) ? null : v; tSel = null; tTerm = null; }
  hideTip(); render();
  if(!$('#panel') && tAny()){ revealSelected(); if(!inSheet){ const h = $('#sheetBody h2'); if(h){ try{ h.focus({preventScroll:true}); }catch(e){} } } }
}
function treeClick(e){
  if(page!=='tree') return;
  const t = e.target; let el;
  if((el = t.closest('[data-sheet-close]'))) return closeSheet();
  if((el = t.closest('[data-act]'))){ const a = el.dataset.act;
    if(a==='tl-clear'){ tlClear(); render(); const b = $('#tlListBtn'); if(b) b.focus(); return; }
    if(a==='tl-list'){ tList = !tList; render(); return; }
    if(a==='tl-first') return tlPick('ev', ORDER[0]);
    if(a==='tl-prev' || a==='tl-next'){ if(el.dataset.to) tlPick('ev', el.dataset.to); return; }
    if(a==='to-terms'){ e.preventDefault(); newsDim = 'term'; newsCat = null; newsEra = null; return go('news'); }
    if(a==='to-era'){ e.preventDefault(); const to = el.dataset.to||'news', d = +el.dataset.era;
      if(to==='news'){ newsDim = 'view'; newsCat = null; newsEra = d; return go('news', undefined, {quiet:true}); }
      return goEra(to, d); }
    return; }
  if((el = t.closest('[data-jump]'))) return tlPick('ev', el.dataset.jump);
  if((el = t.closest('[data-term]'))) return tlPick('term', el.dataset.term);
  if((el = t.closest('[data-era]'))) return tlPick('era', +el.dataset.era);
  if((el = t.closest('[data-id]'))) return tlPick('ev', el.dataset.id, true);
}
view.addEventListener('click', treeClick);
sheet.addEventListener('click', treeClick);
