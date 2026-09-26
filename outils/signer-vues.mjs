#!/usr/bin/env node
// signer-vues.mjs — la signature détachée des vues (v0.5).
//
// Chaque vue générée voyage avec sa signature `<vue>.md.sig`, posée par la
// clé SSH dédiée (celle des commits signés, v0.4). Hors du dépôt, hors de
// git, une vue reste ainsi attribuable à son auteur : quiconque tient la
// vue, sa signature et `outils/cle-signature.pub` peut le vérifier — sans
// confiance sur parole.
//
// Signe puis vérifie chaque vue, et échoue bruyamment si la vérification
// ne passe pas : une signature non vérifiée ne sert à rien. La clé privée
// se prend dans `PERSONNE_CLE`, sinon `~/.ssh/id_ed25519_sign` (la clé
// configurée pour signer les commits du dépôt).
import { readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifeste = JSON.parse(readFileSync(join(RACINE, "manifeste.json"), "utf8"));

const CLE = process.env.PERSONNE_CLE || join(homedir(), ".ssh", "id_ed25519_sign");
const IDENTITE = manifeste.signature?.identite;
if (!IDENTITE) {
  throw new Error("manifeste.json : le bloc signature.identite manque — la v0.5 ne peut pas signer.");
}
const SIGNATAIRES = join(RACINE, "outils", "signataires-autorises");

let signees = 0;
for (const vue of manifeste.vues) {
  const chemin = join(RACINE, vue.fichier);
  const signature = `${chemin}.sig`;
  // ssh-keygen -Y sign demande confirmation avant d'écraser un .sig
  // existant — en non-interactif il ne réécrit alors rien. On efface
  // d'abord : une signature périmée ne doit jamais survivre au re-sign.
  rmSync(signature, { force: true });

  const signe = spawnSync("ssh-keygen", ["-Y", "sign", "-f", CLE, "-n", "file", chemin], { stdio: "inherit" });
  if (signe.status !== 0) throw new Error(`signature échouée : ${vue.fichier}`);

  const verifie = spawnSync(
    "ssh-keygen",
    ["-Y", "verify", "-f", SIGNATAIRES, "-I", IDENTITE, "-n", "file", "-s", signature],
    { input: readFileSync(chemin, "utf8") },
  );
  if (verifie.status !== 0) {
    throw new Error(`vérification échouée : ${vue.fichier}\n${verifie.stderr}`);
  }
  console.log(`vue signée et vérifiée : ${vue.fichier}`);
  signees++;
}

console.log(`${signees} vue(s) signée(s) et vérifiée(s) — attestation hors dépôt : outils/cle-signature.pub.`);
