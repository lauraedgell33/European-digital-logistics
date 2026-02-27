<?php

namespace App\Http\Requests\Message;

use Illuminate\Foundation\Http\FormRequest;

class StartConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'recipient_id' => 'required|exists:users,id',
            'subject' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:direct,freight_inquiry,order_discussion,tender_discussion',
            'reference_type' => 'nullable|string',
            'reference_id' => 'nullable|integer',
            'message' => 'required|string|max:5000',
        ];
    }
}
