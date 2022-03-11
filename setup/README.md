![GitHub Badge Blue](https://user-images.githubusercontent.com/25454503/157907219-fceef93a-1399-4a4a-b95b-a44fd44a156f.svg)

# Pluralith Setup Action

This GitHub Action downloads and configures the latest version of the Pluralith CLI in an Actions workflow.

&nbsp;

## Usage

Add the following step to your GitHub Actions workflow:

```yml
steps:
  - name: Pluralith Setup
    uses: Pluralith/actions/setup@v1
    with:
      api-key: ${{ secrets.PLURALITH_API_KEY }}
```

&nbsp;

## Inputs

The action supports the following inputs:

- `api-key`: **Required** - Your Pluralith API Key. Retrieve it from the **Pluralith Desktop App** or the **Pluralith Dashboard** _(coming soon)_
- `github-token`: **Optional** - The GitHub access token used to get a list of Pluralith CLI versions. The default [token permissions](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#permissions) work fine; `pull-requests: write` is required if you need to customize these. Defaults to `${{ github.token }}`.
