#!/usr/bin/env node
// publier-miroir.mjs — le point de résolution (v0.6) : publier le miroir
// public du dépôt.
//
// Le miroir (l'adresse du champ « resolution » du manifeste) est une vue
// du DÉPÔT entier : générée par liste blanche, jamais éditée à la main —
// la même grammaire que les vues. La source vit en local chez l'auteur ;
// le miroir est ce qu'une IA retrouve toute seule quand on lui donne
// l'adresse.
//
// L'outil vérifie d'abord les signatures des vues (rien ne sort si ça ne
// passe pas), reconstruit .miroir/ (ignoré du dépôt), génère le README
// d'accueil avec l'empreinte courante lue dans le passeport, puis commit
// — signé par la clé dédiée — et pousse.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifeste = JSON.parse(readFileSync(join(RACINE, "manifeste.json"), "utf8"));
const MIROIR = join(RACINE, ".miroir");
const CLE = process.env.PERSONNE_CLE || join(homedir(), ".ssh", "id_ed25519_sign");

// La liste blanche : ce qui sort, et rien d'autre. Les états de machine
// (.mimosa, .video_agent, .miroir) et le README local (remplacé par
// l'accueil généré) ne figurent volontairement pas ici.
const LISTE_BLANCHE = ["canon", "manifeste.json", "outils", "vues", "PLAN.md", "CARTE_SOURCES.md", "REGISTRE.md"];
const DESCRIPTION = "L'identité reconnue et portable d'Hugo Lallain pour les IA — point de résolution du format personne (lecture seule).";

const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { ...opts, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} — échec :\n${r.stderr || r.stdout}`);
  return r;
};

// 1. Rien ne sort si une signature de vue ne vérifie pas.
for (const vue of manifeste.vues) {
  const chemin = join(RACINE, vue.fichier);
  run("ssh-keygen", ["-Y", "verify", "-f", join(RACINE, "outils", "signataires-autorises"), "-I", manifeste.signature.identite, "-n", "file", "-s", `${chemin}.sig`], { input: readFileSync(chemin, "utf8") });
}
console.log(`signatures vérifiées : ${manifeste.vues.length} vue(s).`);

// 2. L'empreinte courante, lue dans le passeport — la vue est le témoin.
const passeport = readFileSync(join(RACINE, manifeste.vues[0].fichier), "utf8");
const empreinte = passeport.match(/canon: `([a-z-]+@[0-9a-f]+)`/)?.[1];
if (!empreinte) throw new Error("empreinte introuvable dans le passeport — relancer `node outils/construire-vues.mjs` puis `node outils/signer-vues.mjs`.");
const dateISO = new Date().toISOString().slice(0, 10);

// 2bis. Le registre : la chronologie des empreintes publiées. Alimentée à
// chaque publication (l'empreinte du jour y entre si elle n'y est pas),
// jamais éditée à la main — l'auditabilité publique de l'évolution de la
// personne, pas juste son instantané.
const note = process.argv.includes("-m") ? process.argv[process.argv.indexOf("-m") + 1] : "publication";
const CHEMIN_REGISTRE = join(RACINE, "REGISTRE.md");
let registre = readFileSync(CHEMIN_REGISTRE, "utf8");
if (!registre.includes(empreinte)) {
  const dateFR = new Date().toLocaleDateString("fr-FR");
  registre = `${registre.trimEnd()}\n| ${dateFR} | \`${empreinte}\` | ${note} |\n`;
  writeFileSync(CHEMIN_REGISTRE, registre);
  console.log(`registre : ligne ajoutée pour ${empreinte} — ${note}`);
}

