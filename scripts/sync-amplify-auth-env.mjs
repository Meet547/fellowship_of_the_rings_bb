import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const outputsPath = "amplify_outputs.json";
const generatedDir = "src/lib";
const generatedPath = `${generatedDir}/amplify-generated.ts`;

if (!existsSync(outputsPath)) {
  throw new Error(
    `Required Amplify outputs file is missing: ${outputsPath}. Run pipeline-deploy before the frontend build.`,
  );
}

let outputs;
try {
  outputs = JSON.parse(readFileSync(outputsPath, "utf8"));
} catch (error) {
  throw new Error(`Required Amplify outputs file is not valid JSON: ${outputsPath}.`, {
    cause: error,
  });
}

const auth = outputs.auth;
const region = auth?.aws_region;
const userPoolId = auth?.user_pool_id;
const userPoolClientId = auth?.user_pool_client_id;

if (
  typeof region !== "string" ||
  typeof userPoolId !== "string" ||
  typeof userPoolClientId !== "string" ||
  !region ||
  !userPoolId ||
  !userPoolClientId
) {
  throw new Error(
    `Amplify outputs at ${outputsPath} do not contain the required Cognito configuration.`,
  );
}

if (!/^[a-z]{2}(?:-[a-z0-9]+)+-\d+$/.test(region)) {
  throw new Error(`Amplify outputs at ${outputsPath} contain an invalid Cognito region.`);
}

if (!/^[a-z]{2}(?:-[a-z0-9]+)+-\d+_[A-Za-z0-9]+$/.test(userPoolId)) {
  throw new Error(
    `Amplify outputs at ${outputsPath} contain an invalid Cognito user pool ID.`,
  );
}

if (!/^[A-Za-z0-9]+$/.test(userPoolClientId)) {
  throw new Error(
    `Amplify outputs at ${outputsPath} contain an invalid Cognito app client ID.`,
  );
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
