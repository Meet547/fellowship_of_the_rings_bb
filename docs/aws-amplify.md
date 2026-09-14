# AWS Amplify deployment

KHOJ uses Amplify Gen 2 for Cognito email/password authentication and Amplify Hosting for the Next.js app.

## Connect GitHub

1. Push this repository to GitHub.
2. In AWS Amplify, choose **Create new app** > **Host web app**.
3. Select GitHub, authorize AWS Amplify, and choose the repository and branch.
4. Keep the repository root as the app root. Amplify will use the committed `amplify.yml`.
5. Add the following environment variables in **Hosting > Environment variables** before the first deploy:

```text
NEXT_PUBLIC_AWS_REGION=ap-south-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=<generated user pool id>
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=<generated app client id>
```

Amplify provides `AWS_REGION` automatically. Do not add it manually in the
Amplify Hosting environment-variable screen because variables beginning with
`AWS` are reserved.

`NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID` is optional and is not needed for sign-in.

## Deploy the auth backend

The Amplify build runs `ampx pipeline-deploy` for the connected branch. This provisions the Cognito user pool defined in `amplify/auth/resource.ts` and keeps backend changes tied to GitHub commits.

For local development, install the dependencies and run the backend sandbox from an npm or pnpm shell because the Amplify CLI does not support Bun as its package manager:

```bash
npm install
npx ampx sandbox
```

Copy the generated user pool values into `.env.local` using `.env.example` as the template. Without those values, the UI deliberately stays in its local demo mode.

## Auth behavior

- New accounts use the email address as the Cognito login and require a verified email code.
- The full name is stored as the Cognito `name` attribute.
- Sign-in, sign-up, verification, session restore, and sign-out use Amplify Auth.
- `src/lib/session.ts` only uses localStorage when Cognito configuration is absent, which keeps the local demo usable without AWS credentials.
