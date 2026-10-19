/* ============ 版本 1：文字年表 ============
   所有版本的基準：ol／li、time、年代與事件的標題層級，DOM 的順序就是閱讀順序。細節在原處展開，不用另外的說明欄。 */
const TX = {open:new Set()};
VERS.push({id:'text', no:'版本 1', name:'文字年表', panel:false,
  basis:'第三部分 4.1、4.2：等價的文字年表要最優先；縱向單線是所有樣式的無障礙退化目標。',
  fit:'任何數量的事件；螢幕報讀軟體使用者可以按 H 鍵在年代與事件之間跳讀。',
  tradeoff:'看不出時間的比例與同時性，但最穩定、最好讀。其他版本的內容都和這一版相同。',
  keys:'Tab 到「看細節」按鈕，Enter 展開或收起；細節裡的「往前看／往後看」會跳到那一件。',
  draw(root){
    if(S.e) TX.open.add(S.e);
    const VO = shown();
    root.innerHTML = `<div class="plate vtext"><p class="vtext-lead">${VO.length} 件事件，依時間先後排列。</p>${DECADES.map(d=>{ const ev = VO.filter(e=>e.dec===d); if(!ev.length) return '';
      return `<section aria-labelledby="dec-${d}"><h2 id="dec-${d}">${d}年代<small>${ev.length} 件</small></h2><ol class="tline">${ev.map(e=>{ const on = TX.open.has(e.id);
        return `<li style="--c:${colorOf(e.track)}"${S.e===e.id?' class="on"':''}>
          <span class="tl-mk" aria-hidden="true">${icon(e.track)}</span>
          <h3>${timeTag(e)}<span class="tt">${esc(e.title)}</span></h3>
          <p class="lm">${esc(kindLabel(e))}｜日期精確度：${PREC[e.precision]}${e.media.some(m=>m.kind==='photo')?'｜有照片':''}${e.media.some(m=>m.kind==='audio')?'｜有訪談':''}</p>
          <p class="sum">${esc(e.summary.split('\n')[0])}</p>
          <button class="btn sm xbtn" data-id="${e.id}" aria-expanded="${on}" aria-controls="d-${e.id}">${on?'收起細節':'看細節與史料'}</button>
          <div class="xdetail" id="d-${e.id}"${on?'':' hidden'}>${on ? detailHtml(e,{inline:true}) : ''}</div></li>`; }).join('')}</ol></section>`; }).join('')}</div>`;
  },
  onPick(id, el){
    const toggle = el.classList.contains('xbtn');
    if(toggle){ TX.open.has(id) ? TX.open.delete(id) : TX.open.add(id); S.e = TX.open.has(id) ? id : null; }
    else { TX.open.add(id); S.e = id; }          // 細節裡的「往前看／往後看」：打開那一件
    writeUrl(false); render();
    const b = $('#vpanel .xbtn[data-id="'+id+'"]'); if(b){ b.focus({preventScroll:true}); if(!toggle) reveal(b.closest('li')); }
    return false;
  }
});
