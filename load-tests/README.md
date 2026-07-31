# k6 Baseline & Load Testing Framework — Vortura

## Overview
This directory contains the automated **k6 baseline and load testing framework** for the Vortura backend.

## Execution Rules
- Default target: `https://vortura-backend.onrender.com/api/health`
- Concurrency: 100 Virtual Users (VUs)
- Continuous Duration: 1 minute
- Non-destructive: Safe, read-only GET endpoints only.

## Commands
```bash
# Install dependencies
cd load-tests
npm install

# Run safe baseline load test
npm run test:load:baseline

# Generate Excel Report (K6_Load_Test_Report.xlsx with 5 sheets & 300+ records)
npm run test:load:report
```

## Report Location
`load-tests/excel/K6_Load_Test_Report.xlsx`
- Sheet 1: Summary
- Sheet 2: Endpoint Metrics
- Sheet 3: Threshold Results
- Sheet 4: Execution Timeline (300+ records)
- Sheet 5: Errors
