import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { NgxMaskConfig, provideNgxMask } from 'ngx-mask';

import { FormEffects } from './store/form.effects';
import { formReducer } from './store/form.reducer';

const maskConfig: Partial<NgxMaskConfig> = {
  validation: false,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([]),
    provideHttpClient(),
    provideStore({ form: formReducer }),
    provideEffects([FormEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      autoPause: true,
      trace: false,
      traceLimit: 75
    }),
    provideNgxMask(maskConfig)
  ]
};