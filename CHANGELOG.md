# Changelog - Application Kifekoi

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

## [1.3.0] - 2026-03-04

- - 💄 new style
- - refactor: ♻️ clean code
- - 📝 Update README
- - :bug: Fix android ui issues


## [1.2.0] - 2025-08-13

- - feat: bug report form


## [1.1.1] - 2025-08-07

- - fix: :bug: update actions permissions
- - feat: 📁 Changelog version management
- - :sparkles: dependency audit
- - :sparkles: messages & reactions
- - 🚀 Tabs: Profile, Events, Create event
- - 🚀 Init expo + login page + connexion api
- - Initial commit


### Added
- Améliorations futures à venir

### Changed
- Optimisations continues

## [1.1.0] - 2025-01-04

### Added
- **Système de changelog automatisé complet**
  - Script de génération automatique `scripts/generate-changelog.js`
  - Template de commits conventionnels `scripts/commit-template.txt`
  - Configuration Git automatisée avec `.gitconfig`

## [1.0.0] - 2025-01-04

### Added
- **Fonctionnalités principales**
  - Système d'authentification JWT complet
  - Gestion des événements culturels avec géolocalisation
  - Système de messagerie en temps réel
  - Gestion des amis et invitations
  - Interface utilisateur avec navigation par onglets
  - Support multi-plateforme (iOS, Android, Web)

- **Composants UI**
  - Interface de carte interactive avec MapView
  - Système de modales pour les interactions
  - Composants de formulaire avec validation
  - Système de notifications toast
  - Support du mode sombre/clair

- **Fonctionnalités techniques**
  - Gestion d'état avec TanStack Query
  - Navigation avec Expo Router
  - Gestion des permissions (caméra, localisation, photos)
  - Système de cache et optimisation des requêtes
  - Support des images et avatars utilisateur

### Changed
- Architecture React Native avec Expo SDK 53
- Optimisation des performances de chargement
- Amélioration de l'expérience utilisateur

### Fixed
- Correction des problèmes de navigation entre écrans
- Résolution des conflits de dépendances
- Correction des erreurs de validation de formulaires
- Amélioration de la gestion des erreurs réseau

### Security
- Implémentation de la validation JWT côté client
- Sécurisation des requêtes API
- Gestion sécurisée des permissions utilisateur

## [0.9.0] - 2024-12-15

### Added
- **Système d'authentification**
  - Page de connexion avec validation
  - Page d'inscription avec formulaire complet
  - Gestion des tokens JWT
  - Validation des champs avec Yup

- **Interface de base**
  - Navigation par onglets
  - Page d'accueil avec carte
  - Liste des événements
  - Profil utilisateur

### Changed
- Migration vers Expo SDK 53
- Mise à jour des dépendances React Native
- Optimisation de la structure du projet

### Fixed
- Correction des erreurs de compilation TypeScript
- Résolution des problèmes de navigation
- Amélioration de la gestion des états de chargement

## [0.8.0] - 2024-11-20

### Added
- **Fonctionnalités de base**
  - Structure du projet React Native
  - Configuration Expo
  - Système de routing de base
  - Composants UI de base

### Changed
- Initialisation du projet avec Expo
- Configuration de l'environnement de développement

### Fixed
- Configuration initiale du projet
- Résolution des problèmes de dépendances

## [0.7.0] - 2024-10-10

### Added
- **Planification du projet**
  - Définition de l'architecture
  - Structure de la base de données
  - API design

### Changed
- Documentation du projet
- Spécifications fonctionnelles

## [0.6.0] - 2024-09-01

### Added
- **Étude de marché**
  - Analyse de la concurrence
  - Définition du modèle économique
  - Estimation des coûts d'infrastructure

### Changed
- Refinement du concept d'application
- Optimisation du business model

## [0.5.0] - 2024-08-01

### Added
- **Concept initial**
  - Idée de l'application d'événements culturels
  - Premières maquettes
  - Étude de faisabilité

---

## Types de modifications

- **Added** : Nouvelles fonctionnalités
- **Changed** : Modifications de fonctionnalités existantes
- **Deprecated** : Fonctionnalités qui seront supprimées
- **Removed** : Fonctionnalités supprimées
- **Fixed** : Corrections de bugs
- **Security** : Corrections de vulnérabilités

## Format des versions

Ce projet utilise le [Semantic Versioning](https://semver.org/lang/fr/) :

- **MAJOR** : Incompatibilités avec les versions précédentes
- **MINOR** : Nouvelles fonctionnalités compatibles
- **PATCH** : Corrections de bugs compatibles

## Processus de release

1. **Développement** : Les nouvelles fonctionnalités sont développées sur des branches feature
2. **Tests** : Validation des fonctionnalités et tests automatisés
3. **Merge** : Intégration dans la branche principale
4. **Versioning** : Mise à jour des numéros de version
5. **Changelog** : Documentation des modifications
6. **Release** : Création du tag et déploiement

## Automatisation

Ce changelog est maintenu automatiquement via :
- Workflows GitHub Actions pour la gestion des versions
- Scripts de génération automatique
- Intégration avec les Pull Requests
- Tags Git automatiques

---

**Dernière mise à jour** : 4 janvier 2025  
**Maintenu par** : Équipe de développement Kifekoi
