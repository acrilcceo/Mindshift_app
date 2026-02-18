import { expect } from 'vitest';
import * as m from '@testing-library/jest-dom/matchers';
// Support both default and named exports across versions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const matchers: any = (m as any).default ?? m;
expect.extend(matchers);
import '../index.css';
