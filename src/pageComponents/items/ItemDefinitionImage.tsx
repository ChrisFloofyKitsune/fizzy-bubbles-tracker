import { TbPhotoOff } from "react-icons/tb";
import { Avatar } from "@mantine/core";

export type ItemDefinitionImageProps = {
  imageSource: string;
};
export function ItemDefinitionImage({ imageSource }: ItemDefinitionImageProps) {
  return (
    <Avatar
      key={`item-definition-image-${imageSource}`}
      mr="0.2em"
      sx={{ display: "inline-block", verticalAlign: "sub" }}
      radius="xs"
      size="sm"
      src={imageSource}
    >
      <TbPhotoOff
        key={`item-definition-image-${imageSource}-fallback`}
        size="100%"
      />
    </Avatar>
  );
}
