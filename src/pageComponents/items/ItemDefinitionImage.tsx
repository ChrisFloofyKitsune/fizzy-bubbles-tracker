import { TbPhotoOff } from "react-icons/tb";
import { Avatar } from "@mantine/core";

export type ItemDefinitionImageProps = {
  imageLink?: string | null;
};
export function ItemDefinitionImage({ imageLink }: ItemDefinitionImageProps) {
  return imageLink ? (
    <Avatar
      key={`item-definition-image-${imageLink}`}
      mr="0.2em"
      sx={{ display: "inline-block", verticalAlign: "sub" }}
      radius="xs"
      size="sm"
      src={imageLink}
    >
      <TbPhotoOff
        key={`item-definition-image-${imageLink}-fallback`}
        size="100%"
      />
    </Avatar>
  ) : (
    <> </>
  );
}
