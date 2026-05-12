# PRD — Plateforme Web de Gestion des Soutenances Académiques

# 1. Présentation générale

## 1.1 Contexte

Dans les établissements d’enseignement supérieur, l’organisation des soutenances de projets de fin d’études (PFE), mémoires et thèses implique plusieurs acteurs : administration, coordinateurs pédagogiques, enseignants, encadrants, jurys et étudiants.

Dans de nombreux cas, cette gestion est encore réalisée manuellement à l’aide de fichiers Excel, de documents papier et d’échanges par courriel. Cette approche entraîne plusieurs problèmes :

- conflits d’horaires ;
- erreurs de planification ;
- mauvaise répartition des jurys ;
- manque de traçabilité ;
- difficulté de suivi ;
- perte de temps administratif.

Le présent projet vise à concevoir et développer une plateforme web centralisée permettant d’automatiser et simplifier la gestion complète des soutenances académiques.

---

# 2. Intitulé du projet

Conception et développement d’une plateforme web de gestion des soutenances académiques et des jurys.

---

# 3. Objectifs du système

Le système doit permettre :

- la gestion centralisée des étudiants, enseignants et structures académiques ;
- la création et gestion des groupes ;
- l’affectation des projets ;
- l’affectation des encadrants ;
- la constitution des jurys ;
- la planification automatique et manuelle des soutenances ;
- la détection des conflits ;
- la gestion des évaluations ;
- la génération automatique des documents administratifs ;
- l’envoi de notifications ;
- l’archivage des sessions.

---

# 4. Portée fonctionnelle

Le système doit être réutilisable par plusieurs universités.

Il doit supporter :

- plusieurs universités ;
- plusieurs facultés ;
- plusieurs départements ;
- plusieurs filières ;
- plusieurs sessions académiques.

Le système est conçu comme une plateforme multi-tenant.

---

# 5. Concepts métier

## 5.1 Session globale

Une session globale représente une période académique générale.

Exemples :

- Session normale 2026
- Session de rattrapage 2026

Une session globale contient plusieurs soutenances.

---

## 5.2 Session de soutenance

Une session de soutenance représente une période spécifique de planification des soutenances.

Elle possède notamment :

- une date de début ;
- une date de fin ;
- des règles de modification ;
- des contraintes de planification.

---

## 5.3 Groupe

Un groupe représente :

- soit un groupe d’étudiants ;
- soit un étudiant individuel.

Un groupe :

- appartient à une seule session ;
- possède un seul projet ;
- ne peut contenir qu’un nombre limité d’étudiants.

---

## 5.4 Projet

Le terme projet désigne :

- un PFE ;
- un mémoire ;
- une thèse.

Un projet peut exister sans groupe affecté.

Un projet peut posséder :

- un encadrant principal ;
- un ou plusieurs co-encadrants ;
- des encadrants externes.

---

# 6. Acteurs du système

## 6.1 Administrateur

L’administrateur possède les privilèges globaux du système.

Responsabilités principales :

- gérer les universités ;
- gérer les facultés ;
- gérer les départements ;
- gérer les filières ;
- gérer les utilisateurs ;
- importer les données depuis des fichiers CSV/Excel ;
- définir les rôles ;
- configurer les paramètres globaux ;
- gérer les salles ;
- définir les contraintes de soutenance ;
- gérer les sessions globales ;
- définir les règles de modification ;
- activer l’envoi des invitations ;
- gérer les audits.

Exemples de paramètres :

- durée des soutenances ;
- temps de pause ;
- date limite des dépôts ;
- délais de modification ;
- logo et informations de l’université.

---

## 6.2 Coordinateur pédagogique

Le coordinateur est responsable de l’organisation académique des soutenances.

Responsabilités principales :

- gérer les projets ;
- affecter les projets aux groupes ;
- affecter les encadrants ;
- constituer les jurys ;
- planifier les soutenances ;
- modifier les planifications ;
- publier le planning ;
- gérer les conflits ;
- consulter les statistiques ;
- générer les convocations ;
- générer les PV.

Le coordinateur peut ajuster manuellement un planning généré automatiquement.

---

## 6.3 Enseignant

L’enseignant peut :

- déclarer ses indisponibilités ;
- consulter son planning ;
- consulter les informations des soutenances ;
- consulter les projets ;
- accéder aux documents déposés ;
- participer aux jurys ;
- évaluer les étudiants ;
- ajouter des remarques.

Un enseignant peut simultanément :

- être encadrant ;
- être président d’un autre jury ;
- être rapporteur ;
- être examinateur.

Cependant, un enseignant ne peut pas cumuler plusieurs rôles dans une même soutenance.

---

## 6.4 Encadrant

L’encadrant représente un rôle académique associé à un projet.

Un encadrant peut être :

- un enseignant ;
- un étudiant doctorant ;
- un étudiant en master.

