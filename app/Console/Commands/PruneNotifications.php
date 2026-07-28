<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class PruneNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:prune-notifications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This command will remove read notifications that were read more than 15 days ago. Unread
    notifications are never removed';


    protected const DAYS_TO_KEEP_AFTER_READ = 15;

    /**
     * Execute the console command.
     */
    public function handle()
    {

        User::all()
            ->each(function (User $user) {
                $user->notifications()
                    ->whereNotNull('read_at')
                    ->where('read_at','<=',now()->subDays(self::DAYS_TO_KEEP_AFTER_READ))
                    ->delete();
            });
    }
}
