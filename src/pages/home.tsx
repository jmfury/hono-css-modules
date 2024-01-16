import type { FC } from "hono/jsx";
import { bundleCssModule } from "@cssmodule";
const { styles } = bundleCssModule("./home.module.css");

export const Page: FC = async (props) => {
  return (
    <main>
      {props.posts.map((post: any) => (
        <article class={styles.foo}>
          <h2 data-fine="true">
            <a href={`/posts/${post.slug}`}>{post.title}</a>
          </h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </main>
  );
};
