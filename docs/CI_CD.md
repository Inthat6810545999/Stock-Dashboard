# TOPPICKSTOCK CI/CD

The `Application CI` GitHub Actions workflow runs on pull requests to `main`, code pushes to `main`, and manual dispatch. It installs locked dependencies with Node 22, runs the test suite and ESLint, then builds with Next.js (the framework used by Vercel). The existing `npm run build` is the separate local Vinext build and is not used as the Vercel build gate.

Commits changing only `data/**` skip Application CI. The existing scheduled market-scan workflows validate and publish those snapshots; running a full application build after every five-minute scan would add unnecessary CI jobs. A commit with both source and data changes still runs Application CI.

Vercel's existing GitHub integration handles deployment: a successful status was observed on commit `69183ab` before this workflow was added. The workflow adds no Vercel token or second deploy job, so there is no duplicate deployment. Git integration may begin a production build before this CI job finishes; `Application CI` alone does not prevent a failing commit from reaching production. To make it a production release gate, configure Vercel Deployment Checks for this GitHub check after deciding how data-only scan commits should be handled. Do not mark this as gated until that setting has been verified on a real deployment.

Local equivalent:

```sh
npm ci --ignore-scripts
npm test
npm run lint
npm run build:next
```
