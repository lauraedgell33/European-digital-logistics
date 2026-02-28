import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Modal } from '../Modal';

// Mock @headlessui/react to work in JSDOM
jest.mock('@headlessui/react', () => {
  const Fragment = ({ children }: any) => children;
  return {
    Dialog: Object.assign(
      ({ onClose, children, className }: any) => (
        <div role="dialog" className={className} data-testid="dialog">
          {children}
        </div>
      ),
      {
        Panel: ({ children, className }: any) => (
          <div className={className} data-testid="dialog-panel">{children}</div>
        ),
        Title: ({ children, className, style }: any) => (
          <h2 className={className} style={style}>{children}</h2>
        ),
        Description: ({ children, className, style }: any) => (
          <p className={className} style={style}>{children}</p>
        ),
      }
    ),
    Transition: Object.assign(
      ({ show, children }: any) => (show ? <>{children}</> : null),
      {
        Child: ({ children }: any) => <>{children}</>,
      }
    ),
  };
});

jest.mock('@heroicons/react/24/outline', () => ({
  XMarkIcon: (props: any) => <svg data-testid="close-icon" {...props} />,
}));

describe('Modal', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Modal {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders title', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<Modal {...defaultProps} description="Some description" />);
    expect(screen.getByText('Some description')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<Modal {...defaultProps} />);
    const closeButton = screen.getByLabelText('Close dialog');
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<Modal {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Close dialog'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not show close button when preventClose is true', () => {
    render(<Modal {...defaultProps} preventClose />);
    expect(screen.queryByLabelText('Close dialog')).not.toBeInTheDocument();
  });

  it('renders footer', () => {
    render(
      <Modal {...defaultProps} footer={<button>Save</button>}>
        Content
      </Modal>
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('applies size class', () => {
    render(<Modal {...defaultProps} size="lg" />);
    const panel = screen.getByTestId('dialog-panel');
    expect(panel).toHaveClass('max-w-2xl');
  });

  it('applies small size class', () => {
    render(<Modal {...defaultProps} size="sm" />);
    const panel = screen.getByTestId('dialog-panel');
    expect(panel).toHaveClass('max-w-md');
  });

  it('applies full size class', () => {
    render(<Modal {...defaultProps} size="full" />);
    const panel = screen.getByTestId('dialog-panel');
    expect(panel).toHaveClass('max-w-[calc(100vw-64px)]');
  });
});
