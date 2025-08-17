import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import htmlEditButton from "quill-html-edit-button";
import URL from "../../util/url";

const Quill = ReactQuill.Quill;
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
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: function () {
          // dùng function() để `this` tham chiếu đúng
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
                alert("Upload thất bại!");
              }
            } catch (err) {
              console.error("Upload error:", err);
              alert("Có lỗi khi upload ảnh.");
            }
          };
        },
      },
    },
  };

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
