### fabuya.auth
A category for authentication needs.

### fabuya.auth.AuthSave
AuthSave class is a class that stores your authentication credentials
and helps you to save it to a file.

 - #### new AuthSave(filename: String)
   **filename** - The destination file to save auth state on.

   Create a new AuthSave class.
 - #### .filename
   **Type** String

   The destination file to save auth state on.
   Required by the [`AuthSave.save()`](#save) method.
 - #### .state
   The core information that AuthSave will write to a file.
   - #### .creds
     The client credentials
   - #### .keys
     The client keys
 - #### save()
   A synchronous function to save the credentials into a single file.
   Throws an exception when [`.filename`](#filename) has not been set
 - #### static fromFile(filename: String) -> AuthSave
   A synchronous function to create `AuthSave` class from an existing
   file. Can only accepts a file that are created using
   [`AuthSave.save()`](#save) method or having the same format.
