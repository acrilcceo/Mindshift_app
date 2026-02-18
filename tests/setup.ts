import { expect } from 'vitest';
import * as m from '@testing-library/jest-dom/matchers';
const matchers: any = (m as any).default ?? m;
expect.extend(matchers);
import '../index.css';
