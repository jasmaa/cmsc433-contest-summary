# web

Create React App website

## Setup

Create `.env` from `sample.env` and fill with URL of Cloudflare worker.

Install dependencies:

    yarn install

## Development

    yarn start

## Deploy to Netlify

Authenticate with Netlify:

    npx netlify login

Build and deploy with:

    yarn build
    yarn deploy