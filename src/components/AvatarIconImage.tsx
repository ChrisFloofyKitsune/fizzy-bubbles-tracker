import { TbPhotoOff } from "react-icons/tb";
import { Avatar } from "@mantine/core";

export type AvatarIconImageProps = {
  imageLink?: string | null;
};
export function AvatarIconImage({ imageLink }: AvatarIconImageProps) {
  return imageLink ? (
    <Avatar
      key={`item-definition-image-${imageLink}`}
      mr="0.2em"
      radius="xs"
      size="sm"
      src={imageLink}
      sx={{ display: "inline-block", verticalAlign: "sub" }}
      styles={{
        image: {
          objectFit: "none",
        },
      }}
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
