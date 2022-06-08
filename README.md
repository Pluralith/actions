![GitHub Badge Blue](https://user-images.githubusercontent.com/25454503/158019834-99b2365e-94c4-4139-80ef-3e0b7bf354f0.svg)
# Pluralith GitHub Actions

This repo contains a collection of Github Actions to run Pluralith in CI and post infrastructure diagrams as pull request or commit comments.
It currently contains three actions, we recommend running them in conjunction:
1) **Init** - `Pluralith/actions/init`
2) **Run** - `Pluralith/actions/run`
3) **Comment** - `Pluralith/actions/comment`

&nbsp;

### 📍 The result looks like this:

![Actions Example](https://user-images.githubusercontent.com/25454503/158020347-409bde98-8f20-43b3-9b68-15604191f9d1.png)

&nbsp;

## ⚙️ Getting Started

Follow these steps to get Pluralith running in your GitHub Actions workflow:
1. Set `PLURALITH_API_KEY` as a [repository secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository). You can get your API key from the [Pluralith Desktop App](https://www.pluralith.com) or through the Pluralith Web Dashboard *(coming soon)*
2. Set credentials for the providers of your choice as repository secrets *(e.g. for AWS set `AWS_ACCESS_KEY` and `AWS_SECRET_KEY`)*.
3. Create a new Pluralith workflow file in your repo at `.github/workflows/pluralith.yml` *(View the full example at the bottom of this README to see how to structure a workflow YML file)*
4. Set up your provider credentials to be used by Terraform in the workflow. Check out the Terraform docs for your provider for more information on how to authenticate.
5. Set up Terraform and run `terraform init`. Hashicorp's `hashicorp/setup-terraform` action makes this a breeze. Check it out [here](https://github.com/hashicorp/setup-terraform) or copy the example below into your steps:
 
      ```yml
      # Set up Terraform
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v1
        with:
          terraform_wrapper: false # This is recommended so the `terraform show` command outputs valid JSON

      # Init Terraform project
      - name: Terraform Init
        run: terraform init
        working-directory: path/to/terraform/root
      ```
6. Set up and run Pluralith. Copy and paste the following three steps into your worflow:
      ```yml
      # Set up and authenticate Pluralith
      - name: Pluralith Init
        uses: Pluralith/actions/init@v1.0.0
        with:
          api-key: ${{ secrets.PLURALITH_API_KEY }}

      # Run Pluralith to generate an infrastructure diagram and comment body
      - name: Pluralith Run
        uses: Pluralith/actions/run@v1.0.0
        with:
          terraform-path: "${{ env.working-directory }}/application"
          diagram-title: "Actions Test"
          diagram-author: "Pluralith Core Team"
          diagram-version: "v0.1.0"

      # Post the generated diagram as a GitHub comment
      - name: Pluralith Comment
        uses: Pluralith/actions/comment@v1.0.0
        with:
          terraform-path: "${{ env.working-directory }}/application"
      ```
&nbsp;

## 🛰️ Action Overview

Click the links below or navigate the repository above to learn more about the individual GitHub Actions for Pluralith:
- **[Pluralith Init](https://github.com/Pluralith/actions/tree/main/init)** - Sets up and authenticates Pluralith
- **[Pluralith Run](https://github.com/Pluralith/actions/tree/main/run)** - Runs `pluralith graph` to produce an infrastructure diagram as a PDF
- **[Pluralith Comment](https://github.com/Pluralith/actions/tree/main/comment)** - Posts the infrastructure diagram created in `Pluralith Run` as a GitHub comment to a pull request or commit

&nbsp;

## 📦 Full AWS Example

If you are running AWS you can copy and paste the following into your `.github/workflows/pluralith.yml`. Adjust the paths to fit your Terraform project structure and you should be ready to go!

```yml
on: [pull_request]
jobs:
  pluralith:
    runs-on: ubuntu-latest
    env:
      working-directory: terraform

    name: Run Pluralith
    steps:
      - name: Check out repository
        uses: actions/checkout@v2

      # Set up AWS credentials (using the aws-actions/configure-aws-credentials action)
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_KEY }}
          aws-region: eu-central-1

      # Set up Terraform
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v1
        with:
          terraform_wrapper: false # This is recommended so the `terraform show` command outputs valid JSON
          
      # Init Terraform project
      - name: Terraform Init
        run: terraform init
        working-directory: "${{ env.working-directory }}/application"

      # Set up and authenticate Pluralith
      - name: Pluralith Init
        uses: Pluralith/actions/init@v1.0.0
        with:
          api-key: ${{ secrets.PLURALITH_API_KEY }}

      # Run Pluralith to generate an infrastructure diagram and comment body
      - name: Pluralith Run
        uses: Pluralith/actions/run@v1.0.0
        with:
          terraform-path: "${{ env.working-directory }}/application"
          diagram-title: "Actions Test"
          diagram-author: "Pluralith Core Team"
          diagram-version: "v0.1.0"

      # Post the generated diagram as a GitHub comment
      - name: Pluralith Comment
        uses: Pluralith/actions/comment@v1.0.0
        with:
          terraform-path: "${{ env.working-directory }}/application"
```

&nbsp;

## 👩‍🚀 Looking to become a tester or talk about the project?
- Sign up for the `alpha` over on our **[Website](https://www.pluralith.com)**
- Join our **[Subreddit](https://www.reddit.com/r/Pluralith/)**
- Check out our **[Roadmap](https://roadmap.pluralith.com)** and upvote features you'd like to see
- Or just shoot us a message on Linkedin:
  -  [Dan's Linkedin](https://www.linkedin.com/in/danielputzer/)
  -  [Phi's Linkedin](https://www.linkedin.com/in/philipp-weber-a8517b231/)

*Disclaimer: To properly use any of the Pluralith Actions you **will need an API key**. [Sign up](https://www.pluralith.com) for the private alpha to get access!*

![Subreddit subscribers](https://img.shields.io/reddit/subreddit-subscribers/pluralith?style=social)
