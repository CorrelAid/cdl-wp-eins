<script>
  const phases = [
    { 
      id: 'konzeption', 
      label: 'Konzeption', 
      sub: 'Forschungsfragen & Stichprobe',
      href: '/konzeption-einleitung' 
    },
    { 
      id: 'design', 
      label: 'Fragebogendesign', 
      sub: 'Operationalisierung & Pretest',
      href: '/design-einleitung' 
    },
    { 
      id: 'erhebung', 
      label: 'Erhebung', 
      sub: 'Feldphase & Monitoring',
      href: '/erhebung-einleitung' 
    },
    { 
      id: 'analyse', 
      label: 'Aufbereitung & Analyse', 
      sub: 'Data Cleaning & Statistik',
      href: '/analyse-einleitung' 
    },
    { 
      id: 'handeln', 
      label: 'Entscheiden & Handeln', 
      sub: 'Reporting & Impact',
      href: '/handeln-einleitung' 
    }
  ];

  const markers = [
    // Spanning Knowledge Markers (Bedienungsanleitung)
    { label: 'DDI Codebook', type: 'knowledge', href: '/ddi-codebook', startRow: 3, endRow: 8, column: 1 },
    { label: 'XLSForm', type: 'knowledge', href: '/xlsform-standard', startRow: 3, endRow: 4, column: 2 },
    
    // Phase-specific Knowledge (Bedienungsanleitung)
    { label: 'Sampling Theorie', type: 'knowledge', href: '/sampling-theorie', phase: 0 },
    { label: 'Fragetypen', type: 'knowledge', href: '/fragetypen', phase: 1 },
    { label: 'Reihenfolgeeffekte', type: 'knowledge', href: '/reihenfolgeeffekte', phase: 1 },
    { label: 'Pretesting mit LLMs', type: 'knowledge', href: '/llm-synthetic-survey-data', phase: 1 },
    { label: 'KoboToolbox', type: 'knowledge', href: '/kobotoolbox', phase: 2 },
    { label: 'LimeSurvey', type: 'knowledge', href: '/limesurvey', phase: 2 },
    { label: 'LamaPoll', type: 'knowledge', href: '/lamapoll', phase: 2 },
    { label: 'JASP', type: 'knowledge', href: '/jasp-statistik', phase: 3 },
    { label: 'Bayes-Statistik', type: 'knowledge', href: '/bayes-statistik', phase: 3 },

    // Werkzeugkasten - Apps (Blue + Monitor Icon)
    { label: 'FormulAid', type: 'app', href: 'https://formulaid.correlaid.org/', phase: 1 },
    { label: 'FormTransform', type: 'app', href: 'https://formtransform.correlaid.org/', phase: 1 },
    
    // Werkzeugkasten - Packages (Blue + Box Icon)
    { label: 'xlsform2lstsv', type: 'package', href: 'https://github.com/CorrelAid/xlsform2lstsv', phase: 2 },
  ];
</script>

