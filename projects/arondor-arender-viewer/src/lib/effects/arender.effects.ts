/*!
 * @license
 * Alfresco Example Content Application
 *
 * Copyright (C) 2005 - 2020 Alfresco Software Limited
 *
 * This file is part of the Alfresco Example Content Application.
 * If the software was purchased under a paid Alfresco license, the terms of
 * the paid license agreement will prevail.  Otherwise, the software is
 * provided under the following open source license terms:
 *
 * The Alfresco Example Content Application is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Alfresco Example Content Application is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

import { Effect, Actions, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppStore, getAppSelection } from '@alfresco/aca-shared/store';
import { MinimalNodeEntity } from '@alfresco/js-api';

import {
  ArenderCompareAction,
  ArenderOpenAction,
  ARENDER_COMPARE,
  ARENDER_OPEN
} from '../actions/arender.actions';

import { ArenderService } from '../services/arender.service';

@Injectable()
export class ArenderEffects {
  constructor(
    private store: Store<AppStore>,
    private actions$: Actions,
    private arenderService: ArenderService
  ) { }

  @Effect({ dispatch: false })
  compareNodes$ = this.actions$.pipe(
    ofType<ArenderCompareAction>(ARENDER_COMPARE),
    map(action => {
      if (action.payload && action.payload.length > 0) {
        this.arenderService.compare(action.payload);
      } else {
        this.store
          .select(getAppSelection)
          .pipe(take(1))
          .subscribe(selection => {
            if (selection && !selection.isEmpty) {
              this.arenderService.compare(selection.nodes);
            }
          });
      }
    })
  );

  @Effect({ dispatch: false })
  openInArenderNodes$ = this.actions$.pipe(
    ofType<ArenderOpenAction>(ARENDER_OPEN),
    map(action => {
      if (action.payload && action.payload.length > 0) {
        this.arenderService.openInWindow(action.payload);
      } else {
        this.store
          .select(getAppSelection)
          .pipe(take(1))
          .subscribe(selection => {
            if (selection && !selection.isEmpty) {
              this.openNodesInARender(selection.nodes);
            }
          });
      }
    })
  );

  private openNodesInARender(nodes: Array<MinimalNodeEntity>) {
    if (!nodes || nodes.length === 0) {
      return;
    }

    if (nodes.length === 1) {
      this.arenderService.openInWindow(nodes);
    } else {
      this.arenderService.openMultiDoc(nodes);
    }
  }
}
