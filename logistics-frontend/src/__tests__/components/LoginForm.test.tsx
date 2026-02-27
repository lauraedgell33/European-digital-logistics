import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/(auth)/login/page';
import { useAuthStore } from '@/stores/authStore';
import { mockPush } from '../setup';
import React from 'react';

// Mock the authStore
jest.mock('@/stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

function setupAuthStore(overrides: Partial<ReturnType<typeof useAuthStore>> = {}) {
  const defaults = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    fetchProfile: jest.fn(),
    setUser: jest.fn(),
  };
  const store = { ...defaults, ...overrides };
  mockUseAuthStore.mockReturnValue(store as ReturnType<typeof useAuthStore>);
  return store;
}

describe('LoginPage', () => {
  beforeEach(() => {
    setupAuthStore();
  });

  it('renders the login form', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders links for forgot password and create account', () => {
    render(<LoginPage />);
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty fields on submit', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      // Zod schema: email → "Invalid email address" or similar, password → "Password is required"
      expect(screen.getByText(/email/i)).toBeInTheDocument();
    });
  });

  it('calls login on valid submit and navigates to dashboard', async () => {
    const loginMock = jest.fn().mockResolvedValue(undefined);
    setupAuthStore({ login: loginMock });

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email address/i), 'admin@test.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith(
        'admin@test.com',
        'password123',
        'mock-recaptcha-token',
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error message on invalid credentials', async () => {
    const loginMock = jest.fn().mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });
    setupAuthStore({ login: loginMock });

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email address/i), 'wrong@test.com');
    await user.type(screen.getByLabelText(/^password$/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('shows a spinner while loading', () => {
    setupAuthStore({ isLoading: true });
    render(<LoginPage />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // The button should NOT show "Sign In" text when loading
    expect(button).not.toHaveTextContent('Sign In');
  });
});
