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

// Report formatting is initialized by the shared report-format.js script.
/* Read-only colorbar dose tooltip for the public release. */
(() => {
  function initialize(scope) {
    if (!document.getElementById('release-dose-tooltip-style')) {
      const style=document.createElement('style');style.id='release-dose-tooltip-style';
      style.textContent='.release-dose-tooltip{position:fixed;z-index:10000;pointer-events:none;padding:5px 8px;border:1px solid #fff;border-radius:4px;background:#171717;color:#fff;font:600 12px/1.3 Arial,sans-serif;white-space:nowrap}.release-dose-tooltip[hidden]{display:none}';document.head.append(style);
    }
    for (const scale of scope.querySelectorAll('.dose-shared-colorbar')) {
      if (scale.dataset.readOnlyDoseTooltip) continue;
      const bar=scale.querySelector('.dose-colorbar');if(!bar)continue;
      scale.dataset.readOnlyDoseTooltip='true';bar.title='Hover to see dose';
      const tooltip=document.createElement('output');tooltip.className='release-dose-tooltip';tooltip.hidden=true;tooltip.setAttribute('aria-hidden','true');scale.append(tooltip);
      const show=e=>{const rect=bar.getBoundingClientRect(),min=Number(scale.dataset.doseRangeMin),max=Number(scale.dataset.doseRangeMax);if(!Number.isFinite(min)||!(max>min)||e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom){tooltip.hidden=true;return;}tooltip.textContent=(min+Math.max(0,Math.min(1,(e.clientX-rect.left)/Math.max(1,rect.width)))*(max-min)).toFixed(1)+' Gy';tooltip.hidden=false;tooltip.style.left=Math.max(4,Math.min(innerWidth-tooltip.offsetWidth-4,e.clientX-tooltip.offsetWidth/2))+'px';tooltip.style.top=(rect.top>tooltip.offsetHeight+8?rect.top-tooltip.offsetHeight-6:rect.bottom+6)+'px';bar.title=tooltip.textContent;};
      scale.addEventListener('pointermove',show);scale.addEventListener('pointerdown',show);
      for(const event of ['pointerleave','pointercancel'])scale.addEventListener(event,()=>{tooltip.hidden=true;});
    }
  }
  globalThis.DmatDoseTooltip={initialize};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>initialize(document),{once:true});else initialize(document);
})();
(()=>{function targetDvhEnvelopePath(curves){
    if(curves.length<2)return'';
    const xs=[...new Set(curves.flatMap(curve=>curve.points.map(point=>point[0])))].sort((a,b)=>a-b);
    const at=(points,x)=>{if(x<=points[0][0])return points[0][1];for(let i=1;i<points.length;i++)if(x<=points[i][0]){const a=points[i-1],b=points[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]||1);}return points.at(-1)[1];};
    const crossings=[];
    for(let i=1;i<xs.length;i++){const left=curves.map(curve=>at(curve.points,xs[i-1])),right=curves.map(curve=>at(curve.points,xs[i]));for(let a=0;a<curves.length;a++)for(let b=a+1;b<curves.length;b++){const d0=left[a]-left[b],d1=right[a]-right[b];if(d0*d1<0)crossings.push(xs[i-1]+(xs[i]-xs[i-1])*d0/(d0-d1));}}
    const limits=[...new Set([...xs,...crossings])].sort((a,b)=>a-b).map(x=>{const values=curves.map(curve=>at(curve.points,x));return[x,Math.min(...values),Math.max(...values)];});
    return limits.map(([x,lo],i)=>`${i?'L':'M'}${x.toFixed(2)},${lo.toFixed(2)}`).join(' ')+limits.slice().reverse().map(([x,,hi])=>`L${x.toFixed(2)},${hi.toFixed(2)}`).join(' ')+' Z';
  }const run=()=>{document.querySelectorAll('.dose-volume-viewer,.dose-sync-animation,.dvh-unified').forEach(function(element){delete element.dataset.initialized;});const initializers=[function initializeUnifiedDvh(root){
    if(root?.__dmatRetainedVisuals&&typeof restoreReportVisualState==='function'){const retained=root.__dmatRetainedVisuals;delete root.__dmatRetainedVisuals;restoreReportVisualState(root,retained);}
    for(const viewer of root.querySelectorAll('.dvh-unified')){if(viewer.dataset.initialized==='true')continue;viewer.dataset.initialized='true';const planToggles=Array.from(viewer.querySelectorAll('[data-dvh-plan-toggle]')),structureToggles=Array.from(viewer.querySelectorAll('[data-dvh-structure-toggle]')),labelToggles=Array.from(viewer.querySelectorAll('[data-dvh-label-toggle]')),allToggles=[...planToggles,...structureToggles,...labelToggles],enabled=(controls,key)=>controls.find((input)=>Object.values(input.dataset).includes(key))?.checked!==false,update=()=>{for(const input of allToggles){if(input.checked)input.setAttribute('checked','');else input.removeAttribute('checked');}for(const curve of viewer.querySelectorAll('.dvh-curve'))curve.style.display=enabled(planToggles,curve.dataset.dvhPlan)&&enabled(structureToggles,curve.dataset.dvhStructure)?'':'none';for(const envelope of viewer.querySelectorAll('.dvh-target-envelope')){const curves=JSON.parse(envelope.dataset.targetCurves||'[]').filter(curve=>enabled(structureToggles,curve.structure));envelope.setAttribute('d',targetDvhEnvelopePath(curves));envelope.style.display=enabled(planToggles,envelope.dataset.dvhPlan)&&curves.length>1?'':'none';}const objectiveFocus=viewer.dataset.dvhObjectiveFocus||'';for(const annotation of viewer.querySelectorAll('.dvh-goal-annotation')){annotation.style.display=enabled(structureToggles,annotation.dataset.dvhStructure)&&enabled(labelToggles,annotation.dataset.dvhStructure)?'':'none';for(const objective of annotation.querySelectorAll('.dvh-goal-objective'))objective.style.display=!objectiveFocus||objectiveFocus===`${annotation.dataset.dvhStructure}:${objective.dataset.dvhObjective}`?'':'none';}},positionGroup=(group,rawX,rawY)=>{const svg=group.ownerSVGElement,viewBox=svg?.viewBox?.baseVal,baseX=Number(group.dataset.labelX)||0,baseY=Number(group.dataset.labelY)||0,width=Number(group.dataset.labelWidth)||0,height=Number(group.dataset.labelHeight)||0,minX=(viewBox?.x||0)+4-baseX,maxX=(viewBox?.x||0)+(viewBox?.width||1120)-width-4-baseX,minY=(viewBox?.y||0)+4-baseY,maxY=(viewBox?.y||0)+(viewBox?.height||650)-height-4-baseY,x=Math.max(minX,Math.min(maxX,Number(rawX)||0)),y=Math.max(minY,Math.min(maxY,Number(rawY)||0));group.dataset.goalLabelOffsetX=String(x);group.dataset.goalLabelOffsetY=String(y);group.setAttribute('transform',`translate(${x} ${y})`);const anchorX=Number(group.dataset.anchorX)||0,anchorY=Number(group.dataset.anchorY)||0,boxX=baseX+x,boxY=baseY+y,leaderX=Math.max(boxX,Math.min(boxX+width,anchorX)),leaderY=Math.max(boxY,Math.min(boxY+height,anchorY)),leader=group.previousElementSibling;if(leader?.classList?.contains('goal-label-leader'))leader.setAttribute('d',`M${anchorX},${anchorY} L${leaderX},${leaderY}`);return{x,y};},svgPoint=(event,svg)=>{const matrix=svg?.getScreenCTM?.();if(matrix&&svg?.createSVGPoint){const point=svg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;return point.matrixTransform(matrix.inverse());}const rect=svg?.getBoundingClientRect?.(),viewBox=svg?.viewBox?.baseVal;return{x:(event.clientX-(rect?.left||0))/(rect?.width||1)*(viewBox?.width||1120)+(viewBox?.x||0),y:(event.clientY-(rect?.top||0))/(rect?.height||1)*(viewBox?.height||650)+(viewBox?.y||0)};};for(const input of allToggles){input.addEventListener('change',()=>{delete viewer.dataset.dvhObjectiveFocus;update();});if(input.matches('[data-dvh-structure-toggle]'))input.addEventListener('dblclick',(event)=>{event.preventDefault();for(const candidate of [...structureToggles,...labelToggles])candidate.checked=!candidate.disabled;delete viewer.dataset.dvhObjectiveFocus;update();});}for(const button of viewer.querySelectorAll('[data-dvh-all-off]'))button.addEventListener('click',()=>{for(const candidate of [...structureToggles,...labelToggles])candidate.checked=false;delete viewer.dataset.dvhObjectiveFocus;update();});for(const name of viewer.querySelectorAll('.dvh-structure-toggles label span'))name.addEventListener('dblclick',event=>{event.preventDefault();for(const candidate of [...structureToggles,...labelToggles])candidate.checked=!candidate.disabled;delete viewer.dataset.dvhObjectiveFocus;update();});for(const [index,group] of Array.from(viewer.querySelectorAll('.goal-label-group')).entries()){if(!group.dataset.goalLabelKey)group.dataset.goalLabelKey=`label-${index}`;positionGroup(group,group.dataset.goalLabelOffsetX,group.dataset.goalLabelOffsetY);let drag=null;group.addEventListener('pointerdown',(event)=>{if(event.button!==0)return;event.preventDefault();event.stopPropagation();const point=svgPoint(event,group.ownerSVGElement);drag={pointerId:event.pointerId,startX:point.x,startY:point.y,offsetX:Number(group.dataset.goalLabelOffsetX)||0,offsetY:Number(group.dataset.goalLabelOffsetY)||0};group.classList.add('is-dragging');group.setPointerCapture?.(event.pointerId);});group.addEventListener('pointermove',(event)=>{if(!drag||event.pointerId!==drag.pointerId)return;event.preventDefault();const point=svgPoint(event,group.ownerSVGElement);positionGroup(group,drag.offsetX+point.x-drag.startX,drag.offsetY+point.y-drag.startY);});const end=(event)=>{if(!drag||event.pointerId!==drag.pointerId)return;group.releasePointerCapture?.(event.pointerId);group.classList.remove('is-dragging');drag=null;};group.addEventListener('pointerup',end);group.addEventListener('pointercancel',end);group.addEventListener('dblclick',(event)=>{event.preventDefault();event.stopPropagation();positionGroup(group,0,0);});}update();}
  }];for(const initialize of initializers){try{initialize(document)}catch(error){console.error('Standalone report control initialization failed.',error)}}};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();})();
(function guard(){const prevent=e=>e.preventDefault();for(const name of ['contextmenu','copy','cut','selectstart','dragstart'])document.addEventListener(name,prevent);document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['a','c','x','p','s'].includes(e.key.toLowerCase()))e.preventDefault();});})();