const SUPABASE_URL="https://mukrnyijszcczcrqhwbi.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_hycbEGUSj8XYQuaCKAlAcQ_IdIFqQT3";
const OWNER_EMAIL="mengofla773@gmail.com";
const WHATSAPP="5524998837827";

const WEEKLY_SCHEDULE={
  1:[["08:00","12:00"],["15:40","19:30"]],
  2:[["08:00","12:00"],["15:40","20:00"]],
  3:[["08:00","12:00"],["15:40","20:00"]],
  4:[["07:30","12:00"],["15:40","20:00"]],
  5:[["07:00","12:00"],["15:40","20:00"]],
  6:[["07:30","12:00"],["15:00","19:00"]]
};
let sb=null;
const $=id=>document.getElementById(id);
function setup(){if(!window.supabase)throw Error("Biblioteca do Supabase não carregou.");if(SUPABASE_URL.startsWith("COLE_AQUI")||SUPABASE_ANON_KEY.startsWith("COLE_AQUI"))throw Error("Configure SUPABASE_URL e SUPABASE_ANON_KEY no app.js.");if(!sb)sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);return sb}
function day(d){return new Date(d+"T12:00:00").getDay()}
function min(t){let[a,b]=t.split(":").map(Number);return a*60+b}
function fmt(n){return String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0")}
function times(d){let r=[];(WEEKLY_SCHEDULE[day(d)]||[]).forEach(([a,b])=>{for(let n=min(a);n<=min(b);n+=30)r.push(fmt(n))});return r}
function sunday(d){return day(d)===0}
async function availability(){
 const date=$("appointmentDate");if(!date||!date.value)return;
 const msg=$("bookingMessage"), sel=$("appointmentTime");
 if(sunday(date.value)){$("sundayNotice").classList.remove("hidden");$("timeContainer").classList.add("hidden");sel.required=false;$("whatsappButton").href=`https://wa.me/${WHATSAPP}`;return}
 $("sundayNotice").classList.add("hidden");$("timeContainer").classList.remove("hidden");sel.required=true;
 try{const {data,error}=await setup().from("appointments").select("appointment_time").eq("appointment_date",date.value).eq("status","confirmado");if(error)throw error;const used=new Set((data||[]).map(x=>String(x.appointment_time).slice(0,5)));sel.innerHTML='<option value="">Selecione</option>';times(date.value).filter(t=>!used.has(t)).forEach(t=>{let o=document.createElement("option");o.value=t;o.textContent=t;sel.appendChild(o)});if(sel.options.length===1)sel.innerHTML='<option value="">Não há horários disponíveis</option>'}catch(e){msg.textContent=e.message}
}
async function book(e){e.preventDefault();let msg=$("bookingMessage");try{let date=$("appointmentDate").value,t=$("appointmentTime").value;if(sunday(date)){msg.textContent="Domingo é somente mediante pagamento antecipado. Fale pelo WhatsApp.";return}if(!times(date).includes(t))throw Error("Esse horário não pertence ao expediente do dia escolhido.");let phone=$("whatsapp").value.replace(/\D/g,"");if(phone.length<8)throw Error("Informe um WhatsApp válido.");let p={customer_name:$("customerName").value.trim(),whatsapp:phone,email:$("customerEmail").value.trim()||null,service:$("service").value,appointment_date:date,appointment_time:t,status:"confirmado"};let {error}=await setup().from("appointments").insert(p);if(error){if(error.code==="23505")throw Error("Esse horário acabou de ser reservado. Escolha outro.");throw error}msg.textContent="Agendamento realizado com sucesso!";$("bookingForm").reset();$("appointmentTime").innerHTML='<option value="">Escolha uma data primeiro</option>'}catch(e){msg.textContent=e.message}}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
async function login(e){e.preventDefault();try{let email=$("loginEmail").value.trim();if(email.toLowerCase()!==OWNER_EMAIL.toLowerCase())throw Error("Este painel é reservado ao dono.");let {error}=await setup().auth.signInWithPassword({email,password:$("loginPassword").value});if(error)throw error;$("loginSection").classList.add("hidden");$("panelSection").classList.remove("hidden");load()}catch(e){$("loginMessage").textContent=e.message}}
async function load(){try{let s=await setup().auth.getSession();if(s.data.session?.user?.email?.toLowerCase()!==OWNER_EMAIL.toLowerCase())return;let {data,error}=await setup().from("appointments").select("*").order("appointment_date").order("appointment_time");if(error)throw error;$("appointmentsList").innerHTML=data?.length?data.map(x=>`<article class="appointment"><div><b>${esc(x.customer_name)}</b><div>${x.service==="masculino"?"Masculino":"Feminino"} · ${x.appointment_date} · ${String(x.appointment_time).slice(0,5)}</div><div>📱 <a href="https://wa.me/${esc(x.whatsapp)}" target="_blank">${esc(x.whatsapp)}</a></div><div>Status: ${esc(x.status)}</div></div>${x.status==="confirmado"?`<button class="btn danger" data-c="${x.id}">Cancelar</button>`:""}</article>`).join(""):"<p>Nenhum agendamento.</p>";document.querySelectorAll("[data-c]").forEach(b=>b.onclick=async()=>{await setup().from("appointments").update({status:"cancelado"}).eq("id",b.dataset.c);load()})}catch(e){$("appointmentsList").textContent=e.message}}
document.addEventListener("DOMContentLoaded",()=>{if($("appointmentDate")){$("appointmentDate").min=new Date().toISOString().slice(0,10);$("appointmentDate").onchange=availability;$("bookingForm").onsubmit=book}if($("loginForm")){$("loginForm").onsubmit=login;$("logoutButton").onclick=async()=>{await setup().auth.signOut();location.reload()}}});