L’encadrant peut :

- consulter les documents du projet ;
- ajouter des remarques ;
- suivre l’avancement ;
- consulter la planification.

L’encadrant ne peut pas attribuer de note.

---

## 6.5 Étudiant

L’étudiant peut :

- créer ou rejoindre un groupe ;
- consulter ses informations ;
- consulter les informations du projet ;
- consulter le planning ;
- déposer les documents ;
- télécharger sa convocation ;
- consulter les résultats ;
- recevoir des notifications.

Un étudiant ne peut appartenir qu’à un seul groupe par session.

---

# 7. Gestion des jurys

## 7.1 Composition du jury

La structure du jury est configurable.

Un jury peut contenir :

- un président ;
- un ou plusieurs rapporteurs ;
- un ou plusieurs examinateurs ;
- éventuellement des encadrants ;
- des membres externes.

Les rôles de jury sont contextuels à une soutenance.

---

## 7.2 Contraintes

Le système doit empêcher :

- l’affectation simultanée d’un enseignant à plusieurs soutenances au même horaire ;
- le cumul de plusieurs rôles dans une même soutenance ;
- l’affectation d’un enseignant hors de son département ;
- la planification sans jury valide.

---

# 8. Planification des soutenances

Le système doit supporter :

- la planification automatique ;
- la planification manuelle ;
- la replanification ;
- la détection des conflits.

La planification doit prendre en compte :

- les disponibilités des enseignants ;
- les salles ;
- les contraintes horaires ;
- les types de salles ;
- les capacités des salles ;
- les rôles des jurys ;
- les délais définis par l’administration.

Le système doit permettre plusieurs soutenances simultanées dans des salles différentes.

---

# 9. Gestion des évaluations

Les membres internes du jury peuvent :

- attribuer une note ;
- ajouter des remarques ;
- enregistrer une décision.

Décisions possibles :

- admis ;
- admis avec corrections ;
- ajourné.

Les évaluations peuvent être modifiées avant clôture.

La note finale correspond à la moyenne pondérée des notes attribuées.

Le système doit supporter les coefficients personnalisés.

Les encadrants peuvent uniquement ajouter des remarques.

---

# 10. Gestion documentaire

Le système doit permettre le dépôt de fichiers.

Formats supportés :

- PDF ;
- PPTX ;
- DOCX ;
- CSV ;
- XLSX ;
- PUML ;
- archives de code source.

Les dépôts doivent respecter des dates limites.

Le système doit générer automatiquement :

- convocations ;
- procès-verbaux ;
- rapports ;
- attestations.

---

# 11. Authentification et sécurité

Le système doit utiliser une authentification par email et mot de passe.

Les comptes sont créés par l’administrateur via importation de données.

Le système doit envoyer des liens d’activation aux utilisateurs.

Le système doit implémenter un contrôle d’accès basé sur les rôles (RBAC).

Le système doit également fournir :

- journalisation des actions ;
- audit des modifications ;
- historique des opérations.

---

# 12. Notifications

Le système doit envoyer :

- des notifications email ;
- des notifications internes ;
- des rappels automatiques.

Exemples :

- publication du planning ;
- modification de soutenance ;
- rappel de dépôt ;
- affectation de jury ;
- activation de compte.

---

# 13. Cycle de vie d’une soutenance

Une soutenance possède les états suivants :

- Brouillon ;
- Planifiée ;
- Publiée ;
- Terminée ;
- Archivée.

Une soutenance archivée devient immutable.

---

# 14. Règles métier principales

- Un étudiant ne peut appartenir qu’à un seul groupe par session.
- Un groupe ne possède qu’un seul projet.
- Un projet peut exister sans groupe.
- Un enseignant ne peut appartenir qu’à un seul département.
- Un enseignant ne peut participer à deux soutenances simultanément.
- Une soutenance ne peut être publiée sans jury valide.
- Les dépôts sont interdits après la date limite.
- Les évaluations deviennent verrouillées après clôture.
- Les sessions archivées deviennent non modifiables.

---

# 15. Exigences non fonctionnelles

Le système doit être :

- sécurisé ;
- modulaire ;
- extensible ;
- maintenable ;
- responsive ;
- multi-tenant ;
- traçable ;
- réutilisable.

Le système doit permettre une montée en charge pour plusieurs universités.

---

# 16. Perspectives techniques

Architecture envisagée :

Frontend :

- React ou Angular.

Backend :

- Spring Boot ;
- API REST.

Base de données :

- PostgreSQL.

Fonctionnalités techniques importantes :

- JWT ;
- RBAC ;
- génération PDF ;
- moteur de planification ;
- gestion des conflits ;
- système de notifications ;
- audit logging.

# Architecture des pages:

## Pages important:

- Page de connexion
- Dashboard d'étudiant
- Dashboard d'administration
- Dashboard de coordinateur
- Dashboard d'enseignant
