# QA Fix Request: Implement Settings Page Functionality

## Overview
The Settings page (`/configuracoes`) is currently a static frontend mockup. The input fields use `defaultValue` without State Management (no `onChange` handlers), and the "Salvar Tudo" (Save All) and "Testar Conexão" (Test Connection) buttons lack `onClick` handlers or form submission logic.

## Steps to Reproduce
1. Navigate to `https://autocar.juanpaulo.com.br/configuracoes`.
2. Alter any value in the input fields (e.g., "Nome da Garagem").
3. Click "Salvar Tudo".
4. **Expected Result**: A loading state appears, a toast notification confirms success, and the new data persists in the database.
5. **Actual Result**: Nothing happens. The button provides visual feedback (hover/click) but triggers no action.
6. Navigate to the "Integrações e APIs" tab.
7. Click "Testar Conexão" under the Evolution API section.
8. **Expected Result**: A loading state appears while testing the connection with the Evolution API, followed by a success/error toast.
9. **Actual Result**: Nothing happens.

## Root Cause Analysis
Upon code inspection of `src/app/(panel)/configuracoes/page.tsx` and its child components (e.g., `_components/general-settings.tsx`, `_components/integrations-settings.tsx`):
- The `store_settings` table exists in the Supabase database.
- The UI components are fully built but entirely disconnected from both State and the Database.
- There are no `onChange` handlers on inputs and no `onClick` handlers on the action buttons.

## Required Fixes (For @dev)
1.  **State Management:** Implement a centralized state management solution (e.g., React Context, Zustand, or simple lifted state in `page.tsx`) to manage the settings data across all tabs.
2.  **Data Fetching:** Fetch the initial values from the `store_settings` table on page load and populate the inputs.
3.  **Save Logic:** Implement the `onClick` handler for the "Salvar Tudo" button to perform an `UPDATE` on the `store_settings` table with the current state. Add loading states and toast notifications (success/error).
4.  **Test Connection Logic:** Implement the `onClick` handler for the "Testar Conexão" button in the Evolution API section to actually ping the Evolution API and verify credentials, showing a toast with the result.
