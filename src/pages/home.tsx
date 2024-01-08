import type { FC } from "hono/jsx";
import { bundleCssModule } from "@cssmodule";
const { styles } = bundleCssModule({ path: __dirname + "/home.module.css" });

export const Page: FC = (props) => {
  return (
    <main class={styles.home}>
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
