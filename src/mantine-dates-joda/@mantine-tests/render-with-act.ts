import React from "react";
import { render, act, RenderResult } from "@testing-library/react";

export async function renderWithAct(element: React.ReactElement) {
  let result: RenderResult;
  await act(async () => {
    result = render(element);
  });
  // @ts-ignore
  return result;
}
