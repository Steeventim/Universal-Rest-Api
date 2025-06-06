# 🎓 Guide de TP Progressif - Universal REST API

Ce guide propose un parcours d'apprentissage progressif avec 8 niveaux, chacun dans sa propre branche Git.

## 📚 **Parcours d'apprentissage**

### **🔰 Niveau 1 : Découverte (branche: `tp-01-decouverte`)**
**Objectif :** Comprendre la structure et faire fonctionner l'API de base
- [x] Installation et premier démarrage
- [x] Explorer l'interface Swagger
- [x] Tester les endpoints existants
- [x] Comprendre la structure des dossiers

**Durée estimée :** 1-2 heures

### **🔧 Niveau 2 : Premiers pas (branche: `tp-02-premiers-pas`)**
**Objectif :** Modifier les données et comprendre le flow
- [ ] Modifier les données de test dans le service
- [ ] Ajouter de nouveaux items via l'API
- [ ] Comprendre le cycle request → controller → service
- [ ] Analyser les réponses JSON

**Durée estimée :** 2-3 heures

### **⚡ Niveau 3 : Validation (branche: `tp-03-validation`)**
**Objectif :** Maîtriser la validation des données avec Zod
- [ ] Comprendre les schémas de validation
- [ ] Ajouter de nouveaux champs à valider
- [ ] Tester les erreurs de validation
- [ ] Créer des messages d'erreur personnalisés

**Durée estimée :** 3-4 heures

### **🧪 Niveau 4 : Tests (branche: `tp-04-tests`)**
**Objectif :** Comprendre et écrire des tests
- [ ] Analyser les tests existants
- [ ] Écrire de nouveaux tests unitaires
- [ ] Créer des tests d'intégration
- [ ] Utiliser les mocks et stubs

**Durée estimée :** 4-5 heures

### **🔐 Niveau 5 : Sécurité (branche: `tp-05-securite`)**
**Objectif :** Implémenter l'authentification et la sécurité
- [ ] Activer l'authentification JWT
- [ ] Protéger des endpoints
- [ ] Tester les tokens d'authentification
- [ ] Gérer les rôles utilisateurs

**Durée estimée :** 5-6 heures

### **🗄️ Niveau 6 : Base de données (branche: `tp-06-database`)**
**Objectif :** Remplacer les données en mémoire par une vraie DB
- [ ] Intégrer MongoDB ou PostgreSQL
- [ ] Créer les modèles de données
- [ ] Migrer le service vers la DB
- [ ] Gérer les connexions et erreurs

**Durée estimée :** 6-8 heures

### **🚀 Niveau 7 : API Avancée (branche: `tp-07-api-avancee`)**
**Objectif :** Ajouter des fonctionnalités avancées
- [ ] Pagination des résultats
- [ ] Filtres et recherche
- [ ] Upload de fichiers
- [ ] Versioning de l'API

**Durée estimée :** 8-10 heures

### **🐳 Niveau 8 : Déploiement (branche: `tp-08-deploiement`)**
**Objectif :** Déployer en production
- [ ] Optimiser pour la production
- [ ] Configurer Docker
- [ ] Mettre en place CI/CD
- [ ] Déployer sur le cloud

**Durée estimée :** 6-8 heures

---

## 🎯 **Comment utiliser ce guide**

### **1. Prérequis**
- Node.js 18+ installé
- Git installé
- Un éditeur de code (VS Code recommandé)
- Bases de JavaScript/ES6

### **2. Démarrage**
```bash
# Cloner le projet
git clone <votre-repo>
cd universal-rest-api

# Commencer par le TP 1
git checkout tp-01-decouverte

# Suivre les instructions du README du TP
```

### **3. Progression**
- Chaque branche contient un `README_TP.md` avec les instructions détaillées
- Des fichiers d'exercices à compléter
- Des solutions dans des commits séparés
- Des tests pour valider votre travail

### **4. Structure des TPs**
Chaque TP contient :
- `README_TP.md` : Instructions détaillées
- `EXERCICES.md` : Exercices pratiques à réaliser
- `SOLUTIONS.md` : Solutions et explications
- `OBJECTIFS.md` : Critères de validation

---

## 📊 **Progression suggérée**

| Niveau | Durée | Compétences acquises |
|--------|-------|---------------------|
| 1-2    | 1 semaine | Bases des APIs REST |
| 3-4    | 2 semaines | Validation et tests |
| 5-6    | 3 semaines | Sécurité et persistance |
| 7-8    | 2 semaines | Production et déploiement |

**Total : 8 semaines pour devenir autonome sur les APIs REST !**

---

## 🏆 **Certification**

À la fin du parcours, vous serez capable de :
- ✅ Créer une API REST complète et sécurisée
- ✅ Implémenter des tests robustes
- ✅ Gérer une base de données
- ✅ Déployer en production
- ✅ Suivre les bonnes pratiques de développement

**Prêt à commencer ? Passez à la branche `tp-01-decouverte` !**
