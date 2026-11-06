import { Badge, ThemeVariant } from "@/components";
import type { Command } from "@/types";

import { Description } from "./PlaybookDetailPage.styles";
import { CodeField, DetailField, Section } from "./PlaybookDetails";
import { readContent, readText } from "./stepFields";

const CommandSection = ({ command, title }: { command: Command; title: string }) => {
  const body = readText(command.command, command.command_b64);
  const content = readText(command.content, command.content_b64);
  const formatted = content && readContent(content.text);
  const headers = Object.entries(command.headers ?? {});

  return (
    <Section title={title}>
      <DetailField label="Type">
        <Badge $variant={ThemeVariant.Primary}>{command.type}</Badge>
      </DetailField>
      {command.version && <DetailField label="Version">{command.version}</DetailField>}
      {command.playbook_activity && (
        <DetailField label="Playbook activity" wide>
          {command.playbook_activity}
        </DetailField>
      )}
      {command.description && (
        <DetailField label="Description" wide>
          <Description>{command.description}</Description>
        </DetailField>
      )}
      {body && (
        <CodeField
          label={body.decoded ? "Command (decoded from base64)" : "Command"}
          code={body.text}
        />
      )}
      {headers.length > 0 && (
        <CodeField
          label="Headers"
          code={headers
            .map(([name, values]) => `${name}: ${values.join(", ")}`)
            .join("\n")}
        />
      )}
      {content && formatted && (
        <CodeField
          label={content.decoded ? "Content (decoded from base64)" : "Content"}
          code={formatted.code}
          warning={formatted.invalid ? "This content is not valid JSON." : undefined}
        />
      )}
    </Section>
  );
};

/** The commands of an action step, as they will be sent. */
export const CommandList = ({ commands }: { commands: Command[] }) => (
  <>
    {commands.map((command, index) => (
      <CommandSection
        key={index}
        command={command}
        title={commands.length === 1 ? "Command" : `Command ${index + 1}`}
      />
    ))}
  </>
);
