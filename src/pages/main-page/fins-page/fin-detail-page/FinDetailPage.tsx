import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";

import { deleteFin, getFinById } from "@/api/fin";
import { formatErrorForToast, getErrorFromApiResponse } from "@/api/utils";
import {
  Badge,
  Button,
  ButtonWidth,
  CardBody,
  CardContainer,
  CardHeader,
  CardTitle,
  CenteredCardContent,
  ConfirmDialog,
  CopyButton,
  FormLabel,
  Icon,
  Link,
  Spacer,
  Spinner,
  Text,
  ThemeSize,
  ThemeVariant,
} from "@/components";
import { formatDateTime, PATHS } from "@/utils";

import {
  CapabilityCard,
  CapabilityHeader,
  CodeBlock,
  DetailsGrid,
  DetailsItem,
  StepExamplesList,
} from "./FinDetailPage.styles";

export const FinDetailPage: React.FC = () => {
  const { finId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["fin", finId],
    queryFn: () => getFinById(finId!),
    enabled: !!finId,
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteFin(finId!),
    onSuccess: () => {
      toast.success("Fin deleted");
      queryClient.invalidateQueries({ queryKey: ["fins"] });
      navigate(PATHS.FINS.BASE);
    },
    onError: (err: Error) => {
      toast.error(formatErrorForToast(err, "Failed to delete fin"));
    },
  });

  const fin = data;
  const parsedError = getErrorFromApiResponse(error);

  const renderBody = () => {
    if (isLoading)
      return (
        <CenteredCardContent>
          <Spinner $size={ThemeSize.Large} />
        </CenteredCardContent>
      );
    if (isError || !fin)
      return (
        <Text>
          {isError
            ? parsedError?.message || "Could not load fin"
            : "Fin not found"}
        </Text>
      );

    return (
      <Spacer $direction="vertical" $gap="lg" $align="start">
        <DetailsGrid>
          <DetailsItem>
            <FormLabel>Fin ID</FormLabel>
            <Spacer $direction="horizontal" $gap="xs" $align="center">
              <Text>{fin.fin_id}</Text>
              <CopyButton $text={fin.fin_id} />
            </Spacer>
          </DetailsItem>
          <DetailsItem>
            <FormLabel>Protocol version</FormLabel>
            <Text>{fin.protocol_version || "—"}</Text>
          </DetailsItem>
          <DetailsItem>
            <FormLabel>Registered</FormLabel>
            <Text>{formatDateTime(fin.registered_at)}</Text>
          </DetailsItem>
          <DetailsItem>
            <FormLabel>Last seen</FormLabel>
            <Text>{formatDateTime(fin.last_seen)}</Text>
          </DetailsItem>
        </DetailsGrid>

        <Spacer $direction="vertical" $gap="md" $align="start">
          <FormLabel>Capabilities ({fin.capabilities.length})</FormLabel>
          {fin.capabilities.map((capability) => (
            <CapabilityCard key={capability.type}>
              <CapabilityHeader>
                <Spacer $direction="horizontal" $gap="sm" $align="center">
                  <Badge $variant={ThemeVariant.Info}>{capability.type}</Badge>
                  {capability.version && <Text>v{capability.version}</Text>}
                </Spacer>
              </CapabilityHeader>
              {capability.description && <Text>{capability.description}</Text>}
              {capability.step_examples &&
                capability.step_examples.length > 0 && (
                  <StepExamplesList>
                    <FormLabel>
                      Example step{capability.step_examples.length > 1 && "s"}
                    </FormLabel>
                    {capability.step_examples.map((step, idx) => (
                      <CodeBlock key={idx}>
                        {JSON.stringify(step, null, 2)}
                      </CodeBlock>
                    ))}
                  </StepExamplesList>
                )}
            </CapabilityCard>
          ))}
        </Spacer>
      </Spacer>
    );
  };

  return (
    <Spacer $direction="vertical" $gap="lg" $align="start">
      <Spacer
        style={{ width: "100%" }}
        $direction="horizontal"
        $gap="lg"
        $align="center"
        $justify="space-between"
      >
        <Link $to={PATHS.FINS.BASE}>
          <Icon $icon={ArrowLeft} />
          Back to fins
        </Link>
        {fin && (
          <Button
            $variant={ThemeVariant.Error}
            $size={ThemeSize.Small}
            $width={ButtonWidth.Auto}
            $ghost
            onClick={() => setOpenDeleteConfirm(true)}
            disabled={deleteMutation.isPending}
          >
            <Icon $icon={Trash} $size={ThemeSize.Medium} />
            Delete
          </Button>
        )}
      </Spacer>
      <CardContainer>
        <CardHeader>
          <CardTitle>{fin?.display_name || fin?.fin_id || "Fin"}</CardTitle>
        </CardHeader>
        <CardBody>{renderBody()}</CardBody>
      </CardContainer>
      {fin && (
        <ConfirmDialog
          $isOpen={openDeleteConfirm}
          $title="Delete fin"
          $description={`Delete the registration for '${
            fin.display_name || fin.fin_id
          }'? This forcibly removes it from SOARCA even if the fin is still running - it will need to re-register before it can pick up jobs again. This action cannot be undone.`}
          $confirmLabel="Delete"
          $cancelLabel="Cancel"
          $confirmVariant={ThemeVariant.Error}
          $isPending={deleteMutation.isPending}
          $onCancel={() => setOpenDeleteConfirm(false)}
          $onConfirm={() => {
            setOpenDeleteConfirm(false);
            deleteMutation.mutate();
          }}
        />
      )}
    </Spacer>
  );
};
