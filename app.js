let tab='open',ARCH=null,TOPSRC=null;
const QP=new URLSearchParams(location.search);let P=(QP.get('p')||localStorage.getItem('jobboard-person')||'hyunwoo').replace(/[^a-z0-9_-]/gi,'');
const ST=['관심','지원함','서류합격','탈락','패스'],KEY=P==='hyunwoo'?'jobboard-status':'jobboard-status-'+P;let saved=JSON.parse(localStorage.getItem(KEY)||'{}'),jobs=[];
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>{const k=new Date(Date.now()+9*36e5);return Date.UTC(k.getUTCFullYear(),k.getUTCMonth(),k.getUTCDate())};
function dday(s){const m=String(s||'').match(/(\d{4})-(\d{2})-(\d{2})/);if(!m)return null;return Math.round((Date.UTC(+m[1],m[2]-1,+m[3])-today())/864e5)}
const MISS=/^(미기재|없음|-|n\/a|null|undefined)?$/i;
const pick=(j,...ks)=>{for(const k of ks){let v=j[k];if(Array.isArray(v))v=v.join(', ');if(v&&typeof v==='object')v=v.name||v.value||'';v=String(v??'').trim();if(!MISS.test(v))return v}return ''};
const HOST={'saramin':'사람인','wanted':'원티드','jumpit':'점핏','jobkorea':'잡코리아','linkareer':'링커리어','incruit':'인크루트','rocketpunch':'로켓펀치','programmers':'프로그래머스','catch':'캐치','recruiter.co.kr':'공식 채용','greetinghr':'공식 채용(그리팅)','ninehire':'공식 채용(나인하이어)'};
function srcFromUrl(u){try{const h=new URL(u).hostname;for(const k in HOST)if(h.includes(k))return HOST[k]+' (링크 기준)';return h.replace(/^www\./,'')}catch(e){return ''}}
function norm(j,i){const dl=j.deadline_now||j.deadline||'';const region=pick(j,'region','location','지역','loc','area','address');const exp=pick(j,'exp_tier','experience','경력','exp_original','exp_raw','exp_text','career');
 const d=dday(dl);return{...j,_i:i,_g:({S:0,A:1,B:2}[j.grade]??3),_id:j.job_id||j.url||('i'+i),_dl:dl,_d:d,_region:region,_r1:(region.match(/^[가-힣]+/)||['미기재'])[0],_exp:exp||'미기재',
 _new:!!(j.new_today||j.new||j.new_since_1013),_ai:!!(j.ai_integration||/AI연동/.test(JSON.stringify(j.tags||j.tag||''))),_closed:(j.status&&j.status!=='open')||(d!==null&&d<0),_gone:d!==null&&d<-3,_desc:pick(j,'한줄설명','desc','description','설명'),
 _src:pick(j,'source','site','출처','platform')||srcFromUrl(j.url),_stack:pick(j,'stack','tech','skills','기술스택','스택','tags'),
 _reason:[pick(j,'reason','추천이유','추천 이유','why'),pick(j,'reason2')].filter(Boolean).join(' / '),_caution:pick(j,'caution','주의점','주의','note','notes','change'),
 _expOrig:pick(j,'exp_original','exp_raw','exp_text','experience','career'),_sal:pick(j,'salary','연봉'),_url:pick(j,'url','link','url_official','alt_url','alt')}}
fetch('data/'+P+'/jobs.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(d=>{
 const items=(Array.isArray(d)?d:d.items)||[];jobs=items.map(norm).map(prep).sort((a,b)=>(a._closed-b._closed)||(a._g-b._g)||((a._d??1e4)-(b._d??1e4)));byI=new Map(jobs.map(j=>[j._i,j]));TOPSRC=Array.isArray(d.top5)?d.top5:null;
 if(!jobs.length){$('updated').textContent='마지막 업데이트: -';$('counts').textContent='';$('top5').innerHTML='';$('list').innerHTML='<div class="empty">📭 아직 공고 데이터가 없어요</div>';return}
 $('updated').textContent='마지막 업데이트: '+(d.as_of?new Date(d.as_of).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})+' (KST)':'알 수 없음');
 const g=k=>jobs.filter(j=>j.grade===k).length;$('counts').textContent=`총 ${jobs.length}건 · S${g('S')} / A${g('A')} / B${g('B')} · 🤖 ${jobs.filter(j=>j._ai).length}`;
 [...new Set(jobs.map(j=>j._r1))].sort().forEach(r=>$('region').add(new Option(r,r)));
 [...new Set(jobs.map(j=>j._exp))].sort().forEach(r=>$('exp').add(new Option(r,r)));ST.forEach(s=>$('mystat').add(new Option(s,s)));render()})
 .catch(e=>{$('list').innerHTML='<div class="empty">📭 아직 공고 데이터가 없어요</div>';$('updated').textContent='마지막 업데이트: -'});
