"use client";

import * as React from "react";
import { useColorScheme } from "@mui/joy/styles";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";

function ModeSwitcher() {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
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
    <Box
      sx={{
        textAlign: "center",
        flexGrow: 1,
        p: 2,
        m: -3,
        borderRadius: [0, "sm"],
      }}
    >
      <ModeSwitcher />
    </Box>
  );
}
