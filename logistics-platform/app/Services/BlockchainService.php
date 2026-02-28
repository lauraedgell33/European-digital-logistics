<?php

namespace App\Services;

use App\Models\EcmrDocument;
use App\Models\SmartContract;
use App\Models\DigitalIdentity;
use App\Models\TransportOrder;

class BlockchainService
{
    /**
     * Create a new eCMR document.
     */
    public function createEcmr(array $data, int $createdBy): EcmrDocument
    {
        $data['ecmr_number'] = EcmrDocument::generateNumber();
        $data['created_by'] = $createdBy;
        $data['status'] = 'draft';
        $data['status_history'] = [['status' => 'draft', 'at' => now()->toIso8601String(), 'by' => $createdBy]];

        return EcmrDocument::create($data);
    }

    /**
     * Sign an eCMR document digitally.
     */
    public function signEcmr(EcmrDocument $ecmr, string $role, int $userId): EcmrDocument
    {
        $signatureHash = hash('sha256', $ecmr->id . $role . $userId . now()->timestamp);
        $field = "{$role}_signature_hash";
        $timeField = "{$role}_signed_at";

        $ecmr->update([
            $field => $signatureHash,
            $timeField => now(),
        ]);

        // Update status based on signatures
        if ($ecmr->sender_signature_hash && !$ecmr->carrier_signature_hash) {
            $this->updateEcmrStatus($ecmr, 'issued', $userId);
        } elseif ($ecmr->carrier_signature_hash && !$ecmr->consignee_signature_hash) {
            $this->updateEcmrStatus($ecmr, 'in_transit', $userId);
        } elseif ($ecmr->isFullySigned()) {
            $this->updateEcmrStatus($ecmr, 'completed', $userId);
            $this->recordOnBlockchain($ecmr);
        }

        return $ecmr->fresh();
    }

    /**
     * Record eCMR on simulated blockchain.
     */
    public function recordOnBlockchain(EcmrDocument $ecmr): EcmrDocument
    {
        $documentHash = hash('sha256', json_encode([
            'ecmr_number' => $ecmr->ecmr_number,
            'sender' => $ecmr->sender_name,
            'carrier' => $ecmr->carrier_name,
            'consignee' => $ecmr->consignee_name,
            'goods' => $ecmr->goods_description,
            'weight' => $ecmr->gross_weight_kg,
            'signatures' => [
                $ecmr->sender_signature_hash,
                $ecmr->carrier_signature_hash,
                $ecmr->consignee_signature_hash,
            ],
        ]));

        $ecmr->update([
            'blockchain_tx_hash' => '0x' . $documentHash,
            'blockchain_network' => 'LogiChain-L2',
            'blockchain_metadata' => [
                'block_number' => rand(1000000, 9999999),
                'timestamp' => now()->timestamp,
                'gas_used' => rand(21000, 50000),
                'document_hash' => $documentHash,
                'network' => 'LogiChain Layer 2',
            ],
            'ipfs_hash' => 'Qm' . substr(hash('sha256', $ecmr->ecmr_number . time()), 0, 44),
        ]);

        return $ecmr->fresh();
    }

    /**
     * Create a smart contract for automated logistics.
     */
    public function createSmartContract(array $data): SmartContract
    {
        $data['contract_hash'] = SmartContract::generateHash();
        $data['status'] = 'pending';

        return SmartContract::create($data);
    }

    /**
     * Check and execute smart contract conditions.
     */
    public function evaluateContract(SmartContract $contract): SmartContract
    {
        $conditions = $contract->conditions;
        $conditionMet = false;

        foreach ($conditions as $condition) {
            switch ($condition['type'] ?? '') {
                case 'delivery_confirmed':
                    if ($contract->transport_order_id) {
                        $order = TransportOrder::find($contract->transport_order_id);
                        $conditionMet = $order && $order->status === 'delivered';
                    }
                    break;
                case 'date_reached':
                    $conditionMet = now()->gte($condition['date'] ?? now());
                    break;
                case 'document_signed':
                    if (isset($condition['ecmr_id'])) {
                        $ecmr = EcmrDocument::find($condition['ecmr_id']);
                        $conditionMet = $ecmr && $ecmr->isFullySigned();
                    }
                    break;
                default:
                    $conditionMet = false;
            }
        }

        if ($conditionMet && !$contract->condition_met) {
            $contract->update([
                'condition_met' => true,
                'triggered_at' => now(),
                'status' => 'triggered',
            ]);

            // Execute actions
            $this->executeContractActions($contract);
        }

        return $contract->fresh();
    }

    private function executeContractActions(SmartContract $contract): void
    {
        $log = [];
        foreach ($contract->actions as $action) {
            $log[] = [
                'action' => $action['type'] ?? 'unknown',
                'executed_at' => now()->toIso8601String(),
                'result' => 'success',
                'details' => "Action '{$action['type']}' executed automatically",
            ];
        }

        $contract->update([
            'action_executed' => true,
            'executed_at' => now(),
            'execution_log' => $log,
            'status' => 'executed',
        ]);
    }

    /**
     * Create or get digital identity for a company.
     */
    public function getOrCreateIdentity(int $companyId, ?int $userId = null): DigitalIdentity
    {
        return DigitalIdentity::firstOrCreate(
            ['company_id' => $companyId],
            [
                'user_id' => $userId,
                'did_identifier' => DigitalIdentity::generateDid($companyId),
                'verification_level' => 'basic',
                'credentials' => ['company_registration' => true],
                'is_verified' => false,
                'public_key_hash' => hash('sha256', $companyId . uniqid()),
            ]
        );
    }

    /**
     * Verify a digital identity.
     */
    public function verifyIdentity(DigitalIdentity $identity, string $level, array $documents = []): DigitalIdentity
    {
        $identity->update([
            'verification_level' => $level,
            'is_verified' => true,
            'verified_at' => now(),
            'verified_by' => 'LogiMarket KYC System',
            'verification_documents' => $documents,
            'expires_at' => now()->addYear(),
            'attestations' => array_merge($identity->attestations ?? [], [
                ['type' => $level, 'issued_at' => now()->toIso8601String(), 'issuer' => 'LogiMarket'],
            ]),
        ]);

        return $identity->fresh();
    }

    private function updateEcmrStatus(EcmrDocument $ecmr, string $status, int $userId): void
    {
        $history = $ecmr->status_history ?? [];
        $history[] = ['status' => $status, 'at' => now()->toIso8601String(), 'by' => $userId];
        $ecmr->update(['status' => $status, 'status_history' => $history]);
    }
}
