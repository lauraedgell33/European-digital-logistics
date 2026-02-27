<?php

namespace App\Http\Requests\Tender;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTenderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->company_id === $this->route('tender')->company_id
            && $this->user()->hasPermission('edit');
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'budget' => 'nullable|numeric|min:0',
            'submission_deadline' => 'sometimes|date',
            'status' => 'sometimes|in:draft,open,closed,cancelled',
        ];
    }
}
