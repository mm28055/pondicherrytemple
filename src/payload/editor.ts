import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  lexicalEditor,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

/* The writing editor: a Word-like toolbar always visible at the top, and a
   small one that appears over selected text. Kept to what the site shows —
   no fonts, colours or alignment to fight with. */

const linkable = ['field-notes', 'articles', 'temples', 'observances'] as const

/** For field notes, articles and longer pieces: headings, quotes, lists,
    links, and photos, videos or recordings placed in the text. */
export const fullEditor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    LinkFeature({ enabledCollections: [...linkable] }),
    UnorderedListFeature(),
    OrderedListFeature(),
    BlockquoteFeature(),
    UploadFeature({
      collections: {
        media: { fields: [{ name: 'caption', type: 'text', label: 'Caption (if different)' }] },
      },
    }),
    HorizontalRuleFeature(),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})

/** For short texts: introductions and explanations. Paragraphs, emphasis, lists, links. */
export const shortEditor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    BoldFeature(),
    ItalicFeature(),
    LinkFeature({ enabledCollections: [...linkable] }),
    UnorderedListFeature(),
    OrderedListFeature(),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})
