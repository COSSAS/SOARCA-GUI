import { IconAlertTriangle } from "@tabler/icons-react";
import {
  Position,
  useConnection,
  useUpdateNodeInternals,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { memo, useEffect, useRef } from "react";

import { Icon, ThemeSize } from "@/components";

import {
  getPorts,
  parseHandleId,
  toIncomingHandleId,
  type StepNodeData,
} from "../model/graph";
import { getNodeWidth, spreadFraction } from "../model/layout";
import { UNKNOWN_STEP_COLOR, UNKNOWN_STEP_ICON } from "./constants";
import { StepIcon } from "./StepIcon";
import {
  IncomingHandle,
  IssueMarker,
  NodeCard,
  NodeHeader,
  NodeTitle,
  NodeType,
  PortHandle,
  TargetHandle,
} from "./StepNode.styles";

export type StepFlowNode = Node<StepNodeData, "step">;

export const StepNode = memo(function StepNode({
  id,
  data,
  selected,
}: NodeProps<StepFlowNode>) {
  const { step, definition, issues, readOnly } = data;
  const color = definition?.color ?? UNKNOWN_STEP_COLOR;
  const typeLabel = definition?.label ?? step.type;
  const ports = getPorts(data);
  // While a connection is dragged from another step, this whole step is a drop target
  // in the colour of the dragged connection.
  const incomingKind = useConnection((connection) =>
    connection.inProgress && connection.fromNode.id !== id
      ? parseHandleId(connection.fromHandle.id ?? "").kind
      : undefined,
  );

  // React Flow measures handles once, but switch cases add and rename handles later.
  // Skipped on mount: React Flow measures new nodes itself, and an extra update there
  // makes the initial fitView run before all nodes have a size.
  const updateNodeInternals = useUpdateNodeInternals();
  const handleIds = [
    ...ports.map((port) => port.handleId),
    data.incoming,
  ].join("\n");
  const measuredHandleIds = useRef(handleIds);
  useEffect(() => {
    if (measuredHandleIds.current === handleIds) return;
    measuredHandleIds.current = handleIds;
    updateNodeInternals(id);
  }, [id, handleIds, updateNodeInternals]);

  return (
    <NodeCard
      $color={color}
      $selected={selected}
      $width={getNodeWidth(ports.length)}
    >
      {step.type !== "start" && (
        <TargetHandle
          type="target"
          position={Position.Top}
          isConnectable={!readOnly}
          $incomingKind={incomingKind}
        />
      )}
      {data.incoming > 1 &&
        Array.from({ length: data.incoming }, (_, i) => (
          <IncomingHandle
            key={i}
            id={toIncomingHandleId(i)}
            type="target"
            position={Position.Top}
            isConnectable={false}
            style={{ left: `${spreadFraction(i, data.incoming) * 100}%` }}
          />
        ))}
      <NodeHeader>
        <StepIcon icon={definition?.icon ?? UNKNOWN_STEP_ICON} $color={color} />
        <NodeType>{typeLabel}</NodeType>
        {issues.length > 0 && (
          <IssueMarker
            $blocking={issues.some((issue) => issue.blocking)}
            title={issues.map((issue) => issue.message).join("\n")}
          >
            <Icon $icon={IconAlertTriangle} $size={ThemeSize.Small} />
          </IssueMarker>
        )}
      </NodeHeader>
      <NodeTitle title={step.name}>{step.name || typeLabel}</NodeTitle>
      {ports.map((port, i) => (
        <PortHandle
          key={port.handleId}
          id={port.handleId}
          type="source"
          position={Position.Bottom}
          isConnectable={!readOnly}
          $kind={port.kind}
          $linked={port.linked}
          style={{ left: `${spreadFraction(i, ports.length) * 100}%` }}
          title={port.label}
        >
          {port.label}
        </PortHandle>
      ))}
    </NodeCard>
  );
});
