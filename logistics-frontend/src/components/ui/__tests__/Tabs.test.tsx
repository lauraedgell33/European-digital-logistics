import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GeistTabs } from '../Tabs';

// Mock @headlessui/react Tab components
jest.mock('@headlessui/react', () => {
  const TabGroup = ({ children }: any) => {
    const [selected, setSelected] = React.useState(0);
    return (
      <div data-testid="tab-group" data-selected={selected}>
        {React.Children.map(children, (child: any) =>
          React.cloneElement(child, { selected, setSelected })
        )}
      </div>
    );
  };
  const TabList = ({ children, className, selected, setSelected }: any) => (
    <div role="tablist" className={className}>
      {React.Children.map(children, (child: any, index: number) =>
        React.cloneElement(child, {
          selected: selected === index,
          onClick: () => setSelected(index),
          index,
        })
      )}
    </div>
  );
  const TabComponent = ({ children, className, selected, onClick, index, style }: any) => {
    const classValue = typeof className === 'function' ? className({ selected }) : className;
    return (
      <button
        role="tab"
        className={classValue}
        onClick={onClick}
        aria-selected={selected}
        data-index={index}
      >
        {typeof children === 'function' ? children({ selected }) : children}
      </button>
    );
  };
  const TabPanels = ({ children, className, selected }: any) => (
    <div className={className}>
      {React.Children.toArray(children)[selected]}
    </div>
  );
  const TabPanel = ({ children, className }: any) => (
    <div role="tabpanel" className={className}>{children}</div>
  );

  return {
    Tab: Object.assign(TabComponent, {
      Group: TabGroup,
      List: TabList,
      Panels: TabPanels,
      Panel: TabPanel,
    }),
  };
});

const tabItems = [
  { label: 'Orders', content: <div>Orders content</div> },
  { label: 'Shipments', content: <div>Shipments content</div>, count: 5 },
  { label: 'Returns', content: <div>Returns content</div>, count: 0 },
];

describe('GeistTabs', () => {
  it('renders all tab labels', () => {
    render(<GeistTabs items={tabItems} />);
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Shipments')).toBeInTheDocument();
    expect(screen.getByText('Returns')).toBeInTheDocument();
  });

  it('renders tab list with role', () => {
    render(<GeistTabs items={tabItems} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('renders tabs with tab role', () => {
    render(<GeistTabs items={tabItems} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
  });

  it('shows first tab content by default', () => {
    render(<GeistTabs items={tabItems} />);
    expect(screen.getByText('Orders content')).toBeInTheDocument();
  });

  it('switches tab content on click', () => {
    render(<GeistTabs items={tabItems} />);
    fireEvent.click(screen.getByText('Shipments'));
    expect(screen.getByText('Shipments content')).toBeInTheDocument();
  });

  it('renders tab count badges', () => {
    render(<GeistTabs items={tabItems} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<GeistTabs items={tabItems} className="custom-tabs" />);
    expect(screen.getByRole('tablist')).toHaveClass('custom-tabs');
  });

  it('marks first tab as selected by default', () => {
    render(<GeistTabs items={tabItems} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  });
});
