import type { PackageJson } from "type-fest";

import process from "node:process";
import { tmpdir } from "node:os";
import { $ } from "@david/dax";
import { download } from "nrd";
import * as semver from "@std/semver";

function getTagName(): string | undefined {
  const githubRef = process.env.GITHUB_REF;
  if (githubRef && githubRef.startsWith("refs/tags/")) {
    return githubRef.replace("refs/tags/", "");
  } else {
    return undefined;
  }
}

function getVersionStr(): string {
  const tagName = getTagName();
  if (tagName == null) {
    throw new Error("Could not get tag name from GITHUB_REF");
  }

  const versionStr = tagName.replace(/^v/, "");
  if (!semver.canParse(versionStr)) {
    throw new Error(`Invalid version string: ${versionStr}`);
  }
  return versionStr;
}

/**
 * ex. "@octocat/hello-world" -> "@jsr/octocat__hello-world"
 */
function convertToPackageName(name: string): string {
  const [_scope, pkg] = name.split("/");
  if (!_scope || !_scope.startsWith("@") || !pkg) {
    throw new Error(`Invalid package name: ${name}`);
  }
  const scope = _scope.slice(1);
  return `@jsr/${scope}__${pkg}`;
}

const tmpDir = $.path(tmpdir()).resolve();
const outDir = tmpDir.join("./package");

if (import.meta.main) {
  await outDir.mkdir();

  $.cd(tmpDir);

  const packageName = convertToPackageName(process.env.PACKAGE_NAME ?? "");
  const packageVersion = process.env.PACKAGE_VERSION ?? getVersionStr();

  await download(packageName, {
    registry: "https://npm.jsr.io",
    version: packageVersion,
    dir: tmpDir.toString(),
  });

  $.cd(outDir);

  const pkgJson = await $`cat ./package.json`.json() as PackageJson;

  const versionStr = process.env.PACKAGE_VERSION ?? getVersionStr();

  if (pkgJson.version !== versionStr) {
    throw new Error("Version mismatch");
  }

  pkgJson.name = process.env.PACKAGE_NAME;
  pkgJson.description = process.env.PACKAGE_DESCRIPTION;
  pkgJson.homepage = process.env.PACKAGE_HOMEPAGE ?? pkgJson.homepage;
  pkgJson.repository = process.env.PACKAGE_REPOSITORY ??
    `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  pkgJson.license = process.env.PACKAGE_LICENSE ?? "MIT";
  pkgJson.author = process.env.PACKAGE_AUTHOR ??
    process.env.GITHUB_REPOSITORY_OWNER;

  /* remove undefined fields */
  Object.keys(pkgJson).forEach((key) => {
    if (pkgJson[key] == null) {
      delete pkgJson[key];
    }
  });

  /* if debug, print package.json */
  if (process.env.DEBUG) {
    console.log(JSON.stringify(pkgJson, null, 2));
  }

  await $`echo ${JSON.stringify(pkgJson, null, 2)} > ./package.json`;

  await $`npm publish ${process.env.NPM_OPTIONS ?? "--access public"}`;
}
