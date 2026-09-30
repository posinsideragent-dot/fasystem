# Fixed Assets Management

Web app on top of a Notion database. Pages: Dashboard, Update assets, Deactivate assets. One shared team password.

## Deploy (about 10 minutes)

### 1. Create the Notion connection (once)
1. In Notion open **Settings**, then **Connections** (turn on Developer Mode if shown). Click **+ New connection**, name it and pick your workspace. Only a workspace owner can do this.
2. Click the ••• menu next to it and retrieve the internal connection token. This is your NOTION_TOKEN.
3. Open the **Fixed Assets** database in Notion, click the ••• menu, then **Connections**, and add your integration.

### 2. Put the code on Vercel
1. Create a GitHub repo and upload everything in this folder (do not upload any `.env` file).
2. On https://vercel.com click **Add New, Project**, import the repo, keep the defaults.
3. Before deploying, add these Environment Variables:

| Name | Value |
|---|---|
| NOTION_TOKEN | the secret from step 1 |
| NOTION_DATABASE_ID | 6ecceff7487547448fe38c77d7019896 |
| APP_PASSWORD | the team password you choose |
| SESSION_SECRET | any long random text (30+ characters) |

4. Click **Deploy**. Share the `https://your-project.vercel.app` link and the password with your team.

## Using it
- **Dashboard**: total, by location, by brand, and the list. Active assets only.
- **Add asset**: create a new asset (Model required). It starts as Active. A duplicate serial number is rejected.
- **Update assets**: Edit an asset to change Location or Person in charge.
- **Deactivate assets**: sets Status to Inactive. Inactive assets vanish from every page. To bring one back, set Status to Active in Notion.

## Notes
- Assets added directly in Notion also work. Rows with no Status count as Active.
- New locations: add an option to the Location property in Notion. The Update page picks it up.
- To change the password, edit APP_PASSWORD in Vercel and redeploy.
- Run `npm test` to check the API logic (uses a mocked Notion).
