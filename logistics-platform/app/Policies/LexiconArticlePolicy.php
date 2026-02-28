<?php

namespace App\Policies;

use App\Models\User;
use App\Models\LexiconArticle;

/**
 * Lexicon article policy: admin + manager can CRUD. Operator can view only.
 */
class LexiconArticlePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager' || $user->role === 'operator';
    }

    public function view(User $user, LexiconArticle $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager' || $user->role === 'operator';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function update(User $user, LexiconArticle $record): bool
    {
        return $user->role === 'admin' || $user->role === 'manager';
    }

    public function delete(User $user, LexiconArticle $record): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, LexiconArticle $record): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, LexiconArticle $record): bool
    {
        return $user->role === 'admin';
    }
}
