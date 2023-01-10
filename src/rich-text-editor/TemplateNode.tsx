import { Node, NodeViewProps } from "@tiptap/core";
import {
  mergeAttributes,
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import { css } from "@emotion/react";
import { ActionIcon, Group, Text } from "@mantine/core";
import { IconTrashX } from "@tabler/icons";

export const TemplateNode = Node.create({
  name: "templateNode",
  group: "inline",
  atom: true,
  inline: true,
  selectable: false,
  draggable: true,
  parseHTML() {
    return [{ tag: "template-node" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["template-node", mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(TemplateNodeComponent);
  },
});

export function TemplateNodeComponent(props: NodeViewProps) {
  return (
    <NodeViewWrapper
      className="CLASS-NAME-HERE"
      css={css`
        border: white dashed 2px;
        display: inline-block;
        border-radius: 0.5em;
        overflow: clip;
      `}
    >
      <Group contentEditable="false">
        <span contentEditable="true">left</span>
        <Text
          data-drag-handle=""
          draggable="true"
          sx={(theme) => ({
            backgroundColor: theme.colors.blue[8],
            color: theme.white,
            padding: "0 0.25em",
          })}
        >
          <span
            css={css`
              vertical-align: text-bottom;
            `}
          >
            {"{{"}
          </span>
        </Text>
        <span contentEditable="true">center</span>
        <ActionIcon
          onClick={() => props.deleteNode()}
          color="red"
          variant="filled"
          size="sm"
        >
          <IconTrashX />
        </ActionIcon>
        <Text
          data-drag-handle=""
          draggable="true"
          sx={(theme) => ({
            backgroundColor: theme.colors.blue[8],
            color: theme.white,
            padding: "0 0.25em",
          })}
        >
          <span
            css={css`
              vertical-align: text-bottom;
            `}
          >
            {"}}"}
          </span>
        </Text>
        <span contentEditable="true">right</span>
      </Group>
    </NodeViewWrapper>
  );
}
