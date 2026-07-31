# Vortura Selenium E2E Automation Framework

This framework provides end-to-end (E2E) automated testing for the **Vortura** React Application deployed at `https://archana-06.github.io/Vortura/#/`.

## Technology Stack
- **Node.js** & **JavaScript ES Modules**
- **Selenium WebDriver**
- **Mocha** & **Chai**
- **ExcelJS** (Excel E2E Execution Report)
- **Mochawesome** (HTML Reporter)
- **Winston** (Structured File & Console Logger)

## Directory Structure
```
frontend/selenium-tests/
├── config/             # Environment & URL configuration
├── pages/              # Page Object Model (POM) classes
├── tests/              # Test suites grouped by feature domain
├── utilities/          # Logger, Driver Factory, Screenshot & Excel reporters
├── data/               # Input data fixtures
├── reports/            # Mochawesome HTML & Failure evidence
├── screenshots/        # Failure screenshot captures
├── logs/               # Winston log files
├── excel/              # Excel report output (E2E_Report.xlsx)
├── hooks/              # Global Mocha setup & teardown hooks
└── .mocharc.json       # Mocha configuration
```

## Running Tests
Run commands from the `frontend/` directory:

- **Run all E2E smoke tests (Headless)**:
  ```bash
  npm run test:e2e
  ```

- **Run in Headed mode (Visible Browser)**:
  ```bash
  npm run test:e2e:headed
  ```

- **Run in specific browsers**:
  ```bash
  npm run test:e2e:chrome
  npm run test:e2e:firefox
  npm run test:e2e:edge
  ```

- **Generate Mochawesome HTML Report**:
  ```bash
  npm run test:e2e:report
  ```
