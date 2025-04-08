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
import { getCustomSlashMenuItems, schema } from "./custom/";
import { useDarkMode } from "../Context/DarkModeContext";
export default function Editor() {
  const {
    state: {
      nodes: { nodes },
    },
  } = useGraphContextData();
  const { editorDispatch, state } = useEditorContext();
  const { isDarkMode } = useDarkMode();

  const editor = useCreateBlockNote({
    schema,
    //@ts-ignore
    initialContent: [...state.initialContentDocument],
  });

  return (
    <>
      <BlockNoteView
        editor={editor}
        onChange={() => {
          editorDispatch({
            type: "SET_EDITOR_UPDATE",
            //@ts-ignore
            payload: { editorDocument: editor },
          });
        }}
        formattingToolbar={false}
        theme={isDarkMode ? "dark" : "light"}
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
            //@ts-ignore
            filterSuggestionItems(getMentionMenuItems(editor, nodes), query)
          }
        />
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query) =>
            //@ts-ignore
            filterSuggestionItems(getCustomSlashMenuItems(editor), query)
          }
        />
      </BlockNoteView>
    </>
  );
}
