# Annexe ZCode — l'environnement de l'agent ZCode

- Système : macOS (arm64), zsh. Racine de travail : `~/Developer`
  (`projects/`, `life/`, `ops/`, `personne/`).
- Ne jamais modifier les fichiers du cache de plugins
  (`~/.zcode/cli/plugins/cache/**`) — pour changer un plugin, le
  réinstaller ou le mettre à jour via l'interface.
- Le hook mimosa scanne les écritures : d'où les règles 1 et 2 du
  canon — les contournements shell sont bloqués, à juste titre.
- Langue du code et des commentaires des projets : français.
