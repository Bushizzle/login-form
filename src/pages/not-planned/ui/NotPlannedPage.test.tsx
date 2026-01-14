import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotPlannedPage } from './NotPlannedPage';

describe('NotPlannedPage', () => {
  it('renders default message', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <NotPlannedPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('not-planned-page')).toBeInTheDocument();
    expect(screen.getByText(/not planned as part of this demo/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to sign in/i })).toBeInTheDocument();
  });

  it('uses feature from query param as title', () => {
    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        initialEntries={['/not-planned?feature=Sign%20in%20with%20Google']}
      >
        <NotPlannedPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /sign in with google/i })).toBeInTheDocument();
  });
});


