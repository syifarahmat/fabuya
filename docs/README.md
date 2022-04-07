# fabuya
Baileys whatsapp API library wrapper

## Installation
**Stable version**
The default version
```sh
npm install fabuya
```

**Release Candidate version**
A pretty stable version that is enough for personal use.
```sh
npm install fabuya@rc
```

**Beta version**
A chaotic version that includes groups of new features or fixes.
```sh
npm install fabuya@beta
```

**Nightly version**
If the repository has at least a `feat` or `fix` commit at the end of the night,
the next day it will be published.
```sh
npm install fabuya@nightly
```

## The Fabuya Package
### CommonJS Import
```js
const fabuya = require('fabuya');
```

### Classes
 - [Client](./Client.md#fabuyaclient)

### Functions
 - [create](./Client.md#fabuyacreate)(clientName: String, configuration: Object) -> [Client](./Client.md#fabuyaclient)
