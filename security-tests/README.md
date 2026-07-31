# Vortura Backend Security Framework

## Overview
This directory contains SAST, DAST, dependency review, and security audit reporting scripts for the Vortura backend API.

## Structure
```
security-tests/
├── discovery/      # API discovery tools
├── sast/           # Static Analysis Rules
├── dast/           # Non-destructive DAST probes
├── dependency/     # Dependency vulnerability audit
├── reports/        # Security Report & Excel Generator
└── README.md
```

## Running Security Audit
```bash
cd security-tests
npm install
npm run test:security
```

## Output Artifacts
Results are generated into `Vulnerability Test Results/`:
- `security-review.md`
- `executive-summary.md`
- `dependency-report.md`
- `endpoint-inventory.xlsx`
- `findings.xlsx` (5 Sheets: Security Findings, Endpoint Inventory, Dependency Vulnerabilities, Risk Summary, Test Cases - 300+ records)
