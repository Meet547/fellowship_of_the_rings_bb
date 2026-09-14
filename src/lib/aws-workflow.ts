import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { StartExecutionCommand, SFNClient } from "@aws-sdk/client-sfn";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

export type InvestigationStatus = "queued" | "running";

export interface InvestigationRequest {
  description: string;
  userId?: string;
}

export interface InvestigationRun {
  runId: string;
  status: InvestigationStatus;
  mode: "local" | "aws";
  createdAt: string;
}

const region = process.env.AWS_REGION;
const tableName = process.env.KHOJ_CASES_TABLE;
const stateMachineArn = process.env.KHOJ_STATE_MACHINE_ARN;

const dynamo = region
  ? DynamoDBDocumentClient.from(new DynamoDBClient({ region }))
  : null;
const stepFunctions = region ? new SFNClient({ region }) : null;

export async function startInvestigation(
  request: InvestigationRequest,
): Promise<InvestigationRun> {
  const runId = randomUUID();
  const createdAt = new Date().toISOString();
  const awsEnabled = Boolean(dynamo && stepFunctions && tableName && stateMachineArn);

  if (awsEnabled) {
    await dynamo!.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          pk: `RUN#${runId}`,
          sk: "METADATA",
          entity: "InvestigationRun",
          runId,
          userId: request.userId ?? "anonymous",
          description: request.description,
          status: "queued",
          createdAt,
        },
      }),
    );

    await stepFunctions!.send(
      new StartExecutionCommand({
        stateMachineArn,
        name: runId,
        input: JSON.stringify({
          runId,
          userId: request.userId ?? "anonymous",
          description: request.description,
        }),
      }),
    );
  }

  return {
    runId,
    status: "queued",
    mode: awsEnabled ? "aws" : "local",
    createdAt,
  };
}