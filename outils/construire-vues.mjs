#!/usr/bin/env node
// construire-vues.mjs — le compilateur de la personne : canon → vues.
//
// Lit manifeste.json, assemble chaque vue à partir des fiches du canon
// dont la visibilité l'y autorise, et écrit dans vues/. Les vues sont
// générées : on corrige le canon, on relance l'outil — jamais l'inverse.
//
// Garde-fou : une fiche « prive » dans une vue fait échouer la build.
// 0.6 (02/11/2026) : les vues HTML naissent (« format": "html" ») — la
// vue presentation, page autonome au passeport visible, même loi que le
// gabarit du produit PROSOPON (../prosopon, format/SPEC.md §6).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifeste = JSON.parse(readFileSync(join(RACINE, "manifeste.json"), "utf8"));

// Fiches du canon, indexées par id — le contenu reste pur markdown.
// L'empreinte du canon : SHA-256 sur la version du format puis, dans
// l'ordre du manifeste, « id \n fichier \n contenu \n » de chaque fiche.
// Elle figure dans le tampon de chaque vue (« <format>@… ») : quiconque
// reçoit le canon relance l'outil, obtient la même empreinte et vérifie
// que la vue en provient — sans confiance sur parole. Changer l'ordre ou
// le périmètre de la recette changerait toutes les empreintes : on n'y
// touche qu'à version près.
const fiches = new Map();
const empreinte = createHash("sha256");
empreinte.update(`${manifeste.format} ${manifeste.version}\n`);
for (const fiche of manifeste.canon) {
  const contenu = readFileSync(join(RACINE, fiche.fichier), "utf8").trim();
  fiches.set(fiche.id, { ...fiche, contenu });
  empreinte.update(`${fiche.id}\n${fiche.fichier}\n${contenu}\n`);
}
const empreinteCanon = `${manifeste.format}@${empreinte.digest("hex").slice(0, 12)}`;

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

