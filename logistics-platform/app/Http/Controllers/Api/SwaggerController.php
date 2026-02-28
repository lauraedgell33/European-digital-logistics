<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use OpenApi\Attributes as OA;

#[OA\Info(
    title: 'LogiMarket API - European Digital Logistics Platform',
    version: '1.0.0',
    description: 'Comprehensive REST API for the European Digital Logistics Marketplace.',
    contact: new OA\Contact(name: 'LogiMarket API Support', email: 'api@logimarket.eu', url: 'https://logimarket.eu/support'),
    license: new OA\License(name: 'Proprietary', url: 'https://logimarket.eu/terms')
)]
#[OA\Server(url: '/api/v1', description: 'Production API v1')]
#[OA\SecurityScheme(securityScheme: 'sanctum', type: 'http', scheme: 'bearer', bearerFormat: 'Sanctum Token', description: 'Bearer token from /auth/login')]
#[OA\Tag(name: 'Authentication', description: 'Register, login, logout, profile management')]
#[OA\Tag(name: 'Freight Exchange', description: 'Post and search freight offers across Europe')]
#[OA\Tag(name: 'Vehicle Exchange', description: 'Post and search vehicle/truck offers')]
#[OA\Tag(name: 'Transport Orders', description: 'Create and manage transport orders')]
#[OA\Tag(name: 'Tracking', description: 'Real-time shipment tracking with GPS')]
#[OA\Tag(name: 'Blockchain & eCMR', description: 'Electronic CMR and smart contracts')]
#[OA\Tag(name: 'Invoicing', description: 'Invoice creation, factoring, and management')]
#[OA\Tag(name: 'Payments', description: 'Payment processing, SEPA, refunds, exchange rates')]
#[OA\Tag(name: 'Health', description: 'System health check endpoints')]
#[OA\Schema(
    schema: 'ErrorResponse',
    required: ['message'],
    properties: [
        new OA\Property(property: 'message', type: 'string', example: 'The given data was invalid.'),
        new OA\Property(property: 'errors', type: 'object'),
    ]
)]
#[OA\Schema(
    schema: 'User',
    required: ['id', 'name', 'email', 'role'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'John Doe'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john@company.eu'),
        new OA\Property(property: 'role', type: 'string', enum: ['admin', 'manager', 'operator'], example: 'admin'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
    ]
)]
#[OA\Schema(
    schema: 'Company',
    required: ['id', 'name', 'type', 'country_code'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'Acme Logistics GmbH'),
        new OA\Property(property: 'type', type: 'string', enum: ['shipper', 'carrier', 'forwarder'], example: 'carrier'),
        new OA\Property(property: 'vat_number', type: 'string', example: 'DE123456789'),
        new OA\Property(property: 'country_code', type: 'string', example: 'DE'),
        new OA\Property(property: 'city', type: 'string', example: 'Berlin'),
    ]
)]
#[OA\Schema(
    schema: 'FreightOffer',
    required: ['id', 'origin_country', 'origin_city', 'destination_country', 'destination_city', 'cargo_type', 'weight'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'origin_country', type: 'string', example: 'DE'),
        new OA\Property(property: 'origin_city', type: 'string', example: 'Berlin'),
        new OA\Property(property: 'destination_country', type: 'string', example: 'FR'),
        new OA\Property(property: 'destination_city', type: 'string', example: 'Paris'),
        new OA\Property(property: 'cargo_type', type: 'string', example: 'general'),
        new OA\Property(property: 'weight', type: 'number', format: 'float', example: 12500),
        new OA\Property(property: 'price', type: 'number', format: 'float', example: 2500.00),
        new OA\Property(property: 'currency', type: 'string', example: 'EUR'),
        new OA\Property(property: 'status', type: 'string', enum: ['active', 'matched', 'completed', 'cancelled'], example: 'active'),
    ]
)]
#[OA\Schema(
    schema: 'TransportOrder',
    required: ['id', 'status'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'order_number', type: 'string', example: 'ORD-2026-001234'),
        new OA\Property(property: 'status', type: 'string', enum: ['pending', 'accepted', 'in_transit', 'delivered', 'cancelled'], example: 'pending'),
        new OA\Property(property: 'total_amount', type: 'number', format: 'float', example: 3200.00),
        new OA\Property(property: 'currency', type: 'string', example: 'EUR'),
    ]
)]
#[OA\Schema(
    schema: 'Invoice',
    properties: [
        new OA\Property(property: 'id', type: 'integer'),
        new OA\Property(property: 'invoice_number', type: 'string', example: 'INV-2026-001'),
        new OA\Property(property: 'status', type: 'string', enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled']),
        new OA\Property(property: 'total_amount', type: 'number', format: 'float'),
        new OA\Property(property: 'currency', type: 'string', example: 'EUR'),
    ]
)]
class SwaggerController extends Controller
{
    #[OA\Post(
        path: '/auth/register',
        summary: 'Register a new company and admin user',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email', 'password', 'password_confirmation', 'company_name', 'company_type', 'vat_number', 'country_code', 'city', 'address', 'postal_code'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'John Doe'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john@acme.eu'),
                    new OA\Property(property: 'password', type: 'string', format: 'password'),
                    new OA\Property(property: 'password_confirmation', type: 'string', format: 'password'),
                    new OA\Property(property: 'company_name', type: 'string', example: 'Acme Logistics GmbH'),
                    new OA\Property(property: 'company_type', type: 'string', enum: ['shipper', 'carrier', 'forwarder']),
                    new OA\Property(property: 'vat_number', type: 'string', example: 'DE123456789'),
                    new OA\Property(property: 'country_code', type: 'string', example: 'DE'),
                    new OA\Property(property: 'city', type: 'string', example: 'Berlin'),
                    new OA\Property(property: 'address', type: 'string', example: 'Musterstr. 1'),
                    new OA\Property(property: 'postal_code', type: 'string', example: '10115'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Registered successfully'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function register() {}

    #[OA\Post(
        path: '/auth/login',
        summary: 'Login and receive a bearer token',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'admin@logistics.eu'),
                    new OA\Property(property: 'password', type: 'string', format: 'password'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Login successful'),
            new OA\Response(response: 422, description: 'Invalid credentials'),
        ]
    )]
    public function login() {}

    #[OA\Post(
        path: '/auth/logout',
        summary: 'Logout and revoke current token',
        security: [['sanctum' => []]],
        tags: ['Authentication'],
        responses: [new OA\Response(response: 200, description: 'Logged out')]
    )]
    public function logout() {}

    #[OA\Get(
        path: '/auth/profile',
        summary: 'Get authenticated user profile',
        security: [['sanctum' => []]],
        tags: ['Authentication'],
        responses: [new OA\Response(response: 200, description: 'User profile')]
    )]
    public function profile() {}

    #[OA\Get(
        path: '/freight',
        summary: 'List freight offers with filtering',
        security: [['sanctum' => []]],
        tags: ['Freight Exchange'],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'origin_country', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'destination_country', in: 'query', schema: new OA\Schema(type: 'string')),
        ],
        responses: [new OA\Response(response: 200, description: 'Paginated freight list')]
    )]
    public function listFreight() {}

    #[OA\Post(
        path: '/freight',
        summary: 'Create a new freight offer',
        security: [['sanctum' => []]],
        tags: ['Freight Exchange'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/FreightOffer')),
        responses: [new OA\Response(response: 201, description: 'Freight offer created')]
    )]
    public function createFreight() {}

    #[OA\Post(
        path: '/freight/search',
        summary: 'Search freight offers with advanced filters',
        security: [['sanctum' => []]],
        tags: ['Freight Exchange'],
        responses: [new OA\Response(response: 200, description: 'Search results')]
    )]
    public function searchFreight() {}

    #[OA\Get(
        path: '/orders',
        summary: 'List transport orders',
        security: [['sanctum' => []]],
        tags: ['Transport Orders'],
        responses: [new OA\Response(response: 200, description: 'Paginated orders list')]
    )]
    public function listOrders() {}

    #[OA\Post(
        path: '/orders',
        summary: 'Create a transport order',
        security: [['sanctum' => []]],
        tags: ['Transport Orders'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/TransportOrder')),
        responses: [new OA\Response(response: 201, description: 'Order created')]
    )]
    public function createOrder() {}

    #[OA\Get(
        path: '/orders/stats/overview',
        summary: 'Get order statistics overview',
        security: [['sanctum' => []]],
        tags: ['Transport Orders'],
        responses: [new OA\Response(response: 200, description: 'Order statistics')]
    )]
    public function orderStats() {}

    #[OA\Get(
        path: '/tracking/{trackingCode}',
        summary: 'Track a shipment by tracking code',
        tags: ['Tracking'],
        parameters: [new OA\Parameter(name: 'trackingCode', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
        responses: [
            new OA\Response(response: 200, description: 'Shipment tracking data'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function trackShipment() {}

    #[OA\Get(
        path: '/tracking/active',
        summary: 'Get all active shipments',
        security: [['sanctum' => []]],
        tags: ['Tracking'],
        responses: [new OA\Response(response: 200, description: 'Active shipments list')]
    )]
    public function activeShipments() {}

    #[OA\Post(
        path: '/ecmr',
        summary: 'Create an electronic CMR document',
        security: [['sanctum' => []]],
        tags: ['Blockchain & eCMR'],
        responses: [new OA\Response(response: 201, description: 'eCMR created')]
    )]
    public function createEcmr() {}

    #[OA\Get(
        path: '/invoices',
        summary: 'List invoices',
        security: [['sanctum' => []]],
        tags: ['Invoicing'],
        parameters: [new OA\Parameter(name: 'status', in: 'query', schema: new OA\Schema(type: 'string'))],
        responses: [new OA\Response(response: 200, description: 'Paginated invoices')]
    )]
    public function listInvoices() {}

    #[OA\Post(
        path: '/invoices',
        summary: 'Create a new invoice',
        security: [['sanctum' => []]],
        tags: ['Invoicing'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/Invoice')),
        responses: [new OA\Response(response: 201, description: 'Invoice created')]
    )]
    public function createInvoice() {}

    #[OA\Get(
        path: '/payments/history',
        summary: 'Get payment history',
        security: [['sanctum' => []]],
        tags: ['Payments'],
        responses: [new OA\Response(response: 200, description: 'Payment transactions')]
    )]
    public function paymentHistory() {}

    #[OA\Get(
        path: '/payments/exchange-rates',
        summary: 'Get current EUR exchange rates',
        security: [['sanctum' => []]],
        tags: ['Payments'],
        responses: [new OA\Response(response: 200, description: 'Exchange rate data')]
    )]
    public function exchangeRates() {}

    #[OA\Get(
        path: '/health',
        summary: 'Basic health check',
        tags: ['Health'],
        responses: [new OA\Response(response: 200, description: 'System is healthy')]
    )]
    public function health() {}
}
