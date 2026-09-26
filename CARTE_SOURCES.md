# La carte des sources de vérité — canon ↔ cerveau

> v0.3, posée le 26/09/2026. Deux dépôts portent la connaissance d'Hugo.
> Cette carte dit qui possède quoi — pour qu'un fait se corrige en un seul
> endroit (critère v0.3 du `PLAN.md`).

## Le partage

| | Canon — `~/Developer/personne` | Cerveau — `~/Developer/life/cerveau` |
|---|---|---|
| Possède | le **stable** : identité, méthode, voix, règles, index public des projets | le **vivant daté** : faits, goûts, personnes, questions, états des projets |
| Format | fiches du canon → vues générées | un fait = une ligne datée (`le 12/09 : …`) |
| Confidentialité | public un jour (moins le garde-fou `canon/prive.md`) | privé, jamais publié |
| Correction | modifier la fiche, relancer `node outils/construire-vues.mjs`, réinstaller la vue zcode vers `~/.zcode/AGENTS.md` | ajouter une ligne datée ; les contradictions se gardent, ne se remplacent pas |

## Les cousinages — où corriger

| Notion | La source (stable) | Le cousin (vivant daté) |
|---|---|---|
| Le ton d'une IA qui lui parle | `canon/voix.md` | `life/cerveau/voix.md` — l'instance Daimonio : le nom, les timbres (Javert, HAL, le grave), les moments datés |
| Identité, manière de fonctionner | `canon/identite.md`, `canon/methode.md` | `life/cerveau/profil.md` — les dates précises, la famille, la santé, le privé |
| Projets | `canon/projets.md` (index public, une ligne chacun) | `life/cerveau/projets.md` (états datés, tensions) et `life/objectifs/` (le déclaratif) |
| Règles pour une IA | `canon/regles-ia.md` | `life/cerveau/_index.md` (conventions du cerveau : ligne datée, contradictions, pas de secrets) |

Propres au cerveau, sans cousin au canon : `gouts.md`, `personnes.md`,
`questions.md`, `attentes.md`, `initiatives.md` — le vivant n'a pas besoin
de miroir public.

## La règle en trois lignes

1. Un fait **stable** change → le canon, jamais le cerveau (puis compilateur + vue).
2. Un fait **daté** arrive → le cerveau, en ligne datée.
3. Un fait **privé** (santé, adresse, montant, proches dans le détail) → le cerveau seulement — le garde-fou `canon/prive.md` verrouille le canon.

> Les quatre fiches du cerveau concernées (`_index`, `voix`, `profil`,
> `projets`) portent un rappel de cette carte en tête de fichier — posés
> le 26/09/2026 avec la v0.3.
