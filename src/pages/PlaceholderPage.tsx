import { Text } from "@/components";
import { theme } from "@/theme/theme";

interface PlaceholderPageProps {
  content: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  content,
}) => {
  return (
    <div
      style={{
        padding: "2rem",
        background: "white",
        borderRadius: "0.5rem",
        border: "1px solid #e5e7eb",
      }}
    >
      <Text color={theme.colors.text.tertiary}>{content}</Text>
    </div>
  );
};
