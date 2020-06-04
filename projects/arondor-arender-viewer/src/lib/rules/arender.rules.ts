import { RuleContext } from '@alfresco/adf-extensions';

/**
 * Checks if user can compare selected file.
 * JSON ref: `app.selection.canCompareFile`
 */
export function canCompareFile(context: RuleContext): boolean {
  if (context.selection.count === 2) {
    return true;
  }
  return false;
}
