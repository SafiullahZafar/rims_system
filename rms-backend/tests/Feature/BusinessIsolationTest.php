<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Employee;
use App\Models\MenuItem;
use App\Models\Role;
use App\Models\RestaurantTable;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class BusinessIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_business_users_cannot_read_another_business_data(): void
    {
        [$firstBusiness, $firstOwner] = $this->createOwner('first');
        [$secondBusiness, $secondOwner] = $this->createOwner('second');
        $firstItem = MenuItem::create([
            'business_id' => $firstBusiness->id,
            'name' => 'First item',
            'category' => 'Food',
            'price' => 10,
        ]);
        $secondItem = MenuItem::create([
            'business_id' => $secondBusiness->id,
            'name' => 'Second item',
            'category' => 'Food',
            'price' => 20,
        ]);

        $this->actingAs($firstOwner, 'sanctum')
            ->getJson('/api/menu-items')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $firstItem->id);

        $this->getJson('/api/menu-items/'.$secondItem->id)->assertNotFound();
        $this->getJson('/api/employees/'.$secondOwner->id)->assertNotFound();
    }

    public function test_super_admin_can_create_business_accounts_but_not_use_business_api(): void
    {
        config(['rims.super_admin' => 'root']);
        [, $root] = $this->createSuperAdmin();

        $this->actingAs($root, 'sanctum')
            ->getJson('/api/menu-items')
            ->assertForbidden();

        $this->postJson('/api/super-admin/businesses', [
            'business_name' => 'New Restaurant',
            'owner_name' => 'New Owner',
            'email' => 'new-owner@example.com',
            'password' => 'safe-password-123',
            'password_confirmation' => 'safe-password-123',
        ])->assertCreated()
            ->assertJsonPath('owner.email', 'new-owner@example.com');

        $this->assertDatabaseHas('businesses', ['name' => 'New Restaurant', 'is_demo' => false]);
        $this->assertDatabaseHas('employees', ['email' => 'new-owner@example.com', 'is_super_admin' => false]);

        $this->postJson('/api/login', [
            'type' => 'admin',
            'email' => 'new-owner@example.com',
            'password' => 'safe-password-123',
        ])->assertOk()->assertJsonPath('account_type', 'business');
    }

    public function test_seeded_demo_data_does_not_overwrite_migrated_business_records(): void
    {
        config([
            'rims.super_admin' => 'RootUser',
        ]);
        [, $root] = $this->createSuperAdmin();
        $root->update(['name' => 'RootUser', 'username' => 'RootUser']);
        $legacyBusiness = Business::query()->where('slug', 'migrated-rims-workspace')->firstOrFail();
        $demoBusiness = Business::query()->where('is_demo', true)->firstOrFail();
        RestaurantTable::create([
            'id' => 1,
            'business_id' => $legacyBusiness->id,
            'seats' => 2,
            'section' => 'Legacy',
        ]);
        MenuItem::create([
            'id' => 1,
            'business_id' => $legacyBusiness->id,
            'name' => 'Legacy menu item',
            'category' => 'Food',
            'price' => 5,
        ]);

        (new DatabaseSeeder())->run();

        $this->assertDatabaseHas('restaurant_tables', [
            'id' => 1,
            'business_id' => $legacyBusiness->id,
        ]);
        $this->assertDatabaseHas('restaurant_tables', [
            'table_number' => 1,
            'business_id' => $demoBusiness->id,
        ]);
        $this->assertDatabaseHas('menu_items', [
            'name' => 'Southwest Scramble Bowl',
            'business_id' => $demoBusiness->id,
        ]);
        $this->assertDatabaseHas('menu_items', [
            'id' => 1,
            'name' => 'Legacy menu item',
            'business_id' => $legacyBusiness->id,
        ]);

        $this->assertDatabaseHas('employees', [
            'email' => 'root@example.com',
            'is_super_admin' => true,
        ]);

        $rootLogin = $this->postJson('/api/login', [
            'type' => 'admin',
            'email' => 'root@example.com',
            'password' => 'password123',
        ])->assertOk()->assertJsonPath('is_super_admin', true);
        $this->withToken($rootLogin->json('token'))
            ->getJson('/api/super-admin/businesses')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Migrated RIMS Workspace']);
    }

    public function test_business_user_actions_are_not_added_to_demo_activity(): void
    {
        $this->createOwner('owner');
        $ownerLogin = $this->postJson('/api/login', [
            'type' => 'admin',
            'email' => 'owner@example.com',
            'password' => 'password123',
        ])->assertOk();

        $this->withToken($ownerLogin->json('token'))->getJson('/api/menu-items')->assertOk();
        $this->assertDatabaseCount('demo_activity_logs', 0);
    }

    public function test_demo_visitors_are_passwordless_and_only_their_activity_is_audited(): void
    {
        $demoBusiness = Business::query()->where('is_demo', true)->firstOrFail();
        Role::create([
            'business_id' => $demoBusiness->id,
            'name' => 'Owner',
            'permissions' => ['/admin', '/settings'],
        ]);
        MenuItem::create([
            'business_id' => $demoBusiness->id,
            'name' => 'Demo item',
            'category' => 'Food',
            'price' => 10,
        ]);

        $demoLogin = $this->postJson('/api/demo/login')->assertCreated()->assertJsonPath('is_demo', true);
        $demoToken = $demoLogin->json('token');

        $this->withToken($demoToken)->getJson('/api/menu-items')->assertOk();
        $this->withToken($demoToken)->getJson('/api/roles')->assertOk();

        config(['rims.super_admin' => 'root']);
        [, $root] = $this->createSuperAdmin();
        $this->actingAs($root, 'sanctum')
            ->getJson('/api/super-admin/demo-activity')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.visitor', 'demouser_1')
            ->assertJsonPath('0.path', 'api/roles')
            ->assertJsonFragment(['path' => 'api/menu-items']);

        $this->assertDatabaseHas('demo_visitors', [
            'business_id' => $demoBusiness->id,
            'name' => 'demouser_1',
        ]);
    }

    private function createOwner(string $label): array
    {
        $business = Business::create([
            'name' => ucfirst($label).' Restaurant',
            'slug' => $label.'-restaurant',
            'is_demo' => false,
            'is_active' => true,
        ]);
        $role = Role::create([
            'business_id' => $business->id,
            'name' => 'Owner',
            'permissions' => ['/admin', '/settings'],
        ]);
        $owner = Employee::create([
            'business_id' => $business->id,
            'name' => ucfirst($label).' Owner',
            'email' => $label.'@example.com',
            'password' => 'password123',
            'role_id' => $role->id,
            'is_active' => true,
        ]);

        return [$business, $owner];
    }

    private function createSuperAdmin(): array
    {
        $business = Business::create([
            'name' => 'Root Business',
            'slug' => 'root-business',
            'is_demo' => false,
            'is_active' => true,
        ]);
        $root = Employee::create([
            'business_id' => null,
            'name' => 'Root',
            'username' => 'root',
            'email' => 'root@example.com',
            'password' => 'password123',
            'is_active' => true,
            'is_super_admin' => true,
        ]);

        return [$business, $root];
    }
}
