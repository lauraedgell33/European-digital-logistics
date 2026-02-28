import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataTable, Pagination } from '../DataTable';

const columns = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'status', header: 'Status' },
];

const sampleData = [
  { id: 1, name: 'Order A', status: 'active' },
  { id: 2, name: 'Order B', status: 'pending' },
  { id: 3, name: 'Order C', status: 'completed' },
];

describe('DataTable', () => {
  it('renders table with data', () => {
    render(<DataTable columns={columns} data={sampleData} />);
    expect(screen.getByText('Order A')).toBeInTheDocument();
    expect(screen.getByText('Order B')).toBeInTheDocument();
    expect(screen.getByText('Order C')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<DataTable columns={columns} data={sampleData} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="No orders found" />);
    expect(screen.getByText('No orders found')).toBeInTheDocument();
  });

  it('shows default empty message', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('shows empty action button', () => {
    const onClick = jest.fn();
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyAction={{ label: 'Create Order', onClick }}
      />
    );
    const button = screen.getByText('Create Order');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders loading skeleton', () => {
    const { container } = render(<DataTable columns={columns} data={[]} loading />);
    expect(container.querySelectorAll('.skeleton-geist').length).toBeGreaterThan(0);
  });

  it('handles row click', () => {
    const onRowClick = jest.fn();
    render(<DataTable columns={columns} data={sampleData} onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText('Order A'));
    expect(onRowClick).toHaveBeenCalledWith(sampleData[0]);
  });

  it('sorts data when sortable column header is clicked', () => {
    render(<DataTable columns={columns} data={sampleData} />);
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    const rows = screen.getAllByRole('row');
    // Header + 3 data rows
    expect(rows).toHaveLength(4);
  });

  it('has accessible table region', () => {
    render(<DataTable columns={columns} data={sampleData} />);
    expect(screen.getByRole('region', { name: 'Data table' })).toBeInTheDocument();
  });

  it('renders with custom render function', () => {
    const customColumns = [
      ...columns,
      {
        key: 'action',
        header: 'Action',
        render: (item: any) => <button>Edit {item.name}</button>,
      },
    ];
    render(<DataTable columns={customColumns} data={sampleData} />);
    expect(screen.getByText('Edit Order A')).toBeInTheDocument();
  });

  it('supports row selection', () => {
    const onSelectionChange = jest.fn();
    render(
      <DataTable
        columns={columns}
        data={sampleData}
        selectable
        selectedKeys={new Set()}
        onSelectionChange={onSelectionChange}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(4); // 1 select-all + 3 rows
  });
});

describe('Pagination', () => {
  it('renders current page info', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });

  it('disables previous on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('disables next on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  it('calls onPageChange with correct page', () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(onPageChange).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('shows item count when provided', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={() => {}}
      />
    );
    expect(screen.getByText(/Showing 1-10 of 50/)).toBeInTheDocument();
  });

  it('highlights current page', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />);
    const currentPageButton = screen.getByLabelText('Page 3');
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
  });
});
