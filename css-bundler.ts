import { globby } from "globby";
import { bundle } from "lightningcss";
import * as fs from "node:fs/promises";

async function bundleCssModules() {
  const paths = await globby("**/**.module.css", {
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
      cssModules: true,
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

  const bundleExports = bundleList
    .map((b) => {
      const [path] = Object.keys(b);
      const { exports: cssExports } = b[path];
      const str = `export const ${path
        .replace(/\//g, "_")
        .replace(
          /\.module\.css/g,
          ""
        )}: { [x: string]: any; } = ${JSON.stringify({
        ...Object.keys(cssExports).reduce(
          (acc, next) => ({ ...acc, [next]: cssExports[next].name }),
          {}
        ),
      })};`;
      return str;
    })
    .join("\n");

  await fs.writeFile("dist/style-modules.ts", bundleExports);
  await fs.writeFile("dist/bundle.min.css", bundleCode);
}

export { bundleCssModules };
