import penguinsCsv from './penguins.csv?raw';

function parseCSV(csv: string) {
  const lines = csv.split('\n').slice(1);
  return lines.filter(l => l.trim()).map(l => {
    const [species, island, bill_length_mm, bill_depth_mm, flipper_length_mm, body_mass_g, sex, year] = l.split(',');
    return {
      species,
      island,
      bill_length_mm: bill_length_mm === 'NA' ? NaN : parseFloat(bill_length_mm),
      bill_depth_mm: bill_depth_mm === 'NA' ? NaN : parseFloat(bill_depth_mm),
      flipper_length_mm: flipper_length_mm === 'NA' ? NaN : parseInt(flipper_length_mm),
      body_mass_g: body_mass_g === 'NA' ? NaN : parseInt(body_mass_g),
      sex,
      year: parseInt(year)
    };
  });
}

const penguins = parseCSV(penguinsCsv);

const speciesCount: Record<string, number> = {};
penguins.forEach(p => {
  speciesCount[p.species] = (speciesCount[p.species] || 0) + 1;
});

export const penguinSpeciesData = {
  labels: Object.keys(speciesCount),
  datasets: [{
    label: 'Anzahl der Pinguine',
    data: Object.values(speciesCount),
    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
  }]
};

const bins: Record<string, number> = { '30-35': 0, '35-40': 0, '40-45': 0, '45-50': 0, '50-55': 0, '55-60': 0 };
penguins.forEach(p => {
  if (isNaN(p.bill_length_mm)) return;
  if (p.bill_length_mm < 35) bins['30-35']++;
  else if (p.bill_length_mm < 40) bins['35-40']++;
  else if (p.bill_length_mm < 45) bins['40-45']++;
  else if (p.bill_length_mm < 50) bins['45-50']++;
  else if (p.bill_length_mm < 55) bins['50-55']++;
  else bins['55-60']++;
});

export const billLengthDistributionData = {
  labels: Object.keys(bins),
  datasets: [{
    label: 'Anzahl Pinguine',
    data: Object.values(bins),
    backgroundColor: '#3b82f6'
  }]
};

export const billLengthDepthCorrelationData = {
  datasets: [{
    label: 'Pinguine',
    data: penguins
      .filter(p => !isNaN(p.bill_length_mm) && !isNaN(p.bill_depth_mm))
      .map(p => ({ x: p.bill_length_mm, y: p.bill_depth_mm })),
    backgroundColor: '#3b82f6'
  }]
};

export const barChartOptions = {
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } }
};

export const histogramOptions = {
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true },
    x: { title: { display: true, text: 'Schnabellänge (mm)' } }
  }
};

export const scatterOptions = {
  plugins: { legend: { display: false } },
  scales: {
    x: { title: { display: true, text: 'Schnabellänge (mm)' } },
    y: { title: { display: true, text: 'Schnabeltiefe (mm)' } }
  }
};

const years = [...new Set(penguins.map(p => p.year))].sort();
const species = ['Adelie', 'Chinstrap', 'Gentoo'];
const speciesColors = ['#3b82f6', '#10b981', '#f59e0b'];

const timeSeriesDatasets = species.map((sp, i) => {
  const counts: number[] = [];
  years.forEach(year => {
    counts.push(penguins.filter(p => p.species === sp && p.year === year).length);
  });
  return {
    label: sp,
    data: counts,
    borderColor: speciesColors[i],
    backgroundColor: speciesColors[i],
    tension: 0.3,
    fill: false
  };
});

export const timeSeriesData = {
  labels: years.map(String),
  datasets: timeSeriesDatasets
};

export const lineChartOptions = {
  plugins: {
    legend: { position: 'top' as const }
  },
  scales: {
    y: { beginAtZero: true, title: { display: true, text: 'Anzahl Pinguine' } },
    x: { title: { display: true, text: 'Jahr' } }
  }
};
