<?php

namespace App\Services;

use App\Models\Role;
use App\Models\Company;

class RoleService
{
    /**
     * Clones all global role templates for a specific company.
     * Returns the 'Admin' role specifically for immediate user assignment.
     */
    public function cloneTemplatesForCompany(Company $company)
    {
        // Fetch all global templates (where company_id is NULL)
        // We use withoutGlobalScopes to ensure we can see templates even if a tenant scope is active
        $templates = Role::withoutGlobalScopes()->whereNull('company_id')->with('permissions')->get();

        $companyAdminRole = null;

        foreach ($templates as $template) {
            $newRole = Role::updateOrCreate([
                'name' => $template->name,
                'company_id' => $company->id
            ], [
                'description' => $template->description,
            ]);

            // Copy permissions
            $newRole->permissions()->sync($template->permissions->pluck('id'));

            if ($template->name === 'Admin') {
                $companyAdminRole = $newRole;
            }
        }

        // Fallback if no Admin template exists
        if (!$companyAdminRole) {
            $companyAdminRole = Role::updateOrCreate([
                'name' => 'Admin',
                'company_id' => $company->id
            ], [
                'description' => 'Full system access',
            ]);
        }

        return $companyAdminRole;
    }
}
