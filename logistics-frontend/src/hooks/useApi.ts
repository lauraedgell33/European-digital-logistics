'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  freightApi,
  vehicleApi,
  orderApi,
  tenderApi,
  trackingApi,
  networkApi,
  dashboardApi,
  matchingApi,
  routeApi,
  pricingApi,
  companyApi,
} from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import type { ListParams, NetworkCreateInput, PricingCalculateInput } from '@/types';
import type {
  FreightOfferFormData,
  VehicleOfferFormData,
  TransportOrderFormData,
  TenderFormData,
  TenderBidFormData,
} from '@/lib/validations';

// ─── Dashboard ──────────────────────────────────────────
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.index().then((r) => r.data.data),
    refetchInterval: 60000,
  });
}

export function useAnalytics(period: string = 'month') {
  return useQuery({
    queryKey: ['analytics', period],
    queryFn: () => dashboardApi.analytics(period).then((r) => r.data.data),
  });
}

// ─── Freight Offers ─────────────────────────────────────
export function useFreightOffers(params: ListParams = {}) {
  return useQuery({
    queryKey: ['freight-offers', params],
    queryFn: () => freightApi.list(params).then((r) => r.data),
  });
}

export function useFreightOffer(id: number) {
  return useQuery({
    queryKey: ['freight-offer', id],
    queryFn: () => freightApi.get(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateFreight() {
  const queryClient = useQueryClient();
  const { addNotification } = useAppStore();
  return useMutation({
    mutationFn: (data: FreightOfferFormData) => freightApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freight-offers'] });
      addNotification({ type: 'success', title: 'Freight offer created successfully' });
    },
    onError: () => {
      addNotification({ type: 'error', title: 'Failed to create freight offer' });
    },
  });
}

export function useUpdateFreight() {
  const queryClient = useQueryClient();
  const { addNotification } = useAppStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FreightOfferFormData> }) => freightApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freight-offers'] });
      addNotification({ type: 'success', title: 'Freight offer updated' });
    },
  });
}

export function useDeleteFreight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => freightApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['freight-offers'] }),
  });
}

export function useFreightSearch(params: ListParams) {
  return useQuery({
    queryKey: ['freight-search', params],
    queryFn: () => freightApi.search(params).then((r) => r.data),
    enabled: Object.keys(params).length > 0,
  });
}

// ─── Vehicle Offers ─────────────────────────────────────
export function useVehicleOffers(params: ListParams = {}) {
  return useQuery({
    queryKey: ['vehicle-offers', params],
    queryFn: () => vehicleApi.list(params).then((r) => r.data),
  });
}

export function useVehicleOffer(id: number) {
  return useQuery({
    queryKey: ['vehicle-offer', id],
    queryFn: () => vehicleApi.get(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  const { addNotification } = useAppStore();
  return useMutation({
    mutationFn: (data: VehicleOfferFormData) => vehicleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-offers'] });
      addNotification({ type: 'success', title: 'Vehicle offer created' });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<VehicleOfferFormData> }) => vehicleApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicle-offers'] }),
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => vehicleApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicle-offers'] }),
  });
}

// ─── Transport Orders ───────────────────────────────────
export function useOrders(params: ListParams = {}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderApi.list(params).then((r) => r.data),
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.get(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { addNotification } = useAppStore();
  return useMutation({
    mutationFn: (data: TransportOrderFormData) => orderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      addNotification({ type: 'success', title: 'Transport order created' });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      orderApi.updateStatus(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useOrderDocuments(orderId: number) {
  return useQuery({
    queryKey: ['order-documents', orderId],
    queryFn: () => orderApi.documents(orderId).then((r) => r.data.data),
    enabled: !!orderId,
  });
}

export function useUploadOrderDocument() {
  const queryClient = useQueryClient();
  const { addNotification } = useAppStore();
  return useMutation({
    mutationFn: ({ orderId, file, collection }: { orderId: number; file: File; collection: string }) =>
      orderApi.uploadDocument(orderId, file, collection),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['order-documents', vars.orderId] });
      addNotification({ type: 'success', title: 'Document uploaded' });
    },
    onError: () => {
      addNotification({ type: 'error', title: 'Upload failed' });
    },
  });
}

export function useDeleteOrderDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, mediaId }: { orderId: number; mediaId: number }) =>
      orderApi.deleteDocument(orderId, mediaId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['order-documents', vars.orderId] });
    },
  });
}

