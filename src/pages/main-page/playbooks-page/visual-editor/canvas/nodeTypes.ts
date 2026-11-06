import { StepNode } from "./StepNode";

// Kept apart from FlowCanvas so a hot reload of a shared module does not create a new
// object here; React Flow warns and remounts every node when nodeTypes changes.
export const nodeTypes = { step: StepNode };
