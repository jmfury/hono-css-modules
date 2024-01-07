import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { html } from "hono/html";
import { Page } from "./pages/home";

const app = new Hono();

interface SiteData {
  title: string;
  description: string;
  children?: any;
}

const Layout = (props: SiteData) => html`
  <html>
    <head>
      <title>${props.title}</title>
      <meta name="description" content="${props.description}" />
      <link rel="stylesheet" href="/static/bundle.min.css" />
    </head>
    <body>
      ${props.children}
    </body>
  </html>
`;

interface Post {
  slug: string;
  title: string;
  excerpt: string;
}

const Home = (props: { siteData: SiteData; name: string; posts: Post[] }) => (
  <Layout {...props.siteData}>
    <h1>Hello {props.name}</h1>
    <Page posts={props.posts} />
  </Layout>
);

app.get("/", (c) => {
  const props = {
    name: "World",
    siteData: {
      title: "Hello! Hono!",
      description: "Hono is cool!",
    },
    posts: [
      {
        slug: "hello-world",
        title: "Hello World",
        excerpt: "This is a post about Hello World",
      },
      {
        slug: "hello-world-2",
        title: "Hello World 2",
        excerpt: "This is a post about Hello World too",
      },
    ],
  };
  return c.html(<Home {...props} />);
});

app.use(
  "/static/*",
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => path.replace(/^\/static/, "/dist"),
  })
);

serve(app);
