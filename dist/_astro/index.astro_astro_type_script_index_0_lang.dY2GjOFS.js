import{n as e}from"./echarts.CwWPt9Op.js";var t=[{call:`XHTGU-FM`,name:`Radio Chiapas`,band:`FM`,freqLabel:`93.9 MHz`,municipio:`Tuxtla Gutierrez`,lat:16.7729,lon:-93.1281,powerKW:null},{call:`XERA-AM`,name:`Radio Uno`,band:`AM`,freqLabel:`760 kHz`,municipio:`San Cristobal de las Casas`,lat:16.737,lon:-92.6376,powerKW:null},{call:`XEPLE-AM`,name:`Radio Palenque`,band:`AM`,freqLabel:`1040 kHz`,municipio:`Palenque`,lat:17.5091,lon:-91.9822,powerKW:5},{call:`XEOCH-AM`,name:`Kin Radio`,band:`AM`,freqLabel:`600 kHz`,municipio:`Ocosingo`,lat:16.9078,lon:-92.093,powerKW:10},{call:`XHTCH-FM`,name:`Oceano FM`,band:`FM`,freqLabel:`102.7 MHz`,municipio:`Tapachula`,lat:14.9036,lon:-92.2724,powerKW:null},{call:`XHNAL-FM`,name:`Digital 89`,band:`FM`,freqLabel:`89.5 MHz`,municipio:`Tonala`,lat:16.0814,lon:-93.7502,powerKW:null},{call:`XETEC-AM`,name:`Radio Tecpatan`,band:`AM`,freqLabel:`1140 kHz`,municipio:`Tecpatan`,lat:17.1361,lon:-93.3111,powerKW:null},{call:`XHSDM-FM`,name:`La Voz de la Selva`,band:`FM`,freqLabel:`95.7 MHz`,municipio:`Sto. Domingo, Ocosingo`,lat:16.9,lon:-91.85,powerKW:1},{call:`XHCTN-FM`,name:`Brisas de Montebello`,band:`FM`,freqLabel:`89.9 MHz`,municipio:`La Trinitaria`,lat:16.1167,lon:-92.05,powerKW:2.5},{call:`XHPIC-FM`,name:`Frecuencia V Norte`,band:`FM`,freqLabel:`102.1 MHz`,municipio:`Pichucalco`,lat:17.51,lon:-93.116,powerKW:null},{call:`XHSIL-FM`,name:`Radio Siltepec`,band:`FM`,freqLabel:`99.9 MHz`,municipio:`Siltepec`,lat:15.5572,lon:-92.3229,powerKW:null}],n={stl:{name:`Enlace estudio–transmisor (STL)`,sub:`Recibe la señal de audio desde la cabina`,critical:!1},processor:{name:`Procesador de audio`,sub:`Normaliza y prepara el audio antes de modular`,critical:!1},exciter:{name:`Excitador`,sub:`Genera la señal de RF de baja potencia`,critical:!0},amplifier:{name:`Amplificador de potencia`,sub:`Eleva la señal a la potencia de transmisión`,critical:!0},antenna:{name:`Sistema de antena / combinador`,sub:`Radía la señal final al aire`,critical:!0},backup:{name:`Respaldo de energía (UPS / planta)`,sub:`Entra en caso de falla de suministro`,critical:!1}},r=[`stl`,`processor`,`exciter`,`amplifier`,`antenna`,`backup`];function i(e,t){return Math.random()*(t-e)+e}function a(e,t=20){return Array.from({length:t},()=>e+i(-e*.03,e*.03))}var o=t.map((e,t)=>{let n=e.powerKW?Math.min(100,e.powerKW*8+i(-3,3)):i(70,98),o=i(1,1.6),s=i(28,46),c={};return r.forEach(e=>{c[e]={installed:!1,on:!1}}),{id:t,name:`${e.name} (${e.call})`,shortName:e.name,call:e.call,band:e.band,municipio:e.municipio,freq:e.freqLabel,lat:e.lat,lon:e.lon,power:n,powerKW:e.powerKW,vswr:o,temp:s,uptime:Math.floor(i(30,900)),waveform:Array.from({length:16},()=>i(20,100)),history:{power:a(n),vswr:a(o),temp:a(s)},logs:[],thresholds:{powerMin:72,vswrMax:1.5,tempMax:42},phaseA:!0,phaseB:!0,config:{phaseMonitoring:2},equipment:c,_lastStatus:null}});function s(e){let t=e.equipment,r=e.config.phaseMonitoring,i=e.thresholds,a=`ok`,o=i.vswrMax+.3,s=i.tempMax+8;if(e.vswr>o||e.temp>s?a=`crit`:(e.vswr>i.vswrMax||e.temp>i.tempMax||e.power<i.powerMin)&&(a=`warn`),r>0){let t=e.phaseA,n=r!==2||e.phaseB;if(!t&&!n)return`crit`;if(!t||!n)return a===`crit`?`crit`:`warn`}let c=!1,l=!1;for(let[e,r]of Object.entries(t))r.installed&&(r.on||(n[e].critical?c=!0:l=!0));return c?`crit`:l?a===`crit`?`crit`:`warn`:a}function c(e){document.documentElement.setAttribute(`data-theme`,e),document.querySelectorAll(`.theme-btn`).forEach(t=>{t.setAttribute(`aria-pressed`,String(t.dataset.themeBtn===e))})}function l(){document.querySelectorAll(`.theme-btn`).forEach(e=>{e.addEventListener(`click`,()=>c(e.dataset.themeBtn))})}var u={scale:1,x:0,y:0},d={coverage:!0,heatmap:!1,labels:!0,clusters:!1};function f(e,t){let n=17.9738,r=-94.157;return{x:40+(t-r)/(-90.3932-r)*400,y:50+(n-e)/(n-14.5347)*380}}function p(){u.scale=Math.min(6,Math.max(.5,u.scale));let e=u.scale>1?(u.scale-1)*480*.15:0,t=u.scale>1?(u.scale-1)*480*.15:0,n=-(u.scale-1)*480-e,r=e,i=-(u.scale-1)*480-t,a=t;u.x=Math.min(r,Math.max(n,u.x)),u.y=Math.min(a,Math.max(i,u.y))}function m(){let e=document.getElementById(`map-zoom-group`);e&&e.setAttribute(`transform`,`translate(${u.x},${u.y}) scale(${u.scale})`)}function h(e,t){let n=document.getElementById(`geo-svg`).getBoundingClientRect(),r=(e-n.left)/n.width*480,i=(t-n.top)/n.height*480;return{x:(r-u.x)/u.scale,y:(i-u.y)/u.scale}}function g(){let e=document.getElementById(`layer-points`),t=document.getElementById(`layer-heatmap`),n=document.getElementById(`layer-coverage`),r=document.getElementById(`layer-clusters`),i=o.map(e=>{let t=f(e.lat,e.lon),n=s(e),r=n===`crit`?`var(--red)`:n===`warn`?`var(--amber)`:`var(--phosphor)`;return{...t,tx:e,s:n,color:r}}),a=i.map((e,t)=>{let n=t%2==0,r=n?-12:16,i=n?-8:8,a=d.labels&&u.scale>=1.2;return`
      <g class="geo-point" data-id="${e.tx.id}" style="cursor:pointer;">
        <line x1="0" y1="0" x2="0" y2="${i}" stroke="var(--panel-line)" stroke-width="0.8"></line>
        <circle cx="0" cy="0" r="6" fill="${e.color}" stroke="var(--dot-border)" stroke-width="1.5" filter="url(#glow)"></circle>
        ${a?`<text x="0" y="${r}" text-anchor="middle" font-family="var(--mono)" font-size="8" fill="var(--map-label)" style="user-select:none;">${e.tx.call}</text>`:``}
        <title>${e.tx.shortName} · ${e.tx.freq} · ${e.tx.municipio} · ${e.s.toUpperCase()}</title>
      </g>
    `}).join(``),c=``;if(d.coverage){let e=20+15/u.scale;c=i.map(t=>`
      <circle cx="${t.x}" cy="${t.y}" r="${e}" fill="none" stroke="${t.color}" stroke-width="0.8" opacity="0.3" stroke-dasharray="4,4"></circle>
    `).join(``)}let l=``;d.heatmap&&(l=i.map(e=>{let t=e.s===`crit`?3:e.s===`warn`?2:1;return`<circle cx="${e.x}" cy="${e.y}" r="35" fill="url(#heat-grad)" opacity="${.2*t}" filter="url(#glow)"></circle>`}).join(``));let p=``;if(d.clusters&&u.scale<1.5){let e=30/u.scale,t=new Set,n=[];for(let r=0;r<i.length;r++){if(t.has(r))continue;let a=[r];for(let n=r+1;n<i.length;n++){if(t.has(n))continue;let o=i[r].x-i[n].x,s=i[r].y-i[n].y;Math.sqrt(o*o+s*s)<e&&(a.push(n),t.add(n))}if(a.length>1){t.add(r);let e=a.reduce((e,t)=>e+i[t].x,0)/a.length,o=a.reduce((e,t)=>e+i[t].y,0)/a.length,s=a.map(e=>i[e].s),c=s.includes(`crit`),l=s.includes(`warn`),u=c?`var(--red)`:l?`var(--amber)`:`var(--phosphor)`,d=a.length;n.push({x:e,y:o,count:d,color:u,ids:a.map(e=>i[e].tx.id)})}}p=n.map(e=>`
      <g class="geo-cluster" style="cursor:pointer;" onclick="openDetail(${e.ids[0]})">
        <circle cx="${e.x}" cy="${e.y}" r="${8+e.count*1.5}" fill="${e.color}" opacity="0.25" stroke="${e.color}" stroke-width="2"></circle>
        <circle cx="${e.x}" cy="${e.y}" r="${5+e.count}" fill="${e.color}" opacity="0.15"></circle>
        <text x="${e.x}" y="${e.y+3}" text-anchor="middle" font-family="var(--mono)" font-size="${9+e.count}" fill="var(--text)" font-weight="700">${e.count}</text>
      </g>
    `).join(``)}e.innerHTML=a,n.innerHTML=c,t.innerHTML=l,r.innerHTML=p,e.querySelectorAll(`.geo-point`).forEach((e,t)=>{let n=o[t],r=f(n.lat,n.lon);e.setAttribute(`transform`,`translate(${r.x},${r.y})`)}),t.style.display=d.heatmap?`block`:`none`,n.style.display=d.coverage?`block`:`none`,r.style.display=d.clusters&&u.scale<1.5?`block`:`none`,m()}var _=[];function v(e,t,n){let r=o[e],i=new Date,a={id:_.length,txId:e,txName:r.shortName,status:t,message:n,time:i,timeStr:i.toLocaleTimeString(`es-MX`,{hour:`2-digit`,minute:`2-digit`,second:`2-digit`})};_.unshift(a),_.length>100&&_.pop(),y(),b()}function y(){let e=document.getElementById(`sidebar-events`),t=document.getElementById(`sidebar-event-count`);if(!(!e||!t)){if(t.textContent=`${_.length} eventos`,_.length===0){e.innerHTML=`
      <div style="text-align:center; color:var(--text-dim); font-family:var(--mono); font-size:10px; padding:16px 0;">
        Esperando eventos...
      </div>`;return}e.innerHTML=_.slice(0,10).map(e=>`
    <div class="sidebar-event" style="cursor:pointer;" onclick="openDetail(${e.txId})">
      <span class="ev-time">${e.timeStr}</span>
      <span class="ev-dot ${e.status}"></span>
      <span class="ev-msg">
        <span class="${e.status}">${e.txName}</span>
        ${e.message}
      </span>
    </div>
  `).join(``),e.scrollTop=0}}function b(){let e=0,t=0,n=0;o.forEach(r=>{let i=s(r);i===`ok`?e++:i===`warn`?t++:n++});let r=document.getElementById(`sidebar-ok`),i=document.getElementById(`sidebar-warn`),a=document.getElementById(`sidebar-crit`),c=document.getElementById(`sidebar-total`),l=document.getElementById(`sidebar-last`);r&&(r.textContent=e),i&&(i.textContent=t),a&&(a.textContent=n),c&&(c.textContent=o.length),_.length>0&&l&&(l.textContent=_[0].timeStr),window.updateBarsChart&&window.updateBarsChart()}function x(e,t){return`
    <div>
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
        <span style="font-family:var(--mono); font-size:10px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.05em;">${t}</span>
        <span id="${e}-value" style="font-family:var(--mono); font-size:12px; font-weight:600;">—</span>
      </div>
      <div id="${e}" class="echarts-svg-wrapper" style="width:100%; height:70px; border-radius:6px; overflow:hidden;"></div>
    </div>
  `}function S(t){let n=document.getElementById(t);return n?e(n,null,{renderer:`svg`}):null}function C(e,t,n,r,i,a){if(!e)return;let o=n&&n.length?n[n.length-1]:0,s=document.getElementById(`${t}-value`);s&&(s.textContent=typeof a==`function`?a(o):String(o),s.style.color=i),e.setOption({grid:{left:0,right:0,top:10,bottom:0},xAxis:{type:`category`,boundaryGap:!1,show:!1},yAxis:{type:`value`,show:!1,min:e=>Math.min(e.min,r)*.95,max:e=>Math.max(e.max,r)*1.05},series:[{data:n,type:`line`,smooth:!0,symbol:`circle`,showSymbol:!1,animationDuration:400,lineStyle:{color:i,width:2,cap:`round`},areaStyle:{color:{type:`linear`,x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:i},{offset:1,color:`transparent`}]},opacity:.15},markLine:{symbol:`none`,silent:!0,lineStyle:{color:`var(--panel-line, #e5e7eb)`,width:1,type:`dashed`},data:[{yAxis:r}]}}]})}function w(e){e&&!e.isDisposed()&&e.dispose()}var T={};function E(e){let t=document.createElement(`div`);return t.id=`card-${e.id}`,t.className=`card`,t.tabIndex=0,t.innerHTML=`
    <div class="card-top">
      <div>
        <p class="tx-name">${e.shortName}</p>
        <p class="tx-freq">${e.freq} · ${e.band} · ${e.municipio}</p>
      </div>
      <div class="dot" id="dot-${e.id}"></div>
    </div>
    <div class="meter-row"><span>Potencia</span><span id="power-val-${e.id}">—</span></div>
    <div class="meter-track"><div class="meter-fill" id="meter-${e.id}" style="width:0%;"></div></div>

    <div class="card-graph-container" style="margin: 10px 0;">
      ${x(`card-chart-${e.id}`,`Historial Potencia`)}
    </div>

    <p class="card-status-text" id="status-text-${e.id}"></p>
  `,t.addEventListener(`click`,()=>U(e.id)),t}function D(e,t){let n={ok:`#22c55e`,warn:`#eab308`,crit:`#ef4444`}[t]||`#6b7280`,r=e=>e.toFixed(1)+` kW`,i=document.getElementById(`dot-${e.id}`);i&&(i.className=`dot dot-${t}`);let a=document.getElementById(`power-val-${e.id}`);a&&(a.textContent=e.power.toFixed(0)+`%`);let o=document.getElementById(`meter-${e.id}`);o&&(o.style.width=e.power+`%`,o.style.background=t===`crit`?`var(--red)`:t===`warn`?`var(--amber)`:`var(--phosphor)`);let s=document.getElementById(`status-text-${e.id}`);s&&(s.className=`card-status-text txt-${t}`,s.textContent=t===`ok`?`Operando con normalidad`:t===`warn`?`Requiere revisión`:`Alarma activa`),T[e.id]||(T[e.id]=S(`card-chart-${e.id}`)),C(T[e.id],`card-chart-${e.id}`,e.waveform,75,n,r)}function O(){let e=document.getElementById(`grid`);if(!e)return;let t=0,n=0,r=0;o.forEach(i=>{let a=s(i);a===`ok`?t++:a===`warn`?n++:r++;let o=document.getElementById(`card-${i.id}`);o||(o=E(i),e.appendChild(o)),D(i,a)});let i=document.getElementById(`count-ok`);i&&(i.textContent=t);let a=document.getElementById(`count-warn`);a&&(a.textContent=n);let c=document.getElementById(`count-crit`);c&&(c.textContent=r),b()}function k(e,t){o[e].equipment[t].installed=!o[e].equipment[t].installed,o[e].equipment[t].installed||(o[e].equipment[t].on=!1),P(e),F()}function A(e,t){let n=o[e].equipment[t];n.installed&&(n.on=!n.on,P(e),F())}function j(e,t){o[e][t]=!o[e][t],P(e),F()}function M(e,t){o[e].config.phaseMonitoring=parseInt(t),P(e),F()}function N(e,t,n){let r=parseFloat(n);isNaN(r)||(o[e].thresholds[t]=r),P(e),F()}function P(e){let t=o[e],n=s(t),r=t._lastStatus;if(r===null){t._lastStatus=n,v(e,n,n===`ok`?`entró en operación normal`:n===`warn`?`entró en estado de advertencia`:`entró en estado crítico`);return}if(n!==r){t._lastStatus=n;let i=``;i=n===`ok`?r===`crit`?`se recuperó del estado crítico`:r===`warn`?`se recuperó de la advertencia`:`volvió a operación normal`:n===`warn`?r===`crit`?`mejoró de crítico a advertencia`:r===`ok`?`entró en estado de advertencia`:`cambió a advertencia`:r===`ok`?`falló críticamente`:r===`warn`?`empeoró a estado crítico`:`entró en estado crítico`,v(e,n,i)}}function F(){O(),g(),b(),z!==null&&U(z),I!==null&&L(I)}var I=null;function L(e){I=e;let t=o[e],i=document.getElementById(`settings-content`),a=r.map(e=>{let r=t.equipment[e],i=n[e],a=r.installed;return`
      <div class="equip-row ${a?``:`equip-off`}">
        <div class="equip-name">${i.name}<span class="sub">${i.sub}</span></div>
        <label class="switch">
          <input type="checkbox" ${a?`checked`:``} data-equip-install="${e}">
          <span class="slider"></span>
        </label>
      </div>`}).join(``),s=t.config.phaseMonitoring===0?`
    <p style="font-family:var(--mono); font-size:11px; color:var(--text-dim); margin:0;">
      Activa el monitoreo de fases arriba para poder encenderlas/apagarlas aquí.
    </p>`:`
    <div class="phase-row" style="margin-bottom:0;">
      <div class="phase-box">
        <span class="phase-label"><span class="dot dot-${t.phaseA?`ok`:`crit`}" style="margin-top:0;"></span>${t.config.phaseMonitoring===1?`Fase (monofásico)`:`Fase A`}</span>
        <label class="switch">
          <input type="checkbox" ${t.phaseA?`checked`:``} data-phase="phaseA">
          <span class="slider"></span>
        </label>
      </div>
      ${t.config.phaseMonitoring===2?`
      <div class="phase-box">
        <span class="phase-label"><span class="dot dot-${t.phaseB?`ok`:`crit`}" style="margin-top:0;"></span>Fase B</span>
        <label class="switch">
          <input type="checkbox" ${t.phaseB?`checked`:``} data-phase="phaseB">
          <span class="slider"></span>
        </label>
      </div>`:``}
    </div>`;i.innerHTML=`
    <div class="detail-header">
      <div>
        <h2>Configuración</h2>
        <p class="detail-freq" style="margin:2px 0 0;">${t.shortName} (${t.call})</p>
      </div>
      <button class="close-btn" aria-label="Volver al detalle" id="settings-close-btn">✕</button>
    </div>

    <p class="section-title">Parámetros normales</p>
    <div class="threshold-grid">
      <div class="threshold-box">
        <label>Potencia mínima (%)</label>
        <input type="number" step="1" min="0" max="100" value="${t.thresholds.powerMin}" data-threshold="powerMin">
      </div>
      <div class="threshold-box">
        <label>ROE máximo</label>
        <input type="number" step="0.05" min="1" max="3" value="${t.thresholds.vswrMax}" data-threshold="vswrMax">
      </div>
      <div class="threshold-box">
        <label>Temperatura máxima (°C)</label>
        <input type="number" step="1" min="20" max="80" value="${t.thresholds.tempMax}" data-threshold="tempMax">
      </div>
    </div>

    <p class="section-title">Monitoreo de fase eléctrica</p>
    <div class="threshold-box" style="margin-bottom:12px;">
      <label>Fases instaladas</label>
      <select data-phase-config style="width:100%; background:var(--panel); border:1px solid var(--panel-line); border-radius:4px; color:var(--text); font-family:var(--mono); font-size:12px; padding:4px 6px;">
        <option value="0" ${t.config.phaseMonitoring===0?`selected`:``}>Sin monitoreo</option>
        <option value="1" ${t.config.phaseMonitoring===1?`selected`:``}>1 fase (monofásico)</option>
        <option value="2" ${t.config.phaseMonitoring===2?`selected`:``}>2 fases (bifásico)</option>
      </select>
    </div>
    <div style="margin-bottom:18px;">${s}</div>

    <p class="section-title">Cadena de equipos</p>
    <p style="font-family:var(--mono); font-size:9px; color:var(--text-dim); margin:-4px 0 10px;">
      Activa cada equipo que realmente exista en este transmisor.
    </p>
    <div>${a}</div>
  `,document.getElementById(`settings-overlay`).classList.add(`open`),document.getElementById(`settings-close-btn`).addEventListener(`click`,R),i.querySelectorAll(`[data-equip-install]`).forEach(t=>{t.addEventListener(`change`,()=>k(e,t.dataset.equipInstall))}),i.querySelectorAll(`[data-phase]`).forEach(t=>{t.addEventListener(`change`,()=>j(e,t.dataset.phase))}),i.querySelectorAll(`[data-threshold]`).forEach(t=>{t.addEventListener(`change`,()=>N(e,t.dataset.threshold,t.value))});let c=i.querySelector(`[data-phase-config]`);c&&c.addEventListener(`change`,()=>M(e,c.value))}function R(){I=null,document.getElementById(`settings-overlay`).classList.remove(`open`)}var z=null,B={power:null,vswr:null,temp:null};function V(){w(B.power),w(B.vswr),w(B.temp),B={power:null,vswr:null,temp:null}}function H(e,t,i){let a=``;a=Object.values(e.equipment).some(e=>e.installed)?`<div style="margin-bottom:12px;">${r.map(t=>{let r=e.equipment[t],i=n[t];if(r.installed){let e=r.on;return`
          <div class="equip-row">
            <div class="equip-name">${i.name}<span class="sub">${i.sub}</span></div>
            <label class="switch">
              <input type="checkbox" ${e?`checked`:``} data-equip-on="${t}">
              <span class="slider"></span>
            </label>
          </div>`}else return`
          <div class="equip-row equip-not-installed">
            <div class="equip-name">${i.name}<span class="sub">${i.sub}</span></div>
            <span class="badge-not-installed">No instalado</span>
          </div>`}).join(``)}</div>`:`
      <div class="info-note">
        <strong>Ningún equipo ha sido instalado en este transmisor.</strong><br>
        Ve a <strong>Configuración</strong> para habilitar los componentes que realmente existen en este transmisor.
        Solo los equipos habilitados aparecerán aquí y podrán ser monitoreados/controlados.
      </div>`;let o;o=e.config.phaseMonitoring===0?`
      <p style="font-family:var(--mono); font-size:11px; color:var(--text-dim); margin:0 0 14px; padding:8px 10px; background:var(--surface-2); border:1px solid var(--panel-line); border-radius:5px;">
        Este transmisor no tiene monitoreo de fase eléctrica configurado.
      </p>`:`
      <div class="phase-row">
        <div class="phase-box">
          <span class="phase-label"><span class="dot dot-${e.phaseA?`ok`:`crit`}" style="margin-top:0;"></span>${e.config.phaseMonitoring===1?`Fase (monofásico)`:`Fase A`}</span>
          <span style="font-family:var(--mono); font-size:10px; color:var(--text-dim);">${e.phaseA?`Operativa`:`Caída`}</span>
        </div>
        ${e.config.phaseMonitoring===2?`
        <div class="phase-box">
          <span class="phase-label"><span class="dot dot-${e.phaseB?`ok`:`crit`}" style="margin-top:0;"></span>Fase B</span>
          <span style="font-family:var(--mono); font-size:10px; color:var(--text-dim);">${e.phaseB?`Operativa`:`Caída`}</span>
        </div>`:``}
      </div>`;let s=_.filter(e=>e.txId===i).slice(0,5),c=s.length>0?s.map(e=>`
    <li><span class="t">${e.timeStr}</span>${e.message}</li>
  `).join(``):`<li style="color:var(--text-dim);">No hay eventos recientes para este transmisor.</li>`;return`
    <div class="detail-grid">
      <div class="metric-box"><div class="metric-label">Potencia de salida</div><div class="metric-value" style="color:${e.power<e.thresholds.powerMin?`var(--amber)`:`var(--phosphor)`}">${e.power.toFixed(1)}%</div></div>
      <div class="metric-box"><div class="metric-label">ROE (VSWR)</div><div class="metric-value" style="color:${e.vswr>e.thresholds.vswrMax+.3?`var(--red)`:e.vswr>e.thresholds.vswrMax?`var(--amber)`:`var(--phosphor)`}">${e.vswr.toFixed(2)}:1</div></div>
      <div class="metric-box"><div class="metric-label">Temperatura</div><div class="metric-value" style="color:${e.temp>e.thresholds.tempMax+8?`var(--red)`:e.temp>e.thresholds.tempMax?`var(--amber)`:`var(--phosphor)`}">${e.temp.toFixed(1)}°C</div></div>
      <div class="metric-box"><div class="metric-label">Estado</div><div class="metric-value" style="color:${t===`crit`?`var(--red)`:t===`warn`?`var(--amber)`:`var(--phosphor)`}">${t===`ok`?`Normal`:t===`warn`?`Advertencia`:`Crítico`}</div></div>
    </div>

    <p class="section-title">Alimentación eléctrica</p>
    ${o}

    <p class="section-title">Cadena de equipos</p>
    ${a}

    <p class="section-title">Eventos recientes</p>
    <ul class="log-list">
      ${c}
    </ul>
  `}function U(e){let t=z!==e;z=e;let n=o[e],r=s(n),i=document.getElementById(`overlay`),a=document.getElementById(`detail-content`);t&&(V(),a.innerHTML=`
      <div class="detail-header">
        <div>
          <h2>${n.shortName}</h2>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="close-btn" aria-label="Configuración de este transmisor" id="settings-btn" style="width:auto; padding:0 10px; font-size:11px; font-family:var(--sans);">Configuración</button>
          <button class="close-btn" aria-label="Cerrar detalle" id="close-btn">✕</button>
        </div>
      </div>
      <p class="detail-freq">${n.call} · ${n.freq} · ${n.band} · ${n.municipio}${n.powerKW?` · ${n.powerKW} kW autorizados`:``} · en operación ${n.uptime}h</p>
      <p class="detail-freq" style="margin-top:-12px; opacity:0.6; font-size:11px;">Coordenadas: ${n.lat.toFixed(4)}, ${n.lon.toFixed(4)}</p>

      <div id="detail-dynamic"></div>

      <p class="section-title" style="margin-top:12px;">Historial</p>
      <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px;">
        ${x(`chart-power`,`Potencia (%)`)}
        ${x(`chart-vswr`,`ROE (VSWR)`)}
        ${x(`chart-temp`,`Temperatura (°C)`)}
      </div>
    `,i.classList.add(`open`),document.getElementById(`close-btn`).addEventListener(`click`,W),document.getElementById(`settings-btn`).addEventListener(`click`,()=>L(e)),B.power=S(`chart-power`),B.vswr=S(`chart-vswr`),B.temp=S(`chart-temp`));let c=document.getElementById(`detail-dynamic`);c.innerHTML=H(n,r,e),c.querySelectorAll(`[data-equip-on]`).forEach(t=>{t.addEventListener(`change`,()=>A(e,t.dataset.equipOn))}),C(B.power,`chart-power`,n.history.power,n.thresholds.powerMin,`var(--phosphor)`,e=>e.toFixed(0)+`%`),C(B.vswr,`chart-vswr`,n.history.vswr,n.thresholds.vswrMax,`var(--amber)`,e=>e.toFixed(2)+`:1`),C(B.temp,`chart-temp`,n.history.temp,n.thresholds.tempMax,`var(--red)`,e=>e.toFixed(0)+`°C`)}function W(){V(),z=null,document.getElementById(`overlay`).classList.remove(`open`)}function G(){let e=document.getElementById(`geo-svg`),t=document.getElementById(`map-tooltip`),n=document.getElementById(`tt-name`),r=document.getElementById(`tt-detail`),i=document.getElementById(`tt-status`),a=!1,c=0,l=0,m=!1,_=document.getElementById(`map-options-btn`),v=document.getElementById(`map-options-menu`);_.addEventListener(`click`,function(e){e.stopPropagation(),v.classList.toggle(`open`),this.classList.toggle(`active`)}),document.addEventListener(`click`,function(){v.classList.remove(`open`),_.classList.remove(`active`)}),document.querySelectorAll(`.menu-item`).forEach(e=>{e.addEventListener(`click`,function(e){e.stopPropagation();let t=this.dataset.option;d[t]=!d[t],this.classList.toggle(`active`),g()})}),e.addEventListener(`mousemove`,function(a){let c=h(a.clientX,a.clientY),l=c.x,u=c.y,d=!1;for(let c of o){let o=f(c.lat,c.lon),p=o.x-l,m=o.y-u;if(Math.sqrt(p*p+m*m)<15){d=!0;let o=s(c);n.textContent=c.shortName,r.textContent=`${c.call} · ${c.freq} · ${c.municipio}`,i.textContent=o===`ok`?`Normal`:o===`warn`?`Advertencia`:`Crítico`,i.className=`tt-status ${o}`;let l=e.getBoundingClientRect(),u=a.clientX-l.left+14,f=a.clientY-l.top-10;t.style.left=Math.min(u,l.width-200)+`px`,t.style.top=Math.min(f,l.height-80)+`px`,t.classList.add(`visible`);break}}d||t.classList.remove(`visible`)}),e.addEventListener(`mouseleave`,function(){t.classList.remove(`visible`)}),e.addEventListener(`wheel`,function(e){e.preventDefault();let t=e.deltaY<0?1.15:1/1.15;u.scale*=t,p(),g()},{passive:!1}),e.addEventListener(`pointerdown`,function(t){a=!0,m=!1,c=t.clientX,l=t.clientY,e.setPointerCapture(t.pointerId),e.style.cursor=`grabbing`}),e.addEventListener(`pointermove`,function(t){if(!a)return;let n=t.clientX-c,r=t.clientY-l;(Math.abs(n)>3||Math.abs(r)>3)&&(m=!0);let i=480/e.getBoundingClientRect().width;u.x+=n*i,u.y+=r*i,c=t.clientX,l=t.clientY,p(),g()}),e.addEventListener(`pointerup`,function(t){if(a=!1,e.style.cursor=`grab`,!m){let e=h(t.clientX,t.clientY),n=e.x,r=e.y;for(let e of o){let t=f(e.lat,e.lon),i=t.x-n,a=t.y-r;if(Math.sqrt(i*i+a*a)<18){U(e.id);break}}}}),[`pointerleave`,`pointercancel`].forEach(t=>{e.addEventListener(t,function(){a=!1,e.style.cursor=`grab`})}),document.getElementById(`map-zoom-in`).addEventListener(`click`,function(){u.scale*=1.4,p(),g()}),document.getElementById(`map-zoom-out`).addEventListener(`click`,function(){u.scale/=1.4,p(),g()}),document.getElementById(`map-zoom-reset`).addEventListener(`click`,function(){u.scale=1,u.x=0,u.y=0,g()})}var K={total:document.getElementById(`stat-total`),operational:document.getElementById(`stat-operational`),warning:document.getElementById(`stat-warning`),critical:document.getElementById(`stat-critical`),availability:document.getElementById(`stat-availability`),lastUpdate:document.getElementById(`stat-lastupdate`),badge:document.getElementById(`stats-badge`)};function q(e){let t=e||o;if(!t||!Array.isArray(t)||t.length===0)return{total:0,operational:0,warning:0,critical:0,availability:0};let n=t.length,r=0,i=0,a=0;t.forEach(e=>{let t=s(e);t===`ok`?r++:t===`warn`?i++:t===`crit`&&a++});let c=r*100+i*50,l=n>0?Math.round(c/n):0;return{total:n,operational:r,warning:i,critical:a,availability:l}}function J(){return new Date().toLocaleTimeString(`es-MX`,{hour:`2-digit`,minute:`2-digit`,second:`2-digit`,hour12:!1})}function Y(e){if(K.total&&(K.total.textContent=e.total),K.operational&&(K.operational.textContent=e.operational),K.warning&&(K.warning.textContent=e.warning),K.critical&&(K.critical.textContent=e.critical),K.availability&&(K.availability.textContent=e.availability+`%`),K.lastUpdate&&(K.lastUpdate.textContent=J()),K.badge){let t=K.badge.querySelector(`.dot`);t&&(e.critical>0?(t.style.background=`#ef4444`,K.badge.style.borderColor=`#ef4444`,K.badge.style.color=`#ef4444`):e.warning>0?(t.style.background=`#eab308`,K.badge.style.borderColor=`#eab308`,K.badge.style.color=`#eab308`):(t.style.background=`#22c55e`,K.badge.style.borderColor=`var(--panel-line, #dde3e0)`,K.badge.style.color=`var(--text-dim, #667169)`))}}function X(){let e=q(o);Y(e),console.log(`[Dashboard] Inicializado con`,e.total,`transmisores`)}function Z(e){[`power`,`vswr`,`temp`].forEach(t=>{e.history[t].push(e[t]),e.history[t].length>30&&e.history[t].shift()})}function Q(){o.forEach(e=>{e.power=Math.min(100,Math.max(40,e.power+i(-4,4))),e.vswr=Math.max(1,e.vswr+i(-.05,.05)),e.temp=Math.max(25,e.temp+i(-1.5,1.5)),e.waveform.shift(),e.waveform.push(i(20,100)),Z(e),P(e.id)}),O(),Y(q(o));let e=o.filter(e=>s(e)===`ok`).length,t=o.filter(e=>s(e)===`warn`).length,n=o.filter(e=>s(e)===`crit`).length;if(window.__updateSidebarStatus&&window.__updateSidebarStatus(e,t,n),window.updateSidebarGauge){let e=q(o);window.updateSidebarGauge(e.availability)}let r=document.activeElement,a=r&&r.matches(`#settings-content input[type="number"]`);z!==null&&U(z),I!==null&&!a&&L(I)}window.openDetail=U,document.getElementById(`overlay`).addEventListener(`click`,e=>{e.target.id===`overlay`&&W()}),document.getElementById(`settings-overlay`).addEventListener(`click`,e=>{e.target.id===`settings-overlay`&&R()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&(document.getElementById(`settings-overlay`).classList.contains(`open`)?R():W())}),c(`light`),l(),o.forEach(e=>{e._lastStatus=s(e)}),g(),G(),O(),b(),X(),v(0,`ok`,`sistema de monitoreo iniciado`),setInterval(()=>{Q(),g()},1500);