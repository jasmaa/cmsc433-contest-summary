# worker

Cloudflare worker

## Setup

### Pre-requisites

  - Deploy `web`
  - Install [Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update)

### Instructions

Get the URL for the scoreboard page. This will be `SCOREBOARD_URL`.

Get the URL for the web deployment. This will be `WEB_URL`.

Create a SendGrid account and create a verified sender with address `SENDER_ADDRESS`.

Create SendGrid Dynamic Templates for verify and update using the templates in `templates/`.
The ids for these templates will be `VERIFY_TEMPLATE_ID` and `UPDATE_TEMPLATE_ID` respectively.

Create `wrangler.toml` from `wrangler.sample.toml` and configure variables.

Run and paste in `SENDGRID_API_KEY`:

    wrangler secret put SENDGRID_API_KEY

Run and add namespace and ids to `wrangler.toml`:

    wrangler kv:namespace create USERS --preview
    wrangler kv:namespace create BOARDS --preview

Install dependencies:

    yarn install

## Development

    wrangler dev

## Deploy

Run and add namespace and ids to `wrangler.toml`:

    wrangler kv:namespace create USERS
    wrangler kv:namespace create BOARDS

Deploy:

    wrangler publish