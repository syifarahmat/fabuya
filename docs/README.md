# fabuya
Baileys whatsapp API library wrapper

## Installation
**Stable version**</br>
The default version. **Please install beta version only, v0.1.0 will be released as stable soon**
```sh
npm install fabuya
```

**Release Candidate version**<br/>
A pretty stable version that is enough for personal use.
```sh
npm install fabuya@rc
```

**Beta version**<br/>
A chaotic version that includes groups of new features or fixes.
```sh
npm install fabuya@beta
```

**Nightly version**<br/>
If the repository has at least a `feat` or `fix` commit at the end of the night,
the next day it will be published.
```sh
npm install fabuya@nightly
```

**From git+https**<br/>
Pure latest push from repository.
```sh
npm install git+https://github.com/HanzHaxors/fabuya.git
```

**Building Source**<br/>
Good for developers.
```sh
# If you didn't clone the repo using --recursive, uncomment two lines below
#rm Baileys/*
#git submodule update --init -N Baileys

npm install
```

## The Fabuya Package
### CommonJS Import
```js
const fabuya = require('fabuya');
```

### Submodule (Categories)
 - [auth](./auth.md) - Solves your authentication needs

### Classes
 - [Client](./Client.md#fabuyaclient) - Multi device whatsapp client

### Functions
 - [create](./Client.md#fabuyacreate)(clientName: String, configuration: Object) -> [Client](./Client.md#fabuyaclient)
