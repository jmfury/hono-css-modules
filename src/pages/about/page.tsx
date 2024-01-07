import type { FC } from "hono/jsx";
import { src_pages_about_style as styles } from "../../../dist/style-modules";

export const Page: FC = () => {
  return (
    <main class={styles.about}>
      <h1>This is what it's all about </h1>
    </main>
  );
};
