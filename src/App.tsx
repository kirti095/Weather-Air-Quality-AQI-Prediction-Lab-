import { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { snippets } from './snippets';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'eda' | 'predict' | 'pipeline' | 'code'>('overview');

  // --- Real-Time Simulation State ---
  const [simTemp, setSimTemp] = useState(29.4);
  const [simAqi, setSimAqi] = useState(168);
  const [simHum, setSimHum] = useState(62);
  const [simPm, setSimPm] = useState(88);
  const [simWind, setSimWind] = useState(14);

  // --- Multi-Metric Selection ---
  const [selectedOverviewMetric, setSelectedOverviewMetric] = useState<'aqi' | 'pm' | 'hum' | 'wind' | 'temp'>('aqi');

  // --- Selected Model Prediction ---
  const [selectedModel, setSelectedModel] = useState<string>('Linear Regression');

  // --- Predictor Calculator Inputs ---
  const [calcTemp, setCalcTemp] = useState<number>(29);
  const [calcHum, setCalcHum] = useState<number>(62);
  const [calcWind, setCalcWind] = useState<number>(14);
  const [calcPm, setCalcPm] = useState<number>(88);
  const [calcHour, setCalcHour] = useState<number>(14);
  const [calcSeason, setCalcSeason] = useState<string>('Summer');
  const [predResult, setPredResult] = useState<{ aqi: number; pct: number; category: string; color: string } | null>(null);

  // --- Selected Snippet State ---
  const [selectedSnippetKey, setSelectedSnippetKey] = useState<string>('python-ingest');
  const [copied, setCopied] = useState(false);

  // --- Theme Selection (Forced Light Theme) ---
  const isDark = false;
  const gridColor = 'rgba(0,0,0,0.06)';
  const tickColor = '#6b6b67';

  // --- Live Simulated Updates ---
  useEffect(() => {
    const timer = setInterval(() => {
      const t = Number((29.4 + (Math.random() - 0.5)).toFixed(1));
      const a = Math.round(168 + (Math.random() * 6 - 3));
      const h = Math.round(62 + (Math.random() * 4 - 2));
      const p = Math.round(88 + (Math.random() * 4 - 2));
      const w = Math.round(14 + (Math.random() * 3 - 1.5));
      setSimTemp(t);
      setSimAqi(a);
      setSimHum(h);
      setSimPm(p);
      setSimWind(w);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // --- Chart Setup References ---
  const tempChartRef = useRef<HTMLCanvasElement | null>(null);
  const tempChartInst = useRef<Chart | null>(null);

  const scatterChartRef = useRef<HTMLCanvasElement | null>(null);
  const scatterChartInst = useRef<Chart | null>(null);

  const multiChartRef = useRef<HTMLCanvasElement | null>(null);
  const multiChartInst = useRef<Chart | null>(null);

  const heatChartRef = useRef<HTMLCanvasElement | null>(null);
  const heatChartInst = useRef<Chart | null>(null);

  const boxChartRef = useRef<HTMLCanvasElement | null>(null);
  const boxChartInst = useRef<Chart | null>(null);

  const featureChartRef = useRef<HTMLCanvasElement | null>(null);
  const featureChartInst = useRef<Chart | null>(null);

  const diurnalChartRef = useRef<HTMLCanvasElement | null>(null);
  const diurnalChartInst = useRef<Chart | null>(null);

  const predChartRef = useRef<HTMLCanvasElement | null>(null);
  const predChartInst = useRef<Chart | null>(null);

  // Scatter points (memoized so they don't shift with each re-render)
  const scatterPtsRef = useRef<Array<{ x: number; y: number }>>([]);
  if (scatterPtsRef.current.length === 0) {
    scatterPtsRef.current = Array.from({ length: 45 }, () => ({
      x: Math.round(Math.random() * 200 + 20),
      y: Math.round(Math.random() * 250 + 30),
    }));
  }

  // --- Initializing Overview Charts ---
  useEffect(() => {
    if (activeTab !== 'overview') return;

    // 1. Temp Chart
    const tempCanvas = tempChartRef.current;
    if (tempCanvas) {
      if (tempChartInst.current) {
        tempChartInst.current.destroy();
      }
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        tempChartInst.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
              {
                label: 'Actual',
                data: [27, 29, 31, 28, 30, 32, 29],
                borderColor: '#3B8BD4',
                backgroundColor: 'rgba(59, 139, 212, 0.08)',
                tension: 0.4,
                pointRadius: 4,
                borderWidth: 2,
                fill: true,
              },
              {
                label: 'Predicted',
                data: [null as any, null as any, null as any, null as any, 30.5, 31.8, 29.2],
                borderColor: '#EF9F27',
                backgroundColor: 'rgba(239, 159, 39, 0.08)',
                tension: 0.4,
                pointRadius: 4,
                borderWidth: 2,
                borderDash: [5, 4],
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                grid: { color: gridColor },
                ticks: { color: tickColor },
              },
              y: {
                grid: { color: gridColor },
                ticks: { color: tickColor },
                title: { display: true, text: '•C', color: tickColor },
              },
            },
          },
        });
      }
    }

    // 2. Scatter Chart
    const scatterCanvas = scatterChartRef.current;
    if (scatterCanvas) {
      if (scatterChartInst.current) {
        scatterChartInst.current.destroy();
      }
      const ctx = scatterCanvas.getContext('2d');
      if (ctx) {
        scatterChartInst.current = new Chart(ctx, {
          type: 'scatter',
          data: {
            datasets: [
              {
                label: 'Reading',
                data: scatterPtsRef.current,
                backgroundColor: 'rgba(29, 158, 117, 0.55)',
                pointRadius: 5,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                title: { display: true, text: 'PM2.5 (µg/m•)', color: tickColor },
                grid: { color: gridColor },
                ticks: { color: tickColor },
              },
              y: {
                title: { display: true, text: 'AQI', color: tickColor },
                grid: { color: gridColor },
                ticks: { color: tickColor },
              },
            },
          },
        });
      }
    }

    return () => {
      if (tempChartInst.current) {
        tempChartInst.current.destroy();
        tempChartInst.current = null;
      }
      if (scatterChartInst.current) {
        scatterChartInst.current.destroy();
        scatterChartInst.current = null;
      }
    };
  }, [activeTab, isDark, gridColor, tickColor]);

  // --- Initializing Multi Metric Chart ---
  const multiData = {
    aqi: [120, 135, 142, 158, 168, 175, 170, 165, 155, 148, 160, 175, 180, 168, 155, 145, 138, 130, 125, 120, 115, 110, 108, 112],
    pm: [60, 68, 74, 82, 88, 93, 90, 85, 80, 75, 82, 90, 95, 88, 82, 76, 70, 66, 64, 60, 58, 55, 54, 57],
    hum: [58, 60, 62, 63, 62, 61, 60, 60, 61, 62, 63, 62, 60, 59, 60, 61, 63, 64, 64, 63, 62, 61, 60, 59],
    wind: [18, 16, 14, 13, 14, 12, 11, 12, 13, 14, 15, 14, 12, 11, 10, 11, 12, 13, 14, 15, 16, 17, 18, 18],
    temp: [24, 23, 23, 24, 25, 27, 28, 29, 30, 31, 31, 32, 31, 30, 30, 29, 28, 27, 26, 26, 25, 25, 24, 24],
  };

  const multiColors = {
    aqi: '#ef4444',
    pm: '#f97316',
    hum: '#3B8BD4',
    wind: '#8B5CF6',
    temp: '#EF9F27',
  };

  useEffect(() => {
    if (activeTab !== 'overview') return;

    const multiCanvas = multiChartRef.current;
    if (multiCanvas) {
      if (multiChartInst.current) {
        multiChartInst.current.destroy();
      }
      const ctx = multiCanvas.getContext('2d');
      if (ctx) {
        const hex = multiColors[selectedOverviewMetric];
        // Parse hex to rgba
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const background = `rgba(${r}, ${g}, ${b}, 0.08)`;

        const hours24 = Array.from({ length: 24 }, (_, i) => i + ':00');

        multiChartInst.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: hours24,
            datasets: [
              {
                data: multiData[selectedOverviewMetric],
                borderColor: hex,
                backgroundColor: background,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                ticks: { autoSkip: true, maxTicksLimit: 8, color: tickColor },
                grid: { color: gridColor },
              },
              y: {
                grid: { color: gridColor },
                ticks: { color: tickColor },
              },
            },
          },
        });
      }
    }

    return () => {
      if (multiChartInst.current) {
        multiChartInst.current.destroy();
        multiChartInst.current = null;
      }
    };
  }, [activeTab, selectedOverviewMetric, isDark, gridColor, tickColor]);

  // --- Initializing EDA Tab Charts ---
  useEffect(() => {
    if (activeTab !== 'eda') return;

    // 1. Correlation Heatmap Chart
    const heatCanvas = heatChartRef.current;
    if (heatCanvas) {
      if (heatChartInst.current) {
        heatChartInst.current.destroy();
      }
      const ctx = heatCanvas.getContext('2d');
      if (ctx) {
        const featNames = ['Temp', 'Humidity', 'PM2.5', 'Wind', 'Pressure'];
        const corrMatrix = [
          [1, 0.12, 0.45, -0.22, 0.08],
          [0.12, 1, 0.38, -0.15, 0.04],
          [0.45, 0.38, 1, -0.34, 0.11],
          [-0.22, -0.15, -0.34, 1, -0.06],
          [0.08, 0.04, 0.11, -0.06, 1],
        ];
        const heatPts: Array<{ x: number; y: number; v: number }> = [];
        corrMatrix.forEach((row, i) =>
          row.forEach((v, j) => heatPts.push({ x: j, y: i, v }))
        );

        heatChartInst.current = new Chart(ctx, {
          type: 'scatter',
          data: {
            datasets: [
              {
                data: heatPts as any,
                backgroundColor(context) {
                  const raw = context.raw as { v: number };
                  if (!raw) return 'rgba(0,0,0,0.1)';
                  const v = raw.v;
                  const a = Math.abs(v);
                  return v >= 0
                    ? `rgba(29, 158, 117, ${a * 0.8 + 0.1})`
                    : `rgba(239, 68, 68, ${a * 0.8 + 0.1})`;
                },
                pointStyle: 'rect',
                pointRadius: 22,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (c) => {
                    const raw = c.raw as { v: number };
                    return `r = ${raw.v.toFixed(2)}`;
                  },
                },
              },
            },
            scales: {
              x: {
                min: -0.5,
                max: 4.5,
                ticks: {
                  callback: (v) => featNames[v as number] ?? '',
                  color: tickColor,
                },
                grid: { display: false },
              },
              y: {
                min: -0.5,
                max: 4.5,
                ticks: {
                  callback: (v) => featNames[Math.round(v as number)] ?? '',
                  color: tickColor,
                },
                grid: { display: false },
              },
            },
          },
        });
      }
    }

    // 2. Monthly Box Chart
    const boxCanvas = boxChartRef.current;
    if (boxCanvas) {
      if (boxChartInst.current) {
        boxChartInst.current.destroy();
      }
      const ctx = boxCanvas.getContext('2d');
      if (ctx) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const aqiMeans = [195, 188, 175, 160, 165, 170, 145, 138, 152, 172, 185, 200];
        const aqiSD = [40, 38, 35, 30, 32, 35, 28, 25, 30, 35, 38, 42];

        boxChartInst.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: months,
            datasets: [
              {
                label: 'Mean AQI',
                data: aqiMeans,
                backgroundColor: 'rgba(59, 139, 212, 0.65)',
                borderColor: '#3B8BD4',
                borderWidth: 1,
              },
              {
                label: '±SD',
                data: aqiSD,
                backgroundColor: 'rgba(239, 159, 39, 0.45)',
                borderColor: '#EF9F27',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                grid: { color: gridColor },
                ticks: { color: tickColor },
              },
              y: {
                grid: { color: gridColor },
                ticks: { color: tickColor },
                title: { display: true, text: 'AQI', color: tickColor },
              },
            },
          },
        });
      }
    }

    // 3. Feature Importance Chart
    const featureCanvas = featureChartRef.current;
    if (featureCanvas) {
      if (featureChartInst.current) {
        featureChartInst.current.destroy();
      }
      const ctx = featureCanvas.getContext('2d');
      if (ctx) {
        const featImportance = ['PM2.5', 'PM10', 'Hour of Day', 'Temperature', 'NO•', 'O•', 'Humidity', 'Wind Speed'];
        const importVals = [0.31, 0.22, 0.14, 0.10, 0.09, 0.07, 0.05, 0.02];

        featureChartInst.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: featImportance,
            datasets: [
              {
                data: importVals,
                backgroundColor: importVals.map((v) => (v > 0.1 ? '#1D9E75' : '#9FE1CB')),
                borderRadius: 4,
              },
            ],
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                max: 0.35,
                grid: { color: gridColor },
                ticks: {
                  color: tickColor,
                  callback: (v) => (Number(v) * 100).toFixed(0) + '%',
                },
              },
              y: {
                grid: { display: false },
                ticks: { color: tickColor },
              },
            },
          },
        });
      }
    }

    // 4. Diurnal Chart
    const diurnalCanvas = diurnalChartRef.current;
    if (diurnalCanvas) {
      if (diurnalChartInst.current) {
        diurnalChartInst.current.destroy();
      }
      const ctx = diurnalCanvas.getContext('2d');
      if (ctx) {
        const diurnalAQI = [108, 105, 102, 100, 105, 118, 142, 165, 170, 162, 155, 158, 162, 168, 165, 158, 170, 178, 172, 158, 148, 138, 128, 118];
        diurnalChartInst.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: Array.from({ length: 24 }, (_, i) => i + 'h'),
            datasets: [
              {
                data: diurnalAQI,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.45,
                pointRadius: 2,
                borderWidth: 2.5,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                grid: { color: gridColor },
                ticks: { autoSkip: false, maxRotation: 0, color: tickColor },
              },
              y: {
                grid: { color: gridColor },
                ticks: { color: tickColor },
                title: { display: true, text: 'AQI', color: tickColor },
              },
            },
          },
        });
      }
    }

    return () => {
      if (heatChartInst.current) {
        heatChartInst.current.destroy();
        heatChartInst.current = null;
      }
      if (boxChartInst.current) {
        boxChartInst.current.destroy();
        boxChartInst.current = null;
      }
      if (featureChartInst.current) {
        featureChartInst.current.destroy();
        featureChartInst.current = null;
      }
      if (diurnalChartInst.current) {
        diurnalChartInst.current.destroy();
        diurnalChartInst.current = null;
      }
    };
  }, [activeTab, isDark, gridColor, tickColor]);

  // --- Initializing ML Prediction Tab Charts ---
  useEffect(() => {
    if (activeTab !== 'predict') return;

    const predCanvas = predChartRef.current;
    if (predCanvas) {
      if (predChartInst.current) {
        predChartInst.current.destroy();
      }
      const ctx = predCanvas.getContext('2d');
      if (ctx) {
        predChartInst.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: Array.from({ length: 10 }, (_, i) => `t-${9 - i}`),
            datasets: [
              {
                label: 'Actual',
                data: [145, 162, 178, 155, 140, 168, 182, 170, 155, 160],
                borderColor: '#3B8BD4',
                tension: 0.3,
                pointRadius: 4,
                borderWidth: 2,
              },
              {
                label: 'Predicted',
                data: [148, 158, 175, 159, 143, 165, 179, 172, 152, 163],
                borderColor: '#EF9F27',
                tension: 0.3,
                pointRadius: 4,
                borderWidth: 2,
                borderDash: [5, 4],
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                grid: { color: gridColor },
                ticks: { color: tickColor },
              },
              y: {
                grid: { color: gridColor },
                ticks: { color: tickColor },
              },
            },
          },
        });
      }
    }

    return () => {
      if (predChartInst.current) {
        predChartInst.current.destroy();
        predChartInst.current = null;
      }
    };
  }, [activeTab, isDark, gridColor, tickColor]);

  // Model Metrics Dataset
  const modelMetricsData: Record<string, Array<{ m: string; v: string; pct: number }>> = {
    'Linear Regression': [
      { m: 'R•', v: '0.78', pct: 78 },
      { m: 'RMSE', v: '18.4', pct: 52 },
      { m: 'MAE', v: '13.2', pct: 55 },
      { m: 'MAPE', v: '8.6%', pct: 60 },
    ],
    'Random Forest': [
      { m: 'R•', v: '0.91', pct: 91 },
      { m: 'RMSE', v: '11.2', pct: 75 },
      { m: 'MAE', v: '8.1', pct: 78 },
      { m: 'MAPE', v: '5.3%', pct: 82 },
    ],
    'XGBoost': [
      { m: 'R•', v: '0.93', pct: 93 },
      { m: 'RMSE', v: '9.8', pct: 82 },
      { m: 'MAE', v: '7.2', pct: 84 },
      { m: 'MAPE', v: '4.8%', pct: 86 },
    ],
    'LSTM (R/Keras)': [
      { m: 'R•', v: '0.89', pct: 89 },
      { m: 'RMSE', v: '12.1', pct: 70 },
      { m: 'MAE', v: '9.0', pct: 74 },
      { m: 'MAPE', v: '5.9%', pct: 78 },
    ],
    'ARIMA (R)': [
      { m: 'R•', v: '0.75', pct: 75 },
      { m: 'RMSE', v: '20.1', pct: 40 },
      { m: 'MAE', v: '15.4', pct: 42 },
      { m: 'MAPE', v: '10.2%', pct: 45 },
    ],
  };

  // Run Calculator Prediction
  const handleRunPredict = () => {
    const isPeak = (calcHour >= 7 && calcHour <= 10) || (calcHour >= 17 && calcHour <= 20) ? 1.12 : 0.93;
    const aqi = Math.min(350, Math.max(20, Math.round((calcPm * 1.85 + calcTemp * 0.4 - calcWind * 0.8 + calcHum * 0.15) * isPeak)));
    const pct = Math.min(100, Math.round((aqi / 350) * 100));

    interface CategorySpec {
      limit: number;
      label: string;
      color: string;
    }

    const categories: CategorySpec[] = [
      { limit: 50, label: 'Good ••', color: '#22c55e' },
      { limit: 100, label: 'Moderate ••', color: '#a3e635' },
      { limit: 150, label: 'Unhealthy for Sensitive Groups ••', color: '#facc15' },
      { limit: 200, label: 'Unhealthy ••', color: '#f97316' },
      { limit: 300, label: 'Very Unhealthy ••', color: '#ef4444' },
      { limit: 999, label: 'Hazardous ••', color: '#9333ea' },
    ];

    const matchedCat = categories.find((c) => aqi < c.limit) || categories[categories.length - 1];

    setPredResult({
      aqi,
      pct,
      category: matchedCat.label,
      color: matchedCat.color,
    });
  };

  // Copy Snippet Code to Clipboard
  const handleCopyCode = () => {
    const snippetCode = snippets[selectedSnippetKey]?.code || '';
    navigator.clipboard.writeText(snippetCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="header" id="header-root">
        <div>
          <h1 className="font-sans">🌤️ Weather &amp; Air Quality Prediction Lab</h1>
          <p>DATA Analytics &nbsp;·&nbsp; Python &nbsp;·&nbsp; R &nbsp;·&nbsp; SQL &nbsp;·&nbsp; Excel &nbsp;·&nbsp; Matplotlib &nbsp;·&nbsp; Pandas</p>
        </div>
        <div className="badges">
          <span className="badge">
            <span className="dot"></span>&nbsp;Live simulation
          </span>
          <span className="badge">📍 Delhi, IN</span>
        </div>
      </header>

      {/* NAVIGATION NAV BAR */}
      <nav className="nav" id="nav-tabs">
        <button
          id="btn-overview"
          className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          id="btn-eda"
          className={`nav-btn ${activeTab === 'eda' ? 'active' : ''}`}
          onClick={() => setActiveTab('eda')}
        >
          🔍 EDA &amp; Visualization
        </button>
        <button
          id="btn-predict"
          className={`nav-btn ${activeTab === 'predict' ? 'active' : ''}`}
          onClick={() => setActiveTab('predict')}
        >
          🤖 ML Prediction
        </button>
        <button
          id="btn-pipeline"
          className={`nav-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('pipeline')}
        >
          ⚙️ Data Pipeline
        </button>
        <button
          id="btn-code"
          className={`nav-btn ${activeTab === 'code' ? 'active' : ''}`}
          onClick={() => setActiveTab('code')}
        >
          💻 Code Snippets
        </button>
      </nav>

      {/* CONTENT REGION CONTAINER */}
      <main className="content flex-grow">
        {/* ============ OVERVIEW PANEL ============ */}
        <section className={`panel ${activeTab === 'overview' ? 'active' : ''}`} id="panel-overview">
          {/* STAT CARDS ROW */}
          <div className="stats-row">
            <div className="stat-card" id="card-temp">
              <div className="stat-label">Temperature</div>
              <div className="stat-value">{simTemp}</div>
              <div className="stat-unit">°C</div>
              <div className="stat-trend up">↑ 2.1° from yesterday</div>
            </div>
            <div className="stat-card" id="card-aqi">
              <div className="stat-label">AQI Index</div>
              <div className="stat-value">{simAqi}</div>
              <div className="stat-unit">Unhealthy</div>
              <div className="stat-trend up">↑ 23 pts from 6am</div>
            </div>
            <div className="stat-card" id="card-humidity">
              <div className="stat-label">Humidity</div>
              <div className="stat-value">{simHum}</div>
              <div className="stat-unit">%</div>
              <div className="stat-trend neu">→ Stable</div>
            </div>
            <div className="stat-card" id="card-pm25">
              <div className="stat-label">PM2.5</div>
              <div className="stat-value">{simPm}</div>
              <div className="stat-unit">µg/m³</div>
              <div className="stat-trend up">↑ High</div>
            </div>
            <div className="stat-card" id="card-wind">
              <div className="stat-label">Wind Speed</div>
              <div className="stat-value">{simWind}</div>
              <div className="stat-unit">km/h</div>
              <div className="stat-trend down">↓ Decreasing</div>
            </div>
            <div className="stat-card" id="card-pressure">
              <div className="stat-label">Pressure</div>
              <div className="stat-value">1013</div>
              <div className="stat-unit">hPa</div>
              <div className="stat-trend neu">→ Stable</div>
            </div>
          </div>

          {/* REALTIME AQI CURRENT SECTION */}
          <div className="aqi-section" id="section-aqi-scale">
            <div className="chart-title">AQI Scale — Current Reading</div>
            <div className="aqi-bar">
              <div className="aqi-seg" style={{ background: '#22c55e' }}></div>
              <div className="aqi-seg" style={{ background: '#a3e635' }}></div>
              <div className="aqi-seg" style={{ background: '#facc15' }}></div>
              <div className="aqi-seg" style={{ background: '#f97316' }}></div>
              <div className="aqi-seg" style={{ background: '#ef4444' }}></div>
              <div className="aqi-seg" style={{ background: '#9333ea' }}></div>
            </div>
            <div className="aqi-labels">
              <span>0 — Good</span>
              <span>50</span>
              <span>100 — Moderate</span>
              <span>150</span>
              <span>200 — Unhealthy</span>
              <span>300+</span>
            </div>
            <div className="aqi-current">
              Current AQI:{' '}
              <strong style={{ color: '#ef4444' }}>
                {simAqi} — Unhealthy
              </strong>
              . Sensitive groups should avoid outdoor activity.
            </div>
          </div>

          {/* TWO COLUMN GRAPH MATCH */}
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-title">7-Day Temperature Forecast</div>
              <div className="chart-sub">Historical (blue) vs Predicted (orange) · Linear Regression baseline</div>
              <div className="legend">
                <span>
                  <span className="leg-dot block" style={{ background: '#3B8BD4' }}></span>Actual
                </span>
                <span>
                  <span className="leg-dot block" style={{ border: '2px dashed #EF9F27', background: 'transparent' }}></span>Predicted
                </span>
              </div>
              <div className="chart-wrap h-[200px]">
                <canvas ref={tempChartRef}></canvas>
              </div>
            </div>
            <div className="chart-card">
              <div className="chart-title">PM2.5 vs AQI Correlation</div>
              <div className="chart-sub">Scatter plot · Pearson r = 0.94 · Strong positive correlation</div>
              <div className="chart-wrap h-[220px]">
                <canvas ref={scatterChartRef}></canvas>
              </div>
            </div>
          </div>

          {/* MULTI TIME SERIES GRAPH */}
          <div className="chart-card mb-4" id="card-multi-series">
            <div className="chart-title">24-Hour Multi-Metric Time Series</div>
            <div className="chart-sub">Pandas + Matplotlib pipeline output</div>
            <div className="ctrl-row">
              <span className="ctrl-label">Show metric:</span>
              <select
                id="metricSel"
                value={selectedOverviewMetric}
                onChange={(e) => setSelectedOverviewMetric(e.target.value as any)}
              >
                <option value="aqi">AQI</option>
                <option value="pm">PM2.5 (µg/m³)</option>
                <option value="hum">Humidity (%)</option>
                <option value="wind">Wind Speed (km/h)</option>
                <option value="temp">Temperature (°C)</option>
              </select>
            </div>
            <div className="chart-wrap h-[200px]">
              <canvas ref={multiChartRef}></canvas>
            </div>
          </div>
        </section>

        {/* ============ EDA & VISUALIZATION PANEL ============ */}
        <section className={`panel ${activeTab === 'eda' ? 'active' : ''}`} id="panel-eda">
          <div className="section-title">Exploratory Data Analysis</div>
          <div className="corr-grid">
            <div className="chart-card">
              <div className="chart-title">Feature Correlation Heatmap</div>
              <div className="chart-sub">Pearson correlation coefficients between sensor variables</div>
              <div className="chart-wrap h-[260px]">
                <canvas ref={heatChartRef}></canvas>
              </div>
            </div>
            <div className="chart-card">
              <div className="chart-title">Monthly AQI Distribution</div>
              <div className="chart-sub">Mean AQI per month (bar) with ±1 SD range (line)</div>
              <div className="chart-wrap h-[260px]">
                <canvas ref={boxChartRef}></canvas>
              </div>
            </div>
          </div>
          <div className="chart-card mb-4">
            <div className="chart-title">Feature Importance — Random Forest</div>
            <div className="chart-sub">Top predictors for AQI · scikit-learn feature_importances_ · Higher = more predictive</div>
            <div className="legend">
              <span>
                <span className="leg-dot block" style={{ background: '#1D9E75' }}></span>High importance (&gt;10%)
              </span>
              <span>
                <span className="leg-dot block" style={{ background: '#9FE1CB' }}></span>Moderate
              </span>
            </div>
            <div className="chart-wrap h-[240px]">
              <canvas ref={featureChartRef}></canvas>
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-title">Diurnal AQI Pattern (Hour of Day)</div>
            <div className="chart-sub">Average AQI by hour · Peak hours: 7–10am and 5–8pm (traffic emissions)</div>
            <div className="chart-wrap h-[200px]">
              <canvas ref={diurnalChartRef}></canvas>
            </div>
          </div>
        </section>

        {/* ============ ML PREDICTION PANEL ============ */}
        <section className={`panel ${activeTab === 'predict' ? 'active' : ''}`} id="panel-predict">
          <div className="section-title">Select ML Model</div>
          <div className="model-chips">
            {Object.keys(modelMetricsData).map((modelName) => (
              <button
                key={modelName}
                className={`chip ${selectedModel === modelName ? 'selected' : ''}`}
                onClick={() => setSelectedModel(modelName)}
              >
                {modelName}
              </button>
            ))}
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-title">Model Performance Metrics</div>
              <div className="chart-sub">Cross-validated · 5-fold · Test set evaluation</div>
              <table className="metric-table" id="metricsTable">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Score</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {(modelMetricsData[selectedModel] || []).map((row) => {
                    const barColor = row.pct > 80 ? '#1D9E75' : row.pct > 60 ? '#EF9F27' : '#ef4444';
                    return (
                      <tr key={row.m}>
                        <td>{row.m}</td>
                        <td className="font-semibold">{row.v}</td>
                        <td>
                          <div className="bar-cell">
                            <div className="mini-bar">
                              <div className="mini-fill" style={{ width: `${row.pct}%`, background: barColor }}></div>
                            </div>
                            <span className="text-[11px] text-[var(--text3)]">{row.pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="chart-card">
              <div className="chart-title">Actual vs Predicted AQI</div>
              <div className="chart-sub">
                Test set · <span id="model-name-sub">{selectedModel}</span>
              </div>
              <div className="chart-wrap h-[220px]">
                <canvas ref={predChartRef}></canvas>
              </div>
            </div>
          </div>

          <div className="chart-card mt-4">
            <div className="chart-title">Live AQI Predictor</div>
            <div className="chart-sub">Enter current sensor readings → get next-hour AQI prediction</div>
            <div className="mt-[14px]">
              <div className="predict-form">
                <div className="form-group">
                  <label htmlFor="tempInput">Temperature (°C)</label>
                  <input
                    id="tempInput"
                    type="number"
                    value={calcTemp}
                    onChange={(e) => setCalcTemp(e.target.value === '' ? 0 : Number(e.target.value))}
                    min="0"
                    max="50"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="humInput">Humidity (%)</label>
                  <input
                    id="humInput"
                    type="number"
                    value={calcHum}
                    onChange={(e) => setCalcHum(e.target.value === '' ? 0 : Number(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="windInput">Wind Speed (km/h)</label>
                  <input
                    id="windInput"
                    type="number"
                    value={calcWind}
                    onChange={(e) => setCalcWind(e.target.value === '' ? 0 : Number(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pmInput">PM2.5 (µg/m³)</label>
                  <input
                    id="pmInput"
                    type="number"
                    value={calcPm}
                    onChange={(e) => setCalcPm(e.target.value === '' ? 0 : Number(e.target.value))}
                    min="0"
                    max="500"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="hourInput">Hour of Day (0–23)</label>
                  <input
                    id="hourInput"
                    type="number"
                    value={calcHour}
                    onChange={(e) => setCalcHour(e.target.value === '' ? 0 : Number(e.target.value))}
                    min="0"
                    max="23"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="seasonInput">Season</label>
                  <select id="seasonInput" value={calcSeason} onChange={(e) => setCalcSeason(e.target.value)}>
                    <option value="Winter">Winter</option>
                    <option value="Summer">Summer</option>
                    <option value="Monsoon">Monsoon</option>
                    <option value="Post-monsoon">Post-monsoon</option>
                  </select>
                </div>
                <button className="predict-btn hover:opacity-85" onClick={handleRunPredict}>
                  ▶ Run Prediction
                </button>
              </div>

              {predResult && (
                <div className="predict-result block" id="pred-result-card">
                  <div className="pred-label">Predicted AQI — Next Hour</div>
                  <div className="pred-value" style={{ color: predResult.color }}>
                    {predResult.aqi}
                  </div>
                  <div className="pred-conf">
                    95% confidence interval: {predResult.aqi - Math.round(predResult.aqi * 0.08)} –{' '}
                    {predResult.aqi + Math.round(predResult.aqi * 0.08)} AQI
                  </div>
                  <div className="pred-bar">
                    <div
                      className="pred-fill"
                      style={{ width: `${predResult.pct}%`, background: predResult.color }}
                    ></div>
                  </div>
                  <div className="pred-scale">
                    <span>0 — Good</span>
                    <span>100 — Moderate</span>
                    <span>200 — Unhealthy</span>
                    <span>300+</span>
                  </div>
                  <div className="mt-2.5 text-[14px] font-[600]" style={{ color: predResult.color }}>
                    Category: {predResult.category}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ============ PIPELINE PANEL ============ */}
        <section className={`panel ${activeTab === 'pipeline' ? 'active' : ''}`} id="panel-pipeline">
          <div className="section-title">End-to-End Analytics Pipeline</div>
          <div className="pipeline">
            <div className="pipe-step">
              <div className="pipe-box active">
                <div className="step-num">01</div>
                <div className="step-name">Data Ingestion</div>
                <div className="step-tool">Python · SQL</div>
              </div>
            </div>
            <div className="pipe-arrow"></div>
            <div className="pipe-step">
              <div className="pipe-box">
                <div className="step-num">02</div>
                <div className="step-name">Cleaning &amp; Wrangling</div>
                <div className="step-tool">Pandas · R dplyr</div>
              </div>
            </div>
            <div className="pipe-arrow"></div>
            <div className="pipe-step">
              <div className="pipe-box">
                <div className="step-num">03</div>
                <div className="step-name">EDA</div>
                <div className="step-tool">Matplotlib · ggplot2</div>
              </div>
            </div>
            <div className="pipe-arrow"></div>
            <div className="pipe-step">
              <div className="pipe-box">
                <div className="step-num">04</div>
                <div className="step-name">Feature Engineering</div>
                <div className="step-tool">Pandas · Excel</div>
              </div>
            </div>
            <div className="pipe-arrow"></div>
            <div className="pipe-step">
              <div className="pipe-box">
                <div className="step-num">05</div>
                <div className="step-name">Model Training</div>
                <div className="step-tool">scikit-learn · R</div>
              </div>
            </div>
            <div className="pipe-arrow"></div>
            <div className="pipe-step">
              <div className="pipe-box">
                <div className="step-num">06</div>
                <div className="step-name">Evaluation</div>
                <div className="step-tool">RMSE · R² · MAE</div>
              </div>
            </div>
            <div className="pipe-arrow"></div>
            <div className="pipe-step">
              <div className="pipe-box">
                <div className="step-num">07</div>
                <div className="step-name">Dashboard</div>
                <div className="step-tool">Tableau · Power BI</div>
              </div>
            </div>
          </div>

          <div className="section-title">Tools &amp; Technologies</div>
          <div className="tools-grid">
            <div className="tool-card">
              <div className="tool-icon bg-[#E6F1FB]">🌐</div>
              <div className="tool-name">Data Collection</div>
              <div className="tool-desc">
                OpenWeatherMap API, CPCB AQI feeds, Kaggle datasets. Automate ingestion with Python requests + schedule.
              </div>
              <div className="tool-tags">
                <span className="tag">Python</span>
                <span className="tag">SQL</span>
                <span className="tag">REST API</span>
                <span className="tag">cron</span>
              </div>
            </div>
            <div className="tool-card">
              <div className="tool-icon bg-[#EAF3DE]">🐼</div>
              <div className="tool-name">Pandas Wrangling</div>
              <div className="tool-desc">
                Handle missing sensor data, detect outliers with IQR, resample to hourly/daily averages with groupby.
              </div>
              <div className="tool-tags">
                <span class="tag">Pandas</span>
                <span class="tag">NumPy</span>
                <span class="tag">datetime</span>
              </div>
            </div>
            <div className="tool-card">
              <div className="tool-icon bg-[#FAEEDA]">📊</div>
              <div className="tool-name">Matplotlib / Seaborn</div>
              <div className="tool-desc">
                Time-series plots, heatmaps, distribution charts, seasonal decomposition, pair plots.
              </div>
              <div className="tool-tags">
                <span class="tag">Matplotlib</span>
                <span class="tag">Seaborn</span>
                <span class="tag">Plotly</span>
              </div>
            </div>
            <div className="tool-card">
              <div className="tool-icon bg-[#FCEBEB]">🗄️</div>
              <div className="tool-name">SQL Queries</div>
              <div className="tool-desc">
                Store readings in SQLite/PostgreSQL. Window functions for rolling averages, rankings, lag features.
              </div>
              <div className="tool-tags">
                <span class="tag">SQL</span>
                <span class="tag">SQLite</span>
                <span class="tag">PostgreSQL</span>
              </div>
            </div>
            <div className="tool-card">
              <div className="tool-icon bg-[#EEEDFE]">🤖</div>
              <div className="tool-name">scikit-learn</div>
              <div className="tool-desc">
                Linear Regression, Random Forest, Gradient Boosting. Pipeline API, cross-validation, GridSearchCV.
              </div>
              <div className="tool-tags">
                <span class="tag">scikit-learn</span>
                <span class="tag">XGBoost</span>
                <span class="tag">Joblib</span>
              </div>
            </div>
            <div className="tool-card">
              <div className="tool-icon bg-[#E1F5EE]">📈</div>
              <div className="tool-name">R Analysis</div>
              <div className="tool-desc">
                ARIMA/SARIMA forecasting, ggplot2 visualizations, tidyverse wrangling, LSTM via Keras R.
              </div>
              <div className="tool-tags">
                <span class="tag">R</span>
                <span class="tag">ggplot2</span>
                <span class="tag">forecast</span>
                <span class="tag">ARIMA</span>
              </div>
            </div>
            <div className="tool-card">
              <div className="tool-icon bg-[#FAECE7]">🔭</div>
              <div className="tool-name">Tableau / Power BI</div>
              <div className="tool-desc">
                Connect live data, build geo maps of AQI, KPI cards, auto-refresh dashboards, DAX measures.
              </div>
              <div className="tool-tags">
                <span class="tag">Tableau</span>
                <span class="tag">Power BI</span>
                <span class="tag">DAX</span>
              </div>
            </div>
            <div className="tool-card">
              <div className="tool-icon bg-[#EAF3DE]">📋</div>
              <div className="tool-name">Excel</div>
              <div className="tool-desc">
                Pivot tables, FORECAST.ETS, conditional formatting for AQI bands, Power Query for ETL pipelines.
              </div>
              <div className="tool-tags">
                <span class="tag">Excel</span>
                <span class="tag">Power Query</span>
                <span class="tag">VBA</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CODE PANEL ============ */}
        <section className={`panel ${activeTab === 'code' ? 'active' : ''}`} id="panel-code">
          <div className="section-title">Starter Code Snippets — Copy &amp; Run</div>
          <div className="ctrl-row animate-fade-in">
            <span className="ctrl-label">Select snippet:</span>
            <select
              id="langSel"
              value={selectedSnippetKey}
              onChange={(e) => setSelectedSnippetKey(e.target.value)}
            >
              <option value="python-ingest">Python — API Data Ingestion</option>
              <option value="python-clean">Python — Data Cleaning (Pandas)</option>
              <option value="python-eda">Python — EDA &amp; Matplotlib Plots</option>
              <option value="python-model">Python — Random Forest Model</option>
              <option value="python-xgb">Python — XGBoost Model</option>
              <option value="sql-create">SQL — Create &amp; Insert Schema</option>
              <option value="sql-query">SQL — Window &amp; Aggregate Queries</option>
              <option value="r-arima">R — ARIMA Forecast</option>
              <option value="r-ggplot">R — ggplot2 Visualization</option>
              <option value="excel-tip">Excel — Power Query Steps</option>
            </select>
          </div>
          <div className="chart-card">
            <div className="code-header">
              <span className="code-lang" id="code-lang-label">
                {snippets[selectedSnippetKey]?.lang || 'Python'}
              </span>
              <button
                className="copy-btn cursor-pointer"
                onClick={handleCopyCode}
                id="copy-btn-el"
                style={{ color: copied ? '#22c55e' : '' }}
              >
                {copied ? '✓ Copied!' : '📋 Copy Code'}
              </button>
            </div>
            <div className="code-block" id="code-display">
              {snippets[selectedSnippetKey]?.code || ''}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
