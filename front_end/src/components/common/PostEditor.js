import React, { useEffect } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./quill-iframe-blot";
import URL from "../../util/url";

const Parchment = Quill.import("parchment");
const lineHeightConfig = {
  scope: Parchment.Scope.BLOCK,
  whitelist: ["1", "1.5", "2"],
};
const LineHeightStyle = new Parchment.StyleAttributor(
  "height",
  "line-height",
  lineHeightConfig
);
Quill.register(LineHeightStyle, true);

const icons = Quill.import("ui/icons");
icons["undo"] = '<i class="ql-undo">↶</i>';
icons["redo"] = '<i class="ql-redo">↷</i>';
icons["embed"] = '<i class="ql-embed">&lt;/&gt;</i>';

// Undo button
function undoChange() {
  this.quill.history.undo();
}
// Redo button
function redoChange() {
  this.quill.history.redo();
}

export default function PostEditor({
  value = "",
  onChange,
  placeholder = "Type your write...",
}) {
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        [{ height: ["1", "1.5", "2"] }],
        ["link", "image", "embed"],
        ["undo", "redo"],
        ["clean"],
      ],
      handlers: {
        undo: undoChange,
        redo: redoChange,
        image: function () {
          const input = document.createElement("input");
          input.setAttribute("type", "file");
          input.setAttribute("accept", "image/*");
          input.click();

          input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "/images/posts");

            try {
              const res = await fetch(URL.UPLOAD_IMAGE, {
                method: "POST",
                body: formData,
              });
              const data = await res.json();

              if (data.success && data.url) {
                const range = this.quill.getSelection();
                this.quill.insertEmbed(range.index, "image", data.url);
              } else {
                alert("Upload Failed!");
              }
            } catch (err) {
              console.error("Upload error:", err);
              alert("Error when uploading image.");
            }
          };
        },
        embed: function () {
          const url = prompt(
            "Enter iFrame Embed Code (eg Google Maps, YouTube ...):"
          );
          if (url) {
            const range = this.quill.getSelection(true);
            const srcMatch = url.match(/src="([^"]+)"/);
            const src = srcMatch ? srcMatch[1] : url;
            this.quill.insertEmbed(range.index, "iframe", src, "user");
          }
        },
      },
    },
    history: {
      delay: 1000,
      maxStack: 100,
      userOnly: true,
    },
  };
  useEffect(() => {
    const toolbar = document.querySelector(".ql-toolbar");
    if (toolbar) {
      const undoBtn = toolbar.querySelector("button.ql-undo");
      const redoBtn = toolbar.querySelector("button.ql-redo");
      const embedBtn = toolbar.querySelector("button.ql-embed");

      if (undoBtn) undoBtn.setAttribute("title", "Undo");
      if (redoBtn) redoBtn.setAttribute("title", "Redo");
      if (embedBtn)
        embedBtn.setAttribute(
          "title",
          "Embed link/iframe (Google Maps, Youtube...)"
        );
    }
  }, []);
  const formats = [
    "header",
    "size",
    "bold",
    "italic",
    "color",
    "background",
    "underline",
    "strike",
    "list",
    "align",
    "height",
    "blockquote",
    "code-block",
    "link",
    "image",
    "iframe",
  ];

  return (
    <div className="editor-container">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
      />
    </div>
  );
}
