const ST=['관심','지원함','서류합격','탈락','패스'],KEY='jobboard-status';let saved=JSON.parse(localStorage.getItem(KEY)||'{}'),jobs=[];
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>{const k=new Date(Date.now()+9*36e5);return Date.UTC(k.getUTCFullYear(),k.getUTCMonth(),k.getUTCDate())};
function dday(s){const m=String(s||'').match(/(\d{4})-(\d{2})-(\d{2})/);if(!m)return null;return Math.round((Date.UTC(+m[1],m[2]-1,+m[3])-today())/864e5)}
function norm(j,i){const dl=j.deadline_now||j.deadline||'';const region=j.region||j.location||'';const exp=j.exp_tier||j.experience||j.exp_original||'';
 const d=dday(dl);return{...j,_id:j.job_id||j.url||('i'+i),_dl:dl,_d:d,_region:region,_r1:(region.match(/^[가-힣]+/)||['미기재'])[0],_exp:exp||'미기재',
 _new:!!(j.new_today||j.new||j.new_since_1013),_ai:!!(j.ai_integration||/AI연동/.test(JSON.stringify(j.tags||j.tag||''))),_closed:(j.status&&j.status!=='open')||(d!==null&&d<0),_desc:j['한줄설명']||j.desc||''}}
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
  &&(!ms||(ms==='none'?!saved[j._id]:saved[j._id]===ms))&&(!q||[j.company,j.title,j.role,j.stack,j._region,j._desc].join(' ').toLowerCase().includes(q)))
 .sort((a,b)=>(a._closed-b._closed)||((go[a.grade]??3)-(go[b.grade]??3))||((a._d??1e4)-(b._d??1e4)));
 $('list').innerHTML=L.length?L.map(card).join(''):'<p>조건에 맞는 공고가 없어요.</p>'}
function card(j){const d=j._d;let db=d===null?esc(j._dl||'기한 미기재'):d<0?'마감':d===0?'오늘 마감':d===1?'내일 마감':'D-'+d;
 const f=[['출처',j.source],['지역',j._region],['경력',j._exp],['스택',j.stack],['마감',j._dl],['추천 이유',j.reason],['주의',j.caution]];
 return `<div class="card${j._closed?' closed':''}"><div class="top"><span class="b g-${esc(j.grade)}">${esc(j.grade)}</span><span class="b ${d!==null&&d>=0&&d<=1?'urgent':'dd'}">${db}</span>${j._new?'<span class="b new">📌 신규</span>':''}${j._ai?'<span class="b ai">🤖 AI연동</span>':''}</div>
 <div class="co">${esc(j.company)}</div><div class="ti"><a href="${esc(j.url||j.url_official)}" target="_blank" rel="noopener">${esc(j.title||j.role)} ↗</a></div>
 <dl>${f.map(([k,v])=>`<dt>${k}</dt><dd>${esc(v||'미기재')}</dd>`).join('')}</dl><div class="desc">${esc(j._desc)}</div>
 <div class="st">${ST.map(s=>`<button class="${saved[j._id]===s?'on':''}" onclick="setS('${esc(j._id).replace(/'/g,'')}','${s}')">${s}</button>`).join('')}</div></div>`}
function setS(id,s){if(saved[id]===s)delete saved[id];else saved[id]=s;localStorage.setItem(KEY,JSON.stringify(saved));render()}
