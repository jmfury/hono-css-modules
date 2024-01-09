import { bundle } from "lightningcss";
import { readFileSync } from "node:fs";
import { raw } from "hono/html";

let cssMap = new Map();

export const bundleCss = () => {
  const paths = Array.from(cssMap.keys());

  const bundleList = [];
  for (const path of paths) {
    const file = cssMap.get(path);

    const spec = {
      filename: path,
      code: Buffer.from(file),
      minify: true,
      cssModules: true,
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

  return bundleCode;
};

function bundleCssModule({ path }) {
  const file = readFileSync(path);
  const spec = {
    filename: path,
    code: Buffer.from(file),
    minify: true,
    sourceMap: true,
    cssModules: true,
  };
  const { code, exports: cssExports } = bundle(spec);
  cssMap.set(path, code);

  const keys = Object.keys(cssExports as object);
  const styles: { [x: string]: string } = keys.reduce((acc, next) => {
    const className = `${cssExports[next].name} ${cssExports[next].composes
      .map((c) => c.name)
      .join(" ")}`;
    acc[next] = className;
    return acc;
  }, {});

  return { styles };
}

const id = "hono-css-modules";

export const Style = () => {
  return raw(`<style id="${id}">${bundleCss()}</style>`);
};

export { cssMap, bundleCssModule };

export async function clearCss() {
  cssMap = new Map();
}
