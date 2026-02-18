declare module 'axe-core' {
  const axeCore: {
    run: (context?: Element | Document, options?: any) => Promise<{
      violations: Array<{ id: string; description: string; nodes: any[] }>;
      passes: any[];
    }>;
  };
  export default axeCore;
}

declare module '@testing-library/react' {
  export const render: (ui: any) => { container: HTMLElement } & Record<string, any>;
  export const screen: Record<string, any>;
}

declare module '@testing-library/user-event' {
  const userEvent: {
    setup: () => {
      click: (el: Element) => Promise<void>;
      type: (el: Element, text: string) => Promise<void>;
    };
  };
  export default userEvent;
}
