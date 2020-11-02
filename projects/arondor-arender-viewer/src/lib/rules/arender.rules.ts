import { RuleContext } from '@alfresco/adf-extensions';

export interface ARenderContext extends RuleContext {
  appConfig: {
    config: {
      arender: {
        allowedGroups: string[]
      }
    }
  }
}

/**
 * Checks if user can compare selected file.
 * JSON ref: `app.selection.canCompareFile`
 */
export function canCompareFile(context: RuleContext): boolean {
  if (context.selection.count === 2) {
    for (const n of context.selection.nodes) {
      if (!n.entry.isFile) {
        return false;
      }
    }
    return true;
  }
  return false;
}

export function isARenderGroupMember(context: ARenderContext): boolean {
  const arenderGroups = context.appConfig.config.arender.allowedGroups;
  if (arenderGroups.length > 0) {
    for (const g of context.profile.groups) {
      if (arenderGroups.indexOf(g.id) > -1) {
        return true;
      }
    }
  } else {
    return true;
  }
  return false;
}
