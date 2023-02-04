import React from "react";
import { render } from "@testing-library/react";

export function itSupportsRef<P>(
  Component: React.ComponentType<P>,
  requiredProps: P,
  refType: any,
  refProp: string = "ref"
) {
  it(
    refProp ? `supports getting ref with ${refProp} prop` : "supports ref",
    () => {
      const ref = React.createRef<typeof refType>();
      render(<Component {...requiredProps} {...{ [refProp]: ref }} />);
      expect(ref.current).toBeInstanceOf(refType);
    }
  );
}
