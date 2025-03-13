# Storage TCO Calculator

A modern web application for calculating Total Cost of Ownership (TCO) for storage systems. Built with React, TypeScript, Tailwind CSS, and Flowbite components.

## Features

- Drive selection from a comprehensive database
- Rack configuration
- Power and cooling calculations
- Cost analysis (CapEx and OpEx)
- Interactive charts and visualizations
- Responsive design

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd storage-tco-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Configuration

The application uses the following default values which can be modified in the UI:

- Rack Attributes
  - Servers per rack: 8
  - JBODs per rack: 4
  - Drives per server: 24
  - Drives per JBOD: 60

- Fixed Costs
  - Electricity cost: $0.12/kWh
  - Data center PUE: 1.0
  - Drive replacement cost: $250

- Workload Parameters
  - Deployment term: 3 years
  - Error encoding replicas: 1.5x
  - Capacity utilization: 85%
  - Duty cycle: 80%
  - Data reduction ratio: 1.5x

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## License

MIT 