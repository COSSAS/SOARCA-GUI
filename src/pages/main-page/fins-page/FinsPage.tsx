import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useNavigate } from "react-router";

import { getFins } from "@/api/fin";
import { getErrorFromApiResponse } from "@/api/utils";
import {
  Badge,
  CardBody,
  CardContainer,
  CardHeader,
  CardTitle,
  Cell,
  CenteredCardContent,
  HeaderCell,
  Row,
  Spacer,
  Spinner,
  Table,
  TableBody,
  TableHead,
  Text,
} from "@/components";
import { ThemeSize, ThemeVariant } from "@/components/utils";
import { Fin } from "@/types";
import { formatDateTime, PATHS, sortByString } from "@/utils";

export const FinsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["fins"],
    queryFn: getFins,
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
  });

  const fins: Fin[] = sortByString(
    [...(data || [])],
    (fin) => fin.display_name || fin.fin_id,
  );
  const parsedError = getErrorFromApiResponse(error);

  const navigateToDetail = (finId: string) => {
    navigate(PATHS.FINS.DETAIL.replace(":finId", finId));
  };

  const renderBody = () => {
    if (isLoading)
      return (
        <CenteredCardContent>
          <Spinner $size={ThemeSize.Large} />
        </CenteredCardContent>
      );
    if (isError)
      return <Text>{parsedError?.message || "Could not load fins"}</Text>;
    if (fins.length === 0)
      return <Text>No fins are currently registered.</Text>;
    return (
      <Table>
        <TableHead>
          <tr>
            <HeaderCell>Display name</HeaderCell>
            <HeaderCell>Capabilities</HeaderCell>
            <HeaderCell>Protocol version</HeaderCell>
            <HeaderCell>Registered</HeaderCell>
            <HeaderCell>Last seen</HeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {fins.map((fin) => (
            <Row
              key={fin.fin_id}
              $isClickable
              onClick={() => navigateToDetail(fin.fin_id)}
            >
              <Cell>{fin.display_name || fin.fin_id}</Cell>
              <Cell>
                <Spacer $direction="horizontal" $gap="xs" $wrap>
                  {fin.capabilities.map((capability) => (
                    <Badge key={capability.type} $variant={ThemeVariant.Info}>
                      {capability.type}
                    </Badge>
                  ))}
                </Spacer>
              </Cell>
              <Cell>{fin.protocol_version || "—"}</Cell>
              <Cell>{formatDateTime(fin.registered_at)}</Cell>
              <Cell>{formatDateTime(fin.last_seen)}</Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <CardContainer>
      <CardHeader>
        <CardTitle>Registered fins ({fins.length})</CardTitle>
      </CardHeader>
      <CardBody>{renderBody()}</CardBody>
    </CardContainer>
  );
};
