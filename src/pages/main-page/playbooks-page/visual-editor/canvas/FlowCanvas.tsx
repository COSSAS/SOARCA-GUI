import "@xyflow/react/dist/style.css";

import { IconMap, IconMapOff } from "@tabler/icons-react";
import {
  Background,
  ControlButton,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useConnection,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import { useMemo, useState } from "react";
import { useTheme } from "styled-components";

import { Icon } from "@/components";
import type { Playbook } from "@/types";

import { setPositions, type Position } from "../model/coordinates";
import type { CanvasEditor } from "../model/editor";
import { connect, disconnect, removeSteps } from "../model/edits";
import { parseHandleId, playbookToGraph } from "../model/graph";
import { getPositions, type Size } from "../model/layout";
import { canConnect, type Link } from "../model/rules";
import type { CacaoSpec } from "../model/specs";
import { getConnectionColor } from "./colors";
import { FIT_VIEW_OPTIONS, STEP_TYPE_MIME } from "./constants";
import { ContextMenu } from "./ContextMenu";
import { CanvasWrapper } from "./FlowCanvas.styles";
import { nodeTypes } from "./nodeTypes";
import { StepDetailsCard } from "./StepDetailsCard";
import type { StepFlowNode } from "./StepNode";
import { useCanvasMenu } from "./useCanvasMenu";

const defaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed },
};
const DELETE_KEYS = ["Backspace", "Delete"];
// Shift drags a selection box, so adding to the selection uses Ctrl (Cmd on macOS).
const MULTI_SELECTION_KEYS = ["Control", "Meta"];
// Node positions are midpoints, as in the CACAO Layout extension.
const NODE_ORIGIN: [number, number] = [0.5, 0.5];
const MIN_ZOOM = 0.2;

type FlowCanvasProps = {
  playbook: Playbook;
  spec: CacaoSpec;
  /** Leave out for a read-only diagram. */
  editor?: CanvasEditor;
};

const toLink = (connection: Connection | Edge) => ({
  source: connection.source,
  target: connection.target,
  ...parseHandleId(connection.sourceHandle ?? ""),
});

