<?php

namespace App\Console\Commands;

use App\Services\MoodleImportService;
use Illuminate\Console\Command;

class ImportStudentsFromMoodle extends Command
{
    protected $signature = 'moodle:import-students
                            {--limit=0 : Limit number of students to import (0 = all)}
                            {--dry-run : Preview without creating records}
                            {--force : Skip confirmation prompt}';

    protected $description = 'Import students from Moodle LMS and create SIS accounts';

    public function handle(MoodleImportService $importService): int
    {
        $this->info('Starting Moodle Student Import...');
        $this->newLine();

        // Test connection first
        $connection = $importService->testConnection();
        if (!$connection['success']) {
            $this->error('Failed to connect to Moodle: ' . ($connection['error'] ?? 'Unknown error'));
            return Command::FAILURE;
        }

        $this->info("Connected to: {$connection['site_name']} (v{$connection['version']})");
        $this->newLine();

        // Get students from Moodle
        $this->info('Fetching students from Moodle...');
        $limit = (int) $this->option('limit');

        try {
            $moodleStudents = $importService->fetchMoodleStudents($limit);
        } catch (\Exception $e) {
            $this->error('Failed to fetch students: ' . $e->getMessage());
            return Command::FAILURE;
        }

        $count = count($moodleStudents);
        $this->info("Found {$count} students in Moodle.");
        $this->newLine();

        if ($count === 0) {
            $this->warn('No students to import.');
            return Command::SUCCESS;
        }

        // Show preview
        $this->table(
            ['Moodle ID', 'Username', 'Email', 'Name', 'Status'],
            array_map(fn($s) => [
                $s['id'],
                $s['username'],
                $s['email'] ?? 'N/A',
                ($s['firstname'] ?? '') . ' ' . ($s['lastname'] ?? ''),
                isset($s['suspended']) && $s['suspended'] ? 'Suspended' : 'Active',
            ], array_slice($moodleStudents, 0, 20))
        );

        if ($count > 20) {
            $this->info("... and " . ($count - 20) . " more students.");
        }
        $this->newLine();

        // Dry run mode
        if ($this->option('dry-run')) {
            $this->warn('DRY RUN MODE - No records will be created.');
            $this->newLine();

            $preview = $importService->previewImport($moodleStudents);
            $this->info("Preview Results:");
            $this->info("  - New students to create: {$preview['new']}");
            $this->info("  - Already exists (will skip): {$preview['existing']}");
            $this->info("  - Will update: {$preview['update']}");

            return Command::SUCCESS;
        }

        // Confirm import
        if (!$this->option('force')) {
            if (!$this->confirm("Do you want to import {$count} students?")) {
                $this->warn('Import cancelled.');
                return Command::SUCCESS;
            }
        }

        // Perform import
        $this->info('Importing students...');
        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $results = $importService->importStudents($moodleStudents, function () use ($bar) {
            $bar->advance();
        });

        $bar->finish();
        $this->newLine(2);

        // Show results
        $this->info('Import completed!');
        $this->newLine();
        $this->table(
            ['Status', 'Count'],
            [
                ['Created', $results['created']],
                ['Updated', $results['updated']],
                ['Skipped', $results['skipped']],
                ['Failed', $results['failed']],
            ]
        );

        if (!empty($results['errors'])) {
            $this->newLine();
            $this->warn('Errors encountered:');
            foreach (array_slice($results['errors'], 0, 10) as $error) {
                $this->error("  - {$error['username']}: {$error['message']}");
            }
            if (count($results['errors']) > 10) {
                $this->warn('  ... and ' . (count($results['errors']) - 10) . ' more errors.');
            }
        }

        return Command::SUCCESS;
    }
}
