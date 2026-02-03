<div align="center">
<a href="https://cossas-project.org/cossas-software/soarca"><img src="img/soarca-logo.svg"/>
</div>

# SOARCA-GUI

[![https://cossas-project.org/portfolio/SOARCA/](https://img.shields.io/badge/website-cossas.github.io-orange)](https://cossas.github.io/SOARCA/docs/)
[![Pipeline status](https://github.com/cossas/soarca-gui/actions/workflows/ci.yml/badge.svg?development)](https://github.com/COSSAS/SOARCA/actions)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Modern [React](https://react.dev) + [Vite](https://vitejs.dev) frontend for the [SOARCA](https://github.com/COSSAS/SOARCA) platform, providing a lightweight UI to interact with SOARCA services. The app uses [TypeScript](https://www.typescriptlang.org/), [styled-components](https://styled-components.com/) for theming, [React Router](https://reactrouter.com/) for navigation, and [React Query](https://tanstack.com/query) for data fetching.

> [!WARNING]
> SOARCA-GUI is still in development and features for the base version v0.1 are still being added.

## Requirements for running

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/) 10+
- (Optional) [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) for running the full stack locally

## Getting Started (Development)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server (Vite):
   ```bash
   npm run dev
   ```
   The dev server runs at http://localhost:3000 but the port can be modified in the `vite.config.ts` and `Dockerfile`.

## NPM Scripts

- `npm run dev` — start Vite dev server
- `npm run lint` — run ESLint
- `npm run build` — type-check and create production bundle
- `npm run preview` — serve the production build locally

## Running with Docker (optional)

Currently the docker image in not published yet, so you will have to buid your own

```bash
docker build -t soarca-ui-react-dev --target development .
```

To spin up the UI with the included compose setup:

```bash
docker compose up -d
```

## Hot-reload

In both the local and Docker dev environment, Vite provides instant hot reload, so any change to the files will be reflected in the browser upon saving.

## Documentation

- Project docs: https://cossas.github.io/SOARCA/docs/
- Contribution guidelines: https://cossas.github.io/SOARCA/docs/contribution-guidelines/

## Quick Use

Usage of SOARCA-GUI is described here: https://cossas.github.io/SOARCA/docs/

## Contributing

Want to contribute to this project? Please keep in mind the following rules:

- This repository uses git **rebase** strategy
- For each PR, there should be at least one issue
- Make sure all tests pass (including lint errors)
