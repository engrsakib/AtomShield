


// "use client";

// import React, { useMemo } from "react";
// import dynamic from "next/dynamic";
// import "react-quill-new/dist/quill.snow.css";

// const ReactQuill = dynamic(() => import("react-quill-new"), {
//   ssr: false,
//   loading: () => (
//     <div className="border rounded p-3 text-sm opacity-70">Loading editor...</div>
//   ),
// }) as any;

// type Props = {
//   value: string;
//   onChange: (html: string) => void;
//   readOnly?: boolean;
//   placeholder?: string;
// };

// export default function ReactQuillEditor({
//   value,
//   onChange,
//   readOnly = false,
//   placeholder = "Write...",
// }: Props) {
//   const modules = useMemo(
//     () => ({
//       toolbar: [
//         // Row 1: Font & Size (Sans Serif, Normal - screenshot এ আছে)
//         [{ font: [] }, { size: [] }],

//         // Row 2: Text direction & alignment
//         [{ direction: "rtl" }, { align: [] }],

//         // Row 3: Basic formatting
//         ["bold", "italic", "underline", "strike"],

//         // Row 4: Color
//         [{ color: [] }, { background: [] }],

//         // Row 5: Superscript/Subscript (x² x₂ - screenshot এ আছে)
//         [{ script: "super" }, { script: "sub" }],

//         // Row 6: Blockquote & Code ('' </> - screenshot এ আছে)
//         ["blockquote", "code-block"],

//         // Row 7: List & Indent
//         [{ list: "ordered" }, { list: "bullet" }],
//         [{ indent: "-1" }, { indent: "+1" }],

//         // Row 8: Headers
//         [{ header: [1, 2, 3, 4, 5, 6, false] }],

//         // Row 9: Media & Links (screenshot এ আছে)
//         ["link", "image", "video", "formula"],

//         // Row 10: Clean
//         ["clean"],
//       ],
//       clipboard: { matchVisual: false },
//     }),
//     []
//   );

//   const formats = useMemo(
//     () => [
//       "font",
//       "size",
//       "bold",
//       "italic",
//       "underline",
//       "strike",
//       "color",
//       "background",
//       "script",       // superscript & subscript
//       "blockquote",
//       "code-block",
//       "list",
//       "bullet",
//       "indent",
//       "direction",
//       "align",
//       "header",
//       "link",
//       "image",
//       "video",
//       "formula",      // formula এর জন্য katex install করতে হবে
//     ],
//     []
//   );

//   return (
//     <ReactQuill
//       theme="snow"
//       value={value}
//       onChange={onChange}
//       readOnly={readOnly}
//       placeholder={placeholder}
//       modules={modules}
//       formats={formats}
//     />
//   );
// }












"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="border rounded-md p-3 text-sm text-gray-500">
      Loading editor...
    </div>
  ),
}) as any;

type ReusableQuillEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  height?: number;
};

export default function ReusableQuillEditor({
  value,
  onChange,
  placeholder = "Write something...",
  readOnly = false,
  height = 250,
}: ReusableQuillEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        [{ font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["link", "image", "video"],
        ["blockquote", "code-block"],
        ["clean"],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = useMemo(
    () => [
      "header",
      "font",
      "size",
      "bold",
      "italic",
      "underline",
      "strike",
      "color",
      "background",
      "list",
      "bullet",
      "indent",
      "align",
      "link",
      "image",
      "video",
      "blockquote",
      "code-block",
    ],
    []
  );

  return (
    <div className="rounded-xl border overflow-hidden bg-white">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
      />

      <style jsx global>{`
        .ql-container {
          min-height: ${height}px;
        }
      `}</style>
    </div>
  );
}







