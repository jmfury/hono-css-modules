import type { FC } from "hono/jsx";
// import { bundleCssModule } from "@cssmodule";
// const { styles } = bundleCssModule({ path: __dirname + "/home.module.css" });
import { cssModulizer } from "../../css-modules";
import { css } from "hono/css";
const styles = cssModulizer(__dirname + "/home.module.css");

const headingCss = css`
  color: red;
`;
console.log({ styles, headingCss });
export const Page: FC = async (props) => {
  const mine = await styles;
  const theirs = await headingCss;
  console.log({ mine, theirs });
  return (
    <main>
      {props.posts.map((post: any) => (
        <article>
          <h2 data-fine="true">
            <a href={`/posts/${post.slug}`}>{post.title}</a>
          </h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </main>
  );
};
