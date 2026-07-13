// Ventana "Acerca de" del sistema - Full-screen con tabs horizontales
// Muestra información del proyecto, explicación de términos técnicos, acrónimos y créditos

export function openAbout() {
  const overlay = document.getElementById('about-overlay');
  const content = document.getElementById('about-content');

  content.innerHTML = `
    <div class="about-header">
      <div class="about-header-left">
        <h2>Acerca de</h2>
        <span class="about-subtitle">Red de Transmisores — Panel de Monitoreo</span>
      </div>
      <button class="about-close-btn" id="about-close-btn" aria-label="Cerrar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- TABS -->
    <div class="about-tabs" role="tablist">
      <button class="about-tab active" data-tab="tab-project" role="tab" aria-selected="true">
        <span class="about-tab-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </span>
        Proyecto
      </button>
      <button class="about-tab" data-tab="tab-glossary" role="tab" aria-selected="false">
        <span class="about-tab-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="9.09" y1="9" x2="9.1" y2="9.01"/>
            <line x1="14.09" y1="9" x2="14.1" y2="9.01"/>
            <path d="M9 15a3 3 0 0 0 6 0"/>
          </svg>
        </span>
        Glosario
      </button>
      <button class="about-tab" data-tab="tab-states" role="tab" aria-selected="false">
        <span class="about-tab-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4l3 3"/>
          </svg>
        </span>
        Estados
      </button>
      <button class="about-tab" data-tab="tab-equipment" role="tab" aria-selected="false">
        <span class="about-tab-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </span>
        Equipos
      </button>
      <button class="about-tab" data-tab="tab-credits" role="tab" aria-selected="false">
        <span class="about-tab-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </span>
        Créditos
      </button>
      <button class="about-tab" data-tab="tab-note" role="tab" aria-selected="false">
        <span class="about-tab-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="12" x2="12" y2="16"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </span>
        Nota
      </button>
    </div>

    <!-- CONTENIDO DE TABS -->
    <div class="about-body">
      <!-- Tab: Proyecto -->
      <div class="about-tab-content active" id="tab-project" role="tabpanel">
        <div class="about-section">
          <p><strong>Diseño de un Sistema SCADA para el Monitoreo de Parámetros Eléctricos y de Radiofrecuencia orientado a la Confiabilidad Operativa de las Estaciones de Transmisión del Sistema Chiapaneco de Radio, Televisión y Cinematografía</strong></p>
          <p style="margin-top:12px;">Este panel de monitoreo supervisa los <strong>11 transmisores de radio</strong> del Sistema Chiapaneco de Radio, Televisión y Cinematografía, como parte del prototipo funcional del sistema SCADA diseñado para el monitoreo de parámetros eléctricos y de radiofrecuencia.</p>
          <div class="about-meta">
            <span><strong>Versión:</strong> 0.7.1</span>
            <span><strong>Tecnologías:</strong> Astro, ECharts, Lucide</span>
            <span><strong>Repositorio:</strong> <a href="https://github.com/KAOSENI/SMPT" target="_blank">github.com/KAOSENI/SMPT</a></span>
            <span><strong>Producción:</strong> <a href="https://kaoseni.github.io/SMPT/" target="_blank">kaoseni.github.io/SMPT</a></span>
          </div>
        </div>
      </div>

      <!-- Tab: Glosario -->
      <div class="about-tab-content" id="tab-glossary" role="tabpanel">
        <div class="about-section">
          <div class="about-glossary">
            <div class="about-term">
              <span class="about-term-name">ROE / VSWR</span>
              <p class="about-term-desc">Relación de Onda Estacionaria. Mide la eficiencia de transmisión. Valores > 1.5:1 indican pérdidas por reflexión. Ideal: 1:1.</p>
            </div>
            <div class="about-term">
              <span class="about-term-name">Potencia de salida</span>
              <p class="about-term-desc">Porcentaje de la potencia máxima autorizada (kW) que entrega el transmisor. Cada estación tiene su propia potencia autorizada.</p>
            </div>
            <div class="about-term">
              <span class="about-term-name">Temperatura de operación</span>
              <p class="about-term-desc">Temperatura interna del transmisor en °C. El sobrecalentamiento puede indicar fallas en enfriamiento o sobrecarga.</p>
            </div>
            <div class="about-term">
              <span class="about-term-name">Umbrales</span>
              <p class="about-term-desc">Límites configurables para cada parámetro. Al superarlos, el transmisor cambia a estado de Advertencia o Crítico.</p>
            </div>
            <div class="about-term">
              <span class="about-term-name">Fase eléctrica</span>
              <p class="about-term-desc">Monitorea la alimentación eléctrica. Puede ser monofásico (1 fase) o bifásico (2 fases). La caída de una fase afecta la operación.</p>
            </div>
            <div class="about-term">
              <span class="about-term-name">SCADA</span>
              <p class="about-term-desc">Supervisory Control and Data Acquisition. Sistema de supervisión, control y adquisición de datos que permite monitorear y controlar procesos industriales a distancia.</p>
            </div>
            <div class="about-term">
              <span class="about-term-name">HMI</span>
              <p class="about-term-desc">Human-Machine Interface. Interfaz que permite la interacción entre los operadores y el sistema SCADA en tiempo real.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Estados -->
      <div class="about-tab-content" id="tab-states" role="tabpanel">
        <div class="about-section">
          <div class="about-states">
            <div class="about-state ok">
              <span class="about-state-dot">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </span>
              <div>
                <strong>Normal</strong>
                <span>Parámetros dentro de umbrales. Operación óptima.</span>
              </div>
            </div>
            <div class="about-state warn">
              <span class="about-state-dot">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <polygon points="12 2 2 19 22 19 12 2"/>
                </svg>
              </span>
              <div>
                <strong>Advertencia</strong>
                <span>Parámetro superó el umbral. Requiere atención y posible mantenimiento preventivo.</span>
              </div>
            </div>
            <div class="about-state crit">
              <span class="about-state-dot">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="var(--bg)" stroke-width="2"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="var(--bg)" stroke-width="2"/>
                </svg>
              </span>
              <div>
                <strong>Crítico</strong>
                <span>Fallo grave en el transmisor. Requiere intervención inmediata del personal técnico.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Equipos -->
      <div class="about-tab-content" id="tab-equipment" role="tabpanel">
        <div class="about-section">
          <div class="about-equipment-grid">
            <div class="about-equipment-item">
              <span class="about-equipment-item-name">Transmisor</span>
              <span class="about-equipment-item-desc">Equipo principal de radiofrecuencia que genera la señal de transmisión.</span>
            </div>
            <div class="about-equipment-item">
              <span class="about-equipment-item-name">Excitador</span>
              <span class="about-equipment-item-desc">Genera la señal de baja potencia que alimenta al transmisor.</span>
            </div>
            <div class="about-equipment-item">
              <span class="about-equipment-item-name">Amplificador</span>
              <span class="about-equipment-item-desc">Amplifica la señal para alcanzar la potencia de salida deseada.</span>
            </div>
            <div class="about-equipment-item">
              <span class="about-equipment-item-name">Filtro</span>
              <span class="about-equipment-item-desc">Elimina armónicos y señales no deseadas de la salida.</span>
            </div>
            <div class="about-equipment-item">
              <span class="about-equipment-item-name">Acoplador</span>
              <span class="about-equipment-item-desc">Acopla la señal a la línea de transmisión hacia la antena.</span>
            </div>
            <div class="about-equipment-item">
              <span class="about-equipment-item-name">Antena</span>
              <span class="about-equipment-item-desc">Radia la señal electromagnética hacia el espacio.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Créditos -->
      <div class="about-tab-content" id="tab-credits" role="tabpanel">
        <div class="about-section">
          <div class="about-credits">
            <div class="about-credit-item"><span class="about-credit-label">Institución</span><span>Sistema Chiapaneco de Radio, Televisión y Cinematografía</span></div>
            <div class="about-credit-item"><span class="about-credit-label">Ubicación</span><span>Tuxtla Gutiérrez, Chiapas, México</span></div>
            <div class="about-credit-item"><span class="about-credit-label">Año</span><span>2026</span></div>
          </div>
        </div>
      </div>

      <!-- Tab: Nota -->
      <div class="about-tab-content" id="tab-note" role="tabpanel">
        <div class="about-section about-note">
          <p>Los valores de potencia, ROE, temperatura y eventos mostrados en este panel son <strong>simulados</strong> con fines de demostración. No provienen de telemetría real de los transmisores. Este prototipo demuestra la funcionalidad del sistema SCADA diseñado.</p>
        </div>
      </div>
    </div>
  `;

  overlay.classList.add('open');

  // --- CONECTAR EVENTOS DE TABS ---
  document.querySelectorAll('.about-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      // Desactivar todos los tabs
      document.querySelectorAll('.about-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      // Activar este tab
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      // Ocultar todo el contenido
      document.querySelectorAll('.about-tab-content').forEach(content => {
        content.classList.remove('active');
      });
      // Mostrar el contenido correspondiente
      const targetId = this.dataset.tab;
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  document.getElementById('about-close-btn').addEventListener('click', closeAbout);

  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      closeAbout();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

export function closeAbout() {
  document.getElementById('about-overlay').classList.remove('open');
}