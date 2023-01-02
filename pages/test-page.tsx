import { NextPage } from "next";
import {
  mergeAttributes,
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
} from "@tiptap/react";
import { RichTextEditor } from "@mantine/tiptap";
import { Text } from "@tiptap/extension-text";
import { Node, NodeViewProps } from "@tiptap/core";
import { ActionIcon, createStyles, Group } from "@mantine/core";
import { VerticalDropCursor } from "~/tiptapExtensions/verticalDropCursor";
import { IconTrashX } from "@tabler/icons";

const useTemplateStyles = createStyles(() => ({
  templateRowContent: {
    "& > div": {
      display: "flex",
      flexDirection: "row",
      padding: "0.5em, 0",
    },
  },
  templateCell: {
    margin: "0 0.5em",
  },
}));

const TemplateDocument = Node.create({
  name: "templateDoc",
  topNode: true,
  content: "templateRow+",
});

const TemplateRow = Node.create({
  name: "templateRow",
  content: "templateCell+",
  verticalDropCursor: true,
  parseHTML() {
    return [{ tag: "template-row" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["template-row", mergeAttributes(HTMLAttributes), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(TemplateRowComponent);
  },
});

function TemplateRowComponent() {
  const { classes } = useTemplateStyles();
  return (
    <NodeViewWrapper>
      <div contentEditable="false">ROW</div>
      <NodeViewContent as={"span"} className={classes.templateRowContent} />
    </NodeViewWrapper>
  );
}

const TemplateCell = Node.create({
  name: "templateCell",
  content: "inline*",
  defining: true,
  // isolating: true,
  draggable: true,
  parseHTML() {
    return [{ tag: "template-cell" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["template-cell", mergeAttributes(HTMLAttributes), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(TemplateCellComponent);
  },
});

function TemplateCellComponent(props: NodeViewProps) {
  const { classes } = useTemplateStyles();
  return (
    <NodeViewWrapper className={classes.templateCell}>
      <Group>
        <div data-drag-handle="" draggable="true" contentEditable="false">
          CELL
        </div>
        <ActionIcon
          onClick={() => props.deleteNode()}
          color="red"
          variant="filled"
          size="sm"
        >
          <IconTrashX />
        </ActionIcon>
      </Group>
      <NodeViewContent />
    </NodeViewWrapper>
  );
}

const TestPage: NextPage = () => {
  const editor = useEditor({
    extensions: [
      TemplateDocument,
      TemplateRow,
      TemplateCell,
      Text,
      VerticalDropCursor,
    ],
  });

  console.log(editor?.commands);

  return (
    <>
      <RichTextEditor editor={editor}>
        <RichTextEditor.Content />
      </RichTextEditor>
    </>
  );
};

// noinspection JSUnusedGlobalSymbols
export default TestPage;