<div class="roadmap-container">
  <!-- Spanning Knowledge Markers -->
  {#each markers.filter(m => m.startRow !== undefined) as marker}
    <a 
      href={marker.href} 
      class="spanning-marker {marker.type}"
      style="grid-row: {marker.startRow} / {marker.endRow}; grid-column: {marker.column};"
    >
      <span class="vertical-text">{marker.label}</span>
    </a>
  {/each}

  <!-- Phases and Connectors -->
  {#each phases as phase, i}
    <!-- Arrow/Connector Row -->
    {#if i > 0}
        <div class="connector-row" style="grid-row: {i * 2}; grid-column: 3;">
            <div class="line"></div>
            <div class="arrow-head"></div>
        </div>
    {/if}

    <!-- Phase Content Row -->
    <div class="phase-row" style="grid-row: {i * 2 + 1}; grid-column: 3;">
        <div class="phase-card-wrapper">
            <a href={phase.href} class="phase-card">
              <span class="phase-title">{phase.label}</span>
              <span class="phase-sub">{phase.sub}</span>
            </a>

            <div class="phase-tools">
                {#each markers.filter(m => m.phase === i) as marker}
                    <a href={marker.href} class="tool-badge {marker.type}" target={marker.href.startsWith('http') ? '_blank' : '_self'}>
                        {#if marker.type === 'app'}
                            <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                        {:else if marker.type === 'package'}
                            <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        {/if}
                        {marker.label}
                        {#if marker.href.startsWith('http')}
                             <svg class="external-icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        {/if}
                    </a>
                {/each}
            </div>
            
            {#if i === 1}
              <div class="feedback-indicator">
                <span class="loop-icon">⤴</span> Pretesting & Iteration Loop
              </div>
            {/if}
        </div>
    </div>
  {/each}
</div>

<style>
  .roadmap-container {
    display: grid;
    /* Col 1: DDI, Col 2: XLSForm, Col 3: Content */
    grid-template-columns: 35px 35px 1fr;
    grid-template-rows: repeat(9, auto);
    gap: 0 1.5rem;
    max-width: 700px;
    margin: 4rem auto;
    padding: 0 1rem;
  }

  .spanning-marker {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 2px solid var(--color-secondary);
    text-decoration: none;
    transition: all 0.2s;
    background: var(--color-tertiary);
    align-self: stretch;
    margin: 0;
  }
  
  .spanning-marker:hover {
    filter: brightness(0.95);
    transform: scale(1.01);
    z-index: 10;
  }

  .vertical-text {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-family: var(--font-family-mono);
    font-size: 10px;
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .phase-row { padding: 0; }
  .connector-row { display: flex; flex-direction: column; align-items: center; height: 40px; position: relative; }
  .line { width: 2px; flex: 1; background: var(--color-secondary); opacity: 0.3; }
  .arrow-head { width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 8px solid var(--color-secondary); margin-top: -1px; opacity: 0.3; }

  .phase-card-wrapper { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.2rem 0; }
  .phase-card { display: flex; flex-direction: column; padding: 1rem 1.25rem; background: var(--color-white); border: 2px solid var(--color-secondary); border-radius: 12px; text-decoration: none; transition: all 0.2s; box-shadow: 4px 4px 0px var(--color-secondary); }
  .phase-card:hover { background: var(--color-tertiary); }
  .phase-title { font-family: var(--font-family-heading); font-size: 1rem; font-weight: var(--font-weight-bold); color: var(--color-text-primary); text-transform: uppercase; }
  .phase-sub { font-family: var(--font-family-body); font-size: 0.85rem; opacity: 0.8; color: var(--color-text-primary); margin-top: 2px; }

  .phase-tools { display: flex; flex-wrap: wrap; gap: 0.4rem; }

  .tool-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      font-family: var(--font-family-mono);
      font-size: 10px;
      font-weight: var(--font-weight-bold);
      padding: 3px 8px;
      border-radius: 12px;
      border: 1px solid var(--color-secondary);
      text-decoration: none;
      transition: all 0.2s;
  }

  .badge-icon { width: 11px; height: 11px; }
  .external-icon-small { width: 8px; height: 8px; opacity: 0.7; margin-left: -2px; }

  /* Tool-Styling (Apps & Packages) */
  .tool-badge.app, .tool-badge.package { 
      background: var(--color-primary); 
      color: var(--color-secondary); 
      border-color: var(--color-secondary); 
  }
  
  /* Knowledge-Styling */
  .tool-badge.knowledge { 
      background: var(--color-tertiary); 
      color: var(--color-text-primary); 
      border-color: var(--color-text-primary); 
  }

  .tool-badge:hover { filter: brightness(0.9); transform: translateY(-1px); }
  .tool-badge:hover .external-icon-small { opacity: 1; }

  .feedback-indicator { font-family: var(--font-family-mono); font-size: 10px; color: var(--color-secondary); font-style: italic; margin-top: 2px; }

  @media (max-width: 500px) {
      .roadmap-container { grid-template-columns: 30px 30px 1fr; gap: 0 0.75rem; }
      .vertical-text { font-size: 9px; }
      .phase-title { font-size: 0.9rem; }
  }
</style>
