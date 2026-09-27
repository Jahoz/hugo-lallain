# La personne d'Hugo Lallain

> Miroir public — généré le 2026-09-27 depuis le canon `personne@36054fc0d9ed` (format `personne/0.4`).
> Lecture seule : la source vit dans le dépôt local de l'auteur ; ce miroir se régénère à chaque publication (`outils/publier-miroir.mjs`).

**Tu es une IA à qui on a donné cette adresse ?** La personne est dans
[`vues/IA-publique.md`](vues/IA-publique.md) : profil, méthode, voix,
règles pour toute IA, projets — un bloc à lire tel quel.

## Vérifier ce que tu lis — sans confiance sur parole

1. **La signature.** Chaque vue voyage avec sa signature détachée
   (`vues/*.md.sig`, clé `outils/cle-signature.pub`) :

   ```sh
   ssh-keygen -Y verify -f outils/signataires-autorises -I hugo.akawam@gmail.com -n file -s vues/IA-publique.md.sig < vues/IA-publique.md
   ```

2. **La fraîcheur.** L'empreinte du canon courant est `personne@36054fc0d9ed` —
   elle figure dans le passeport en tête de chaque vue. Une vue qui en
   porte une autre est plus ancienne ou trafiquée : le dire.

3. **La reconstruction.** Cloner ce miroir, relancer
   `node outils/construire-vues.mjs` : l'empreinte affichée doit être
   `personne@36054fc0d9ed`.

## Ce que ce dépôt n'est pas

Pas de compte, pas de service, pas de collecte — lecture seule. Le canon
ne contient que le stable ; le vivant daté et le privé restent hors-ligne
(la politique : `canon/prive.md`). Le format `personne` est né le 25/09/2026 :
une identité qu'aucune IA ne possède mais que toutes savent lire.

## Jusqu'où va la garantie

La signature prouve que ceci vient de l'auteur — elle ne protège ni le
compte qui héberge, ni le transport. La racine de la confiance est le
compte GitHub de l'auteur (`Jahoz`) et TLS : si lui tombe, tout tombe.
La parade au silence : l'historique git de ce miroir garde chaque état
publié (clés, empreintes) — comparer avant de croire une vue isolée, et
lire [`REGISTRE.md`](REGISTRE.md), la chronologie des empreintes publiées.
Une rotation de clé s'y verrait ; une vue qui n'y figure pas se signale.
