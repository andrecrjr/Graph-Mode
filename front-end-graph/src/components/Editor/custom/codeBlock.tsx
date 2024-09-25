"use client";
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
import { Textarea } from "@/components/ui/textarea";

export const codeBlock = createReactBlockSpec(
  {
    type: "codeBlock",
    content: "inline", // Allow rich text within the block
    propSchema: {
      language: {
        default: "javascript",
      },
      code: {
        default: "", // Default empty code content
      },
    },
  },
  {
    render: (props) => {
      const languages = [
        "abap",
        "arduino",
        "bash",
        "basic",
        "c",
        "clojure",
        "coffeescript",
        "c++",
        "c#",
        "css",
        "dart",
        "diff",
        "docker",
        "elixir",
        "elm",
        "erlang",
        "flow",
        "fortran",
        "f#",
        "gherkin",
        "glsl",
        "go",
        "graphql",
        "groovy",
        "haskell",
        "html",
        "java",
        "javascript",
        "json",
        "julia",
        "kotlin",
        "latex",
        "less",
        "lisp",
        "livescript",
        "lua",
        "makefile",
        "markdown",
        "markup",
        "matlab",
        "mermaid",
        "nix",
        "objective-c",
        "ocaml",
        "pascal",
        "perl",
        "php",
        "plain text",
        "powershell",
        "prolog",
        "protobuf",
        "python",
        "r",
        "reason",
        "ruby",
        "rust",
        "sass",
        "scala",
        "scheme",
        "scss",
        "shell",
        "sql",
        "swift",
        "typescript",
        "vb.net",
        "verilog",
        "vhdl",
        "visual basic",
        "webassembly",
        "xml",
        "yaml",
        "java/c/c++/c#",
      ];
      return (
        <section className="flex flex-col w-full">
          <Select
            onValueChange={(e) => {
              props.editor.updateBlock(props.block.id, {
                props: {
                  language: e,
                },
              });
            }}
            defaultValue={props.block.props.language}
          >
            <SelectTrigger className="w-full mb-3">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Languages</SelectLabel>
                {languages.map((item, index) => (
                  <SelectItem key={index} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Textarea
            style={{ fontFamily: "monospace" }}
            className="h-[200px] border-r-2 bg-gray-100"
            onChange={(e) => {
              props.editor.updateBlock(props.block.id, {
                props: {
                  code: e.target.value,
                },
              });
            }}
            defaultValue={props.block.props.code}
            placeholder="// Write your code here"
          ></Textarea>
        </section>
      );
    },
  },
);

export const insertCodeBlock = (editor: BlockNoteEditor) => ({
  title: "Insert Code Block",

  onItemClick: () => {
    const currentBlock = editor.getTextCursorPosition().block;
    const codeBlock = {
      type: "codeBlock", // Use the type registered in the schema
      props: {
        language: "javascript", // Default to JavaScript (you can change this)
        code: "",
      },
    };

    //@ts-ignore
    editor.insertBlocks([codeBlock], currentBlock, "after");
  },
  aliases: ["code", "insertcode", "```"],
  group: "Code Blocks",
  icon: <Code size={18} />, // Use a suitable icon for the code block
  subtext: "Insert a new code block below.",
});
