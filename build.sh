echo Please wait, this might takes minutes

# build Baileys
npm run init:baileys

# Copy Baileys runtime dependencies
cp -rf ./Baileys/lib ./baileys-lib
cp -rf ./Baileys/WAProto ./WAProto
cp -rf ./Baileys/WASignalGroup ./WASignalGroup
