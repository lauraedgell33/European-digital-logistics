<?php

namespace App\Console\Commands;

use App\Search\ElasticsearchIndexConfig;
use Elastic\Elasticsearch\ClientBuilder;
use Illuminate\Console\Command;

class ConfigureSearchIndices extends Command
{
    protected $signature = 'scout:configure-indices
                            {--fresh : Drop existing indices before creating}
                            {--index= : Create only the specified index}';

    protected $description = 'Create/update Elasticsearch index settings and mappings for all searchable models';

    public function handle(): int
    {
        $host = config('scout.elasticsearch.hosts.0', 'localhost:9200');

        $this->info("Connecting to Elasticsearch at {$host}...");

        try {
            $client = ClientBuilder::create()
                ->setHosts([$host])
                ->build();

            $health = $client->cluster()->health();
            $this->info("Cluster status: {$health['status']}");
        } catch (\Exception $e) {
            $this->error("Cannot connect to Elasticsearch: {$e->getMessage()}");
            return self::FAILURE;
        }

        $prefix = config('scout.prefix', '');
        $configs = ElasticsearchIndexConfig::all();

        // Filter to specific index if requested
        if ($indexName = $this->option('index')) {
            if (!isset($configs[$indexName])) {
                $this->error("Unknown index: {$indexName}. Available: " . implode(', ', array_keys($configs)));
                return self::FAILURE;
            }
            $configs = [$indexName => $configs[$indexName]];
        }

        foreach ($configs as $name => $config) {
            $fullName = $prefix . $name;
            $exists = $client->indices()->exists(['index' => $fullName])->asBool();

            if ($this->option('fresh') && $exists) {
                $this->warn("Dropping index: {$fullName}");
                $client->indices()->delete(['index' => $fullName]);
                $exists = false;
            }

            if ($exists) {
                // Update settings (close → update → open)
                $this->info("Updating existing index: {$fullName}");

                try {
                    $client->indices()->close(['index' => $fullName]);
                    $client->indices()->putSettings([
                        'index' => $fullName,
                        'body' => ['settings' => $config['settings']],
                    ]);
                    $client->indices()->open(['index' => $fullName]);

                    $client->indices()->putMapping([
                        'index' => $fullName,
                        'body' => $config['mappings'],
                    ]);
                    $this->info("  ✓ Updated settings and mappings");
                } catch (\Exception $e) {
                    $this->error("  ✗ Failed to update: {$e->getMessage()}");
                    // Ensure index is reopened
                    try {
                        $client->indices()->open(['index' => $fullName]);
                    } catch (\Exception $ignored) {
                    }
                }
            } else {
                // Create new index
                $this->info("Creating index: {$fullName}");

                try {
                    $client->indices()->create([
                        'index' => $fullName,
                        'body' => [
                            'settings' => $config['settings'],
                            'mappings' => $config['mappings'],
                        ],
                    ]);
                    $this->info("  ✓ Created successfully");
                } catch (\Exception $e) {
                    $this->error("  ✗ Failed to create: {$e->getMessage()}");
                }
            }
        }

        $this->newLine();
        $this->info('Done! Run `php artisan scout:import` to index existing data.');

        return self::SUCCESS;
    }
}
