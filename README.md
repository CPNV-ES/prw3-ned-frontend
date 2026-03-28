# PRW3-NED Frontend

## Description

This project is the frontend of the web app to be developed for the PRW3 module.

It is intended to handle the frontend responsibilities of the application.
Users will be able to:

- Browse projects via tags
- Quickly view major information about a project
- Open a detailed page showing the selected project
- Publish/modify their own page
- Like/comment on other projects
- Explore projects from the same author

## Getting Started

### Prerequisites

- Node.js 22.18.0
- NPM 10.9.3

## Deployment

### On dev environment

To install dependencies:

```shell
npm install
```

To build:

```shell
npm run build
```

To start the development server:

```shell
npm run dev
```

Keep the code linted and formatted:

```shell
# to lint the code
npm run lint

# to format the code
npm run format

# to check if the code is well formatted without modifying it
npm run check:format
```

### On integration environment

Not yet implemented

## Directory Structure

```shell
├───public
|       vite.svg
└───src
    │   App.tsx
    │   index.css
    │   main.tsx
    ├───assets
    │       react.svg
    ├───components
    │       Header.tsx
    ├───models
    │       model.tsx
    │       project.tsx
    │       user.tsx
    ├───pages
    │   │   Home.tsx
    │   │   Login.tsx
    │   │   NotFound.tsx
    │   │
    │   └───Project
    │           ActiveProjects.tsx
    │           DetailProject.tsx
    │           ProjectForm.tsx
    └───routes
            AuthGuards.tsx
```

## Collaboration

This project uses Git. The branches used are: main, develop, feature, release, and hotfix. Branch names follow this pattern: type/shortDescription, e.g., feature/awesomeFeature.

You should know:

- How to propose a new feature (issue, pull request)
- [How to commit](https://www.conventionalcommits.org/en/v1.0.0/)
- [How to use your workflow](https://nvie.com/posts/a-successful-git-branching-model/)

## Contact

| Developer                | Email                         |
| ------------------------ | ----------------------------- |
| Ethann Schneider         | <ethann.schneider@eduvaud.ch> |
| Nathan Chauveau          | <nathan.chauveau@eduvaud.ch>  |
| Diogo Da-Silva-Fernandes | <diogo.dasilva2@eduvaud.ch>   |
