# Issue tracker: GitHub

Issues and specs live in https://github.com/gntzh/hello-agents-ts.
Use the gh CLI from this repository.

## Operations

- Before creating issues, verify the target with:
  gh repo view --json nameWithOwner
  The target must be gntzh/hello-agents-ts.
- Create: gh issue create --title "..." --body-file <file>
- Read: gh issue view <number> --json number,title,body,labels,comments
- List: gh issue list --state open --json number,title,labels
- Comment: gh issue comment <number> --body-file <file>
- Label: gh issue edit <number> --add-label "..." --remove-label "..."
- Close: post the explanation as a comment, then gh issue close <number>.

Use temporary files for multiline bodies.

## Relationships

Use GitHub native sub-issues and issue dependencies when available.
Otherwise, put "Part of #<parent>" and "Blocked by: #<number>" at the
top of child issue bodies, and list children in the parent task list.
An issue is unblocked when every blocker is closed.

## Pull requests as a triage surface

PRs as a request surface: no.

## Skill conventions

"Publish to the issue tracker" means create a GitHub issue.
"Fetch the relevant ticket" means read the GitHub issue.

For wayfinder, keep the map in an issue labelled wayfinder:map.
Link child tickets to the map and label them wayfinder:<type>.
Choose the first open, unassigned child with no open blockers in map order.
Claim it by assigning yourself. Resolve it by commenting, closing it,
and adding a finding summary and link to the map's Decisions-so-far.
