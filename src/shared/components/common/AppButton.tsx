import { Button } from "react-native-paper";

interface Props {
  title: string;
  onPress: () => void;
}

export default function AppButton({
  title,
  onPress,
}: Props) {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      style={{
        borderRadius: 16,
      }}
    >
      {title}
    </Button>
  );
}