/* Renders text written in the admin's editor.

   The HTML comes only from src/lib/richtext.ts, which builds it from the
   editor's structured content and escapes every word and address in it — so
   nothing stored in the database can inject code into a page. This is the
   one place in the site that inserts HTML. */
export function Html({ html, as: Tag = "div", className }: {
  html: string;
  as?: "div" | "p" | "blockquote" | "span" | "li" | "section";
  className?: string;
}) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
