# CSS Warnings Documentation

## Tailwind CSS At-Rule Warnings

The following CSS warnings are **normal and expected** when using Tailwind CSS:

### Warning Types

1. **@custom-variant** - Unknown at rule
   - **Location**: `app/globals.css` and `styles/globals.css`
   - **Reason**: This is a Tailwind CSS directive for custom variant definitions
   - **Status**: ✅ Normal behavior - can be safely ignored

2. **@theme** - Unknown at rule
   - **Location**: `app/globals.css` and `styles/globals.css`
   - **Reason**: This is a Tailwind CSS directive for theme configuration
   - **Status**: ✅ Normal behavior - can be safely ignored

3. **@apply** - Unknown at rule
   - **Location**: `app/globals.css` and `styles/globals.css`
   - **Reason**: This is a Tailwind CSS directive for applying utility classes
   - **Status**: ✅ Normal behavior - can be safely ignored

### Why These Warnings Occur

These warnings appear because:
- The CSS linter/parser doesn't recognize Tailwind-specific at-rules
- Tailwind CSS processes these directives during build time
- The final compiled CSS doesn't contain these at-rules

### Resolution

**No action required** - these warnings do not affect:
- Application functionality
- Build process
- Runtime performance
- CSS compilation

The warnings can be suppressed by configuring your CSS linter to ignore Tailwind-specific at-rules, but this is optional.