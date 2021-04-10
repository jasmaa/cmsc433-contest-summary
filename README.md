# CMSC433 Contest Summary

Summary visualizations and updates for maze contest

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

  - `worker`: Data jobs + summary and subscription API
  - `web`: Web frontend
  - `scripts`: Backup and data manipulation scripts