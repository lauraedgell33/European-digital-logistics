<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    /**
     * Only participants can view the conversation's messages.
     */
    public function view(User $user, Conversation $conversation): bool
    {
        return $conversation->participants()->where('user_id', $user->id)->exists();
    }

    /**
     * Only participants can send messages.
     */
    public function sendMessage(User $user, Conversation $conversation): bool
    {
        return $conversation->participants()->where('user_id', $user->id)->exists();
    }

    /**
     * Only participants can mark as read.
     */
    public function markRead(User $user, Conversation $conversation): bool
    {
        return $conversation->participants()->where('user_id', $user->id)->exists();
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->company_id !== null;
    }

    public function update(User $user, Conversation $conversation): bool
    {
        return $conversation->participants()->where('user_id', $user->id)->exists();
    }

    public function delete(User $user, Conversation $conversation): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, Conversation $conversation): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Conversation $conversation): bool
    {
        return $user->role === 'admin';
    }
}
