<?php

namespace App\Exports;

use App\Models\FreightOffer;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class FreightExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function query()
    {
        $query = FreightOffer::with('company')
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
            'Origin Country',
            'Origin City',
            'Destination Country',
            'Destination City',
            'Loading Date',
            'Unloading Date',
            'Vehicle Type',
            'Cargo Type',
            'Weight (kg)',
            'Volume (m³)',
            'Loading Meters',
            'Pallets',
            'Price',
            'Currency',
            'Status',
            'Created At',
        ];
    }

    public function map($freight): array
    {
        return [
            $freight->id,
            $freight->origin_country,
            $freight->origin_city,
            $freight->destination_country,
            $freight->destination_city,
            $freight->loading_date?->format('d.m.Y'),
            $freight->unloading_date?->format('d.m.Y'),
            $freight->vehicle_type,
            $freight->cargo_type,
            $freight->weight,
            $freight->volume,
            $freight->loading_meters,
            $freight->pallet_count,
            $freight->price,
            $freight->currency ?? 'EUR',
            ucfirst($freight->status ?? ''),
            $freight->created_at?->format('d.m.Y H:i'),
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 11]],
        ];
    }
}
