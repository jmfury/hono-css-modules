import type { FC } from "hono/jsx";
import { src_pages_home } from "../../dist/style-modules";

export const Page: FC = (props) => {
  return (
    <main class={src_pages_home.home}>
      {props.posts.map((post: any) => (
        <article>
          <h2>
            <a href={`/posts/${post.slug}`}>{post.title}</a>
          </h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </main>
  );
};