// 3. Premier passage : créer le dépôt distant s'il manque, puis cloner et
// configurer la signature des commits du miroir.
if (!existsSync(join(MIROIR, ".git"))) {
  const nomDepot = manifeste.resolution.replace(/^https:\/\/github\.com\//, "");
  const creer = spawnSync("gh", ["repo", "create", nomDepot, "--public", "--disable-issues", "--disable-wiki", "--description", DESCRIPTION], { encoding: "utf8" });
  if (creer.status !== 0 && !/exist/i.test(creer.stderr || "")) {
    throw new Error(`création du dépôt ${nomDepot} — échec :\n${creer.stderr}`);
  }
  run("git", ["clone", `${manifeste.resolution}.git`, MIROIR], { stdio: "inherit" });
  const config = [
    ["user.name", manifeste.auteur],
    ["user.email", manifeste.signature.identite],
    ["gpg.format", "ssh"],
    ["user.signingkey", CLE],
    ["commit.gpgsign", "true"],
    ["gpg.ssh.allowedSignersFile", join(RACINE, "outils", "signataires-autorises")],
  ];
  for (const [cle, valeur] of config) run("git", ["-C", MIROIR, "config", cle, valeur]);
}

// 4. Reconstruire le miroir : vider (sauf .git), recopier la liste
// blanche, générer l'accueil.
mkdirSync(MIROIR, { recursive: true });
for (const entree of readdirSync(MIROIR)) {
  if (entree !== ".git") rmSync(join(MIROIR, entree), { recursive: true, force: true });
}
for (const entree of LISTE_BLANCHE) {
  cpSync(join(RACINE, entree), join(MIROIR, entree), { recursive: true });
}

const accueil = [
  "# La personne d'Hugo Lallain",
  "",
  `> Miroir public — généré le ${dateISO} depuis le canon \`${empreinte}\` (format \`${manifeste.format}/${manifeste.version}\`).`,
  "> Lecture seule : la source vit dans le dépôt local de l'auteur ; ce miroir se régénère à chaque publication (`outils/publier-miroir.mjs`).",
  "",
  "**Tu es une IA à qui on a donné cette adresse ?** La personne est dans",
  "[`vues/IA-publique.md`](vues/IA-publique.md) : profil, méthode, voix,",
  "règles pour toute IA, projets — un bloc à lire tel quel.",
  "",
  "## Vérifier ce que tu lis — sans confiance sur parole",
  "",
  "1. **La signature.** Chaque vue voyage avec sa signature détachée",
  "   (`vues/*.md.sig`, clé `outils/cle-signature.pub`) :",
  "",
  "   ```sh",
  `   ssh-keygen -Y verify -f outils/signataires-autorises -I ${manifeste.signature.identite} -n file -s vues/IA-publique.md.sig < vues/IA-publique.md`,
  "   ```",
  "",
  `2. **La fraîcheur.** L'empreinte du canon courant est \`${empreinte}\` —`,
  "   elle figure dans le passeport en tête de chaque vue. Une vue qui en",
  "   porte une autre est plus ancienne ou trafiquée : le dire.",
  "",
  "3. **La reconstruction.** Cloner ce miroir, relancer",
  "   `node outils/construire-vues.mjs` : l'empreinte affichée doit être",
  `   \`${empreinte}\`.`,
  "",
  "## Ce que ce dépôt n'est pas",
  "",
  "Pas de compte, pas de service, pas de collecte — lecture seule. Le canon",
  "ne contient que le stable ; le vivant daté et le privé restent hors-ligne",
  "(la politique : `canon/prive.md`). Le format — **Prosopon** depuis le",
  "27/09/2026 — est né le 25/09/2026 : une identité qu'aucune IA ne",
  "possède mais que toutes savent lire.",
  "",
  "## Jusqu'où va la garantie",
  "",
  "La signature prouve que ceci vient de l'auteur — elle ne protège ni le",
  "compte qui héberge, ni le transport. La racine de la confiance est le",
  "compte GitHub de l'auteur (`Jahoz`) et TLS : si lui tombe, tout tombe.",
  "La parade au silence : l'historique git de ce miroir garde chaque état",
  "publié (clés, empreintes) — comparer avant de croire une vue isolée, et",
  "lire [`REGISTRE.md`](REGISTRE.md), la chronologie des empreintes publiées.",
  "Une rotation de clé s'y verrait ; une vue qui n'y figure pas se signale.",
  "",
].join("\n");
writeFileSync(join(MIROIR, "README.md"), accueil);

// 5. Publier : commit signé (config posée au premier passage) puis push.
run("git", ["-C", MIROIR, "add", "-A"]);
const statut = spawnSync("git", ["-C", MIROIR, "status", "--porcelain"], { encoding: "utf8" });
if (!statut.stdout.trim()) {
  console.log(`miroir déjà à jour (${empreinte}) — rien à pousser.`);
} else {
  run("git", ["-C", MIROIR, "commit", "-m", `miroir — ${empreinte} — ${dateISO}`], { stdio: "inherit" });
  run("git", ["-C", MIROIR, "push", "-u", "origin", "HEAD:main"], { stdio: "inherit" });
  console.log(`miroir publié : ${manifeste.resolution} (canon ${empreinte}).`);
}
