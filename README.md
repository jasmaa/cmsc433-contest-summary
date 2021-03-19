# CMSC433 Contest Notifier

Periodically notify users of CMSC433 contest scoreboard status

## Development

    # Worker
    cd worker
    wrangler dev

    # Web
    cd web
    yarn start

## Production

    # Worker
    cd worker
    wrangler publish

    # Web
    cd web
    yarn build
    npx netlify deploy --dir build --prod

## Project Structure

  - `worker`: Subscription API
  - `web`: Web frontend