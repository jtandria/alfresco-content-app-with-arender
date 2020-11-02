import { ExtensionService } from '@alfresco/adf-extensions';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';

import { ArenderService } from './services/arender.service';
import { ArenderEffects } from './effects/arender.effects';

import * as rules from './rules/arender.rules';

import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  ToolbarModule,
  MimeTypeIconPipe,
  TranslationService
} from '@alfresco/adf-core';
import { ArenderViewerComponent } from './components/arender-viewer/arender-viewer.component';

@NgModule({
  imports: [
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    ToolbarModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    EffectsModule.forFeature([ArenderEffects])
  ],
  declarations: [ArenderViewerComponent],
  entryComponents: [ArenderViewerComponent],
  exports: [ArenderViewerComponent],
  providers: [
    ArenderService,
    { provide: MimeTypeIconPipe, useClass: MimeTypeIconPipe }
  ]
})
export class ArenderExtensionModule {
  constructor(extensions: ExtensionService, translation: TranslationService) {
    translation.addTranslationFolder('arender-viewer', 'assets/arender-viewer');
    extensions.setEvaluators({
      'app.selection.canCompareFile': rules.canCompareFile,
      'app.arender.allowed': rules.isARenderGroupMember
    });
    extensions.setComponents({
      'app.arender.viewer': ArenderViewerComponent
    });
  }
}
