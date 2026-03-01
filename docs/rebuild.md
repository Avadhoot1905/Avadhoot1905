
`
rm -rf dist
npx esbuild index.js --bundle --platform=node --target=node18 --outfile=dist/index.js
cd dist
zip -r lambda.zip index.js
`