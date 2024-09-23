import { createReactBlockSpec } from "@blocknote/react";

import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { Code } from "lucide-react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import "@uiw/react-textarea-code-editor/dist.css";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRef, useState } from "react";

export const codeBlock = createReactBlockSpec(
  {
    type: "codeBlock",
    content: "inline", // Allow rich text within the block
    propSchema: {
      language: {
        default: "js",
      },
      code: {
        default: "", // Default empty code content
      },
    },
  },
  {
    render: async (props) => {
      let item = "js";

      return (
        <section className="flex flex-col w-full">
          <Select
            onValueChange={(e) => {
              item = e;
              console.log(props.editor);
              console.log(props);
              props.editor.updateBlock(props.block.id, {
                props: {
                  code: props.block.props.code,
                  language: e,
                },
              });
            }}
            defaultValue={props.block.props.language}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Languages</SelectLabel>
                <SelectItem value="js">Javascript</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="php">PHP</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <CodeEditor
            value={props.block.props.code}
            language={item}
            padding={15}
            className={"w-full"}
            minHeight={30}
            style={{
              fontSize: "14px",
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
              color: "white",
            }}
          />
        </section>
      );
    },
  },
);

// Custom Slash Menu item to insert a block after the current one.
// Custom Slash Menu item to insert a CodeBlock after the current one
export const insertCodeBlock = (editor: BlockNoteEditor) => ({
  title: "Insert Code Block",
  onItemClick: () => {
    // Block that the text cursor is currently in.
    const currentBlock = editor.getTextCursorPosition().block;

    // New CodeBlock we want to insert.
    const codeBlock = {
      type: "codeBlock", // Use the type registered in the schema
      props: {
        language: "javascript", // Default to JavaScript (you can change this)
        code: "// Write your code here\n",
      },
    };

    //@ts-ignore
    editor.insertBlocks([codeBlock], currentBlock, "after");
  },
  aliases: ["code", "insertcode"],
  group: "Code Blocks",
  icon: <Code size={18} />, // Use a suitable icon for the code block
  subtext: "Insert a new code block below.",
});
