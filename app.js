const ST=['관심','지원함','서류합격','탈락','패스'],KEY='jobboard-status';let saved=JSON.parse(localStorage.getItem(KEY)||'{}'),jobs=[];
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>{const k=new Date(Date.now()+9*36e5);return Date.UTC(k.getUTCFullYear(),k.getUTCMonth(),k.getUTCDate())};
function dday(s){const m=String(s||'').match(/(\d{4})-(\d{2})-(\d{2})/);if(!m)return null;return Math.round((Date.UTC(+m[1],m[2]-1,+m[3])-today())/864e5)}
const MISS=/^(미기재|없음|-|n\/a|null|undefined)?$/i;
const pick=(j,...ks)=>{for(const k of ks){let v=j[k];if(Array.isArray(v))v=v.join(', ');if(v&&typeof v==='object')v=v.name||v.value||'';v=String(v??'').trim();if(!MISS.test(v))return v}return ''};
const HOST={'saramin':'사람인','wanted':'원티드','jumpit':'점핏','jobkorea':'잡코리아','linkareer':'링커리어','incruit':'인크루트','rocketpunch':'로켓펀치','programmers':'프로그래머스','catch':'캐치','recruiter.co.kr':'공식 채용','greetinghr':'공식 채용(그리팅)','ninehire':'공식 채용(나인하이어)'};
function srcFromUrl(u){try{const h=new URL(u).hostname;for(const k in HOST)if(h.includes(k))return HOST[k]+' (링크 기준)';return h.replace(/^www\./,'')}catch(e){return ''}}
function norm(j,i){const dl=j.deadline_now||j.deadline||'';const region=pick(j,'region','location','지역','loc','area','address');const exp=pick(j,'exp_tier','experience','경력','exp_original','exp_raw','exp_text','career');
 const d=dday(dl);return{...j,_id:j.job_id||j.url||('i'+i),_dl:dl,_d:d,_region:region,_r1:(region.match(/^[가-힣]+/)||['미기재'])[0],_exp:exp||'미기재',
 _new:!!(j.new_today||j.new||j.new_since_1013),_ai:!!(j.ai_integration||/AI연동/.test(JSON.stringify(j.tags||j.tag||''))),_closed:(j.status&&j.status!=='open')||(d!==null&&d<0),_desc:pick(j,'한줄설명','desc','description','설명'),
 _src:pick(j,'source','site','출처','platform')||srcFromUrl(j.url),_stack:pick(j,'stack','tech','skills','기술스택','스택','tags'),
 _reason:[pick(j,'reason','추천이유','추천 이유','why'),pick(j,'reason2')].filter(Boolean).join(' / '),_caution:pick(j,'caution','주의점','주의','note','notes','change'),
 _expOrig:pick(j,'exp_original','exp_raw','exp_text','experience','career'),_sal:pick(j,'salary','연봉'),_url:pick(j,'url','link','url_official','alt_url','alt')}}
fetch('data/jobs.json?'+Date.now()).then(r=>r.json()).then(d=>{
 const items=Array.isArray(d)?d:d.items;jobs=items.map(norm);
 $('updated').textContent='마지막 업데이트: '+(d.as_of?new Date(d.as_of).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})+' (KST)':'알 수 없음');
 const g=k=>jobs.filter(j=>j.grade===k).length;$('counts').textContent=`총 ${jobs.length}건 · S${g('S')} / A${g('A')} / B${g('B')} · 🤖 ${jobs.filter(j=>j._ai).length}`;
 [...new Set(jobs.map(j=>j._r1))].sort().forEach(r=>$('region').add(new Option(r,r)));
 [...new Set(jobs.map(j=>j._exp))].sort().forEach(r=>$('exp').add(new Option(r,r)));ST.forEach(s=>$('mystat').add(new Option(s,s)));render()})
 .catch(e=>$('list').textContent='데이터를 불러오지 못했어요: '+e);
