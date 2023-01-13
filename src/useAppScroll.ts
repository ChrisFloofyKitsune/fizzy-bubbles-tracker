import { useEffect, useState } from "react";
import { Subject } from "rxjs";

export const appScrollSubject = new Subject<number>();

export function useAppScroll() {
  const [scrollPos, setScrollPos] = useState<number>(0);

  useEffect(() => {
    const sub = appScrollSubject.subscribe((next) => {
      setScrollPos(next);
    });
    return () => {
      sub.unsubscribe();
    };
  });

  return scrollPos;
}
