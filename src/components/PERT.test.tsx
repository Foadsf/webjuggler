import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PERT } from './PERT';
import { useTaskOperations } from '../hooks/useTaskOperations';
import React from 'react';

// Mock the hook
vi.mock('../hooks/useTaskOperations', () => ({
  useTaskOperations: vi.fn(),
}));

describe('PERT Defensive Programming', () => {
  it('handles undefined tasks gracefully', () => {
    (useTaskOperations as any).mockReturnValue({
      tasks: undefined,
    });
    
    const { container } = render(<PERT />);
    expect(container).toBeInTheDocument();
  });

  it('handles null tasks gracefully', () => {
    (useTaskOperations as any).mockReturnValue({
      tasks: null,
    });
    
    const { container } = render(<PERT />);
    expect(container).toBeInTheDocument();
  });

  it('handles empty tasks array', () => {
    (useTaskOperations as any).mockReturnValue({
      tasks: [],
    });
    
    const { container } = render(<PERT />);
    expect(container).toBeInTheDocument();
  });

  it('handles tasks with undefined depends', () => {
    const tasks = [{ id: '1', name: 'Test', depends: undefined }];
    (useTaskOperations as any).mockReturnValue({
      tasks: tasks,
    });
    
    const { container } = render(<PERT />);
    expect(container).toBeInTheDocument();
  });
});
