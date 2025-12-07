import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

export type LLMProvider = "openai" | "anthropic" | "gemini";

interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
}

interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

// Get LLM configuration for a user/tenant
export async function getLLMConfig(userId: string): Promise<LLMConfig | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        openaiApiKey: true,
        anthropicApiKey: true,
        geminiApiKey: true,
        defaultLlmProvider: true,
      },
    });

    if (!user) return null;

    // Try default provider first, then fallback to any available
    const provider = (user.defaultLlmProvider as LLMProvider) || "openai";
    
    if (provider === "openai" && user.openaiApiKey) {
      return { provider: "openai", apiKey: user.openaiApiKey };
    }
    if (provider === "anthropic" && user.anthropicApiKey) {
      return { provider: "anthropic", apiKey: user.anthropicApiKey };
    }
    if (provider === "gemini" && user.geminiApiKey) {
      return { provider: "gemini", apiKey: user.geminiApiKey };
    }

    // Fallback to any available key
    if (user.openaiApiKey) return { provider: "openai", apiKey: user.openaiApiKey };
    if (user.anthropicApiKey) return { provider: "anthropic", apiKey: user.anthropicApiKey };
    if (user.geminiApiKey) return { provider: "gemini", apiKey: user.geminiApiKey };

    return null;
  } catch (error) {
    console.error("Error getting LLM config:", error);
    return null;
  }
}

// Universal LLM completion function
export async function llmComplete(
  config: LLMConfig,
  messages: LLMMessage[],
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<LLMResponse> {
  const { provider, apiKey } = config;
  const maxTokens = options?.maxTokens || 2000;
  const temperature = options?.temperature || 0.7;

  if (provider === "openai") {
    const openai = new OpenAI({ apiKey });
    const model = options?.model || "gpt-4-turbo-preview";
    
    const response = await openai.chat.completions.create({
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: maxTokens,
      temperature,
    });

    return {
      content: response.choices[0]?.message?.content || "",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
      },
    };
  }

  if (provider === "anthropic") {
    const anthropic = new Anthropic({ apiKey });
    const model = options?.model || "claude-3-sonnet-20240229";
    
    // Separate system message from the rest
    const systemMessage = messages.find(m => m.role === "system")?.content || "";
    const chatMessages = messages
      .filter(m => m.role !== "system")
      .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemMessage,
      messages: chatMessages,
    });

    const textContent = response.content.find(c => c.type === "text");
    return {
      content: textContent?.type === "text" ? textContent.text : "",
      usage: {
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
      },
    };
  }

  if (provider === "gemini") {
    // Gemini API implementation (using REST API)
    const model = options?.model || "gemini-pro";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: messages.map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature,
          },
        }),
      }
    );

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    return {
      content,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
      },
    };
  }

  throw new Error(`Unsupported LLM provider: ${provider}`);
}

// DevOps-specific AI prompts
export const AGENT_PROMPTS = {
  monitoring: `You are a DevOps monitoring agent. Your job is to analyze system health data and identify potential issues.
Given the following health check data, provide a brief analysis:
- Identify any concerning patterns
- Rate overall health (healthy, warning, critical)
- Suggest any immediate actions if needed
Be concise and actionable.`,

  incident: `You are an incident detection agent. Analyze the following system metrics and logs to determine if there's an incident that needs attention.
If you detect an issue:
- Classify severity (critical, high, medium, low)
- Provide a clear incident title
- Describe the problem briefly
If no issues, confirm system is healthy.`,

  rca: `You are a Root Cause Analysis (RCA) agent. Given an incident description and available system data, perform a detailed analysis to determine the root cause.
Structure your analysis:
1. Incident Summary
2. Timeline of Events
3. Root Cause Identification
4. Contributing Factors
5. Recommended Fixes
Be technical but clear.`,

  remediation: `You are a remediation agent. Based on the incident and RCA provided, suggest specific actions to fix the issue.
For each action, provide:
- Action description
- Command or code (if applicable)
- Risk level (low, medium, high)
- Expected outcome
Only suggest actions you're confident will help.`,

  security: `You are a security scanning agent. Analyze the following system configuration and code for security vulnerabilities.
Report findings as:
- Severity (critical, high, medium, low)
- Description
- Location (file/config affected)
- Recommended fix
Focus on actionable security issues.`,

  deployment: `You are a deployment automation agent. Help manage CI/CD operations safely.
Given the deployment context, provide:
- Pre-deployment checklist
- Deployment steps
- Rollback procedure if needed
- Post-deployment verification steps
Be specific and safety-conscious.`,
};
