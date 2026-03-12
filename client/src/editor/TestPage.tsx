"use client";
import { useState } from "react";
import RichTextEditor from "./ReactQuilEditor";

export default function TestPage() {
  const [value, setValue] = useState("");

  return (
    <div>
      <RichTextEditor value={value} onChange={setValue} />
    </div>
  );
}