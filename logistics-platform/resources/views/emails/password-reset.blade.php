<x-mail::message>
# Password Reset Request

Hello {{ $userName }},

We received a request to reset the password for your LogiMarket account. Click the button below to set a new password:

<x-mail::button :url="$resetUrl" color="primary">
Reset Password
</x-mail::button>

<x-mail::panel>
This password reset link will expire in **60 minutes**. If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
</x-mail::panel>

If the button above doesn't work, copy and paste this URL into your browser:

<x-mail::subcopy>
{{ $resetUrl }}
</x-mail::subcopy>

Best regards,<br>
The LogiMarket Team
</x-mail::message>
