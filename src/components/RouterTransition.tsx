import { useEffect } from "react";
import { useRouter } from "next/router";
import {
  startNavigationProgress,
  resetNavigationProgress,
  NavigationProgress,
} from "@mantine/nprogress";

export function RouterTransition() {
  const router = useRouter();

  useEffect(() => {
    const handleStart = (url: string) => {
      if (url !== router.asPath) {
        console.log("route start");
        startNavigationProgress();
      }
    };
    const handleComplete = () => {
      console.log("route end");
      resetNavigationProgress();
      // setTimeout(() => incrementNavigationProgress(100));
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router.asPath, router.events]);

  return <NavigationProgress />;
}
