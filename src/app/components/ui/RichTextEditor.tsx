"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link"; // Import Link extension
import { useCallback } from "react"; // Import useCallback for link setting

// Define the props for the editor
interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  className?: string;
}

// Define the type for the MenuBar props
interface MenuBarProps {
  editor: Editor | null;
}

// Basic toolbar component
const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) {
    return null;
  }

  // Callback to handle setting links
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 border border-border rounded-t-md p-2 bg-surface-secondary">
      {/* Basic Formatting Buttons */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={
          editor.isActive("bold")
            ? "bg-primary text-surface p-1 rounded font-bold"
            : "p-1 font-bold"
        }
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={
          editor.isActive("italic")
            ? "bg-primary text-surface p-1 rounded italic"
            : "p-1 italic"
        }
      >
        I
      </button>

      {/* List Buttons */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          editor.isActive("bulletList")
            ? "bg-primary text-surface p-1 rounded"
            : "p-1"
        }
      >
        List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={
          editor.isActive("orderedList")
            ? "bg-primary text-surface p-1 rounded"
            : "p-1"
        }
      >
        Num List
      </button>

      {/* Link Button */}
      <button
        type="button"
        onClick={setLink}
        className={
          editor.isActive("link")
            ? "bg-primary text-surface p-1 rounded"
            : "p-1"
        }
      >
        Link
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive("link")}
        className="p-1 disabled:opacity-50"
      >
        Unlink
      </button>
    </div>
  );
};

// Main Editor Component
export default function RichTextEditor({
  content,
  onChange,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit, // Includes common extensions (bold, italic, lists, paragraphs, etc.)
      Link.configure({
        // Configure the Link extension
        openOnClick: false, // Don't open links when clicking in the editor
        autolink: true, // Automatically detect links as you type
      }),
    ],
    content: content, // Initial content
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); // Call the onChange prop with the updated HTML
    },
    // Apply Tailwind Typography and basic styling to the editor itself
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none p-4 border-x border-b border-border rounded-b-md min-h-[250px] bg-surface text-text-primary",
      },
    },
    immediatelyRender: false,
  });

  return (
    <div className={className}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
