import { Quill } from "react-quill-new";

const BlockEmbed = Quill.import("blots/block/embed");

class IframeBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    node.setAttribute("src", value);
    node.setAttribute("frameborder", "0");
    node.setAttribute("allowfullscreen", true);
    node.setAttribute("width", "100%");
    node.setAttribute("height", "400");
    return node;
  }

  static value(node) {
    return node.getAttribute("src");
  }
}

IframeBlot.blotName = "iframe";
IframeBlot.tagName = "iframe";

Quill.register(IframeBlot);

export default IframeBlot;
