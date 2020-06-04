/*!
 * @license
 * Arondor
 */

import { Action } from '@ngrx/store';
import { MinimalNodeEntity } from '@alfresco/js-api';

export const ARENDER_COMPARE = 'ARENDER_COMPARE';
export const ARENDER_OPEN = 'ARENDER_OPEN';

export class ArenderCompareAction implements Action {
  readonly type = ARENDER_COMPARE;
  constructor(public payload: Array<MinimalNodeEntity>) {}
}

export class ArenderOpenAction implements Action {
  readonly type = ARENDER_OPEN;
  constructor(public payload: Array<MinimalNodeEntity>) {}
}
