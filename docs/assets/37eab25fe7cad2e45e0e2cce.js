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

document.querySelectorAll('[contenteditable]').forEach(function(el){el.addEventListener('input',function(){});});(()=>{const run=()=>{document.querySelectorAll('.dose-volume-viewer,.dose-sync-animation,.dvh-unified').forEach(function(element){delete element.dataset.initialized;});const initializers=[function initializeUnifiedDvh(root){
    if(root?.__dmatRetainedVisuals&&typeof restoreReportVisualState==='function'){const retained=root.__dmatRetainedVisuals;delete root.__dmatRetainedVisuals;restoreReportVisualState(root,retained);}
    for(const viewer of root.querySelectorAll('.dvh-unified')){if(viewer.dataset.initialized==='true')continue;viewer.dataset.initialized='true';const planToggles=Array.from(viewer.querySelectorAll('[data-dvh-plan-toggle]')),structureToggles=Array.from(viewer.querySelectorAll('[data-dvh-structure-toggle]')),labelToggles=Array.from(viewer.querySelectorAll('[data-dvh-label-toggle]')),allToggles=[...planToggles,...structureToggles,...labelToggles],enabled=(controls,key)=>controls.find((input)=>Object.values(input.dataset).includes(key))?.checked!==false,update=()=>{for(const input of allToggles){if(input.checked)input.setAttribute('checked','');else input.removeAttribute('checked');}for(const curve of viewer.querySelectorAll('.dvh-curve'))curve.style.display=enabled(planToggles,curve.dataset.dvhPlan)&&enabled(structureToggles,curve.dataset.dvhStructure)?'':'none';const objectiveFocus=viewer.dataset.dvhObjectiveFocus||'';for(const annotation of viewer.querySelectorAll('.dvh-goal-annotation')){annotation.style.display=enabled(structureToggles,annotation.dataset.dvhStructure)&&enabled(labelToggles,annotation.dataset.dvhStructure)?'':'none';for(const objective of annotation.querySelectorAll('.dvh-goal-objective'))objective.style.display=!objectiveFocus||objectiveFocus===`${annotation.dataset.dvhStructure}:${objective.dataset.dvhObjective}`?'':'none';}},positionGroup=(group,rawX,rawY)=>{const svg=group.ownerSVGElement,viewBox=svg?.viewBox?.baseVal,baseX=Number(group.dataset.labelX)||0,baseY=Number(group.dataset.labelY)||0,width=Number(group.dataset.labelWidth)||0,height=Number(group.dataset.labelHeight)||0,minX=(viewBox?.x||0)+4-baseX,maxX=(viewBox?.x||0)+(viewBox?.width||1120)-width-4-baseX,minY=(viewBox?.y||0)+4-baseY,maxY=(viewBox?.y||0)+(viewBox?.height||650)-height-4-baseY,x=Math.max(minX,Math.min(maxX,Number(rawX)||0)),y=Math.max(minY,Math.min(maxY,Number(rawY)||0));group.dataset.goalLabelOffsetX=String(x);group.dataset.goalLabelOffsetY=String(y);group.setAttribute('transform',`translate(${x} ${y})`);const anchorX=Number(group.dataset.anchorX)||0,anchorY=Number(group.dataset.anchorY)||0,boxX=baseX+x,boxY=baseY+y,leaderX=Math.max(boxX,Math.min(boxX+width,anchorX)),leaderY=Math.max(boxY,Math.min(boxY+height,anchorY)),leader=group.previousElementSibling;if(leader?.classList?.contains('goal-label-leader'))leader.setAttribute('d',`M${anchorX},${anchorY} L${leaderX},${leaderY}`);return{x,y};},svgPoint=(event,svg)=>{const matrix=svg?.getScreenCTM?.();if(matrix&&svg?.createSVGPoint){const point=svg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;return point.matrixTransform(matrix.inverse());}const rect=svg?.getBoundingClientRect?.(),viewBox=svg?.viewBox?.baseVal;return{x:(event.clientX-(rect?.left||0))/(rect?.width||1)*(viewBox?.width||1120)+(viewBox?.x||0),y:(event.clientY-(rect?.top||0))/(rect?.height||1)*(viewBox?.height||650)+(viewBox?.y||0)};};for(const input of allToggles){input.addEventListener('change',()=>{delete viewer.dataset.dvhObjectiveFocus;update();});if(input.matches('[data-dvh-structure-toggle]'))input.addEventListener('dblclick',(event)=>{event.preventDefault();const structureId=input.dataset.dvhStructureToggle;for(const candidate of structureToggles)candidate.checked=candidate===input&&!candidate.disabled;for(const candidate of labelToggles)candidate.checked=candidate.dataset.dvhLabelToggle===structureId&&!candidate.disabled;const annotation=Array.from(viewer.querySelectorAll('.dvh-goal-annotation')).find((candidate)=>candidate.dataset.dvhStructure===structureId),firstObjective=annotation?.querySelector('.dvh-goal-objective');viewer.dataset.dvhObjectiveFocus=firstObjective?`${structureId}:${firstObjective.dataset.dvhObjective}`:'';update();});}for(const [index,group] of Array.from(viewer.querySelectorAll('.goal-label-group')).entries()){if(!group.dataset.goalLabelKey)group.dataset.goalLabelKey=`label-${index}`;positionGroup(group,group.dataset.goalLabelOffsetX,group.dataset.goalLabelOffsetY);let drag=null;group.addEventListener('pointerdown',(event)=>{if(event.button!==0)return;event.preventDefault();event.stopPropagation();const point=svgPoint(event,group.ownerSVGElement);drag={pointerId:event.pointerId,startX:point.x,startY:point.y,offsetX:Number(group.dataset.goalLabelOffsetX)||0,offsetY:Number(group.dataset.goalLabelOffsetY)||0};group.classList.add('is-dragging');group.setPointerCapture?.(event.pointerId);});group.addEventListener('pointermove',(event)=>{if(!drag||event.pointerId!==drag.pointerId)return;event.preventDefault();const point=svgPoint(event,group.ownerSVGElement);positionGroup(group,drag.offsetX+point.x-drag.startX,drag.offsetY+point.y-drag.startY);});const end=(event)=>{if(!drag||event.pointerId!==drag.pointerId)return;group.releasePointerCapture?.(event.pointerId);group.classList.remove('is-dragging');drag=null;};group.addEventListener('pointerup',end);group.addEventListener('pointercancel',end);group.addEventListener('dblclick',(event)=>{event.preventDefault();event.stopPropagation();positionGroup(group,0,0);});}update();}
  }];for(const initialize of initializers){try{initialize(document)}catch(error){console.error('Standalone report control initialization failed.',error)}}};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();})();