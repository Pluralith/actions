![GitHub Badge Blue](https://user-images.githubusercontent.com/25454503/157907219-fceef93a-1399-4a4a-b95b-a44fd44a156f.svg)

# Pluralith Comment Action

This GitHub Action posts the `comment.md` produced by the Pluralith CLI as a comment on either pull requests or commits. This action uses the [compost](https://github.com/infracost/compost) CLI tool created by [Infracost](https://github.com/infracost).
The following actions need to be run for this action to work properly:

- `Pluralith/actions/setup`
- `Pluralith/actions/run`

&nbsp;

## Usage

Add the following step to your GitHub Actions workflow:

```yml
steps:
  - name: Pluralith Comment
    uses: Pluralith/actions/comment@v1
    with:
      path: /tmp/comment.md
```

&nbsp;

## Inputs

The action supports the following inputs:

- `terraform-path`: **Required** - The path to your Terraform project. This is where the Pluralith CLI produces the 'comment.md' file which contains the comment body.

- `behavior`: **Optional** - The behavior used to post a comment with an infrastructure diagram attached. Defaults to `update`. Must be one of the following:

  - `update`: Create a single comment and update it on changes. This is the "quietest" option. The GitHub comments UI shows what/when changed when the comment is updated. Pull request followers will only be notified on the comment create (not updates), and the comment will stay at the same location in the comment history.
  - `delete-and-new`: Delete previous infrastructure diagram comments and create a new one. Pull request followers will be notified on each comment.
  - `hide-and-new`: Minimize previous infrastructure diagram comments and create a new one. Pull request followers will be notified on each comment.
  - `new`: Create a new infrastructure diagram comment. Pull request followers will be notified on each comment.

- `target-type`: **Optional** - Which objects should be commented on, either `pull-request` or `commit`.

- `github-token`: **Optional** - This is the default GitHub token available to actions and is used to post comments. The default [token permissions](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#permissions) work fine; `pull-requests: write` is required if you need to customize these. Defaults to `${{ github.token }}`.

  ```yml
  steps:
    - name: Pluralith Comment
      uses: Pluralith/actions/comment@v1
      with: ...
      permissions:
        pull-requests: write
  ```

&nbsp;

## Outputs

This action sets the following outputs:

- `body`: The body of comment that was posted.
