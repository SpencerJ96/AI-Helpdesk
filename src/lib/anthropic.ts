import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const ANALYZE_TOOL: Anthropic.Tool = {
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
};



export async function analyzeTicket(subject: string, content : string) {
	const response = await client.messages.create({
		model: "claude-opus-5",
		max_tokens: 4000,
		tools: [ANALYZE_TOOL],
		tool_choice: { type: "tool", name: "analyze_ticket"},
		messages: [
			{ role: "user", content: `Subject: ${subject}\n\n${content}` },
		],
	});

	const toolUse = response.content.find(
		(block) => block.type === "tool_use"
	);
	if (!toolUse) {
		throw new Error("Claude did not return a tool use block")
	}

	const result = toolUse.input as {
		category: string;
		priority: string;
		sentiment: string;
		draftReply: string;
	};

	return result;
}