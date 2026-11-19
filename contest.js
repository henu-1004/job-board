/* 채용 / 대회 / 부업 모드 전환. people.json의 contests·sidegigs 플래그로 버튼을 열고, data/<P>/contests.json · sidegigs.json을 읽는다. app.js의 P, $, esc, dday, MISS를 그대로 쓴다. */
(function(){
const CATS=['IT·해커톤','창업·지원사업','지자체·기관 공모','디자인·영상','글쓰기·수기','음악','운동','기타'];
const CST=['관심','참가함','제출함','패스'],CICON={'관심':'⭐','참가함':'🙋','제출함':'📤','패스':'⏭️'};
const CKEY='contest-status-'+P,MKEY='jobboard-mode-'+P;let cs=JSON.parse(localStorage.getItem(CKEY)||'{}');
let C=[],CA=null,ctab='open',asOf=null,CTOPSRC=null,ctopOpen=localStorage.getItem('contestboard-top')!=='0';const box=$('contest');
let hasContests=false,hasSidegigs=false;
function cn(j,i){const d=dday(j.deadline);return{...j,_i:i,_id:j.id||j.url||('c'+i),_d:d,_g:({S:0,A:1,B:2}[j.grade]??3),_closed:d!==null&&d<0,
 _hay:[j.title,j.host,j.category,j.prize,j.eligibility,j.reason,j.recommend_reason,j.source].join(' ').toLowerCase()}}
function dl(d,s){return d===null?esc(s||'기한 미기재'):d<0?'마감':d===0?'오늘 마감':d===1?'내일 마감':'D-'+d}
function dcls(d){return d!==null&&d>=0&&d<=1?'urgent':d!==null&&d>=2&&d<=3?'soon':'dd'}
function hideArchControls(){const arch=ctab==='arch';$('csort').style.display=$('cst').style.display=arch?'none':'';if($('crec'))$('crec').parentElement.style.display=arch?'none':''}
function shell(){box.innerHTML=`<nav class="ctabs"><button type="button" data-ct="open" class="on">진행 중</button><button type="button" data-ct="arch">지난 대회</button></nav>
<div class="cfil"><input id="cq" type="search" placeholder="대회명·주최·상금 검색">
<div class="row"><select id="cgrade"><option value="">전체 등급</option><option>S</option><option>A</option><option>B</option></select>
<select id="ccat"><option value="">전체 분야</option>${CATS.map(c=>`<option>${c}</option>`).join('')}</select>
<select id="cst"><option value="">전체 상태</option><option value="none">미분류</option>${CST.map(s=>`<option>${s}</option>`).join('')}</select>
<select id="csort"><option value="dl">마감 임박순</option><option value="grade">등급순</option></select></div>
<label><input type="checkbox" id="crec"> 👍 추천만 보기</label></div>
<section id="ctop5"></section>
<main id="clist"></main>`;
 ['cgrade','ccat','cst','csort','crec'].forEach(id=>$(id).addEventListener('input',crender));let t;$('cq').addEventListener('input',()=>{clearTimeout(t);t=setTimeout(crender,200)});
 box.querySelector('.ctabs').addEventListener('click',e=>{const b=e.target.closest('[data-ct]');if(!b)return;ctab=b.dataset.ct;box.querySelectorAll('[data-ct]').forEach(x=>x.classList.toggle('on',x===b));hideArchControls();
  if(ctab==='arch'&&!CA){$('clist').textContent='지난 대회 불러오는 중…';fetch('data/'+P+'/contests-archive.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():{items:[]}).then(d=>{CA=(d.items||[]).map((j,i)=>({...cn(j,1e4+i),_ca:j.closed_at||'',_ar:j.archive_reason||''}));crender()}).catch(()=>{CA=[];crender()})}else crender()});
 $('clist').addEventListener('click',e=>{const b=e.target.closest('[data-cs]');if(!b)return;const c=e.target.closest('[data-ci]');const j=C.find(x=>x._i===+c.dataset.ci);if(!j)return;
  const s=b.dataset.cs;if(cs[j._id]===s)delete cs[j._id];else cs[j._id]=s;localStorage.setItem(CKEY,JSON.stringify(cs));crender()});
 $('ctop5').addEventListener('click',e=>{if(e.target.closest('.toph')){ctopOpen=!ctopOpen;localStorage.setItem('contestboard-top',ctopOpen?'1':'0');renderCTop();return}
  const row=e.target.closest('.ti5');if(!row||e.target.closest('a'))return;cgoTo(+row.dataset.ci)})}
function match(j){const q=$('cq').value.trim().toLowerCase(),g=$('cgrade').value,c=$('ccat').value;return(!g||j.grade===g)&&(!c||j.category===c)&&(!q||j._hay.includes(q))}
function card(j){const f=[['주최',j.host],['분야',j.category],['상금',j.prize],['마감',j.deadline],['참가 자격',j.eligibility],['지역 제한',j.region_limit],['출처',j.source],['추천 이유',j.reason]].filter(([k,v])=>v&&!MISS.test(String(v)));
 return `<div class="card" id="cc${j._i}" data-ci="${j._i}"><div class="top"><span class="b g-${esc(j.grade)}">${esc(j.grade)}</span><span class="b ${dcls(j._d)}">${dl(j._d,j.deadline)}</span><span class="b cat">${esc(j.category||'기타')}</span>${j.new_today?'<span class="b new">📌 신규</span>':''}${j.recommended?'<span class="b rec">👍 추천</span>':''}${cs[j._id]?'<span class="b">'+CICON[cs[j._id]]+' '+esc(cs[j._id])+'</span>':''}</div>
 ${j.recommended&&j.recommend_reason?'<div class="recr">👍 '+esc(j.recommend_reason)+'</div>':''}
 <div class="ti"><a href="${esc(j.url)}" target="_blank" rel="noopener">${esc(j.title)} ↗</a></div>
 <dl>${f.map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
 <div class="st">${CST.map(s=>`<button type="button" data-cs="${s}" class="${cs[j._id]===s?'on':''}">${s}</button>`).join('')}</div></div>`}
function cautoWhy(j){const p=[j.grade+'급'];if(j.recommended)p.push('추천');if(j._d!==null)p.push(j._d===0?'오늘 마감':j._d===1?'내일 마감':'D-'+j._d);if(j.new_today)p.push('신규');return p.join('·')}
function ctopList(){const ok=j=>!j._closed&&!['패스','제출함'].includes(cs[j._id]);
 if(CTOPSRC&&CTOPSRC.length){const L=[];for(const t of CTOPSRC){const k=t.link||t.url||t.id;const j=C.find(x=>x.url===k||x.id===k||x._id===k);if(j&&ok(j)&&!L.some(y=>y.j===j))L.push({j,why:t.why||cautoWhy(j)})}if(L.length)return L.slice(0,5)}
 return C.filter(j=>ok(j)&&j._d!==null&&j._d>=2).sort((a,b)=>((b.recommended?1:0)-(a.recommended?1:0))||(a._g-b._g)||((a._d??1e4)-(b._d??1e4))).slice(0,5).map(j=>({j,why:cautoWhy(j)}))}
function renderCTop(){const el=$('ctop5');if(!el)return;if(ctab==='arch'){el.hidden=true;el.innerHTML='';return}
 const L=ctopList();el.hidden=!L.length;if(!L.length){el.innerHTML='';return}
 el.innerHTML=`<button type="button" class="toph">🔥 오늘 꼭 볼 TOP ${L.length} <span>${ctopOpen?'접기 ▲':'펼치기 ▼'}</span></button>`+(ctopOpen?L.map(({j,why},n)=>{const d=j._d;
  return `<div class="ti5" data-ci="${j._i}"><span class="rk">${n+1}</span><span class="b g-${esc(j.grade)}">${esc(j.grade)}</span><span class="b ${dcls(d)}">${dl(d,j.deadline)}</span>
 <div class="rm"><div class="rt"><b>${esc(j.title)}</b>${j.new_today?' 📌':''}${j.recommended?' 👍':''}</div><div class="rs why">${esc(why)}</div></div>
 <a class="rl" href="${esc(j.url)}" target="_blank" rel="noopener">↗</a></div>`}).join(''):'')}
function cgoTo(i){const j=C.find(x=>x._i===i);if(!j)return;if(ctab!=='open'){ctab='open';box.querySelectorAll('[data-ct]').forEach(x=>x.classList.toggle('on',x.dataset.ct==='open'));hideArchControls();crender()}
 const vis=()=>$('clist').querySelector('[data-ci="'+i+'"]');
 if(!vis()){$('cq').value='';$('cgrade').value='';$('ccat').value='';$('cst').value='';if($('crec'))$('crec').checked=false;crender()}
 const el=vis();if(el){el.style.contentVisibility='visible';el.scrollIntoView({block:'start'});requestAnimationFrame(()=>requestAnimationFrame(()=>el.scrollIntoView({block:'start'})));setTimeout(()=>{el.scrollIntoView({block:'start'});el.style.contentVisibility=''},350);el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1500)}}
function crender(){const el=$('clist');if(!el)return;renderCTop();
 if(ctab==='arch'){if(!CA)return;const L=[...C.filter(j=>j._closed),...CA].filter(match);const G={};
  L.forEach(j=>{const m=String(j.deadline||j._ca).match(/(\d{4})-(\d{2})/);const k=m?`${m[1]}년 ${+m[2]}월`:'기한 미상';(G[k]=G[k]||[]).push(j)});const ks=Object.keys(G).sort().reverse();
  el.innerHTML=`<p class="ainfo">지난 대회 ${L.length}건 (마감 지난 대회는 자동으로 여기로 옮겨져요)</p>`+(ks.length?ks.map(k=>`<h3 class="mon">${k} <small>${G[k].length}건</small></h3>`+G[k].sort((a,b)=>String(b.deadline).localeCompare(String(a.deadline))).map(j=>
  `<div class="rowc closedrow"><span class="b g-${esc(j.grade)}">${esc(j.grade||'-')}</span><div class="rm"><div class="rt"><b>${esc(j.title)}</b>${cs[j._id]?' '+CICON[cs[j._id]]:''}</div><div class="rs">${esc(j.category||'')} · 마감 ${esc(j.deadline||'-')}${j.prize?' · '+esc(j.prize):''}</div></div><a class="rl" href="${esc(j.url)}" target="_blank" rel="noopener">↗</a></div>`).join('')).join(''):'<div class="empty">📭 아직 지난 대회가 없어요</div>');return}
 const st=$('cst').value,so=$('csort').value,rc=$('crec')&&$('crec').checked;
 const L=C.filter(j=>!j._closed&&match(j)&&(!rc||j.recommended)&&(!st||(st==='none'?!cs[j._id]:cs[j._id]===st)))
  .sort(so==='grade'?(a,b)=>a._g-b._g||(a._d??1e4)-(b._d??1e4):(a,b)=>(a._d??1e4)-(b._d??1e4)||a._g-b._g);
 el.innerHTML=L.length?L.map(card).join(''):(C.some(j=>!j._closed)?'<p>조건에 맞는 대회가 없어요.</p>':'<div class="empty">📭 지금 진행 중인 대회가 없어요</div>')}
function info(){const O=C.filter(j=>!j._closed),g=k=>O.filter(j=>j.grade===k).length,w=O.filter(j=>j._d!==null&&j._d<=7).length,r=O.filter(j=>j.recommended).length;
 $('cinfo').innerHTML=`<div>마지막 업데이트: ${asOf?esc(new Date(asOf).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}))+' (KST)':'알 수 없음'}</div><div>진행 중 ${O.length}건 · S${g('S')} / A${g('A')} / B${g('B')} · 👍 추천 ${r} · 7일 내 마감 ${w}</div>`}

const SST=['관심','지원함','패스'],SICON={'관심':'⭐','지원함':'📨','패스':'⏭️'};
const SKEY='sidegig-status-'+P;let ss=JSON.parse(localStorage.getItem(SKEY)||'{}');
let S=[],SA=null,stab='open',sasOf=null,STOPSRC=null,stopOpen=localStorage.getItem('sidegigboard-top')!=='0';const sbox=$('sidegig');
function sn(j,i){const raw=j.deadline_now||j.deadline||'';const d=dday(raw);const plat=j.source||j.company||'';
 return{...j,_i:i,_id:j.job_id||j.id||j.url||('s'+i),_d:d,_g:({S:0,A:1,B:2}[j.grade]??3),_closed:(j.status&&j.status!=='open')||(d!==null&&d<0),
  _plat:plat,_sal:j.salary||'',_hay:[j.title,plat,j.company,j.reason,j.caution,j.salary,j.stack,j.desc,j['한줄설명']].join(' ').toLowerCase()}}
function sshell(){if(!sbox)return;sbox.innerHTML=`<nav class="ctabs"><button type="button" data-st="open" class="on">진행 중</button><button type="button" data-st="arch">지난 부업</button></nav>
<div class="cfil"><input id="sq" type="search" placeholder="제목·플랫폼·이유 검색">
<div class="row"><select id="sgrade"><option value="">전체 등급</option><option>S</option><option>A</option><option>B</option></select>
<select id="ssrc"><option value="">전체 플랫폼</option></select>
<select id="sst"><option value="">전체 상태</option><option value="none">미분류</option>${SST.map(s=>`<option>${s}</option>`).join('')}</select>
<select id="ssort"><option value="dl">마감 임박순</option><option value="grade">등급순</option></select></div></div>
<section id="stop5"></section>
<main id="slist"></main>`;
 [...new Set(S.map(j=>j._plat).filter(Boolean))].sort().forEach(p=>$('ssrc').add(new Option(p,p)));
 ['sgrade','ssrc','sst','ssort'].forEach(id=>$(id).addEventListener('input',srender));let t;$('sq').addEventListener('input',()=>{clearTimeout(t);t=setTimeout(srender,200)});
 sbox.querySelector('.ctabs').addEventListener('click',e=>{const b=e.target.closest('[data-st]');if(!b)return;stab=b.dataset.st;sbox.querySelectorAll('[data-st]').forEach(x=>x.classList.toggle('on',x===b));$('ssort').style.display=$('sst').style.display=stab==='arch'?'none':'';
  if(stab==='arch'&&!SA){$('slist').textContent='지난 부업 불러오는 중…';fetch('data/'+P+'/sidegigs-archive.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():{items:[]}).then(d=>{SA=(d.items||[]).map((j,i)=>({...sn(j,2e4+i),_ca:j.closed_at||'',_ar:j.archive_reason||''}));srender()}).catch(()=>{SA=[];srender()})}else srender()});
 $('slist').addEventListener('click',e=>{const b=e.target.closest('[data-ss]');if(!b)return;const c=e.target.closest('[data-si]');const j=S.find(x=>x._i===+c.dataset.si);if(!j)return;
  const s=b.dataset.ss;if(ss[j._id]===s)delete ss[j._id];else ss[j._id]=s;localStorage.setItem(SKEY,JSON.stringify(ss));srender()});
 $('stop5').addEventListener('click',e=>{if(e.target.closest('.toph')){stopOpen=!stopOpen;localStorage.setItem('sidegigboard-top',stopOpen?'1':'0');renderSTop();return}
  const row=e.target.closest('.ti5');if(!row||e.target.closest('a'))return;sgoTo(+row.dataset.si)})}
function smatch(j){const q=$('sq').value.trim().toLowerCase(),g=$('sgrade').value,c=$('ssrc').value;return(!g||j.grade===g)&&(!c||j._plat===c)&&(!q||j._hay.includes(q))}
function scard(j){const f=[['플랫폼',j._plat],['수입·기간',j._sal],['마감',j.deadline_now||j.deadline],['추천 이유',j.reason],['주의',j.caution]].filter(([k,v])=>v&&!MISS.test(String(v)));
 return `<div class="card" data-si="${j._i}"><div class="top"><span class="b g-${esc(j.grade)}">${esc(j.grade)}</span><span class="b ${dcls(j._d)}">${dl(j._d,j.deadline_now||j.deadline)}</span>${j._plat?'<span class="b cat">'+esc(j._plat)+'</span>':''}${j.new_today?'<span class="b new">📌 신규</span>':''}${ss[j._id]?'<span class="b">'+SICON[ss[j._id]]+' '+esc(ss[j._id])+'</span>':''}</div>
 <div class="ti"><a href="${esc(j.url)}" target="_blank" rel="noopener">${esc(j.title)} ↗</a></div>
 <dl>${f.map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
 <div class="st">${SST.map(s=>`<button type="button" data-ss="${s}" class="${ss[j._id]===s?'on':''}">${s}</button>`).join('')}</div></div>`}
function sautoWhy(j){const p=[j.grade+'급'];if(j._d!==null)p.push(j._d===0?'오늘 마감':j._d===1?'내일 마감':'D-'+j._d);if(j.new_today)p.push('신규');return p.join('·')}
function stopList(){const ok=j=>!j._closed&&!['패스','지원함'].includes(ss[j._id]);
 if(STOPSRC&&STOPSRC.length){const L=[];for(const t of STOPSRC){const k=t.link||t.url||t.id||t.job_id;const j=S.find(x=>x.url===k||x.link===k||x.job_id===k||x.id===k||x._id===k);if(j&&ok(j)&&!L.some(y=>y.j===j))L.push({j,why:t.why||sautoWhy(j)})}if(L.length)return L.slice(0,5)}
 const sc=j=>({S:30,A:20,B:10}[j.grade]||0)+(j._d!==null&&j._d>=0&&j._d<=7?10-j._d:0)+(j.new_today?5:0);
 return S.filter(ok).map(j=>({j,s:sc(j)})).sort((a,b)=>b.s-a.s||((a.j._d??1e4)-(b.j._d??1e4))).slice(0,5).map(x=>({j:x.j,why:sautoWhy(x.j)}))}
function renderSTop(){const el=$('stop5');if(!el)return;if(stab==='arch'){el.hidden=true;el.innerHTML='';return}
 const L=stopList();el.hidden=!L.length;if(!L.length){el.innerHTML='';return}
 el.innerHTML=`<button type="button" class="toph">🔥 오늘 꼭 볼 TOP ${L.length} <span>${stopOpen?'접기 ▲':'펼치기 ▼'}</span></button>`+(stopOpen?L.map(({j,why},n)=>{const d=j._d;
  return `<div class="ti5" data-si="${j._i}"><span class="rk">${n+1}</span><span class="b g-${esc(j.grade)}">${esc(j.grade)}</span><span class="b ${dcls(d)}">${dl(d,j.deadline_now||j.deadline)}</span>
 <div class="rm"><div class="rt"><b>${esc(j.title)}</b>${j.new_today?' 📌':''}</div><div class="rs why">${esc(why)}</div></div>
 <a class="rl" href="${esc(j.url)}" target="_blank" rel="noopener">↗</a></div>`}).join(''):'')}
function sgoTo(i){const j=S.find(x=>x._i===i);if(!j)return;if(stab!=='open'){stab='open';sbox.querySelectorAll('[data-st]').forEach(x=>x.classList.toggle('on',x.dataset.st==='open'));$('ssort').style.display=$('sst').style.display='';srender()}
 const vis=()=>$('slist').querySelector('[data-si="'+i+'"]');
 if(!vis()){$('sq').value='';$('sgrade').value='';$('ssrc').value='';$('sst').value='';srender()}
 const el=vis();if(el){el.style.contentVisibility='visible';el.scrollIntoView({block:'start'});requestAnimationFrame(()=>requestAnimationFrame(()=>el.scrollIntoView({block:'start'})));setTimeout(()=>{el.scrollIntoView({block:'start'});el.style.contentVisibility=''},350);el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1500)}}
function srender(){const el=$('slist');if(!el)return;renderSTop();
 if(stab==='arch'){if(!SA)return;const L=[...S.filter(j=>j._closed),...SA].filter(smatch);const G={};
  L.forEach(j=>{const m=String(j.deadline_now||j.deadline||j._ca).match(/(\d{4})-(\d{2})/);const k=m?`${m[1]}년 ${+m[2]}월`:'기한 미상';(G[k]=G[k]||[]).push(j)});const ks=Object.keys(G).sort().reverse();
  el.innerHTML=`<p class="ainfo">지난 부업 ${L.length}건 (마감 지난 건은 자동으로 여기로 옮겨져요)</p>`+(ks.length?ks.map(k=>`<h3 class="mon">${k} <small>${G[k].length}건</small></h3>`+G[k].sort((a,b)=>String(b.deadline||'').localeCompare(String(a.deadline||''))).map(j=>
  `<div class="rowc closedrow"><span class="b g-${esc(j.grade)}">${esc(j.grade||'-')}</span><div class="rm"><div class="rt"><b>${esc(j.title)}</b>${ss[j._id]?' '+SICON[ss[j._id]]:''}</div><div class="rs">${esc(j._plat||'')} · ${esc(j._sal||'')} · 마감 ${esc(j.deadline_now||j.deadline||'-')}</div></div><a class="rl" href="${esc(j.url)}" target="_blank" rel="noopener">↗</a></div>`).join('')).join(''):'<div class="empty">📭 아직 지난 부업이 없어요</div>');return}
 const st=$('sst').value,so=$('ssort').value;
 const L=S.filter(j=>!j._closed&&smatch(j)&&(!st||(st==='none'?!ss[j._id]:ss[j._id]===st)))
  .sort(so==='grade'?(a,b)=>a._g-b._g||(a._d??1e4)-(b._d??1e4):(a,b)=>(a._d??1e4)-(b._d??1e4)||a._g-b._g);
 el.innerHTML=L.length?L.map(scard).join(''):(S.some(j=>!j._closed)?'<p>조건에 맞는 부업이 없어요.</p>':'<div class="empty">📭 지금 진행 중인 부업이 없어요</div>')}
function sinfo(){const O=S.filter(j=>!j._closed),g=k=>O.filter(j=>j.grade===k).length,w=O.filter(j=>j._d!==null&&j._d<=7).length;
 $('cinfo').innerHTML=`<div>마지막 업데이트: ${sasOf?esc(new Date(sasOf).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}))+' (KST)':'알 수 없음'}</div><div>진행 중 ${O.length}건 · S${g('S')} / A${g('A')} / B${g('B')} · 7일 내 마감 ${w}</div>`}

function setMode(m){if(m==='contest'&&!hasContests)m='job';if(m==='sidegig'&&!hasSidegigs)m='job';
 window.MODE=m;localStorage.setItem(MKEY,m);const con=m==='contest',side=m==='sidegig',extra=con||side;
 $('m-job').classList.toggle('on',!extra);$('m-job').setAttribute('aria-pressed',!extra);
 if($('m-con')){$('m-con').classList.toggle('on',con);$('m-con').setAttribute('aria-pressed',con)}
 if($('m-side')){$('m-side').classList.toggle('on',side);$('m-side').setAttribute('aria-pressed',side)}
 document.body.classList.toggle('cmode',extra);document.body.classList.toggle('smode',side);
 box.hidden=!con;if(sbox)sbox.hidden=!side;$('cinfo').hidden=!extra;$('updated').hidden=$('counts').hidden=extra;document.querySelector('.vt').style.display=extra?'none':'';
 const h=document.querySelector('header h1');h.textContent=con?'대회 보드':side?'부업 보드':'채용 공고 보드';document.title=document.title.replace(/채용 공고 보드|대회 보드|부업 보드/,con?'대회 보드':side?'부업 보드':'채용 공고 보드');
 const u=new URL(location.href);if(con)u.searchParams.set('m','contest');else if(side)u.searchParams.set('m','sidegig');else u.searchParams.delete('m');history.replaceState(null,'',u);
 if(con){info();crender()}if(side){sinfo();srender()}}

fetch('data/people.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(L=>{
 const person=L.find(x=>x.id===P)||{};hasContests=!!person.contests;hasSidegigs=!!person.sidegigs;
 if(!hasContests&&!hasSidegigs)return Promise.reject('no extra modes');
 const tasks=[];
 if(hasContests)tasks.push(fetch('data/'+P+'/contests.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(r.status)).then(d=>{asOf=d.as_of||null;C=(d.items||[]).map(cn);CTOPSRC=Array.isArray(d.top5)?d.top5:null;return 'c'}).catch(()=>{hasContests=false;C=[];CTOPSRC=null;return null}));
 if(hasSidegigs)tasks.push(fetch('data/'+P+'/sidegigs.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(r.status)).then(d=>{sasOf=d.as_of||null;S=(d.items||[]).map(sn);STOPSRC=Array.isArray(d.top5)?d.top5:null;return 's'}).catch(()=>{hasSidegigs=false;S=[];STOPSRC=null;return null}));
 return Promise.all(tasks)}).then(()=>{
 if(!hasContests&&!hasSidegigs)return;
 if(hasContests){shell();info()}
 if(hasSidegigs)sshell();
 $('modes').hidden=false;if($('m-con'))$('m-con').hidden=!hasContests;if($('m-side'))$('m-side').hidden=!hasSidegigs;
 $('m-job').onclick=()=>setMode('job');if(hasContests)$('m-con').onclick=()=>setMode('contest');if(hasSidegigs)$('m-side').onclick=()=>setMode('sidegig');
 const want=new URLSearchParams(location.search).get('m')||localStorage.getItem(MKEY);
 if(want==='contest'&&hasContests)setMode('contest');else if(want==='sidegig'&&hasSidegigs)setMode('sidegig');else setMode('job')}).catch(()=>{});
})();
