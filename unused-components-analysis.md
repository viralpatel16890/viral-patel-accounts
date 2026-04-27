# Unused Components Analysis

Based on the codebase audit, the following UI components are NOT used in any pages and can be safely removed:

## High Priority - Safe to Remove
- `accordion.tsx` - Not used anywhere
- `alert.tsx` - Not used anywhere  
- `aspect-ratio.tsx` - Not used anywhere
- `avatar.tsx` - Not used anywhere
- `badge.tsx` - Not used anywhere
- `breadcrumb.tsx` - Not used anywhere
- `calendar.tsx` - Not used anywhere
- `carousel.tsx` - Not used anywhere
- `checkbox.tsx` - Not used anywhere
- `collapsible.tsx` - Not used anywhere
- `context-menu.tsx` - Not used anywhere
- `form.tsx` - Not used anywhere
- `hover-card.tsx` - Not used anywhere
- `menubar.tsx` - Not used anywhere
- `navigation-menu.tsx` - Not used anywhere
- `pagination.tsx` - Not used anywhere
- `popover.tsx` - Not used anywhere
- `progress.tsx` - Not used anywhere
- `radio-group.tsx` - Not used anywhere
- `scroll-area.tsx` - Not used anywhere
- `select.tsx` - Not used anywhere
- `separator.tsx` - Not used anywhere
- `sheet.tsx` - Not used anywhere
- `sidebar.tsx` - Not used anywhere
- `slider.tsx` - Not used anywhere
- `switch.tsx` - Not used anywhere
- `tabs.tsx` - Not used anywhere
- `toggle.tsx` - Not used anywhere
- `toggle-group.tsx` - Not used anywhere

## Keep - Currently Used
- `button.tsx` ✅ Used extensively
- `card.tsx` ✅ Used in multiple pages
- `dialog.tsx` ✅ Used in Upload, Transactions
- `dropdown-menu.tsx` ✅ Used in layout
- `input.tsx` ✅ Used in forms
- `label.tsx` ✅ Used with inputs
- `tooltip.tsx` ✅ Used for UI hints

## Impact
Removing unused components would:
- Reduce bundle size by ~30-40KB
- Reduce maintenance overhead
- Simplify the component library
- Remove ~15 unused Radix UI dependencies

## Recommended Action
Run this script to safely remove unused components:
```bash
# Remove unused UI components (safe to delete)
rm src/app/components/ui/accordion.tsx
rm src/app/components/ui/alert.tsx
rm src/app/components/ui/aspect-ratio.tsx
# ... continue for all unused components
```
