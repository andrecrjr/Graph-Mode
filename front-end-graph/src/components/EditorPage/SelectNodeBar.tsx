"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useGraphContextData } from "../Context/GraphContext";
import { useEditorContext } from "../Context/EditorContext";

const SelectEditorBar: React.FC = () => {
  const {
    state: { nodes, pageId },
  } = useGraphContextData();
  const { editorDispatch } = useEditorContext();
  if (nodes.nodes)
    return (
      <Select
        onValueChange={(id) => {
          console.log(id);
          editorDispatch({
            type: "UPDATE_TEMP_EDITOR_NODE",
            payload: {
              tempNodeChoiceEditorId: id,
            },
          });
        }}
        //   defaultValue={}
      >
        <SelectTrigger className="w-full mb-3">
          <SelectValue
            placeholder={
              (nodes.nodes && nodes.nodes[0].label) || "Choose Page Node father"
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Choose Page Node father</SelectLabel>
            {nodes.nodes &&
              nodes.nodes.map((item, index) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
};

export default SelectEditorBar;
