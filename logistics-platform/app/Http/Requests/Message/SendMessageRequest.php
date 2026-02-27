<?php

namespace App\Http\Requests\Message;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        $conversation = $this->route('conversation');

        return $conversation->participants()->where('user_id', $this->user()->id)->exists();
    }

    public function rules(): array
    {
        return [
            'body' => 'required|string|max:5000',
            'type' => 'nullable|string|in:text,file,system',
            'metadata' => 'nullable|array',
        ];
    }
}
