/**
 * Remark plugin that turns a `[TOC]` marker into a table of contents.
 *
 * Unlike `remark-toc` (which injects a list under a heading named
 * "Table of Contents"), this plugin supports the Typora / GitLab style
 * `[TOC]` placeholder: any top-level paragraph whose only content is
 * `[TOC]` (case-insensitive) is replaced in place with a generated
 * table-of-contents list.
 *
 * Anchors are produced by `mdast-util-toc`, the same utility `remark-toc`
 * relies on, so links match the heading slugs generated elsewhere.
 *
 * @param {Object} [options]
 * @param {number} [options.maxDepth=6] - Deepest heading level to include.
 * @param {number} [options.minDepth=1] - Shallowest heading level to include.
 */
import { toc } from "mdast-util-toc";

const TOC_MARKER = /^\[toc\]$/i;

const isTocMarker = node =>
  node.type === "paragraph" &&
  node.children.length === 1 &&
  node.children[0].type === "text" &&
  TOC_MARKER.test(node.children[0].value.trim());

export default function remarkTocMarker({ maxDepth = 6, minDepth = 1 } = {}) {
  return tree => {
    const markerIndex = tree.children.findIndex(isTocMarker);
    if (markerIndex === -1) return;

    // Build the TOC only from content that follows the marker, so the
    // heading that introduces it (e.g. "本期目录") and anything above it
    // are left out of the list.
    const after = {
      type: "root",
      children: tree.children.slice(markerIndex + 1),
    };
    const result = toc(after, { maxDepth, minDepth });

    tree.children.splice(
      markerIndex,
      1,
      result.map ?? { type: "paragraph", children: [] }
    );
  };
}
