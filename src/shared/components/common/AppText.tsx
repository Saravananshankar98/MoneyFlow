import { Text, TextProps } from "react-native-paper";

interface Props extends TextProps<never> {
  children: React.ReactNode;
}

export default function AppText({
  children,
  ...props
}: Props) {
  return <Text {...props}>{children}</Text>;
}
