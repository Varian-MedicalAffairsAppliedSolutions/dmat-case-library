const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('docs/assets/analytics-consent.js', 'utf8');
function boot(saved, embedded = false, unavailable = false, options = {}) {
  const handlers = {}, scripts = [], writes = [];
  const element = () => ({hidden:false, addEventListener(t,f){this[t]=f;},focus(){}});
  const panel=element(), settings=element(), close=element();
  const buttons=['accepted','rejected'].map(choice=>Object.assign(element(),{dataset:{choice}}));
  const wrapper=Object.assign(element(),{
    querySelector(s){return ({'.ac-panel':panel,'.ac-settings':settings,'.ac-close':close})[s] || buttons[0];},
    querySelectorAll(){return buttons;}
  });
  let stored=saved, reloads=0, writeBlocked=!!options.writeBlocked;
  const location={origin:'https://example.github.io',pathname:'/library/index.html',reload(){reloads++;}};
  const document={currentScript:{src:'https://example.github.io/library/assets/analytics-consent.js'},
    createElement(tag){return tag==='div'?wrapper:{};},body:{appendChild(){}},head:{appendChild(x){scripts.push(x);}},
    addEventListener(){},hidden:false,
    get cookie(){return '_neoarc_ga=abc; other=xyz';},set cookie(x){writes.push(x);}};
  const window={location,addEventListener(t,f){handlers[t]=f;}};
  window.top=embedded?{}:window;window.self=window;
  vm.runInNewContext(source,{window,document,location,URL,Date,localStorage:{
    getItem(){if(unavailable)throw Error();return stored;},
    setItem(k,v){if(unavailable || writeBlocked)throw Error();stored=v;},
    removeItem(){if(unavailable || options.removeBlocked)throw Error();stored=null;}
  },setTimeout(){},clearTimeout(){}});
  return {scripts,buttons,window,writes,handlers,settings,panel,get reloads(){return reloads;},get stored(){return stored;},set stored(v){stored=v;},blockWrites(){writeBlocked=true;}};
}
const saved = choice => JSON.stringify({version:1,choice,time:Date.now()});
test('no choice or rejection makes no Google requests',()=>{
 for(const choice of [null,saved('rejected'),'invalid',JSON.stringify({version:1,choice:'accepted',time:1})]) assert.equal(boot(choice).scripts.length,0);
 const app=boot();app.buttons[1].click();assert.equal(app.scripts.length,0);
});
test('accept loads once, withdrawal disables and unloads analytics',()=>{
 const app=boot();app.buttons[0].click();app.buttons[0].click();assert.equal(app.scripts.length,1);
 assert.match(app.scripts[0].src,/G-82757TJGTE/);
 app.settings.click();assert.equal(app.panel.hidden,false);
 app.buttons[1].click();assert.equal(app.window['ga-disable-G-82757TJGTE'],true);assert.equal(app.reloads,1);
 assert(app.writes.some(x=>x.startsWith('_neoarc_ga=;')));assert(!app.writes.some(x=>x.startsWith('other=')));
});
test('remembered acceptance loads; embedded viewers never load',()=>{
 assert.equal(boot(saved('accepted')).scripts.length,1);
 assert.equal(boot(saved('accepted'),true).scripts.length,0);
});
test('storage failure defaults to off; cross-tab withdrawal stops tracking',()=>{
 assert.equal(boot(null,false,true).scripts.length,0);
 const app=boot(saved('accepted'));app.stored=saved('rejected');app.handlers.storage({key:'neoarc-consent-v1:/library/'});assert.equal(app.reloads,1);
});
test('withdrawal removes stale acceptance if saving rejection fails',()=>{
 const app=boot(saved('accepted'));
 app.blockWrites();app.buttons[1].click();
 assert.equal(app.window['ga-disable-G-82757TJGTE'],true);
 assert.equal(app.stored,null);
 assert.equal(boot(app.stored).scripts.length,0);
});
test('saved acceptance cannot activate analytics when storage is read-only',()=>{
 const app=boot(saved('accepted'),false,false,{writeBlocked:true,removeBlocked:true});
 assert.equal(app.scripts.length,0);
});
test('expired and invalid choices are removed; acceptance validation does not extend expiry',()=>{
 for (const record of [JSON.stringify({version:1,choice:'accepted',time:1}),'invalid']) {
  const app=boot(record);assert.equal(app.stored,null);assert.equal(app.scripts.length,0);
 }
 const record=saved('accepted');assert.equal(boot(record).stored,record);
});
