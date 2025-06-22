# vercel.sh
if [[ "$VERCEL_ENV" == "production" ]]; then
  echo "Building for Production"
  bunx convex deploy --cmd 'bun run build'
else
  echo "Building for Staging"
  bun run build
fi