// ─── Tenders ────────────────────────────────────────────
export function useTenders(params: ListParams = {}) {
  return useQuery({
    queryKey: ['tenders', params],
    queryFn: () => tenderApi.list(params).then((r) => r.data),
  });
}

export function useTender(id: number) {
  return useQuery({
    queryKey: ['tender', id],
    queryFn: () => tenderApi.get(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateTender() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TenderFormData) => tenderApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenders'] }),
  });
}

export function useUpdateTender() {
  const queryClient = useQueryClient();
  const { addNotification } = useAppStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TenderFormData> }) => tenderApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      addNotification({ type: 'success', title: 'Tender updated' });
    },
  });
}

export function useSubmitBid() {
  const queryClient = useQueryClient();
  const { addNotification } = useAppStore();
  return useMutation({
    mutationFn: ({ tenderId, data }: { tenderId: number; data: TenderBidFormData }) =>
      tenderApi.submitBid(tenderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      addNotification({ type: 'success', title: 'Bid submitted successfully' });
    },
  });
}

// ─── Tracking ───────────────────────────────────────────
export function useShipmentTracking(trackingCode: string) {
  return useQuery({
    queryKey: ['tracking', trackingCode],
    queryFn: () => trackingApi.track(trackingCode).then((r) => r.data.data),
    enabled: !!trackingCode,
    refetchInterval: 30000,
  });
}

export function useActiveShipments() {
  return useQuery({
    queryKey: ['active-shipments'],
    queryFn: () => trackingApi.activeShipments().then((r) => r.data.data),
    refetchInterval: 15000,
  });
}

export function useShipmentHistory(shipmentId: number) {
  return useQuery({
    queryKey: ['shipment-history', shipmentId],
    queryFn: () => trackingApi.history(shipmentId).then((r) => r.data.data),
    enabled: !!shipmentId,
  });
}

// ─── Partner Networks ───────────────────────────────────
export function useNetworks() {
  return useQuery({
    queryKey: ['networks'],
    queryFn: () => networkApi.list().then((r) => r.data.data),
  });
}

export function useCreateNetwork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NetworkCreateInput) => networkApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['networks'] }),
  });
}

export function useJoinNetwork() {
  const queryClient = useQueryClient();
  const { addNotification } = useAppStore();
  return useMutation({
    mutationFn: (accessCode: string) => networkApi.join(accessCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networks'] });
      addNotification({ type: 'success', title: 'Joined network successfully' });
    },
  });
}

// ─── Companies ──────────────────────────────────────
export function useCompanies(params: ListParams = {}) {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: () => companyApi.list(params).then((r) => r.data),
  });
}

export function useCompany(id: number) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => companyApi.get(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

// ─── Matching & Pricing ─────────────────────────────────
export function useMatching(freightId: number) {
  return useQuery({
    queryKey: ['matching', freightId],
    queryFn: () => matchingApi.matchFreight(freightId).then((r) => r.data.data),
    enabled: !!freightId,
  });
}

export function useRoute(origin: string, destination: string) {
  return useQuery({
    queryKey: ['route', origin, destination],
    queryFn: () => routeApi.calculate({ origin_country: '', origin_city: origin, destination_country: '', destination_city: destination }).then((r) => r.data.data),
    enabled: !!origin && !!destination,
  });
}

export function usePricing(data: PricingCalculateInput | null) {
  return useQuery({
    queryKey: ['pricing', data],
    queryFn: () => pricingApi.calculate(data!).then((r) => r.data.data),
    enabled: !!data,
  });
}
