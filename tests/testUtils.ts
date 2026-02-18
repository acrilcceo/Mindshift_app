import React from 'react';
import ReactDOM from 'react-dom/client';

export async function render(ui: React.ReactElement) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = ReactDOM.createRoot(container);
  root.render(ui);

  function getByLabelText(text: string) {
    const labels = Array.from(container.querySelectorAll('label'));
    const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
    const label = labels.find(l => norm(l.textContent || '') === norm(text));
    if (!label) throw new Error('Label not found');
    const forId = label.getAttribute('for');
    if (forId) {
      const target = container.querySelector(`#${forId}`);
      if (target) return target;
    }
    let sibling = label.nextElementSibling;
    while (sibling) {
      if (sibling.tagName === 'INPUT' || sibling.tagName === 'BUTTON') return sibling;
      sibling = sibling.nextElementSibling;
    }
    const input = label.parentElement?.querySelector('input,button,textarea,select');
    if (input) return input;
    const byPlaceholder = Array.from(container.querySelectorAll('input,textarea')).find(el => norm((el as any).placeholder || '') === norm(text));
    if (byPlaceholder) return byPlaceholder;
    throw new Error('Control not found for label');
  }

  function getByRole(role: string) {
    const el = container.querySelector(`[role="${role}"]`);
    if (!el) throw new Error('Role not found');
    return el;
  }

  return { container, getByLabelText, getByRole };
}
