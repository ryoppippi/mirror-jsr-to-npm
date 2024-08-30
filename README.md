# mirror-jsr-to-npm

`mirror-jsr-to-npm` is a tool designed to mirror packages from JSR to npm. This utility simplifies the process of publishing JSR packages to the npm registry, making your packages more accessible to a wider audience.


## 💡 Motivation

The inspiration for creating `mirror-jsr-to-npm` came from [an issue made by a developer from China](https://github.com/samchon/typia/issues/1249).   
They mentioned that accessing packages from JSR was slow in China and asked if I could also publish my packages to npm.  
While I find JSR to be an excellent platform with its ability to handle builds, package.json generation, and other tasks effortlessly, npm, on the other hand, requires manual setup and configuration, which I find less appealing.

Despite my preference for JSR, the request highlighted the need for broader accessibility. To address this, I decided to create a solution that would allow me to mirror my JSR packages to npm without compromising the developer experience I enjoy with JSR.

As the official tools for this task are not yet available, I developed a CLI tool and integrated it with GitHub Actions. This setup automates the process, ensuring that my packages are easily accessible on npm for users who may experience slower access to JSR.

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

## 🔑 Environment Variables

- `PACKAGE_NAME`: The name of your package (optional, defaults to the git repository name with `@` prefix. e.g. `octocat/hello-world` -> `@octocat/hello-world`)
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
