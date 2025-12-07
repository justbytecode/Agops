// GitHub API Integration
// Used by AI agents to manage repositories, pipelines, and deployments

import { prisma } from "@/lib/db";

interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  language: string | null;
  updated_at: string;
}

interface GitHubWorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
}

export class GitHubClient {
  private accessToken: string;
  private baseUrl = "https://api.github.com";

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // User operations
  async getAuthenticatedUser(): Promise<GitHubUser> {
    return this.request<GitHubUser>("/user");
  }

  // Repository operations
  async listRepositories(options: { sort?: string; per_page?: number } = {}): Promise<GitHubRepo[]> {
    const params = new URLSearchParams({
      sort: options.sort || "updated",
      per_page: String(options.per_page || 30),
    });
    return this.request<GitHubRepo[]>(`/user/repos?${params}`);
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    return this.request<GitHubRepo>(`/repos/${owner}/${repo}`);
  }

  // Workflow operations (GitHub Actions)
  async listWorkflowRuns(
    owner: string,
    repo: string,
    options: { status?: string; per_page?: number } = {}
  ): Promise<{ workflow_runs: GitHubWorkflowRun[] }> {
    const params = new URLSearchParams({
      per_page: String(options.per_page || 10),
    });
    if (options.status) params.set("status", options.status);
    
    return this.request(`/repos/${owner}/${repo}/actions/runs?${params}`);
  }

  async triggerWorkflow(
    owner: string,
    repo: string,
    workflowId: string,
    ref: string,
    inputs?: Record<string, string>
  ): Promise<void> {
    await this.request(`/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`, {
      method: "POST",
      body: JSON.stringify({ ref, inputs }),
    });
  }

  async rerunWorkflow(owner: string, repo: string, runId: number): Promise<void> {
    await this.request(`/repos/${owner}/${repo}/actions/runs/${runId}/rerun`, {
      method: "POST",
    });
  }

  async cancelWorkflow(owner: string, repo: string, runId: number): Promise<void> {
    await this.request(`/repos/${owner}/${repo}/actions/runs/${runId}/cancel`, {
      method: "POST",
    });
  }

  // Deployment operations
  async listDeployments(owner: string, repo: string): Promise<any[]> {
    return this.request(`/repos/${owner}/${repo}/deployments`);
  }

  async createDeployment(
    owner: string,
    repo: string,
    ref: string,
    environment: string,
    description?: string
  ): Promise<any> {
    return this.request(`/repos/${owner}/${repo}/deployments`, {
      method: "POST",
      body: JSON.stringify({
        ref,
        environment,
        description,
        auto_merge: false,
        required_contexts: [],
      }),
    });
  }

  // Webhook operations
  async listWebhooks(owner: string, repo: string): Promise<any[]> {
    return this.request(`/repos/${owner}/${repo}/hooks`);
  }

  async createWebhook(
    owner: string,
    repo: string,
    url: string,
    events: string[],
    secret?: string
  ): Promise<any> {
    return this.request(`/repos/${owner}/${repo}/hooks`, {
      method: "POST",
      body: JSON.stringify({
        name: "web",
        active: true,
        events,
        config: {
          url,
          content_type: "json",
          secret,
        },
      }),
    });
  }

  // Branch protection
  async getBranchProtection(owner: string, repo: string, branch: string): Promise<any> {
    return this.request(`/repos/${owner}/${repo}/branches/${branch}/protection`);
  }

  // Commits and PRs
  async listCommits(owner: string, repo: string, options: { sha?: string; per_page?: number } = {}): Promise<any[]> {
    const params = new URLSearchParams({ per_page: String(options.per_page || 10) });
    if (options.sha) params.set("sha", options.sha);
    return this.request(`/repos/${owner}/${repo}/commits?${params}`);
  }

  async listPullRequests(owner: string, repo: string, state: string = "open"): Promise<any[]> {
    return this.request(`/repos/${owner}/${repo}/pulls?state=${state}`);
  }
}

// Factory function to get GitHub client for a tenant
export async function getGitHubClient(tenantId: string): Promise<GitHubClient | null> {
  const connection = await prisma.oAuthConnection.findUnique({
    where: {
      tenantId_provider: {
        tenantId,
        provider: "GITHUB",
      },
    },
  });

  if (!connection || connection.status !== "connected") {
    return null;
  }

  return new GitHubClient(connection.accessToken);
}
