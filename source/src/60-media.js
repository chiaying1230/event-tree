
/* ============ 照片與訪談的清單 ============
   把檔案放進網站的 photos/ 與 audio/ 資料夾（和 index.html 放在一起），再在下面兩個清單各加一筆資料，就會出現在展區裡。
   清單裡只要有一筆真實資料，版面示意就不再顯示。
   每一筆寫在一對 { } 裡，筆與筆之間用逗號分開；文字要用引號包起來。 */
const PHOTOS = [
  // 範例：照著這個樣子填，一張照片一筆，依年代先後排。alt 是給看不到圖片的讀者的畫面描述，一定要寫
  // {src:'photos/檔名.jpg', alt:'（畫面描述：誰、在哪裡、正在做什麼）', title:'標題', year:1985, credit:'來源或拍攝者', caption:'圖說'},
];
const INTERVIEWS = [
  // 範例：dur 是錄音的全長（秒）；segs 是逐字稿，每一段寫 [開始的秒數, '說話的人', '這一段的內容']
  // {src:'audio/檔名.mp3', title:'標題', who:'受訪者的稱呼', date:'2025 年 3 月', dur:96, summary:'摘要',
  //  segs:[[0,'訪談者','第一段的逐字稿'], [14,'受訪者','第二段的逐字稿']]},
];

