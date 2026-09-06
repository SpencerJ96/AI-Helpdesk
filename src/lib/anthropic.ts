import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const ANALYZE_TOOL = {
  name: "analyze_ticket",
  description: "Classify a support ticket and draft a reply",
  input_schema: {
    type: "object",
    properties: {
      category: { type: "string", enum: ["NETWORK_IT","BILLING","ACCOUNT","SOFTWARE","HARDWARE","OTHER"] },
      priority: { type: "string", enum: ["LOW","MEDIUM","HIGH","CRITICAL"] },
      sentiment: { type: "string", enum: ["POSITIVE","NEUTRAL","FRUSTRATED","ANGRY"] },
      draftReply: { type: "string" },
    },
    required: ["category","priority","sentiment","draftReply"],
  },
} as const;
