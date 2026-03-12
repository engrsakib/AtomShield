


"use client";

import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

type Props = {
  value?: string;
  onChange?: (html: string) => void;
  readOnly?: boolean;
};

export default function QuillEditor({
  value = "",
  onChange,
  readOnly = false,
}: Props) {
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const lastHtmlRef = useRef<string>("");

  useEffect(() => {
    if (!editorRef.current || !toolbarRef.current || quillRef.current) return;

    // ✅ Font whitelist (so dropdown shows Roboto/Poppins properly)
    const Font = Quill.import("formats/font") as any;
    Font.whitelist = ["roboto", "poppins", "arial", "serif", "sans-serif"];
    Quill.register(Font, true);

    // ✅ Size whitelist
    const Size = Quill.import("formats/size") as any;
    Size.whitelist = ["small", "normal", "large", "huge"];
    Quill.register(Size, true);


    const BlockEmbed = Quill.import("blots/block/embed") as any;

    class ShapeBlot extends BlockEmbed {
      static blotName = "shape";
      static tagName = "div";
      static className = "ql-shape-embed";
      static scope = "block";

      static create(value: { type: string }) {
        const node = super.create() as HTMLElement;
        const type = value?.type || "rect";
        node.setAttribute("data-shape", type);
        node.innerHTML = getShapeSvg(type);
        return node;
      }

      static value(node: HTMLElement) {
        return { type: node.getAttribute("data-shape") || "rect" };
      }
    }

    function getShapeSvg(type: string) {
      if (type === "circle") {
        return `
          <svg viewBox="0 0 120 60" width="240" height="90" role="img" aria-label="circle">
            <circle cx="60" cy="30" r="22" fill="none" stroke="currentColor" stroke-width="3"></circle>
          </svg>
        `;
      }
      if (type === "arrow") {
        return `
          <svg viewBox="0 0 180 60" width="280" height="90" role="img" aria-label="arrow">
            <path d="M10 30 H140" fill="none" stroke="currentColor" stroke-width="3" />
            <path d="M140 15 L170 30 L140 45" fill="none" stroke="currentColor" stroke-width="3" />
          </svg>
        `;
      }
      // rect default
      return `
        <svg viewBox="0 0 160 60" width="280" height="90" role="img" aria-label="rectangle">
          <rect x="20" y="12" width="120" height="36" rx="6" ry="6"
            fill="none" stroke="currentColor" stroke-width="3"></rect>
        </svg>
      `;
    }

    Quill.register(ShapeBlot, true);

    const quill = new Quill(editorRef.current, {
      theme: "snow",
      readOnly,
      modules: {
        toolbar: {
          container: toolbarRef.current,
          handlers: {
            insertTable: () => {
              const rows = Math.max(1, Number(prompt("Rows?", "3") || 3));
              const cols = Math.max(1, Number(prompt("Columns?", "3") || 3));

              const tableHtml = buildTableHtml(rows, cols);
              const range = quill.getSelection(true);
              const index = range ? range.index : quill.getLength();
              quill.clipboard.dangerouslyPasteHTML(index, tableHtml, "user");
              quill.setSelection(index + 1, 0, "silent");
            },

            insertShape: (shapeType: string) => {
              const range = quill.getSelection(true);
              const index = range ? range.index : quill.getLength();
              quill.insertEmbed(index, "shape", { type: shapeType }, "user");
              quill.insertText(index + 1, "\n", "user");
              quill.setSelection(index + 2, 0, "silent");
            },
          },
        },
      },
    });

    function buildTableHtml(r: number, c: number) {
      const td = `<td style="border:1px solid #111; padding:8px; min-width:80px;">&nbsp;</td>`;
      const tr = `<tr>${Array.from({ length: c }).map(() => td).join("")}</tr>`;
      return `
        <table style="width:100%; border-collapse:collapse; margin:10px 0;">
          <tbody>
            ${Array.from({ length: r }).map(() => tr).join("")}
          </tbody>
        </table>
      `;
    }

    // ✅ initial value
    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value);
      lastHtmlRef.current = value;
    } else {
      lastHtmlRef.current = quill.root.innerHTML;
    }

    // ✅ onChange HTML
    quill.on("text-change", () => {
      const html = quill.root.innerHTML;
      lastHtmlRef.current = html;
      onChange?.(html);
    });

    quillRef.current = quill;
  }, []);

  // keep sync if parent updates value
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;

    if ((value ?? "") !== lastHtmlRef.current) {
      const sel = quill.getSelection();
      quill.clipboard.dangerouslyPasteHTML(value || "");
      lastHtmlRef.current = value || "";
      if (sel) quill.setSelection(sel);
    }
  }, [value]);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    quill.enable(!readOnly);
  }, [readOnly]);

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      {/* ✅ FULL Toolbar: existing + missing */}
      <div ref={toolbarRef}>
        <span className="ql-formats">
          <select className="ql-font" defaultValue="roboto">
            <option value="roboto">Roboto</option>
            <option value="poppins">Poppins</option>
            <option value="arial">Arial</option>
            <option value="serif">Serif</option>
            <option value="sans-serif">Sans</option>
          </select>

          <select className="ql-size" defaultValue="normal">
            <option value="small">Small</option>
            <option value="normal">Normal</option>
            <option value="large">Large</option>
            <option value="huge">Huge</option>
          </select>
        </span>

        <span className="ql-formats">
          <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-underline" />
          <button className="ql-strike" />
        </span>

        <span className="ql-formats">
          <button className="ql-blockquote" />
          <button className="ql-code-block" />
        </span>

        <span className="ql-formats">
          <select className="ql-header" defaultValue="">
            <option value="1">H1</option>
            <option value="2">H2</option>
            <option value="3">H3</option>
            <option value="4">H4</option>
            <option value="">Normal</option>
          </select>
        </span>

        <span className="ql-formats">
          <select className="ql-color" />
          <select className="ql-background" />
        </span>

        <span className="ql-formats">
          <button className="ql-script" value="sub" />
          <button className="ql-script" value="super" />
        </span>

        <span className="ql-formats">
          <button className="ql-list" value="ordered" />
          <button className="ql-list" value="bullet" />
          <button className="ql-indent" value="-1" />
          <button className="ql-indent" value="+1" />
        </span>

        <span className="ql-formats">
          <button className="ql-direction" value="rtl" />
          <select className="ql-align" />
        </span>

        <span className="ql-formats">
          <button className="ql-link" />
          <button className="ql-image" />
          <button className="ql-video" />

    
        

        </span>

        {/* ✅ Missing tools */}
        <span className="ql-formats">
          <div>

                      <button className="ql-insertTable" type="button">
            Table
          </button>

          {/* <select className="ql-insertShape" defaultValue="">
            <option value="" disabled>
              Shapes
            </option>
            <option value="rect">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="arrow">Arrow</option>
          </select> */}


          </div>
        </span>

        <span className="ql-formats">
          <button className="ql-clean" />
        </span>
      </div>

      <div ref={editorRef} className="min-h-[220px]" />
    </div>
  );
}