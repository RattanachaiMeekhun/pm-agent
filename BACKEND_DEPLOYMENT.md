# Deployment Guide for Backend on Google Cloud Run

This guide will walk you through deploying the `pm-agent` backend to Google Cloud Run. Since you do not have Docker or the Google Cloud CLI (gcloud) installed/configured locally, instructions for setting these up are included.

## Prerequisites

1.  **Google Cloud Platform Project**: Ensure you have a GCP project created and billing enabled.
2.  **Google Cloud CLI (gcloud)**: Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) for your operating system.
3.  **Docker (Optional)**: If you want to build and test locally, install [Docker Desktop](https://www.docker.com/products/docker-desktop). If not, we will use **Cloud Build** to build the image remotely.

## Step 1: Initialize Google Cloud CLI

After installing the Google Cloud SDK, open a new terminal (PowerShell or Command Prompt) and run:

```powershell
gcloud init
```

Follow the prompts to log in with your Google account and select your GCP project.

## Step 2: Enable Required APIs

Enable the Cloud Build and Cloud Run APIs for your project:

```powershell
gcloud services enable cloudbuild.googleapis.com run.googleapis.com
```

## Step 3: Deploy using the helper script

We have created a PowerShell script `deploy_backend.ps1` to automate the build and deployment process.

1.  Open a terminal in the project root (`d:\WebProject\pm-agent`).
2.  Run the script:

    ```powershell
    .\deploy_backend.ps1
    ```

3.  The script will ask for:
    *   **Project ID**: Your GCP Project ID (not the name, the ID).
    *   **Region**: e.g., `asia-southeast1` (Singapore) or `us-central1`.
    *   **Service Name**: Default is `pm-agent-backend`.

## Step 4: Environment Variables

Your backend requires environment variables (database URL, API keys). You should set these in Cloud Run after the first deployment or during deployment.

**Option A: Using the Google Cloud Console (Recommended for secrets)**
1.  Go to [Cloud Run Console](https://console.cloud.google.com/run).
2.  Select your service (`pm-agent-backend`).
3.  Click **Edit & Deploy New Revision**.
4.  Go to the **Variables & Secrets** tab.
5.  Add the variables from your local `.env` file (e.g., `URL_DATABASE`, `LLM_API_KEY`, etc.).
6.  Click **Deploy**.

**Option B: Using the command line**
You can update environment variables using:

```powershell
gcloud run services update pm-agent-backend --update-env-vars "KEY1=VALUE1,KEY2=VALUE2"
```

## Manual Deployment Steps (If script fails)

If you prefer to run commands manually:

1.  **Submit Build to Cloud Build**:
    ```powershell
    cd backend
    gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/pm-agent-backend
    ```

2.  **Deploy to Cloud Run**:
    ```powershell
    gcloud run deploy pm-agent-backend --image gcr.io/YOUR_PROJECT_ID/pm-agent-backend --platform managed --region asia-southeast1 --allow-unauthenticated
    ```
