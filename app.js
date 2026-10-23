const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
$('#year').textContent = new Date().getFullYear();
const menu = $('.menu-toggle');
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); $('#nav-links').classList.remove('open'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); $('#nav-links').classList.toggle('open', open); });
$$('#nav-links a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });
$('#hero-confirm').addEventListener('click', () => { $('#hero-confirm').hidden = true; const confirmation = $('#hero-confirmation'); confirmation.hidden = false; confirmation.focus({preventScroll: true}); });
const dialog = $('#demo-dialog');
$$('[data-demo]').forEach(button => button.addEventListener('click', () => { closeMenu(); dialog.showModal(); }));
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { const box = dialog.getBoundingClientRect(); if(e.target === dialog && (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom)) dialog.close(); });
let requestText = '';
$('#demo-form').addEventListener('submit', event => {
  event.preventDefault();
  const values = new FormData(event.currentTarget);
  const name = String(values.get('name')).trim();
  const email = String(values.get('email')).trim();
  const hospital = String(values.get('hospital')).trim();
  if(!name || !hospital) { (!name ? $('[name=name]') : $('[name=hospital]')).focus(); return; }
  requestText = `Hello Docgram team,\n\nI'd like to arrange a demo for ${hospital}.\n\nName: ${name}\nWork email: ${email}\nHospital / clinic: ${hospital}\nInterested in: ${values.get('interest')}\n\nPlease let me know a convenient time to connect.\n\nThank you,\n${name}`;
  window.location.href = `mailto:support@docgram.app?subject=${encodeURIComponent('Docgram demo request — ' + hospital)}&body=${encodeURIComponent(requestText)}`;
  $('#email-fallback').hidden = false;
  $('.copy-status').textContent = '';
});
$('#copy-request').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(requestText); $('.copy-status').textContent = 'Copied. Paste it into your email to support@docgram.app.'; }
  catch { const area = document.createElement('textarea'); area.value = requestText; area.readOnly = true; area.style.width = '100%'; area.style.height = '170px'; $('#email-fallback').append(area); area.select(); $('.copy-status').textContent = 'Select and copy the request above.'; }
});
$$('.ai-accordion details').forEach(details => details.addEventListener('toggle', () => { if(details.open) $$('.ai-accordion details').forEach(other => { if(other !== details) other.open = false; }); }));
const conversations = {
  appointments: `<div class="conversation-date">TODAY</div><div class="bubble patient">Hi, I'd like to book an appointment.<span class="bubble-time">9:41 ✓✓</span></div><div class="bubble">Hi Priya 👋 Of course. Let's make that easy.<br>Here's an available appointment:<div class="appointment-details"><strong>General consultation</strong><br>Tomorrow · 10:30 AM<br>Your hospital · OPD</div><span class="bubble-time">9:41</span><div class="chat-actions"><button class="chat-action primary" data-chat="confirm">✓ Confirm appointment</button><button class="chat-action" data-chat="reschedule">Choose another time</button></div></div>`,
  support: `<div class="conversation-date">TODAY</div><div class="bubble patient">I have a question about my visit.<span class="bubble-time">9:41 ✓✓</span></div><div class="bubble">Hi Priya! I'm here to help, any time. What would you like to know?<span class="bubble-time">9:41</span><div class="chat-actions"><button class="chat-action primary" data-chat="visit">What should I bring?</button><button class="chat-action" data-chat="human">Talk to the care team</button></div></div>`,
  reports: `<div class="conversation-date">TODAY</div><div class="bubble">Hi Priya 👋 Your sample health report is ready.<div class="sample-report"><svg><use href="#i-file"/></svg><span>Sample health report<small>Illustrative document · No patient data</small></span></div><span class="bubble-time">9:41</span><div class="chat-actions"><button class="chat-action primary" data-chat="report">View sample report</button><button class="chat-action" data-chat="followup">Arrange a follow-up</button></div></div>`
};
const responses = {
 confirm: {patient: 'Confirm appointment, please.', text: `You're all set, Priya! ✓<br><strong>Tomorrow · 10:30 AM</strong><br>We'll send you a reminder before your visit. Take care!`, actions: [['restart','Explore again']]},
 reschedule: {patient: 'Could I choose another time?', text: 'Absolutely. Here are two other sample slots:', actions: [['morning','Tomorrow · 11:30 AM'],['afternoon','Tomorrow · 3:00 PM']]},
 morning: {patient:'11:30 AM works for me.',text:'Confirmed! ✓<br><strong>Tomorrow · 11:30 AM</strong><br>Your appointment has been updated. See you then.',actions:[['restart','Explore again']]},
 afternoon: {patient:'3:00 PM, please.',text:'Confirmed! ✓<br><strong>Tomorrow · 3:00 PM</strong><br>Your appointment has been updated. See you then.',actions:[['restart','Explore again']]},
 visit: {patient:'What should I bring?',text:'Please bring a photo ID, any previous reports, and a list of your current medications. Your hospital team can confirm any visit-specific requirements.',actions:[['human','Talk to the care team'],['restart','Explore again']]},
 human: {patient:"I'd like to speak with someone.",text:'Of course. In a live hospital conversation, your care team would take over here, with the conversation context ready.<br><br><strong>This is an illustrative preview.</strong>',actions:[['restart','Explore again']]},
 report: {patient:'Show me the sample report.',text:'<strong>Sample report preview</strong><br>Document: General health report<br>Status: Ready for clinician review<br><br>No real patient information or medical results are shown in this demonstration.',actions:[['followup','Arrange a follow-up'],['restart','Explore again']]},
 followup: {patient:"I'd like a follow-up appointment.",text:'We can help with that. Your care team can guide you to the appropriate follow-up.<br><br>Would you like to explore the appointment journey?',actions:[['appointments','Explore appointments']]}
};
let activeJourney = 'appointments';
const content = $('#conversation-content');
function renderJourney(key, {focusAction = false} = {}) {
  const restoreFocus = focusAction || content.contains(document.activeElement);
  activeJourney = key;
  $$('.journey-tab').forEach(tab => { const selected = tab.dataset.journey === key; tab.classList.toggle('active', selected); tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; });
  $('#journey-panel').setAttribute('aria-labelledby', `tab-${key}`);
  content.innerHTML = conversations[key];
  $('#journey-panel').scrollTop = 0;
  if(restoreFocus) $('.chat-action', content)?.focus({preventScroll: true});
}
$$('.journey-tab').forEach(tab => {
  tab.addEventListener('click', () => renderJourney(tab.dataset.journey));
  tab.addEventListener('keydown', e => { const tabs = $$('.journey-tab'); const index = tabs.indexOf(tab); let next; if(['ArrowDown','ArrowRight'].includes(e.key)) next = (index+1)%tabs.length; if(['ArrowUp','ArrowLeft'].includes(e.key)) next=(index+tabs.length-1)%tabs.length; if(e.key==='Home') next=0; if(e.key==='End') next=tabs.length-1; if(next!==undefined){ e.preventDefault(); tabs[next].focus(); renderJourney(tabs[next].dataset.journey); } });
});
content.addEventListener('click', e => {
  const button = e.target.closest('[data-chat]'); if(!button) return;
  const key = button.dataset.chat;
  if(key==='restart') return renderJourney(activeJourney, {focusAction: true});
  if(key==='appointments') return renderJourney('appointments', {focusAction: true});
  const response = responses[key]; if(!response) return;
  $$('.chat-action',content).forEach(action => action.disabled=true);
  const patient = document.createElement('div'); patient.className='bubble patient'; patient.textContent=response.patient;
  const reply = document.createElement('div'); reply.className='bubble'; reply.tabIndex=-1; reply.innerHTML=response.text + '<span class="bubble-time">9:42</span>';
  if(response.actions){ const actions=document.createElement('div'); actions.className='chat-actions'; response.actions.forEach(([action,label])=>{ const next=document.createElement('button');next.className='chat-action';next.dataset.chat=action;next.textContent=label;actions.append(next); });reply.append(actions); }
  content.append(patient,reply); reply.focus({preventScroll: true}); reply.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
});
renderJourney('appointments');