/** The diagram of a playbook. Must be rendered inside a ReactFlowProvider. */
export const FlowCanvas: React.FC<FlowCanvasProps> = ({
  playbook,
  spec,
  editor,
}) => {
  const { screenToFlowPosition } = useReactFlow();
  const theme = useTheme();
  const [selectedEdgeId, setSelectedEdgeId] = useState<string>();
  const [showMinimap, setShowMinimap] = useState(true);
  const [readOnlySelectedId, setReadOnlySelectedId] = useState<string>();
  const readOnly = !editor;
  // The line drawn while connecting has the colour of the port it starts from.
  const draggedKind = useConnection((connection) =>
    connection.inProgress
      ? parseHandleId(connection.fromHandle.id ?? "").kind
      : undefined,
  );
  const connectionLineStyle = draggedKind && {
    stroke: getConnectionColor(theme, draggedKind),
  };

  const graph = useMemo(
    () =>
      playbookToGraph(playbook, spec, getPositions(playbook, spec), readOnly),
    [playbook, spec, readOnly],
  );
  // React Flow rebuilds a node from scratch when it receives a new node object, and
  // hides it until it has a size. The sizes it measured are kept here and handed back.
  const [sizes, setSizes] = useState<Record<string, Size>>({});
  const editorSelectedIds = editor?.selectedIds;
  const nodes = useMemo(
    (): StepFlowNode[] =>
      graph.nodes.map((node) => ({
        ...node,
        measured: sizes[node.id],
        selected: editorSelectedIds
          ? editorSelectedIds.includes(node.id)
          : node.id === readOnlySelectedId,
      })),
    [graph.nodes, sizes, editorSelectedIds, readOnlySelectedId],
  );
  const edges = useMemo(
    (): Edge<Link>[] =>
      graph.edges.map((edge) => ({
        ...edge,
        selected: edge.id === selectedEdgeId,
      })),
    [graph.edges, selectedEdgeId],
  );

  const handleNodesChange = (changes: NodeChange<StepFlowNode>[]) => {
    const measured: Record<string, Size> = {};
    for (const change of changes)
      if (change.type === "dimensions" && change.dimensions)
        measured[change.id] = change.dimensions;
    if (Object.keys(measured).length)
      setSizes((current) => ({ ...current, ...measured }));

    if (!editor) return;
    const selected = new Set(editor.selectedIds);
    const moved: Record<string, Position> = {};
    const removed: string[] = [];
    for (const change of changes) {
      if (change.type === "select") {
        if (change.selected) selected.add(change.id);
        else selected.delete(change.id);
      } else if (change.type === "position" && change.position)
        moved[change.id] = change.position;
      else if (change.type === "remove") removed.push(change.id);
    }
    if (changes.some((change) => change.type === "select"))
      editor.onSelect([...selected]);
    if (removed.length) editor.edit((p) => removeSteps(p, removed));
    if (Object.keys(moved).length) editor.edit((p) => setPositions(p, moved));
  };

  const handleEdgesChange = (changes: EdgeChange<Edge<Link>>[]) => {
    if (!editor) return;
    for (const change of changes) {
      if (change.type !== "remove") continue;
      const edge = graph.edges.find((e) => e.id === change.id);
      if (edge) editor.edit((p) => disconnect(p, edge.data));
    }
  };

  const handleNodeClick = (_: React.MouseEvent, node: StepFlowNode) => {
    // In the editor, React Flow selects on click and reports it through onNodesChange.
    if (editor) return;
    setReadOnlySelectedId((selectedId) =>
      selectedId === node.id ? undefined : node.id,
    );
  };

  const handlePaneClick = () => {
    editor?.onSelect([]);
    setReadOnlySelectedId(undefined);
    setSelectedEdgeId(undefined);
  };

  const handleDrop = (event: React.DragEvent) => {
    const type = event.dataTransfer.getData(STEP_TYPE_MIME);
    if (!editor || !type) return;
    event.preventDefault();
    editor.onAddStep(
      type,
      screenToFlowPosition({ x: event.clientX, y: event.clientY }),
    );
  };

  const menu = useCanvasMenu(playbook, spec, editor);
  const readOnlySelected = readOnly
    ? graph.nodes.find((node) => node.id === readOnlySelectedId)
    : undefined;

  return (
    <CanvasWrapper onContextMenu={(event) => event.preventDefault()}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        defaultMarkerColor={null}
        nodeOrigin={NODE_ORIGIN}
        connectionLineStyle={connectionLineStyle}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={(c) => editor?.edit((p) => connect(p, toLink(c)))}
        isValidConnection={(c) => canConnect(playbook, spec, toLink(c))}
        onNodeClick={handleNodeClick}
        onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
        onPaneClick={handlePaneClick}
        {...menu.handlers}
        selectionKeyCode="Shift"
        multiSelectionKeyCode={MULTI_SELECTION_KEYS}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        deleteKeyCode={readOnly ? null : DELETE_KEYS}
        minZoom={MIN_ZOOM}
        fitView
        fitViewOptions={FIT_VIEW_OPTIONS}
      >
        <Background />
        <Controls showInteractive={false}>
          {!readOnly && (
            <ControlButton
              onClick={() => setShowMinimap((shown) => !shown)}
              title={showMinimap ? "Hide minimap" : "Show minimap"}
            >
              <Icon $icon={showMinimap ? IconMapOff : IconMap} />
            </ControlButton>
          )}
        </Controls>
        {!readOnly && showMinimap && <MiniMap pannable zoomable />}
      </ReactFlow>
      {editor && <ContextMenu menu={menu.menu} onClose={menu.closeMenu} />}
      {readOnlySelected && (
        <StepDetailsCard
          step={readOnlySelected.data.step}
          definition={readOnlySelected.data.definition}
          spec={spec}
          onClose={() => setReadOnlySelectedId(undefined)}
        />
      )}
    </CanvasWrapper>
  );
};
