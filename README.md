# 🌦️ Weather & Air Quality (AQI) Prediction Lab

An end-to-end **Weather & Air Quality Analytics and Prediction System** built using **Python, SQL, Machine Learning, and BI visualization tools**.

The project analyzes weather and air-quality data collected from APIs, identifies environmental patterns and pollution trends, and applies machine learning models to **predict Air Quality Index (AQI)** based on relevant environmental factors.

---

## 📌 Project Overview

Air quality is strongly influenced by environmental and weather conditions such as temperature, humidity, wind speed, pressure, and other atmospheric factors.

The objective of this project is to build a complete analytical pipeline that transforms raw weather and air-quality data into:

* 🌦️ Weather insights
* 🌫️ Pollution trend analysis
* 📊 AQI patterns and correlations
* 🤖 AQI predictions using Machine Learning
* 📈 Interactive analytical dashboards
* 💡 Data-driven environmental insights

---

## 🔄 End-to-End Data Pipeline

```text
             Data Sources / APIs
                     │
                     ▼
            Data Collection
                     │
                     ▼
            SQL Data Storage
                     │
                     ▼
          Data Cleaning & Processing
                     │
                     ▼
          Exploratory Data Analysis
                     │
                     ▼
            Feature Engineering
                     │
                     ▼
         Machine Learning Models
              ┌──────┴──────┐
              ▼             ▼
       Linear Regression  Random Forest
              │             │
              └──────┬──────┘
                     ▼
             Model Evaluation
                     │
              ┌──────┴──────┐
              ▼             ▼
         Power BI         Tableau
              │             │
              └──────┬──────┘
                     ▼
            Business Insights
```

---

## 🔍 Key Features

### 🌐 1. Data Collection

Collected **real-time and historical weather and air-quality data** using APIs.

The collected data includes relevant environmental parameters that can be used for AQI analysis and prediction.

---

### 🧹 2. Data Cleaning & Preprocessing

Processed raw API data using Python and SQL.

Key preprocessing tasks included:

* Handling missing values
* Removing duplicate records
* Data type conversion
* Data transformation
* Handling inconsistent values
* Preparing datasets for analysis and machine learning

---

### 📊 3. Exploratory Data Analysis

Performed detailed EDA using Python to identify:

* AQI trends
* Weather patterns
* Seasonal variations
* Pollution peaks
* Correlations between weather parameters and AQI
* Distribution of AQI values

Visualizations were created using **Matplotlib and Seaborn**.

---

### ⚙️ 4. Feature Engineering

Created and transformed analytical features to improve model performance.

Feature engineering was performed to identify relationships between environmental variables and AQI.

Examples of potentially relevant features include:

* Temperature
* Humidity
* Wind Speed
* Atmospheric Pressure
* Weather Conditions
* Historical AQI values
* Time-based features

---

## 🤖 Machine Learning

Two machine learning approaches were implemented to predict AQI:

### 1. Linear Regression

Used as a baseline regression model to understand the relationship between environmental variables and AQI.

### 2. Random Forest Regressor

Implemented a Random Forest model to capture more complex, non-linear relationships between weather conditions and AQI.

---

## 📏 Model Evaluation

The models were evaluated using commonly used regression metrics:

| Metric       | Purpose                                              |
| ------------ | ---------------------------------------------------- |
| **MAE**      | Measures average absolute prediction error           |
| **RMSE**     | Measures the magnitude of prediction errors          |
| **R² Score** | Measures how well the model explains variance in AQI |

The models were compared based on their predictive performance to identify the more effective approach for AQI prediction.

---

## 📈 Data Visualization

The project uses multiple visualization techniques to understand environmental patterns.

### Key Visualizations

* 📊 AQI Trend Analysis
* 🌡️ Temperature vs AQI
* 💧 Humidity vs AQI
* 💨 Wind Speed vs AQI
* 📅 Seasonal Pollution Trends
* 🔥 Peak AQI Periods
* 🔗 Weather-AQI Correlation Analysis

---

## 📊 Interactive Dashboard

Interactive dashboards were developed using **Power BI and Tableau** to present analytical results in an easy-to-understand format.

### Dashboard Insights

The dashboard provides insights into:

* Current/observed AQI levels
* Pollution trends
* Peak AQI periods
* Weather conditions
* Weather impact on air quality
* Historical AQI patterns
* Environmental trends

---

## 🛠️ Technologies Used

