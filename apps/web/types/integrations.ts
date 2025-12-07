export type IntegrationCategory = 
  | "scm"
  | "cicd"
  | "containerization"
  | "orchestration"
  | "iac"
  | "configuration"
  | "monitoring"
  | "cloud"
  | "security"
  | "artifact"
  | "collaboration"
  | "testing"
  | "backup"
  | "servicemesh"
  | "apigateway";

export interface IntegrationProvider {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  website: string;
  docsUrl: string;
  logo: string; // Path to logo or icon component name
  isPopular?: boolean;
  isNew?: boolean;
}

export interface IntegrationConnection {
  id: string;
  providerId: string;
  name: string;
  status: "connected" | "disconnected" | "error" | "pending";
  config: Record<string, any>;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface IntegrationConfigField {
  name: string;
  label: string;
  type: "text" | "password" | "select" | "boolean" | "file";
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[]; // For select type
  description?: string;
}

export const INTEGRATION_CATEGORIES: { id: IntegrationCategory; label: string; description: string }[] = [
  { id: "scm", label: "Source Control", description: "Version control and code repositories" },
  { id: "cicd", label: "CI/CD", description: "Continuous integration and delivery pipelines" },
  { id: "containerization", label: "Containerization", description: "Container runtimes and management" },
  { id: "orchestration", label: "Orchestration", description: "Container orchestration and scheduling" },
  { id: "iac", label: "Infrastructure as Code", description: "Infrastructure provisioning and management" },
  { id: "monitoring", label: "Monitoring & Observability", description: "Metrics, logging, and tracing" },
  { id: "cloud", label: "Cloud Platforms", description: "Public and private cloud providers" },
  { id: "security", label: "Security", description: "Security scanning and secrets management" },
  { id: "artifact", label: "Artifacts", description: "Package and artifact registries" },
  { id: "collaboration", label: "Collaboration", description: "Project management and communication" },
  { id: "testing", label: "Testing", description: "Load testing and quality assurance" },
  { id: "backup", label: "Backup & Recovery", description: "Disaster recovery and backups" },
  { id: "servicemesh", label: "Service Mesh", description: "Service-to-service communication" },
  { id: "apigateway", label: "API Gateways", description: "API management and traffic control" },
];

export const INTEGRATION_PROVIDERS: IntegrationProvider[] = [
  // 1. SCM
  { id: "github", name: "GitHub", category: "scm", description: "Code hosting and collaboration", website: "https://github.com", docsUrl: "https://docs.github.com", logo: "github", isPopular: true },
  { id: "gitlab", name: "GitLab", category: "scm", description: "DevOps platform", website: "https://gitlab.com", docsUrl: "https://docs.gitlab.com", logo: "gitlab" },
  { id: "bitbucket", name: "Bitbucket", category: "scm", description: "Git solution for teams", website: "https://bitbucket.org", docsUrl: "https://support.atlassian.com/bitbucket-cloud/", logo: "bitbucket" },
  
  // 2. CI/CD
  { id: "jenkins", name: "Jenkins", category: "cicd", description: "Open source automation server", website: "https://jenkins.io", docsUrl: "https://www.jenkins.io/doc/", logo: "jenkins", isPopular: true },
  { id: "github-actions", name: "GitHub Actions", category: "cicd", description: "Automate your workflow", website: "https://github.com/features/actions", docsUrl: "https://docs.github.com/en/actions", logo: "github-actions", isPopular: true },
  { id: "circleci", name: "CircleCI", category: "cicd", description: "Continuous integration and delivery", website: "https://circleci.com", docsUrl: "https://circleci.com/docs/", logo: "circleci" },
  
  // 3. Containerization
  { id: "docker", name: "Docker", category: "containerization", description: "Develop, ship, and run anywhere", website: "https://docker.com", docsUrl: "https://docs.docker.com", logo: "docker", isPopular: true },
  
  // 4. Orchestration
  { id: "kubernetes", name: "Kubernetes", category: "orchestration", description: "Container orchestration", website: "https://kubernetes.io", docsUrl: "https://kubernetes.io/docs/", logo: "kubernetes", isPopular: true },
  { id: "eks", name: "Amazon EKS", category: "orchestration", description: "Managed Kubernetes service", website: "https://aws.amazon.com/eks/", docsUrl: "https://docs.aws.amazon.com/eks/", logo: "aws-eks" },
  
  // 5. IaC
  { id: "terraform", name: "Terraform", category: "iac", description: "Infrastructure as Code", website: "https://terraform.io", docsUrl: "https://developer.hashicorp.com/terraform/docs", logo: "terraform", isPopular: true },
  { id: "ansible", name: "Ansible", category: "iac", description: "Automation platform", website: "https://ansible.com", docsUrl: "https://docs.ansible.com", logo: "ansible" },
  
  // 6. Monitoring
  { id: "prometheus", name: "Prometheus", category: "monitoring", description: "Monitoring system and time series DB", website: "https://prometheus.io", docsUrl: "https://prometheus.io/docs/", logo: "prometheus", isPopular: true },
  { id: "grafana", name: "Grafana", category: "monitoring", description: "Operational dashboards", website: "https://grafana.com", docsUrl: "https://grafana.com/docs/", logo: "grafana", isPopular: true },
  { id: "datadog", name: "Datadog", category: "monitoring", description: "Cloud monitoring as a service", website: "https://datadoghq.com", docsUrl: "https://docs.datadoghq.com", logo: "datadog" },
  
  // 7. Cloud
  { id: "aws", name: "AWS", category: "cloud", description: "Amazon Web Services", website: "https://aws.amazon.com", docsUrl: "https://docs.aws.amazon.com", logo: "aws", isPopular: true },
  { id: "gcp", name: "Google Cloud", category: "cloud", description: "Google Cloud Platform", website: "https://cloud.google.com", docsUrl: "https://cloud.google.com/docs", logo: "gcp" },
  { id: "azure", name: "Azure", category: "cloud", description: "Microsoft Azure", website: "https://azure.microsoft.com", docsUrl: "https://learn.microsoft.com/en-us/azure/", logo: "azure" },
  
  // 8. Security
  { id: "vault", name: "Vault", category: "security", description: "Manage secrets and protect data", website: "https://www.vaultproject.io", docsUrl: "https://developer.hashicorp.com/vault/docs", logo: "vault" },
  { id: "snyk", name: "Snyk", category: "security", description: "Developer security platform", website: "https://snyk.io", docsUrl: "https://docs.snyk.io", logo: "snyk" },
  
  // 9. Collaboration
  { id: "slack", name: "Slack", category: "collaboration", description: "Team communication", website: "https://slack.com", docsUrl: "https://api.slack.com", logo: "slack", isPopular: true },
  { id: "jira", name: "Jira", category: "collaboration", description: "Issue and project tracking", website: "https://www.atlassian.com/software/jira", docsUrl: "https://support.atlassian.com/jira-software-cloud/", logo: "jira" },
  { id: "pagerduty", name: "PagerDuty", category: "collaboration", description: "Incident management platform", website: "https://pagerduty.com", docsUrl: "https://developer.pagerduty.com", logo: "pagerduty", isNew: true },
  { id: "opsgenie", name: "Opsgenie", category: "collaboration", description: "Alerting and on-call management", website: "https://www.atlassian.com/software/opsgenie", docsUrl: "https://support.atlassian.com/opsgenie/", logo: "opsgenie" },

  // 10. Additional CI/CD
  { id: "argocd", name: "ArgoCD", category: "cicd", description: "GitOps continuous delivery", website: "https://argoproj.github.io/cd/", docsUrl: "https://argo-cd.readthedocs.io", logo: "argocd", isPopular: true, isNew: true },
  { id: "gitlab-ci", name: "GitLab CI", category: "cicd", description: "Built-in continuous integration", website: "https://gitlab.com", docsUrl: "https://docs.gitlab.com/ee/ci/", logo: "gitlab" },
  { id: "travis-ci", name: "Travis CI", category: "cicd", description: "Hosted continuous integration", website: "https://travis-ci.com", docsUrl: "https://docs.travis-ci.com", logo: "travis" },
  { id: "teamcity", name: "TeamCity", category: "cicd", description: "JetBrains CI/CD server", website: "https://www.jetbrains.com/teamcity/", docsUrl: "https://www.jetbrains.com/help/teamcity/", logo: "teamcity" },

  // 11. Additional Monitoring
  { id: "newrelic", name: "New Relic", category: "monitoring", description: "Full-stack observability", website: "https://newrelic.com", docsUrl: "https://docs.newrelic.com", logo: "newrelic", isPopular: true },
  { id: "splunk", name: "Splunk", category: "monitoring", description: "Data platform for security", website: "https://splunk.com", docsUrl: "https://docs.splunk.com", logo: "splunk" },
  { id: "elastic", name: "Elastic Stack", category: "monitoring", description: "Search and observability", website: "https://elastic.co", docsUrl: "https://www.elastic.co/guide/", logo: "elastic" },
  { id: "loki", name: "Grafana Loki", category: "monitoring", description: "Log aggregation system", website: "https://grafana.com/oss/loki/", docsUrl: "https://grafana.com/docs/loki/", logo: "loki" },

  // 12. Package Management
  { id: "helm", name: "Helm", category: "iac", description: "Kubernetes package manager", website: "https://helm.sh", docsUrl: "https://helm.sh/docs/", logo: "helm", isPopular: true },
  { id: "pulumi", name: "Pulumi", category: "iac", description: "Infrastructure as code in any language", website: "https://pulumi.com", docsUrl: "https://www.pulumi.com/docs/", logo: "pulumi", isNew: true },

  // 13. Artifact Registries
  { id: "harbor", name: "Harbor", category: "artifact", description: "Cloud native registry", website: "https://goharbor.io", docsUrl: "https://goharbor.io/docs/", logo: "harbor", isPopular: true },
  { id: "nexus", name: "Nexus Repository", category: "artifact", description: "Universal artifact repository", website: "https://www.sonatype.com/nexus", docsUrl: "https://help.sonatype.com/repomanager3", logo: "nexus" },
  { id: "artifactory", name: "JFrog Artifactory", category: "artifact", description: "Universal artifact management", website: "https://jfrog.com/artifactory/", docsUrl: "https://jfrog.com/help/", logo: "artifactory" },

  // 14. Additional Security
  { id: "sonarqube", name: "SonarQube", category: "security", description: "Code quality and security", website: "https://sonarqube.org", docsUrl: "https://docs.sonarsource.com/sonarqube/", logo: "sonarqube", isPopular: true },
  { id: "trivy", name: "Trivy", category: "security", description: "Container vulnerability scanner", website: "https://trivy.dev", docsUrl: "https://aquasecurity.github.io/trivy/", logo: "trivy", isNew: true },
  { id: "checkov", name: "Checkov", category: "security", description: "Policy as code for IaC", website: "https://www.checkov.io", docsUrl: "https://www.checkov.io/1.Welcome/Quick%20Start.html", logo: "checkov" },
  { id: "falco", name: "Falco", category: "security", description: "Runtime security", website: "https://falco.org", docsUrl: "https://falco.org/docs/", logo: "falco" },

  // 15. Service Mesh
  { id: "istio", name: "Istio", category: "servicemesh", description: "Connect, secure, control microservices", website: "https://istio.io", docsUrl: "https://istio.io/latest/docs/", logo: "istio", isPopular: true },
  { id: "linkerd", name: "Linkerd", category: "servicemesh", description: "Ultralight service mesh", website: "https://linkerd.io", docsUrl: "https://linkerd.io/2.14/overview/", logo: "linkerd" },

  // 16. API Gateways
  { id: "kong", name: "Kong", category: "apigateway", description: "API gateway and platform", website: "https://konghq.com", docsUrl: "https://docs.konghq.com", logo: "kong", isPopular: true },
  { id: "nginx", name: "NGINX", category: "apigateway", description: "Web server and reverse proxy", website: "https://nginx.org", docsUrl: "https://nginx.org/en/docs/", logo: "nginx" },
];
