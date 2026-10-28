"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";

// Dynamically import JoditEditor to avoid SSR issues
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[200px] text-gray-900 border border-gray-300 rounded-lg p-4 flex items-center justify-center">
      <p className="text-gray-500">Loading editor...</p>
    </div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChangeAction: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChangeAction,
  label,
  placeholder = "Enter description...",
}) => {

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: placeholder,
      height: 400,
      toolbar: true,
      spellcheck: true,
      language: "en",
      toolbarButtonSize: "middle" as "small" | "tiny" | "xsmall" | "middle" | "large",
      // Editable area class for list styling when iframe is false
      editorClassName: "jodit-editor-content-lists",
      // Use iframe so editor content is isolated and list styles (bullets/numbers) always show
      iframe: true,
      iframeStyle:
        "html, body { margin: 0; padding: 8px; box-sizing: border-box; } " +
        "ul, ol { margin: 0.75rem 0; padding-left: 1.75rem; list-style-position: outside; } " +
        "ul { list-style-type: disc; } ul ul { list-style-type: circle; } ul ul ul { list-style-type: square; } " +
        "ol { list-style-type: decimal; } ol ol { list-style-type: lower-alpha; } ol ol ol { list-style-type: lower-roman; } " +
        "li { display: list-item; margin-bottom: 0.35rem; line-height: 1.6; }",
      // Explicit toolbar: ul/ol (lists with numbering options), indent/outdent for nesting
      buttons: [
        "source",
        "|",
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "outdent",
        "indent",
        "|",
        "font",
        "fontsize",
        "brush",
        "paragraph",
        "|",
        "image",
        "link",
        "|",
        "align",
        "undo",
        "redo",
        "|",
        "hr",
        "eraser",
        "copyformat",
        "|",
        "fullsize",
      ],
      removeButtons: ["file", "video"],
    } as any),
    [placeholder]
  );

  return (
    <div className="text-gray-900 w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <JoditEditor
          value={value}
          config={config}
          onBlur={(newContent) => onChangeAction(newContent)}
          onChange={(newContent) => {
            // Update on change for real-time updates
            onChangeAction(newContent);
          }}
        />
      </div>
    </div>
  );
};
