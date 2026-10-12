<?php

namespace Database\Seeders;

use App\Models\AttendanceLog;
use App\Models\Business;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\KitchenOrder;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\RestaurantTable;
use App\Models\Role;
use App\Models\Supply;
use App\Models\SupplyLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $demoBusinessId = DB::table('businesses')->where('is_demo', true)->value('id');
        if (! $demoBusinessId) {
            throw new \RuntimeException('The demo business is missing. Run the business tenancy migration first.');
        }
        $this->seedDemoWorkspace((int) $demoBusinessId);
        $this->seedConfiguredSuperAdmin();
    }

    private function seedDemoWorkspace(int $demoBusinessId): void
    {

        // ── 1. Roles ───────────────────────────────────────────────────────────
        $allPermissions = ['/dashboard', '/tables', '/order', '/payment', '/kitchen', '/settings', '/employees', '/customers', '/reports', '/expenses', '/supplies'];

        $adminRole    = Role::query()->withoutGlobalScopes()->firstOrCreate(['business_id' => $demoBusinessId, 'name' => 'Admin'],    ['permissions' => $allPermissions]);
        $managerRole  = Role::query()->withoutGlobalScopes()->firstOrCreate(['business_id' => $demoBusinessId, 'name' => 'Manager'],  ['permissions' => ['/dashboard', '/tables', '/order', '/payment', '/kitchen', '/employees', '/customers', '/reports', '/expenses']]);
        $cashierRole  = Role::query()->withoutGlobalScopes()->firstOrCreate(['business_id' => $demoBusinessId, 'name' => 'Cashier'],  ['permissions' => ['/order', '/payment', '/tables']]);
        $waiterRole   = Role::query()->withoutGlobalScopes()->firstOrCreate(['business_id' => $demoBusinessId, 'name' => 'Waiter'],   ['permissions' => ['/tables', '/order', '/kitchen']]);
        $kitchenRole  = Role::query()->withoutGlobalScopes()->firstOrCreate(['business_id' => $demoBusinessId, 'name' => 'Kitchen'],  ['permissions' => ['/kitchen']]);

        // ── 2. Employees (18 total, including 1 admin) ──────────────────────────
        $employees = [
            // Admin
            ['name' => 'Demo Administrator', 'email' => 'admin@gmail.com', 'phone' => '+92-300-1234567', 'role_id' => $adminRole->id, 'pin' => null, 'password' => '12345678', 'is_active' => true],
            // Managers
            ['name' => 'Ahmed Raza',        'email' => 'ahmed.raza@demo.aurapos.com',     'phone' => '+92-321-2345678', 'role_id' => $managerRole->id,  'pin' => '2001', 'password' => Hash::make('manager01'), 'is_active' => true],
            ['name' => 'Sara Malik',        'email' => 'sara.malik@demo.aurapos.com',     'phone' => '+92-333-3456789', 'role_id' => $managerRole->id,  'pin' => '2002', 'password' => Hash::make('manager02'), 'is_active' => true],
            // Cashiers
            ['name' => 'Bilal Hassan',      'email' => 'bilal.hassan@demo.aurapos.com',   'phone' => '+92-345-4567890', 'role_id' => $cashierRole->id,  'pin' => '3001', 'password' => Hash::make('cashier01'), 'is_active' => true],
            ['name' => 'Fatima Noor',       'email' => 'fatima.noor@demo.aurapos.com',    'phone' => '+92-311-5678901', 'role_id' => $cashierRole->id,  'pin' => '3002', 'password' => Hash::make('cashier02'), 'is_active' => true],
            // Waiters
            ['name' => 'Usman Tariq',       'email' => 'usman.tariq@demo.aurapos.com',    'phone' => '+92-312-6789012', 'role_id' => $waiterRole->id,   'pin' => '4001', 'password' => Hash::make('waiter01'), 'is_active' => true],
            ['name' => 'Aisha Khan',        'email' => 'aisha.khan@demo.aurapos.com',    'phone' => '+92-313-7890123', 'role_id' => $waiterRole->id,   'pin' => '4002', 'password' => Hash::make('waiter02'), 'is_active' => true],
            ['name' => 'Hamza Sheikh',      'email' => 'hamza.sheikh@demo.aurapos.com',  'phone' => '+92-314-8901234', 'role_id' => $waiterRole->id,   'pin' => '4003', 'password' => Hash::make('waiter03'), 'is_active' => true],
            ['name' => 'Zara Ahmad',        'email' => 'zara.ahmad@demo.aurapos.com',    'phone' => '+92-315-9012345', 'role_id' => $waiterRole->id,   'pin' => '4004', 'password' => Hash::make('waiter04'), 'is_active' => true],
            ['name' => 'Danish Ali',        'email' => 'danish.ali@demo.aurapos.com',    'phone' => '+92-316-0123456', 'role_id' => $waiterRole->id,   'pin' => '4005', 'password' => Hash::make('waiter05'), 'is_active' => true],
            ['name' => 'Sana Butt',         'email' => 'sana.butt@demo.aurapos.com',     'phone' => '+92-317-1234567', 'role_id' => $waiterRole->id,   'pin' => '4006', 'password' => Hash::make('waiter06'), 'is_active' => true],
            // Kitchen Staff
            ['name' => 'Rizwan Chef',       'email' => 'rizwan.chef@demo.aurapos.com',    'phone' => '+92-318-2345678', 'role_id' => $kitchenRole->id,  'pin' => '5001', 'password' => Hash::make('kitchen01'), 'is_active' => true],
            ['name' => 'Kamran Cook',       'email' => 'kamran.cook@demo.aurapos.com',    'phone' => '+92-319-3456789', 'role_id' => $kitchenRole->id,  'pin' => '5002', 'password' => Hash::make('kitchen02'), 'is_active' => true],
            ['name' => 'Imran Grill',       'email' => 'imran.grill@demo.aurapos.com',    'phone' => '+92-320-4567890', 'role_id' => $kitchenRole->id,  'pin' => '5003', 'password' => Hash::make('kitchen03'), 'is_active' => true],
            ['name' => 'Nadia Baker',       'email' => 'nadia.baker@demo.aurapos.com',    'phone' => '+92-331-5678901', 'role_id' => $kitchenRole->id,  'pin' => '5004', 'password' => Hash::make('kitchen04'), 'is_active' => true],
            // Inactive / former staff
            ['name' => 'Omar Farooq',       'email' => 'omar.farooq@demo.aurapos.com',    'phone' => '+92-332-6789012', 'role_id' => $waiterRole->id,   'pin' => '4007', 'password' => Hash::make('waiter07'), 'is_active' => false],
            ['name' => 'Hira Shahid',       'email' => 'hira.shahid@demo.aurapos.com',    'phone' => '+92-333-7890123', 'role_id' => $cashierRole->id,  'pin' => '3003', 'password' => Hash::make('cashier03'), 'is_active' => false],
            ['name' => 'Tariq Mehmood',     'email' => 'tariq.mehmood@demo.aurapos.com',  'phone' => '+92-334-8901234', 'role_id' => $waiterRole->id,   'pin' => '4008', 'password' => Hash::make('waiter08'), 'is_active' => false],
        ];

        foreach ($employees as $emp) {
            $emp['business_id'] = $demoBusinessId;
            Employee::query()->withoutGlobalScopes()->updateOrCreate(
                ['business_id' => $demoBusinessId, 'email' => $emp['email']],
                $emp
            );
        }

        // Fetch all employees for later use
        $allEmployees = Employee::query()->where('business_id', $demoBusinessId)->where('is_active', true)->get();

        // ── 3. Restaurant Tables (12 tables) ────────────────────────────────────
        $tables = [
            ['id' => 1,  'seats' => 2,  'section' => 'A', 'status' => 'available'],
            ['id' => 2,  'seats' => 4,  'section' => 'A', 'status' => 'occupied', 'current_order_code' => 'O001', 'amount' => 36.35, 'duration' => 45],
            ['id' => 3,  'seats' => 4,  'section' => 'A', 'status' => 'occupied', 'current_order_code' => 'O002', 'amount' => 25.98, 'duration' => 22],
            ['id' => 4,  'seats' => 6,  'section' => 'B', 'status' => 'available'],
            ['id' => 5,  'seats' => 2,  'section' => 'B', 'status' => 'reserved',  'reserved_for' => '19:00', 'guest_name' => 'Ahmed'],
            ['id' => 6,  'seats' => 8,  'section' => 'B', 'status' => 'available'],
            ['id' => 7,  'seats' => 4,  'section' => 'C', 'status' => 'occupied', 'current_order_code' => 'O003', 'amount' => 48.50, 'duration' => 67],
            ['id' => 8,  'seats' => 2,  'section' => 'C', 'status' => 'available'],
            ['id' => 9,  'seats' => 6,  'section' => 'C', 'status' => 'reserved',  'reserved_for' => '20:30', 'guest_name' => 'Sara'],
            ['id' => 10, 'seats' => 4,  'section' => 'D', 'status' => 'available'],
            ['id' => 11, 'seats' => 2,  'section' => 'D', 'status' => 'occupied', 'current_order_code' => 'O004', 'amount' => 12.00, 'duration' => 15],
            ['id' => 12, 'seats' => 8,  'section' => 'D', 'status' => 'available'],
        ];
        $tableIds = [];
        foreach ($tables as $table) {
            $tableNumber = $table['id'];
            unset($table['id']);
            $table['table_number'] = $tableNumber;
            $seededTable = RestaurantTable::query()->withoutGlobalScopes()->updateOrCreate(['business_id' => $demoBusinessId, 'table_number' => $tableNumber], $table + ['business_id' => $demoBusinessId]);
            $tableIds[$tableNumber] = $seededTable->id;
        }

        // ── 4. Menu Items (17 items, already seeded — keep them) ────────────────
        $menuItems = [
            ['id' => 1,  'name' => 'Southwest Scramble Bowl',  'category' => 'Breakfast', 'price' => 16.99, 'emoji' => 'eggs',    'prep_time' => '10 min', 'popular' => true,  'description' => 'Seasoned scrambled eggs served with warm toast.',                    'image' => 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=600&auto=format&fit=crop'],
            ['id' => 2,  'name' => 'Croissant French Toast',   'category' => 'Breakfast', 'price' => 14.29, 'emoji' => 'toast',   'prep_time' => '12 min', 'popular' => false, 'description' => 'Buttery croissant grilled and topped with sugar.',                   'image' => 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=600&auto=format&fit=crop'],
            ['id' => 3,  'name' => 'Oatmeal Breakfast',        'category' => 'Breakfast', 'price' => 16.49, 'emoji' => 'bowl',    'prep_time' => '8 min',  'popular' => false, 'description' => 'Brown sugar, raisins, and seasonal fruit.',                          'image' => 'https://plus.unsplash.com/premium_photo-1663924211473-132ef5383e04?q=80&w=870&auto=format&fit=crop'],
            ['id' => 4,  'name' => 'Western Omelette',         'category' => 'Breakfast', 'price' => 19.36, 'emoji' => 'eggs',    'prep_time' => '10 min', 'popular' => false, 'description' => 'Omelette with cheese, ham, mushrooms, potato, onions, and sauce.',  'discount' => 12, 'image' => 'https://plus.unsplash.com/premium_photo-1693086420454-7568e3b8c308?q=80&w=600&auto=format&fit=crop'],
            ['id' => 5,  'name' => 'Belgian Waffle',           'category' => 'Breakfast', 'price' => 12.99, 'emoji' => 'waffle',  'prep_time' => '15 min', 'popular' => true,  'description' => 'Crispy waffles topped with berries and syrup.',                      'image' => 'https://images.unsplash.com/photo-1647209850142-f035ac0b22a8?q=80&w=600&auto=format&fit=crop'],
            ['id' => 6,  'name' => 'Grilled Burger',           'category' => 'Fastfood',  'price' => 12.00, 'emoji' => 'burger',  'prep_time' => '15 min', 'popular' => true,  'description' => 'Beef patty with lettuce, tomato, cheese, and sauce.',                'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop'],
            ['id' => 7,  'name' => 'Margherita Pizza',         'category' => 'Fastfood',  'price' => 14.50, 'emoji' => 'pizza',   'prep_time' => '20 min', 'popular' => true,  'description' => 'Classic pizza with mozzarella, basil, and tomato sauce.',            'image' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop'],
            ['id' => 8,  'name' => 'Crispy French Fries',      'category' => 'Fastfood',  'price' => 4.99,  'emoji' => 'fries',   'prep_time' => '7 min',  'popular' => false, 'description' => 'Golden salted potato fries.',                                        'image' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop'],
            ['id' => 9,  'name' => 'BBQ Chicken Wings',        'category' => 'Fastfood',  'price' => 9.99,  'emoji' => 'wings',   'prep_time' => '12 min', 'popular' => false, 'description' => 'Chicken wings tossed in smoky BBQ sauce.',                           'image' => 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=600&auto=format&fit=crop'],
            ['id' => 10, 'name' => 'Grilled Salmon',           'category' => 'Seafood',   'price' => 21.00, 'emoji' => 'fish',    'prep_time' => '18 min', 'popular' => true,  'description' => 'Salmon fillet grilled with lemon butter sauce.',                     'image' => 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=600&auto=format&fit=crop'],
            ['id' => 11, 'name' => 'Garlic Butter Shrimp',     'category' => 'Seafood',   'price' => 18.50, 'emoji' => 'shrimp',  'prep_time' => '14 min', 'popular' => false, 'description' => 'Shrimp cooked in garlic butter sauce.',                              'image' => 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=600&auto=format&fit=crop'],
            ['id' => 12, 'name' => 'Fish and Chips',           'category' => 'Seafood',   'price' => 15.99, 'emoji' => 'fish',    'prep_time' => '15 min', 'popular' => false, 'description' => 'Crispy battered cod with tartar sauce and chips.',                   'image' => 'https://plus.unsplash.com/premium_photo-1694108747175-889fdc786003?q=80&w=600&auto=format&fit=crop'],
            ['id' => 13, 'name' => 'Seafood Paella',           'category' => 'Seafood',   'price' => 24.99, 'emoji' => 'rice',    'prep_time' => '22 min', 'popular' => true,  'description' => 'Saffron rice cooked with shrimp, mussels, and calamari.',           'image' => 'https://images.unsplash.com/photo-1623961990059-28356e226a77?q=80&w=871&auto=format&fit=crop'],
            ['id' => 14, 'name' => 'Chocolate Lava Cake',      'category' => 'Desserts',  'price' => 6.50,  'emoji' => 'cake',    'prep_time' => '10 min', 'popular' => true,  'description' => 'Warm chocolate cake with a molten center.',                          'image' => 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop'],
            ['id' => 15, 'name' => 'Cheesecake Slice',         'category' => 'Desserts',  'price' => 5.80,  'emoji' => 'cake',    'prep_time' => '8 min',  'popular' => false, 'description' => 'New York style cheesecake with strawberry compote.',                 'image' => 'https://plus.unsplash.com/premium_photo-1701294050701-3c9e4cb1e43f?q=80&w=870&auto=format&fit=crop'],
            ['id' => 16, 'name' => 'Ice Cream Sundae',         'category' => 'Desserts',  'price' => 4.99,  'emoji' => 'ice cream','prep_time' => '5 min',  'popular' => false, 'description' => 'Vanilla, chocolate, and strawberry ice cream.',                      'image' => 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=600&auto=format&fit=crop'],
            ['id' => 17, 'name' => 'Tiramisu Cup',             'category' => 'Desserts',  'price' => 7.20,  'emoji' => 'coffee',  'prep_time' => '6 min',  'popular' => true,  'description' => 'Coffee-soaked dessert with mascarpone.',                             'image' => 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=600&auto=format&fit=crop'],
        ];
        foreach ($menuItems as $item) {
            unset($item['id']);
            MenuItem::query()->withoutGlobalScopes()->updateOrCreate(['business_id' => $demoBusinessId, 'name' => $item['name']], $item + ['business_id' => $demoBusinessId]);
        }

        // ── 5. Customers (15 records) ────────────────────────────────────────────
        $customers = [
            ['name' => 'Ali Hassan',       'phone' => '+92-300-1111001', 'email' => 'ali.hassan@gmail.com',     'notes' => 'VIP regular. Prefers window seat. No spice.'],
            ['name' => 'Ayesha Siddiqui',  'phone' => '+92-300-2222002', 'email' => 'ayesha.s@gmail.com',       'notes' => 'Birthday in November. Loves desserts.'],
            ['name' => 'Zain Ul Abideen',  'phone' => '+92-300-3333003', 'email' => 'zain.abideen@hotmail.com', 'notes' => 'Orders delivery regularly.'],
            ['name' => 'Maryam Iqbal',     'phone' => '+92-300-4444004', 'email' => 'maryam.iqbal@yahoo.com',   'notes' => 'Vegetarian. Gluten-free options preferred.'],
            ['name' => 'Faisal Mahmood',   'phone' => '+92-300-5555005', 'email' => 'faisal.m@gmail.com',       'notes' => 'Corporate client. Monthly lunch booking.'],
            ['name' => 'Hina Baig',        'phone' => '+92-300-6666006', 'email' => null,                        'notes' => 'Allergy: nuts. Always ask before serving.'],
            ['name' => 'Tariq Javed',      'phone' => '+92-300-7777007', 'email' => 'tariq.javed@gmail.com',    'notes' => null],
            ['name' => 'Nadia Rehman',     'phone' => '+92-300-8888008', 'email' => 'nadia.rehman@gmail.com',   'notes' => 'Prefers outdoor seating.'],
            ['name' => 'Shahid Nawaz',     'phone' => '+92-300-9999009', 'email' => null,                        'notes' => 'Loyal customer since 2023.'],
            ['name' => 'Rukhsana Bibi',    'phone' => '+92-300-1010010', 'email' => 'rukhsana@gmail.com',       'notes' => 'Prefers mild food, no chili.'],
            ['name' => 'Salman Farooqi',   'phone' => '+92-300-1111011', 'email' => 'salman.f@gmail.com',       'notes' => null],
            ['name' => 'Kiran Anwar',      'phone' => '+92-300-1212012', 'email' => 'kiran.anwar@gmail.com',    'notes' => 'Frequent takeaway customer.'],
            ['name' => 'Junaid Mir',       'phone' => '+92-300-1313013', 'email' => 'junaid.mir@yahoo.com',     'notes' => 'Group booking specialist — comes with 10+ people.'],
            ['name' => 'Asma Khurram',     'phone' => '+92-300-1414014', 'email' => 'asma.khurram@gmail.com',   'notes' => 'Online order frequent buyer.'],
            ['name' => 'Waseem Aktar',     'phone' => '+92-300-1515015', 'email' => 'waseem.aktar@gmail.com',   'notes' => 'Prefers high table area.'],
        ];
        foreach ($customers as $cust) {
            Customer::query()->withoutGlobalScopes()->firstOrCreate(['business_id' => $demoBusinessId, 'phone' => $cust['phone']], $cust + ['business_id' => $demoBusinessId]);
        }

        // ── 6. Orders (20 completed + 4 active) ─────────────────────────────────
        // Keep existing active orders seeded for tables
        $completedOrders = [
            ['code' => 'O-2001', 'restaurant_table_id' => 1,  'order_type' => 'dine-in',  'status' => 'paid', 'subtotal' => 48.98, 'tax' => 4.41, 'total' => 53.39, 'paid_at' => now()->subDays(7)->setTime(13, 30)],
            ['code' => 'O-2002', 'restaurant_table_id' => 4,  'order_type' => 'dine-in',  'status' => 'paid', 'subtotal' => 36.49, 'tax' => 3.28, 'total' => 39.77, 'paid_at' => now()->subDays(7)->setTime(15, 20)],
            ['code' => 'O-2003', 'restaurant_table_id' => 6,  'order_type' => 'dine-in',  'status' => 'paid', 'subtotal' => 62.00, 'tax' => 5.58, 'total' => 67.58, 'paid_at' => now()->subDays(6)->setTime(12, 45)],
            ['code' => 'O-2004', 'restaurant_table_id' => 2,  'order_type' => 'dine-in',  'status' => 'paid', 'subtotal' => 29.97, 'tax' => 2.70, 'total' => 32.67, 'paid_at' => now()->subDays(6)->setTime(19, 10)],
            ['code' => 'O-2005', 'restaurant_table_id' => null,'order_type' => 'takeaway', 'status' => 'paid', 'subtotal' => 24.99, 'tax' => 2.25, 'total' => 27.24, 'paid_at' => now()->subDays(5)->setTime(11, 05)],
            ['code' => 'O-2006', 'restaurant_table_id' => null,'order_type' => 'delivery', 'status' => 'paid', 'subtotal' => 43.48, 'tax' => 3.91, 'total' => 47.39, 'paid_at' => now()->subDays(5)->setTime(18, 50)],
            ['code' => 'O-2007', 'restaurant_table_id' => 3,  'order_type' => 'dine-in',  'status' => 'paid', 'subtotal' => 57.49, 'tax' => 5.17, 'total' => 62.66, 'paid_at' => now()->subDays(4)->setTime(13, 00)],
            ['code' => 'O-2008', 'restaurant_table_id' => 5,  'order_type' => 'dine-in',  'status' => 'paid', 'subtotal' => 19.98, 'tax' => 1.80, 'total' => 21.78, 'paid_at' => now()->subDays(4)->setTime(20, 30)],
            ['code' => 'O-2009', 'restaurant_table_id' => null,'order_type' => 'takeaway', 'status' => 'paid', 'subtotal' => 38.99, 'tax' => 3.51, 'total' => 42.50, 'paid_at' => now()->subDays(3)->setTime(12, 15)],
            ['code' => 'O-2010', 'restaurant_table_id' => 8,  'order_type' => 'dine-in',  'status' => 'paid', 'subtotal' => 72.98, 'tax' => 6.57, 'total' => 79.55, 'paid_at' => now()->subDays(3)->setTime(19, 40)],
            ['code' => 'O-2011', 'restaurant_table_id' => 10, 'order_type' => 'dine-in',  'status' => 'paid', 'subtotal' => 33.49, 'tax' => 3.01, 'total' => 36.50, 'paid_at' => now()->subDays(2)->setTime(11, 30)],
            ['code' => 'O-2012', 'restaurant_table_id' => null,'order_type' => 'delivery', 'status' => 'paid', 'subtotal' => 51.99, 'tax' => 4.68, 'total' => 56.67, 'paid_at' => now()->subDays(2)->setTime(14, 20)],
            ['code' => 'O-2013', 'restaurant_table_id' => 12, 'order_type' => 'dine-in',  'status' => 'paid', 'subtotal' => 88.96, 'tax' => 8.01, 'total' => 96.97, 'paid_at' => now()->subDays(2)->setTime(20, 10)],
            ['code' => 'O-2014', 'restaurant_table_id' => null,'order_type' => 'takeaway', 'status' => 'paid', 'subtotal' => 14.99, 'tax' => 1.35, 'total' => 16.34, 'paid_at' => now()->subDays(1)->setTime(10, 00)],
            ['code' => 'O-2015', 'restaurant_table_id' => 1,  'order_type' => 'dine-in',  'status' => 'paid', 'subtotal' => 27.49, 'tax' => 2.47, 'total' => 29.96, 'paid_at' => now()->subDays(1)->setTime(13, 45)],
            ['code' => 'O-2016', 'restaurant_table_id' => 6,  'order_type' => 'dine-in',  'status' => 'paid', 'subtotal' => 64.98, 'tax' => 5.85, 'total' => 70.83, 'paid_at' => now()->subDays(1)->setTime(19, 00)],
            ['code' => 'O-2017', 'restaurant_table_id' => null,'order_type' => 'delivery', 'status' => 'paid', 'subtotal' => 46.49, 'tax' => 4.18, 'total' => 50.67, 'paid_at' => now()->subHours(10)],
            ['code' => 'O-2018', 'restaurant_table_id' => 4,  'order_type' => 'dine-in',  'status' => 'paid', 'subtotal' => 23.98, 'tax' => 2.16, 'total' => 26.14, 'paid_at' => now()->subHours(7)],
            ['code' => 'O-2019', 'restaurant_table_id' => 8,  'order_type' => 'dine-in',  'status' => 'paid', 'subtotal' => 55.00, 'tax' => 4.95, 'total' => 59.95, 'paid_at' => now()->subHours(4)],
            ['code' => 'O-2020', 'restaurant_table_id' => null,'order_type' => 'takeaway', 'status' => 'paid', 'subtotal' => 31.49, 'tax' => 2.83, 'total' => 34.32, 'paid_at' => now()->subHours(2)],
        ];

        foreach ($completedOrders as $order) {
            $existing = Order::query()->withoutGlobalScopes()->where('business_id', $demoBusinessId)->where('code', $order['code'])->first();
            if (!$existing) {
                if ($order['restaurant_table_id'] !== null) {
                    $order['restaurant_table_id'] = $tableIds[$order['restaurant_table_id']];
                }
                Order::query()->create($order + ['business_id' => $demoBusinessId]);
            }
        }

        // ── 7. Expenses (20 records across categories) ───────────────────────────
        $expenses = [
            ['title' => 'Monthly Rent',           'amount' => 2500.00, 'category' => 'Rent',      'date' => now()->subDays(30)->toDateString(), 'notes' => 'Main branch rent for the month.'],
            ['title' => 'Electricity Bill',        'amount' => 380.50,  'category' => 'Utilities', 'date' => now()->subDays(29)->toDateString(), 'notes' => 'September electricity.'],
            ['title' => 'Gas Bill',                'amount' => 95.00,   'category' => 'Utilities', 'date' => now()->subDays(28)->toDateString(), 'notes' => null],
            ['title' => 'Internet & Phone',        'amount' => 75.00,   'category' => 'Utilities', 'date' => now()->subDays(27)->toDateString(), 'notes' => 'Monthly fiber + business phone.'],
            ['title' => 'Staff Salaries - Aug',    'amount' => 6800.00, 'category' => 'Salaries',  'date' => now()->subDays(7)->toDateString(),  'notes' => 'August salaries for 14 staff.'],
            ['title' => 'Vegetable & Produce',     'amount' => 420.00,  'category' => 'Supplies',  'date' => now()->subDays(6)->toDateString(),  'notes' => 'Weekly fresh produce from market.'],
            ['title' => 'Meat & Poultry',          'amount' => 780.00,  'category' => 'Supplies',  'date' => now()->subDays(5)->toDateString(),  'notes' => 'Chicken, beef, mutton for the week.'],
            ['title' => 'Cleaning Supplies',       'amount' => 115.00,  'category' => 'Supplies',  'date' => now()->subDays(4)->toDateString(),  'notes' => 'Detergents, mops, sanitizers.'],
            ['title' => 'Packaging Materials',     'amount' => 88.50,   'category' => 'Supplies',  'date' => now()->subDays(3)->toDateString(),  'notes' => 'Takeaway boxes, bags, napkins.'],
            ['title' => 'Kitchen Equipment Repair','amount' => 245.00,  'category' => 'Other',     'date' => now()->subDays(2)->toDateString(),  'notes' => 'Grill maintenance service.'],
            ['title' => 'Staff Training',          'amount' => 150.00,  'category' => 'Other',     'date' => now()->subDays(2)->toDateString(),  'notes' => 'Food safety certification.'],
            ['title' => 'Marketing - Social Media','amount' => 200.00,  'category' => 'Other',     'date' => now()->subDays(1)->toDateString(),  'notes' => 'Boosted posts and ads.'],
            ['title' => 'Delivery Platform Fee',   'amount' => 185.00,  'category' => 'Other',     'date' => now()->subDays(1)->toDateString(),  'notes' => 'Commission to delivery app.'],
            ['title' => 'Beverages Restock',       'amount' => 310.00,  'category' => 'Supplies',  'date' => now()->toDateString(),             'notes' => 'Juices, water, soft drinks.'],
            ['title' => 'Seafood Order',           'amount' => 530.00,  'category' => 'Supplies',  'date' => now()->toDateString(),             'notes' => 'Salmon, shrimp, fish from supplier.'],
            ['title' => 'Disposable Cutlery',      'amount' => 62.00,   'category' => 'Supplies',  'date' => now()->toDateString(),             'notes' => 'Forks, spoons for takeaway.'],
            ['title' => 'Pest Control',            'amount' => 120.00,  'category' => 'Other',     'date' => now()->subDays(14)->toDateString(),'notes' => 'Quarterly pest control service.'],
            ['title' => 'Fire Extinguisher Check', 'amount' => 50.00,   'category' => 'Other',     'date' => now()->subDays(10)->toDateString(),'notes' => 'Safety compliance check.'],
            ['title' => 'Bakery Items',            'amount' => 195.00,  'category' => 'Supplies',  'date' => now()->subDays(8)->toDateString(),  'notes' => 'Croissants, bread, pastries.'],
            ['title' => 'Dairy & Eggs',            'amount' => 140.00,  'category' => 'Supplies',  'date' => now()->subDays(6)->toDateString(),  'notes' => 'Milk, cream, eggs, cheese.'],
        ];
        foreach ($expenses as $exp) {
            Expense::query()->withoutGlobalScopes()->firstOrCreate(
                ['business_id' => $demoBusinessId, 'title' => $exp['title'], 'date' => $exp['date']],
                $exp + ['business_id' => $demoBusinessId]
            );
        }

        // ── 8. Supplies & Supply Logs ────────────────────────────────────────────
        $supplies = [
            ['name' => 'Chicken Breast',       'unit' => 'kg',    'quantity' => 25.5, 'min_quantity' => 10, 'unit_cost' => 8.50,  'supplier' => 'FreshMeat Co.',    'category' => 'Food',      'notes' => 'Keep refrigerated.'],
            ['name' => 'Beef Tenderloin',       'unit' => 'kg',    'quantity' => 12.0, 'min_quantity' => 5,  'unit_cost' => 18.00, 'supplier' => 'FreshMeat Co.',    'category' => 'Food',      'notes' => null],
            ['name' => 'Atlantic Salmon',       'unit' => 'kg',    'quantity' => 8.5,  'min_quantity' => 4,  'unit_cost' => 22.00, 'supplier' => 'Ocean Fresh Ltd',  'category' => 'Food',      'notes' => 'Order 2x weekly.'],
            ['name' => 'Shrimp (Jumbo)',        'unit' => 'kg',    'quantity' => 6.0,  'min_quantity' => 3,  'unit_cost' => 19.50, 'supplier' => 'Ocean Fresh Ltd',  'category' => 'Food',      'notes' => null],
            ['name' => 'Tomatoes',              'unit' => 'kg',    'quantity' => 18.0, 'min_quantity' => 8,  'unit_cost' => 1.20,  'supplier' => 'Green Valley Farm','category' => 'Food',      'notes' => null],
            ['name' => 'Potatoes',              'unit' => 'kg',    'quantity' => 30.0, 'min_quantity' => 15, 'unit_cost' => 0.80,  'supplier' => 'Green Valley Farm','category' => 'Food',      'notes' => null],
            ['name' => 'Onions',               'unit' => 'kg',    'quantity' => 20.0, 'min_quantity' => 10, 'unit_cost' => 0.60,  'supplier' => 'Green Valley Farm','category' => 'Food',      'notes' => null],
            ['name' => 'Eggs (Tray)',           'unit' => 'tray',  'quantity' => 10.0, 'min_quantity' => 4,  'unit_cost' => 6.50,  'supplier' => 'Farm Direct',      'category' => 'Food',      'notes' => '30 eggs per tray.'],
            ['name' => 'Milk (Full Cream)',     'unit' => 'litre', 'quantity' => 40.0, 'min_quantity' => 20, 'unit_cost' => 1.40,  'supplier' => 'Dairy Best',       'category' => 'Food',      'notes' => null],
            ['name' => 'All-Purpose Flour',     'unit' => 'kg',    'quantity' => 22.0, 'min_quantity' => 10, 'unit_cost' => 1.10,  'supplier' => 'Grain House',      'category' => 'Food',      'notes' => null],
            ['name' => 'Olive Oil (5L)',        'unit' => 'bottle','quantity' => 8.0,  'min_quantity' => 3,  'unit_cost' => 14.50, 'supplier' => 'Importer Direct',  'category' => 'Food',      'notes' => null],
            ['name' => 'Mozzarella Cheese',     'unit' => 'kg',    'quantity' => 9.0,  'min_quantity' => 4,  'unit_cost' => 12.00, 'supplier' => 'Dairy Best',       'category' => 'Food',      'notes' => 'For pizzas.'],
            ['name' => 'Mineral Water (500ml)', 'unit' => 'box',   'quantity' => 15.0, 'min_quantity' => 5,  'unit_cost' => 4.80,  'supplier' => 'Aqua Pure',        'category' => 'Beverage',  'notes' => '24 bottles per box.'],
            ['name' => 'Soft Drinks (Can)',     'unit' => 'box',   'quantity' => 12.0, 'min_quantity' => 4,  'unit_cost' => 9.60,  'supplier' => 'Beverage Hub',     'category' => 'Beverage',  'notes' => '24 cans per box.'],
            ['name' => 'Orange Juice (1L)',     'unit' => 'box',   'quantity' => 8.0,  'min_quantity' => 3,  'unit_cost' => 18.00, 'supplier' => 'Juice World',      'category' => 'Beverage',  'notes' => '12 bottles per box.'],
            ['name' => 'Dish Soap',             'unit' => 'bottle','quantity' => 6.0,  'min_quantity' => 2,  'unit_cost' => 3.20,  'supplier' => 'Clean King',       'category' => 'Cleaning',  'notes' => null],
            ['name' => 'Hand Sanitizer (5L)',   'unit' => 'can',   'quantity' => 4.0,  'min_quantity' => 2,  'unit_cost' => 8.00,  'supplier' => 'Clean King',       'category' => 'Cleaning',  'notes' => 'For front-of-house.'],
            ['name' => 'Bleach / Disinfectant', 'unit' => 'litre', 'quantity' => 10.0, 'min_quantity' => 5,  'unit_cost' => 2.50,  'supplier' => 'Clean King',       'category' => 'Cleaning',  'notes' => null],
            ['name' => 'Takeaway Boxes (Large)','unit' => 'box',   'quantity' => 20.0, 'min_quantity' => 8,  'unit_cost' => 5.00,  'supplier' => 'Pack It Right',    'category' => 'Packaging', 'notes' => '50 pcs per box.'],
            ['name' => 'Paper Napkins',         'unit' => 'pack',  'quantity' => 30.0, 'min_quantity' => 10, 'unit_cost' => 2.20,  'supplier' => 'Pack It Right',    'category' => 'Packaging', 'notes' => '100 sheets per pack.'],
        ];

        foreach ($supplies as $supply) {
            $existing = Supply::query()->withoutGlobalScopes()->firstOrCreate(['business_id' => $demoBusinessId, 'name' => $supply['name']], $supply + ['business_id' => $demoBusinessId]);
            // Add a purchase log entry if new
            if ($existing->wasRecentlyCreated) {
                SupplyLog::query()->create([
                    'business_id' => $demoBusinessId,
                    'supply_id' => $existing->id,
                    'type'      => 'purchase',
                    'quantity'  => $supply['quantity'],
                    'unit_cost' => $supply['unit_cost'],
                    'date'      => now()->subDays(rand(1, 10))->toDateString(),
                    'notes'     => 'Initial stock.',
                ]);
            }
        }

        // ── 9. Attendance Logs (last 10 days for active employees) ──────────────
        $activeEmployeeIds = Employee::query()->where('business_id', $demoBusinessId)->where('is_active', true)->pluck('id');
        $statuses   = ['present', 'present', 'present', 'present', 'late', 'late', 'absent', 'half-day'];
        $checkIns   = ['08:00', '08:05', '08:15', '08:30', '09:00', '09:15', '08:45', '08:00'];

        for ($d = 10; $d >= 1; $d--) {
            $date = now()->subDays($d)->toDateString();
            foreach ($activeEmployeeIds as $empId) {
                // Admin doesn't need daily attendance
                if ($empId === 1) continue;

                $idx = rand(0, count($statuses) - 1);
                $status   = $statuses[$idx];
                $checkIn  = $status === 'absent' ? null : $checkIns[$idx];
                $checkOut = ($status === 'absent') ? null : (($status === 'half-day') ? date('H:i', strtotime($checkIn) + 4 * 3600) : date('H:i', strtotime($checkIn) + 8 * 3600));

                AttendanceLog::query()->withoutGlobalScopes()->updateOrCreate(
                    ['business_id' => $demoBusinessId, 'employee_id' => $empId, 'date' => $date],
                    [
                        'business_id' => $demoBusinessId,
                        'check_in'  => $checkIn,
                        'check_out' => $checkOut,
                        'status'    => $status,
                        'notes'     => $status === 'late' ? 'Arrived late.' : null,
                    ]
                );
            }
        }

    }

    private function seedConfiguredSuperAdmin(): void
    {
        $superAdminUsername = strtolower(trim((string) config('rims.super_admin')));
        if ($superAdminUsername !== '') {
            $superAdmin = Employee::query()->withoutGlobalScopes()
                ->where(fn ($query) => $query->where('username', $superAdminUsername)->orWhereRaw('LOWER(name) = ?', [$superAdminUsername]))
                ->first();

            if ($superAdmin) {
                $superAdmin->username = $superAdminUsername;
                $superAdmin->role_id = null;
                $superAdmin->pin = null;
                $superAdmin->is_active = true;
                $superAdmin->is_super_admin = true;
                $superAdmin->is_demo_user = false;
                $superAdmin->business_id = null;
                $superAdmin->save();
            }
        }
    }
}
