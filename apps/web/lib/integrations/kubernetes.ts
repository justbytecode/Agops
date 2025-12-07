// Kubernetes Integration Client
// Used by AI agents to manage K8s clusters

import { prisma } from "@/lib/db";

interface K8sConfig {
  apiServer: string;
  token: string;
  caCert?: string;
}

interface K8sPod {
  name: string;
  namespace: string;
  status: string;
  containerStatuses: { name: string; ready: boolean; restartCount: number }[];
  nodeName: string;
  createdAt: string;
}

interface K8sDeployment {
  name: string;
  namespace: string;
  replicas: number;
  availableReplicas: number;
  images: string[];
  createdAt: string;
}

interface K8sService {
  name: string;
  namespace: string;
  type: string;
  clusterIP: string;
  externalIP?: string;
  ports: { port: number; targetPort: number; protocol: string }[];
}

interface K8sNode {
  name: string;
  status: string;
  roles: string[];
  version: string;
  cpu: string;
  memory: string;
}

export class KubernetesClient {
  private config: K8sConfig;

  constructor(config: K8sConfig) {
    this.config = config;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.config.apiServer}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.config.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      // In production, handle CA cert validation
    });

    if (!response.ok) {
      throw new Error(`K8s API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Cluster info
  async getClusterInfo(): Promise<any> {
    return this.request("/version");
  }

  // Namespaces
  async listNamespaces(): Promise<string[]> {
    const result = await this.request<any>("/api/v1/namespaces");
    return result.items?.map((ns: any) => ns.metadata.name) || [];
  }

  // Pods
  async listPods(namespace: string = "default"): Promise<K8sPod[]> {
    const result = await this.request<any>(`/api/v1/namespaces/${namespace}/pods`);
    return (result.items || []).map((pod: any) => ({
      name: pod.metadata.name,
      namespace: pod.metadata.namespace,
      status: pod.status.phase,
      containerStatuses: pod.status.containerStatuses || [],
      nodeName: pod.spec.nodeName,
      createdAt: pod.metadata.creationTimestamp,
    }));
  }

  async getPod(namespace: string, name: string): Promise<K8sPod | null> {
    try {
      const pod = await this.request<any>(`/api/v1/namespaces/${namespace}/pods/${name}`);
      return {
        name: pod.metadata.name,
        namespace: pod.metadata.namespace,
        status: pod.status.phase,
        containerStatuses: pod.status.containerStatuses || [],
        nodeName: pod.spec.nodeName,
        createdAt: pod.metadata.creationTimestamp,
      };
    } catch {
      return null;
    }
  }

  async deletePod(namespace: string, name: string): Promise<void> {
    await this.request(`/api/v1/namespaces/${namespace}/pods/${name}`, {
      method: "DELETE",
    });
  }

  async getPodLogs(namespace: string, name: string, container?: string, tailLines: number = 100): Promise<string> {
    const params = new URLSearchParams({ tailLines: String(tailLines) });
    if (container) params.set("container", container);
    
    const response = await fetch(
      `${this.config.apiServer}/api/v1/namespaces/${namespace}/pods/${name}/log?${params}`,
      {
        headers: { Authorization: `Bearer ${this.config.token}` },
      }
    );
    return response.text();
  }

  // Deployments
  async listDeployments(namespace: string = "default"): Promise<K8sDeployment[]> {
    const result = await this.request<any>(`/apis/apps/v1/namespaces/${namespace}/deployments`);
    return (result.items || []).map((dep: any) => ({
      name: dep.metadata.name,
      namespace: dep.metadata.namespace,
      replicas: dep.spec.replicas,
      availableReplicas: dep.status.availableReplicas || 0,
      images: dep.spec.template.spec.containers.map((c: any) => c.image),
      createdAt: dep.metadata.creationTimestamp,
    }));
  }

  async scaleDeployment(namespace: string, name: string, replicas: number): Promise<void> {
    await this.request(`/apis/apps/v1/namespaces/${namespace}/deployments/${name}/scale`, {
      method: "PATCH",
      headers: { "Content-Type": "application/strategic-merge-patch+json" },
      body: JSON.stringify({ spec: { replicas } }),
    });
  }

  async restartDeployment(namespace: string, name: string): Promise<void> {
    // Trigger rollout restart by patching annotation
    await this.request(`/apis/apps/v1/namespaces/${namespace}/deployments/${name}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/strategic-merge-patch+json" },
      body: JSON.stringify({
        spec: {
          template: {
            metadata: {
              annotations: {
                "kubectl.kubernetes.io/restartedAt": new Date().toISOString(),
              },
            },
          },
        },
      }),
    });
  }

  async rollbackDeployment(namespace: string, name: string): Promise<void> {
    // Get current revision and rollback
    await this.request(`/apis/apps/v1/namespaces/${namespace}/deployments/${name}/rollback`, {
      method: "POST",
      body: JSON.stringify({
        name,
        rollbackTo: { revision: 0 }, // Previous revision
      }),
    });
  }

  // Services
  async listServices(namespace: string = "default"): Promise<K8sService[]> {
    const result = await this.request<any>(`/api/v1/namespaces/${namespace}/services`);
    return (result.items || []).map((svc: any) => ({
      name: svc.metadata.name,
      namespace: svc.metadata.namespace,
      type: svc.spec.type,
      clusterIP: svc.spec.clusterIP,
      externalIP: svc.status.loadBalancer?.ingress?.[0]?.ip,
      ports: svc.spec.ports,
    }));
  }

  // Nodes
  async listNodes(): Promise<K8sNode[]> {
    const result = await this.request<any>("/api/v1/nodes");
    return (result.items || []).map((node: any) => ({
      name: node.metadata.name,
      status: node.status.conditions.find((c: any) => c.type === "Ready")?.status === "True" ? "Ready" : "NotReady",
      roles: Object.keys(node.metadata.labels || {})
        .filter((l) => l.startsWith("node-role.kubernetes.io/"))
        .map((l) => l.replace("node-role.kubernetes.io/", "")),
      version: node.status.nodeInfo.kubeletVersion,
      cpu: node.status.capacity.cpu,
      memory: node.status.capacity.memory,
    }));
  }

  // Events (for incident detection)
  async listEvents(namespace: string = "default", fieldSelector?: string): Promise<any[]> {
    const params = fieldSelector ? `?fieldSelector=${encodeURIComponent(fieldSelector)}` : "";
    const result = await this.request<any>(`/api/v1/namespaces/${namespace}/events${params}`);
    return result.items || [];
  }

  // ConfigMaps and Secrets
  async listConfigMaps(namespace: string = "default"): Promise<any[]> {
    const result = await this.request<any>(`/api/v1/namespaces/${namespace}/configmaps`);
    return result.items || [];
  }

  async listSecrets(namespace: string = "default"): Promise<any[]> {
    const result = await this.request<any>(`/api/v1/namespaces/${namespace}/secrets`);
    return (result.items || []).map((s: any) => ({
      name: s.metadata.name,
      type: s.type,
      // Don't expose actual secret data
    }));
  }
}

// Factory function to get Kubernetes client for a tenant
export async function getKubernetesClient(tenantId: string): Promise<KubernetesClient | null> {
  const connection = await prisma.oAuthConnection.findUnique({
    where: {
      tenantId_provider: {
        tenantId,
        provider: "KUBERNETES" as any, // Need to add to enum
      },
    },
  });

  if (!connection || connection.status !== "connected") {
    return null;
  }

  const metadata = connection.metadata as any;
  if (!metadata?.apiServer || !metadata?.token) {
    return null;
  }

  return new KubernetesClient({
    apiServer: metadata.apiServer,
    token: metadata.token,
    caCert: metadata.caCert,
  });
}
