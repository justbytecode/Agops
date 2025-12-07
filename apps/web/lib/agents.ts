import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/db";
import { getLLMConfig, llmComplete, AGENT_PROMPTS } from "@/lib/ai";

// Monitoring Agent - Checks website health and creates incidents if needed
export const monitoringAgent = inngest.createFunction(
  { id: "monitoring-agent", name: "Monitoring Agent" },
  { event: "agent/monitoring.run" },
  async ({ event, step }) => {
    const { websiteId, tenantId, userId } = event.data;

    // Step 1: Get website data
    const website = await step.run("fetch-website", async () => {
      return prisma.website.findUnique({
        where: { id: websiteId },
        include: { healthChecks: { take: 10, orderBy: { checkedAt: "desc" } } },
      });
    });

    if (!website) throw new Error("Website not found");

    // Step 2: Perform health check
    const healthCheck = await step.run("perform-health-check", async () => {
      const startTime = Date.now();
      try {
        const response = await fetch(website.url, { 
          method: "HEAD",
          signal: AbortSignal.timeout(30000),
        });
        const responseTime = Date.now() - startTime;
        
        return {
          status: response.ok ? "up" : "down",
          statusCode: response.status,
          responseTime,
          errorMessage: response.ok ? null : `HTTP ${response.status}`,
        };
      } catch (error: any) {
        return {
          status: "down",
          statusCode: null,
          responseTime: Date.now() - startTime,
          errorMessage: error.message,
        };
      }
    });

    // Step 3: Save health check result
    await step.run("save-health-check", async () => {
      await prisma.healthCheck.create({
        data: {
          websiteId: website.id,
          type: "HTTPS",
          endpoint: "/",
          status: healthCheck.status,
          statusCode: healthCheck.statusCode,
          responseTime: healthCheck.responseTime,
          errorMessage: healthCheck.errorMessage,
        },
      });

      // Update website health status
      await prisma.website.update({
        where: { id: website.id },
        data: {
          healthStatus: healthCheck.status,
          lastHealthCheck: new Date(),
          avgResponseTime: healthCheck.responseTime,
        },
      });
    });

    // Step 4: If down, analyze with AI and create incident
    if (healthCheck.status === "down") {
      const llmConfig = await step.run("get-llm-config", async () => {
        return getLLMConfig(userId);
      });

      if (llmConfig) {
        const analysis = await step.run("ai-analysis", async () => {
          const response = await llmComplete(llmConfig, [
            { role: "system", content: AGENT_PROMPTS.incident },
            { 
              role: "user", 
              content: `Website: ${website.name} (${website.url})
Status: ${healthCheck.status}
Error: ${healthCheck.errorMessage}
Response Time: ${healthCheck.responseTime}ms
Recent Health History: ${JSON.stringify(website.healthChecks?.slice(0, 5))}` 
            },
          ]);
          return response.content;
        });

        // Create incident automatically
        await step.run("create-incident", async () => {
          await prisma.incident.create({
            data: {
              title: `Website Down: ${website.name}`,
              description: analysis,
              severity: "HIGH",
              status: "OPEN",
              tenantId,
            },
          });
        });
      }
    }

    return {
      websiteId,
      status: healthCheck.status,
      responseTime: healthCheck.responseTime,
    };
  }
);

// RCA Agent - Performs root cause analysis on incidents
export const rcaAgent = inngest.createFunction(
  { id: "rca-agent", name: "Root Cause Analysis Agent" },
  { event: "agent/rca.run" },
  async ({ event, step }) => {
    const { incidentId, userId } = event.data;

    // Step 1: Get incident data
    const incident = await step.run("fetch-incident", async () => {
      return prisma.incident.findUnique({
        where: { id: incidentId },
        include: { events: { take: 20 } },
      });
    });

    if (!incident) throw new Error("Incident not found");

    // Step 2: Get LLM config
    const llmConfig = await step.run("get-llm-config", async () => {
      return getLLMConfig(userId);
    });

    if (!llmConfig) throw new Error("No AI provider configured");

    // Step 3: Perform RCA
    const rca = await step.run("perform-rca", async () => {
      const response = await llmComplete(llmConfig, [
        { role: "system", content: AGENT_PROMPTS.rca },
        {
          role: "user",
          content: `Incident Title: ${incident.title}
Description: ${incident.description}
Severity: ${incident.severity}
Status: ${incident.status}
Events: ${JSON.stringify(incident.events)}`,
        },
      ]);
      return response.content;
    });

    // Step 4: Save RCA as incident event
    await step.run("save-rca", async () => {
      await prisma.incidentEvent.create({
        data: {
          incidentId,
          type: "rca_completed",
          message: "AI Root Cause Analysis completed",
          data: { analysis: rca },
        },
      });

      // Update incident status
      await prisma.incident.update({
        where: { id: incidentId },
        data: { status: "INVESTIGATING" },
      });
    });

    return { incidentId, rca };
  }
);

