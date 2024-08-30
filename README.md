# mirror-jsr-to-npm

`mirror-jsr-to-npm` is a tool designed to mirror packages from the JSR (JavaScript Registry) to npm. This utility simplifies the process of publishing JSR packages to the npm registry, making your packages more accessible to a wider audience.

## 🌟 Features

- Automatically downloads packages from JSR
- Converts JSR package names to npm-compatible formats
- Updates package metadata for npm compatibility
- Publishes the converted package to npm
- Designed for use with GitHub Actions

## 🛠️ Prerequisites

- GitHub repository
- npm account (for publishing)

## 🚀 Usage with GitHub Actions

To use `mirror-jsr-to-npm` in your GitHub Actions workflow, create a new workflow file (e.g., `.github/workflows/publish-to-npm.yml`) with the following content:

```yaml
name: Publish to npm

env:
  NODE_VERSION: lts/*
  DENO_VERSION: v1.x

on:
  push:
    tags:
      - "v*"
  workflow_dispatch:

jobs:
  jsr:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: denoland/setup-deno@v1
        with:
          deno-version: ${{ env.DENO_VERSION }}
      - name: Publish to jsr
        run: deno publish

  npm:
    needs: 
      - jsr
    runs-on: ubuntu-latest
    # if you need publish with provenance, you should set permissions
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          registry-url: 'https://registry.npmjs.org' # needed for npm publish
      - uses: denoland/setup-deno@v1
        with:
          deno-version: ${{ env.DENO_VERSION }}
      - name: Publish to npm
        run: deno run -A jsr:@ryoppippi/mirror-jsr-to-npm
        env:
          PACKAGE_DESCRIPTION: "Your package description"
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }} # Set your npm token as a GitHub secret
          NPM_CONFIG_PROVENANCE: true # If you publish with provenance
```

Make sure to replace `@your-scope/your-package`, "Your package description", and "https://your-homepage.com" with your actual package details.

## 🔑 Environment Variables

- `PACKAGE_NAME`: The name of your package (e.g., "@octocat/hello-world")
- `PACKAGE_VERSION`: The version of your package (optional, defaults to the git tag)
- `PACKAGE_DESCRIPTION`: A brief description of your package
- `PACKAGE_HOMEPAGE`: The homepage URL of your package (optional, default is jsr page)
- `PACKAGE_REPOSITORY`: The URL of your package's repository (optional, defaults to `GITHUB_REPOSITORY`)
- `PACKAGE_LICENSE`: The license of your package (optional, defaults to "MIT")
- `PACKAGE_AUTHOR`: The author of the package (optional, defaults to `GITHUB_REPOSITORY_OWNER`)
- `NPM_TOKEN`: Your npm authentication token (should be set as a GitHub secret)
- `NPM_CONFIG_PROVENANCE`: Whether to publish with provenance (optional, defaults to false)
- `NPM_OPTIONS`: Additional options for npm publish command (optional, defaults to `--access public`)

## 🔧 How It Works

1. Triggered by a new release in your GitHub repository
2. Downloads the specified package from JSR
3. Modifies the `package.json` to be compatible with npm:
   - Updates the package name
   - Sets the description, homepage, repository, license, and author based on provided environment variables or GitHub-provided information
4. Publishes the modified package to npm

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
