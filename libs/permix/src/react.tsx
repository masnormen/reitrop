import { createComponents, PermixProvider as Provider, usePermix } from "permix/react";

import { permix } from "./instance";

export function PermixProvider({ children }: { children: React.ReactNode }) {
  return <Provider permix={permix}>{children}</Provider>;
}

export function usePermissions() {
  return usePermix(permix);
}

export const { Check } = createComponents(permix);
