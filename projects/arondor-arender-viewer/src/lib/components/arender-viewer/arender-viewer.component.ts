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

import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { MinimalNodeEntryEntity } from '@alfresco/js-api';
import {
  AppConfigService,
  AuthenticationService,
  EcmUserService,
  AlfrescoApiService,
  LogService
} from '@alfresco/adf-core';

import { ArenderService } from '../../services/arender.service';
import { ViewerExtensionInterface } from '@alfresco/adf-extensions';

@Component({
  selector: 'arender-viewer',
  templateUrl: './arender-viewer.component.html',
  styleUrls: ['./arender-viewer.component.scss'],
  host: { class: 'arender-viewer' },
  encapsulation: ViewEncapsulation.None
})
export class ArenderViewerComponent
  implements ViewerExtensionInterface, OnInit {
  node: MinimalNodeEntryEntity;
  url: string;
  nameFile: string;

  arenderUrl: SafeResourceUrl;
  ecmHost: SafeResourceUrl;
  alfTicket: string;
  uuid: string;
  versionLabel: string;
  userName: string;

  constructor(
    private apiService: AlfrescoApiService,
    private ecmUserService: EcmUserService,
    private authService: AuthenticationService,
    private appConfig: AppConfigService,
    private logService: LogService,
    private arenderService: ArenderService
  ) {}

  isSourceDefined(): boolean {
    return this.node.id ? true : false;
  }

  ngOnInit() {
    const onPromise = this.appConfig.get<boolean>('arender.onPromise');
    const documentbuilder = this.appConfig.get<boolean>(
      'arender.documentbuilder'
    );
    let userName: string;
    if (!onPromise) {
      let uuid: string;
      this.apiService
        .getInstance()
        .webScript.executeWebScript(
          'GET',
          'slingshot/doclib/action/arenderUpload',
          { nodeRef: 'workspace://SpacesStore/' + this.node.id },
          'alfresco',
          's'
        )
        .then(
          webScriptdata => {
            uuid = webScriptdata['UUID'];
            this.ecmUserService.getCurrentUserInfo().subscribe(u => {
              userName = u.id;
              this.arenderUrl = this.arenderService.buildArenderURL(
                uuid,
                userName,
                null,
                null,
                false,
                documentbuilder,
                false
              );
            });
          },
          error => {
            this.logService.log('Error' + error);
          }
        );
    } else {
      let alfTicket: string;
      let versionLabel: string;

      this.apiService
        .getInstance()
        .webScript.executeWebScript(
          'GET',
          'api/version',
          { nodeRef: 'workspace://SpacesStore/' + this.node.id },
          'alfresco',
          's'
        )
        .then(
          webScriptdata => {
            versionLabel = webScriptdata[0]['label'];

            this.ecmUserService.getCurrentUserInfo().subscribe(u => {
              userName = u.id;
              alfTicket = this.authService.getTicketEcm();
              this.arenderService
                .clearNodeCache(this.node.id, userName, versionLabel)
                // tslint:disable-next-line: prettier
                .subscribe(() => { }, () => { });
              this.arenderUrl = this.arenderService.buildArenderURL(
                this.node.id,
                userName,
                alfTicket,
                versionLabel,
                true,
                documentbuilder,
                false
              );
            });
          },
          error => {
            this.logService.log('Error' + error);
          }
        );
      if (!this.isSourceDefined()) {
        throw new Error('A content source attribute value is missing.');
      }
    }
  }
}
