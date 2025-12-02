# GitHub Actions CI/CD Workflows

This directory contains the CI/CD workflows for the AREA project, following a modular and reusable architecture inspired by best practices.

## 🏗️ Workflow Architecture

### Main Orchestration

- **`all_checks.yml`** - Main workflow that orchestrates all quality checks and tests
  - Runs on: `push` to main/dev/feature branches, `pull_request`, `workflow_dispatch`
  - Calls all sub-workflows in a structured manner
  - Provides quality gate decision and PR comments

### Repository Management

- **`repository_validation.yml`** - Validates repository structure and cleanliness
  - Checks for unwanted files (temp files, logs, etc.)
  - Validates project structure (required directories and files)
  - Validates dependency files (package.json, pubspec.yaml)
  - Can be used in strict mode for enforced validation

- **`mirror.yml`** - Mirrors repository to external location
  - Runs on: `push` to main, `workflow_dispatch`
  - Requires secrets: `SSH_PRIVATE_KEY` and variable `MIRROR_URL`

### Backend Workflows

- **`backend_code_quality.yml`** - Code quality checks for NestJS backend
  - ESLint linting
  - Prettier formatting checks
  - TypeScript type checking
  - Security audit with npm audit

- **`backend_build_test.yml`** - Build and test backend
  - NestJS application build
  - Prisma client generation
  - Unit and e2e tests with PostgreSQL
  - Test coverage reporting
  - Docker image build validation

### Web Frontend Workflows

- **`web_code_quality.yml`** - Code quality checks for React/Vite frontend
  - ESLint linting
  - Prettier formatting checks
  - TypeScript type checking
  - Security audit

- **`web_build_test.yml`** - Build and test web frontend
  - Vite production build
  - Bundle size analysis
  - Unit tests (when configured)
  - Docker image build validation

### Mobile Workflows

- **`mobile_code_quality.yml`** - Code quality checks for Flutter mobile
  - Dart analyzer
  - Dart formatting checks
  - Lint checks
  - Package validation

- **`mobile_build_test.yml`** - Build and test mobile app
  - Flutter tests with coverage
  - Android APK build
  - Docker image build for mobile

### Release Workflow

- **`release.yml`** - Production release builds
  - Builds mobile APK
  - Builds Docker images for all services
  - Creates web production bundles
  - Creates GitHub releases with assets
  - Tests Docker Compose stack

## 🚀 Usage

### Running All Checks

The main workflow runs automatically on:
- Push to `main`, `dev`, or feature branches (`feat/**`, `*/cicd/*`)
- Pull requests (except branches starting with `ga-ignore-`)

Manual trigger:
```bash
# Via GitHub UI: Actions > All Checks - AREA Project > Run workflow
```

With options:
- `skip_tests`: Skip test execution (default: false)
- `skip_mobile_build`: Skip mobile APK build (default: false)
- `strict_validation`: Enable strict repository validation (default: false)

### Creating a Release

1. Create and push a tag:
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

2. The release workflow will automatically:
   - Build mobile APK
   - Build Docker images
   - Create web production bundle
   - Create GitHub release with all assets

### Manual Release

```bash
# Via GitHub UI: Actions > Release Build & Deployment > Run workflow
```

Options:
- `release_type`: development or production
- `skip_docker`: Skip Docker image builds

## 📋 Requirements

### Secrets (Configure in repository settings)

- `SSH_PRIVATE_KEY` - SSH key for repository mirroring (optional)
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

### Variables (Configure in repository settings)

- `MIRROR_URL` - Target repository URL for mirroring (optional)

### Environment Files

Create a `.env` file based on `.env.example` for local development:
```bash
cp .env.example .env
```

## 🐳 Docker Services

The workflows validate and test the following Docker services defined in `docker-compose.yml`:

- **postgres**: PostgreSQL database (port 5432)
- **server**: NestJS backend (port 8080)
- **client_web**: React/Vite frontend (port 8081)
- **client_mobile**: Flutter mobile app builder

## 📊 Workflow Dependencies

```
all_checks.yml
├── repository_validation.yml (runs first)
├── backend_code_quality.yml
│   └── backend_build_test.yml
├── web_code_quality.yml
│   └── web_build_test.yml
├── mobile_code_quality.yml
│   └── mobile_build_test.yml
├── docker_compose_validation
└── quality_gate (final decision)
```

## 🔍 Quality Gate

The quality gate checks that all required jobs pass:
- Repository Validation
- Backend Build & Test
- Web Build & Test
- Mobile Build & Test
- Docker Compose Validation

If any job fails, the quality gate will fail and:
- Block merging (if branch protection is enabled)
- Comment on the PR with the failure status
- Provide detailed summary in the workflow

## 📈 Artifacts

Workflows generate and store the following artifacts:

### Backend
- Build artifacts (7 days retention)
- Coverage reports (30 days)
- Security audit results (30 days)

### Web
- Build artifacts (7 days)
- Security audit results (30 days)

### Mobile
- Coverage reports (30 days)
- APK releases (30 days for workflow runs, 90 days for releases)

## 🛠️ Local Testing

### Test Backend
```bash
cd backend
npm install
npm run lint
npm run test
npm run build
```

### Test Web
```bash
cd web
npm install
npm run lint
npm run build
```

### Test Mobile
```bash
cd mobile
flutter pub get
flutter analyze
flutter test
flutter build apk
```

### Test Docker Compose
```bash
cp .env.example .env
docker compose up -d
docker compose ps
docker compose down
```

## 🔧 Customization

### Modifying Workflows

Each reusable workflow accepts inputs for customization:

```yaml
- uses: ./.github/workflows/backend_code_quality.yml
  with:
    enable_eslint: true
    enable_prettier: true
```

### Adding New Checks

1. Create a new reusable workflow in `.github/workflows/`
2. Add it to `all_checks.yml` in the appropriate section
3. Update dependencies in the quality gate

### Branch Protection

Recommended branch protection rules for `main` and `dev`:

- Require pull request reviews
- Require status checks to pass:
  - `Repository Validation`
  - `Backend Build & Test`
  - `Web Frontend Build & Test`
  - `Mobile Build & Test`
  - `Quality Gate Decision`
- Require branches to be up to date
- Include administrators

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Reusable Workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
- [Docker Compose in CI](https://docs.docker.com/compose/ci-cd/)

## 🤝 Contributing

When adding new workflows:

1. Follow the modular structure
2. Use reusable workflows when possible
3. Add proper error handling and summaries
4. Update this README with new workflow details
5. Test locally before pushing