// Security Agent - Scans for vulnerabilities
export const securityAgent = inngest.createFunction(
  { id: "security-agent", name: "Security Scanning Agent" },
  { event: "agent/security.run" },
  async ({ event, step }) => {
    const { websiteId, tenantId, userId } = event.data;

    // Step 1: Get website
    const website = await step.run("fetch-website", async () => {
      return prisma.website.findUnique({ where: { id: websiteId } });
    });

    if (!website) throw new Error("Website not found");

    // Step 2: Perform basic security checks
    const securityChecks = await step.run("security-checks", async () => {
      const checks = [];
      
      // Check SSL
      try {
        const url = new URL(website.url);
        checks.push({
          name: "SSL Certificate",
          passed: url.protocol === "https:",
          details: url.protocol === "https:" ? "HTTPS enabled" : "Not using HTTPS",
        });
      } catch {
        checks.push({ name: "SSL Certificate", passed: false, details: "Invalid URL" });
      }

      // Check security headers
      try {
        const response = await fetch(website.url, { method: "HEAD" });
        const headers = response.headers;
        
        checks.push({
          name: "X-Frame-Options",
          passed: !!headers.get("x-frame-options"),
          details: headers.get("x-frame-options") || "Missing",
        });
        checks.push({
          name: "Content-Security-Policy",
          passed: !!headers.get("content-security-policy"),
          details: headers.get("content-security-policy") ? "Present" : "Missing",
        });
        checks.push({
          name: "Strict-Transport-Security",
          passed: !!headers.get("strict-transport-security"),
          details: headers.get("strict-transport-security") || "Missing",
        });
      } catch (error: any) {
        checks.push({ name: "Headers Check", passed: false, details: error.message });
      }

      return checks;
    });

    // Step 3: AI analysis
    const llmConfig = await step.run("get-llm-config", async () => {
      return getLLMConfig(userId);
    });

    let aiAnalysis = "";
    if (llmConfig) {
      const response = await step.run("ai-analysis", async () => {
        return llmComplete(llmConfig, [
          { role: "system", content: AGENT_PROMPTS.security },
          {
            role: "user",
            content: `Website: ${website.name} (${website.url})
Security Checks Results: ${JSON.stringify(securityChecks, null, 2)}`,
          },
        ]);
      });
      aiAnalysis = response.content;
    }

    // Step 4: Create incident if critical issues found
    const criticalIssues = securityChecks.filter(c => !c.passed);
    if (criticalIssues.length > 0) {
      await step.run("create-security-incident", async () => {
        await prisma.incident.create({
          data: {
            title: `Security Issues: ${website.name}`,
            description: `${criticalIssues.length} security issues found.\n\n${aiAnalysis}`,
            severity: criticalIssues.length >= 3 ? "HIGH" : "MEDIUM",
            status: "OPEN",
            tenantId,
          },
        });
      });
    }

    return { websiteId, checks: securityChecks, analysis: aiAnalysis };
  }
);

// Remediation Agent - Suggests and executes fixes
export const remediationAgent = inngest.createFunction(
  { id: "remediation-agent", name: "Remediation Agent" },
  { event: "agent/remediation.run" },
  async ({ event, step }) => {
    const { incidentId, userId } = event.data;

    // Get incident and RCA
    const incident = await step.run("fetch-incident", async () => {
      return prisma.incident.findUnique({
        where: { id: incidentId },
        include: { events: true },
      });
    });

    if (!incident) throw new Error("Incident not found");

    const llmConfig = await step.run("get-llm-config", async () => {
      return getLLMConfig(userId);
    });

    if (!llmConfig) throw new Error("No AI provider configured");

    // Get RCA from events
    const rcaEvent = incident.events.find(e => e.type === "rca_completed");
    const rcaAnalysis = (rcaEvent?.data as any)?.analysis || "";

    // Generate remediation plan
    const remediation = await step.run("generate-remediation", async () => {
      const response = await llmComplete(llmConfig, [
        { role: "system", content: AGENT_PROMPTS.remediation },
        {
          role: "user",
          content: `Incident: ${incident.title}
Description: ${incident.description}
Severity: ${incident.severity}
Root Cause Analysis: ${rcaAnalysis}`,
        },
      ]);
      return response.content;
    });

    // Save remediation plan
    await step.run("save-remediation", async () => {
      await prisma.remediation.create({
        data: {
          incidentId,
          action: remediation,
          status: "pending",
        },
      });

      await prisma.incidentEvent.create({
        data: {
          incidentId,
          type: "remediation_suggested",
          message: "AI suggested remediation actions",
          data: { remediation },
        },
      });
    });

    return { incidentId, remediation };
  }
);

// Export all agent functions
export const agentFunctions = [
  monitoringAgent,
  rcaAgent,
  securityAgent,
  remediationAgent,
];
