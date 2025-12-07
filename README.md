# AgentOps Platform

[![CI](https://github.com/yourusername/agentops/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/agentops/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An AI-powered DevOps platform that uses autonomous agents to monitor, diagnose, and remediate infrastructure issues automatically.

## 🚀 Features

- **AI-Powered Monitoring**: Intelligent agents continuously monitor your infrastructure
- **Automated RCA**: Root cause analysis using LangGraph AI agents
- **Auto-Remediation**: Autonomous issue resolution with approval workflows
- **50+ Integrations**: Connect with GitHub, Kubernetes, AWS, monitoring tools, and more
- **Real-time Dashboard**: Beautiful Next.js 15 interface with live updates
- **Multi-tenant**: Enterprise-ready with team management and RBAC

## 📁 Project Structure

```
agentops/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   ├── api/          # FastAPI backend
│   └── agents/       # LangGraph AI agents
├── packages/
│   ├── database/     # Prisma schema
│   ├── types/        # Shared TypeScript types
│   └── ui/           # Shared UI components
└── infra/            # Docker, Terraform, K8s configs
```

## 🛠️ Tech Stack

### Frontend
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- React Query for data fetching

### Backend
- FastAPI (Python)
- PostgreSQL + Prisma
- Redis for caching
- WebSockets for real-time updates

### AI Agents
- LangGraph for agent workflows
- OpenAI/Anthropic for LLM
- Vector store for memory

### Infrastructure
- Docker & Docker Compose
- Terraform for IaC
- Kubernetes for orchestration
- GitHub Actions for CI/CD

## 🚦 Quick Start

### Prerequisites
- Node.js >= 18
- Python >= 3.11
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/justbytecode/agentops.git
cd agentops
```

2. **Install dependencies**
```bash
npm install
cd apps/api && pip install -r requirements.txt
cd ../agents && pip install -r requirements.txt
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start with Docker Compose**
```bash
docker-compose up -d
```

5. **Run database migrations**
```bash
npm run db:migrate
npm run db:seed
```

6. **Access the application**
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Grafana: http://localhost:3001

## 🧪 Development

### Frontend Development
```bash
npm run web:dev
```

### Backend Development
```bash
npm run api:dev
```

### Agents Development
```bash
npm run agents:dev
```

### Run all services
```bash
npm run dev
```

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Agent Workflows](./docs/agents.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing](./CONTRIBUTING.md)

## 🔒 Security

- JWT-based authentication
- Role-based access control (RBAC)
- API rate limiting
- Secrets management with environment variables
- Regular security audits

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run frontend tests
npm run test --workspace=apps/web

# Run backend tests
cd apps/api && pytest
```

## 📦 Deployment

### Docker
```bash
docker-compose -f docker-compose.yml up -d
```

### Kubernetes
```bash
kubectl apply -f infra/kubernetes/
```

### Cloud Platforms
- See [AWS Deployment](./docs/deploy-aws.md)
- See [GCP Deployment](./docs/deploy-gcp.md)
- See [Azure Deployment](./docs/deploy-azure.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👥 Team

- Your Name - [@yourhandle](https://twitter.com/yourhandle)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [LangGraph](https://langchain.com/langgraph)

---

Made with ❤️ by the AgentOps team
