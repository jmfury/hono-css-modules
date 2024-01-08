import { globby } from "globby";
import { bundle } from "lightningcss";
import * as fs from "node:fs/promises";
import { writeFileSync, readFileSync } from "node:fs";

export function bundleCssModule({ path }) {
  const file = readFileSync(path);
  const spec = {
    filename: path,
    code: Buffer.from(file),
    minify: true,
    sourceMap: true,
    cssModules: true,
  };
  const { code, exports: cssExports } = bundle(spec);

  writeFileSync(`dist/${path.replace(/\//g, "_")}`, code);

  const styles: { [x: string]: string } = Object.keys(
    cssExports as object
  ).reduce((acc, next) => ({ ...acc, [next]: cssExports[next].name }), {});

  return { styles };
}

export async function clearCss({ dir }) {
  const paths = await globby(dir ? `${dir}/*.module.css` : "**/**.module.css", {
    expandDirectories: true,
  });
  const listToClear = [];

  // Delete all produced css module files
  for (const path of paths) {
    listToClear.push(fs.unlink(path));
  }
}

export async function bundleCss({ dir }) {
  const paths = await globby(dir ? `${dir}/*.module.css` : "**/**.module.css", {
    expandDirectories: true,
  });
  const bundleList = [];
  for (const path of paths) {
    const file = await fs.readFile(path);
    const spec = {
      filename: path,
      code: Buffer.from(file),
      minify: true,
      sourceMap: true,
    };
    const bundled = bundle(spec);
    bundleList.push({ [path]: bundled });
  }

  const bundleCode = bundleList
    .map((b) => {
      const [path] = Object.keys(b);
      const { code } = b[path];
      return code;
    })
    .join("");

  writeFileSync("dist/bundle.min.css", bundleCode);
}
