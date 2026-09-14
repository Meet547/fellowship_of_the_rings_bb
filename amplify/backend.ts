import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource.ts";

defineBackend({ auth });