['q','grade','region','exp','mystat','ai','hideClosed'].forEach(id=>$(id).addEventListener('input',render));
const go={S:0,A:1,B:2};
function render(){const q=$('q').value.trim().toLowerCase(),gr=$('grade').value,rg=$('region').value,ex=$('exp').value,ms=$('mystat').value;
 const L=jobs.filter(j=>(!gr||j.grade===gr)&&(!rg||j._r1===rg)&&(!ex||j._exp===ex)&&(!$('ai').checked||j._ai)&&(!$('hideClosed').checked||!j._closed)
  &&(!ms||(ms==='none'?!saved[j._id]:saved[j._id]===ms))&&(!q||[j.company,j.title,j.role,j._stack,j._src,j._region,j._desc].join(' ').toLowerCase().includes(q)))
 .sort((a,b)=>(a._closed-b._closed)||((go[a.grade]??3)-(go[b.grade]??3))||((a._d??1e4)-(b._d??1e4)));
 $('list').innerHTML=L.length?L.map(card).join(''):'<p>조건에 맞는 공고가 없어요.</p>'}
const ICON={'관심':'⭐','지원함':'📨','서류합격':'✅','탈락':'❌','패스':'⏭️'};
let view=new URLSearchParams(location.search).get('view')||localStorage.getItem('jobboard-view')||'full';const open=new Set();
function setView(v){view=v;localStorage.setItem('jobboard-view',v);$('v-full').classList.toggle('on',v==='full');$('v-compact').classList.toggle('on',v==='compact');['v-full','v-compact'].forEach(x=>$(x).setAttribute('aria-pressed',$(x).classList.contains('on')));render()}
document.addEventListener('click',e=>{const b=e.target.closest('#v-full,#v-compact');if(b)setView(b.id==='v-compact'?'compact':'full')});setView(view);
function tog(id){open.has(id)?open.delete(id):open.add(id);render()}
function dlabel(j){const d=j._d;return d===null?esc(j._dl||'미기재'):d<0?'마감':d===0?'오늘':d===1?'내일':'D-'+d}
function card(j){if(view==='compact'&&!open.has(j._id))return row(j);return full(j)}
function row(j){const d=j._d,id=esc(j._id).replace(/'/g,'');
 return `<div class="rowc${j._closed?' closed':''}" onclick="tog('${id}')"><span class="b g-${esc(j.grade)}">${esc(j.grade)}</span><span class="b ${d!==null&&d>=0&&d<=1?'urgent':'dd'}">${dlabel(j)}</span>
 <div class="rm"><div class="rt"><b>${esc(j.company)}</b> ${j._ai?'🤖':''}${j._new?'📌':''}${saved[j._id]?' '+ICON[saved[j._id]]:''}</div><div class="rp">${esc(j.title||j.role)}</div><div class="rs">${[j._region,j._exp==='미기재'?'':j._exp].filter(Boolean).map(esc).join(' · ')}</div></div>
 <a class="rl" href="${esc(j._url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">↗</a></div>`}
function full(j){const d=j._d;let db=d===null?esc(j._dl||'기한 미기재'):d<0?'마감':d===0?'오늘 마감':d===1?'내일 마감':'D-'+d;
 const f=[['출처',j._src],['지역',j._region],['경력',j._exp+(j._expOrig&&j._expOrig!==j._exp?' ('+j._expOrig+')':'')],['스택',j._stack],['연봉',j._sal],['마감',j._dl],['추천 이유',j._reason],['주의',j._caution]].filter(([k,v])=>v&&!MISS.test(v));
 return `<div class="card${j._closed?' closed':''}"><div class="top"><span class="b g-${esc(j.grade)}">${esc(j.grade)}</span><span class="b ${d!==null&&d>=0&&d<=1?'urgent':'dd'}">${db}</span>${j._new?'<span class="b new">📌 신규</span>':''}${j._ai?'<span class="b ai">🤖 AI연동</span>':''}</div>
 ${view==='compact'?`<button class="fold" onclick="tog('${esc(j._id).replace(/'/g,'')}')">접기 ▲</button>`:''}<div class="co">${esc(j.company)}</div><div class="ti"><a href="${esc(j._url)}" target="_blank" rel="noopener">${esc(j.title||j.role)} ↗</a></div>
 <dl>${f.map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl><div class="desc">${esc(j._desc)}</div>
 <div class="st">${ST.map(s=>`<button class="${saved[j._id]===s?'on':''}" onclick="setS('${esc(j._id).replace(/'/g,'')}','${s}')">${s}</button>`).join('')}</div></div>`}
function setS(id,s){if(saved[id]===s)delete saved[id];else saved[id]=s;localStorage.setItem(KEY,JSON.stringify(saved));render()}
