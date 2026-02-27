<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject',
        'type', // direct, freight_inquiry, order_discussion, tender_discussion
        'reference_type', // FreightOffer, TransportOrder, Tender, etc.
        'reference_id',
        'created_by',
    ];

    public function participants()
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->withPivot(['last_read_at', 'is_muted'])
            ->withTimestamps();
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reference()
    {
        return $this->morphTo();
    }

    public function unreadCountFor(User $user): int
    {
        $lastRead = $this->participants()
            ->where('user_id', $user->id)
            ->first()?->pivot?->last_read_at;

        $query = $this->messages()->where('user_id', '!=', $user->id);
        if ($lastRead) {
            $query->where('created_at', '>', $lastRead);
        }
        return $query->count();
    }
}
