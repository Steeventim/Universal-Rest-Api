# TP-08 : Déploiement et Production 🚀

## 📋 Informations Générales

- **Durée estimée** : 6-8 heures
- **Niveau** : Bronze → Silver → Gold
- **Prérequis** : TP-01 à TP-07 complétés
- **Objectifs** : Déployer une API en production avec monitoring et CI/CD

## 🎯 Objectifs d'Apprentissage

### 🥉 Bronze - Déploiement Basique
- Conteneurisation avec Docker
- Déploiement cloud simple
- Variables d'environnement
- Logs de base

### 🥈 Silver - CI/CD et Monitoring
- Pipeline CI/CD automatisé
- Tests automatisés en pipeline
- Monitoring avec métriques
- Backup et récupération

### 🥇 Gold - Production Enterprise
- Infrastructure as Code (IaC)
- Auto-scaling et load balancing
- Observabilité complète (logs, métriques, traces)
- Déploiement multi-environnements

## 📚 Concepts Théoriques

### 1. Conteneurisation Docker

#### Dockerfile Optimisé
```dockerfile
# Multi-stage build pour optimiser la taille
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
RUN apk add --no-cache dumb-init
USER node
WORKDIR /app
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]
```

#### Docker Compose pour Développement
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    depends_on:
      - redis
      - postgres
    volumes:
      - .:/app
      - /app/node_modules

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: api_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes

volumes:
  postgres_data:
```

### 2. CI/CD avec GitHub Actions

#### Pipeline Complet
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - run: npm ci
    - run: npm run lint
    - run: npm run test:unit
    - run: npm run test:integration
    - run: npm run test:e2e
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3

  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - run: npm audit
    - run: npm run security:check

  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: docker build -t api:${{ github.sha }} .
    
    - name: Run security scan
      run: |
        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
          aquasec/trivy image api:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to staging
      run: echo "Deploying to staging..."
    
    - name: Run smoke tests
      run: echo "Running smoke tests..."
    
    - name: Deploy to production
      if: success()
      run: echo "Deploying to production..."
```

### 3. Monitoring et Observabilité

#### Métriques avec Prometheus
```javascript
const promClient = require('prom-client');

// Métriques custom
const httpRequests = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

// Middleware de métriques
function metricsMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.url;
    
    httpRequests.inc({
      method: req.method,
      route,
      status: res.statusCode
    });
    
    httpDuration.observe({
      method: req.method,
      route,
      status: res.statusCode
    }, duration);
  });
  
  next();
}
```

#### Health Checks
```javascript
const healthChecks = {
  async database() {
    try {
      await db.raw('SELECT 1');
      return { status: 'healthy', latency: '< 10ms' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  },

  async redis() {
    try {
      await redis.ping();
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  },

  async externalAPI() {
    try {
      const start = Date.now();
      await fetch('https://api.external.com/health');
      const latency = Date.now() - start;
      return { status: 'healthy', latency: `${latency}ms` };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
};

app.get('/health', async (req, res) => {
  const checks = {};
  let allHealthy = true;

  for (const [name, check] of Object.entries(healthChecks)) {
    try {
      checks[name] = await check();
      if (checks[name].status !== 'healthy') {
        allHealthy = false;
      }
    } catch (error) {
      checks[name] = { status: 'error', error: error.message };
      allHealthy = false;
    }
  }

  const status = allHealthy ? 200 : 503;
  res.status(status).json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks
  });
});
```

### 4. Infrastructure as Code (Terraform)

#### Configuration AWS
```hcl
# main.tf
provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "api-vpc"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "api-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "api-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets           = aws_subnet.public[*].id

  enable_deletion_protection = false
}

# Auto Scaling
resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.main.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# CloudWatch Monitoring
resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/api"
  retention_in_days = 30
}
```

### 5. Sécurité en Production

#### Configuration Nginx
```nginx
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/api.example.com.crt;
    ssl_certificate_key /etc/ssl/private/api.example.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_dhparam /etc/ssl/certs/dhparam.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types application/json text/plain text/css text/xml;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /health {
        access_log off;
        proxy_pass http://127.0.0.1:3000/health;
    }

    location /metrics {
        deny all;
        return 403;
    }
}
```

## 🛠️ Exercices Pratiques

### Bronze : Conteneurisation et Déploiement Simple

#### Exercice B1 : Docker Setup
1. Créer un Dockerfile optimisé
2. Configurer docker-compose pour dev
3. Implémenter health checks
4. Déployer sur cloud provider

#### Exercice B2 : Variables d'Environnement
1. Externaliser toute la configuration
2. Valider les variables au démarrage
3. Créer différents environnements (dev/staging/prod)
4. Sécuriser les secrets

### Silver : CI/CD et Monitoring

#### Exercice S1 : Pipeline CI/CD
1. Configurer GitHub Actions
2. Tests automatisés multi-env
3. Build et push Docker images
4. Déploiement automatisé

#### Exercice S2 : Monitoring Avancé
1. Métriques Prometheus custom
2. Dashboards Grafana
3. Alerting intelligent
4. Log aggregation

### Gold : Production Enterprise

#### Exercice G1 : Infrastructure as Code
1. Terraform pour AWS/Azure
2. Auto-scaling configuré
3. Load balancing multi-AZ
4. Backup automatisé

#### Exercice G2 : Observabilité Complète
1. Distributed tracing
2. Error tracking (Sentry)
3. Performance monitoring (APM)
4. Business metrics

## 📈 Métriques de Performance

### SLA (Service Level Agreement)
- **Uptime** : 99.9% (8.76h downtime/an)
- **Response Time** : P95 < 200ms
- **Throughput** : 1000 req/s minimum
- **Error Rate** : < 0.1%

### Indicateurs Clés
- **MTTR** (Mean Time To Recovery) : < 15 minutes
- **MTBF** (Mean Time Between Failures) : > 30 jours
- **Deployment Frequency** : Multiple fois par jour
- **Lead Time** : < 24h de commit à production

## 🎓 Livrables

### Bronze
- [ ] Application conteneurisée
- [ ] Déploiement cloud fonctionnel
- [ ] Health checks implémentés
- [ ] Documentation déploiement

### Silver
- [ ] Pipeline CI/CD complet
- [ ] Monitoring avec alertes
- [ ] Tests automatisés en pipeline
- [ ] Rollback automatique

### Gold
- [ ] Infrastructure as Code
- [ ] Auto-scaling configuré
- [ ] Observabilité complète
- [ ] Disaster recovery plan

## 🏆 Certification Finale

### Portfolio Complet
À la fin de ce TP, les étudiants auront :
- Une API REST enterprise-grade
- Pipeline CI/CD professionnel
- Infrastructure scalable
- Monitoring production-ready

### Compétences Certifiées
- **DevOps Engineer** : CI/CD et infrastructure
- **Site Reliability Engineer** : Monitoring et observabilité
- **Cloud Architect** : Solutions cloud natives
- **Production Engineer** : Déploiement à grande échelle

---

*Ce TP conclut la formation complète sur les APIs REST avec TypeScript, couvrant tous les aspects du développement à la production.*