// Le rendu markdown volontairement minuscule des vues HTML : titres,
// listes, citations, paragraphes, l'inline gras/italique/code/liens.
// La page doit vivre sans dépendance et se régénérer mot pour mot.
const echappe = (s) => s
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");
const enligne = (s) => echappe(s)
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/\*([^*]+)\*/g, "<em>$1</em>")
  .replace(/`([^`]+)`/g, "<code>$1</code>")
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener">$1</a>');
function markdownEnHtml(texte) {
  const lignes = [];
  let liste = false;
  const fermerListe = () => { if (liste) { lignes.push("</ul>"); liste = false; } };
  for (const brute of texte.split("\n")) {
    const l = brute.trimEnd();
    if (/^###\s+/.test(l)) { fermerListe(); lignes.push(`<h4>${enligne(l.replace(/^###\s+/, ""))}</h4>`); }
    else if (/^##\s+/.test(l)) { fermerListe(); lignes.push(`<h3>${enligne(l.replace(/^##\s+/, ""))}</h3>`); }
    else if (/^#\s+/.test(l)) { fermerListe(); lignes.push(`<h2>${enligne(l.replace(/^#\s+/, ""))}</h2>`); }
    else if (/^[-*]\s+/.test(l)) { if (!liste) { lignes.push("<ul>"); liste = true; } lignes.push(`<li>${enligne(l.replace(/^[-*]\s+/, ""))}</li>`); }
    else if (/^>\s?/.test(l)) { fermerListe(); lignes.push(`<blockquote>${enligne(l.replace(/^>\s?/, ""))}</blockquote>`); }
    else if (l === "") fermerListe();
    else { fermerListe(); lignes.push(`<p>${enligne(l)}</p>`); }
  }
  fermerListe();
  return lignes.join("\n");
}
function vueHtml(vue, parties) {
  const base = basename(vue.fichier);
  const adresse = manifeste.resolution ? manifeste.resolution : "";
  const corps = parties.map(markdownEnHtml).join("\n");
  return `<!doctype html>
<!-- Prosopon — vue « ${vue.nom} » de ${manifeste.auteur}
     Passeport — format: ${manifeste.format}/${manifeste.version} · auteur: ${manifeste.auteur} · canon: ${empreinteCanon} · générée: ${dateISO} · signature: ${base}.sig · clé: outils/cle-signature.pub${adresse ? " · adresse: " + adresse : ""}
     Vérifier : ssh-keygen -Y verify -f outils/signataires-autorises -I ${manifeste.signature.identite} -n file -s ${base}.sig < ${base} — ou, le canon en main, relancer node outils/construire-vues.mjs et comparer l'empreinte.
     Générée, jamais éditée à la main. -->
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${echappe(manifeste.auteur)} — ${echappe(vue.nom)}</title>
<meta name="robots" content="index,follow">
<style>
:root { color-scheme: light dark; }
body { margin: 0; font: 16px/1.65 ui-serif, Georgia, serif; background: #faf8f4; color: #23201b; }
main { max-width: 42rem; margin: 0 auto; padding: 3rem 1.25rem 4rem; }
h1 { font-size: 1.9rem; margin: 0 0 .2rem; letter-spacing: .02em; }
h2 { font-size: 1.25rem; margin: 2.4rem 0 .8rem; border-bottom: 1px solid #d8d2c4; padding-bottom: .35rem; }
h3 { font-size: 1.05rem; margin: 1.8rem 0 .5rem; }
h4 { font-size: .95rem; margin: 1.4rem 0 .4rem; }
blockquote { margin: 1rem 0; padding: .1rem 1rem; border-left: 3px solid #b9b09c; color: #5a5346; font-style: italic; }
code { font: .9em ui-monospace, monospace; background: #efe9dd; padding: .1em .35em; border-radius: 3px; }
ul { padding-left: 1.3rem; }
a { color: #7a5c2e; }
footer { margin-top: 3.5rem; border-top: 1px solid #d8d2c4; padding-top: 1rem; font: .8rem/1.5 ui-sans-serif, system-ui, sans-serif; color: #6d6555; }
footer code { background: transparent; padding: 0; }
@media (prefers-color-scheme: dark) {
  body { background: #191713; color: #e8e2d6; }
  h2 { border-color: #3a352b; }
  blockquote { border-color: #55503f; color: #b5ad9a; }
  code { background: #262219; }
  footer { border-color: #3a352b; color: #a39a86; }
  a { color: #d3b077; }
}
</style>
</head>
<body>
<main>
<h1>${echappe(manifeste.auteur)}</h1>
<p><em>${echappe(vue.description)}</em></p>
${corps}
<footer>
Prosopon — vue « ${echappe(vue.nom)} » · format <code>${manifeste.format}/${manifeste.version}</code> ·
canon <code>${empreinteCanon}</code> · générée le ${dateISO}${adresse ? ` · <a href="${adresse}" rel="noopener">${adresse}</a>` : ""}.<br>
Générée, jamais éditée à la main : corriger le canon dans <code>~/Developer/personne</code>, relancer <code>node outils/construire-vues.mjs</code>.
</footer>
</main>
</body>
</html>
`;
}

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
  const chemin = join(RACINE, vue.fichier);
  mkdirSync(dirname(chemin), { recursive: true });

  // La vue machine : même canon, même passeport, fiches en dictionnaire —
  // pour les agents qui préfèrent parser que lire. Signée pareil par
  // signer-vues.mjs (le `.sig` accompagne le `.json`).
  if (vue.format === "json") {
    const machine = {
      passeport: {
        format: `${manifeste.format}/${manifeste.version}`,
        auteur: manifeste.auteur,
        canon: empreinteCanon,
        generee: dateISO,
        signature: `${basename(vue.fichier)}.sig`,
        cle: "outils/cle-signature.pub",
        ...(manifeste.resolution ? { adresse: manifeste.resolution } : {}),
      },
      fiches: Object.fromEntries(vue.sections.map((id) => [id, fiches.get(id).contenu])),
    };
    writeFileSync(chemin, JSON.stringify(machine, null, 2) + "\n");
    console.log(`vue écrite : ${vue.fichier} (machine, ${vue.sections.length} fiches)`);
    vuesEcrites++;
    continue;
  }

  // La vue HTML (0.6) : le visage public portable — une page autonome,
  // styles inclus, aucun asset externe. Le passeport vit en commentaire
  // ET en pied visible : la page qui voyage s'annonce comme les autres.
  if (vue.format === "html") {
    writeFileSync(chemin, vueHtml(vue, parties));
    console.log(`vue écrite : ${vue.fichier} (html, ${vue.sections.length} fiches)`);
    vuesEcrites++;
    continue;
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
  writeFileSync(chemin, sortie);
  console.log(`vue écrite : ${vue.fichier} (${parties.length} fiches)`);
  vuesEcrites++;
}

console.log(`${vuesEcrites} vue(s) générée(s) depuis ${fiches.size} fiches du canon — empreinte ${empreinteCanon}.`);
