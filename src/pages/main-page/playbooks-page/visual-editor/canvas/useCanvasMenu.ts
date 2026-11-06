import { useReactFlow, type Edge } from "@xyflow/react";
import { useState } from "react";

import type { Playbook } from "@/types";

import type { CanvasEditor } from "../model/editor";
import {
  connect,
  disconnect,
  disconnectAll,
  removeSteps,
} from "../model/edits";
import { getPorts, parseHandleId } from "../model/graph";
import { NODE_HEIGHT, RANK_GAP } from "../model/layout";
import {
  canAddStep,
  getAllLinks,
  getConnectTargets,
  type Link,
} from "../model/rules";
import type { CacaoSpec } from "../model/specs";
import { ANIMATED_FIT_VIEW_OPTIONS } from "./constants";
import type {
  ContextMenuAction,
  ContextMenuEntry,
  ContextMenuState,
} from "./ContextMenu";
import type { StepFlowNode } from "./StepNode";

type MenuEvent = React.MouseEvent | MouseEvent;

// Output ports are the handles on the bottom border of a step.
const PORT_HANDLE_SELECTOR = ".react-flow__handle-bottom";
// Enough of a step id to tell apart steps with the same name.
const SHORT_ID_LENGTH = 6;

/** Context menus of the editable canvas. Without an editor there are none. */
export const useCanvasMenu = (
  playbook: Playbook,
  spec: CacaoSpec,
  editor: CanvasEditor | undefined,
) => {
  const [menu, setMenu] = useState<ContextMenuState>();
  const { fitView, screenToFlowPosition } = useReactFlow();
  const closeMenu = () => setMenu(undefined);
  if (!editor) return { menu, closeMenu, handlers: {} };

  const open = (event: MenuEvent, entries: ContextMenuEntry[]) =>
    setMenu({ x: event.clientX, y: event.clientY, entries });

  const openSelectionMenu = (event: MenuEvent, stepIds: string[]) => {
    if (stepIds.length < 2) return;
    open(event, [
      {
        type: "item",
        label: "Delete",
        onSelect: () => editor.edit((p) => removeSteps(p, stepIds)),
      },
    ]);
  };

  const openPaneMenu = (event: MenuEvent) => {
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    open(event, [
      {
        type: "submenu",
        label: "Add step here",
        entries: Object.entries(spec.stepTypes).map(([type, definition]) => ({
          type: "item",
          label: definition.label,
          disabled: !canAddStep(playbook, type),
          onSelect: () => editor.onAddStep(type, position),
        })),
      },
      { type: "separator" },
      { type: "item", label: "Auto layout", onSelect: editor.onAutoLayout },
      {
        type: "item",
        label: "Fit view",
        onSelect: () => fitView(ANIMATED_FIT_VIEW_OPTIONS),
      },
      {
        type: "item",
        label: "Select all",
        disabled: Object.keys(playbook.workflow).length === 0,
        onSelect: () => editor.onSelect(Object.keys(playbook.workflow)),
      },
    ]);
  };

  const openEdgeMenu = (event: MenuEvent, edge: Edge<Link>) =>
    open(event, [
      {
        type: "item",
        label: "Delete",
        onSelect: () => {
          const link = edge.data;
          if (link) editor.edit((p) => disconnect(p, link));
        },
      },
    ]);

  const openPortMenu = (
    event: MenuEvent,
    node: StepFlowNode,
    handleId: string,
  ) => {
    const { kind, key } = parseHandleId(handleId);
    const portLabel = getPorts(node.data).find(
      (port) => port.handleId === handleId,
    )?.label;
    const newPosition = {
      x: node.position.x,
      y: node.position.y + (node.measured?.height ?? NODE_HEIGHT) + RANK_GAP,
    };
    const targets = getConnectTargets(playbook, spec, node.id, kind, key);

    const newStepEntries: ContextMenuAction[] = Object.entries(spec.stepTypes)
      .filter(([type]) => type !== "start")
      .map(([type, definition]) => ({
        type: "item",
        label: definition.label,
        disabled: !canAddStep(playbook, type),
        onSelect: () =>
          editor.onAddStep(type, newPosition, { source: node.id, kind, key }),
      }));

    const targetEntries: ContextMenuAction[] = targets.map((targetId) => {
      const target = playbook.workflow[targetId];
      const name =
        target.name || spec.stepTypes[target.type]?.label || target.type;
      return {
        type: "item",
        label: `${name} (${targetId.slice(-SHORT_ID_LENGTH)})`,
        onSelect: () =>
          editor.edit((p) =>
            connect(p, { source: node.id, kind, key, target: targetId }),
          ),
      };
    });

    open(event, [
      {
        type: "submenu",
        label: `Connect ${portLabel} to a new step`,
        entries: newStepEntries,
      },
      {
        type: "submenu",
        label: "Connect to an existing step",
        entries: targetEntries.length
          ? targetEntries
          : [
              {
                type: "item",
                label: "No available steps",
                disabled: true,
                onSelect: () => {},
              },
            ],
      },
    ]);
  };

  const openStepMenu = (event: MenuEvent, node: StepFlowNode) => {
    const handleId =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>(PORT_HANDLE_SELECTOR)?.dataset
            .handleid
        : undefined;
    if (handleId) return openPortMenu(event, node, handleId);

    if (editor.selectedIds.length > 1 && editor.selectedIds.includes(node.id))
      return openSelectionMenu(event, editor.selectedIds);

    const hasLinks = getAllLinks(playbook, spec).some(
      (link) => link.source === node.id || link.target === node.id,
    );
    open(event, [
      {
        type: "item",
        label: "Edit",
        onSelect: () => editor.onSelect([node.id]),
      },
      {
        type: "item",
        label: "Duplicate",
        disabled: node.data.step.type === "start",
        onSelect: () => editor.onDuplicateStep(node.id),
      },
      {
        type: "item",
        label: "Disconnect all",
        disabled: !hasLinks,
        onSelect: () => editor.edit((p) => disconnectAll(p, node.id, spec)),
      },
      { type: "separator" },
      {
        type: "item",
        label: "Delete",
        onSelect: () => editor.edit((p) => removeSteps(p, [node.id])),
      },
    ]);
  };

  return {
    menu,
    closeMenu,
    handlers: {
      onPaneContextMenu: openPaneMenu,
      onEdgeContextMenu: openEdgeMenu,
      onNodeContextMenu: openStepMenu,
      onSelectionContextMenu: (event: MenuEvent, nodes: StepFlowNode[]) =>
        openSelectionMenu(
          event,
          nodes.map((node) => node.id),
        ),
    },
  };
};
