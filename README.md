# Post-Call Insight Engine

AI-powered call centre analytics dashboard built with Next.js and Claude.

## Overview

Post-Call Insight Engine ingests Amazon Connect call transcripts, processes them through Claude to extract sentiment, scores, keywords, and complaint categories, then stores the structured insights in DynamoDB. A Next.js dashboard surfaces those insights through filterable call feeds, agent leaderboards, and trend charts. The project ships with full mock data so the UI runs locally with no AWS account required.

## Tech Stack

**Frontend**
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Recharts

**Backend / Infrastructure**
- AWS Lambda, DynamoDB, S3, API Gateway
- Infrastructure as code via AWS SAM (CloudFormation)

**AI**
- Claude `claude-sonnet-4-6` via Anthropic SDK (`@anthropic-ai/sdk`)

## Project Structure

```
post-call-insight-engine/
├── src/                  # Next.js application (App Router)
│   ├── app/              # Pages, layouts, API routes
│   ├── components/       # UI components and charts
│   └── lib/              # Mock data, utilities, types
└── aws/
    ├── lambda/           # Lambda handlers (process-transcript, api-handler)
    └── infrastructure/   # SAM template (template.yaml)
```

## Local Development

**Prerequisites:** Node.js 20+

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000` and uses mock data by default. No AWS credentials or environment variables are required.

## Environment Variables

Copy the example file and fill in values as needed:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | API Gateway base URL (leave unset to use mock data) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Lambda (not needed for local dev) |
| `DYNAMODB_TABLE` | DynamoDB table name for Lambda |
| `AWS_REGION` | AWS region (e.g. `us-east-1`) |

## AWS Deployment (SAM)

**Prerequisites:** [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) and [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) installed and configured.

```bash
# Compile the Lambda TypeScript source
cd aws && npm install && npx tsc
cd ..

# First deploy — walks through parameter prompts
sam deploy --guided

# Subsequent deploys
sam deploy
```

**Parameters prompted during first deploy:**

- `AnthropicApiKey` — your Anthropic API key
- `TranscriptBucketName` — name of the S3 bucket that receives Connect transcripts

After deploy completes, copy the `ApiUrl` output value into `.env.local`:

```
NEXT_PUBLIC_API_URL=https://<id>.execute-api.<region>.amazonaws.com/prod
```

## Switching Between Mock and Real Data

- **Real data:** set `NEXT_PUBLIC_API_URL` in `.env.local` and restart the dev server
- **Mock data:** remove or unset `NEXT_PUBLIC_API_URL` and restart

## Data Flow

```
Amazon Connect --> S3 --> Lambda --> Claude API --> DynamoDB
                                                        |
                                               API Gateway --> Next.js Dashboard
```

1. Amazon Connect uploads a call transcript to S3
2. S3 event triggers the `process-transcript` Lambda
3. Lambda sends the transcript to Claude, which returns structured JSON (sentiment, score, keywords, categories)
4. Results are written to DynamoDB
5. The `api-handler` Lambda exposes the data through API Gateway
6. The Next.js dashboard fetches from API Gateway (or falls back to mock data)

## Dashboard Pages

- **Overview (`/`)** — KPI cards (total calls, average score, sentiment breakdown), recent calls list, sentiment trend chart
- **Calls (`/calls`)** — Full call feed with filters for date range, agent, sentiment, and score
- **Call Detail (`/calls/[id]`)** — Summary bullets, transcript viewer, keyword tags, audio player stub
- **Analytics (`/analytics`)** — Sentiment timeline, agent score trend, keyword frequency, complaint categories
- **Agents (`/agents`)** — Agent leaderboard table with drill-down into individual call history
- **Settings (`/settings`)** — CSV export, dark mode toggle, role management stub
