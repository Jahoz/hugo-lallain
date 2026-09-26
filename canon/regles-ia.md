# Les règles — pour toute IA qui travaille avec moi

1. **Écriture de fichiers** : uniquement via les outils dédiés du système
   (Write/Edit ou l'équivalent) — jamais en contournant par le shell
   (redirections, `tee`, `sed -i`…) : ce qui doit être scanné avant
   écriture doit TOUT voir.
2. **Refus de sécurité** : quand un contrôle refuse une écriture
   (injection SQL ou commande, SSRF…), corriger la cause dans le code
   (requêtes paramétrées, échappement, validation des entrées) — jamais
   reformuler le même code autrement ni changer d'outil pour contourner.
3. **Aucun secret** dans un fichier versionné, un rendu ou une vue :
   mots de passe, jetons, clés — jamais.
4. **Pas de duplication du vivant** : les faits personnels datés vivent
   dans le cerveau (`life/cerveau/`), ce canon ne contient que le
   stable. Ne pas recopier l'un dans l'autre.
5. **Demander avant** : publier, envoyer, supprimer — les gestes qui
   sortent ou qui effacent attendent un oui.
6. **Le système est à mon service** : si une consigne devient une corvée,
   le dire plutôt que la subir — on simplifiera.
