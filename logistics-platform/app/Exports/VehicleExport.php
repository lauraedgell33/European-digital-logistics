<?php

namespace App\Exports;

use App\Models\VehicleOffer;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class VehicleExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function query()
    {
        $query = VehicleOffer::with('company')
            ->where('company_id', $this->request->user()->company_id);

        if ($this->request->filled('status')) {
            $query->where('status', $this->request->status);
        }

        return $query->orderBy('created_at', 'desc');
    }

    public function headings(): array
    {
        return [
            'ID',
            'Vehicle Type',
            'Registration',
            'Current Location',
            'Current Country',
            'Destination City',
            'Destination Country',
            'Available From',
            'Available To',
            'Capacity (t)',
            'Loading Meters',
            'Pallet Spaces',
            'Price per km',
            'Flat Price',
            'Currency',
            'ADR Certified',
            'Status',
            'Created At',
        ];
    }

    public function map($vehicle): array
    {
        return [
            $vehicle->id,
            $vehicle->vehicle_type,
            $vehicle->registration_number,
            $vehicle->current_city,
            $vehicle->current_country,
            $vehicle->destination_city,
            $vehicle->destination_country,
            $vehicle->available_from?->format('d.m.Y'),
            $vehicle->available_to?->format('d.m.Y'),
            $vehicle->capacity_tons,
            $vehicle->loading_meters,
            $vehicle->pallet_spaces,
            $vehicle->price_per_km,
            $vehicle->flat_price,
            $vehicle->currency ?? 'EUR',
            $vehicle->adr_certified ? 'Yes' : 'No',
            ucfirst($vehicle->status ?? ''),
            $vehicle->created_at?->format('d.m.Y H:i'),
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 11]],
        ];
    }
}
