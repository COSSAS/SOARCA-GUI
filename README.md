<div align="center">
<a href="https://cossas-project.org/cossas-software/soarca"><img src="img/soarca-logo.svg"/>
</div>


# SOARCA-GUI


[![https://cossas-project.org/portfolio/SOARCA/](https://img.shields.io/badge/website-cossas.github.io-orange)](https://cossas.github.io/SOARCA/docs/)
[![Pipeline status](https://github.com/cossas/soarca-gui/actions/workflows/ci.yml/badge.svg?development)](https://github.com/COSSAS/SOARCA/actions)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)


> [!WARNING]
> SOARCA-GUI is still in development and features for the base version v0.1 are still being added.



> [!WARNING]
> Under the hood we make HTMX call-backs to the SOARCA-GUI "backend", here we use polling. Somehow the polling behaviour is flagged by addblockers which block the poll to the backend. 
> Please add an exclusion for the SOARCA-GUI. This issue will be looked at in the future. 


A [Go](https://go.dev), [Templ](https://templ.guide/), [Tailwind CSS](https://tailwindcss.com/) and [HTMX](https://htmx.org/) based GUI for [SOARCA](https://github.com/COSSAS/SOARCA). 


## Quick Use

Usage of this SOARCA-GUI is described [here](https://cossas.github.io/SOARCA/docs/).

## Documentation

All the documentation to off the SOARCA-GUI is currently being worked on. 

## Contributing 

Want to contribute to this project? Please keep in mind the following [rules](https://cossas.github.io/SOARCA/docs/contribution-guidelines/):
- This repository uses git **rebase** strategy
- For each PR, there should be at least one issue
- Make sure all tests pass (including lint errors)

### Running this repository

#### Requirements

 - Make
 - Go
 - Npm
 - [Templ](https://templ.guide/quick-start/installation)


#### Development environment

The Makefile contains all the required setup for live reloading, meaning that whenever a change is detected in any of the files, the Templ proxy will reload the browser. For file change detection, we use Air. Note that Air does not need to be installed manually, as this is all handled through the Makefile. Although this setup works quite well, it is not perfect.

To start the development environment, run:

```bash
make dev
```
In some cases, the TailwindCSS changes are not picked up correctly. If this happens, you need to rerun:

```bash
make build-tailwind
make dev
```
This will rebuild the required CSS files, and rerun the development environment. 