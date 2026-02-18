import { describe, it, expect } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import axeCore from 'axe-core';
import Login from '../src/pages/Login';
import DashboardPage from '../src/pages/Dashboard';

async function runAxe(container: HTMLElement) {
  const results = await axeCore.run(container, {
    runOnly: {
      type: 'rule',
      values: ['color-contrast']
    }
  });
  return results;
}

describe('WCAG color contrast', () => {
  it('Login has no color-contrast violations', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/login']}>
        <Login />
      </MemoryRouter>
    );
    const results = await runAxe(container);
    expect(results.violations.length).toBe(0);
  });

  it('Dashboard has no color-contrast violations', async () => {
    const state = {
      theme: 'light',
      streak: 7,
      moodHistory: [],
      dailyAffirmation: ['I am focused', 'I am balanced'],
      tracker369: [],
      ftbaEntries: [],
      gratitudeList: [],
      dailyGoals: []
    } as any;
    const onUpdate = () => {};
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <DashboardPage />
      </MemoryRouter>
    );
    const results = await runAxe(container);
    expect(results.violations.length).toBe(0);
  });
});