/* ---------- 版面示意：上面的清單是空的時候才會用到，不是真實資料 ---------- */
function mockPhoto(i,w,h){
  const tones = [['#C9CFC8','#8E9A97'],['#D3CBBB','#9A8E76'],['#BFCBD3','#7F93A1'],['#CFC6C9','#978A90']][i%4];
  const g = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${tones[0]}"/>`+
    `<path d="M0 ${h*.72} L${w*.28} ${h*.46} L${w*.5} ${h*.66} L${w*.74} ${h*.38} L${w} ${h*.62} V${h} H0Z" fill="${tones[1]}" opacity=".55"/>`+
    `<circle cx="${w*.78}" cy="${h*.24}" r="${Math.min(w,h)*.07}" fill="#F7F8F4" opacity=".7"/>`+
    `<text x="${w/2}" y="${h*.9}" text-anchor="middle" font-family="sans-serif" font-size="${Math.round(w*.045)}" fill="#1F2A2E" opacity=".75">示意照片 ${i+1}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(g);
}
if(!PHOTOS.length) [[1964,4,3],[1968,3,4],[1973,1,1],[1975,4,3],[1979,3,2],[1984,3,4],[1986,4,3],[1988,1,1],[1991,3,2],[1995,4,3],[1998,3,4],[2003,4,3],[2006,16,9],[2012,1,1],[2015,4,3],[2019,3,4],[2022,3,2]].forEach((p,i)=>PHOTOS.push({
  src:mockPhoto(i,p[1]*120,p[2]*120), year:p[0], sample:true,
  title:'示意照片 '+(i+1), alt:'示意圖：灰色色塊與山形輪廓，沒有實際內容',
  caption:'這裡放圖說：照片的時間、地點，以及畫面裡正在發生的事。', credit:'來源或拍攝者'}));
if(!INTERVIEWS.length) INTERVIEWS.push(
  {title:'示意訪談一', who:'受訪者 A', date:'2025 年 3 月', dur:96, sample:true,
   summary:'這裡放訪談摘要：受訪者的身分背景，以及這段訪談談到的主題。',
   segs:[[0,'訪談者','說明訪談目的，確認受訪者同意錄音與公開。'],[14,'受訪者','這裡放受訪者的回答。逐字稿依時間分段，點左邊的時間可以跳到那一段。'],[38,'訪談者','第二個問題。'],[46,'受訪者','播放的時候，正在播放的段落會標示出來，方便邊聽邊讀。'],[74,'訪談者','結尾與致謝。']]},
  {title:'示意訪談二', who:'受訪者 B', date:'2025 年 5 月', dur:132, sample:true,
   summary:'這裡放訪談摘要。',
   segs:[[0,'訪談者','開場。'],[20,'受訪者','第一段回答。'],[58,'訪談者','追問。'],[66,'受訪者','第二段回答。'],[110,'訪談者','結尾。']]},
  {title:'示意訪談三', who:'受訪者 C', date:'2025 年 6 月', dur:78, sample:true,
   summary:'這裡放訪談摘要。',
   segs:[[0,'訪談者','開場。'],[12,'受訪者','第一段回答。'],[44,'受訪者','第二段回答。'],[66,'訪談者','結尾。']]}
);
INTERVIEWS.forEach(a=>{ a.dur = +a.dur||0; a.segs = a.segs||[]; });
const mmss = t => { t = +t||0; return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'); };
// 聲音波形的示意：沒有真實錄音時，用固定的亂數產生長短不一的直條
function wavePeaks(seed,n){ let s = seed*9301+49297; const out = []; for(let i=0;i<n;i++){ s = (s*9301+49297)%233280; const r = s/233280; out.push(.25+.75*Math.abs(Math.sin(i*.35+seed))*r+.1*r); } return out.map(v=>Math.min(1,v)); }
const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="ic-play" d="M8 5.5v13l11-6.5z"/><path class="ic-pause" d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';

/* ============ 照片：固定在一個畫面裡的投影片 ============ */
const SH = {i:0, playing:false, timer:null}, SH_SECONDS = 5;
function shStop(){
  if(SH.timer){ clearInterval(SH.timer); SH.timer = null; } SH.playing = false;
  const b = $('#shPlay'); if(b){ b.setAttribute('aria-pressed','false'); b.textContent = '自動播放'; }
  const c = $('#shCap'); if(c) c.setAttribute('aria-live','polite');
}
function shPlay(){
  shStop(); SH.playing = true; SH.timer = setInterval(()=>shShow((SH.i+1)%PHOTOS.length), SH_SECONDS*1000);
  const b = $('#shPlay'); if(b){ b.setAttribute('aria-pressed','true'); b.textContent = '暫停'; }
  const c = $('#shCap'); if(c) c.setAttribute('aria-live','off');
}
function shShow(i){
  const p = PHOTOS[i]; if(!p) return; SH.i = i;
  const img = $('#shImg'); if(!img) return shStop();
  img.style.opacity = 0; img.onload = ()=>{ img.style.opacity = 1; }; img.src = p.src; img.alt = p.alt||p.title||''; if(img.complete) img.style.opacity = 1;
  $('#shYear').textContent = p.year||''; $('#shTitle').textContent = p.title||''; $('#shText').textContent = p.caption||''; $('#shCredit').textContent = p.credit||'';
  $('#shCount').textContent = (i+1)+' / '+PHOTOS.length;
  const strip = $('#shStrip');
  $$('button',strip).forEach((b,k)=>{ const on = k===i; b.setAttribute('aria-current', on?'true':'false'); if(on) strip.scrollLeft = b.offsetLeft-(strip.clientWidth-b.offsetWidth)/2; });
}
const shStep = d => shShow((SH.i+d+PHOTOS.length)%PHOTOS.length);
// 寬的畫面：整個投影片剛好放進視窗剩下的高度，不用捲動
function fitShow(){
  const s = $('#show'); if(!s) return;
  if(vw()<860){ s.style.height = ''; return; }
  const top = s.getBoundingClientRect().top+window.scrollY;
  s.style.height = Math.max(430, Math.floor(window.innerHeight-top-26))+'px';
}
DRAW.photos = function(){
  shStop();
  if(!PHOTOS.length){ view.innerHTML = `<div class="wrap">${pageHead('photos')}<div class="empty plate"><h2>照片尚未放入</h2><p>這個展區會把照片做成投影片，一張一張播放。</p></div>${routeHtml()}</div>`; return; }
  if(SH.i>=PHOTOS.length) SH.i = 0;
  view.innerHTML = `<div class="wrap">${pageHead('photos')}
    <div class="show plate" id="show">
      <div class="stage" id="shStage"><img id="shImg" alt="">
        <button class="snav prev" data-ph="prev" aria-label="上一張">‹</button><button class="snav next" data-ph="next" aria-label="下一張">›</button></div>
      <div class="scap" id="shCap" aria-live="polite">
        <p class="syear" id="shYear"></p><h2 id="shTitle"></h2><p class="kai" id="shText"></p><p class="scredit" id="shCredit"></p>
        ${PHOTOS.some(p=>p.sample) ? '<p class="sample">目前是版面示意，照片與圖說不是真實資料。</p>' : ''}
      </div>
      <div class="sbar">
        <button class="btn" id="shPlay" data-ph="play" aria-pressed="false">自動播放</button>
        <span class="scount" id="shCount"></span>
        <div class="strip" id="shStrip" role="group" aria-label="所有照片">${PHOTOS.map((p,i)=>`<button data-ph="${i}" aria-label="第 ${i+1} 張：${esc(p.title||'照片')}，${p.year||''}" aria-current="false"><img src="${esc(p.src)}" alt="" loading="lazy"><span>${p.year||''}</span></button>`).join('')}</div>
        ${document.fullscreenEnabled ? '<button class="btn" data-ph="full">全螢幕</button>' : ''}
      </div>
    </div>${routeHtml()}</div>`;
  fitShow(); shShow(SH.i);
};
TOURS.photos = () => [
  {sel:'#shStage', title:'投影片', text:'按鍵盤的左右鍵、照片兩旁的箭頭，或在照片上左右滑動，可以換上一張或下一張。'},
  {sel:'#view .sbar', title:'自動播放與縮圖', text:'「自動播放」每 '+SH_SECONDS+' 秒換一張；也可以直接點下面的縮圖。'}
];
view.addEventListener('click', e=>{
  const el = e.target.closest('[data-ph]'); if(!el || page!=='photos') return;
  const v = el.dataset.ph;
  if(v==='play') return SH.playing ? shStop() : shPlay();
  if(v==='full'){ const s = $('#show'); try{ if(document.fullscreenElement) document.exitFullscreen(); else if(s.requestFullscreen) s.requestFullscreen().catch(()=>{}); }catch(err){} return; }
  if(v==='prev') return shStep(-1);
  if(v==='next') return shStep(1);
  shShow(+v);
});
document.addEventListener('keydown', e=>{ if(page!=='photos' || e.target.closest('input,select,textarea')) return;
  if(e.key==='ArrowLeft'){ e.preventDefault(); shStep(-1); } if(e.key==='ArrowRight'){ e.preventDefault(); shStep(1); } });
onSwipe('#shStage', d=>{ if(page==='photos') shStep(d); });

/* ============ 訪談：播放器與同步的逐字稿 ============
   有錄音檔（src）時播放真正的聲音；示意資料沒有錄音，只用計時器示範播放進度與逐字稿同步。
   開始播放後，畫面下方會出現一條播放列，往下讀逐字稿時也按得到播放鍵 */
const PL = {i:-1, t:0, playing:false, timer:null, audio:null}, WAVE_N = 72, dock = $('#dock');
// 播放列出現時，頁尾多留一段空白；鍵盤聚焦的元素也不會捲到播放列底下
const setDock = on => { document.body.classList.toggle('has-dock',on); document.documentElement.classList.toggle('has-dock',on); };
const ivMeta = a => [a.who, a.date, a.dur ? '全長 '+mmss(a.dur) : ''].filter(Boolean).join('　');
// 有錄音檔但清單裡沒有寫全長的：進到訪談展區時先讀檔案的資訊，把全長補上
function ivProbe(){
  INTERVIEWS.forEach((a,i)=>{ if(!a.src || a.dur || a.probed) return; a.probed = true;
    const t = new Audio(); t.preload = 'metadata';
    t.addEventListener('loadedmetadata', ()=>{ if(!isFinite(t.duration) || a.dur) return; a.dur = t.duration;
      const el = $('.iv[data-iv="'+i+'"]'); if(!el) return; $('.meta',el).textContent = ivMeta(a); if(PL.i===i) plPaint(); else plReset(i); });
    t.src = a.src; });
}
function plStop(){ if(PL.timer){ clearInterval(PL.timer); PL.timer = null; } if(PL.audio) PL.audio.pause(); PL.playing = false; }
function plPaint(){
  const i = PL.i, a = INTERVIEWS[i]; if(!a) return;
  const dur = a.dur||1, t = Math.min(PL.t,dur); let cur = -1; a.segs.forEach((s,k)=>{ if(t>=s[0]) cur = k; });
  const el = $('.iv[data-iv="'+i+'"]');
  if(el){
    const done = Math.round(t/dur*WAVE_N);
    $$('.wave i',el).forEach((b,k)=>b.classList.toggle('on',k<done));
    $('.time',el).textContent = mmss(t)+' / '+mmss(dur);
    const rg = $('input[type=range]',el); rg.max = Math.round(dur); if(document.activeElement!==rg) rg.value = Math.round(t); rg.setAttribute('aria-valuetext', mmss(t)+'，全長 '+mmss(dur));
    const pp = $('.pp',el); pp.setAttribute('aria-pressed',PL.playing); pp.setAttribute('aria-label',(PL.playing?'暫停：':'播放：')+a.title); pp.classList.toggle('playing',PL.playing);
    $$('.segs li',el).forEach((li,k)=>li.classList.toggle('now', k===cur && (PL.playing || t>0)));
  }
  // 下方的播放列
  const show = page==='audio' && (PL.playing || t>0);
  if(show){
    $('#dockTitle').textContent = a.title; $('#dockTime').textContent = mmss(t)+' / '+mmss(dur);
    $('#dockSeg').textContent = cur>=0 ? a.segs[cur][1]+'：'+a.segs[cur][2] : '';
    $('#dockBar').style.width = (t/dur*100).toFixed(2)+'%';
    const dp = $('#dockPlay'); dp.setAttribute('aria-pressed',PL.playing); dp.setAttribute('aria-label',(PL.playing?'暫停：':'播放：')+a.title); dp.classList.toggle('playing',PL.playing);
  }
  if(dock.hidden===show){ dock.hidden = !show; setDock(show); }
}
function plReset(i){
  const el = $('.iv[data-iv="'+i+'"]'); if(!el) return; const a = INTERVIEWS[i];
  $$('.wave i',el).forEach(b=>b.classList.remove('on')); $$('.segs li',el).forEach(li=>li.classList.remove('now'));
  $('.time',el).textContent = '0:00 / '+mmss(a.dur); const rg = $('input[type=range]',el); rg.max = Math.round(a.dur); rg.value = 0; rg.setAttribute('aria-valuetext', '0:00，全長 '+mmss(a.dur));
  const pp = $('.pp',el); pp.setAttribute('aria-pressed','false'); pp.setAttribute('aria-label','播放：'+a.title); pp.classList.remove('playing');
}
function plLoad(i){
  if(PL.i===i) return; const old = PL.i; plStop(); PL.audio = null; PL.i = i; PL.t = 0; if(old>=0) plReset(old);
  const a = INTERVIEWS[i];
  if(a.src){ PL.audio = new Audio(a.src); PL.audio.addEventListener('timeupdate',()=>{ PL.t = PL.audio.currentTime; plPaint(); });
    PL.audio.addEventListener('loadedmetadata',()=>{ if(isFinite(PL.audio.duration)) a.dur = PL.audio.duration; plPaint(); }); PL.audio.addEventListener('ended',()=>{ PL.playing = false; plPaint(); }); }
}
function plPlay(){
  const a = INTERVIEWS[PL.i]; if(!a) return; PL.playing = true;
  if(PL.audio){ PL.audio.play().catch(()=>{ PL.playing = false; plPaint(); }); }
  else { if(PL.t>=a.dur) PL.t = 0; PL.timer = setInterval(()=>{ PL.t += .25; if(PL.t>=a.dur){ PL.t = a.dur; plStop(); } plPaint(); }, 250); }
  plPaint();
}
function plToggle(i){ plLoad(i); if(PL.playing){ plStop(); plPaint(); } else plPlay(); }
function plSeek(i,t,play){ plLoad(i); PL.t = Math.max(0, Math.min(t,INTERVIEWS[i].dur)); if(PL.audio) PL.audio.currentTime = PL.t; if(play && !PL.playing) plPlay(); else plPaint(); }
function plClose(){ plStop(); const i = PL.i; PL.t = 0; if(PL.audio) PL.audio.currentTime = 0; if(i>=0) plReset(i); dock.hidden = true; setDock(false); }
DRAW.audio = function(){
  plStop(); PL.i = -1; PL.t = 0; PL.audio = null; dock.hidden = true; setDock(false);
  if(!INTERVIEWS.length){ view.innerHTML = `<div class="wrap">${pageHead('audio')}<div class="empty plate"><h2>訪談尚未放入</h2><p>這個展區會列出每一段訪談的錄音與逐字稿。</p></div>${routeHtml()}</div>`; return; }
  view.innerHTML = `<div class="wrap">${pageHead('audio')}
    ${INTERVIEWS.some(a=>a.sample) ? '<p class="sample">這一頁目前是版面示意，訪談內容與逐字稿不是真實資料。示意訪談沒有聲音，按播放只會示範進度與逐字稿的同步。</p>' : ''}
    <ol class="ivs">${INTERVIEWS.map((a,i)=>`<li class="iv plate" data-iv="${i}">
      <div class="iv-head"><p class="iv-no">訪談 ${String(i+1).padStart(2,'0')}</p><h2>${esc(a.title)}</h2><p class="meta">${esc(ivMeta(a))}</p>${a.summary ? `<p class="kai">${esc(a.summary)}</p>` : ''}</div>
      <div class="player">
        <button class="pp" data-pl="${i}" aria-pressed="false" aria-label="播放：${esc(a.title)}">${PLAY_ICON}</button>
        <div class="wavebox"><div class="wave" aria-hidden="true">${wavePeaks(i+1,WAVE_N).map(v=>`<i style="height:${Math.round(v*100)}%"></i>`).join('')}</div>
          <input type="range" id="seek${i}" min="0" max="${Math.round(a.dur)}" step="1" value="0" data-seek="${i}" aria-label="${esc(a.title)}的播放位置" aria-valuetext="0:00，全長 ${mmss(a.dur)}"></div>
        <span class="time">0:00 / ${mmss(a.dur)}</span>
      </div>
      <details class="tr"${i?'':' open'}><summary>逐字稿</summary><ol class="segs">${a.segs.map(s=>`<li><button class="ts" data-ts="${i}:${s[0]}" aria-label="跳到 ${mmss(s[0])}">${mmss(s[0])}</button><span class="sp">${esc(s[1])}</span><p>${esc(s[2])}</p></li>`).join('')}</ol></details>
    </li>`).join('')}</ol>
    <details class="more plate"><summary>每段訪談需要準備的資料</summary><ul class="needs"><li>錄音檔（mp3 或 m4a）</li><li>標題、受訪者的稱呼（是否匿名）與訪談日期</li><li>摘要</li><li>逐字稿，最好附上每一段開始的時間</li><li>受訪者是否同意公開</li></ul></details>
    ${routeHtml()}</div>`;
  ivProbe();
};
TOURS.audio = () => [
  {sel:'#view .iv .player', title:'播放', text:'按播放鍵開始，也可以在波形上拖曳到想聽的位置。開始播放後，畫面下方會出現一條播放列，往下讀逐字稿時也按得到。'},
  {sel:'#view .iv .tr', title:'逐字稿', text:'正在播放的段落會標示出來；點每一段前面的時間，可以跳到那一段。'}
];
view.addEventListener('click', e=>{
  if(page!=='audio') return; let el;
  if((el = e.target.closest('[data-pl]'))) return plToggle(+el.dataset.pl);
  if((el = e.target.closest('[data-ts]'))){ const v = el.dataset.ts.split(':'); return plSeek(+v[0],+v[1],true); }
});
view.addEventListener('input', e=>{ const d = e.target.dataset; if(d && d.seek!==undefined) plSeek(+d.seek, +e.target.value, false); });
dock.addEventListener('click', e=>{
  if(e.target.closest('#dockPlay')) return plToggle(PL.i);
  if(e.target.closest('#dockClose')) return plClose();
  if(e.target.closest('#dockGo')){ const el = $('.iv[data-iv="'+PL.i+'"] .segs li.now') || $('.iv[data-iv="'+PL.i+'"]'); if(el) el.scrollIntoView({block:'center', behavior:calm()?'auto':'smooth'}); }
});
LEAVE.push(()=>{ shStop(); plStop(); dock.hidden = true; setDock(false); });
