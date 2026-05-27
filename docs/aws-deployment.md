# GramMitra AWS Deployment Guide

This guide deploys the Spring Boot backend as a Docker container to AWS App
Runner, with images stored in Amazon ECR. It keeps secrets out of GitHub and
the Docker image.

## Recommended MVP Architecture

- Frontend: Vercel or AWS Amplify
- Backend: AWS App Runner
- Container registry: Amazon ECR
- Database: MongoDB Atlas
- Redis: Upstash Redis for low cost, or AWS ElastiCache while credits last
- Files: Amazon S3
- Logs: CloudWatch
- Secrets: AWS Secrets Manager or SSM Parameter Store

## One-Time AWS Setup

Use region `ap-south-1` unless you intentionally choose another region.

1. Create an ECR repository named `grammitra-backend`.
2. Create an IAM role for GitHub Actions using OIDC.
3. Give that role minimum permissions for:
   - ECR login and image push
   - App Runner deployment trigger
4. Create an App Runner service from the ECR image.
5. Configure App Runner runtime environment variables/secrets.

## GitHub Repository Variables

Add these under GitHub repository `Settings -> Secrets and variables -> Actions`.

Variables:

```text
AWS_REGION=ap-south-1
ECR_REPOSITORY=grammitra-backend
APP_RUNNER_SERVICE_ARN=<your-app-runner-service-arn>
```

Secret:

```text
AWS_ROLE_TO_ASSUME=<github-actions-oidc-role-arn>
```

## App Runner Environment

Set these in App Runner. Use secrets for sensitive values.

```text
SPRING_PROFILES_ACTIVE=prod
PORT=8080

MONGODB_URI=<MongoDB Atlas connection string>
MONGODB_DB=grammitra

JWT_SECRET=<strong random value>
JWT_EXPIRATION_MS=7200000

APP_CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com

REDIS_HOST=<redis host>
REDIS_PORT=6379
REDIS_PASSWORD=<optional>

TWILIO_ACCOUNT_SID=<secret>
TWILIO_AUTH_TOKEN=<secret>
TWILIO_PHONE_NUMBER=<sender phone>

RAZORPAY_KEY=<key>
RAZORPAY_SECRET=<secret>

GEMINI_API_KEY=<secret>
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent
```

## Health Check

Use this path:

```text
/actuator/health
```

Expected response:

```json
{"status":"UP"}
```

## Deploy

After AWS and GitHub variables are ready:

1. Open GitHub repository.
2. Go to `Actions`.
3. Select `Deploy Backend to AWS App Runner`.
4. Click `Run workflow`.

The workflow will:

1. Run backend tests.
2. Build the Docker image.
3. Push `latest` and commit-SHA tags to ECR.
4. Trigger App Runner deployment.

## Cost Safety

- Create an AWS Budget alert at low thresholds, for example `$5`, `$20`, `$50`.
- Set CloudWatch log retention to 7 or 14 days.
- Avoid NAT Gateway, EKS, OpenSearch, and oversized databases for the MVP.
- Prefer App Runner before ECS if you want simpler operations.
- Use MongoDB Atlas and Upstash free/small tiers to reduce AWS cost.
