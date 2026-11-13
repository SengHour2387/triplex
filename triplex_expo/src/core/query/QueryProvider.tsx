import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useEffect, useState } from 'react';

import { createQueryClient } from './queryClient';
import { setupQueryManagers } from './managers';

/** Mount once, near the root, inside the theme (toasts render through the design system). */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => createQueryClient());
  useEffect(() => setupQueryManagers(), []);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
