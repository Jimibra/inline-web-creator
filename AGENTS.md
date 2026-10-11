<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Keep the CMS workspace at `/` and its editable website renderer in reusable components, so editor and published snapshots share presentation.
- Store private site documents with owner-scoped RLS and publish into a separate public snapshot table, so unpublished changes remain private.
- Use browser Cloud queries for owner-authenticated edits and a public server function for published reads, so SSR never depends on browser sessions.
- Keep business page records inside the site document and page switching inside the canvas, so editing one website does not navigate away from the workspace.
