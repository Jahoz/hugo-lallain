# Le plan — personne, itérations

> Posé le 25/09/2026 au soir, juste après l'idée (voir
> `life/idees/2026-09-25-personne-ia-agnostique.md`). Étendu le 26/09 au
> soir : le palier paroxysme (v0.5→v0.7). Chaque phase est petite, datée,
> et se termine par un critère observable — pas une intention. On itère ;
> rien ici n'est gravé.

## v0.1 — le format et le canon (ce soir)

- Dépôt local `~/Developer/personne` (git, aucune remote — la personne
  appartient à son auteur, aucune publication sans décision d'Hugo).
- Le format : `manifeste.json` décrit les fiches du canon, leur
  visibilité (public / annexe / privé) et les vues à générer.
- Le canon v1 : cinq fiches publiques (identité, méthode, voix, règles
  IA, projets), une annexe outil (ZCode), un garde-fou privé.
- Le compilateur : `outils/construire-vues.mjs` assemble les vues depuis
  le canon. Les vues sont générées, jamais éditées à la main.
- **Critère** : la vue « IA publique » se relit en moins de cinq minutes
  et ne contient aucune donnée sensible (santé, procédure, adresse,
  montant, vie des proches).

## v0.2 — adoption ZCode

- Relire `vues/zcode-agents.md`, puis la substituer à `~/.zcode/AGENTS.md`
  (le canon devient la source ; l'outil ne lit qu'une vue).
- **Critère** : une session ZCode neuve se comporte au moins aussi bien
  qu'avant — et un changement dans le canon se répercute à la relance du
  compilateur, sans double saisie.

## v0.3 — vue Daimonio

- Écrire la carte des sources de vérité : le canon possède le **stable**
  (identité, méthode, voix) ; le cerveau (`life/cerveau/`) possède le
  **vivant daté** (faits, goûts, personnes, questions).
- Faire pointer le cerveau sur le canon pour ce qui est stable (ou
  documenter les cousinages pour éviter la dérive).
- **Critère** : corriger un fait stable ne se fait qu'à un seul endroit.

## v0.4 — la brique « reconnue »

- Empreinte du canon dans chaque vue (« généré depuis personne@<hash> »),
  commits signés, éventuellement clé dédiée — l'identifiant décentralisé
  (DID W3C) si le besoin d'attribuabilité externe devient réel.
- **Critère** : un tiers peut vérifier qu'une vue vient bien du canon
  d'Hugo, sans lui faire confiance sur parole.

## Le paroxysme — les deux verbes manquants (posé le 26/09/2026)

L'idée portée à son terme : **qu'aucune IA ne possède la personne, que
toutes sachent la lire, que quiconque puisse la vérifier — et qu'elle se
trouve toute seule.** Les deux premières propriétés tiennent depuis la
v0.1 ; les deux suivantes sont le chantier.

### v0.5 — le passeport et la vue signée (fait le 26/09/2026)

- Chaque vue s'ouvre sur un passeport (format, auteur, empreinte du canon,
  date, clé) et voyage avec une signature détachée `.sig` signée par la
  clé SSH dédiée de la v0.4 — `outils/signer-vues.mjs` signe puis vérifie.
- **Critère** : une vue copiée hors du dépôt reste attribuable et
  vérifiable sans git ni canon — `ssh-keygen` suffit. Testé le 26/09 : la
  vue légitime passe, une vue trafiquée est rejetée.

### v0.6 — le point de résolution (fait le 26/09/2026, sur le oui d'Hugo)

- Le miroir public **github.com/Jahoz/hugo-lallain** : une vue du dépôt
  entier, générée par liste blanche (`outils/publier-miroir.mjs`), jamais
  éditée à la main. L'adresse vit dans le manifeste et dans le passeport
  de chaque vue.
- Le dépôt distant privé `Jahoz/personne` (remote `origin`) garde son
  rôle : la sauvegarde de l'historique local — deux dépôts, deux natures.
- **Critère tenu le 26/09** : un clone anonyme de l'adresse seule rend la
  vue lisible, sa signature vérifiable, et la reconstruction redonne
  l'empreinte courante (`personne@87ae84335ff4`).

### v0.7 — le geste produit

- L'atelier Telos « dessine ta personne IA » : un canvas dérivé du format
  (les mêmes fiches, en version dirigeant/CGP) — lien direct avec cgp-ia
  et la grammaire du dossier de financement La Loco : ce qui t'appartient,
  vérifiable, récupérable.
- **Critère** : un participant repart avec un dépôt qui compile et deux
  vues générées — le même geste que ce dépôt, à lui.
- État au 26/09 au soir : l'atelier est **l'offre I de Telos** (kit,
  canvas, déroulé, charte de dérivation dans `ateliers/personne-ia/`) ;
  le kit est cousu au format courant (passeport + vérification par
  reconstruction, test participant réel passé) et la dérivation graduée
  est posée — signature et résolution sont les paliers « chez soi ».
  Reste : la séance réelle, premier participant en chair et en os.

### v0.8 — durcir et ouvrir (fait le 27/09/2026)

- **Le registre** : `REGISTRE.md` — la chronologie des empreintes
  publiées, alimentée à chaque publication (`publier-miroir.mjs -m "…"`),
  jamais éditée à la main. L'auditabilité, pas juste l'instantané.
- **La rotation de clé** : le plan de secours écrit au README — et
  l'historique git du miroir comme registre des clés, gratuit.
- **La racine de confiance dite** : l'accueil du miroir énonce jusqu'où
  va la garantie (compte GitHub + TLS) — l'honnêteté sur les limites
  fait partie de la crédibilité.
- **La vue machine** : `vues/personne.json` (format 0.4) — passeport en
  tête, fiches en dictionnaire, signée pareil.
- **La carte qui se résout** : la recette QR au README (l'artefact vivra
  côté Telos) ; **l'offre II** « Souveraineté · les paliers chez soi »
  posée dans telos (💡 690 € HT) — la règle 6 de la charte devenue
  produit.
- **Critère** : une IA peut retracer l'évolution publique de la personne
  (registre + historique) et repérer une rotation non annoncée.

### v0.9 — le nom (fait le 27/09/2026 : **Prosopon**)

- Décision d'Hugo le 27/09 au soir : le format s'appelle **Prosopon**
  (πρόσωπον) — le mot grec ancien pour « personne », né du masque de
  théâtre ; la continuité de la famille (Telos, Daimonio, Hestia/Mentor).
  *Telos dessine, Daimonio veille, Prosopon se présente.*
- Palier versionné : le manifeste passe à `prosopon/0.5`, les empreintes
  deviennent `prosopon@…`, le registre trace le renommage (l'ancienne
  lignée `personne@…` y reste, c'est l'histoire). Le kit atelier suit
  (`prosopon-ia/0.2`, côté telos). Le dépôt reste `personne` — le
  descripteur français.

## Règles d'itération (toujours vraies)

1. Le canon ne contient que du **stable** ; le vivant daté reste dans le
   cerveau. Un fait instable dans le canon est un bug.
2. Jamais de secret, de montant, de donnée de santé ou de procédure dans
   le canon — le garde-fou `canon/prive.md` le rappelle.
3. Les vues sont générées. On corrige le canon, on relance l'outil.
4. Une itération = des petits pas datés + un commit lisible. Si maintenir
   ce dépôt devient une corvée, on le simplifie — il est à mon service,
   pas l'inverse (principe fondateur du 1/09).
