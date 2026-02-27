import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, Pagination } from '@/components/ui/DataTable';

interface TestRow {
  id: number;
  name: string;
  status: string;
  amount: number;
}

const columns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'status', header: 'Status' },
  { key: 'amount', header: 'Amount', sortable: true },
];

const sampleData: TestRow[] = [
  { id: 1, name: 'Order A', status: 'active', amount: 100 },
  { id: 2, name: 'Order B', status: 'pending', amount: 250 },
  { id: 3, name: 'Order C', status: 'completed', amount: 75 },
];

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={columns} data={sampleData} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<DataTable columns={columns} data={sampleData} />);

    expect(screen.getByText('Order A')).toBeInTheDocument();
    expect(screen.getByText('Order B')).toBeInTheDocument();
    expect(screen.getByText('Order C')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="No orders available" />);

    expect(screen.getByText('No orders available')).toBeInTheDocument();
  });

  it('shows default empty message when no custom message', () => {
    render(<DataTable columns={columns} data={[]} />);

    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('shows empty state action button when provided', () => {
    const onAction = jest.fn();
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyAction={{ label: 'Create Order', onClick: onAction }}
      />,
    );

    const button = screen.getByText('Create Order');
    expect(button).toBeInTheDocument();
  });

  it('shows loading skeleton', () => {
    render(<DataTable columns={columns} data={[]} loading />);

    // Loading state renders skeleton rows; column headers should still appear
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('calls onRowClick when a row is clicked', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={sampleData} onRowClick={onClick} />);

    await user.click(screen.getByText('Order A'));
    expect(onClick).toHaveBeenCalledWith(sampleData[0]);
  });

  it('sorts data when a sortable column header is clicked', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={sampleData} />);

    // Click "Amount" header to sort ascending
    await user.click(screen.getByText('Amount'));

    const rows = screen.getAllByRole('row');
    // First non-header row should be the lowest amount (75)
    const firstDataRow = rows[1]; // rows[0] is the header row
    expect(within(firstDataRow).getByText('75')).toBeInTheDocument();
  });

  it('handles row selection with selectable prop', async () => {
    const onSelectionChange = jest.fn();
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={sampleData}
        selectable
        selectedKeys={new Set<string | number>()}
        onSelectionChange={onSelectionChange}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    // First checkbox is "Select all", rest are row checkboxes
    expect(checkboxes).toHaveLength(4); // 1 header + 3 rows

    await user.click(checkboxes[1]); // select first row
    expect(onSelectionChange).toHaveBeenCalled();
  });
});

describe('Pagination', () => {
  it('renders current page info', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={jest.fn()}
      />,
    );

    expect(screen.getByText(/showing 1-10 of 50/i)).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />,
    );

    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={jest.fn()} />,
    );

    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  it('calls onPageChange when clicking next', async () => {
    const onPageChange = jest.fn();
    const user = userEvent.setup();
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />,
    );

    await user.click(screen.getByLabelText('Next page'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange when clicking previous', async () => {
    const onPageChange = jest.fn();
    const user = userEvent.setup();
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />,
    );

    await user.click(screen.getByLabelText('Previous page'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when clicking a page number', async () => {
    const onPageChange = jest.fn();
    const user = userEvent.setup();
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />,
    );

    await user.click(screen.getByLabelText('Page 4'));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('renders without totalItems/itemsPerPage (basic page X of Y)', () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={jest.fn()} />,
    );

    expect(screen.getByText(/page 2 of 5/i)).toBeInTheDocument();
  });
});
