<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lab Reservation Status Update</title>
    <style>
        /* Base styles */
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
        }

        /* Container */
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }

        /* Header */
        .header {
            padding: 20px;
            text-align: center;
        }

        .header.approved {
            background-color: #10b981;
        }

        .header.rejected {
            background-color: #ef4444;
        }

        .header.default {
            background-color: #3b82f6;
        }

        .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
        }

        /* Content */
        .content {
            padding: 30px 20px;
        }

        /* Status badge */
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 4px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
        }

        .status-badge.approved {
            background-color: #d1fae5;
            color: #065f46;
        }

        .status-badge.rejected {
            background-color: #fee2e2;
            color: #b91c1c;
        }

        /* Info Box */
        .info-box {
            background-color: #f8fafc;
            border-left: 4px solid #4f46e5;
            padding: 15px;
            margin: 20px 0;
        }

        .info-box h3 {
            margin-top: 0;
            color: #4f46e5;
        }

        /* Button */
        .button {
            display: inline-block;
            background-color: #4f46e5;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
        }

        /* Footer */
        .footer {
            background-color: #f1f5f9;
            padding: 15px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }

        /* Responsive adjustments */
        @media screen and (max-width: 600px) {
            .container {
                width: 100%;
            }
            .content {
                padding: 20px 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header {{ $status }}">
            <h1>Lab Reservation {{ ucfirst($status) }}</h1>
        </div>

        <div class="content">
            <p>Hello {{ $reservation->user->name }},</p>

            <span class="status-badge {{ $status }}">{{ ucfirst($status) }}</span>

            @if(is_string($message))
            <p>{{ $message }}</p>
            @endif

            <div class="info-box">
                <h3>Reservation Details:</h3>
                <p><strong>Lab:</strong> {{ $reservation->lab->name }}</p>
                <p><strong>Date:</strong> {{ \Carbon\Carbon::parse($reservation->date)->format('D, d M Y') }}</p>
                <p><strong>Time:</strong> {{ substr($reservation->start_time, 0, 5) }} - {{ substr($reservation->end_time, 0, 5) }}</p>
                <p><strong>Purpose:</strong> {{ $reservation->purpose }}</p>
            </div>

            @if($status === 'approved')
            <div class="info-box">
                <h3>Important Information:</h3>
                <p>Your reservation has been approved. Please arrive on time and make sure to follow all lab regulations.</p>
                <p>If you need to cancel your reservation, please do so at least 24 hours in advance.</p>
            </div>
            @endif

            @if($status === 'rejected' && isset($reservation->admin_notes))
            <div class="info-box">
                <h3>Additional Notes:</h3>
                <p>{{ $reservation->admin_notes }}</p>
            </div>
            @endif

            <p style="text-align: center; margin-top: 30px;">
                @php
                    $role = $reservation->user->roles->first()->name ?? 'student';
                    $route = match ($role) {
                        'admin' => 'admin.reservations.show',
                        'lecturer' => 'lecturer.reservations.show',
                        default => 'student.reservations.show',
                    };
                @endphp
                <a href="{{ route($route, $reservation->id) }}" class="button">
                    View Reservation Details
                </a>
            </p>

            @if($status === 'rejected')
            <p>If you have questions about why your reservation was rejected, please contact the administrator.</p>
            @endif

            <p>Thank you,<br>
            Lab Reservation System</p>
        </div>

        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
