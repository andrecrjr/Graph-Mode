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
} from "../../ui/select";
import { useGraphContextData } from "../../Context/GraphContext";
import { useEditorContext } from "../../Context/EditorContext";
import { isMock } from "../../utils";

const SelectEditorBar: React.FC = () => {
  const {
    state: { nodes, pageId },
  } = useGraphContextData();
  const { editorDispatch } = useEditorContext();
  if (!nodes) {
    return <p>Problem to load it</p>;
  }
  if (!!nodes.nodes && nodes.nodes.length > 0 && !isMock(pageId))
    return (
      <Select
        onValueChange={(id) => {
          editorDispatch({
            type: "UPDATE_TEMP_EDITOR_NODE",
            payload: {
              tempNodeChoiceEditorId: id,
            },
          });
        }}
      >
        <SelectTrigger className="w-full mb-3">
          {nodes.nodes && (
            <SelectValue
              placeholder={
                (nodes.nodes && nodes.nodes[0].label) ||
                "Choose Page Node father"
              }
            />
          )}
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
