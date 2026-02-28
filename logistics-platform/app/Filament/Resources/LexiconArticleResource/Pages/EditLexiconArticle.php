<?php
namespace App\Filament\Resources\LexiconArticleResource\Pages;
use App\Filament\Resources\LexiconArticleResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
class EditLexiconArticle extends EditRecord
{
    protected static string $resource = LexiconArticleResource::class;
    protected function getHeaderActions(): array { return [Actions\DeleteAction::make()]; }
}
