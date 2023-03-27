type WrapIfProps = {
  wrapIf: boolean;
  wrap: (wrapped: JSX.Element) => JSX.Element;
  children: JSX.Element;
};

export function WrapIf({ wrapIf, wrap, children }: WrapIfProps): JSX.Element {
  return wrapIf ? wrap(children) : children;
}