| Technology            | Purpose                         |
| --------------------- | ------------------------------- |
| **Python**            | Data processing, analysis & ML  |
| **Pandas**            | Data cleaning & manipulation    |
| **NumPy**             | Numerical operations            |
| **Matplotlib**        | Data visualization              |
| **Seaborn**           | Statistical visualization       |
| **SQL**               | Data storage & querying         |
| **Scikit-learn**      | Machine Learning                |
| **Linear Regression** | AQI prediction                  |
| **Random Forest**     | AQI prediction                  |
| **R**                 | Additional statistical analysis |
| **Excel**             | Data analysis & reporting       |
| **Power BI**          | Interactive dashboards          |
| **Tableau**           | Interactive visualization       |
| **APIs**              | Weather & AQI data collection   |

---

## 📁 Suggested Project Structure

```text
Weather-AQI-Prediction-Lab/
│
├── data/
│   ├── raw/
│   └── processed/
│
├── api/
│   └── data_collection.py
│
├── sql/
│   └── aqi_analysis.sql
│
├── notebooks/
│   ├── data_cleaning.ipynb
│   ├── eda.ipynb
│   └── model_training.ipynb
│
├── src/
│   ├── data_processing.py
│   ├── feature_engineering.py
│   └── prediction.py
│
├── models/
│   └── random_forest_model.pkl
│
├── visualizations/
│   ├── aqi_trends.png
│   ├── weather_aqi_correlation.png
│   └── seasonal_analysis.png
│
├── dashboards/
│   ├── PowerBI/
│   └── Tableau/
│
├── requirements.txt
└── README.md
```

> Update the structure according to the actual files and folders in your repository.

---

## 🚀 How to Run

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Weather-AQI-Prediction-Lab.git
```

### 2. Navigate to the Project

```bash
cd Weather-AQI-Prediction-Lab
```

### 3. Install Dependencies

```bash
pip install pandas numpy matplotlib seaborn scikit-learn openpyxl
```

### 4. Configure API

Add your API credentials/configuration to the appropriate Python file or environment variables.

**Do not upload API keys or other credentials to GitHub.**

### 5. Collect Data

Run the data collection script:

```bash
python api/data_collection.py
```

### 6. Perform Analysis

Run the Python analysis or Jupyter Notebook files to:

* Clean the data
* Perform EDA
* Engineer features
* Train ML models
* Evaluate predictions
* Generate visualizations

---

## 💡 Key Insights

The project demonstrates how environmental data can be transformed into useful analytical insights.

### 🌫️ Pollution Monitoring

Identifies periods with elevated AQI levels and helps understand pollution trends over time.

### 🌦️ Weather Impact

Analyzes how weather conditions correlate with changes in air quality.

### 📅 Seasonal Analysis

Examines variations in AQI across different time periods and seasons.

### 🤖 Predictive Analytics

Uses machine learning to estimate AQI based on available environmental features.

### 📊 Decision Support

Interactive dashboards provide an accessible way to explore environmental patterns and analytical results.

---

## 🎯 Project Outcomes

Through this project, I gained hands-on experience in:

* API-based data collection
* Data cleaning and preprocessing
* SQL data analysis
* Exploratory Data Analysis
* Feature engineering
* Machine Learning
* Regression modeling
* Model evaluation
* Data visualization
* Power BI dashboard development
* Tableau dashboard development
* End-to-end analytics pipeline development

The project demonstrates the complete process of converting **raw environmental data into insights and predictive analytics**.

---

## 🔮 Future Improvements

Potential enhancements include:

* [ ] Real-time AQI prediction
* [ ] Live API dashboard integration
* [ ] Time-series forecasting
* [ ] XGBoost model implementation
* [ ] Hyperparameter tuning
* [ ] Automated model retraining
* [ ] Location-based AQI comparison
* [ ] AQI alert/notification system
* [ ] Cloud deployment
* [ ] Real-time Power BI dashboard

---

## 📚 Skills Demonstrated

```text
Python
SQL
Pandas
NumPy
Matplotlib
Seaborn
Scikit-learn
Machine Learning
Data Cleaning
EDA
Feature Engineering
Regression
Model Evaluation
Power BI
Tableau
API Integration
Data Visualization
```

---

## 👩‍💻 Author

**Kirti Solanki**

Aspiring **Data Analyst** with an interest in Data Analytics, Business Intelligence, Machine Learning, and data-driven problem solving.

---

## ⭐ Support

If you found this project useful or interesting, consider giving the repository a ⭐.

Feedback and suggestions are always welcome!

## 🚀 Live Demo

👉 **[View Live Project](https://weatherproject-amber.vercel.app/)**

Try the Weather & AQI Prediction dashboard and explore the interactive
visualizations and environmental insights.
