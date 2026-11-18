/* 대회 탭: people.json에서 contests:true 인 사람에게만 data/<P>/contests.json을 읽어 '채용 / 대회' 모드 전환을 보여준다. app.js의 P, $, esc, dday를 그대로 쓴다. */
(function(){
const CATS=['IT·해커톤','창업·지원사업','지자체·기관 공모','디자인·영상','글쓰기·수기','음악','운동','기타'];
const CST=['관심','참가함','제출함','패스'],CICON={'관심':'⭐','참가함':'🙋','제출함':'📤','패스':'⏭️'};
const CKEY='contest-status-'+P,MKEY='jobboard-mode-'+P;let cs=JSON.parse(localStorage.getItem(CKEY)||'{}');
let C=[],CA=null,ctab='open',asOf=null;const box=$('contest');
function cn(j,i){const d=dday(j.deadline);return{...j,_i:i,_id:j.id||j.url||('c'+i),_d:d,_g:({S:0,A:1,B:2}[j.grade]??3),_closed:d!==null&&d<0,
 _hay:[j.title,j.host,j.category,j.prize,j.eligibility,j.reason,j.source].join(' ').toLowerCase()}}
function dl(d,s){return d===null?esc(s||'기한 미기재'):d<0?'마감':d===0?'오늘 마감':d===1?'내일 마감':'D-'+d}
function dcls(d){return d!==null&&d>=0&&d<=1?'urgent':d!==null&&d>=2&&d<=3?'soon':'dd'}
function shell(){box.innerHTML=`<nav class="ctabs"><button type="button" data-ct="open" class="on">진행 중</button><button type="button" data-ct="arch">지난 대회</button></nav>
<div class="cfil"><input id="cq" type="search" placeholder="대회명·주최·상금 검색">
<div class="row"><select id="cgrade"><option value="">전체 등급</option><option>S</option><option>A</option><option>B</option></select>
<select id="ccat"><option value="">전체 분야</option>${CATS.map(c=>`<option>${c}</option>`).join('')}</select>
<select id="cst"><option value="">전체 상태</option><option value="none">미분류</option>${CST.map(s=>`<option>${s}</option>`).join('')}</select>
<select id="csort"><option value="dl">마감 임박순</option><option value="grade">등급순</option></select></div></div>
<main id="clist"></main>`;
 ['cgrade','ccat','cst','csort'].forEach(id=>$(id).addEventListener('input',crender));let t;$('cq').addEventListener('input',()=>{clearTimeout(t);t=setTimeout(crender,200)});
 box.querySelector('.ctabs').addEventListener('click',e=>{const b=e.target.closest('[data-ct]');if(!b)return;ctab=b.dataset.ct;box.querySelectorAll('[data-ct]').forEach(x=>x.classList.toggle('on',x===b));$('csort').style.display=$('cst').style.display=ctab==='arch'?'none':'';
  if(ctab==='arch'&&!CA){$('clist').textContent='지난 대회 불러오는 중…';fetch('data/'+P+'/contests-archive.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():{items:[]}).then(d=>{CA=(d.items||[]).map((j,i)=>({...cn(j,1e4+i),_ca:j.closed_at||'',_ar:j.archive_reason||''}));crender()}).catch(()=>{CA=[];crender()})}else crender()});
 $('clist').addEventListener('click',e=>{const b=e.target.closest('[data-cs]');if(!b)return;const c=e.target.closest('[data-ci]');const j=C.find(x=>x._i===+c.dataset.ci);if(!j)return;
  const s=b.dataset.cs;if(cs[j._id]===s)delete cs[j._id];else cs[j._id]=s;localStorage.setItem(CKEY,JSON.stringify(cs));crender()})}
function match(j){const q=$('cq').value.trim().toLowerCase(),g=$('cgrade').value,c=$('ccat').value;return(!g||j.grade===g)&&(!c||j.category===c)&&(!q||j._hay.includes(q))}
function card(j){const f=[['주최',j.host],['분야',j.category],['상금',j.prize],['마감',j.deadline],['참가 자격',j.eligibility],['지역 제한',j.region_limit],['출처',j.source],['추천 이유',j.reason]].filter(([k,v])=>v&&!MISS.test(String(v)));
 return `<div class="card" data-ci="${j._i}"><div class="top"><span class="b g-${esc(j.grade)}">${esc(j.grade)}</span><span class="b ${dcls(j._d)}">${dl(j._d,j.deadline)}</span><span class="b cat">${esc(j.category||'기타')}</span>${j.new_today?'<span class="b new">📌 신규</span>':''}${cs[j._id]?'<span class="b">'+CICON[cs[j._id]]+' '+esc(cs[j._id])+'</span>':''}</div>
 <div class="ti"><a href="${esc(j.url)}" target="_blank" rel="noopener">${esc(j.title)} ↗</a></div>
 <dl>${f.map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
 <div class="st">${CST.map(s=>`<button type="button" data-cs="${s}" class="${cs[j._id]===s?'on':''}">${s}</button>`).join('')}</div></div>`}
function crender(){const el=$('clist');if(!el)return;
 if(ctab==='arch'){if(!CA)return;const L=[...C.filter(j=>j._closed),...CA].filter(match);const G={};
  L.forEach(j=>{const m=String(j.deadline||j._ca).match(/(\d{4})-(\d{2})/);const k=m?`${m[1]}년 ${+m[2]}월`:'기한 미상';(G[k]=G[k]||[]).push(j)});const ks=Object.keys(G).sort().reverse();
  el.innerHTML=`<p class="ainfo">지난 대회 ${L.length}건 (마감 지난 대회는 자동으로 여기로 옮겨져요)</p>`+(ks.length?ks.map(k=>`<h3 class="mon">${k} <small>${G[k].length}건</small></h3>`+G[k].sort((a,b)=>String(b.deadline).localeCompare(String(a.deadline))).map(j=>
  `<div class="rowc closedrow"><span class="b g-${esc(j.grade)}">${esc(j.grade||'-')}</span><div class="rm"><div class="rt"><b>${esc(j.title)}</b>${cs[j._id]?' '+CICON[cs[j._id]]:''}</div><div class="rs">${esc(j.category||'')} · 마감 ${esc(j.deadline||'-')}${j.prize?' · '+esc(j.prize):''}</div></div><a class="rl" href="${esc(j.url)}" target="_blank" rel="noopener">↗</a></div>`).join('')).join(''):'<div class="empty">📭 아직 지난 대회가 없어요</div>');return}
 const st=$('cst').value,so=$('csort').value;
 const L=C.filter(j=>!j._closed&&match(j)&&(!st||(st==='none'?!cs[j._id]:cs[j._id]===st)))
  .sort(so==='grade'?(a,b)=>a._g-b._g||(a._d??1e4)-(b._d??1e4):(a,b)=>(a._d??1e4)-(b._d??1e4)||a._g-b._g);
 el.innerHTML=L.length?L.map(card).join(''):(C.some(j=>!j._closed)?'<p>조건에 맞는 대회가 없어요.</p>':'<div class="empty">📭 지금 진행 중인 대회가 없어요</div>')}
function info(){const O=C.filter(j=>!j._closed),g=k=>O.filter(j=>j.grade===k).length,w=O.filter(j=>j._d!==null&&j._d<=7).length;
 $('cinfo').innerHTML=`<div>마지막 업데이트: ${asOf?esc(new Date(asOf).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}))+' (KST)':'알 수 없음'}</div><div>진행 중 ${O.length}건 · S${g('S')} / A${g('A')} / B${g('B')} · 7일 내 마감 ${w}</div>`}
function setMode(m){window.MODE=m;localStorage.setItem(MKEY,m);const con=m==='contest';
 $('m-job').classList.toggle('on',!con);$('m-con').classList.toggle('on',con);$('m-job').setAttribute('aria-pressed',!con);$('m-con').setAttribute('aria-pressed',con);
 document.body.classList.toggle('cmode',con);
 box.hidden=!con;$('cinfo').hidden=!con;$('updated').hidden=$('counts').hidden=con;document.querySelector('.vt').style.display=con?'none':'';
 const h=document.querySelector('header h1');h.textContent=con?'대회 보드':'채용 공고 보드';document.title=document.title.replace(/채용 공고 보드|대회 보드/,con?'대회 보드':'채용 공고 보드');
 const u=new URL(location.href);if(con)u.searchParams.set('m','contest');else u.searchParams.delete('m');history.replaceState(null,'',u);if(con)crender()}
fetch('data/people.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(L=>(L.find(x=>x.id===P)||{}).contests?fetch('data/'+P+'/contests.json?t='+Date.now(),{cache:'no-store'}):Promise.reject('no contests')).then(r=>r.ok?r.json():Promise.reject(r.status)).then(d=>{
 asOf=d.as_of||null;C=(d.items||[]).map(cn);$('modes').hidden=false;shell();info();
 $('m-job').onclick=()=>setMode('job');$('m-con').onclick=()=>setMode('contest');
 const want=new URLSearchParams(location.search).get('m')||localStorage.getItem(MKEY);setMode(want==='contest'?'contest':'job')}).catch(()=>{});
})();
