'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Loading';
import { documentOcrApi } from '@/lib/api';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';
import type { DocumentScan } from '@/types';

export default function DocumentOcrPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState('cmr');

  const { data: documents, isLoading: loadingDocs } = useQuery({
    queryKey: ['ocr-documents'],
    queryFn: () => documentOcrApi.list().then(r => r.data?.data || []),
  });

  const { data: stats } = useQuery({
    queryKey: ['ocr-stats'],
    queryFn: () => documentOcrApi.stats().then(r => r.data?.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentOcrApi.upload(file, docType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocr-documents'] });
      queryClient.invalidateQueries({ queryKey: ['ocr-stats'] });
    },
  });

  const validateMutation = useMutation({
    mutationFn: (id: number) => documentOcrApi.validate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ocr-documents'] }),
  });

  const handleUpload = () => {
    const file = fileRef.current?.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'validated': return 'green';
      case 'processing': return 'blue';
      case 'pending': return 'yellow';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DocumentTextIcon className="h-7 w-7" style={{ color: 'var(--ds-indigo-500)' }} />
          {t('documentOcr.title')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t('documentOcr.aiPoweredDesc')}</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total || 0}</p>
            <p className="text-xs text-gray-500">{t('documentOcr.totalScans')}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--ds-green-600)' }}>{stats.validated || 0}</p>
            <p className="text-xs text-gray-500">{t('documentOcr.validated')}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--ds-amber-600)' }}>{stats.pending || 0}</p>
            <p className="text-xs text-gray-500">{t('documentOcr.pending')}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.avg_confidence ? `${(Number(stats.avg_confidence) * 100).toFixed(0)}%` : 'N/A'}</p>
            <p className="text-xs text-gray-500">{t('documentOcr.avgConfidence')}</p>
          </Card>
        </div>
      )}

      {/* Upload */}
      <Card>
        <CardHeader title={t('documentOcr.uploadDocument')} subtitle={t('documentOcr.supportedFormats')} />
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <select
            className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
            value={docType} onChange={e => setDocType(e.target.value)}
          >
            <option value="cmr">{t('documentOcr.cmrNote')}</option>
            <option value="invoice">{t('documentOcr.invoice')}</option>
            <option value="pod">{t('documentOcr.proofOfDelivery')}</option>
            <option value="customs">{t('documentOcr.customsDocument')}</option>
            <option value="other">{t('documentOcr.other')}</option>
          </select>
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="flex-1 text-sm" />
          <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? <Spinner size="sm" /> : <CloudArrowUpIcon className="h-4 w-4 mr-2" />}
            {t('documentOcr.uploadScan')}
          </Button>
        </div>
        {uploadMutation.isSuccess && (
          <div className="mx-4 mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5" />
            {t('documentOcr.uploadSuccess')}
          </div>
        )}
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader title={t('documentOcr.scannedDocuments')} subtitle={`${(documents || []).length} ${t('documentOcr.documentsCount')}`} />
        {loadingDocs ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : (documents || []).length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>{t('documentOcr.noDocuments')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {(documents as DocumentScan[]).map(doc => (
              <div key={doc.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusColor(doc.validation_status) as 'green' | 'blue' | 'yellow' | 'red' | 'gray'}>
                        {doc.validation_status}
                      </Badge>
                      <Badge variant="gray">{doc.document_type.toUpperCase()}</Badge>
                      <span className="text-sm font-medium">{doc.original_filename}</span>
                    </div>
                    {doc.confidence_score !== undefined && doc.confidence_score !== null && (
                      <p className="text-xs text-gray-500 mt-1">
                        Confidence: {(doc.confidence_score * 100).toFixed(0)}%
                      </p>
                    )}
                    {doc.extracted_data && Object.keys(doc.extracted_data).length > 0 && (
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {Object.entries(doc.extracted_data).slice(0, 6).map(([key, val]) => (
                          <div key={key} className="bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                            <span className="text-gray-500">{key}:</span> {String(val)}
                          </div>
                        ))}
                      </div>
                    )}
                    {doc.validation_errors && doc.validation_errors.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {doc.validation_errors.map((err, i) => (
                          <p key={i} className="text-xs text-red-600 flex items-center gap-1">
                            <ExclamationCircleIcon className="h-3 w-3" />
                            {err.field}: {err.message}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {doc.validation_status === 'pending' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => validateMutation.mutate(doc.id)}
                        disabled={validateMutation.isPending}
                      >
                        {t('documentOcr.validate')}
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{new Date(doc.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
