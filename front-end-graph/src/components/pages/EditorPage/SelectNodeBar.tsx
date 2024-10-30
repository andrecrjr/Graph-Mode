"use client";
import React, { useEffect } from "react";
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
    state: { nodes },
  } = useGraphContextData();
  const { editorDispatch } = useEditorContext();

  useEffect(() => {
    if (nodes.nodes) {
      editorDispatch({
        type: "UPDATE_TEMP_EDITOR_NODE",
        payload: {
          tempNodeChoiceEditorId: nodes.nodes[0].id,
        },
      });
    }
    console.log("nodes", nodes.nodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!!nodes.nodes && nodes.nodes.length > 0)
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
              nodes.nodes.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  return null;
};

export default SelectEditorBar;
