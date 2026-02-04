import { ThemeVariant } from "@/components/utils";
import {
  PlaybookExecutionStatus,
  SoarcaApiPlaybookExecutionStatus,
  SoarcaApiStepExecutionStatus,
  StepExecutionStatus,
} from "@/enums";
import { Check, PlayIcon, X } from "lucide-react";
import { describe, expect, test } from "vitest";
import {
  getBadgeVariantFromStatus,
  getBadgeVariantFromStepStatus,
  getIconFromStatus,
  getIconFromStepStatus,
  getPlaybookStatusFromSoarcaStatus,
  getStepStatusFromSoarcaStatus,
  getUserCompletedActionCardProperties,
} from "./utils";

describe("Utility functions used in monitoring page", () => {
  test("status mapping from soarca step/playbook to internal enums and badges", () => {
    // Step status mapping
    expect(
      getStepStatusFromSoarcaStatus(SoarcaApiStepExecutionStatus.SUCCESS),
    ).toBe(StepExecutionStatus.Executed);
    expect(
      getStepStatusFromSoarcaStatus(SoarcaApiStepExecutionStatus.ONGOING),
    ).toBe(StepExecutionStatus.Running);
    expect(getStepStatusFromSoarcaStatus(undefined)).toBe(
      StepExecutionStatus.Failed,
    );

    // Playbook status mapping
    expect(
      getPlaybookStatusFromSoarcaStatus(
        SoarcaApiPlaybookExecutionStatus.SUCCESS,
      ),
    ).toBe(PlaybookExecutionStatus.Executed);
    expect(getPlaybookStatusFromSoarcaStatus(undefined)).toBe(
      PlaybookExecutionStatus.Failed,
    );

    // Badge mapping for playbook
    expect(getBadgeVariantFromStatus(PlaybookExecutionStatus.Executed)).toBe(
      ThemeVariant.Success,
    );
    expect(getBadgeVariantFromStatus(PlaybookExecutionStatus.Running)).toBe(
      ThemeVariant.Warning,
    );
    expect(getBadgeVariantFromStatus(PlaybookExecutionStatus.Failed)).toBe(
      ThemeVariant.Error,
    );

    // Badge mapping for steps
    expect(getBadgeVariantFromStepStatus(StepExecutionStatus.Executed)).toBe(
      ThemeVariant.Success,
    );
    expect(getBadgeVariantFromStepStatus(StepExecutionStatus.Running)).toBe(
      ThemeVariant.Warning,
    );
    expect(getBadgeVariantFromStepStatus(StepExecutionStatus.Failed)).toBe(
      ThemeVariant.Error,
    );
    // Unknown status fallback -> Error
    expect(
      getBadgeVariantFromStepStatus(
        "some-unknown" as unknown as StepExecutionStatus,
      ),
    ).toBe(ThemeVariant.Error);
  });

  test("getUserCompletedActionCardProperties returns expected variants/messages", () => {
    const someResponses = [{ name: "a", value: "1", type: "string" }];

    // success with responses
    expect(
      getUserCompletedActionCardProperties(
        someResponses,
        StepExecutionStatus.Executed,
      ),
    ).toEqual({ variant: ThemeVariant.Success, message: null });

    // success without responses (confirmation)
    expect(
      getUserCompletedActionCardProperties([], StepExecutionStatus.Executed),
    ).toEqual({
      variant: ThemeVariant.Success,
      message: "User confirmed the action",
    });

    // failure with responses
    expect(
      getUserCompletedActionCardProperties(
        someResponses,
        StepExecutionStatus.Failed,
      ),
    ).toEqual({ variant: ThemeVariant.Error, message: null });

    // failure without responses
    expect(
      getUserCompletedActionCardProperties([], StepExecutionStatus.Failed),
    ).toEqual({
      variant: ThemeVariant.Error,
      message:
        "User did not perform the action in time or rejected it. Check the logs for more information.",
    });
  });

  test("getIconFromStatus returns correct icons for playbook statuses", () => {
    expect(getIconFromStatus(PlaybookExecutionStatus.Executed)).toBe(Check);
    expect(getIconFromStatus(PlaybookExecutionStatus.Running)).toBe(PlayIcon);
    expect(getIconFromStatus(PlaybookExecutionStatus.Failed)).toBe(X);
  });

  test("getIconFromStepStatus returns correct icons for step statuses", () => {
    expect(getIconFromStepStatus(StepExecutionStatus.Executed)).toBe(Check);
    expect(getIconFromStepStatus(StepExecutionStatus.Running)).toBe(PlayIcon);
    expect(getIconFromStepStatus(StepExecutionStatus.Failed)).toBe(X);
    expect(getIconFromStepStatus(StepExecutionStatus.ServerSideError)).toBe(X);
    expect(getIconFromStepStatus(StepExecutionStatus.ClientSideError)).toBe(X);
    expect(getIconFromStepStatus(StepExecutionStatus.TimeoutError)).toBe(X);
    expect(
      getIconFromStepStatus(StepExecutionStatus.ExceptionConditionError),
    ).toBe(X);
    // Test fallback for unknown status
    expect(
      getIconFromStepStatus("unknown" as unknown as StepExecutionStatus),
    ).toBe(X);
  });
});
