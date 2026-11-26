# Christmas Village

Child-friendly Christmas web app for Emma, Sophie, and Adam, available under the family Kids Hub.

- Games: Picture matching (4 or 6 pairs), counting practice, and Christmas trivia.
- Activities: 24 pick-anytime family activities with completion tracking per child.
- Santa's Wish List: Add ideas by text or picture, favorite wishes, remove entries, and copy a list to share.
- Progress: Each child has separate activity and wish-list state saved in the current browser's localStorage.

**Important:** Wish lists and activity completion are device-local, not synced across tablets or backed up remotely. Copy a list to share it. No wish information is sent to an API, Santa, or any third party.

## Development

From the repository root:

    npm ci
    npm run dev --workspace kids-christmas
    npm run lint --workspace kids-christmas
    npm test --workspace kids-christmas
    npm run build --workspace kids-christmas

## Deployment

The Christmas app is a separate Cloudflare Worker named kids-christmas. Its gateway Service Binding is CHRISTMAS. Deploy it before deploying the updated kids-gateway on initial cutover. The Christmas workflow will also deploy the gateway after the Christmas Worker, ensuring the new route is available. GitHub secrets CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID are required.
