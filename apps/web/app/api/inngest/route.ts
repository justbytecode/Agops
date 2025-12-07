import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { agentFunctions } from "@/lib/agents";

// Serve the Inngest endpoint for Next.js
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: agentFunctions,
});
