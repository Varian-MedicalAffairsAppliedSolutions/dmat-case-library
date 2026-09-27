/* Images bundled for easier loading. */
(() => {
  if (window.DmatBinaryImages) return;
  const pending = new Map();
  // Share bundle downloads across slices; keep at most 16 MB of settled data.
  const bundles = new Map();
  let cachedBytes = 0;
  function fetchBundle(url, priority) {
    if (bundles.has(url)) {
      const hit = bundles.get(url); bundles.delete(url); bundles.set(url, hit); return hit.promise;
    }
    const entry = {size: 0};
    entry.promise = (async () => {
      const response = await fetch(url, {priority});
      if (!response.ok) throw new Error('Image asset request failed: ' + response.status);
      const bytes = new Uint8Array(await response.arrayBuffer());
      entry.size = bytes.byteLength; cachedBytes += entry.size;
      for (const [key, value] of bundles) {
        if (cachedBytes <= 16_000_000) break;
        if (!value.size) continue;
        bundles.delete(key); cachedBytes -= value.size;
      }
      return bytes;
    })();
    bundles.set(url, entry);
    entry.promise.catch(() => { if (bundles.get(url) === entry) bundles.delete(url); });
    return entry.promise;
  }
  async function decodeURL(src, {priority = 'high'} = {}) {
    const url = new URL(src, document.baseURI).href;
    if (!/\.bin(?:[?#]|$)/i.test(url)) return url;
    if (pending.has(url)) { const hit = pending.get(url); pending.delete(url); pending.set(url, hit); return hit; }
    const request = (async () => {
      const asset = new URL(url), fragment = asset.hash;
      asset.hash = '';
      const allBytes = await fetchBundle(asset.href, priority);
      let bytes;
      if (fragment) {
        const match = /^#(\d+):(\d+)$/.exec(fragment);
        if (!match) throw new Error('Invalid binary image range');
        const offset = Number(match[1]), length = Number(match[2]);
        if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) || length < 16 || offset + length > allBytes.length) throw new Error('Invalid binary image range');
        bytes = allBytes.slice(offset, offset + length);
      } else bytes = allBytes.slice();
      if (bytes.length < 16 || String.fromCharCode(...bytes.subarray(0, 8)) !== 'DMATIMG1') throw new Error('Invalid binary image');
      const mime = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'][bytes[12]];
      if (!mime) throw new Error('Unsupported binary image type');
      let state = new DataView(bytes.buffer).getUint32(8, true);
      for (let i = 16; i < bytes.length; i++) { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; bytes[i] ^= state & 255; }
      return URL.createObjectURL(new Blob([bytes.subarray(16)], {type: mime}));
    })();
    pending.set(url, request);
    request.catch(() => { if (pending.get(url) === request) pending.delete(url); });
    // The dose viewer retains at most 128 decoded images. Keep a larger URL
    // neighborhood, but do not retain an entire collection of volumes.
    while (pending.size > 512) {
      const oldest = pending.keys().next().value, old = pending.get(oldest); pending.delete(oldest);
      old.then(value => URL.revokeObjectURL(value), () => {});
    }
    return request;
  }
  const generations = new WeakMap();
  function setImage(image, src) {
    const token = {}; generations.set(image, token);
    decodeURL(src).then(url => { if (generations.get(image) === token) { image.src = url; image.removeAttribute('data-binary-error'); } }, () => { if (generations.get(image) === token) image.dataset.binaryError = 'true'; });
  }
  window.DmatBinaryImages = {decodeURL, setImage};
  function start() {
    for (const image of document.querySelectorAll('img[data-binary-src]')) {
      if (image.matches('.dose-volume-image,.dose-sync-image')) continue;
      const load = () => decodeURL(image.dataset.binarySrc).then(url => { image.src = url; image.removeAttribute('data-binary-error'); }).catch(() => { image.dataset.binaryError = 'true'; image.alt ||= 'Image could not be loaded. Reload to retry.'; });
      if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { observer.disconnect(); load(); } }, {rootMargin: '300px'}); observer.observe(image); }
      else load();
    }
    for (const link of document.querySelectorAll('a[data-binary-href]')) {
      link.addEventListener('click', async event => {
        event.preventDefault();
        try { const url = await decodeURL(link.dataset.binaryHref); const a = document.createElement('a'); a.href = url; a.target = link.target || '_blank'; a.rel = 'noopener'; if (link.hasAttribute('download')) a.download = link.getAttribute('download'); a.click(); }
        catch { link.title = 'Image could not be loaded. Click to retry.'; }
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

(function install(global){
  'use strict';
  const css=":is(.web-report,.case-report){font-size:11pt!important;line-height:1.5!important}:is(.web-report,.case-report) :is(p,span,small,strong,b,em,a,label,legend,button,input,output,select,td,th,li,summary,figcaption,div){font-size:11pt!important;line-height:1.5!important}:is(.web-report,.case-report) :is(h1,h2,h3,h4,h5,h6),:is(.web-report,.case-report) :is(h1,h2,h3,h4,h5,h6) *{font-size:16pt!important;line-height:1.25!important}:is(.web-report,.case-report) .subtitle{font-size:11pt!important}:is(.web-report,.case-report) table{font-size:11pt!important;line-height:1.5!important}:is(.web-report,.case-report) :is(.table-scroll,.field-summary-scroll,.efficiency-table-wrap){max-width:100%;overflow-x:auto}:is(.web-report,.case-report) .dosimetric-table{width:max-content!important;min-width:100%!important;table-layout:auto!important}:is(.web-report,.case-report) .dosimetric-table :is(td,th){padding:8px 10px!important}:is(.web-report,.case-report) .dose-volume-overlay{max-width:75%}:is(.web-report,.case-report) .dose-volume-overlay :is(output,span){font-size:11pt!important}:is(.web-report,.case-report) .clinical-goal-comparison{overflow-x:auto}\n.two-size-endpoint-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.two-size-endpoint-grid>div{min-width:0}.two-size-endpoint-grid p{margin:6px 0 12px}.two-size-endpoint-grid svg{width:100%;height:auto}@media(max-width:1100px){.two-size-endpoint-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:700px){.two-size-endpoint-grid{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:8px}}\n:is(.web-report,.case-report) .dvh-toggle-panel{display:grid;grid-template-columns:minmax(0,1fr);gap:20px}:is(.web-report,.case-report) .dvh-toggle-panel fieldset{min-width:0;max-width:100%}:is(.web-report,.case-report) .dvh-plan-toggles{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:10px 24px}:is(.web-report,.case-report) .dvh-plan-toggles label{display:flex;align-items:center;gap:6px;white-space:nowrap;min-width:0}:is(.web-report,.case-report) .dvh-plan-toggles label>span{white-space:nowrap;overflow-wrap:normal;word-break:normal}:is(.web-report,.case-report) .dvh-plan-toggles label>input,:is(.web-report,.case-report) .dvh-plan-toggles label>i{flex-shrink:0}:is(.web-report,.case-report) .dvh-plan-toggles label>i{display:inline-block;width:24px;min-width:24px}\n.two-size-endpoint-grid>div>strong{display:block;text-align:center}.two-size-endpoint-grid>div>p{text-align:center}\n:is(.web-report,.case-report) section[data-report-section=\"technical-details\"] table,:is(.web-report,.case-report) section[data-report-section=\"technical-details\"] table *{font-size:10pt!important;line-height:1.5!important}\n:is(.web-report,.case-report) .dvh-compact-layout{display:grid;grid-template-columns:270px minmax(0,1fr);gap:18px;align-items:start}:is(.web-report,.case-report) .dvh-compact-layout .dvh-toggle-panel{padding:10px;margin:0;gap:12px}:is(.web-report,.case-report) .dvh-compact-layout .dvh-plan-toggles,:is(.web-report,.case-report) .dvh-compact-layout .dvh-structure-toggles{display:grid;grid-template-columns:minmax(0,1fr);gap:5px}:is(.web-report,.case-report) .dvh-compact-layout .dvh-toggle-panel fieldset{padding:0;margin:0}:is(.web-report,.case-report) .dvh-compact-layout .dvh-toggle-panel legend{margin-bottom:5px}:is(.web-report,.case-report) .dvh-compact-layout .dvh-structure-actions{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px}:is(.web-report,.case-report) .dvh-compact-layout .dvh-structure-actions p{margin:0}:is(.web-report,.case-report) .dvh-compact-layout .dvh-structure-actions button{padding:3px 8px}:is(.web-report,.case-report) .dvh-compact-layout .unified-dvh-chart{width:100%;height:auto;margin:0}:is(.web-report,.case-report) .dvh-reading-help{margin:0 0 12px}:is(.web-report,.case-report) .dvh-reading-help>div{padding:8px 0}:is(.web-report,.case-report) .dvh-unified{padding:10px}@media(max-width:900px){:is(.web-report,.case-report) .dvh-compact-layout{grid-template-columns:minmax(0,1fr)}:is(.web-report,.case-report) .dvh-compact-layout .dvh-plan-toggles,:is(.web-report,.case-report) .dvh-compact-layout .dvh-structure-toggles{grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}}\n:is(.web-report,.case-report) .dosimetric-table tbody td:nth-child(4),:is(.web-report,.case-report) .dosimetric-table tbody td:nth-child(5),:is(.web-report,.case-report) .dosimetric-table tbody td:nth-child(6){white-space:nowrap!important;overflow-wrap:normal!important;word-break:normal!important}:is(.web-report,.case-report) .dosimetric-table .plan-modulation-line{display:block}:is(.web-report,.case-report) .dosimetric-table .plan-result-heading{text-align:center;white-space:nowrap}:is(.web-report,.case-report) .dosimetric-table :is(th,td){padding:6px 8px!important}\n:is(.web-report,.case-report) .technical-goal-table{table-layout:auto!important;width:max-content!important;min-width:100%!important}:is(.web-report,.case-report) .technical-goal-table tbody td:nth-child(3),:is(.web-report,.case-report) .technical-goal-table tbody td:nth-child(4),:is(.web-report,.case-report) .scorecard-endpoint-table tbody td:nth-child(3),:is(.web-report,.case-report) .scorecard-endpoint-table tbody td:nth-child(4),:is(.web-report,.case-report) .scorecard-endpoint-table tbody td:nth-child(5),:is(.web-report,.case-report) .scorecard-endpoint-table tbody td:nth-child(6){white-space:nowrap!important;overflow-wrap:normal!important;word-break:normal!important}\n/* Final typography policy: 11 pt narrative, 10 pt tables/graphs, 16 pt section headings.\n   SVG text receives scale-compensated inline sizes from typography.js. */\n:is(.web-report,.case-report), :is(.web-report,.case-report) * { font-size: 11pt !important; }\n:is(.web-report,.case-report) :is(h1,h2,h3,h4,h5,h6),\n:is(.web-report,.case-report) :is(h1,h2,h3,h4,h5,h6) * { font-size: 16pt !important; }\n:is(.web-report,.case-report) table, :is(.web-report,.case-report) table * { font-size: 10pt !important; }\n\n/* Match table body emphasis to narrative; retain bold column headers. */\n:is(.web-report,.case-report) table tbody td, :is(.web-report,.case-report) table tbody td * { font-weight:400!important; font-family:\"Siemens Sans\",Arial,sans-serif!important; }\n\n/* Restore emphasis for scorecard results only. */\n:is(.web-report,.case-report) .dosimetric-table tbody td .endpoint-achieved-value, :is(.web-report,.case-report) .scorecard-endpoint-table tbody td .endpoint-achieved-value { font-weight:700!important; }\n\n:is(.web-report,.case-report) .endpoint-experiment-panel,:is(.web-report,.case-report) .endpoint-results-scroll{border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important}.endpoint-experiment-panel{padding:0!important}.report-format-goal{white-space:nowrap!important}.report-format-scroll{max-width:100%;overflow-x:auto}.report-format-endpoint-grid{align-items:start}\n\n:is(.web-report,.case-report) :is(.two-size-endpoint-grid,.dvh-toggle-panel),:is(.web-report,.case-report) :is(.two-size-endpoint-grid,.dvh-toggle-panel) * {font-size:10pt!important}\n\n/* Shared endpoint presentation for protocol and imported/SRS scorecards. */\n:is(.web-report,.case-report) :is(.dosimetric-table,.scorecard-endpoint-table){table-layout:auto!important;width:max-content!important;min-width:100%!important}\n:is(.web-report,.case-report) :is(.dosimetric-table,.scorecard-endpoint-table) :is(th,td){padding:6px 8px!important;vertical-align:middle;overflow-wrap:normal!important;word-break:normal!important}\n:is(.web-report,.case-report) :is(.dosimetric-table,.scorecard-endpoint-table) .plan-modulation-line{display:block}\n:is(.web-report,.case-report) :is(.dosimetric-table,.scorecard-endpoint-table) .plan-result-heading{text-align:center;white-space:nowrap;min-width:70px}\n:is(.web-report,.case-report) :is(.dosimetric-table,.scorecard-endpoint-table) .endpoint-achieved-value{white-space:nowrap;font-variant-numeric:tabular-nums;font-weight:700!important}\n:is(.web-report,.case-report) :is(.dosimetric-table,.scorecard-endpoint-table) tbody td.attainment-green{background:#5c9f78!important;color:white!important}\n:is(.web-report,.case-report) :is(.dosimetric-table,.scorecard-endpoint-table) tbody td.attainment-yellow{background:#bd9138!important;color:white!important}\n:is(.web-report,.case-report) :is(.dosimetric-table,.scorecard-endpoint-table) tbody td.attainment-red{background:#d26770!important;color:white!important}\n:is(.web-report,.case-report) :is(.dosimetric-table,.scorecard-endpoint-table) tbody td.attainment-gray{background:#f1f3f5!important;color:#56616d!important}\n:is(.web-report,.case-report) .scorecard-endpoint-table tbody td:nth-child(7){white-space:nowrap}\n\n:is(.web-report,.case-report) :is(.dosimetric-table,.scorecard-endpoint-table) :is(.plan-result-heading,td[class*=\"attainment-\"]){width:100px!important;min-width:100px!important;max-width:100px!important;box-sizing:border-box;white-space:nowrap}\n\n:is(.web-report,.case-report) :is(.dosimetric-table,.scorecard-endpoint-table) .endpoint-plan-group-heading{white-space:normal!important;overflow-wrap:anywhere!important}\n\n:is(.web-report,.case-report) :is(.dosimetric-table,.scorecard-endpoint-table) tbody :is(td,th),:is(.web-report,.case-report) :is(.dosimetric-table,.scorecard-endpoint-table) tbody :is(td,th) *{white-space:nowrap!important}\n\n.two-size-endpoint-grid>div{display:grid;grid-template-rows:subgrid;grid-row:span 3;align-items:start}.two-size-endpoint-grid{row-gap:8px}.two-size-endpoint-grid>div>p{margin:0 0 4px}.two-size-endpoint-grid>div>svg{align-self:start}\n\n:is(.web-report,.case-report) nav.library-return{display:block;margin:0 0 16px;padding:0;border:0;background:none;text-align:left} :is(.web-report,.case-report) nav.library-return a{font-size:11pt!important;font-weight:400;line-height:1.5!important;color:#a94700;text-decoration:underline;text-underline-offset:3px}\n\n:is(.web-report,.case-report) header :is(.publication-use-note,.report-use-disclaimer){display:block;margin:12px 0!important;padding:9px 12px!important;border:2px solid #b4232f!important;border-left:6px solid #b4232f!important;background:#fff2f2!important;color:#7a1d28!important;font-size:11pt!important;line-height:1.5!important;font-weight:700!important;letter-spacing:.01em;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n\n/* Use one CSS chevron; legacy open-state triangle glyphs must stay empty. */\n:is(.web-report,.case-report) details>summary{display:flex;align-items:center;gap:.7rem;list-style:none;cursor:pointer}\n:is(.web-report,.case-report) details>summary::-webkit-details-marker{display:none}\n:is(.web-report,.case-report) details>summary::marker{content:\"\"}\n:is(.web-report,.case-report) details>summary::before{content:\"\"!important;display:block;box-sizing:border-box;width:.45rem;height:.45rem;flex:0 0 .45rem;border-right:2px solid #ec6602;border-bottom:2px solid #ec6602;transform:rotate(-45deg);grid-column:auto;grid-row:auto}\n:is(.web-report,.case-report) details[open]>summary::before{content:\"\"!important;transform:rotate(45deg)}\n";
  const bodyPt=11,graphPt=10,headingPt=16,watched=new WeakSet(),observedRoots=new WeakSet();let pending=false;
  function normalizeTables(root){
    for(const note of root.querySelectorAll("p.report-callout"))if(note.textContent.trim().startsWith("Displayed scoring set:"))note.remove();
    for(const table of root.querySelectorAll('.native-goal-score-table')){const wrapper=table.closest('.table-scroll')||table;let previous=wrapper.previousElementSibling;if(previous?.tagName==='P'&&previous.textContent.trim().startsWith('Within-plan compliance only.')){const caption=previous;previous=caption.previousElementSibling;caption.remove();}if(previous&&/^Native (?:IOE|technical-report) goal compliance$/i.test(previous.textContent.trim()))previous.remove();wrapper.remove();}
    for(const heading of root.querySelectorAll('h3'))if(/^Native (?:IOE|technical-report) goal compliance$/i.test(heading.textContent.trim())){while(heading.nextElementSibling?.tagName==='P')heading.nextElementSibling.remove();heading.remove();}
    for(const grid of root.querySelectorAll('.summary-grid')){const cards=[...grid.querySelectorAll('.summary-card')];if(cards.length&&cards.every(card=>/·\s*\d+\s+structures\s*·/.test(card.textContent)))grid.remove();}
    for(const table of root.querySelectorAll('.off-template-comparison')){const wrapper=table.closest('.table-scroll')||table,heading=wrapper.previousElementSibling;if(heading?.textContent.trim()==='Off-template choices and reasons')heading.remove();wrapper.remove();}

    for(const table of root.querySelectorAll('.arc-comparison-table')){const staticFields=new Set();for(const row of table.querySelectorAll('tbody tr')){const match=row.children[0]?.textContent.match(/^Arc (\d+) · Gantry/);if(match&&[...row.children].slice(1).filter(c=>!/^Not present|^—$/.test(c.textContent.trim())).every(c=>/NONE|Static/.test(c.textContent)))staticFields.add(match[1]);}for(const row of table.querySelectorAll('tbody tr')){const h=row.children[0],m=h?.textContent.match(/^Arc (\d+) /);if(m&&staticFields.has(m[1]))h.textContent=h.textContent.replace(/^Arc /,'Field ');}}

    for(const heading of root.querySelectorAll('h2,h3,h4'))if(heading.textContent.trim()==='Scoring criteria and references')heading.textContent='References';
    for(const section of root.querySelectorAll('[data-report-fold="scoring-references"]'))if(root.querySelector('.scorecard-endpoint-table'))for(const fragment of section.querySelectorAll('[data-endpoint-results-fragment]')){const block=fragment.closest('.report-composable-subsection');(block&&section.contains(block)?block:fragment).remove();}
    for(const table of root.querySelectorAll('.field-summary-table'))for(const row of table.querySelectorAll('tbody tr')){const direction=row.querySelector('.field-direction')?.parentElement.textContent||'',number=row.querySelector('.field-number');if(number&&/Static/.test(direction)&&number.firstChild?.nodeType===3)number.firstChild.textContent=number.firstChild.textContent.replace(/^Arc /,'Field ');}

    for(const heading of root.querySelectorAll('h2,h3,h4'))if(heading.textContent.trim()==='Scorecard endpoint audit')heading.textContent='Scorecard details';

    for(const table of root.querySelectorAll('table')){
      if(table.matches('.dosimetric-table,.scorecard-endpoint-table')){
        for(const cell of table.querySelectorAll('tbody td[class*="attainment-"]')){
          if(cell.classList.contains('endpoint-result-missing')||cell.querySelector('.endpoint-achieved-value,.endpoint-missing-value'))continue;
          const value=table.ownerDocument.createElement('span');value.className='endpoint-achieved-value';while(cell.firstChild)value.append(cell.firstChild);cell.append(value);
        }
        if(table.matches('.scorecard-endpoint-table')){
          const row=table.querySelector('thead tr'),heads=[...(row?.children||[])],weight=heads.findIndex(e=>e.textContent.trim()==='Weight');
          if(weight>=0){heads[weight].remove();for(const row of table.querySelectorAll('tbody tr'))row.children[weight]?.remove();table.querySelector('colgroup')?.children[weight]?.remove();}
          for(const th of heads){const name=th.textContent.trim();if(name==='Goal')th.textContent='Primary goal';else if(name==='Acceptable')th.textContent='Secondary goal';else if(name==='Failure')th.textContent='Deviation';}
        }
        for(const th of table.querySelectorAll('thead th')){const label=th.textContent.replace(/\s+/g,' ').trim().replace(/^(Primary|Secondary)goal$/,'$1 goal');const lines={'Matched plan structure':['Matched','structure'],'Primary goal':['Primary','goal'],'Secondary goal':['Secondary','goal']}[label];if(lines&&th.innerHTML!==lines.join(' <br>'))th.innerHTML=lines.join(' <br>');}
        const first=table.querySelector('thead tr th');if(first&&first.textContent!=='Structure')first.textContent='Structure';
        for(const th of table.querySelectorAll('.plan-result-heading')){if(th.querySelector('.plan-modulation-line'))continue;const span=th.querySelector('span'),match=span?.textContent.match(/^(.*?)\s*·\s*([−+\-]?\d+)$/);if(match){span.textContent=match[1];const level=table.ownerDocument.createElement('span');level.className='plan-modulation-line';level.textContent=match[2];th.append(level);}}
        const start=table.matches('.dosimetric-table')?3:3,end=table.matches('.dosimetric-table')?6:6;
        for(const row of table.querySelectorAll('tbody tr'))for(let i=start;i<Math.min(end,row.children.length);i++)row.children[i].classList.add('report-format-goal');
        const fold=table.closest('details');if(fold&&!fold.dataset.formatDefaultApplied){fold.open=false;fold.removeAttribute('open');fold.dataset.formatDefaultApplied='true';}
      }
      if(table.matches('.technical-goal-table'))for(const row of table.querySelectorAll('tbody tr'))for(const i of [2,3])row.children[i]?.classList.add('report-format-goal');
    }
    for(const icon of root.querySelectorAll('.technical-goal-table .goal-row-info'))icon.remove();
    for(const table of root.querySelectorAll('.score-summary-table')){if(table.closest('.traffic-count-fold'))continue;const wrapper=table.parentElement?.classList.contains('table-scroll')?table.parentElement:table,fold=table.ownerDocument.createElement('details'),summary=table.ownerDocument.createElement('summary');fold.className='traffic-count-fold';summary.textContent='Traffic-light endpoint counts';wrapper.before(fold);fold.append(summary,wrapper);}
  }
  function organizeScorecards(root){
    for(const section of root.querySelectorAll('[data-scorecard-construction],[data-report-fold="scorecard-details"]')){
      if(section.dataset.scorecardOrganized){const method=section.querySelector('.scorecard-method');if(method&&!/score curves/i.test(method.textContent)){const p=section.ownerDocument.createElement('p');p.textContent='Saved score curves, weights and thresholds are retained. Missing or unmapped endpoints contribute zero points. Native technical-report compliance scores remain separate.';method.append(p);}if(!section.dataset.scorecardReady){section.setAttribute('open','');section.dataset.scorecardReady='true';}continue;}
      const content=section.querySelector(':scope > .report-fold-content'),endpoint=content?.querySelector('.scorecard-endpoint-table,.dosimetric-table');if(!content||!endpoint)continue;
      let endpointFold=endpoint.closest('details');const countFold=content.querySelector('.traffic-count-fold');
      if(!endpointFold||endpointFold===section){const wrapper=endpoint.closest('.endpoint-experiment-tables')||endpoint.parentElement,fold=section.ownerDocument.createElement('details'),summary=section.ownerDocument.createElement('summary');fold.setAttribute('data-report-fold','dosimetric-endpoints');summary.textContent=`Endpoint result table (${endpoint.querySelectorAll('tbody tr').length})`;wrapper.before(fold);fold.append(summary,wrapper);endpointFold=fold;}

      const doc=section.ownerDocument,intro=[...content.children].find(e=>e.tagName==='P'),name=intro?.querySelector('strong')?.textContent.trim()||'Scorecard',count=endpointFold.querySelector('summary')?.textContent.match(/\((\d+)\)/)?.[1]||endpoint.querySelectorAll('tbody tr').length;
      const direct=node=>{while(node?.parentElement!==content&&node?.parentElement)node=node.parentElement;return node;},endpointBlock=direct(endpointFold),countBlock=countFold?direct(countFold):null;
      section.dataset.scorecardOrganized='true';section.dataset.scorecardReady='true';section.setAttribute('open','');section.setAttribute('data-report-subsection-label','Dosimetric results');section.open=true;
      const heading=section.querySelector(':scope > summary h3');if(heading)heading.textContent='Dosimetric results';
      const caption=doc.createElement('p');caption.className='scorecard-caption';caption.textContent=`${name} · ${count} endpoints.`;
      endpointFold.querySelector('summary').textContent=`Endpoint result table (${count})`;endpointFold.open=false;endpointFold.removeAttribute('open');
      for(const h of endpointBlock.querySelectorAll('h3,h4'))if(['Scorecard details','Scorecard endpoint audit'].includes(h.textContent.trim()))h.remove();
      for(const p of endpointFold.querySelectorAll(':scope > p'))if(/^These rows/.test(p.textContent.trim()))p.remove();
      if(countFold){countFold.querySelector('summary').textContent='Endpoint count summary';countFold.open=false;}
      const method=doc.createElement('details'),summary=doc.createElement('summary');method.className='scorecard-method';summary.textContent='Scoring method';method.append(summary);
      if(intro){const text=intro.textContent,split=text.indexOf('Imported or selected');intro.textContent=split>=0?text.slice(split):'Saved score curves, weights and thresholds are retained. The endpoint count summary classifies results as goal, acceptable variation or deviation; missing or unmapped endpoints contribute zero points. Native technical-report compliance scores remain separate.';method.append(intro);}
      for(const footnote of endpointFold.querySelectorAll('.endpoint-table-footnote'))method.append(footnote);
      content.prepend(caption);content.append(endpointBlock);if(countBlock&&countBlock!==endpointBlock)content.append(countBlock);content.append(method);
    }
  }

  function cleanEndpointNotes(root){for(const note of root.querySelectorAll('.two-size-endpoint-grid>div>p')){const parts=note.textContent.split('·').map(s=>s.trim()),goal=parts.find(s=>/^goal\s/i.test(s)),acceptable=parts.find(s=>/^(?:acceptable|variation)\s/i.test(s));if(goal){const text=goal.replace(/^goal/i,'Goal')+(acceptable?' · '+acceptable.replace(/^(acceptable|variation)/i,'Acceptable'):'');if(text!==note.textContent)note.textContent=text;}}}
  function endpointPanels(root){
    for(const holder of root.querySelectorAll('.clinical-goal-comparison')){
      if(holder.querySelector('.two-size-endpoint-grid'))continue;const original=holder.querySelector('svg');if(!original)continue;const groups=[...original.querySelectorAll('.clinical-goal-panel')];if(!groups.length)continue;
      const doc=holder.ownerDocument,headingTexts=[...original.children].filter(e=>e.tagName.toLowerCase()==='text');
      const titles=groups.map(g=>[...g.children].filter(e=>e.tagName.toLowerCase()==='text')[0]);if(titles.some(t=>!t))continue;
      const centers=[...new Set(titles.map(t=>Number(t.getAttribute('x'))))].sort((a,b)=>a-b),ys=[...new Set(titles.map(t=>Number(t.getAttribute('y'))))].sort((a,b)=>a-b);
      const width=centers.length>1?centers[1]-centers[0]:original.viewBox?.baseVal?.width||Number(original.getAttribute('viewBox').split(/\s+/)[2]),pitch=ys.length>1?ys[1]-ys[0]:238;
      const grid=doc.createElement('div');grid.className='two-size-endpoint-grid';
      for(const group of groups){const texts=[...group.children].filter(e=>e.tagName.toLowerCase()==='text'),title=texts[0],description=texts[1];if(!description)continue;
        const center=Number(title.getAttribute('x')),top=Number(title.getAttribute('y')),card=doc.createElement('div'),heading=doc.createElement('strong'),note=doc.createElement('p'),svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');heading.textContent=title.textContent;note.textContent=description.textContent.replace(/^Goal\s+\d+\s*·\s*(?:lower|higher) is better\s*·\s*goal\s*/i,'Goal ').replace(/\s*·\s*variation\s*/i,' · Acceptable ');svg.setAttribute('viewBox',`${center-width/2} ${top+23} ${width} ${pitch-54}`);svg.setAttribute('role','img');svg.setAttribute('aria-label',title.textContent);title.remove();description.remove();svg.append(group);card.append(heading,note,svg);grid.append(card);
      }
      const nodes=[];if(headingTexts[1]){const p=doc.createElement('p');p.textContent=headingTexts[1].textContent;nodes.push(p);}nodes.push(grid);if(headingTexts.length>2){const p=doc.createElement('p');p.textContent=headingTexts.at(-1).textContent;nodes.push(p);}original.replaceWith(...nodes);
    }
  }
  function compactDvh(root){for(const card of root.querySelectorAll('.dvh-unified')){if(card.querySelector('.dvh-compact-layout'))continue;const controls=card.querySelector('.dvh-toggle-panel'),chart=card.querySelector('.unified-dvh-chart');if(!controls||!chart)continue;const doc=card.ownerDocument,caption=card.querySelector('figcaption');if(caption){const details=doc.createElement('details'),summary=doc.createElement('summary'),body=doc.createElement('div');details.className='dvh-reading-help';summary.textContent='Protocol and viewing instructions';body.innerHTML=caption.innerHTML;details.append(summary,body);caption.replaceWith(details);}for(const label of controls.querySelectorAll('.dvh-plan-toggles label')){const span=label.querySelector('span');if(span){label.title=span.textContent;span.textContent=span.textContent.replace(' · modulation ',' · ');}}const help=controls.querySelector('.dvh-structure-actions p');if(help)help.textContent='Double-click a plan or structure to hide the others.';const layout=doc.createElement('div');layout.className='dvh-compact-layout';controls.before(layout);layout.append(controls,chart);}}
  function sizeSvg(root){
    for(const table of root.querySelectorAll('.dosimetric-table,.scorecard-endpoint-table')){
      if(table.getAttribute('data-endpoint-widths')==='balanced')continue;
      const headers=[...table.querySelectorAll('.plan-result-heading')];if(!headers.length)continue;
      for(let pass=0;pass<3;pass++){
        const widths=headers.map(e=>e.getBoundingClientRect().width),max=Math.ceil(Math.max(...widths));if(!max||Math.max(...widths)-Math.min(...widths)<.5)break;
        const cells=[...headers,...table.querySelectorAll('tbody td[class*="attainment-"]')];
        for(const cell of cells)for(const property of ['width','min-width','max-width'])cell.style.setProperty(property,max+'px','important');
      }
    }
for(const svg of root.querySelectorAll('svg')){if(svg.classList.contains('field-icon'))continue;for(const text of svg.querySelectorAll('text')){const m=text.getScreenCTM?.();if(!m)continue;const scale=Math.hypot(m.a,m.b);if(!scale)continue;const size=(graphPt*96/72)/scale;text.style.setProperty('font-size',size+'px','important');for(const t of text.querySelectorAll('tspan'))t.style.setProperty('font-size',size+'px','important');}if(svg.closest('.two-size-endpoint-grid'))for(const text of svg.querySelectorAll('text')){if(text.hasAttribute('transform'))continue;if(!text.dataset.originalX)text.dataset.originalX=text.getAttribute('x');text.setAttribute('x',text.dataset.originalX);const box=svg.viewBox.baseVal,bounds=text.getBBox(),right=box.x+box.width-3;if(bounds.x+bounds.width>right)text.setAttribute('x',Number(text.dataset.originalX)-(bounds.x+bounds.width-right));}}}
  function normalizeLibraryNavigation(root){
    const header=root.querySelector('header');if(!header)return;
    const links=[...root.querySelectorAll('a')].filter(a=>/^(?:←\s*)?(?:Back to )?case library$/i.test(a.textContent.trim()));
    const href=root.body?.dataset.libraryUrl||root.dataset?.libraryUrl||links[0]?.getAttribute('href');if(!href)return;
    const doc=header.ownerDocument;let nav=root.querySelector('nav.library-return');
    if(!nav){nav=doc.createElement('nav');nav.className='library-return';}
    nav.setAttribute('aria-label','Case library');let link=nav.querySelector('a');if(!link){link=doc.createElement('a');nav.append(link);}
    if(link.getAttribute('href')!==href)link.setAttribute('href',href);
    if(link.textContent!=='← Back to case library')link.textContent='← Back to case library';
    link.removeAttribute('target');
    for(const old of links){if(old===link)continue;const parent=old.parentElement;old.remove();if(parent&&['P','NAV'].includes(parent.tagName)&&!parent.textContent.trim()&&!parent.children.length)parent.remove();}
    if(header.previousElementSibling!==nav)header.before(nav);
  }
  function normalizeUseBanner(root){
    const header=root.querySelector('header');if(!header)return;
    const panel=header.querySelector('.publication-panel');
    if(panel){for(const selector of ['.publication-use-note,.report-use-disclaimer','.publication-technology-note']){const item=header.querySelector(selector);if(item&&item.parentElement!==panel)panel.append(item);}return;}
    const note=header.querySelector('.publication-use-note,.report-use-disclaimer');if(!note)return;
    note.classList.add('publication-use-note','report-use-disclaimer');note.setAttribute('role','note');
    const eyebrow=header.querySelector('.eyebrow');
    if(eyebrow&&eyebrow.nextElementSibling!==note)eyebrow.after(note);
    const technology=header.querySelector('.publication-technology-note');
    if(technology&&note.nextElementSibling!==technology)note.after(technology);
  }
  function initialize(root){if(!root?.querySelectorAll)return;const foldStates=[...root.querySelectorAll('details')].map(n=>[n,n.hasAttribute('open')]);normalizeUseBanner(root);normalizeLibraryNavigation(root);normalizeTables(root);organizeScorecards(root);endpointPanels(root);cleanEndpointNotes(root);compactDvh(root);for(const [node,open]of foldStates)if(root.contains(node)){if(open)node.setAttribute('open','');else node.removeAttribute('open');}if(!global.document)return;
    const resize=()=>sizeSvg(root);if(global.ResizeObserver){const observer=new ResizeObserver(resize);for(const svg of root.querySelectorAll('svg'))if(!watched.has(svg)){watched.add(svg);observer.observe(svg);}}
    if(!observedRoots.has(root)){observedRoots.add(root);root.addEventListener?.('toggle',resize,true);if(global.MutationObserver)new MutationObserver(records=>{if(pending||!records.some(r=>r.addedNodes.length))return;pending=true;requestAnimationFrame(()=>{pending=false;initialize(root);});}).observe(root,{childList:true,subtree:true});}
    resize();
  }
  global.DmatReportFormat={initialize,bodyPt,graphPt,headingPt,css,runtimeSource:()=>`(${install.toString()})(globalThis);`};
  if(global.document){const run=()=>{const report=document.querySelector('.web-report,.case-report');if(report)initialize(report);};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();}
})(globalThis);(function install(global){
'use strict';
const css="html{scroll-behavior:smooth}\n:is(body.web-report,.case-report) header{padding-bottom:20px;border-bottom:0}\n:is(body.web-report,.case-report) header h1{font-size:28px!important;line-height:1.25!important;margin:12px 0 8px}\n:is(body.web-report,.case-report) header .subtitle{margin:0 0 22px;color:#59616a}\n:is(body.web-report,.case-report) header .publication-panel{margin:20px 0 0;border:1px solid #dce1e5;border-left:3px solid #ec6602;background:#f7f8f9;padding:16px 20px}\n:is(body.web-report,.case-report) header .publication-panel .report-use-disclaimer{border:0!important;background:transparent!important;padding:0!important;margin:0 0 10px!important;color:#424950!important;font-weight:400}\n:is(body.web-report,.case-report) header .publication-panel .publication-technology-note{margin:0!important}\n:is(body.web-report,.case-report) .report-section-nav{position:sticky;top:0;z-index:100;display:flex;gap:4px;overflow-x:auto;background:#fff;border-top:1px solid #dce1e5;border-bottom:1px solid #dce1e5;padding:8px 0;margin:8px 0 28px;scrollbar-width:thin}\n:is(body.web-report,.case-report) .report-section-nav a{display:block;flex:0 0 auto;padding:9px 12px;text-decoration:none;color:#4b535b;font-size:14px!important;line-height:1.4!important;border-bottom:2px solid transparent}\n:is(body.web-report,.case-report) .report-section-nav a:hover{background:#f4f5f6;color:#222}\n:is(body.web-report,.case-report) .report-section-nav a[aria-current]{color:#a44600;border-bottom-color:#ec6602;background:#fff7f0}\n:is(body.web-report,.case-report) .report-section-nav a:focus-visible,:is(body.web-report,.case-report) summary:focus-visible{outline:2px solid #a44600;outline-offset:3px}\n:is(body.web-report,.case-report)>section[data-report-section]{margin:0 0 36px;padding-top:18px;border-top:1px solid #e2e6e9;scroll-margin-top:90px}\n:is(body.web-report,.case-report)>section[data-report-section]>details>summary{padding:8px 0 14px}\n:is(body.web-report,.case-report) details>summary{cursor:pointer;padding-top:8px;padding-bottom:8px}\n:is(body.web-report,.case-report) details>summary:hover{background:#fafbfc}\n:is(body.web-report,.case-report) .report-fold-content{padding-top:14px;padding-bottom:8px}\n:is(body.web-report,.case-report) :is(.clinical-goal-comparison,.dvh-unified,.dvh-compact-layout,.dose-volume-card,.dose-sync-card,.spec-card){border-color:#dce1e5!important}\n:is(body.web-report,.case-report) .clinical-goal-comparison{padding:14px}\n:is(body.web-report,.case-report) .dvh-compact-layout{padding:16px}\n:is(body.web-report,.case-report) .dose-card-controls{padding:5px 6px}\n:is(body.web-report,.case-report) .publication-reference{border-top:1px solid #e2e6e9;padding-top:16px}\n@media(max-width:720px){:is(body.web-report,.case-report) header h1{font-size:24px!important}:is(body.web-report,.case-report) .report-section-nav{margin-bottom:20px}:is(body.web-report,.case-report) .report-section-nav a{padding:8px 10px}:is(body.web-report,.case-report) header .publication-panel{padding:14px}:is(body.web-report,.case-report) .dvh-compact-layout{padding:10px}}\n@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}\n/* Apply the same hierarchy when supporting sections are expanded. */\n:is(body.web-report,.case-report) .report-fold-content>details,\n:is(body.web-report,.case-report) .dvh-reading-help{margin:14px 0;border:1px solid #dce1e5;background:#fff}\n:is(body.web-report,.case-report) .report-fold-content>details>summary,\n:is(body.web-report,.case-report) .dvh-reading-help>summary{padding:12px 14px;background:#f7f8f9;border-bottom:1px solid transparent;min-height:44px}\n:is(body.web-report,.case-report) .report-fold-content>details[open]>summary,\n:is(body.web-report,.case-report) .dvh-reading-help[open]>summary{border-bottom-color:#dce1e5}\n:is(body.web-report,.case-report) .report-fold-content>details>summary:hover,\n:is(body.web-report,.case-report) .dvh-reading-help>summary:hover{background:#eef1f3}\n:is(body.web-report,.case-report) .report-fold-content>details>.report-fold-content{padding:16px}\n:is(body.web-report,.case-report) .report-fold-content>details>p,\n:is(body.web-report,.case-report) .report-fold-content>details>ul,\n:is(body.web-report,.case-report) .report-fold-content>details>ol{margin:14px 16px}\n:is(body.web-report,.case-report) .report-fold-content>details>.table-scroll{padding:12px}\n:is(body.web-report,.case-report) .report-table-scroll{max-width:100%;overflow-x:auto;margin:14px 0;-webkit-overflow-scrolling:touch}\n:is(body.web-report,.case-report) [data-report-section=\"technical-details\"] .report-table-scroll{border:1px solid #dce1e5}\n:is(body.web-report,.case-report) :is(.template-summary,.plan-comparison-table,.directive-table,.field-summary-table,.efficiency-table,.score-summary-table){border-color:#dce1e5!important;margin-top:12px;margin-bottom:18px}\n:is(body.web-report,.case-report) :is(.template-summary,.plan-comparison-table,.directive-table,.field-summary-table,.efficiency-table,.score-summary-table) :is(td,th){border-color:#dce1e5!important;padding:9px 12px!important;vertical-align:top}\n:is(body.web-report,.case-report) [data-report-section=\"technical-details\"] h3{margin-top:24px;margin-bottom:12px}\n:is(body.web-report,.case-report) [data-report-section=\"technical-details\"] summary h3{margin:0}\n:is(body.web-report,.case-report) [data-report-section=\"technical-details\"] :is(p,li){line-height:1.6!important}\n:is(body.web-report,.case-report) [data-report-section=\"technical-details\"] li+li{margin-top:8px}\n:is(body.web-report,.case-report) .bibliography{padding-left:24px}\n:is(body.web-report,.case-report) :is(.scorecard-method,.traffic-count-fold,.dvh-reading-help){border-color:#dce1e5!important}\n@media(max-width:720px){:is(body.web-report,.case-report) .report-fold-content>details>.report-fold-content{padding:12px}:is(body.web-report,.case-report) :is(.template-summary,.plan-comparison-table,.directive-table,.field-summary-table,.efficiency-table,.score-summary-table) :is(td,th){padding:8px!important}}\n/* Neutral table framing keeps the scientific result colors prominent. */\n:is(body.web-report,.case-report) table{border-color:#dce1e5!important;border-top:3px solid #ec6602!important}\n:is(body.web-report,.case-report) table th,:is(body.web-report,.case-report) table td{border-color:#dce1e5!important}\n:is(body.web-report,.case-report) table thead th{background:#e9eef2!important;color:#26323b!important;border-color:#cdd6dd!important;text-shadow:none!important;padding:13px 14px!important}\n:is(body.web-report,.case-report) table thead .endpoint-plan-group-heading{background:#dde5eb!important}\n:is(body.web-report,.case-report) table thead .endpoint-plan-group-heading:last-child{background:#edf1f4!important}\n:is(body.web-report,.case-report) table tbody th{background:#f3f5f6!important;color:#26323b!important}\n:is(body.web-report,.case-report) table tbody td:not(.attainment-green):not(.attainment-yellow):not(.attainment-red):not(.attainment-gray){background:#fff!important;color:#26323b!important}\n:is(body.web-report,.case-report) table tbody tr:nth-child(even) td:not(.attainment-green):not(.attainment-yellow):not(.attainment-red):not(.attainment-gray){background:#f4f6f7!important}\n:is(body.web-report,.case-report) table :is(td,th){padding:11px 14px!important}\n:is(body.web-report,.case-report) .dosimetric-table tbody tr.endpoint-data-row :is(td,th){border-bottom-color:#dce1e5!important}\n:is(body.web-report,.case-report) .dosimetric-table tbody tr.report-structure-start :is(td,th){border-top:2px solid #b9c2c9!important}\n/* Breathing room in both expanded content and collapsed-section headers. */\n:is(body.web-report,.case-report) header .publication-panel{padding:20px 24px}\n:is(body.web-report,.case-report) .report-fold-content>details>summary,\n:is(body.web-report,.case-report) .dvh-reading-help>summary{padding:14px 18px}\n:is(body.web-report,.case-report) .report-fold-content>details>.report-fold-content{padding:20px 24px}\n:is(body.web-report,.case-report) .report-fold-content>details>.table-scroll{padding:18px}\n:is(body.web-report,.case-report) .clinical-goal-comparison{padding:20px}\n:is(body.web-report,.case-report) .dvh-compact-layout{padding:20px;gap:22px}\n:is(body.web-report,.case-report) .spec-card{padding:18px}\n:is(body.web-report,.case-report) .report-table-scroll{padding:14px}\n:is(body.web-report,.case-report) .scorecard-method>p,\n:is(body.web-report,.case-report) .scorecard-method>ul,\n:is(body.web-report,.case-report) .dvh-reading-help>p,\n:is(body.web-report,.case-report) .dvh-reading-help>ul{margin:16px 20px}\n@media(max-width:720px){\n :is(body.web-report,.case-report) header .publication-panel{padding:16px}\n :is(body.web-report,.case-report) .report-fold-content>details>.report-fold-content{padding:16px}\n :is(body.web-report,.case-report) .report-fold-content>details>.table-scroll,:is(body.web-report,.case-report) .report-table-scroll{padding:12px}\n :is(body.web-report,.case-report) .clinical-goal-comparison,:is(body.web-report,.case-report) .dvh-compact-layout{padding:14px}\n :is(body.web-report,.case-report) table :is(td,th),:is(body.web-report,.case-report) table thead th{padding:10px 12px!important}\n}\n/* One section boundary; shared full-width table alignment inside it. */\n:is(body.web-report,.case-report) .spec-card{border:0!important;background:transparent;padding:0!important;margin:22px 0}\n:is(body.web-report,.case-report) .spec-card+.spec-card{border-top:1px solid #e2e6e9!important;padding-top:20px!important}\n:is(body.web-report,.case-report) .spec-card h3{margin-top:0}\n:is(body.web-report,.case-report) .report-table-scroll,\n:is(body.web-report,.case-report) [data-report-section=\"technical-details\"] .report-table-scroll{border:0!important;padding:0!important;margin:14px 0;width:100%;max-width:100%;box-sizing:border-box}\n:is(body.web-report,.case-report) :is(.table-scroll,.efficiency-table-wrap,.field-summary-scroll){width:100%;max-width:100%;box-sizing:border-box}\n:is(body.web-report,.case-report) table,\n:is(body.web-report,.case-report) table.score-summary-table,\n:is(body.web-report,.case-report) table.template-summary,\n:is(body.web-report,.case-report) table.efficiency-table,\n:is(body.web-report,.case-report) table.dosimetric-table{width:100%!important;min-width:100%!important;max-width:none!important;margin-left:0!important;margin-right:0!important;box-sizing:border-box}\n:is(body.web-report,.case-report) .report-fold-content>details>.table-scroll{padding:18px!important}\n:is(body.web-report,.case-report) .score-summary-table .score-summary-value{background:var(--report-row-background,#fff)!important}\n/* Remove redundant inner frames without removing scrolling or table gridlines. */\n:is(body.web-report,.case-report) [data-report-section=\"technical-details\"] :is(.table-scroll,.field-summary-scroll,.plan-comparison-scroll,.plan-specification-comparison,.reported-field-display,.spec-grid,.report-composable-subsection){border:0!important;box-shadow:none!important;background:transparent}\n:is(body.web-report,.case-report) [data-report-section=\"technical-details\"] :is(.table-scroll,.field-summary-scroll,.plan-comparison-scroll){padding:0!important}\n:is(body.web-report,.case-report) .spec-card{box-shadow:none!important}\n:is(body.web-report,.case-report) .report-fold-content>details .report-table-scroll{border:0!important;box-shadow:none!important}\n/* Text bodies inside disclosure boxes need their own inset, not just summary padding. */\n:is(body.web-report,.case-report) details.dvh-reading-help>div{padding:18px 20px!important;margin:0!important;line-height:1.6!important;box-sizing:border-box}\n:is(body.web-report,.case-report) details.dvh-reading-help>summary{padding:14px 20px!important}\n:is(body.web-report,.case-report) details.scorecard-method>div{padding:18px 20px!important;box-sizing:border-box}\n:is(body.web-report,.case-report) details.dvh-reading-help{overflow:hidden}\n@media(max-width:720px){:is(body.web-report,.case-report) details.dvh-reading-help>div,:is(body.web-report,.case-report) details.scorecard-method>div{padding:14px 16px!important}:is(body.web-report,.case-report) details.dvh-reading-help>summary{padding:12px 16px!important}}\n/* Native IOE goal status is encoded in text color; its row fills remain neutral. */\n:is(body.web-report,.case-report) table.technical-goal-table tbody td{background:var(--report-row-background,#fff)!important}\n/* References use neutral labels and notes, not orange status-like highlights. */\n:is(body.web-report,.case-report) .source-tag{display:inline-block;background:#edf1f4!important;color:#36434e!important;border:1px solid #dce1e5!important;padding:3px 7px;line-height:1.5}\n:is(body.web-report,.case-report) .privacy-note{background:#f6f8f9!important;color:#424950!important;border:1px solid #dce1e5!important;border-left:3px solid #b9c2c9!important;padding:14px 18px!important;margin-top:24px}\n:is(body.web-report,.case-report) [data-report-fold=\"scoring-references\"] table{border-top-color:#cbd4db!important}\n\n/* Reserve readable goal columns; let many-plan tables scroll instead of squeezing them. */\n:is(body.web-report,.case-report) table.dosimetric-table[data-endpoint-widths=\"balanced\"]{table-layout:fixed!important;width:100%!important;min-width:var(--endpoint-table-min-width)!important}\n:is(body.web-report,.case-report) table.dosimetric-table[data-endpoint-widths=\"balanced\"] :is(th,td){overflow-wrap:anywhere;white-space:normal}\n:is(body.web-report,.case-report) table.dosimetric-table[data-endpoint-widths=\"balanced\"] tbody td:nth-child(n+4):nth-child(-n+6){overflow-wrap:normal}\n\n:is(body.web-report,.case-report) .efficiency-footnotes{background:#f6f8f9!important;border:1px solid #dce1e5!important;border-left:3px solid #b9c2c9!important;padding:16px 20px!important;color:#424950}\n:is(body.web-report,.case-report) .dvh-toggle-panel{background:#f6f8f9!important;border:1px solid #dce1e5!important;padding:16px!important}\n\n:is(body.web-report,.case-report) :is(.dvh-plan-actions,.dvh-structure-actions){display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 12px}\n:is(body.web-report,.case-report) .dvh-structure-actions p{flex-basis:100%;margin:0 0 4px}\n:is(body.web-report,.case-report) :is(.dvh-plan-actions,.dvh-structure-actions) button{min-height:36px;padding:6px 12px;border:1px solid #b9c2c9;background:#fff;color:#36434e;cursor:pointer}\n:is(body.web-report,.case-report) :is(.dvh-plan-actions,.dvh-structure-actions) button:hover{background:#e9eef2}\n:is(body.web-report,.case-report) :is(.dvh-plan-actions,.dvh-structure-actions) button:focus-visible{outline:2px solid #a44600;outline-offset:2px}\n\n:is(body.web-report,.case-report) .dvh-fast-tooltip,body .dvh-fast-tooltip{position:fixed;z-index:10000;pointer-events:none;max-width:min(360px,calc(100vw - 16px));padding:8px 11px;border:1px solid #bbc5cd;border-radius:3px;background:#fff;color:#26323b;font:13px/1.4 Arial,sans-serif!important;white-space:pre-line;overflow-wrap:anywhere;box-shadow:0 2px 8px #0002}\n.dvh-fast-tooltip[hidden]{display:none!important}\n\n/* Identical action rows for plans and structures, regardless of legacy flex rules. */\n:is(body.web-report,.case-report) .dvh-toggle-panel :is(.dvh-plan-actions,.dvh-structure-actions){display:grid!important;grid-template-columns:68px 68px!important;justify-content:start!important;align-items:start!important;gap:8px!important;margin:8px 0 12px!important;width:100%!important}\n:is(body.web-report,.case-report) .dvh-toggle-panel .dvh-structure-actions p{grid-column:1 / -1!important;margin:0 0 4px!important;width:100%!important}\n:is(body.web-report,.case-report) .dvh-toggle-panel :is(.dvh-plan-actions,.dvh-structure-actions) button{width:68px!important;min-width:68px!important;max-width:68px!important;height:36px!important;min-height:36px!important;margin:0!important;padding:6px 8px!important;justify-self:start!important;box-sizing:border-box!important;white-space:nowrap!important;text-align:center!important}\n:is(body.web-report,.case-report) .dvh-toggle-panel :is(.dvh-plan-actions,.dvh-structure-actions) button[data-dvh-bulk-visible=\"true\"]{grid-column:1!important}\n:is(body.web-report,.case-report) .dvh-toggle-panel :is(.dvh-plan-actions,.dvh-structure-actions) button[data-dvh-bulk-visible=\"false\"]{grid-column:2!important}\n";


 function balanceEndpointWidths(root){
  for(const table of root.querySelectorAll('.dosimetric-table')){
   const plans=table.querySelectorAll('.plan-result-heading').length;if(!plans)continue;
   let group=table.querySelector(':scope > colgroup');
   if(!group){group=table.ownerDocument.createElement('colgroup');table.prepend(group);}
   const widths=[132,132,100,112,112,88,...Array(plans).fill(96)];
   if(group.children.length!==widths.length){group.replaceChildren(...widths.map(()=>table.ownerDocument.createElement('col')));}
   [...group.children].forEach((col,i)=>col.style.setProperty('width',widths[i]+'px'));
   table.setAttribute('data-endpoint-widths','balanced');
   table.style.setProperty('--endpoint-table-min-width',widths.reduce((a,b)=>a+b,0)+'px');
   for(const cell of table.querySelectorAll('th,td'))for(const prop of ['width','min-width','max-width'])cell.style.removeProperty(prop);
  }
 }


 function bindDvhIsolation(root){
  for(const viewer of root.querySelectorAll('.dvh-unified')){
   if(viewer.__consistentIsolation)continue;viewer.__consistentIsolation=true;
   viewer.addEventListener('dblclick',event=>{
    const target=event.target;
    if(target.matches?.('[data-dvh-label-toggle]'))return;
    const label=target.closest?.('.dvh-plan-toggles label,.dvh-structure-toggles label');if(!label)return;
    const input=label.querySelector('[data-dvh-plan-toggle],[data-dvh-structure-toggle]');if(!input||input.disabled)return;
    event.preventDefault();event.stopImmediatePropagation();
    const isPlan=input.hasAttribute('data-dvh-plan-toggle'),key=isPlan?'data-dvh-plan-toggle':'data-dvh-structure-toggle';
    for(const candidate of viewer.querySelectorAll('['+key+']'))candidate.checked=candidate===input&&!candidate.disabled;
    if(!isPlan)for(const candidate of viewer.querySelectorAll('[data-dvh-label-toggle]'))candidate.checked=!candidate.disabled&&candidate.getAttribute('data-dvh-label-toggle')===input.getAttribute(key);
    delete viewer.dataset.dvhObjectiveFocus;
    input.dispatchEvent(new input.ownerDocument.defaultView.Event('change',{bubbles:true}));
   },true);
  }
 }
 function updateDvhInstructions(root){
  for(const note of root.querySelectorAll('.dvh-structure-actions p')){
   const text='Double-click a plan or structure to hide the others.';if(note.textContent!==text)note.textContent=text;
  }
  const replace=text=>text.replace(/double-clicking it (?:turns on all structures|isolates that structure and its first displayed objective)/g,'double-clicking a plan or structure name or checkbox hides the others in that group');
  const visit=node=>{if(node.nodeType===3){const text=replace(node.textContent);if(text!==node.textContent)node.textContent=text;}else for(const child of [...node.childNodes])visit(child);};
  for(const note of root.querySelectorAll('.dvh-reading-help,figure.dvh-unified>figcaption'))visit(note);
  for(const input of root.querySelectorAll('[data-dvh-plan-toggle],[data-dvh-structure-toggle]'))input.title='Toggle visibility; double-click to hide others in this group';
 }


 function installDvhBulkControls(root){
  for(const viewer of root.querySelectorAll('.dvh-unified')){
   for(const group of ['plan','structure']){
    const list=viewer.querySelector('.dvh-'+group+'-toggles');if(!list)continue;
    let actions=viewer.querySelector('.dvh-'+group+'-actions');
    if(!actions){actions=viewer.ownerDocument.createElement('div');actions.className='dvh-'+group+'-actions';list.before(actions);}
    for(const on of [true,false]){
     const legacy=group==='plan'?'data-dvh-plan-all-'+(on?'on':'off'):'data-dvh-all-'+(on?'on':'off');
     let button=actions.querySelector('['+legacy+']');
     if(!button){button=viewer.ownerDocument.createElement('button');button.type='button';button.setAttribute(legacy,'');if(on&&actions.querySelector('button'))actions.querySelector('button').before(button);else actions.append(button);}
     button.textContent=on?'All on':'All off';button.setAttribute('data-dvh-bulk-group',group);button.setAttribute('data-dvh-bulk-visible',String(on));
     button.setAttribute('aria-label','Turn '+(on?'on':'off')+' all DVH '+(group==='plan'?'plans':'structures and constraint labels'));
    }
   }
  }
 }
 function bindDvhBulkControls(root){
  for(const viewer of root.querySelectorAll('.dvh-unified')){
   if(viewer.__bulkControlsBound)continue;viewer.__bulkControlsBound=true;
   viewer.addEventListener('click',event=>{
    const button=event.target.closest?.('button[data-dvh-bulk-group]');if(!button||!viewer.contains(button))return;
    event.preventDefault();event.stopImmediatePropagation();
    const group=button.getAttribute('data-dvh-bulk-group'),on=button.getAttribute('data-dvh-bulk-visible')==='true';
    const inputs=[...viewer.querySelectorAll(group==='plan'?'[data-dvh-plan-toggle]':'[data-dvh-structure-toggle],[data-dvh-label-toggle]')];
    for(const input of inputs)input.checked=on&&!input.disabled;
    delete viewer.dataset.dvhObjectiveFocus;
    if(inputs[0])inputs[0].dispatchEvent(new inputs[0].ownerDocument.defaultView.Event('change',{bubbles:true}));
   },true);
  }
 }


 function bindDvhTooltips(root){
  const doc=root.ownerDocument;
  for(const viewer of root.querySelectorAll('.dvh-unified')){
   if(viewer.__fastTooltipBound)continue;viewer.__fastTooltipBound=true;
   for(const title of viewer.querySelectorAll('svg title')){
    const target=title.parentElement,text=title.textContent.trim();if(!text)continue;
    target.setAttribute('data-dvh-fast-tooltip',text);if(!target.hasAttribute('aria-label'))target.setAttribute('aria-label',text);title.remove();
   }
   let tip=null;
   const hide=()=>{if(tip)tip.hidden=true;};
   viewer.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||event.buttons){hide();return;}
    const target=event.target.closest?.('[data-dvh-fast-tooltip]');if(!target||!viewer.contains(target)){hide();return;}
    if(!tip){tip=doc.createElement('div');tip.className='dvh-fast-tooltip';tip.setAttribute('role','tooltip');doc.body.append(tip);}
    tip.textContent=target.getAttribute('data-dvh-fast-tooltip');tip.hidden=false;
    const win=doc.defaultView,width=win.innerWidth||doc.documentElement.clientWidth,height=win.innerHeight||doc.documentElement.clientHeight;
    const box=tip.getBoundingClientRect();let x=event.clientX+14,y=event.clientY+16;
    if(x+box.width>width-8)x=event.clientX-box.width-14;
    if(y+box.height>height-8)y=event.clientY-box.height-12;
    tip.style.left=Math.max(8,x)+'px';tip.style.top=Math.max(8,y)+'px';
   });
   for(const name of ['pointerleave','pointerdown','change'])viewer.addEventListener(name,hide);
   doc.defaultView.addEventListener('scroll',hide,true);doc.defaultView.addEventListener('resize',hide);
   doc.addEventListener('keydown',event=>{if(event.key==='Escape')hide();});
  }
 }

 function apply(root){
  const document=root.ownerDocument;
  if(root.matches?.('body.web-report,body.case-report'))for(const button of root.querySelectorAll('.comparison-table-copy-button,.comparison-table-copy,[data-copy-comparison-table]'))button.remove();
  if(!root.querySelector('section[data-report-section]'))return;
  let style=document.getElementById('report-polish-style');
  if(!style){style=document.createElement('style');style.id='report-polish-style';document.head.append(style);}if(style.textContent!==css)style.textContent=css;
  const header=root.querySelector('header'),panel=header?.querySelector('.publication-panel');
  if(panel){for(const selector of ['.publication-use-note','.publication-technology-note']){const n=header.querySelector(selector);if(n&&n.parentElement!==panel)panel.append(n);}}
  // Reuse the existing fold and its state; move related content without regrouping plots.
  const score=[...root.querySelectorAll('details')].find(n=>/^(Scorecard results|Scorecard details|Dosimetric results)$/.test(n.querySelector(':scope > summary')?.textContent.trim()));
  if(score){
   const title=score.querySelector(':scope > summary h3')||score.querySelector(':scope > summary');
   if(title.textContent!=='Dosimetric results')title.textContent='Dosimetric results';
   score.setAttribute('data-report-subsection-label','Dosimetric results');
   const adjacent=score.nextElementSibling;
   if(adjacent?.matches('[data-report-subsection="clinical-goal-comparison"]')){
    const content=score.querySelector(':scope > .report-fold-content');if(content)content.insertBefore(adjacent,content.querySelector(':scope > details'));
   }
   const heading=score.nextElementSibling;
   if(heading?.tagName==='H3'&&heading.textContent==='Scored endpoint values versus delivery time'){
    const description=heading.nextElementSibling,plots=description?.nextElementSibling;
    if(description?.tagName==='P'&&plots?.querySelector('svg')){
     const content=score.querySelector(':scope > .report-fold-content');
     const firstFold=content?.querySelector(':scope > details');
     if(content)for(const node of [heading,description,plots])content.insertBefore(node,firstFold);
    }
   }
  }
  let nav=root.querySelector('.report-section-nav');
  if(!nav&&header){
   nav=document.createElement('nav');nav.className='report-section-nav';nav.setAttribute('aria-label','Report sections');
   for(const section of root.querySelectorAll(':scope > section[data-report-section]')){
    const title=section.querySelector('h2');if(!title)continue;
    if(!section.id)section.id='report-'+section.getAttribute('data-report-section');
    const link=document.createElement('a');link.href='#'+section.id;link.textContent=title.textContent;nav.append(link);
   }
   if(nav.children.length)header.after(nav);
  }
  for(const table of root.querySelectorAll('[data-report-section="technical-details"] table,[data-report-fold="delivery-efficiency"] table')){
   if(table.closest('.table-scroll,.report-table-scroll,.field-summary-scroll,.efficiency-table-wrap'))continue;
   const wrap=document.createElement('div');wrap.className='report-table-scroll';table.before(wrap);wrap.append(table);
  }
  for(const table of root.querySelectorAll('.dosimetric-table')){
   let previous='';for(const row of table.querySelectorAll('tbody tr.endpoint-data-row')){
    const structure=row.querySelector('th,td')?.textContent.trim()||'';
    if(previous&&structure!==previous)row.classList.add('report-structure-start');previous=structure;
   }
  }
  // Public references contain citations only; retain case caveats outside the list.
  for(const refs of root.querySelectorAll('[data-report-fold="scoring-references"]')){
   const body=refs.querySelector(':scope > .report-fold-content');
   const lists=[...refs.querySelectorAll('ol.bibliography')];
   if(!body||!lists.length)continue;
   for(const p of [...body.children].filter(n=>n.tagName==='P'&&!n.classList.contains('privacy-note')))refs.before(p);
   body.replaceChildren(...lists);
  }
  applyTablePalette(root);
  balanceEndpointWidths(root);
  updateDvhInstructions(root);
  installDvhBulkControls(root);
 }
 function applyTablePalette(root){
  for(const table of root.querySelectorAll('table')){
   table.style.setProperty('background','#fff','important');
   let bodyIndex=0;
   for(const row of table.querySelectorAll('tr')){
    if(row.closest('table')!==table)continue;
    const cells=[...row.children].filter(n=>n.matches('th,td'));
    const header=!!row.closest('thead')||(cells.length>0&&cells.every(n=>n.tagName==='TH'));
    const stripe=header?'#e9eef2':(++bodyIndex%2===0?'#f4f6f7':'#fff');
    row.style.setProperty('background',stripe,'important');
    row.style.setProperty('--report-row-background',stripe);
    for(const score of row.querySelectorAll('.score-summary-value,.technical-goal-table td'))score.style.setProperty('background',stripe,'important');
    for(const cell of cells){
     cell.style.setProperty('border-color','#dce1e5','important');
     if(cell.matches('.attainment-green,.attainment-yellow,.attainment-red,.attainment-gray,.attainment-distribution-cell'))continue;
     cell.style.setProperty('background',header&&cell.classList.contains('endpoint-plan-group-heading')?'#dde5eb':stripe,'important');
     cell.style.setProperty('color','#26323b','important');
     cell.style.setProperty('text-shadow','none','important');
    }
   }
  }
 }
function bindNavigation(root){
 const nav=root.querySelector('.report-section-nav');if(!nav)return;
 if(nav.dataset.navigationBound)return;nav.dataset.navigationBound='true';
 const document=root.ownerDocument;
 const links=[...nav.querySelectorAll('a')],sections=links.map(a=>document.getElementById(a.hash.slice(1))).filter(Boolean);
 const mark=id=>links.forEach(a=>{if(a.hash==='#'+id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 const threshold=section=>Math.max(nav.getBoundingClientRect().height+24,parseFloat(getComputedStyle(section).scrollMarginTop)||0)+3;
 let queued=false,pending=null;
 const update=()=>{
  queued=false;
  if(pending){
   mark(pending.id);
   if(Math.abs(pending.getBoundingClientRect().top-(threshold(pending)-3))<=4)pending=null;
   return;
  }
  let selected=sections[0];
  for(const section of sections)if(section.getBoundingClientRect().top<=threshold(section))selected=section;
  if(selected)mark(selected.id);
 };
 const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(update);}};
 nav.addEventListener('click',e=>{
  const a=e.target.closest('a');if(!a)return;
  const section=document.getElementById(a.hash.slice(1));if(!section)return;
  const fold=section.querySelector(':scope > details');if(fold)fold.open=true;
  pending=section;mark(section.id);
 });
 const manual=()=>{pending=null;schedule();};
 addEventListener('wheel',manual,{passive:true});addEventListener('touchstart',manual,{passive:true});
 addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key))manual();});
 addEventListener('pointerdown',e=>{if(!nav.contains(e.target))pending=null;},{passive:true});
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('scrollend',()=>{pending=null;update();});
 addEventListener('resize',schedule);update();
}
 function initialize(root){apply(root);bindDvhIsolation(root);bindDvhBulkControls(root);bindDvhTooltips(root);if(global.addEventListener)bindNavigation(root);}
 global.DmatReportPolish={css,apply,initialize,bindDvhIsolation,installDvhBulkControls,bindDvhBulkControls,bindDvhTooltips,runtimeSource:()=>`(${install.toString()})(globalThis);`};
 if(global.document){const run=()=>{const root=document.querySelector('body.web-report,body.case-report');if(root)initialize(root);};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();}
})(globalThis);(()=>{function targetDvhEnvelopePath(curves){
    if(curves.length<2)return'';
    const xs=[...new Set(curves.flatMap(curve=>curve.points.map(point=>point[0])))].sort((a,b)=>a-b);
    const at=(points,x)=>{if(x<=points[0][0])return points[0][1];for(let i=1;i<points.length;i++)if(x<=points[i][0]){const a=points[i-1],b=points[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]||1);}return points.at(-1)[1];};
    const crossings=[];
    for(let i=1;i<xs.length;i++){const left=curves.map(curve=>at(curve.points,xs[i-1])),right=curves.map(curve=>at(curve.points,xs[i]));for(let a=0;a<curves.length;a++)for(let b=a+1;b<curves.length;b++){const d0=left[a]-left[b],d1=right[a]-right[b];if(d0*d1<0)crossings.push(xs[i-1]+(xs[i]-xs[i-1])*d0/(d0-d1));}}
    const limits=[...new Set([...xs,...crossings])].sort((a,b)=>a-b).map(x=>{const values=curves.map(curve=>at(curve.points,x));return[x,Math.min(...values),Math.max(...values)];});
    return limits.map(([x,lo],i)=>`${i?'L':'M'}${x.toFixed(2)},${lo.toFixed(2)}`).join(' ')+limits.slice().reverse().map(([x,,hi])=>`L${x.toFixed(2)},${hi.toFixed(2)}`).join(' ')+' Z';
  }const run=()=>{document.querySelectorAll('.dose-volume-viewer,.dose-sync-animation,.dvh-unified').forEach(function(element){delete element.dataset.initialized;});const initializers=[function initializeUnifiedDvh(root){
    if(root?.__dmatRetainedVisuals&&typeof restoreReportVisualState==='function'){const retained=root.__dmatRetainedVisuals;delete root.__dmatRetainedVisuals;restoreReportVisualState(root,retained);}
    for(const viewer of root.querySelectorAll('.dvh-unified')){if(viewer.dataset.initialized==='true')continue;viewer.dataset.initialized='true';const planToggles=Array.from(viewer.querySelectorAll('[data-dvh-plan-toggle]')),structureToggles=Array.from(viewer.querySelectorAll('[data-dvh-structure-toggle]')),labelToggles=Array.from(viewer.querySelectorAll('[data-dvh-label-toggle]')),allToggles=[...planToggles,...structureToggles,...labelToggles],enabled=(controls,key)=>controls.find((input)=>Object.values(input.dataset).includes(key))?.checked!==false,update=()=>{for(const input of allToggles){if(input.checked)input.setAttribute('checked','');else input.removeAttribute('checked');}for(const curve of viewer.querySelectorAll('.dvh-curve'))curve.style.display=enabled(planToggles,curve.dataset.dvhPlan)&&enabled(structureToggles,curve.dataset.dvhStructure)?'':'none';for(const envelope of viewer.querySelectorAll('.dvh-target-envelope')){const curves=JSON.parse(envelope.dataset.targetCurves||'[]').filter(curve=>enabled(structureToggles,curve.structure));envelope.setAttribute('d',targetDvhEnvelopePath(curves));envelope.style.display=enabled(planToggles,envelope.dataset.dvhPlan)&&curves.length>1?'':'none';}const objectiveFocus=viewer.dataset.dvhObjectiveFocus||'';for(const annotation of viewer.querySelectorAll('.dvh-goal-annotation')){annotation.style.display=enabled(structureToggles,annotation.dataset.dvhStructure)&&enabled(labelToggles,annotation.dataset.dvhStructure)?'':'none';for(const objective of annotation.querySelectorAll('.dvh-goal-objective'))objective.style.display=!objectiveFocus||objectiveFocus===`${annotation.dataset.dvhStructure}:${objective.dataset.dvhObjective}`?'':'none';}},positionGroup=(group,rawX,rawY)=>{const svg=group.ownerSVGElement,viewBox=svg?.viewBox?.baseVal,baseX=Number(group.dataset.labelX)||0,baseY=Number(group.dataset.labelY)||0,width=Number(group.dataset.labelWidth)||0,height=Number(group.dataset.labelHeight)||0,minX=(viewBox?.x||0)+4-baseX,maxX=(viewBox?.x||0)+(viewBox?.width||1120)-width-4-baseX,minY=(viewBox?.y||0)+4-baseY,maxY=(viewBox?.y||0)+(viewBox?.height||650)-height-4-baseY,x=Math.max(minX,Math.min(maxX,Number(rawX)||0)),y=Math.max(minY,Math.min(maxY,Number(rawY)||0));group.dataset.goalLabelOffsetX=String(x);group.dataset.goalLabelOffsetY=String(y);group.setAttribute('transform',`translate(${x} ${y})`);const anchorX=Number(group.dataset.anchorX)||0,anchorY=Number(group.dataset.anchorY)||0,boxX=baseX+x,boxY=baseY+y,leaderX=Math.max(boxX,Math.min(boxX+width,anchorX)),leaderY=Math.max(boxY,Math.min(boxY+height,anchorY)),leader=group.previousElementSibling;if(leader?.classList?.contains('goal-label-leader'))leader.setAttribute('d',`M${anchorX},${anchorY} L${leaderX},${leaderY}`);return{x,y};},svgPoint=(event,svg)=>{const matrix=svg?.getScreenCTM?.();if(matrix&&svg?.createSVGPoint){const point=svg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;return point.matrixTransform(matrix.inverse());}const rect=svg?.getBoundingClientRect?.(),viewBox=svg?.viewBox?.baseVal;return{x:(event.clientX-(rect?.left||0))/(rect?.width||1)*(viewBox?.width||1120)+(viewBox?.x||0),y:(event.clientY-(rect?.top||0))/(rect?.height||1)*(viewBox?.height||650)+(viewBox?.y||0)};};for(const input of allToggles){input.addEventListener('change',()=>{delete viewer.dataset.dvhObjectiveFocus;update();});if('dvhStructureToggle' in input.dataset||'dvhPlanToggle' in input.dataset)input.addEventListener('dblclick',(event)=>{event.preventDefault();if(input.disabled)return;const isPlan='dvhPlanToggle' in input.dataset;for(const candidate of (isPlan?planToggles:structureToggles))candidate.checked=candidate===input&&!candidate.disabled;if(!isPlan)for(const candidate of labelToggles)candidate.checked=!candidate.disabled&&candidate.dataset.dvhLabelToggle===input.dataset.dvhStructureToggle;delete viewer.dataset.dvhObjectiveFocus;update();});}for(const [selector,controls,on] of [['[data-dvh-plan-all-on]',planToggles,true],['[data-dvh-plan-all-off]',planToggles,false],['[data-dvh-all-on]',[...structureToggles,...labelToggles],true]])for(const button of viewer.querySelectorAll(selector))button.addEventListener('click',()=>{for(const candidate of controls)candidate.checked=on&&!candidate.disabled;delete viewer.dataset.dvhObjectiveFocus;update();});for(const button of viewer.querySelectorAll('[data-dvh-all-off]'))button.addEventListener('click',()=>{for(const candidate of [...structureToggles,...labelToggles])candidate.checked=false;delete viewer.dataset.dvhObjectiveFocus;update();});for(const name of viewer.querySelectorAll('.dvh-plan-toggles label span,.dvh-structure-toggles label span'))name.addEventListener('dblclick',event=>{event.preventDefault();const input=name.closest('label')?.querySelector('[data-dvh-plan-toggle],[data-dvh-structure-toggle]');if(input)input.dispatchEvent(new input.ownerDocument.defaultView.Event('dblclick',{bubbles:true,cancelable:true}));});for(const [index,group] of Array.from(viewer.querySelectorAll('.goal-label-group')).entries()){if(!group.dataset.goalLabelKey)group.dataset.goalLabelKey=`label-${index}`;positionGroup(group,group.dataset.goalLabelOffsetX,group.dataset.goalLabelOffsetY);let drag=null;group.addEventListener('pointerdown',(event)=>{if(event.button!==0)return;event.preventDefault();event.stopPropagation();const point=svgPoint(event,group.ownerSVGElement);drag={pointerId:event.pointerId,startX:point.x,startY:point.y,offsetX:Number(group.dataset.goalLabelOffsetX)||0,offsetY:Number(group.dataset.goalLabelOffsetY)||0};group.classList.add('is-dragging');group.setPointerCapture?.(event.pointerId);});group.addEventListener('pointermove',(event)=>{if(!drag||event.pointerId!==drag.pointerId)return;event.preventDefault();const point=svgPoint(event,group.ownerSVGElement);positionGroup(group,drag.offsetX+point.x-drag.startX,drag.offsetY+point.y-drag.startY);});const end=(event)=>{if(!drag||event.pointerId!==drag.pointerId)return;group.releasePointerCapture?.(event.pointerId);group.classList.remove('is-dragging');drag=null;};group.addEventListener('pointerup',end);group.addEventListener('pointercancel',end);group.addEventListener('dblclick',(event)=>{event.preventDefault();event.stopPropagation();positionGroup(group,0,0);});}update();}
  }];for(const initialize of initializers){try{initialize(document)}catch(error){console.error('Standalone report control initialization failed.',error)}}};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();})();

(function guard(){const prevent=e=>e.preventDefault();for(const name of ['contextmenu','copy','cut','selectstart','dragstart'])document.addEventListener(name,prevent);document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['a','c','x','p','s'].includes(e.key.toLowerCase()))e.preventDefault();});})();