export interface Snippet {
  lang: string;
  code: string;
}

export const snippets: Record<string, Snippet> = {
  'python-ingest': {
    lang: 'Python',
    code: `# ── Weather & AQI Data Ingestion ───────────────────────────
# pip install requests pandas schedule sqlite3

import requests, pandas as pd, sqlite3, schedule, time
from datetime import datetime

API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"   # free at openweathermap.org
LAT, LON = 28.6139, 77.2090              # Delhi coordinates

def fetch_aqi():
    """Fetch AQI + weather from OpenWeatherMap APIs."""
    # Air quality
    aq = requests.get(
        "https://api.openweathermap.org/data/2.5/air_pollution",
        params={"lat": LAT, "lon": LON, "appid": API_KEY}
    ).json()["list"][0]

    # Current weather
    wx = requests.get(
        "https://api.openweathermap.org/data/2.5/weather",
        params={"lat": LAT, "lon": LON, "appid": API_KEY, "units": "metric"}
    ).json()

    return {
        "timestamp":   datetime.now().isoformat(),
        "aqi":         aq["main"]["aqi"],          # 1-5 scale
        "pm25":        aq["components"]["pm2_5"],
        "pm10":        aq["components"]["pm10"],
        "no2":         aq["components"]["no2"],
        "o3":          aq["components"]["o3"],
        "temperature": wx["main"]["temp"],
        "humidity":    wx["main"]["humidity"],
        "wind_speed":  wx["wind"]["speed"] * 3.6,  # m/s → km/h
        "pressure":    wx["main"]["pressure"],
    }

def save_to_db(row):
    conn = sqlite3.connect("weather_aqi.db")
    pd.DataFrame([row]).to_sql("readings", conn, if_exists="append", index=False)
    conn.close()
    print(f"[{row['timestamp']}] AQI={row['aqi']}  PM2.5={row['pm25']:.1f}")

# Run every 30 min
schedule.every(30).minutes.do(lambda: save_to_db(fetch_aqi()))
print("Collector running — Ctrl+C to stop")
while True:
    schedule.run_pending(); time.sleep(60)`
  },

  'python-clean': {
    lang: 'Python',
    code: `# ── Data Cleaning & Preprocessing ──────────────────────────
# pip install pandas numpy

import pandas as pd, numpy as np

df = pd.read_csv("weather_aqi.csv", parse_dates=["timestamp"])
df.set_index("timestamp", inplace=True)
df.sort_index(inplace=True)

print("Shape before cleaning:", df.shape)
print(df.isnull().sum())

# 1. Remove duplicates
df = df[~df.index.duplicated(keep="first")]

# 2. Forward-fill short gaps (≤2 steps), then interpolate
df = df.ffill(limit=2).interpolate(method="time")

# 3. IQR outlier removal for PM2.5
Q1, Q3 = df["pm25"].quantile([0.25, 0.75])
IQR = Q3 - Q1
df = df[(df["pm25"] >= Q1 - 1.5*IQR) & (df["pm25"] <= Q3 + 1.5*IQR)]

# 4. Feature engineering
df["hour"]        = df.index.hour
df["day_of_week"] = df.index.dayofweek
df["month"]       = df.index.month
df["is_weekend"]  = (df["day_of_week"] >= 5).astype(int)
df["is_peak"]     = df["hour"].isin(list(range(7,11)) + list(range(17,21))).astype(int)
df["aqi_category"]= pd.cut(df["aqi"],
    bins=[0,50,100,150,200,300,500],
    labels=["Good","Moderate","Sensitive","Unhealthy","Very Unhealthy","Hazardous"])

# 5. Resample to hourly means
hourly = df.resample("1H").mean(numeric_only=True)

print("Clean shape:", hourly.shape)
hourly.to_csv("weather_aqi_clean.csv")
print("Saved: weather_aqi_clean.csv")`
  },

  'python-eda': {
    lang: 'Python',
    code: `# ── EDA & Visualization ─────────────────────────────────────
# pip install pandas matplotlib seaborn

import pandas as pd, matplotlib.pyplot as plt, seaborn as sns

df = pd.read_csv("weather_aqi_clean.csv", parse_dates=["timestamp"])
df.set_index("timestamp", inplace=True)

sns.set_theme(style="whitegrid", palette="muted", font_scale=1.05)
fig = plt.figure(figsize=(16, 14))
fig.suptitle("Weather & Air Quality — Delhi EDA", fontsize=15, y=1.01)

# 1. AQI time series
ax1 = fig.add_subplot(3, 2, 1)
df["aqi"].resample("1D").mean().plot(ax=ax1, color="#ef4444", lw=1.5)
ax1.set_title("Daily Mean AQI"); ax1.set_ylabel("AQI"); ax1.set_xlabel("")

# 2. PM2.5 time series
ax2 = fig.add_subplot(3, 2, 2)
df["pm25"].resample("1D").mean().plot(ax=ax2, color="#f97316", lw=1.5)
ax2.set_title("Daily Mean PM2.5"); ax2.set_ylabel("µg/m³"); ax2.set_xlabel("")

# 3. Diurnal pattern
ax3 = fig.add_subplot(3, 2, 3)
diurnal = df.groupby("hour")["aqi"].mean()
ax3.fill_between(diurnal.index, diurnal, alpha=.25, color="#ef4444")
ax3.plot(diurnal, color="#ef4444", lw=2, marker="o", markersize=4)
ax3.set_title("Diurnal AQI Pattern"); ax3.set_xlabel("Hour"); ax3.set_ylabel("Mean AQI")
ax3.axvspan(7,10,alpha=.1,color="orange",label="Peak hours")
ax3.axvspan(17,20,alpha=.1,color="orange"); ax3.legend(fontsize=9)

# 4. Correlation heatmap
ax4 = fig.add_subplot(3, 2, 4)
cols = ["aqi","pm25","pm10","temperature","humidity","wind_speed","pressure"]
sns.heatmap(df[cols].corr(), annot=True, fmt=".2f", cmap="coolwarm",
            center=0, ax=ax4, cbar_kws={"shrink":.8})
ax4.set_title("Feature Correlation Matrix")

# 5. AQI distribution
ax5 = fig.add_subplot(3, 2, 5)
df["aqi"].hist(bins=40, ax=ax5, color="#3B8BD4", edgecolor="white")
ax5.axvline(df["aqi"].mean(), color="red", ls="--", label=f'Mean={df["aqi"].mean():.0f}')
ax5.set_title("AQI Distribution"); ax5.legend()

# 6. PM2.5 vs AQI scatter
ax6 = fig.add_subplot(3, 2, 6)
ax6.scatter(df["pm25"], df["aqi"], alpha=.3, s=15, color="#1D9E75")
ax6.set_xlabel("PM2.5 (µg/m³)"); ax6.set_ylabel("AQI")
ax6.set_title(f'PM2.5 vs AQI  (r={df["pm25"].corr(df["aqi"]):.2f})')

plt.tight_layout()
plt.savefig("eda_report.png", dpi=150, bbox_inches="tight")
plt.show()`
  },

  'python-model': {
    lang: 'Python',
    code: `# ── Random Forest AQI Prediction ───────────────────────────
# pip install pandas scikit-learn matplotlib joblib

import pandas as pd, numpy as np, matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler
import joblib

df = pd.read_csv("weather_aqi_clean.csv", parse_dates=["timestamp"])
df["hour"]       = pd.to_datetime(df["timestamp"]).dt.hour
df["dow"]        = pd.to_datetime(df["timestamp"]).dt.dayofweek
df["month"]      = pd.to_datetime(df["timestamp"]).dt.month
df["is_peak"]    = df["hour"].isin(list(range(7,11))+list(range(17,21))).astype(int)
df["pm25_lag1"]  = df["pm25"].shift(1)       # lag feature
df["aqi_roll6"]  = df["aqi"].rolling(6).mean() # rolling mean
df.dropna(inplace=True)

FEATURES = ["pm25","pm10","temperature","humidity","wind_speed",
            "hour","dow","month","is_peak","pm25_lag1","aqi_roll6"]
X, y = df[FEATURES], df["aqi"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, shuffle=False   # time-series split
)

model = RandomForestRegressor(
    n_estimators=300, max_depth=12,
    min_samples_leaf=2, random_state=42, n_jobs=-1
)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

r2   = r2_score(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae  = mean_absolute_error(y_test, y_pred)
print(f"R²={r2:.3f}  RMSE={rmse:.2f}  MAE={mae:.2f}")

# Cross-validation
cv = cross_val_score(model, X, y, cv=5, scoring="r2")
print(f"CV R² = {cv.mean():.3f} ± {cv.std():.3f}")

# Save model
joblib.dump(model, "aqi_rf_model.pkl")

# Feature importance plot
imp = pd.Series(model.feature_importances_, index=FEATURES).sort_values()
imp.plot(kind="barh", color=["#1D9E75" if v>.10 else "#9FE1CB" for v in imp])
plt.title("Feature Importance"); plt.tight_layout(); plt.savefig("feature_importance.png",dpi=150)
plt.show()

# Actual vs Predicted
plt.figure(figsize=(12,4))
plt.plot(y_test.values[:100], label="Actual", color="#3B8BD4")
plt.plot(y_pred[:100], label="Predicted", color="#EF9F27", ls="--")
plt.title("Actual vs Predicted AQI (first 100 test points)")
plt.legend(); plt.tight_layout(); plt.show()`
  },

  'python-xgb': {
    lang: 'Python',
    code: `# ── XGBoost AQI Prediction ──────────────────────────────────
# pip install xgboost scikit-learn pandas matplotlib

import pandas as pd, numpy as np
from xgboost import XGBRegressor, plot_importance
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import r2_score, mean_squared_error
import matplotlib.pyplot as plt

df = pd.read_csv("weather_aqi_clean.csv", parse_dates=["timestamp"])
df["hour"]     = df["timestamp"].dt.hour
df["dow"]      = df["timestamp"].dt.dayofweek
df["month"]    = df["timestamp"].dt.month
df["is_peak"]  = df["hour"].isin(range(7,11)|{17,18,19,20}).astype(int)
df["pm25_lag"] = df["pm25"].shift(1)
df.dropna(inplace=True)

FEATURES = ["pm25","pm10","temperature","humidity","wind_speed",
            "hour","dow","month","is_peak","pm25_lag"]
X, y = df[FEATURES], df["aqi"]
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=.2,shuffle=False)

# Grid search
param_grid = {
    "n_estimators":  [200, 400],
    "max_depth":     [5, 7],
    "learning_rate": [0.05, 0.1],
    "subsample":     [0.8],
}
gs = GridSearchCV(XGBRegressor(random_state=42,n_jobs=-1),
                  param_grid, cv=3, scoring="r2", verbose=1)
gs.fit(X_train, y_train)
best = gs.best_estimator_
print("Best params:", gs.best_params_)

y_pred = best.predict(X_test)
print(f"R²={r2_score(y_test,y_pred):.3f}  RMSE={np.sqrt(mean_squared_error(y_test,y_pred)):.2f}")

plot_importance(best, max_num_features=10)
plt.title("XGBoost Feature Importance"); plt.tight_layout(); plt.show()`
  },

  'sql-create': {
    lang: 'SQL',
    code: `-- ── Create Schema & Insert Readings ────────────────────────

CREATE TABLE IF NOT EXISTS readings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp   TEXT    NOT NULL,
    aqi         REAL,
    pm25        REAL,
    pm10        REAL,
    no2         REAL,
    o3          REAL,
    temperature REAL,
    humidity    REAL,
    wind_speed  REAL,
    pressure    REAL
);

-- Index for fast time-range queries
CREATE INDEX IF NOT EXISTS idx_timestamp ON readings(timestamp);

-- Sample insert
INSERT INTO readings (timestamp, aqi, pm25, pm10, temperature, humidity, wind_speed)
VALUES ('2024-01-15 14:00:00', 168, 88.2, 112.5, 29.4, 62, 14.0);

-- View last 24 hours
SELECT
    timestamp,
    ROUND(aqi, 1)  AS aqi,
    ROUND(pm25, 1) AS pm25,
    CASE
        WHEN aqi < 50  THEN 'Good'
        WHEN aqi < 100 THEN 'Moderate'
        WHEN aqi < 150 THEN 'Sensitive'
        WHEN aqi < 200 THEN 'Unhealthy'
        WHEN aqi < 300 THEN 'Very Unhealthy'
        ELSE                'Hazardous'
    END AS category
FROM readings
WHERE timestamp >= datetime('now', '-24 hours')
ORDER BY timestamp DESC;`
  },

  'sql-query': {
    lang: 'SQL',
    code: `-- ── Advanced SQL — Window Functions & Analytics ─────────────

-- 1. Rolling 6-hour AQI average (moving average)
SELECT
    timestamp,
    aqi,
    ROUND(AVG(aqi) OVER (
        ORDER BY timestamp
        ROWS BETWEEN 5 PRECEDING AND CURRENT ROW
    ), 1) AS aqi_6h_ma,
    ROUND(AVG(pm25) OVER (
        ORDER BY timestamp
        ROWS BETWEEN 5 PRECEDING AND CURRENT ROW
    ), 1) AS pm25_6h_ma
FROM readings
ORDER BY timestamp DESC;

-- 2. Daily ranking — worst AQI hours each day
SELECT
    DATE(timestamp)  AS date,
    STRFTIME('%H', timestamp) AS hour,
    ROUND(aqi, 1)    AS aqi,
    RANK() OVER (
        PARTITION BY DATE(timestamp)
        ORDER BY aqi DESC
    ) AS daily_rank
FROM readings
ORDER BY date DESC, daily_rank;

-- 3. Week-over-week AQI change
SELECT
    DATE(timestamp)    AS date,
    ROUND(AVG(aqi),1)  AS avg_aqi,
    ROUND(AVG(aqi) - LAG(AVG(aqi), 7) OVER (ORDER BY DATE(timestamp)), 1) AS wow_change
FROM readings
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- 4. Peak-hour vs off-peak comparison
SELECT
    CASE
        WHEN CAST(STRFTIME('%H', timestamp) AS INT) BETWEEN 7 AND 10
          OR CAST(STRFTIME('%H', timestamp) AS INT) BETWEEN 17 AND 20
        THEN 'Peak hours'
        ELSE 'Off-peak'
    END                AS period,
    ROUND(AVG(aqi),1)  AS avg_aqi,
    ROUND(AVG(pm25),1) AS avg_pm25,
    COUNT(*)           AS readings
FROM readings
GROUP BY period;`
  },

  'r-arima': {
    lang: 'R',
    code: `# ── ARIMA/SARIMA Time-Series Forecast ───────────────────────
# install.packages(c("forecast","tseries","ggplot2","readr","lubridate"))

library(forecast); library(tseries)
library(ggplot2);  library(readr); library(lubridate)

# Load data
df <- read_csv("weather_aqi_clean.csv") |>
  mutate(timestamp = ymd_hms(timestamp)) |>
  arrange(timestamp)

# Create hourly time series (frequency = 24 for daily seasonality)
ts_aqi <- ts(df$aqi, frequency = 24)

# 1. Stationarity test (ADF)
adf_result <- adf.test(ts_aqi)
cat("ADF p-value:", adf_result$p.value, "\\n")
# p < 0.05 → stationary; otherwise diff once

# 2. Decompose to see trend + seasonality
decomp <- stl(ts_aqi, s.window = "periodic")
autoplot(decomp) + labs(title = "STL Decomposition of AQI")

# 3. Auto-ARIMA (tries all combinations, picks lowest AIC)
model <- auto.arima(
  ts_aqi,
  seasonal      = TRUE,
  stepwise      = FALSE,   # exhaustive search
  approximation = FALSE,
  trace         = FALSE
)
cat("Model:", capture.output(model)[1], "\\n")
print(accuracy(model))

# 4. Forecast next 48 hours
forecast_48h <- forecast(model, h = 48, level = c(80, 95))
autoplot(forecast_48h) +
  labs(title    = "AQI Forecast — Next 48 Hours",
       subtitle = paste("Model:", capture.output(model)[1]),
       x = "Hour", y = "AQI") +
  theme_minimal(base_size = 12)

# 5. Residual diagnostics
checkresiduals(model)  # Ljung-Box test: p > 0.05 = good

# Save forecast
write.csv(as.data.frame(forecast_48h), "forecast_48h.csv")`
  },

  'r-ggplot': {
    lang: 'R',
    code: `# ── ggplot2 AQI Visualizations ──────────────────────────────
# install.packages(c("tidyverse","lubridate","scales"))

library(tidyverse); library(lubridate); library(scales)

df <- read_csv("weather_aqi_clean.csv") |>
  mutate(
    timestamp  = ymd_hms(timestamp),
    hour       = hour(timestamp),
    month_name = month(timestamp, label = TRUE, abbr = TRUE),
    category   = case_when(
      aqi < 50  ~ "Good",        aqi < 100 ~ "Moderate",
      aqi < 150 ~ "Sensitive",   aqi < 200 ~ "Unhealthy",
      TRUE      ~ "Hazardous") |>
      factor(levels=c("Good","Moderate","Sensitive","Unhealthy","Hazardous"))
  )

pal <- c("Good"="#22c55e","Moderate"="#facc15","Sensitive"="#f97316",
         "Unhealthy"="#ef4444","Hazardous"="#9333ea")

# Plot 1: Diurnal ribbon
p1 <- df |> group_by(hour) |>
  summarise(mean=mean(aqi), lo=quantile(aqi,.25), hi=quantile(aqi,.75)) |>
  ggplot(aes(hour, mean)) +
  geom_ribbon(aes(ymin=lo, ymax=hi), fill="#ef4444", alpha=.2) +
  geom_line(color="#ef4444", linewidth=1.3) +
  scale_x_continuous(breaks=seq(0,23,3)) +
  labs(title="Diurnal AQI — Delhi", x="Hour of Day", y="AQI") +
  theme_minimal(base_size=12)

# Plot 2: Monthly boxplot coloured by category
p2 <- df |>
  ggplot(aes(month_name, aqi, fill=category)) +
  geom_boxplot(alpha=.8, outlier.size=1) +
  scale_fill_manual(values=pal) +
  labs(title="Monthly AQI Distribution", x=NULL, y="AQI", fill="Category") +
  theme_minimal(base_size=12)

# Plot 3: PM2.5 vs AQI scatter with smooth
p3 <- df |>
  ggplot(aes(pm25, aqi, color=category)) +
  geom_point(alpha=.3, size=1.5) +
  geom_smooth(method="lm", se=FALSE, color="black", linewidth=1) +
  scale_color_manual(values=pal) +
  labs(title=paste0("PM2.5 vs AQI  (r=",round(cor(df$pm25,df$aqi),2),")"),
       x="PM2.5 (µg/m³)", y="AQI") +
  theme_minimal(base_size=12)

# Save all
ggsave("diurnal.png",      p1, width=10, height=5, dpi=150)
ggsave("monthly_box.png",  p2, width=12, height=6, dpi=150)
ggsave("pm25_scatter.png", p3, width=10, height=6, dpi=150)
print("Plots saved!")`
  },

  'excel-tip': {
    lang: 'Excel / Power Query',
    code: `Excel Power Query — Step-by-Step AQI Analysis
================================================

STEP 1 — Import CSV
  Data → Get Data → From Text/CSV
  Select: weather_aqi_clean.csv
  Change Type: timestamp → Date/Time

STEP 2 — Power Query transformations (Home → Transform Data)
  • Remove duplicates:  Home → Remove Rows → Remove Duplicates
  • Filter nulls:       click AQI column header → filter out null
  • Add Hour column:    Add Column → Date → Hour
  • Add Category col:   Add Column → Custom Column →
        = if [aqi] < 50 then "Good"
          else if [aqi] < 100 then "Moderate"
          else if [aqi] < 150 then "Sensitive"
          else if [aqi] < 200 then "Unhealthy"
          else "Hazardous"

STEP 3 — Pivot Table Analysis
  Insert → PivotTable
  Rows:   month  |  Columns: aqi_category
  Values: Count of readings + Average of aqi

STEP 4 — FORECAST.ETS (built-in AI forecast)
  Put your daily AQI averages in column A (dates) + B (AQI)
  In C2: =FORECAST.ETS(A2, $B$2:$B$100, $A$2:$A$100, 1, 1)
  Drag down to forecast next 7 days

STEP 5 — Conditional Formatting AQI colours
  Select AQI column → Home → Conditional Formatting → Color Scale
  Or use "New Rule" with formula:
    =B2<50    → Green  (#22c55e)
    =B2<100   → Yellow (#facc15)
    =B2<150   → Orange (#f97316)
    =B2<200   → Red    (#ef4444)
    =B2>=200  → Purple (#9333ea)

STEP 6 — Dashboard
  Insert → Charts → Line Chart (AQI over time)
  Insert → Charts → Bar Chart (monthly averages)
  Use GETPIVOTDATA() to pull values into KPI cells
  Slicer on month for interactive filtering`
  }
};
