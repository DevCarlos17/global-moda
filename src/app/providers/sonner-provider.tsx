import { Toaster } from "sonner";

export function SonnerProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton={false}
      duration={2000}
    />
  );
}
