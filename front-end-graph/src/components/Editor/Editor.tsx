import "@blocknote/core/fonts/inter.css";
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  FileCaptionButton,
  FormattingToolbar,
  FormattingToolbarController,
  SuggestionMenuController,
  TextAlignButton,
  useCreateBlockNote,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useEditorContext } from "../Context/EditorContext";
import { filterSuggestionItems } from "@blocknote/core";
import { getMentionMenuItems } from "./custom/inlinePageMention";
import { useGraphContextData } from "../Context/GraphContext";
import { schema } from "./custom/inlinePageMention";

export default function Editor() {
  const { editorDispatch } = useEditorContext();
  const {
    state: {
      nodes: { nodes },
    },
  } = useGraphContextData();
  const editor = useCreateBlockNote({
    schema,
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
        formattingToolbar={false}
      >
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <BlockTypeSelect key={"blockTypeSelect"} />

              <FileCaptionButton key={"fileCaptionButton"} />

              <BasicTextStyleButton
                basicTextStyle={"bold"}
                key={"boldStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"italic"}
                key={"italicStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"underline"}
                key={"underlineStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"strike"}
                key={"strikeStyleButton"}
              />
              {/* Extra button to toggle code styles */}
              <BasicTextStyleButton
                key={"codeStyleButton"}
                basicTextStyle={"code"}
              />
              <TextAlignButton
                textAlignment={"left"}
                key={"textAlignLeftButton"}
              />
              <TextAlignButton
                textAlignment={"center"}
                key={"textAlignCenterButton"}
              />
              <TextAlignButton
                textAlignment={"right"}
                key={"textAlignRightButton"}
              />
              <ColorStyleButton key={"colorStyleButton"} />

              <CreateLinkButton key={"createLinkButton"} />
            </FormattingToolbar>
          )}
        />
        <SuggestionMenuController
          triggerCharacter={"["}
          getItems={async (query) =>
            // Gets the mentions menu items
            //@ts-ignore
            filterSuggestionItems(getMentionMenuItems(editor, nodes), query)
          }
        />
      </BlockNoteView>
    </>
  );
}
