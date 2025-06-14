<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Lab Reservation Request</title>
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
            background-color: #4f46e5;
            padding: 20px;
            text-align: center;
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
        <div class="header">
            <h1>New Lab Reservation Request</h1>
        </div>

        <div class="content">
            <p>Hello Administrator,</p>

            <p>A new lab reservation request requires your approval:</p>

            <div class="info-box">
                <h3>Reservation Details:</h3>
                <p><strong>Requester:</strong> {{ $reservation->user->name }}</p>
                <p><strong>Role:</strong> {{ ucfirst($reservation->user->roles->first()->name ?? 'student') }}</p>
                <p><strong>Email:</strong> {{ $reservation->user->email }}</p>
                <p><strong>Lab:</strong> {{ $reservation->lab->name }}</p>
                <p><strong>Date:</strong> {{ \Carbon\Carbon::parse($reservation->date)->format('D, d M Y') }}</p>
                <p><strong>Time:</strong> {{ substr($reservation->start_time, 0, 5) }} - {{ substr($reservation->end_time, 0, 5) }}</p>
                <p><strong>Purpose:</strong> {{ $reservation->purpose }}</p>
                @if(isset($reservation->participant_count))
                <p><strong>Participant Count:</strong> {{ $reservation->participant_count }}</p>
                @endif
            </div>

            @if(!empty($reservation->notes))
            <div class="info-box">
                <h3>Additional Notes:</h3>
                <p>{{ $reservation->notes }}</p>
            </div>
            @endif

            <p style="text-align: center; margin-top: 30px;">
                <a href="{{ url('/admin/reservations/' . $reservation->id) }}" class="button">
                    Review Reservation
                </a>
            </p>

            <p>Please log in to the system to review this request.</p>

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
