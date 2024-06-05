"use client";

import * as React from "react";
import { useColorScheme } from "@mui/joy/styles";
import Button from "@mui/joy/Button";

function ModeSwitcher() {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="soft" color="neutral"></Button>;
  }

  return (
    <Button
      variant="soft"
      color="neutral"
      onClick={() => setMode(mode === "dark" ? "light" : "dark")}
    >
      {mode === "dark" ? "Turn light" : "Turn dark"}
    </Button>
  );
}

export default function ModeToggle() {
  return (
    <div suppressHydrationWarning={true}>
      <ModeSwitcher />
    </div>
  );
}
