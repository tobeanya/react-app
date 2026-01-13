// NPV Results Data for Expansion Plan Results Page
// Contains NPV-specific metrics across multiple years

export interface NpvMetric {
  n: string; // name
  u: string; // unit
  b: boolean; // has baseline
}

export interface NpvDataRow {
  t: string; // technology
  b: number; // build cycle
  s: string; // status
  y: number; // year
  evalYear: number; // evaluating year
  [metric: string]: string | number;
}

export interface NpvData {
  m: NpvMetric[];
  d: NpvDataRow[];
}

const technologies = [
  'Candidate_Adv CC_RestOfSys',
  'Candidate_Adv CT_RestOfSys',
  'Candidate_Battery_4HR_RestOfSys',
  'Candidate_Battery_4HR_RestOfSys;Candidate_Solar_W_RestOfSys',
  'Candidate_Solar_W_RestOfSys',
  'Candidate_Wind_W_RestOfSys',
];

// Generate years from 2030 to 2040 to cover typical planning horizons
const years: number[] = [];
for (let y = 2030; y <= 2040; y++) {
  years.push(y);
}

// Generate sample NPV data
function generateNpvData(): NpvData {
  const metrics: NpvMetric[] = [
    {n: 'LOLE', u: 'Days/Year', b: true},
    {n: 'Energy Margin', u: '$M', b: false},
    {n: 'Total Cost', u: '$M', b: true},
    {n: 'Production Cost', u: '$M', b: true},
    {n: 'Fuel Cost', u: '$M', b: true},
    {n: 'Startup Cost', u: '$M', b: false},
    {n: 'Variable OM Cost', u: '$M', b: false},
    {n: 'Emission Cost', u: '$M', b: false},
    {n: 'EUE Cost', u: '$M', b: true},
    {n: 'Net Purchase Cost', u: '$M', b: true},
    {n: 'System Fixed Cost', u: '$M', b: true},
    {n: 'System Fixed Carrying Cost', u: '$M', b: true},
    {n: 'System Fixed OM Cost', u: '$M', b: true},
  ];

  const data: NpvDataRow[] = [];

  // Base values for each technology
  const techBaseValues: Record<string, Record<string, number>> = {
    'Candidate_Adv CC_RestOfSys': {
      'LOLE': 2.5,
      'Energy Margin': 45.2,
      'Total Cost': 1250.5,
      'Production Cost': 320.8,
      'Fuel Cost': 280.4,
      'Startup Cost': 15.2,
      'Variable OM Cost': 12.8,
      'Emission Cost': 8.5,
      'EUE Cost': 125.3,
      'Net Purchase Cost': 45.2,
      'System Fixed Cost': 180.5,
      'System Fixed Carrying Cost': 120.3,
      'System Fixed OM Cost': 45.8,
    },
    'Candidate_Adv CT_RestOfSys': {
      'LOLE': 2.8,
      'Energy Margin': 38.5,
      'Total Cost': 980.2,
      'Production Cost': 245.6,
      'Fuel Cost': 210.3,
      'Startup Cost': 22.5,
      'Variable OM Cost': 10.2,
      'Emission Cost': 12.3,
      'EUE Cost': 118.5,
      'Net Purchase Cost': 52.1,
      'System Fixed Cost': 145.2,
      'System Fixed Carrying Cost': 95.6,
      'System Fixed OM Cost': 38.4,
    },
    'Candidate_Battery_4HR_RestOfSys': {
      'LOLE': 3.2,
      'Energy Margin': 28.9,
      'Total Cost': 520.8,
      'Production Cost': 45.2,
      'Fuel Cost': 0,
      'Startup Cost': 2.1,
      'Variable OM Cost': 8.5,
      'Emission Cost': 0,
      'EUE Cost': 95.2,
      'Net Purchase Cost': 85.6,
      'System Fixed Cost': 125.8,
      'System Fixed Carrying Cost': 180.2,
      'System Fixed OM Cost': 22.5,
    },
    'Candidate_Battery_4HR_RestOfSys;Candidate_Solar_W_RestOfSys': {
      'LOLE': 2.1,
      'Energy Margin': 52.8,
      'Total Cost': 680.5,
      'Production Cost': 28.5,
      'Fuel Cost': 0,
      'Startup Cost': 1.8,
      'Variable OM Cost': 6.2,
      'Emission Cost': 0,
      'EUE Cost': 72.5,
      'Net Purchase Cost': 62.3,
      'System Fixed Cost': 195.2,
      'System Fixed Carrying Cost': 245.8,
      'System Fixed OM Cost': 35.2,
    },
    'Candidate_Solar_W_RestOfSys': {
      'LOLE': 3.5,
      'Energy Margin': 32.5,
      'Total Cost': 420.3,
      'Production Cost': 12.5,
      'Fuel Cost': 0,
      'Startup Cost': 0,
      'Variable OM Cost': 4.2,
      'Emission Cost': 0,
      'EUE Cost': 110.8,
      'Net Purchase Cost': 78.5,
      'System Fixed Cost': 95.2,
      'System Fixed Carrying Cost': 165.5,
      'System Fixed OM Cost': 18.5,
    },
    'Candidate_Wind_W_RestOfSys': {
      'LOLE': 3.8,
      'Energy Margin': 35.2,
      'Total Cost': 385.6,
      'Production Cost': 8.5,
      'Fuel Cost': 0,
      'Startup Cost': 0,
      'Variable OM Cost': 5.8,
      'Emission Cost': 0,
      'EUE Cost': 105.2,
      'Net Purchase Cost': 92.3,
      'System Fixed Cost': 88.5,
      'System Fixed Carrying Cost': 145.2,
      'System Fixed OM Cost': 15.8,
    },
  };

  // Generate data for each year, build cycle, and technology
  years.forEach((year, yearIdx) => {
    // Each year has 24 build cycles (0-23)
    const maxCycles = 24;

    for (let bc = 0; bc < maxCycles; bc++) {
      technologies.forEach((tech, techIdx) => {
        const baseValues = techBaseValues[tech];

        // Determine status - first tech in some cycles is "Selected"
        let status = 'Rejected';
        if (bc % 4 === techIdx % technologies.length) {
          status = 'Selected 1 Units';
        }

        // Apply year and cycle variations
        const yearFactor = 1 + (yearIdx * 0.05); // 5% increase per year
        const cycleFactor = 1 + (bc * 0.02); // 2% increase per cycle
        const techVariance = 0.9 + (Math.sin(bc + techIdx) * 0.1); // Some variance

        const row: NpvDataRow = {
          t: tech,
          b: bc,
          s: status,
          y: year,
          evalYear: year,
        };

        // Add metric values with variations
        metrics.forEach(metric => {
          const baseVal = baseValues[metric.n];
          if (baseVal === 0) {
            row[metric.n] = 0;
          } else {
            // Apply factors for realistic variation
            const value = baseVal * yearFactor * cycleFactor * techVariance;
            row[metric.n] = Math.round(value * 100) / 100;
          }
        });

        data.push(row);
      });
    }
  });

  return {m: metrics, d: data};
}

export const EP_DATA_NPV: NpvData = generateNpvData();