function prep(j){j._hay=[j.company,j.title,j.role,j._stack,j._src,j._region,j._desc].join(' ').toLowerCase();return j}
const PAGE=30;let L=[],shown=0,byI=new Map(),qT;const LIST=$('list'),tpl=document.createElement('template');
['grade','region','exp','mystat','ai'].forEach(id=>$(id).addEventListener('input',render));
$('q').addEventListener('input',()=>{clearTimeout(qT);qT=setTimeout(render,200)});
function filt(){const q=$('q').value.trim().toLowerCase(),gr=$('grade').value,rg=$('region').value,ex=$('exp').value,ms=$('mystat').value,ai=$('ai').checked;
 return jobs.filter(j=>!j._gone&&(!gr||j.grade===gr)&&(!rg||j._r1===rg)&&(!ex||j._exp===ex)&&(!ai||j._ai)&&(!ms||(ms==='none'?!saved[j._id]:saved[j._id]===ms))&&(!q||j._hay.includes(q)))}
function nodes(html){tpl.innerHTML=html;return tpl.content}
let io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting))more()},{rootMargin:'800px'});
function more(n){if(shown>=L.length)return;const end=Math.min(L.length,n||shown+PAGE);const s=$('sentinel');
 const frag=nodes(L.slice(shown,end).map(card).join(''));s?LIST.insertBefore(frag,s):LIST.appendChild(frag);shown=end;if(s){if(shown>=L.length)s.remove();else{s.textContent=`더 보기 (${L.length-shown}건 남음)`;io.unobserve(s);io.observe(s)}}}
function render(keep){if(tab!=='arch'&&!jobs.length)return;if(tab==='arch'){renderArch();return}renderTop();
 const n=keep?Math.max(shown,PAGE):PAGE;L=filt();shown=0;io.disconnect();
 if(!L.length){LIST.innerHTML='<p>조건에 맞는 공고가 없어요.</p>';return}
 LIST.textContent='';const s=mkS();LIST.appendChild(s);more(n);if($('sentinel'))io.observe(s)}
function mkS(){const s=document.createElement('button');s.type='button';s.id='sentinel';s.className='sentinel';s.onclick=()=>more();return s}
function repaint(j){const el=$('c'+j._i);if(el)el.replaceWith(nodes(card(j)))}
LIST.addEventListener('click',e=>{if(e.target.closest('a'))return;const b=e.target.closest('[data-s]');const c=e.target.closest('[data-i]');if(!c)return;const j=byI.get(+c.dataset.i);
 if(b){const s=b.dataset.s;if(saved[j._id]===s)delete saved[j._id];else saved[j._id]=s;localStorage.setItem(KEY,JSON.stringify(saved));
  if($('mystat').value)render(true);else{repaint(j);renderTop()}return}
 if(e.target.closest('.fold')||c.classList.contains('rowc')){open.has(j._id)?open.delete(j._id):open.add(j._id);repaint(j)}});
const ICON={'관심':'⭐','지원함':'📨','서류합격':'✅','탈락':'❌','패스':'⏭️'};
let view=new URLSearchParams(location.search).get('view')||localStorage.getItem('jobboard-view')||'full';const open=new Set();
function setView(v){view=v;localStorage.setItem('jobboard-view',v);$('v-full').classList.toggle('on',v==='full');$('v-compact').classList.toggle('on',v==='compact');['v-full','v-compact'].forEach(x=>$(x).setAttribute('aria-pressed',$(x).classList.contains('on')));
 if(tab==='open'&&jobs.length){io.disconnect();const n=shown;LIST.textContent='';const s=mkS();LIST.appendChild(s);shown=0;more(n||PAGE);if($('sentinel'))io.observe(s)}else render()}
document.addEventListener('click',e=>{const b=e.target.closest('#v-full,#v-compact');if(b)setView(b.id==='v-compact'?'compact':'full')});setView(view);
function dlabel(j){const d=j._d;return d===null?esc(j._dl||'미기재'):d<0?'마감':d===0?'오늘':d===1?'내일':'D-'+d}
function card(j){if(view==='compact'&&!open.has(j._id))return row(j);return full(j)}
function row(j){const d=j._d;
 return `<div id="c${j._i}" data-i="${j._i}" class="rowc${j._closed?' closed':''}"><span class="b g-${esc(j.grade)}">${esc(j.grade)}</span><span class="b ${d!==null&&d>=0&&d<=1?'urgent':'dd'}">${dlabel(j)}</span>
 <div class="rm"><div class="rt"><b>${esc(j.company)}</b> ${j._ai?'🤖':''}${j._new?'📌':''}${saved[j._id]?' '+ICON[saved[j._id]]:''}</div><div class="rp">${esc(j.title||j.role)}</div><div class="rs">${[j._region,j._exp==='미기재'?'':j._exp].filter(Boolean).map(esc).join(' · ')}</div></div>
 <a class="rl" href="${esc(j._url)}" target="_blank" rel="noopener">↗</a></div>`}
