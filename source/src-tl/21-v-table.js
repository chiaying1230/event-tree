/* ============ 版本 2：表格年表 ============
   <table> 加 caption 與 scope；欄位是日期、事件、類型、軌道、精確度與出處。按欄位名稱可以排序。 */
const TB = {key:'t', dir:1};
const TB_COLS = [['t','日期'],['title','事件'],['type','類型'],['track','軌道'],['precision','精確度'],['source','出處']];
VERS.push({id:'table', no:'版本 2', name:'表格年表',
  basis:'第三部分 4.1：多軌道資料建議提供表格，欄位為年代、事件、類別、出處，並加 caption 與 scope。',
  fit:'想要比較、排序或列印的讀者；研究者核對出處。',
  tradeoff:'資訊最完整，但沒有時間的空間感。窄的螢幕上表格可以左右捲動（1.4.10 允許資料表這樣做）。',
  keys:'Tab 到欄位名稱，Enter 排序；Tab 到事件名稱，Enter 看說明。',
  draw(root){
    const PK = Object.keys(PREC);
    const cmp = {t:(a,b)=>a.t-b.t, title:(a,b)=>a.title.localeCompare(b.title,'zh-Hant'), type:(a,b)=>a.type.localeCompare(b.type)||a.t-b.t,
      track:(a,b)=>TK.indexOf(a.track)-TK.indexOf(b.track)||a.t-b.t, precision:(a,b)=>PK.indexOf(a.precision)-PK.indexOf(b.precision)||a.t-b.t,
      source:(a,b)=>a.source.localeCompare(b.source,'zh-Hant')||a.t-b.t}[TB.key];
    const rows = shown().slice().sort((a,b)=>cmp(a,b)*TB.dir);
    const th = ([k,n]) => { const on = TB.key===k;
      return `<th scope="col"${on?` aria-sort="${TB.dir>0?'ascending':'descending'}"`:''}><button class="sortb" data-sort="${k}">${n}<span aria-hidden="true">${on?(TB.dir>0?' ▲':' ▼'):''}</span></button></th>`; };
    root.innerHTML = `<div class="plate vtable"><div class="tscroll" role="region" aria-labelledby="tbCap" tabindex="0"><table class="tbl evt">
      <caption id="tbCap">智能障礙相關事件表（${rows.length} 件，依${TB_COLS.find(c=>c[0]===TB.key)[1]}${TB.dir>0?'由小到大':'由大到小'}排列）</caption>
      <thead><tr>${TB_COLS.map(th).join('')}</tr></thead>
      <tbody>${rows.map(e=>`<tr${S.e===e.id?' class="on"':''}><td>${timeTag(e)}</td><th scope="row"><button class="rowb" data-id="${e.id}" aria-pressed="${S.e===e.id}" style="--c:${colorOf(e.track)}">${icon(e.track)}<span>${esc(e.title)}</span></button></th>
        <td>${TYPES[e.type]}</td><td>${esc(trackName(e))}</td><td>${PREC[e.precision]}${e.certainty==='approx'?'（約）':''}</td><td>${esc(e.source)}</td></tr>`).join('')}</tbody></table></div></div>`;
  }
});
document.addEventListener('click', e=>{
  const b = e.target.closest('[data-sort]'); if(!b) return;
  const k = b.dataset.sort; if(TB.key===k) TB.dir = -TB.dir; else { TB.key = k; TB.dir = 1; }
  render(); say('依'+TB_COLS.find(c=>c[0]===k)[1]+(TB.dir>0?'由小到大':'由大到小')+'排列');
});
