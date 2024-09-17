import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useEditorContext } from "../Context/EditorContext";

export default function Editor() {
  const { editorDispatch } = useEditorContext();
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
          editorDispatch({
            type: "SET_EDITOR_UPDATE",
            payload: { editorDocument: editor },
          });
        }}
      />
    </>
  );
}
