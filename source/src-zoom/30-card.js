/* ============ 介紹卡：時間軸下方，只放選到的那件事本身的介紹 ============
   最上面是易讀版（可以用工具列的「易讀版」關掉），完整說明收在「看完整說明」裡；最下面一行是精確度、出處與挑選理由。 */
function cardHtml(){
  if(!S.e) return `<p class="card-empty">點時間軸上的事件，這裡會出現它的介紹。</p>`;
  const e = byId[S.e], ez = EASY[e.id]||'';
  const full = `<div class="pn-desc">${e.summary.split('\n').map(s=>`<p>${esc(s)}</p>`).join('')}</div>
    ${e.memo ? `<div class="memo"><h3>備註</h3>${e.memo.split('\n').map(s=>`<p>${esc(s)}</p>`).join('')}</div>` : ''}`;
  const body = easyOn && ez
    ? `<div class="cr-easy"><p class="cr-easy-h">易讀版${EASY_DRAFT ? '<span>草稿，待審閱</span>' : ''}</p>${ez.split('\n').map(t=>`<p>${esc(t)}</p>`).join('')}</div>
       <details class="cr-more"><summary>看完整說明</summary>${full}</details>`
    : full;
  const meta = [['日期精確度', PREC[e.precision]+(e.certainty==='approx'?'（約略）':'')], ['出處', e.source]].concat(e.why ? [['挑選理由', e.why]] : []);
  return `<article class="ecard" style="--c:${colorOf(e.track)}" aria-labelledby="cardTitle">
    <div class="ecard-top"><p class="pn-kind">${icon(e.track)}${esc(kindLabel(e))}</p><button class="btn sm" data-act="close" aria-label="關閉這件事的介紹">關閉</button></div>
    <h2 id="cardTitle" tabindex="-1">${esc(e.title)}</h2>
    <p class="pn-date">${timeTag(e)}</p>
    ${body}
    <p class="emeta">${meta.map(([k,v])=>`<span><b>${k}</b>${esc(v)}</span>`).join('')}</p>
  </article>`;
}
