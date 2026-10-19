/* ============ 對照：原本的事件樹 ============
   直接把正式網站的時間軸放進來，方便和新的版本比較。 */
VERS.push({id:'tree', no:'對照', name:'原本的事件樹', panel:false, noTools:true,
  basis:'正式網站目前的時間軸：18 件重大事件畫成一棵由下往上長的樹，背景是報紙用詞的比例。',
  fit:'強調事件之間「往前看／往後看」的因果關係。',
  tradeoff:'只有 18 件重大事件，沒有剪報、研究與人數；樹的方向（由下往上）和一般時間軸相反。',
  draw(root){
    root.innerHTML = `<div class="plate vtree"><iframe src="index.html#tree" title="正式網站的事件樹時間軸" loading="lazy"></iframe><p class="lm"><a href="index.html#tree">在新的頁面打開正式網站的事件樹</a></p></div>`;
  }
});
