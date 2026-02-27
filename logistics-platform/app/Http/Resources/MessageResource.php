<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'body' => $this->body,
            'type' => $this->type,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at?->toIso8601String(),
            'sender' => new UserResource($this->whenLoaded('sender')),
        ];
    }
}