function full(j){const d=j._d;let db=d===null?esc(j._dl||'기한 미기재'):d<0?'마감':d===0?'오늘 마감':d===1?'내일 마감':'D-'+d;
 const f=[['출처',j._src],['지역',j._region],['경력',j._exp+(j._expOrig&&j._expOrig!==j._exp?' ('+j._expOrig+')':'')],['스택',j._stack],['연봉',j._sal],['마감',j._dl],['추천 이유',j._reason],['주의',j._caution]].filter(([k,v])=>v&&!MISS.test(v));
 return `<div id="c${j._i}" data-i="${j._i}" class="card${j._closed?' closed':''}"><div class="top"><span class="b g-${esc(j.grade)}">${esc(j.grade)}</span><span class="b ${d!==null&&d>=0&&d<=1?'urgent':'dd'}">${db}</span>${j._new?'<span class="b new">📌 신규</span>':''}${j._ai?'<span class="b ai">🤖 AI연동</span>':''}</div>
 ${view==='compact'?'<button type="button" class="fold">접기 ▲</button>':''}<div class="co">${esc(j.company)}</div><div class="ti"><a href="${esc(j._url)}" target="_blank" rel="noopener">${esc(j.title||j.role)} ↗</a></div>
 <dl>${f.map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl><div class="desc">${esc(j._desc)}</div>
 <div class="st">${ST.map(s=>`<button type="button" data-s="${s}" class="${saved[j._id]===s?'on':''}">${s}</button>`).join('')}</div></div>`}

let topOpen=localStorage.getItem('jobboard-top')!=='0';
function autoWhy(j){const p=[j.grade+'급'];if(j._d!==null&&j._d<=7)p.push(j._d===0?'오늘 마감':j._d===1?'내일 마감':'D-'+j._d);if(j._new)p.push('신규');if(j._ai)p.push('AI연동');return p.join('·')}
function topList(){const ok=j=>!j._closed&&!j._gone&&!['탈락','패스','지원함'].includes(saved[j._id]);
 if(TOPSRC&&TOPSRC.length){const L=[];for(const t of TOPSRC){const k=t.link||t.url||t.id;const j=jobs.find(x=>x.url===k||x._url===k||x.job_id===k||x._id===k);if(j&&ok(j)&&!L.some(y=>y.j===j))L.push({j,why:t.why||autoWhy(j)})}if(L.length)return L.slice(0,5)}
 const sc=j=>({S:30,A:20,B:10}[j.grade]||0)+(j._d!==null&&j._d>=0&&j._d<=7?10-j._d:0)+(j._new?5:0)+(j._ai?3:0);
 return jobs.filter(ok).map(j=>({j,s:sc(j)})).sort((a,b)=>b.s-a.s||((a.j._d??1e4)-(b.j._d??1e4))).slice(0,5).map(x=>({j:x.j,why:autoWhy(x.j)}))}
function renderTop(){const el=$('top5');if(!el||!jobs.length)return;const L=topList();
 el.innerHTML=`<button class="toph" onclick="topOpen=!topOpen;localStorage.setItem('jobboard-top',topOpen?'1':'0');renderTop()">🔥 오늘 꼭 볼 TOP ${L.length} <span>${topOpen?'접기 ▲':'펼치기 ▼'}</span></button>`+(topOpen?L.map(({j,why},n)=>{const d=j._d;
 return `<div class="ti5" onclick="goTo(${j._i})"><span class="rk">${n+1}</span><span class="b g-${esc(j.grade)}">${esc(j.grade)}</span><span class="b ${d!==null&&d>=0&&d<=1?'urgent':'dd'}">${dlabel(j)}</span>
 <div class="rm"><div class="rt"><b>${esc(j.company)}</b> ${j._ai?'🤖':''}${j._new?'📌':''}</div><div class="rp">${esc(j.title||j.role)}</div><div class="rs why">${esc(why)}</div></div>
 <a class="rl" href="${esc(j._url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">↗</a></div>`}).join(''):'')}
