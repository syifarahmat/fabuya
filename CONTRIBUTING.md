1. Follow semantic commit rules

In order to respect everybody working on the tree, we all need to set up
standard about how we communicate with others. New contributors are always
welcome, but they would never understand the codebase when they don't know
what has been changed over time.

In order to solve that problem, i kindly asks you to follow The
[Semantic Commit Standard](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716)

Baileys has been using them and I have saw the advantage on using them.
From new contributors to release publishers, we're all got the benefits.

2. Commit changes, not result.

In git semantic commiting, there can only be one message for one commit.
Basically, you can't just stuff all of your changes into one commit and
expect everyone to understand **what has been changed**.

For example, you change a variable name, write a commit. You made another
change, write a commit immediately. Don't forget about them

3. Use regular merge commit, not squash

To preserve the changes that were made after merge separable, we need to let
maintainers explore the log precisely. By how? Don't combine PR commits into
one, this confuse maintainers when exploring. Especially when doing git blame
or bisecting.

4. Don't worry about code style

When your format is not like what the code base is, reviewer will reminds you
and you need to change them in order to get your PR merged.

### About Salvageable PRs

Salvageable PRs are PRs that the control can be taken over completely by another
contributors. The main reason behind a PR become salvageable is because
The PR creator abandon his work. If such PRs never be labeled as `Salvageable`,
no other maintainers would work on the same topic. This is important, especially
if the PR can potentially solve an issue.
