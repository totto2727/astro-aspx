import type { MiddlewareHandler } from "astro";
import { defineMiddleware } from "astro/middleware";
import { HTMLRewriter } from "htmlrewriter";

export const onRequest: MiddlewareHandler = defineMiddleware(
  async (context, next) => {
    const res = await next();

    if (import.meta.env.DEV) return res;

    if (
      !(res instanceof Response) ||
      res.headers.get("content-type") !== "text/html"
    ) {
      return res;
    }

    const rewriter = new HTMLRewriter();

    rewriter.on("a", {
      element(element) {
        const href = element.getAttribute("href");
        if (!href?.startsWith("/")) return;

        if (href.endsWith("/")) {
          element.setAttribute("href", `${href}index.aspx`);
        } else {
          element.setAttribute("href", `${href}/index.aspx`);
        }
      },
    });

    return rewriter.transform(res);
  }
);
