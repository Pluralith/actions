![GitHub Badge Blue](https://user-images.githubusercontent.com/25454503/157907219-fceef93a-1399-4a4a-b95b-a44fd44a156f.svg)

# Pluralith Run Action

This GitHub Action runs the Pluralith CLI and produces an infrastructure diagram based on the latest Terraform state as a PDF.
The following actions need to be run for this action to work properly:

- `Pluralith/actions/init`

&nbsp;

## Usage

Add the following step to your GitHub Actions workflow:

```yml
steps:
  - name: Pluralith Run
    uses: Pluralith/actions/run@v1
    with:
      terraform-path: path/to/terraform/project
```

&nbsp;

## Inputs

The action supports the following inputs:

- `terraform-path`: **Required** - The path to your Terraform project directory (where you usually run Terraform plan).
- `diagram-title`: **Required** - The title shown in your exported diagram PDF
- `diagram-author`: **Optional** - The author shown in your exported diagram PDF. Defaults to "Pluralith CLI".
- `diagram-version`: **Optional** - The version shown in your exported diagram PDF. Defaults to "v1.0".
