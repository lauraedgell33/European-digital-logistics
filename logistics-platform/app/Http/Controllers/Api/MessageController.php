<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Message\StartConversationRequest;
use App\Http\Requests\Message\SendMessageRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Events\NewMessageSent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MessageController extends Controller
{
    /**
     * List conversations for the authenticated user.
     */
    public function conversations(Request $request): JsonResponse
    {
        $conversations = Conversation::whereHas('participants', function ($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })
        ->with([
            'participants:id,name,email',
            'participants.company:id,name',
            'latestMessage.sender:id,name',
        ])
        ->withCount(['messages as unread_count' => function ($q) use ($request) {
            $userId = $request->user()->id;

            $q->where('messages.user_id', '!=', $userId)
              ->where('messages.created_at', '>', function ($sub) use ($userId) {
                  $sub->select('last_read_at')
                      ->from('conversation_participants')
                      ->where('user_id', $userId)
                      ->whereColumn('conversation_id', 'conversations.id')
                      ->limit(1);
              });
        }])
        ->orderByDesc(
            Message::select('created_at')
                ->whereColumn('conversation_id', 'conversations.id')
                ->latest()
                ->limit(1)
        )
        ->paginate(20);

        return response()->json($conversations);
    }

    /**
     * Get or create a direct conversation with another user.
     */
    public function startConversation(StartConversationRequest $request): JsonResponse
    {
        $userId = $request->user()->id;
        $recipientId = $request->recipient_id;

        if ($userId == $recipientId) {
            return response()->json(['message' => 'Cannot start conversation with yourself'], 422);
        }

        $conversation = null;
        if (!$request->reference_type) {
            $conversation = Conversation::where('type', $request->type ?? 'direct')
                ->whereNull('reference_type')
                ->whereHas('participants', function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                })
                ->whereHas('participants', function ($q) use ($recipientId) {
                    $q->where('user_id', $recipientId);
                })
                ->first();
        }

        if (!$conversation) {
            $conversation = Conversation::create([
                'subject' => $request->subject,
                'type' => $request->type ?? 'direct',
                'reference_type' => $request->reference_type,
                'reference_id' => $request->reference_id,
                'created_by' => $userId,
            ]);

            $conversation->participants()->attach([
                $userId => ['last_read_at' => now()],
                $recipientId => [],
            ]);
        }

        $message = $conversation->messages()->create([
            'user_id' => $userId,
            'body' => $request->message,
            'type' => 'text',
        ]);

        NewMessageSent::dispatch($message->load('sender:id,name,email'));

        $conversation->participants()->updateExistingPivot($userId, ['last_read_at' => now()]);

        $conversation->load([
            'participants:id,name,email',
            'latestMessage.sender:id,name',
        ]);

        return (new ConversationResource($conversation))
            ->additional(['message' => 'Conversation started'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Get messages for a conversation.
     */
    public function messages(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);

        $messages = $conversation->messages()
            ->with('sender:id,name,email')
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        $conversation->participants()->updateExistingPivot($request->user()->id, [
            'last_read_at' => now(),
        ]);

        return MessageResource::collection($messages)->response();
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(SendMessageRequest $request, Conversation $conversation): JsonResponse
    {
        $message = $conversation->messages()->create([
            'user_id' => $request->user()->id,
            'body' => $request->body,
            'type' => $request->type ?? 'text',
            'metadata' => $request->metadata,
        ]);

        $conversation->participants()->updateExistingPivot($request->user()->id, [
            'last_read_at' => now(),
        ]);

        $message->load('sender:id,name,email');

        NewMessageSent::dispatch($message);

        return (new MessageResource($message))->response()->setStatusCode(201);
    }

    /**
     * Mark conversation as read.
     */
    public function markRead(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('markRead', $conversation);

        $conversation->participants()->updateExistingPivot($request->user()->id, [
            'last_read_at' => now(),
        ]);

        return response()->json(['message' => 'Marked as read']);
    }

    /**
     * Get total unread count across all conversations.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $conversations = Conversation::whereHas('participants', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        })->get();

        $total = 0;
        foreach ($conversations as $conv) {
            $total += $conv->unreadCountFor($request->user());
        }

        return response()->json(['unread_count' => $total]);
    }
}
