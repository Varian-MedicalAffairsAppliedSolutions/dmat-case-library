(function install(global){
'use strict';
const css="html{scroll-behavior:smooth}\n:is(body.web-report,.case-report) header{padding-bottom:20px;border-bottom:0}\n:is(body.web-report,.case-report) header h1{font-size:28px!important;line-height:1.25!important;margin:12px 0 8px}\n:is(body.web-report,.case-report) header .subtitle{margin:0 0 22px;color:#59616a}\n:is(body.web-report,.case-report) header .publication-panel{margin:20px 0 0;border:1px solid #dce1e5;border-left:3px solid #ec6602;background:#f7f8f9;padding:16px 20px}\n:is(body.web-report,.case-report) header .publication-panel .report-use-disclaimer{border:0!important;background:transparent!important;padding:0!important;margin:0 0 10px!important;color:#424950!important;font-weight:400}\n:is(body.web-report,.case-report) header .publication-panel .publication-technology-note{margin:0!important}\n:is(body.web-report,.case-report) .report-section-nav{position:sticky;top:0;z-index:100;display:flex;gap:4px;overflow-x:auto;background:#fff;border-top:1px solid #dce1e5;border-bottom:1px solid #dce1e5;padding:8px 0;margin:8px 0 28px;scrollbar-width:thin}\n:is(body.web-report,.case-report) .report-section-nav a{display:block;flex:0 0 auto;padding:9px 12px;text-decoration:none;color:#4b535b;font-size:14px!important;line-height:1.4!important;border-bottom:2px solid transparent}\n:is(body.web-report,.case-report) .report-section-nav a:hover{background:#f4f5f6;color:#222}\n:is(body.web-report,.case-report) .report-section-nav a[aria-current]{color:#a44600;border-bottom-color:#ec6602;background:#fff7f0}\n:is(body.web-report,.case-report) .report-section-nav a:focus-visible,:is(body.web-report,.case-report) summary:focus-visible{outline:2px solid #a44600;outline-offset:3px}\n:is(body.web-report,.case-report)>section[data-report-section]{margin:0 0 36px;padding-top:18px;border-top:1px solid #e2e6e9;scroll-margin-top:90px}\n:is(body.web-report,.case-report)>section[data-report-section]>details>summary{padding:8px 0 14px}\n:is(body.web-report,.case-report) details>summary{cursor:pointer;padding-top:8px;padding-bottom:8px}\n:is(body.web-report,.case-report) details>summary:hover{background:#fafbfc}\n:is(body.web-report,.case-report) .report-fold-content{padding-top:14px;padding-bottom:8px}\n:is(body.web-report,.case-report) :is(.clinical-goal-comparison,.dvh-unified,.dvh-compact-layout,.dose-volume-card,.dose-sync-card,.spec-card){border-color:#dce1e5!important}\n:is(body.web-report,.case-report) .clinical-goal-comparison{padding:14px}\n:is(body.web-report,.case-report) .dvh-compact-layout{padding:16px}\n:is(body.web-report,.case-report) .dose-card-controls{padding:5px 6px}\n:is(body.web-report,.case-report) .publication-reference{border-top:1px solid #e2e6e9;padding-top:16px}\n@media(max-width:720px){:is(body.web-report,.case-report) header h1{font-size:24px!important}:is(body.web-report,.case-report) .report-section-nav{margin-bottom:20px}:is(body.web-report,.case-report) .report-section-nav a{padding:8px 10px}:is(body.web-report,.case-report) header .publication-panel{padding:14px}:is(body.web-report,.case-report) .dvh-compact-layout{padding:10px}}\n@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}\n/* Apply the same hierarchy when supporting sections are expanded. */\n:is(body.web-report,.case-report) .report-fold-content>details,\n:is(body.web-report,.case-report) .dvh-reading-help{margin:14px 0;border:1px solid #dce1e5;background:#fff}\n:is(body.web-report,.case-report) .report-fold-content>details>summary,\n:is(body.web-report,.case-report) .dvh-reading-help>summary{padding:12px 14px;background:#f7f8f9;border-bottom:1px solid transparent;min-height:44px}\n:is(body.web-report,.case-report) .report-fold-content>details[open]>summary,\n:is(body.web-report,.case-report) .dvh-reading-help[open]>summary{border-bottom-color:#dce1e5}\n:is(body.web-report,.case-report) .report-fold-content>details>summary:hover,\n:is(body.web-report,.case-report) .dvh-reading-help>summary:hover{background:#eef1f3}\n:is(body.web-report,.case-report) .report-fold-content>details>.report-fold-content{padding:16px}\n:is(body.web-report,.case-report) .report-fold-content>details>p,\n:is(body.web-report,.case-report) .report-fold-content>details>ul,\n:is(body.web-report,.case-report) .report-fold-content>details>ol{margin:14px 16px}\n:is(body.web-report,.case-report) .report-fold-content>details>.table-scroll{padding:12px}\n:is(body.web-report,.case-report) .report-table-scroll{max-width:100%;overflow-x:auto;margin:14px 0;-webkit-overflow-scrolling:touch}\n:is(body.web-report,.case-report) [data-report-section=\"technical-details\"] .report-table-scroll{border:1px solid #dce1e5}\n:is(body.web-report,.case-report) :is(.template-summary,.plan-comparison-table,.directive-table,.field-summary-table,.efficiency-table,.score-summary-table){border-color:#dce1e5!important;margin-top:12px;margin-bottom:18px}\n:is(body.web-report,.case-report) :is(.template-summary,.plan-comparison-table,.directive-table,.field-summary-table,.efficiency-table,.score-summary-table) :is(td,th){border-color:#dce1e5!important;padding:9px 12px!important;vertical-align:top}\n:is(body.web-report,.case-report) [data-report-section=\"technical-details\"] h3{margin-top:24px;margin-bottom:12px}\n:is(body.web-report,.case-report) [data-report-section=\"technical-details\"] summary h3{margin:0}\n:is(body.web-report,.case-report) [data-report-section=\"technical-details\"] :is(p,li){line-height:1.6!important}\n:is(body.web-report,.case-report) [data-report-section=\"technical-details\"] li+li{margin-top:8px}\n:is(body.web-report,.case-report) .bibliography{padding-left:24px}\n:is(body.web-report,.case-report) :is(.scorecard-method,.traffic-count-fold,.dvh-reading-help){border-color:#dce1e5!important}\n@media(max-width:720px){:is(body.web-report,.case-report) .report-fold-content>details>.report-fold-content{padding:12px}:is(body.web-report,.case-report) :is(.template-summary,.plan-comparison-table,.directive-table,.field-summary-table,.efficiency-table,.score-summary-table) :is(td,th){padding:8px!important}}\n/* Neutral table framing keeps the scientific result colors prominent. */\n:is(body.web-report,.case-report) table{border-color:#dce1e5!important;border-top:3px solid #ec6602!important}\n:is(body.web-report,.case-report) table th,:is(body.web-report,.case-report) table td{border-color:#dce1e5!important}\n:is(body.web-report,.case-report) table thead th{background:#e9eef2!important;color:#26323b!important;border-color:#cdd6dd!important;text-shadow:none!important;padding:13px 14px!important}\n:is(body.web-report,.case-report) table thead .endpoint-plan-group-heading{background:#dde5eb!important}\n:is(body.web-report,.case-report) table thead .endpoint-plan-group-heading:last-child{background:#edf1f4!important}\n:is(body.web-report,.case-report) table tbody th{background:#f3f5f6!important;color:#26323b!important}\n:is(body.web-report,.case-report) table tbody td:not(.attainment-green):not(.attainment-yellow):not(.attainment-red):not(.attainment-gray){background:#fff!important;color:#26323b!important}\n:is(body.web-report,.case-report) table tbody tr:nth-child(even) td:not(.attainment-green):not(.attainment-yellow):not(.attainment-red):not(.attainment-gray){background:#f4f6f7!important}\n:is(body.web-report,.case-report) table :is(td,th){padding:11px 14px!important}\n:is(body.web-report,.case-report) .dosimetric-table tbody tr.endpoint-data-row :is(td,th){border-bottom-color:#dce1e5!important}\n:is(body.web-report,.case-report) .dosimetric-table tbody tr.report-structure-start :is(td,th){border-top:2px solid #b9c2c9!important}\n/* Breathing room in both expanded content and collapsed-section headers. */\n:is(body.web-report,.case-report) header .publication-panel{padding:20px 24px}\n:is(body.web-report,.case-report) .report-fold-content>details>summary,\n:is(body.web-report,.case-report) .dvh-reading-help>summary{padding:14px 18px}\n:is(body.web-report,.case-report) .report-fold-content>details>.report-fold-content{padding:20px 24px}\n:is(body.web-report,.case-report) .report-fold-content>details>.table-scroll{padding:18px}\n:is(body.web-report,.case-report) .clinical-goal-comparison{padding:20px}\n:is(body.web-report,.case-report) .dvh-compact-layout{padding:20px;gap:22px}\n:is(body.web-report,.case-report) .spec-card{padding:18px}\n:is(body.web-report,.case-report) .report-table-scroll{padding:14px}\n:is(body.web-report,.case-report) .scorecard-method>p,\n:is(body.web-report,.case-report) .scorecard-method>ul,\n:is(body.web-report,.case-report) .dvh-reading-help>p,\n:is(body.web-report,.case-report) .dvh-reading-help>ul{margin:16px 20px}\n@media(max-width:720px){\n :is(body.web-report,.case-report) header .publication-panel{padding:16px}\n :is(body.web-report,.case-report) .report-fold-content>details>.report-fold-content{padding:16px}\n :is(body.web-report,.case-report) .report-fold-content>details>.table-scroll,:is(body.web-report,.case-report) .report-table-scroll{padding:12px}\n :is(body.web-report,.case-report) .clinical-goal-comparison,:is(body.web-report,.case-report) .dvh-compact-layout{padding:14px}\n :is(body.web-report,.case-report) table :is(td,th),:is(body.web-report,.case-report) table thead th{padding:10px 12px!important}\n}\n/* One section boundary; shared full-width table alignment inside it. */\n:is(body.web-report,.case-report) .spec-card{border:0!important;background:transparent;padding:0!important;margin:22px 0}\n:is(body.web-report,.case-report) .spec-card+.spec-card{border-top:1px solid #e2e6e9!important;padding-top:20px!important}\n:is(body.web-report,.case-report) .spec-card h3{margin-top:0}\n:is(body.web-report,.case-report) .report-table-scroll,\n:is(body.web-report,.case-report) [data-report-section=\"technical-details\"] .report-table-scroll{border:0!important;padding:0!important;margin:14px 0;width:100%;max-width:100%;box-sizing:border-box}\n:is(body.web-report,.case-report) :is(.table-scroll,.efficiency-table-wrap,.field-summary-scroll){width:100%;max-width:100%;box-sizing:border-box}\n:is(body.web-report,.case-report) table,\n:is(body.web-report,.case-report) table.score-summary-table,\n:is(body.web-report,.case-report) table.template-summary,\n:is(body.web-report,.case-report) table.efficiency-table,\n:is(body.web-report,.case-report) table.dosimetric-table{width:100%!important;min-width:100%!important;max-width:none!important;margin-left:0!important;margin-right:0!important;box-sizing:border-box}\n:is(body.web-report,.case-report) .report-fold-content>details>.table-scroll{padding:18px!important}\n:is(body.web-report,.case-report) .score-summary-table .score-summary-value{background:var(--report-row-background,#fff)!important}\n/* Remove redundant inner frames without removing scrolling or table gridlines. */\n:is(body.web-report,.case-report) [data-report-section=\"technical-details\"] :is(.table-scroll,.field-summary-scroll,.plan-comparison-scroll,.plan-specification-comparison,.reported-field-display,.spec-grid,.report-composable-subsection){border:0!important;box-shadow:none!important;background:transparent}\n:is(body.web-report,.case-report) [data-report-section=\"technical-details\"] :is(.table-scroll,.field-summary-scroll,.plan-comparison-scroll){padding:0!important}\n:is(body.web-report,.case-report) .spec-card{box-shadow:none!important}\n:is(body.web-report,.case-report) .report-fold-content>details .report-table-scroll{border:0!important;box-shadow:none!important}\n/* Text bodies inside disclosure boxes need their own inset, not just summary padding. */\n:is(body.web-report,.case-report) details.dvh-reading-help>div{padding:18px 20px!important;margin:0!important;line-height:1.6!important;box-sizing:border-box}\n:is(body.web-report,.case-report) details.dvh-reading-help>summary{padding:14px 20px!important}\n:is(body.web-report,.case-report) details.scorecard-method>div{padding:18px 20px!important;box-sizing:border-box}\n:is(body.web-report,.case-report) details.dvh-reading-help{overflow:hidden}\n@media(max-width:720px){:is(body.web-report,.case-report) details.dvh-reading-help>div,:is(body.web-report,.case-report) details.scorecard-method>div{padding:14px 16px!important}:is(body.web-report,.case-report) details.dvh-reading-help>summary{padding:12px 16px!important}}\n/* Native IOE goal status is encoded in text color; its row fills remain neutral. */\n:is(body.web-report,.case-report) table.technical-goal-table tbody td{background:var(--report-row-background,#fff)!important}\n/* References use neutral labels and notes, not orange status-like highlights. */\n:is(body.web-report,.case-report) .source-tag{display:inline-block;background:#edf1f4!important;color:#36434e!important;border:1px solid #dce1e5!important;padding:3px 7px;line-height:1.5}\n:is(body.web-report,.case-report) .privacy-note{background:#f6f8f9!important;color:#424950!important;border:1px solid #dce1e5!important;border-left:3px solid #b9c2c9!important;padding:14px 18px!important;margin-top:24px}\n:is(body.web-report,.case-report) [data-report-fold=\"scoring-references\"] table{border-top-color:#cbd4db!important}\n\n/* Reserve readable goal columns; let many-plan tables scroll instead of squeezing them. */\n:is(body.web-report,.case-report) table.dosimetric-table[data-endpoint-widths=\"balanced\"]{table-layout:fixed!important;width:100%!important;min-width:var(--endpoint-table-min-width)!important}\n:is(body.web-report,.case-report) table.dosimetric-table[data-endpoint-widths=\"balanced\"] :is(th,td){overflow-wrap:anywhere;white-space:normal}\n:is(body.web-report,.case-report) table.dosimetric-table[data-endpoint-widths=\"balanced\"] tbody td:nth-child(n+4):nth-child(-n+6){overflow-wrap:normal}\n\n:is(body.web-report,.case-report) .efficiency-footnotes{background:#f6f8f9!important;border:1px solid #dce1e5!important;border-left:3px solid #b9c2c9!important;padding:16px 20px!important;color:#424950}\n:is(body.web-report,.case-report) .dvh-toggle-panel{background:#f6f8f9!important;border:1px solid #dce1e5!important;padding:16px!important}\n\n:is(body.web-report,.case-report) :is(.dvh-plan-actions,.dvh-structure-actions){display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 12px}\n:is(body.web-report,.case-report) .dvh-structure-actions p{flex-basis:100%;margin:0 0 4px}\n:is(body.web-report,.case-report) :is(.dvh-plan-actions,.dvh-structure-actions) button{min-height:36px;padding:6px 12px;border:1px solid #b9c2c9;background:#fff;color:#36434e;cursor:pointer}\n:is(body.web-report,.case-report) :is(.dvh-plan-actions,.dvh-structure-actions) button:hover{background:#e9eef2}\n:is(body.web-report,.case-report) :is(.dvh-plan-actions,.dvh-structure-actions) button:focus-visible{outline:2px solid #a44600;outline-offset:2px}\n\n:is(body.web-report,.case-report) .dvh-fast-tooltip,body .dvh-fast-tooltip{position:fixed;z-index:10000;pointer-events:none;max-width:min(360px,calc(100vw - 16px));padding:8px 11px;border:1px solid #bbc5cd;border-radius:3px;background:#fff;color:#26323b;font:13px/1.4 Arial,sans-serif!important;white-space:pre-line;overflow-wrap:anywhere;box-shadow:0 2px 8px #0002}\n.dvh-fast-tooltip[hidden]{display:none!important}\n\n/* Identical action rows for plans and structures, regardless of legacy flex rules. */\n:is(body.web-report,.case-report) .dvh-toggle-panel :is(.dvh-plan-actions,.dvh-structure-actions){display:grid!important;grid-template-columns:68px 68px!important;justify-content:start!important;align-items:start!important;gap:8px!important;margin:8px 0 12px!important;width:100%!important}\n:is(body.web-report,.case-report) .dvh-toggle-panel .dvh-structure-actions p{grid-column:1 / -1!important;margin:0 0 4px!important;width:100%!important}\n:is(body.web-report,.case-report) .dvh-toggle-panel :is(.dvh-plan-actions,.dvh-structure-actions) button{width:68px!important;min-width:68px!important;max-width:68px!important;height:36px!important;min-height:36px!important;margin:0!important;padding:6px 8px!important;justify-self:start!important;box-sizing:border-box!important;white-space:nowrap!important;text-align:center!important}\n:is(body.web-report,.case-report) .dvh-toggle-panel :is(.dvh-plan-actions,.dvh-structure-actions) button[data-dvh-bulk-visible=\"true\"]{grid-column:1!important}\n:is(body.web-report,.case-report) .dvh-toggle-panel :is(.dvh-plan-actions,.dvh-structure-actions) button[data-dvh-bulk-visible=\"false\"]{grid-column:2!important}\n\n/* Subsection disclosure bars remain visually subordinate to numbered sections. */\n:is(body.web-report,.case-report) .report-fold-content details > summary{padding:8px 14px!important;min-height:40px!important;box-sizing:border-box;line-height:1.3!important}\n:is(body.web-report,.case-report) .report-fold-content details > summary :is(h3,h4,h5,h6){margin:0!important;font-size:14pt!important;line-height:1.3!important}\n:is(body.web-report,.case-report) .report-fold-content details > summary :is(h3,h4,h5,h6) *{font-size:inherit!important;line-height:inherit!important}\n";


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
  for(const note of root.querySelectorAll('.dvh-structure-actions p,.dvh-toggle-instructions')){
   const text='Double-click a plan or structure to hide the others.';if(note.textContent!==text)note.textContent=text;
   const panel=note.closest('.dvh-toggle-panel');if(panel){note.className='dvh-toggle-instructions';note.style.gridColumn='1 / -1';note.style.margin='0 0 8px';if(panel.firstElementChild!==note)panel.prepend(note);}
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


 function dvhAxes(svg){
  const lines=[...svg.querySelectorAll(':scope > line')].map(n=>Object.fromEntries(['x1','x2','y1','y2'].map(k=>[k,Number(n.getAttribute(k))])));
  const h=lines.filter(n=>n.y1===n.y2&&n.x2>n.x1),v=lines.filter(n=>n.x1===n.x2&&n.y2>n.y1);if(h.length<2||v.length<2)return null;
  const left=Math.min(...h.map(n=>n.x1)),right=Math.max(...h.map(n=>n.x2)),top=Math.min(...v.map(n=>n.y1)),bottom=Math.max(...v.map(n=>n.y2));
  const ticks=[...svg.querySelectorAll(':scope > text')].filter(n=>/^\d+(\.\d+)?$/.test(n.textContent.trim()));
  const xt=ticks.filter(n=>Number(n.getAttribute('y'))>bottom&&Number(n.getAttribute('x'))>=left).sort((a,b)=>Number(a.getAttribute('x'))-Number(b.getAttribute('x')));
  if(xt.length<2)return null;return{left,right,top,bottom,min:Number(xt[0].textContent),max:Number(xt.at(-1).textContent),x0:Number(xt[0].getAttribute('x')),x1:Number(xt.at(-1).getAttribute('x'))};
 }
 function nearestDvhPoint(svg,x,y,preferred=null){
  let best=null;const seen=new Set(),viewer=svg.closest('.dvh-unified'),states=new Map([...viewer.querySelectorAll('[data-dvh-plan-toggle],[data-dvh-structure-toggle]')].map(n=>[n.hasAttribute('data-dvh-plan-toggle')?'plan:'+n.getAttribute('data-dvh-plan-toggle'):'structure:'+n.getAttribute('data-dvh-structure-toggle'),n.checked]));
  for(const curve of svg.querySelectorAll('path[data-dvh-plan][data-dvh-structure]')){
   const key=curve.getAttribute('data-dvh-plan')+'|'+curve.getAttribute('data-dvh-structure');if(seen.has(key))continue;
   if(states.get('plan:'+curve.getAttribute('data-dvh-plan'))===false||states.get('structure:'+curve.getAttribute('data-dvh-structure'))===false||curve.style.display==='none')continue;
   seen.add(key);const data=curve.getAttribute('d')||'';if(curve.__snapData!==data){curve.__snapData=data;curve.__snapPoints=[...data.matchAll(/[ML]\s*(-?\d*\.?\d+(?:e[-+]?\d+)?)[,\s]+(-?\d*\.?\d+(?:e[-+]?\d+)?)/gi)].map(m=>[Number(m[1]),Number(m[2])]);}
   const points=curve.__snapPoints;for(let i=1;i<points.length;i++){const [ax,ay]=points[i-1],[bx,by]=points[i];if(x<Math.min(ax,bx)||x>Math.max(ax,bx))continue;const cy=bx===ax?Math.max(Math.min(ay,by),Math.min(Math.max(ay,by),y)):ay+(by-ay)*(x-ax)/(bx-ax);const distance=Math.abs(cy-y),preferredKey=preferred&&preferred.getAttribute('data-dvh-plan')+'|'+preferred.getAttribute('data-dvh-structure');const priority=key===preferredKey?0:1;if(!best||priority<best.priority||(priority===best.priority&&distance<best.distance))best={x,y:cy,curve,distance,priority};}
  }return best;
 }
 function bindDvhTooltips(root){
  const doc=root.ownerDocument;
  for(const viewer of root.querySelectorAll('.dvh-unified')){
   if(viewer.__snappedTooltipBound)continue;viewer.__snappedTooltipBound=true;
   for(const title of viewer.querySelectorAll('svg title')){const target=title.parentElement,text=title.textContent.trim();if(text){target.setAttribute('data-dvh-fast-tooltip',text);if(!target.hasAttribute('aria-label'))target.setAttribute('aria-label',text);title.remove();}}
   const svg=viewer.querySelector('svg.unified-dvh-chart'),axes=svg&&dvhAxes(svg);
   const names=attr=>new Map([...viewer.querySelectorAll('['+attr+']')].map(n=>[n.getAttribute(attr),n.closest('label')?.querySelector('span:last-child')?.textContent.trim()||n.getAttribute('aria-label')||n.getAttribute(attr)]));
   const plans=names('data-dvh-plan-toggle'),structures=names('data-dvh-structure-toggle');
   let tip=null,overlay=null;
   const hide=()=>{if(tip)tip.hidden=true;if(overlay)overlay.setAttribute('display','none');};
   function cross(x,y){
    if(!overlay){overlay=doc.createElementNS('http://www.w3.org/2000/svg','g');overlay.setAttribute('class','dvh-crosshair');overlay.setAttribute('pointer-events','none');overlay.setAttribute('aria-hidden','true');const make=tag=>doc.createElementNS('http://www.w3.org/2000/svg',tag);overlay.append(make('line'),make('line'));for(let i=0;i<2;i++){const group=make('g');group.append(make('rect'),make('text'));overlay.append(group);}svg.append(overlay);}
    overlay.removeAttribute('display');const lines=overlay.querySelectorAll(':scope > line');
    for(const [line,coords]of [[lines[0],{x1:x,x2:x,y1:axes.top,y2:axes.bottom}],[lines[1],{x1:axes.left,x2:axes.right,y1:y,y2:y}]]){for(const[k,v]of Object.entries(coords))line.setAttribute(k,String(v));line.setAttribute('stroke','#52647a');line.setAttribute('stroke-dasharray','4 4');line.setAttribute('stroke-width','1');}
    const dose=axes.min+(x-axes.x0)/(axes.x1-axes.x0)*(axes.max-axes.min),volume=(axes.bottom-y)/(axes.bottom-axes.top)*100;
    const labels=[...overlay.querySelectorAll(':scope > g')];for(const [i,label]of labels.entries()){const text=label.querySelector('text'),rect=label.querySelector('rect'),lx=i?axes.left-36:Math.max(axes.left+36,Math.min(axes.right-36,x)),ly=i?Math.max(axes.top+12,Math.min(axes.bottom-12,y)):axes.bottom+25;rect.setAttribute('x',lx-35);rect.setAttribute('y',ly-12);rect.setAttribute('width','70');rect.setAttribute('height','24');rect.setAttribute('fill','#fff');rect.setAttribute('stroke','#52647a');text.setAttribute('x',lx);text.setAttribute('y',ly+5);text.setAttribute('text-anchor','middle');text.setAttribute('fill','#26323b');text.style.setProperty('font-size','13px','important');text.textContent=i?volume.toFixed(1)+' %':dose.toFixed(2)+' Gy';}
    return{dose,volume};
   }
   viewer.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||event.buttons){hide();return;}
    // Supersede legacy hover handlers embedded in older published reports.
    event.stopImmediatePropagation();let reading=null,snapped=null;
    if(svg&&axes&&svg.contains(event.target)&&!event.target.closest?.('.goal-label-group')){const matrix=svg.getScreenCTM?.();if(matrix){const p=svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;const q=p.matrixTransform(matrix.inverse());if(q.x>=axes.left&&q.x<=axes.right&&q.y>=axes.top&&q.y<=axes.bottom){snapped=nearestDvhPoint(svg,q.x,q.y,event.target.closest?.('path[data-dvh-plan][data-dvh-structure]'));if(snapped)reading=cross(snapped.x,snapped.y);}}}
    if(!reading&&overlay)overlay.setAttribute('display','none');
    const target=snapped?.curve||event.target.closest?.('[data-dvh-fast-tooltip],[data-dvh-plan][data-dvh-structure]');if(!target||!viewer.contains(target)){if(tip)tip.hidden=true;return;}
    const plan=plans.get(target.getAttribute('data-dvh-plan')),structure=structures.get(target.getAttribute('data-dvh-structure'));
    const message=plan&&structure?'Plan: '+plan+'\nStructure: '+structure+(reading?'\nDose: '+reading.dose.toFixed(2)+' Gy\nVolume: '+reading.volume.toFixed(1)+' %':''):target.getAttribute('data-dvh-fast-tooltip');if(!message){if(tip)tip.hidden=true;return;}
    if(!tip){tip=doc.createElement('div');tip.className='dvh-fast-tooltip';tip.setAttribute('role','tooltip');doc.body.append(tip);}tip.textContent=message;tip.hidden=false;
    const win=doc.defaultView,width=win.innerWidth||doc.documentElement.clientWidth,height=win.innerHeight||doc.documentElement.clientHeight,box=tip.getBoundingClientRect();let x=event.clientX+14,y=event.clientY+16;if(x+box.width>width-8)x=event.clientX-box.width-14;if(y+box.height>height-8)y=event.clientY-box.height-12;tip.style.left=Math.max(8,x)+'px';tip.style.top=Math.max(8,y)+'px';
   },true);
   for(const name of ['pointerleave','pointerdown','change'])viewer.addEventListener(name,hide);
   doc.defaultView.addEventListener('scroll',hide,true);doc.defaultView.addEventListener('resize',hide);doc.addEventListener('keydown',event=>{if(event.key==='Escape')hide();});
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
  // Delivery demos are optional report sections, immediately before technical details.
  const demo=root.querySelector('#delivery-simulation');
  if(demo?.querySelector('#delivery-frame')){
   let section=demo.closest('section[data-report-section="delivery"]');
   if(!section){section=document.createElement('section');section.id='report-delivery';section.setAttribute('data-report-section','delivery');demo.before(section);section.append(demo);}
   const summary=demo.querySelector(':scope > summary');
   summary?.querySelector('.delivery-kicker')?.remove();
   let title=summary?.querySelector('h2');
   if(!title&&summary){title=document.createElement('h2');title.className='delivery-title';const old=summary.querySelector('.delivery-title');if(old)old.replaceWith(title);else summary.prepend(title);}
   if(title)title.textContent='5. Plan in motion';
   const technical=root.querySelector('section[data-report-section="technical-details"] h2');
   if(technical)technical.textContent='6. Technical details';
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
  if(demo?.querySelector('#delivery-frame')&&nav){
   const technicalLink=nav.querySelector('a[href="#report-technical-details"]');
   if(technicalLink)technicalLink.textContent='6. Technical details';
   let deliveryLink=nav.querySelector('a[href="#report-delivery"]');
   if(!deliveryLink){deliveryLink=document.createElement('a');deliveryLink.href='#report-delivery';if(technicalLink)technicalLink.before(deliveryLink);else nav.append(deliveryLink);}
   deliveryLink.textContent='5. Plan in motion';
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
 global.DmatReportPolish={css,apply,initialize,bindDvhIsolation,installDvhBulkControls,bindDvhBulkControls,bindDvhTooltips,dvhAxes,nearestDvhPoint,runtimeSource:()=>`(${install.toString()})(globalThis);`};
 if(global.document){const run=()=>{const root=document.querySelector('body.web-report,body.case-report');if(root)initialize(root);};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();}
})(globalThis);
