<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class DatabaseBackup extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'db:backup
                            {--upload : Upload the backup to S3 after creation}';

    /**
     * The console command description.
     */
    protected $description = 'Backup the MySQL database, compress with gzip, and store in storage/app/backups';

    /**
     * Maximum number of backups to keep.
     */
    protected int $maxBackups = 30;

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting database backup...');

        $dbHost     = config('database.connections.mysql.host', '127.0.0.1');
        $dbPort     = config('database.connections.mysql.port', '3306');
        $dbName     = config('database.connections.mysql.database');
        $dbUser     = config('database.connections.mysql.username');
        $dbPassword = config('database.connections.mysql.password');

        $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
        $filename  = "backup_{$dbName}_{$timestamp}.sql.gz";

        $backupDir = storage_path('app/backups');

        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        $filePath = "{$backupDir}/{$filename}";

        // Build mysqldump command
        $command = sprintf(
            'mysqldump --host=%s --port=%s --user=%s --password=%s --single-transaction --routines --triggers --quick %s | gzip > %s',
            escapeshellarg($dbHost),
            escapeshellarg($dbPort),
            escapeshellarg($dbUser),
            escapeshellarg($dbPassword),
            escapeshellarg($dbName),
            escapeshellarg($filePath)
        );

        $this->info("Dumping database: {$dbName}");

        $returnCode = null;
        $output     = [];
        exec($command . ' 2>&1', $output, $returnCode);

        if ($returnCode !== 0) {
            $errorMsg = 'Database backup failed: ' . implode("\n", $output);
            $this->error($errorMsg);
            Log::error($errorMsg);

            return self::FAILURE;
        }

        $fileSize = filesize($filePath);
        $humanSize = $this->humanFileSize($fileSize);

        $this->info("Backup created: {$filename} ({$humanSize})");
        Log::info("Database backup created successfully", [
            'file'     => $filename,
            'size'     => $humanSize,
            'database' => $dbName,
        ]);

        // Upload to S3 if requested
        if ($this->option('upload')) {
            $this->uploadToS3($filePath, $filename);
        }

        // Clean up old backups
        $this->cleanOldBackups($backupDir);

        $this->info('Database backup completed successfully.');

        return self::SUCCESS;
    }

    /**
     * Upload backup file to S3.
     */
    protected function uploadToS3(string $filePath, string $filename): void
    {
        $this->info('Uploading backup to S3...');

        try {
            $s3Path = 'backups/database/' . $filename;
            Storage::disk('s3')->put($s3Path, fopen($filePath, 'r'));

            $this->info("Backup uploaded to S3: {$s3Path}");
            Log::info("Database backup uploaded to S3", ['path' => $s3Path]);
        } catch (\Exception $e) {
            $this->error("S3 upload failed: {$e->getMessage()}");
            Log::error("S3 backup upload failed", [
                'error' => $e->getMessage(),
                'file'  => $filename,
            ]);
        }
    }

    /**
     * Remove old backups keeping only the most recent ones.
     */
    protected function cleanOldBackups(string $backupDir): void
    {
        $files = glob("{$backupDir}/backup_*.sql.gz");

        if ($files === false || count($files) <= $this->maxBackups) {
            return;
        }

        // Sort by modification time (oldest first)
        usort($files, fn($a, $b) => filemtime($a) - filemtime($b));

        $toDelete = array_slice($files, 0, count($files) - $this->maxBackups);

        foreach ($toDelete as $file) {
            unlink($file);
            $this->line("Deleted old backup: " . basename($file));
        }

        $deletedCount = count($toDelete);
        Log::info("Cleaned up {$deletedCount} old database backup(s)");
    }

    /**
     * Convert bytes to human-readable file size.
     */
    protected function humanFileSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }
}
