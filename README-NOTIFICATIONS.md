# Lab Reservation Notification System

This document explains how to set up and use the notification system in the Lab Reservation application.

## Overview

The notification system sends alerts through multiple channels when:
1. A student or lecturer submits a new reservation request
2. An admin approves or rejects a reservation

## Features

- **Multi-channel notifications**: Email, database (in-app), and real-time broadcast
- **Queue-based processing**: All notifications are queued for better performance
- **Role-based targeting**: Notifications are sent to specific user roles
- **Real-time updates**: Using Laravel Echo and Reverb for instant notifications

## Setup Instructions

### 1. Database Configuration

Ensure you have run the migrations to create the necessary tables:

```bash
php artisan migrate
```

This will create the `notifications` and `jobs` tables required for the system.

### 2. Queue Configuration

The notifications are queued for better performance. Make sure your `.env` file has:

```
QUEUE_CONNECTION=database
```

### 3. Start the Queue Worker

To process the queued notifications, run:

```bash
# Basic worker
php artisan queue:work

# With specific options
php artisan queue:work --tries=3 --timeout=60
```

For production, use a process manager like Supervisor to keep the queue worker running:

```
[program:laravel-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/reservasi-labs-apps/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/worker.log
stopwaitsecs=3600
```

### 4. Email Configuration

Update your `.env` file with your email provider settings:

```
MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=your_smtp_port
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="reservations@yourdomain.com"
MAIL_FROM_NAME="Lab Reservation System"
```

### 5. Broadcasting Setup

For real-time notifications, ensure your `.env` has the correct broadcasting settings:

```
BROADCAST_DRIVER=reverb
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=your_app_key
REVERB_APP_SECRET=your_app_secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

Start the Reverb server:

```bash
php artisan reverb:start
```

## How It Works

### Notification Classes

1. **ReservationSubmittedNotification**: Sent to admins when a new reservation is submitted
   - Channels: mail, database, broadcast
   - Data: Requester details, lab, date, time, purpose

2. **ReservationStatusNotification**: Sent to users when their reservation status changes
   - Channels: mail, database, broadcast
   - Data: Status (approved/rejected), lab, date, time, admin notes

### Implementation Details

#### Sending Notifications to Admins

```php
// Get all users with admin role using Spatie's permission package
$admins = User::role('admin')->get();

// Efficiently send notifications to all admins
Notification::send($admins, new ReservationSubmittedNotification($reservation));
```

#### Sending Notifications to a Specific User

```php
// Send notification to the reservation owner
$reservation->user->notify(new ReservationStatusNotification($reservation, 'approved', 'Your reservation has been approved'));
```

## Best Practices

1. **Always Load Relationships**: Before sending notifications, make sure to load any relationships needed:
   ```php
   $reservation->load(['user', 'lab']);
   ```

2. **Use Notification Facade**: For sending to multiple users, use the `Notification::send()` method instead of looping through users.

3. **Keep Queues Running**: Ensure your queue workers are always running in production.

4. **Monitor Failed Jobs**: Check the `failed_jobs` table periodically for any issues.

5. **Testing Notifications**: Use `Notification::fake()` in your tests to verify notification logic without sending actual emails.

## Troubleshooting

- **Emails not being sent?** Check your mail configuration and the `failed_jobs` table.
- **Queue not processing?** Make sure the queue worker is running.
- **Real-time notifications not working?** Verify your Reverb/Echo setup and check browser console for errors.

## Extending the System

To add new notification types:

1. Create a new notification class:
   ```bash
   php artisan make:notification YourNotificationName
   ```

2. Implement the necessary methods (`via`, `toMail`, `toArray`, `toBroadcast`, etc.)

3. Use it in your controllers as needed. 
