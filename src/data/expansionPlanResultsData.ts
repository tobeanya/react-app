// Yearly Results Data for Expansion Plan Results Page
// Contains yearly metrics across multiple years and build cycles

export interface YearlyMetric {
  n: string;
  u: string;
  b: boolean;
}

export interface YearlyDataRow {
  t: string;
  b: number;
  s: string;
  y: number;
  [metric: string]: string | number;
}

export interface YearlyData {
  m: YearlyMetric[];
  d: YearlyDataRow[];
}

const technologies = [
  "Candidate_Adv CC_RestOfSys",
  "Candidate_Adv CT_RestOfSys",
  "Candidate_Battery_4HR_RestOfSys",
  "Candidate_Battery_4HR_RestOfSys;Candidate_Solar_W_RestOfSys",
  "Candidate_Solar_W_RestOfSys",
  "Candidate_Wind_W_RestOfSys",
];

// Generate years from 2030 to 2040 to cover typical planning horizons
const years: number[] = [];
for (let y = 2030; y <= 2040; y++) {
  years.push(y);
}

function generateYearlyData(): YearlyData {
  const metrics: YearlyMetric[] = [
    {n: "Added Capacity", u: "MW", b: false},
    {n: "Energy Margin", u: "$/MW", b: false},
    {n: "% of Capacity Available in EUE Hours", u: "%", b: false},
    {n: "Fixed Cost", u: "$/MW", b: false},
    {n: "Fixed Carrying Cost", u: "$/MW", b: false},
    {n: "Fixed OM Cost", u: "$/MW", b: false},
    {n: "Profit/Energy Production", u: "$/MWh", b: false},
    {n: "Profit/Nameplate MW", u: "$/MW", b: false},
    {n: "LOLE", u: "Days/Year", b: true},
    {n: "EUE", u: "MWh", b: true},
    {n: "LOLH", u: "Hours", b: true},
    {n: "Market Price", u: "$/MWh", b: true},
    {n: "Total Annual System Cost", u: "$", b: true},
    {n: "Unit Total Revenue", u: "$", b: false},
    {n: "Energy Revenue/Generation", u: "$/MWh", b: false},
    {n: "Unit Energy Revenue", u: "$/MWh", b: false},
    {n: "Unit Regulation Up Revenue", u: "$/MWh", b: false},
    {n: "Unit Spin Revenue", u: "$/MWh", b: false},
    {n: "Unit Production Cost", u: "$/MWh", b: false},
    {n: "Unit Fuel Cost", u: "$/MWh", b: false},
    {n: "Unit Startup Cost", u: "$/MWh", b: false},
    {n: "Unit Variable OM Cost", u: "$/MWh", b: false},
    {n: "Unit Emissions Cost", u: "$/MWh", b: false},
    {n: "System Curtailment", u: "MWh", b: true},
    {n: "Selection Criteria", u: "", b: false},
    {n: "Max EUE Depth", u: "MW", b: true},
    {n: "Max EUE Duration", u: "Hours", b: true},
    {n: "RPS Generation", u: "MWh", b: true},
    {n: "Generation", u: "MWh", b: false},
    {n: "Start Attempts", u: "Count", b: false},
    {n: "Capacity Factor", u: "%", b: false},
    {n: "Hours Online", u: "Hours", b: false},
  ];

  const techBaseValues: Record<string, Record<string, number>> = {
    "Candidate_Adv CC_RestOfSys": {
      "Added Capacity": 1083, "Energy Margin": 5599460, "% of Capacity Available in EUE Hours": 0.9396,
      "Fixed Cost": 0, "Fixed Carrying Cost": 200000, "Fixed OM Cost": 22514.96,
      "Profit/Energy Production": -27.43, "Profit/Nameplate MW": -221822.62,
      "LOLE": 27.02, "EUE": 465439.9, "LOLH": 17.34, "Market Price": 686.24,
      "Total Annual System Cost": 30410540000, "Unit Total Revenue": 6363354942,
      "Energy Revenue/Generation": 726.49, "Unit Energy Revenue": 726.45,
      "Unit Regulation Up Revenue": 0, "Unit Spin Revenue": 0.004,
      "Unit Production Cost": 52.53, "Unit Fuel Cost": 48.40, "Unit Startup Cost": 0,
      "Unit Variable OM Cost": 4.13, "Unit Emissions Cost": 0, "System Curtailment": 436.27,
      "Selection Criteria": 1, "Max EUE Depth": 0, "Max EUE Duration": 43,
      "RPS Generation": -436.27, "Generation": 877707.93, "Start Attempts": 269.75,
      "Capacity Factor": 42.28, "Hours Online": 3703.41,
    },
    "Candidate_Adv CT_RestOfSys": {
      "Added Capacity": 237, "Energy Margin": 1255875, "% of Capacity Available in EUE Hours": 0.9287,
      "Fixed Cost": 0, "Fixed Carrying Cost": 150000, "Fixed OM Cost": 7370,
      "Profit/Energy Production": -85.67, "Profit/Nameplate MW": -155437.13,
      "LOLE": 27.02, "EUE": 465439.9, "LOLH": 17.34, "Market Price": 686.24,
      "Total Annual System Cost": 30410540000, "Unit Total Revenue": 262523170,
      "Energy Revenue/Generation": 726.72, "Unit Energy Revenue": 726.72,
      "Unit Regulation Up Revenue": 0, "Unit Spin Revenue": 0,
      "Unit Production Cost": 159.06, "Unit Fuel Cost": 147.12, "Unit Startup Cost": 0.38,
      "Unit Variable OM Cost": 11.56, "Unit Emissions Cost": 0, "System Curtailment": 436.27,
      "Selection Criteria": 0, "Max EUE Depth": 0, "Max EUE Duration": 43,
      "RPS Generation": -436.27, "Generation": 361269.26, "Start Attempts": 351.5,
      "Capacity Factor": 17.40, "Hours Online": 1524.02,
    },
    "Candidate_Battery_4HR_RestOfSys": {
      "Added Capacity": 400, "Energy Margin": 1482437, "% of Capacity Available in EUE Hours": 0.242,
      "Fixed Cost": 0, "Fixed Carrying Cost": 150000, "Fixed OM Cost": 56180,
      "Profit/Energy Production": -158.21, "Profit/Nameplate MW": -205036.20,
      "LOLE": 27.02, "EUE": 465439.9, "LOLH": 17.34, "Market Price": 686.24,
      "Total Annual System Cost": 30410540000, "Unit Total Revenue": 592974667,
      "Energy Revenue/Generation": 1143.85, "Unit Energy Revenue": 1143.80,
      "Unit Regulation Up Revenue": 0, "Unit Spin Revenue": 0.042,
      "Unit Production Cost": 0, "Unit Fuel Cost": 0, "Unit Startup Cost": 0,
      "Unit Variable OM Cost": 0, "Unit Emissions Cost": 0, "System Curtailment": 436.27,
      "Selection Criteria": 0, "Max EUE Depth": 0, "Max EUE Duration": 43,
      "RPS Generation": -436.27, "Generation": 518404.4, "Start Attempts": 657.02,
      "Capacity Factor": 7.40, "Hours Online": 1296.01,
    },
    "Candidate_Battery_4HR_RestOfSys;Candidate_Solar_W_RestOfSys": {
      "Added Capacity": 600, "Energy Margin": 863602.1, "% of Capacity Available in EUE Hours": 0.1236,
      "Fixed Cost": 0, "Fixed Carrying Cost": 111111.1, "Fixed OM Cost": 37863.33,
      "Profit/Energy Production": -16.99, "Profit/Nameplate MW": -148875.85,
      "LOLE": 27.02, "EUE": 465439.9, "LOLH": 17.34, "Market Price": 686.24,
      "Total Annual System Cost": 30410540000, "Unit Total Revenue": 777241872,
      "Energy Revenue/Generation": 98.58, "Unit Energy Revenue": 98.58,
      "Unit Regulation Up Revenue": 0, "Unit Spin Revenue": 0.004,
      "Unit Production Cost": 0, "Unit Fuel Cost": 0, "Unit Startup Cost": 0,
      "Unit Variable OM Cost": 0, "Unit Emissions Cost": 0, "System Curtailment": 436.27,
      "Selection Criteria": 0, "Max EUE Depth": 0, "Max EUE Duration": 43,
      "RPS Generation": 7884152.93, "Generation": 7884589.20, "Start Attempts": 657.02,
      "Capacity Factor": 15.01, "Hours Online": 2628.36,
    },
    "Candidate_Solar_W_RestOfSys": {
      "Added Capacity": 200, "Energy Margin": 244767.1, "% of Capacity Available in EUE Hours": 0.0052,
      "Fixed Cost": 0, "Fixed Carrying Cost": 72222.22, "Fixed OM Cost": 19546.67,
      "Profit/Energy Production": 24.57, "Profit/Nameplate MW": -92113.13,
      "LOLE": 27.02, "EUE": 465439.9, "LOLH": 17.34, "Market Price": 686.24,
      "Total Annual System Cost": 30410540000, "Unit Total Revenue": 184267205,
      "Energy Revenue/Generation": 55.03, "Unit Energy Revenue": 55.03,
      "Unit Regulation Up Revenue": 0, "Unit Spin Revenue": 0,
      "Unit Production Cost": 0, "Unit Fuel Cost": 0, "Unit Startup Cost": 0,
      "Unit Variable OM Cost": 0, "Unit Emissions Cost": 0, "System Curtailment": 436.27,
      "Selection Criteria": 0, "Max EUE Depth": 0, "Max EUE Duration": 43,
      "RPS Generation": 3348541.87, "Generation": 3348978.14, "Start Attempts": 0,
      "Capacity Factor": 19.12, "Hours Online": 3355.82,
    },
    "Candidate_Wind_W_RestOfSys": {
      "Added Capacity": 350, "Energy Margin": 1056328, "% of Capacity Available in EUE Hours": 0.3254,
      "Fixed Cost": 0, "Fixed Carrying Cost": 85000, "Fixed OM Cost": 12500,
      "Profit/Energy Production": 15.23, "Profit/Nameplate MW": -97943.56,
      "LOLE": 27.02, "EUE": 465439.9, "LOLH": 17.34, "Market Price": 686.24,
      "Total Annual System Cost": 30410540000, "Unit Total Revenue": 432156789,
      "Energy Revenue/Generation": 42.18, "Unit Energy Revenue": 42.18,
      "Unit Regulation Up Revenue": 0, "Unit Spin Revenue": 0,
      "Unit Production Cost": 0, "Unit Fuel Cost": 0, "Unit Startup Cost": 0,
      "Unit Variable OM Cost": 0, "Unit Emissions Cost": 0, "System Curtailment": 436.27,
      "Selection Criteria": 0, "Max EUE Depth": 0, "Max EUE Duration": 43,
      "RPS Generation": 10243876.54, "Generation": 10244312.81, "Start Attempts": 0,
      "Capacity Factor": 33.42, "Hours Online": 5855.26,
    },
  };

  const data: YearlyDataRow[] = [];

  years.forEach((year, yearIdx) => {
    const maxCycles = 24;
    for (let bc = 0; bc < maxCycles; bc++) {
      technologies.forEach((tech, techIdx) => {
        const baseValues = techBaseValues[tech];
        let status = "Rejected";
        if (bc % 4 === techIdx % technologies.length) {
          status = "Selected 1 Units";
        }
        const yearFactor = 1 + (yearIdx * 0.03);
        const cycleFactor = 1 + (bc * 0.015);
        const techVariance = 0.95 + (Math.sin(bc + techIdx) * 0.05);

        const row: YearlyDataRow = { t: tech, b: bc, s: status, y: year };

        metrics.forEach(metric => {
          const baseVal = baseValues[metric.n];
          if (baseVal !== undefined && typeof baseVal === "number") {
            row[metric.n] = Math.round(baseVal * yearFactor * cycleFactor * techVariance * 100) / 100;
          }
        });

        data.push(row);
      });
    }
  });

  return {m: metrics, d: data};
}

export const EP_DATA: YearlyData = generateYearlyData();
