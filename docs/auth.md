### fabuya.auth
A category for authentication needs.

### fabuya.auth.AuthSave
AuthSave class is a class that stores your authentication credentials
and helps you to save it to a file.

**Extends** [BaseAuthSave](#fabuyaauthbaseauthsave)
> Please read `BaseAuthSave` if you're confused<br>
> about missing properties or methods.

 - #### new AuthSave(filename: String)
   **filename** - The destination file to save auth state on.

   Create a new AuthSave class.
 - #### save()
   A synchronous function to save the credentials into a single file.
   Throws an exception when [`.filename`](#filename) has not been set
 - #### static fromFile(filename: String) -> AuthSave
   Wrapper over [`BaseAuthSave.fromFile()`](#static-fromfilefilename-string---baseauthsave)
   that generates `AuthSave` instead of `BaseAuthSave`.

### fabuya.auth.BaseAuthSave

 - #### new BaseAuthSave(filename: String)
   **filename** - The destination file to save auth state on. Decoration only,
   BaseAuthSave does not save your authentication credentials anywhere.
 - #### .filename
   **Type** String

   The destination file to save auth state on.
   Useful for information purpose.
 - #### .state
   The core information to save.
   - #### .creds
     The client credentials
   - #### .keys
     The client keys
 - #### static fromFile(filename: String) -> BaseAuthSave
   A synchronous function to create `BaseAuthSave` class from an existing
   file. Can only accepts a file that are created using
   [`AuthSave.save()`](#save) method or having the same format.

#### How To Extends BaseAuthSave
In order to create your own auth saver, you can extend BaseAuthSave.
The bare minimum method you need to implement is `save()`, here's how.

```js
class MySaver extends BaseAuthSave {
	constructor(filename) {
		// Initiate BaseAuthSave's properties
		super(filename);
	}

	/**
	 * Here, you need to implement this.
	 * save() is a synchronous class method that will be called
	 * by Baileys whenever there's a key change.
	 */
	save() {
		// Implement your saving algorithm/procedure here

		// For example, saving to a REST API like this:
		await fetch("http://localhost:8080/api/auth/save", {
			method: "POST",
			headers: { 'Content-Type': 'application/json' }
			body: { stateString: this.stateAsJSON() },
		});

		// Happy hacking!
	}
}
```
