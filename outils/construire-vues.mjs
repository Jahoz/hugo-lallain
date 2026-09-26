#!/usr/bin/env node
// construire-vues.mjs — le compilateur de la personne : canon → vues.
//
// Lit manifeste.json, assemble chaque vue à partir des fiches du canon
// dont la visibilité l'y autorise, et écrit dans vues/. Les vues sont
// générées : on corrige le canon, on relance l'outil — jamais l'inverse.
//
// Garde-fou : une fiche « prive » dans une vue fait échouer la build.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifeste = JSON.parse(readFileSync(join(RACINE, "manifeste.json"), "utf8"));

// Fiches du canon, indexées par id — le contenu reste pur markdown.
// L'empreinte du canon : SHA-256 sur la version du format puis, dans
// l'ordre du manifeste, « id \n fichier \n contenu \n » de chaque fiche.
// Elle figure dans le tampon de chaque vue (« personne@… ») : quiconque
// reçoit le canon relance l'outil, obtient la même empreinte et vérifie
// que la vue en provient — sans confiance sur parole. Changer l'ordre ou
// le périmètre de la recette changerait toutes les empreintes : on n'y
// touche qu'à version près.
const fiches = new Map();
const empreinte = createHash("sha256");
empreinte.update(`personne ${manifeste.version}\n`);
for (const fiche of manifeste.canon) {
  const contenu = readFileSync(join(RACINE, fiche.fichier), "utf8").trim();
  fiches.set(fiche.id, { ...fiche, contenu });
  empreinte.update(`${fiche.id}\n${fiche.fichier}\n${contenu}\n`);
}
const empreinteCanon = `personne@${empreinte.digest("hex").slice(0, 12)}`;

const aujourdhui = new Date();
const dateISO = aujourdhui.toISOString().slice(0, 10);

// Le passeport : la première chose que lit une IA — ou une machine — dans
// une vue. Qui, quel format, quel canon, quand, où se résout la version
// courante, comment vérifier. C'est le tampon v0.4 devenu carte d'identité :
// la vue qui voyage s'annonce et dit elle-même comment l'attester
// (signature détachée `.sig` à côté d'elle, posée par outils/signer-vues.mjs).
const passeport = (vue) => {
  const base = basename(vue.fichier);
  const adresse = manifeste.resolution ? ` · adresse: \`${manifeste.resolution}\`` : "";
  return [
    `> **Passeport** — vue « ${vue.nom} » · format: \`${manifeste.format}/${manifeste.version}\` · auteur: \`${manifeste.auteur}\` · canon: \`${empreinteCanon}\` · générée: \`${dateISO}\` · signature: \`${base}.sig\` · clé: \`outils/cle-signature.pub\`${adresse}.`,
    `> **Vérifier** : \`ssh-keygen -Y verify -f outils/signataires-autorises -I ${manifeste.signature.identite} -n file -s ${base}.sig < ${base}\` — la version courante vit à l'adresse du passeport ; ou, le canon en main, relancer \`node outils/construire-vues.mjs\` et comparer l'empreinte du canon.`,
    `> Générée, jamais éditée à la main : corriger le canon dans \`~/Developer/personne\`.`,
  ].join("\n");
};

let vuesEcrites = 0;
for (const vue of manifeste.vues) {
  const parties = [];
  for (const id of vue.sections) {
    const fiche = fiches.get(id);
    if (!fiche) throw new Error(`Vue ${vue.nom} : fiche inconnue « ${id} ».`);
    if (fiche.visibilite === "prive") {
      throw new Error(`Vue ${vue.nom} : la fiche « ${id} » est privée — elle n'entre dans aucune vue.`);
    }
    parties.push(fiche.contenu);
  }
  const sortie = [
    `# ${vue.nom} — ${manifeste.auteur}`,
    "",
    passeport(vue),
    "",
    vue.description,
    "",
    ...parties.flatMap((p) => [p, ""]),
  ].join("\n");
  const chemin = join(RACINE, vue.fichier);
  mkdirSync(dirname(chemin), { recursive: true });
  writeFileSync(chemin, sortie);
  console.log(`vue écrite : ${vue.fichier} (${parties.length} fiches)`);
  vuesEcrites++;
}

console.log(`${vuesEcrites} vue(s) générée(s) depuis ${fiches.size} fiches du canon — empreinte ${empreinteCanon}.`);
