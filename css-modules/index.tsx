import { raw } from "hono/html";
import { transform } from "lightningcss";
import type { HtmlEscapedCallback, HtmlEscapedString } from "hono/utils/html";
import type { CSSModuleExports } from "lightningcss";
import { readFileSync } from "fs";
const DEFAULT_STYLE_ID = "hono-css-modules";
const IS_CSS_CLASS_NAME = Symbol("IS_CSS_CLASS_NAME");
const STYLE_STRING = Symbol("STYLE_STRING");
const SELECTORS = Symbol("SELECTORS");
const EXTERNAL_CLASS_NAMES = Symbol("EXTERNAL_CLASS_NAMES");
type usedClassNameData = [
  Record<string, string>, // class name to add
  Record<string, true> // class name already added
];
// eslint-disable-next-line @typescript-eslint/ban-types
type CssVariableBasicType =
  | string
  | String
  | number
  | boolean
  | null
  | undefined;
type CssVariableAsyncType = Promise<CssVariableBasicType>;
type CssVariableArrayType = (CssVariableBasicType | CssVariableAsyncType)[];
type CssVariableType =
  | CssVariableBasicType
  | CssVariableAsyncType
  | CssVariableArrayType;

const transformCssModuleFile = (
  filename
): { css: string; cssModule: void | CSSModuleExports } => {
  const spec = {
    filename,
    code: Buffer.from(readFileSync(filename)),
    minify: true,
    cssModules: true,
    sourceMap: true,
  };
  const { code, exports: cssModule } = transform(spec);
  const css = new TextDecoder().decode(code);

  return { css, cssModule };
};

/**
 * @experimental
 * `createCssContext` is an experimental feature.
 * The API might be changed.
 */
export const createCssContext = ({ id }: { id: Readonly<string> }) => {
  const replaceStyleRe = new RegExp(`(<style id="${id}">.*?)(</style>)`);

  const cssModulizer = async (filename: string): Promise<{ string }> => {
    const className = new String([
      filename.replace(/\.module\.css$/, "").replace(/.*\//, ""),
    ]);

    const { css, cssModule } = transformCssModuleFile(filename);
    const appendCss: HtmlEscapedCallback = async ({
      buffer,
      context,
    }): Promise<string> => {
      if (buffer && replaceStyleRe.test(buffer[0])) {
        buffer[0] = buffer[0].replace(
          replaceStyleRe,
          (_, pre, post) => `${pre}${css}${post}`
        );
        return;
      }
      console.log({ id, css });
      const appendStyleScript = `<script>document.querySelector('#${id}').textContent+=${JSON.stringify(
        css
      )}</script>`;
      if (buffer) {
        buffer[0] = `${appendStyleScript}${buffer[0]}`;
        return;
      }
      return Promise.resolve(appendStyleScript);
    };
    const append: HtmlEscapedCallback = () => {
      console.log("append");
      return Promise.resolve(raw("", [appendCss]));
    };
    Object.assign(className, {
      ...{ css, cssModule },
      callbacks: [append],
      isEscaped: true,
      [IS_CSS_CLASS_NAME]: true,
      [STYLE_STRING]: "",
      [SELECTORS]: [],
      [EXTERNAL_CLASS_NAMES]: [],
    });
    return Promise.resolve(className);
  };

  //   const cx = async (
  //     ...args: (
  //       | string
  //       | boolean
  //       | null
  //       | undefined
  //       | Promise<string | boolean | null | undefined>
  //     )[]
  //   ): Promise<string> => {
  //     const resolvedArgs = await Promise.all(args);
  //     for (let i = 0; i < resolvedArgs.length; i++) {
  //       const arg = resolvedArgs[i];
  //       if (
  //         typeof arg === "string" &&
  //         !(arg as CssClassName)[IS_CSS_CLASS_NAME]
  //       ) {
  //         const externalClassName = new String(arg) as CssClassName;
  //         resolvedArgs[i] = Object.assign(externalClassName, {
  //           isEscaped: true,
  //           [IS_CSS_CLASS_NAME]: true,
  //           [STYLE_STRING]: "",
  //           [SELECTORS]: [],
  //           [EXTERNAL_CLASS_NAMES]: [arg],
  //         });
  //       }
  //     }

  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     return css(Array(resolvedArgs.length).fill("") as any, ...resolvedArgs);
  //   };

  //   const keyframes = async (
  //     strings: TemplateStringsArray,
  //     ...values: CssVariableType[]
  //   ): // eslint-disable-next-line @typescript-eslint/ban-types
  //   Promise<String> => {
  //     const styleString = await buildStyleString(strings, values, [], []);
  //     const className = new String(`@keyframes ${toHash(styleString)}`);
  //     Object.assign(className as CssClassName, {
  //       isEscaped: true,
  //       [IS_CSS_CLASS_NAME]: true,
  //       [STYLE_STRING]: styleString,
  //       [SELECTORS]: [],
  //       [EXTERNAL_CLASS_NAMES]: [],
  //     });
  //     return className;
  //   };

  const Style = () => raw(`<style id="${id}"></style>`);

  return {
    cssModulizer,
    Style,
  };
};

const defaultContext = createCssContext({ id: DEFAULT_STYLE_ID });

/**
 * @experimental
 * `css` is an experimental feature.
 * The API might be changed.
 */
export const cssModulizer = defaultContext.cssModulizer;

// /**
//  * @experimental
//  * `cx` is an experimental feature.
//  * The API might be changed.
//  */
// export const cx = defaultContext.cx;

// /**
//  * @experimental
//  * `keyframes` is an experimental feature.
//  * The API might be changed.
//  */
// export const keyframes = defaultContext.keyframes;

/**
 * @experimental
 * `Style` is an experimental feature.
 * The API might be changed.
 */
export const Style = defaultContext.Style;
