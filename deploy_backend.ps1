# Deploy backend to Google Cloud Run

# Check if gcloud is installed
if (-not (Get-Command "gcloud" -ErrorAction SilentlyContinue)) {
    Write-Error "Google Cloud CLI (gcloud) is not installed or not in PATH."
    Write-Host "Please install it from https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Ask for Project ID
$projectId = Read-Host "Enter your Google Cloud Project ID"
if (-not $projectId) {
    Write-Error "Project ID is required."
    exit 1
}

# Set project
Write-Host "Setting project to $projectId..."
gcloud config set project $projectId

# Ask for Region
$region = Read-Host "Enter region (default: asia-southeast1)"
if (-not $region) {
    $region = "asia-southeast1"
}

# Load environment variables from .env if present
$envFile = "backend\.env"
$defaultDbUrl = ""
$defaultApiKey = ""

if (Test-Path $envFile) {
    Write-Host "Reading defaults from $envFile..."
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "URL_DATABASE\s*=\s*[`"']?([^`"']*)") { $defaultDbUrl = $matches[1] }
        if ($_ -match "ANTHROPIC_API_KEY\s*=\s*[`"']?([^`"']*)") { $defaultApiKey = $matches[1] }
    }
}

# Ask for Database URL
$dbUrl = Read-Host "Enter Database URL (Press Enter for default: '$defaultDbUrl')"
if (-not $dbUrl) { $dbUrl = $defaultDbUrl }

if ($dbUrl -match "localhost|127\.0\.0\.1") {
    Write-Warning "Warning: 'localhost' or '127.0.0.1' will refer to the Cloud Run container itself, not your machine."
    Write-Warning "Ensure you are using a Cloud SQL connection host or a public database URL."
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y") { exit 1 }
}

# Ask for API Key
$apiKey = Read-Host "Enter Anthropic API Key (Press Enter for default: '$defaultApiKey')"
if (-not $apiKey) { $apiKey = $defaultApiKey }

# Enable APIs
Write-Host "Enabling Cloud Build and Cloud Run APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com

# Submit build
Write-Host "Submitting build to Cloud Build..."
$serviceName = "pm-agent-backend"
$imageName = "gcr.io/$projectId/$serviceName"
cd backend
gcloud builds submit --tag $imageName

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed."
    cd ..
    exit $LASTEXITCODE
}
cd ..

# Deploy to Cloud Run with Environment Variables
Write-Host "Deploying to Cloud Run..."
gcloud run deploy $serviceName `
    --image $imageName `
    --platform managed `
    --region $region `
    --allow-unauthenticated `
    --port 8080 `
    --set-env-vars "DATABASE_URL=$dbUrl,ANTHROPIC_API_KEY=$apiKey,LLM_PROVIDER=anthropic"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful!"
    Write-Host "Service URL:"
    gcloud run services describe $serviceName --platform managed --region $region --format 'value(status.url)'
} else {
    Write-Error "Deployment failed."
}
