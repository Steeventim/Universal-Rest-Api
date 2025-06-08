# TP-08 : Déploiement et Production - Exercices Pratiques

## 🏆 Objectifs du TP
- Containeriser une application Node.js/TypeScript avec Docker
- Implémenter un pipeline CI/CD complet
- Configurer le monitoring et l'observabilité
- Déployer sur un environnement de production
- Gérer l'infrastructure as code

---

## 📋 Prérequis
- Connaissance de Docker et conteneurs
- Notions de base en DevOps
- Compte GitHub/GitLab
- Accès à un service cloud (AWS/GCP/Azure)
- Installation locale : Docker, kubectl, terraform

---

## 🥉 Niveau Bronze - Containerisation de Base

### Exercice 1 : Docker Basics
**Objectif** : Containeriser votre API REST TypeScript

**Étapes** :
1. Créer un Dockerfile multi-stage optimisé
2. Configurer docker-compose pour dev/test
3. Implémenter health checks
4. Optimiser la taille de l'image

**Critères de réussite** :
- Image Docker < 200MB
- Temps de build < 3 minutes
- Health check fonctionnel
- Variables d'environnement sécurisées

**Livrables** :
```
docker/
├── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
└── .dockerignore
```

### Exercice 2 : Orchestration Locale
**Objectif** : Déployer avec Docker Compose

**Services à configurer** :
- API Node.js/TypeScript
- Base de données PostgreSQL
- Redis (cache)
- Nginx (reverse proxy)

**Fonctionnalités** :
- Réseau Docker isolé
- Volumes persistants
- Secrets management
- Load balancing basique

---

## 🥈 Niveau Silver - CI/CD et Automatisation

### Exercice 3 : Pipeline CI/CD
**Objectif** : Automatiser le déploiement avec GitHub Actions

**Pipeline stages** :
1. **Build & Test** : Tests unitaires, intégration, linting
2. **Security** : Scan de vulnérabilités, audit dépendances
3. **Build Image** : Construction et push Docker
4. **Deploy Staging** : Déploiement automatique
5. **Tests E2E** : Tests de bout en bout
6. **Deploy Production** : Déploiement manuel ou automatique

**Configuration** :
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    # Tests complets
  security:
    # Scans sécurité
  build:
    # Build et push image
  deploy-staging:
    # Déploiement staging
  e2e-tests:
    # Tests E2E
  deploy-production:
    # Déploiement prod
```

### Exercice 4 : Infrastructure as Code
**Objectif** : Automatiser l'infrastructure avec Terraform

**Ressources à créer** :
- VPC et sous-réseaux
- Cluster Kubernetes (EKS/GKE)
- Base de données managée
- Load balancer
- DNS et certificats SSL

**Structure** :
```
terraform/
├── modules/
│   ├── vpc/
│   ├── eks/
│   └── rds/
├── environments/
│   ├── staging/
│   └── production/
└── main.tf
```

---

## 🥇 Niveau Gold - Production et Monitoring

### Exercice 5 : Monitoring et Observabilité
**Objectif** : Implémenter un monitoring complet

**Stack de monitoring** :
- **Métriques** : Prometheus + Grafana
- **Logs** : ELK Stack (Elasticsearch, Logstash, Kibana)
- **Traces** : Jaeger/Zipkin
- **Alerting** : AlertManager + Slack/PagerDuty

**Dashboards à créer** :
1. **Application** : Requêtes, erreurs, latence
2. **Infrastructure** : CPU, mémoire, réseau
3. **Business** : Utilisateurs actifs, revenus
4. **Sécurité** : Tentatives d'intrusion, anomalies

**Alertes** :
- Taux d'erreur > 5%
- Latence > 2s
- CPU > 80%
- Espace disque < 10%

### Exercice 6 : Sécurité et Compliance
**Objectif** : Sécuriser l'infrastructure et l'application

**Mesures de sécurité** :
1. **Réseau** : VPN, pare-feu, segmentation
2. **Authentification** : RBAC, OAuth2, certificats
3. **Secrets** : Vault, sealed secrets Kubernetes
4. **Scanning** : Images, code, dépendances
5. **Audit** : Logs d'accès, conformité GDPR

**Outils** :
- Falco (runtime security)
- OPA (Open Policy Agent)
- Vault (secrets management)
- Trivy (vulnerability scanning)

### Exercice 7 : Performance et Scalabilité
**Objectif** : Optimiser pour la production

**Optimisations** :
1. **Auto-scaling** : HPA, VPA, cluster autoscaler
2. **Caching** : Redis, CDN, application cache
3. **Base de données** : Replicas read-only, connection pooling
4. **Load testing** : K6, Artillery, JMeter

**Métriques cibles** :
- Disponibilité : 99.9%
- Latence P95 : < 500ms
- Throughput : 1000 req/s
- MTTR : < 15 minutes

---

## 🚀 Projet Final : E-commerce Production

### Description
Déployer l'API e-commerce développée dans les TPs précédents avec une architecture production complète.

### Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │────│   API Gateway   │────│   Microservices │
│   (ALB/NLB)     │    │   (Kong/Envoy)  │    │   (Users, Orders│
└─────────────────┘    └─────────────────┘    │   Products, Pay)│
                                              └─────────────────┘
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Monitoring    │    │   Databases     │    │   Message Queue │
│   (Prometheus)  │    │   (PostgreSQL)  │    │   (RabbitMQ)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Fonctionnalités
- **Multi-tenant** : Isolation par client
- **Géo-distribution** : Déploiement multi-région
- **Disaster recovery** : Backup automatique
- **Blue/Green deployment** : Zéro downtime
- **Canary releases** : Déploiement progressif

### Livrables
1. **Code** : Application prête pour la production
2. **Infrastructure** : Terraform/Ansible playbooks
3. **CI/CD** : Pipeline automatisé
4. **Monitoring** : Dashboards et alertes
5. **Documentation** : Runbooks opérationnels
6. **Tests** : Suite complète de tests

### Critères d'évaluation
- **Fonctionnalité** : Toutes les features fonctionnent
- **Performance** : Répond aux SLAs
- **Sécurité** : Aucune vulnérabilité critique
- **Fiabilité** : Haute disponibilité
- **Observabilité** : Monitoring complet
- **Automatisation** : Déploiement sans intervention

---

## 📚 Ressources Complémentaires

### Documentation
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Terraform Guides](https://learn.hashicorp.com/terraform)
- [Prometheus Monitoring](https://prometheus.io/docs/)

### Outils Recommandés
- **Container Registry** : Harbor, ECR, GCR
- **Service Mesh** : Istio, Linkerd
- **GitOps** : ArgoCD, Flux
- **Policy as Code** : OPA, Falco

### Bonnes Pratiques
1. **12-Factor App** : Methodology pour applications cloud-native
2. **Zero Trust Security** : Sécurité par défaut
3. **Observability** : Logs, métriques, traces
4. **Chaos Engineering** : Tests de résilience
5. **SRE Practices** : Site Reliability Engineering

---

## 🎯 Conseil pour la Réussite

### Approche Progressive
1. **Commencer simple** : Docker local d'abord
2. **Automatiser progressivement** : Pipeline étape par étape
3. **Monitorer dès le début** : Logs et métriques essentiels
4. **Sécuriser par défaut** : Principe de moindre privilège
5. **Documenter tout** : Runbooks et procédures

### Pièges à Éviter
- Sur-engineering dès le début
- Négliger la sécurité
- Oublier le monitoring
- Configuration manuelle
- Secrets en dur dans le code

**Bonne chance pour votre déploiement en production ! 🚀**
