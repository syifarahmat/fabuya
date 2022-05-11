echo Please wait, this might takes minutes

# build Baileys
echo NOTE: You need to run \`npm run init:baileys\` before running this
npm run build:baileys

# Copy Baileys runtime dependencies
cp -rf ./Baileys/WAProto ./WAProto
cp -rf ./Baileys/WASignalGroup ./WASignalGroup

# TODO: update Baileys and see the effect
