import { existsSync, readFileSync, writeFileSync } from "node:fs";

const outputsPath = "amplify_outputs.json";
const envPath = ".env.production.local";

if (!existsSync(outputsPath)) {
  process.exit(0);
}

const outputs = JSON.parse(readFileSync(outputsPath, "utf8"));
const auth = outputs.auth;
const region = auth?.aws_region;
const userPoolId = auth?.user_pool_id;
const userPoolClientId = auth?.user_pool_client_id;

if (!region || !userPoolId || !userPoolClientId) {
  throw new Error(
    `Amplify outputs at ${outputsPath} do not contain the required Cognito configuration.`,
  );
}

const env = [
  `NEXT_PUBLIC_AWS_REGION=${region}`,
  `NEXT_PUBLIC_COGNITO_USER_POOL_ID=${userPoolId}`,
  `NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=${userPoolClientId}`,
];

if (auth.identity_pool_id) {
  env.push(`NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=${auth.identity_pool_id}`);
}

writeFileSync(envPath, `${env.join("\n")}\n`);
