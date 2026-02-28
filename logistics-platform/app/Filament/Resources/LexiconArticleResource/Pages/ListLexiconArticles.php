<?php
namespace App\Filament\Resources\LexiconArticleResource\Pages;
use App\Filament\Resources\LexiconArticleResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
class ListLexiconArticles extends ListRecords
{
    protected static string $resource = LexiconArticleResource::class;
    protected function getHeaderActions(): array { return [Actions\CreateAction::make()]; }
}
