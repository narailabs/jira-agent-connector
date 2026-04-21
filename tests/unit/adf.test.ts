import { describe, it, expect } from "vitest";
import { adfToPlainText, type AdfNode } from "../../src/lib/adf.js";

describe("adfToPlainText", () => {
  it("returns empty string for empty input", () => {
    expect(adfToPlainText(undefined)).toBe("");
    expect(adfToPlainText(null)).toBe("");
    expect(adfToPlainText({ type: "doc" })).toBe("");
  });

  it("converts a single paragraph with text", () => {
    const doc: AdfNode = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "hello world" }],
        },
      ],
    };
    expect(adfToPlainText(doc)).toBe("hello world");
  });

  it("separates paragraphs with blank lines", () => {
    const doc: AdfNode = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "first" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "second" }],
        },
      ],
    };
    expect(adfToPlainText(doc)).toBe("first\n\nsecond");
  });

  it("renders bullet lists with '- ' prefix", () => {
    const doc: AdfNode = {
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "one" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "two" }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(adfToPlainText(doc)).toBe("- one\n- two");
  });

  it("renders ordered lists with numeric prefix", () => {
    const doc: AdfNode = {
      type: "doc",
      content: [
        {
          type: "orderedList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "alpha" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "beta" }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(adfToPlainText(doc)).toBe("1. alpha\n2. beta");
  });

  it("inlines mention text", () => {
    const doc: AdfNode = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "cc " },
            { type: "mention", attrs: { id: "123", text: "@alice" } },
          ],
        },
      ],
    };
    expect(adfToPlainText(doc)).toBe("cc @alice");
  });

  it("handles hardBreak as newline inside paragraph", () => {
    const doc: AdfNode = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "line1" },
            { type: "hardBreak" },
            { type: "text", text: "line2" },
          ],
        },
      ],
    };
    expect(adfToPlainText(doc)).toBe("line1\nline2");
  });

  it("walks unknown node types via children", () => {
    const doc: AdfNode = {
      type: "doc",
      content: [
        {
          type: "weirdCustomType",
          content: [{ type: "text", text: "still visible" }],
        },
      ],
    };
    expect(adfToPlainText(doc)).toBe("still visible");
  });
});
