<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class DemoWorkspaceCloner
{
    public function clone(int $sourceBusinessId, int $targetBusinessId): void
    {
        $idMaps = [];

        $this->copyTable('roles', $sourceBusinessId, $targetBusinessId, $idMaps);
        $this->copyTable('employees', $sourceBusinessId, $targetBusinessId, $idMaps, [
            'role_id' => 'roles',
        ], static function (array $row): array {
            $row['email'] = null;
            $row['username'] = null;
            $row['pin'] = null;
            $row['password'] = null;

            return $row;
        });
        $this->copyTable('restaurant_tables', $sourceBusinessId, $targetBusinessId, $idMaps);
        $this->copyTable('menu_items', $sourceBusinessId, $targetBusinessId, $idMaps);
        $this->copyTable('customers', $sourceBusinessId, $targetBusinessId, $idMaps);
        $this->copyTable('orders', $sourceBusinessId, $targetBusinessId, $idMaps, [
            'restaurant_table_id' => 'restaurant_tables',
        ]);
        $this->copyChildTable('order_items', 'orders', 'order_id', $sourceBusinessId, $targetBusinessId, $idMaps, [
            'order_id' => 'orders',
            'menu_item_id' => 'menu_items',
        ]);
        $this->copyTable('kitchen_orders', $sourceBusinessId, $targetBusinessId, $idMaps, [
            'order_id' => 'orders',
            'restaurant_table_id' => 'restaurant_tables',
        ]);
        $this->copyChildTable('kitchen_order_items', 'kitchen_orders', 'kitchen_order_id', $sourceBusinessId, $targetBusinessId, $idMaps, [
            'kitchen_order_id' => 'kitchen_orders',
        ]);
        $this->copyTable('attendance_logs', $sourceBusinessId, $targetBusinessId, $idMaps, [
            'employee_id' => 'employees',
        ]);
        $this->copyTable('expenses', $sourceBusinessId, $targetBusinessId, $idMaps);
        $this->copyTable('supplies', $sourceBusinessId, $targetBusinessId, $idMaps);
        $this->copyTable('supply_logs', $sourceBusinessId, $targetBusinessId, $idMaps, [
            'supply_id' => 'supplies',
        ]);
    }

    private function copyTable(
        string $table,
        int $sourceBusinessId,
        int $targetBusinessId,
        array &$idMaps,
        array $references = [],
        ?callable $transform = null,
    ): void {
        $idMaps[$table] ??= [];

        $rows = DB::table($table)->where('business_id', $sourceBusinessId)->orderBy('id')->get();
        $this->insertRows($table, $rows, $targetBusinessId, $idMaps, $references, $transform);
    }

    private function copyChildTable(
        string $table,
        string $parentTable,
        string $parentForeignKey,
        int $sourceBusinessId,
        int $targetBusinessId,
        array &$idMaps,
        array $references = [],
    ): void {
        $parentIds = array_keys($idMaps[$parentTable] ?? []);
        if ($parentIds === []) {
            $idMaps[$table] = [];
            return;
        }

        $rows = DB::table($table)->whereIn($parentForeignKey, $parentIds)->orderBy('id')->get();
        $this->insertRows($table, $rows, $targetBusinessId, $idMaps, $references);
    }

    private function insertRows(
        string $table,
        iterable $rows,
        int $targetBusinessId,
        array &$idMaps,
        array $references = [],
        ?callable $transform = null,
    ): void {
        $idMaps[$table] ??= [];

        foreach ($rows as $sourceRow) {
            $row = (array) $sourceRow;
            $sourceId = $row['id'];
            unset($row['id']);
            if (array_key_exists('business_id', $row)) {
                $row['business_id'] = $targetBusinessId;
            }

            foreach ($references as $foreignKey => $referencedTable) {
                if (array_key_exists($foreignKey, $row) && $row[$foreignKey] !== null) {
                    $row[$foreignKey] = $idMaps[$referencedTable][$row[$foreignKey]] ?? null;
                }
            }

            if ($table === 'restaurant_tables' && ($row['current_order_code'] ?? null) !== null) {
                $row['current_order_code'] = null;
            }

            if ($transform !== null) {
                $row = $transform($row);
            }

            $idMaps[$table][$sourceId] = DB::table($table)->insertGetId($row);
        }
    }
}
