import { Injectable } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { MinimalNodeEntity, SharedLink } from '@alfresco/js-api';
import {
  AppConfigService,
  AlfrescoApiService,
  EcmUserService,
  AuthenticationService
  //  LogService
} from '@alfresco/adf-core';
import { from, Observable, forkJoin } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ArenderService {
  constructor(
    private apiService: AlfrescoApiService,
    private ecmUserService: EcmUserService,
    private authService: AuthenticationService,
    private appConfig: AppConfigService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) { }

  private getDocId(node: any): string {
    if (node instanceof SharedLink) {
      return node.nodeId
    } else {
      return node.id
    }
  }

  logout() {
    const arenderHost = this.appConfig.get<string>('arender.host');
    return this.http.get(arenderHost + 'arendergwt/destroySession');
  }

  openInWindow(nodes: Array<MinimalNodeEntity>) {
    let url: string;
    const onPromise = this.appConfig.get<boolean>('arender.onPromise');
    const documentbuilder = this.appConfig.get<boolean>(
      'arender.documentbuilder'
    );
    const isFolder = nodes[0].entry.isFolder;
    const id = this.getDocId(nodes[0].entry);

    let userName: string;
    if (!onPromise) {
      let uuid: string;
      from(
        this.apiService
          .getInstance()
          .webScript.executeWebScript(
            'GET',
            'slingshot/doclib/action/arenderUpload',
            { nodeRef: 'workspace://SpacesStore/' + id },
            'alfresco',
            's'
          )
      ).subscribe(
        webScriptdata => {
          uuid = webScriptdata['UUID'];
          this.ecmUserService.getCurrentUserInfo().subscribe(u => {
            userName = u.id;
            url = this.buildArenderURLString(
              uuid,
              userName,
              null,
              null,
              false,
              documentbuilder,
              isFolder
            );
            window.open(url.toString(), '_blank');
          });
        },
        () => { }
      );
    } else {
      let alfTicket: string;
      let versionLabel: string;

      if (isFolder) {
        this.ecmUserService.getCurrentUserInfo().subscribe(u => {
          userName = u.id;
          alfTicket = this.authService.getTicketEcm();
          this.clearNodeCache(
            id,
            userName,
            versionLabel
          ).subscribe(() => { }, () => { });
          url = this.buildArenderURLString(
            id,
            userName,
            alfTicket,
            null,
            true,
            false,
            isFolder
          );
          window.open(url.toString(), '_blank');
        });
      } else {
        this.apiService
          .getInstance()
          .webScript.executeWebScript(
            'GET',
            'api/version',
            { nodeRef: 'workspace://SpacesStore/' + id },
            'alfresco',
            's'
          )
          .then(
            webScriptdata => {
              versionLabel = webScriptdata[0]['label'];

              this.ecmUserService.getCurrentUserInfo().subscribe(u => {
                userName = u.id;
                alfTicket = this.authService.getTicketEcm();
                this.clearNodeCache(
                  id,
                  userName,
                  versionLabel
                ).subscribe(() => { }, () => { });
                url = this.buildArenderURLString(
                  id,
                  userName,
                  alfTicket,
                  versionLabel,
                  true,
                  documentbuilder,
                  isFolder
                );
                window.open(url.toString(), '_blank');
              });
            },
            () => { }
          );
      }
    }
  }

  compare(nodes: Array<MinimalNodeEntity>) {
    const arenderHost = this.appConfig.get<string>('arender.host');
    let alfTicket: string;
    let userName: string;
    let url: SafeResourceUrl;
    this.ecmUserService.getCurrentUserInfo().subscribe(u => {
      alfTicket = this.authService.getTicketEcm();
      url = arenderHost + '?docs=';
      userName = u.id;

      // let versions: Observable<any> = of({});
      const versions = forkJoin(
        this.getVersion(nodes[0]),
        this.getVersion(nodes[1])
      );

      versions.subscribe(data => {
        url +=
          'workspace://SpacesStore/' +
          this.getDocId(nodes[0].entry) +
          ';' +
          data[0][0]['label'] +
          ',';
        url +=
          'workspace://SpacesStore/' +
          this.getDocId(nodes[1].entry) +
          ';' +
          data[1][0]['label'];
        url +=
          '&visualization.multiView.doComparison=true&user=' +
          userName +
          '&alf_ticket=' +
          alfTicket;
        window.open(url.toString(), '_blank');
      });
    });
  }

  getVersion(node: MinimalNodeEntity): Observable<any> {
    return from(
      this.apiService
        .getInstance()
        .webScript.executeWebScript(
          'GET',
          'api/version',
          { nodeRef: 'workspace://SpacesStore/' + this.getDocId(node.entry) },
          'alfresco',
          's'
        )
    );
  }

  clearNodeCache(
    nodeId: string,
    userName: string,
    versionLabel: string
  ): Observable<Object> {
    const arenderHost = this.appConfig.get<string>('arender.host');
    const args =
      'nodeRef=workspace://SpacesStore/' +
      nodeId +
      '&user=' +
      userName +
      '&versionLabel=' +
      versionLabel;
    const nodeRefB64 = 'b64_' + btoa(args);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'Content-Type: text/html;charset=UTF-8'
      })
    };
    return this.http.get(
      arenderHost + 'evictDocument.jsp?uuid=*' + nodeRefB64 + '*',
      httpOptions
    );
  }

  openMultiDoc(nodes: Array<MinimalNodeEntity>) {
    let alfTicket: string;
    let userName: string;
    this.ecmUserService.getCurrentUserInfo().subscribe(u => {
      alfTicket = this.authService.getTicketEcm();
      userName = u.id;

      const versionsArray: Observable<any>[] = [];
      nodes.forEach(node => {
        versionsArray.push(this.getVersion(node));
      });
      const versions = forkJoin(versionsArray);
      versions.subscribe(data => {
        this.getFolderUUID(nodes, userName, data, alfTicket).subscribe(uuid => {
          const arenderHost = this.appConfig.get<string>('arender.host');
          const url = arenderHost + '?uuid=' + uuid;
          window.open(url.toString(), '_blank');
        });
      });
    });
  }

  getFolderUUID(
    nodes: Array<MinimalNodeEntity>,
    userName: string,
    version: any,
    alf_ticket: string
  ): Observable<Object> {
    const arenderHost = this.appConfig.get<string>('arender.host');
    const queryUrls = [];

    for (let i = 0; i < nodes.length; i++) {
      queryUrls.push({
        queryUrl: 'loadingQuery' + this.buildArenderURLParameters(
          this.getDocId(nodes[i].entry),
          userName,
          alf_ticket,
          version[i][0]['label'],
          true,
          false,
          nodes[i].entry.isFolder
        )
      });
    }
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'text/plain'
    });

    return this.http.post(
      arenderHost + 'arendergwt/compositeAccessorServlet',
      {
        references: queryUrls
      },
      {
        headers: httpHeaders,
        responseType: 'text'
      }
    );
  }

  buildArenderURL(
    nodeId: string,
    userName: string,
    alfTicket: string,
    versionLabel: string,
    onPromise: boolean,
    documentbuilder: boolean,
    isFolder: boolean
  ): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      this.buildArenderURLString(
        nodeId,
        userName,
        alfTicket,
        versionLabel,
        onPromise,
        documentbuilder,
        isFolder
      )
    );
  }

  buildArenderURLParameters(
    nodeId: string,
    userName: string,
    alfTicket: string,
    versionLabel: string,
    onPromise: boolean,
    documentbuilder: boolean,
    isFolder: boolean
  ): string {
    let arenderURL = (onPromise === true ? '?nodeRef=workspace://SpacesStore/' : '?uuid=') + nodeId;
    arenderURL = arenderURL + '&user=' + userName;
    if (alfTicket != null) {
      arenderURL = arenderURL + '&alf_ticket=' + alfTicket;
    }
    if (versionLabel != null) {
      arenderURL = arenderURL + '&versionLabel=' + versionLabel;
    }
    if (documentbuilder) {
      arenderURL = arenderURL + '&documentbuilder.enabled=' + documentbuilder;
    }
    if (isFolder) {
      arenderURL = arenderURL + '&folder=' + isFolder;
    }
    return arenderURL;
  }

  buildArenderURLString(
    nodeId: string,
    userName: string,
    alfTicket: string,
    versionLabel: string,
    onPromise: boolean,
    documentbuilder: boolean,
    isFolder: boolean
  ): string {
    const arenderHost = this.appConfig.get<string>('arender.host');
    const arenderURL = arenderHost + this.buildArenderURLParameters(
      nodeId,
      userName,
      alfTicket,
      versionLabel,
      onPromise,
      documentbuilder,
      isFolder
    );
    return arenderURL;
  }
}
