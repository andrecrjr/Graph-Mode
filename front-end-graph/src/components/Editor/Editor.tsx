import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

// Our <Editor> component we can reuse later
export default function Editor() {
  // Creates a new editor instance.
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: "heading",
        content: "Your Page Title",
      },
      {
        type: "paragraph",
        content: [],
      },
    ],
  });
  return (
    <>
      <BlockNoteView
        editor={editor}
        onChange={() => {
          console.log(editor.document);
        }}
      />
    </>
  );
}
