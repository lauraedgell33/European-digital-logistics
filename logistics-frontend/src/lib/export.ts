const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Triggers a file download from an API endpoint.
 * Uses the auth token from localStorage.
 */
export async function downloadExport(
  endpoint: string,
  params?: Record<string, string>
): Promise<void> {
  const token = localStorage.getItem('auth_token');
  // Build URL - endpoint already starts with /v1/...
  // API_BASE already includes /api/v1, so strip /v1 from endpoint
  const cleanEndpoint = endpoint.startsWith('/v1/') ? endpoint.slice(3) : endpoint;
  const baseWithoutVersion = API_BASE.replace(/\/v1$/, '');
  const url = new URL(`${baseWithoutVersion}/v1${cleanEndpoint}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/octet-stream',
    },
  });

  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`);
  }

  // Extract filename from Content-Disposition header
  const disposition = response.headers.get('Content-Disposition');
  let filename = 'export';
  if (disposition) {
    const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match?.[1]) {
      filename = match[1].replace(/['"]/g, '');
    }
  }

  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export const exportApi = {
  ordersPdf: (params?: Record<string, string>) =>
    downloadExport('/v1/export/orders/pdf', params),

  ordersCsv: (params?: Record<string, string>) =>
    downloadExport('/v1/export/orders/csv', params),

  ordersExcel: (params?: Record<string, string>) =>
    downloadExport('/v1/export/orders/csv', { ...params, format: 'xlsx' }),

  orderDetailPdf: (orderId: number | string) =>
    downloadExport(`/v1/export/orders/${orderId}/pdf`),

  freightCsv: (params?: Record<string, string>) =>
    downloadExport('/v1/export/freight/csv', params),

  freightExcel: (params?: Record<string, string>) =>
    downloadExport('/v1/export/freight/csv', { ...params, format: 'xlsx' }),

  vehiclesCsv: (params?: Record<string, string>) =>
    downloadExport('/v1/export/vehicles/csv', params),

  vehiclesExcel: (params?: Record<string, string>) =>
    downloadExport('/v1/export/vehicles/csv', { ...params, format: 'xlsx' }),

  analyticsPdf: () =>
    downloadExport('/v1/export/analytics/pdf'),
};
