import React from 'react';
import { render } from '@testing-library/react-native';
import Badge from '../Badge';

describe('Badge', () => {
  it('renders label text', () => {
    const { getByText } = render(<Badge label="Active" />);
    expect(getByText('Active')).toBeTruthy();
  });

  it('renders with status prop', () => {
    const { getByText } = render(<Badge label="In Transit" status="in_transit" />);
    expect(getByText('In Transit')).toBeTruthy();
  });

  it('renders with variant prop', () => {
    const { getByText } = render(<Badge label="Warning" variant="warning" />);
    expect(getByText('Warning')).toBeTruthy();
  });

  it('renders small size by default', () => {
    const { toJSON } = render(<Badge label="Small" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders medium size', () => {
    const { toJSON } = render(<Badge label="Medium" size="md" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders dot indicator by default', () => {
    const { toJSON } = render(<Badge label="With Dot" />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
    // Badge has a dot child by default
    expect(tree.children.length).toBeGreaterThanOrEqual(2);
  });

  it('hides dot when showDot is false', () => {
    const { toJSON } = render(<Badge label="No Dot" showDot={false} />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
    // Without dot, should have fewer children
    expect(tree.children.length).toBe(1);
  });

  it('renders different statuses', () => {
    const statuses = ['active', 'pending', 'cancelled', 'in_transit', 'delivered'];
    statuses.forEach((status) => {
      const { getByText } = render(<Badge label={status} status={status} />);
      expect(getByText(status)).toBeTruthy();
    });
  });
});