function goTo(i){const j=byI.get(i);open.add(j._id);let k=L.indexOf(j);
 if(k<0){['q','grade','region','exp','mystat'].forEach(x=>$(x).value='');$('ai').checked=false;render();k=L.indexOf(j)}
 if(k>=shown)more(k+1);let el=$('c'+i);if(el&&el.classList.contains('rowc')){repaint(j);el=$('c'+i)}
 if(el){el.scrollIntoView({behavior:'smooth',block:'start'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1500)}}


function setTab(t){tab=t;$('t-open').classList.toggle('on',t==='open');$('t-arch').classList.toggle('on',t==='arch');
 $('list').hidden=$('top5').hidden=t==='arch';$('arch').hidden=t!=='arch';['region','exp','mystat'].forEach(x=>$(x).style.display=t==='arch'?'none':'');
 if(t==='arch'&&!ARCH){$('arch').textContent='지난 공고 불러오는 중…';fetch('data/'+P+'/archive.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():{items:[]}).then(d=>{ARCH=(d.items||[]).map((j,i)=>({...norm(j,i),_ca:j.closed_at||'',_ar:j.archive_reason||j.note||''}));render()}).catch(e=>$('arch').textContent='불러오기 실패: '+e)}else render()}
$('t-open').onclick=()=>setTab('open');$('t-arch').onclick=()=>setTab('arch');
function renderArch(){if(!ARCH)return;const q=$('q').value.trim().toLowerCase(),gr=$('grade').value;
 const L=ARCH.filter(j=>(!gr||j.grade===gr)&&(!$('ai').checked||j._ai)&&(!q||[j.company,j.title,j.role,j._stack,j._region,j._desc,j._ar].join(' ').toLowerCase().includes(q)));
 const G={};L.forEach(j=>{const m=String(j._dl).match(/(\d{4})-(\d{2})/)||String(j._ca).match(/(\d{4})-(\d{2})/);const k=m?`${m[1]}년 ${+m[2]}월`:'기한 미상';(G[k]=G[k]||[]).push(j)});
 const ks=Object.keys(G).sort().reverse();
 $('arch').innerHTML=`<p class="ainfo">지난 공고 ${L.length}건 (마감·목록 제외 공고를 계속 보관해요)</p>`+(ks.length?ks.map(k=>`<h3 class="mon">${k} <small>${G[k].length}건</small></h3>`+G[k].sort((a,b)=>String(b._dl).localeCompare(String(a._dl))).map(j=>
 `<div class="rowc closedrow"><span class="b g-${esc(j.grade)}">${esc(j.grade||'-')}</span><div class="rm"><div class="rt"><b>${esc(j.company)}</b> ${j._ai?'🤖':''}${saved[j._id]?' '+ICON[saved[j._id]]+' '+esc(saved[j._id]):''}</div>
 <div class="rp">${esc(j.title||j.role)}</div><div class="rs">마감 ${esc(String(j._dl||'-').slice(0,10))} · 보관 ${esc(j._ca)}${j._ar?' · '+esc(j._ar):''}</div></div>
 <a class="rl" href="${esc(j._url)}" target="_blank" rel="noopener">↗</a></div>`).join('')).join(''):(ARCH.length?'<p>조건에 맞는 지난 공고가 없어요.</p>':'<div class="empty">📭 아직 지난 공고가 없어요</div>'))}

localStorage.setItem('jobboard-person',P);
fetch('data/people.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(L=>{
 if(!L.some(x=>x.id===P)){P='hyunwoo';localStorage.setItem('jobboard-person',P);location.search='?p=hyunwoo';return}
 $('people').innerHTML=L.map(x=>`<button type="button" class="${x.id===P?'on':''}" aria-pressed="${x.id===P}" data-p="${esc(x.id)}">${esc(x.name)}</button>`).join('');
 document.title=(L.find(x=>x.id===P)||{}).name+' · 채용 공고 보드'}).catch(()=>{});
$('people').addEventListener('click',e=>{const b=e.target.closest('button[data-p]');if(!b||b.dataset.p===P)return;localStorage.setItem('jobboard-person',b.dataset.p);const u=new URL(location.href);u.searchParams.set('p',b.dataset.p);location.href=u.toString()});

(function(){const base='https://henujobs.goatcounter.com/counter/'+encodeURIComponent('/job-board/')+'.json',fmt=n=>Number(String(n).replace(/\D/g,'')||0).toLocaleString('ko-KR');
 const get=q=>fetch(base+q,{cache:'no-store'}).then(r=>r.status===404?{count:'0'}:r.ok?r.json():Promise.reject(r.status));
 const k=new Date(Date.now()+9*36e5).toISOString().slice(0,10);
 Promise.allSettled([get(''),get('?start='+k)]).then(([t,d])=>{if(t.status!=='fulfilled')return;const el=$('visits');
  el.textContent='👀 방문자 '+fmt(t.value.count)+(d.status==='fulfilled'?' · 오늘 '+fmt(d.value.count):'');el.hidden=false})})();
