import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const outputsPath = "amplify_outputs.json";
const generatedDir = "src/lib";
const generatedPath = `${generatedDir}/amplify-generated.ts`;

if (!existsSync(outputsPath)) {
  writeFileSync(
    generatedPath,
    `export const generatedAuthConfig = null;\n`,
  );
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

if (!/^[a-z]{2}-[a-z]+-\d+_[A-Za-z0-9]+$/.test(userPoolId)) {
  throw new Error(`Amplify generated an invalid Cognito user pool ID: ${userPoolId}`);
}

mkdirSync(generatedDir, { recursive: true });
writeFileSync(
  generatedPath,
  `export const generatedAuthConfig = ${JSON.stringify(
    {
      region,
      userPoolId,
      userPoolClientId,
      identityPoolId: auth.identity_pool_id ?? null,
    },
    null,
    2,
  )} as const;\n`,
);
