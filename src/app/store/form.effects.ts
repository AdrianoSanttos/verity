import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as FormActions from './form.actions';
import { CepService } from '../services/cep.service';
import { ProfessionService } from '../services/profession.service';

@Injectable()
export class FormEffects {

  loadAddressByCep$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FormActions.loadAddressByCep),
      switchMap(action =>
        this.cepService.getAddressByCep(action.cep).pipe(
          map(address => FormActions.loadAddressByCepSuccess({ address })),
          catchError(error => of(FormActions.loadAddressByCepFailure({ error: error.message })))
        )
      )
    )
  );

  loadProfessions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FormActions.loadProfessions),
      switchMap(() =>
        this.professionService.getProfessions().pipe(
          map(professions => FormActions.loadProfessionsSuccess({ professions })),
          catchError(error => of(FormActions.loadProfessionsFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly cepService: CepService,
    private readonly professionService: ProfessionService
  ) {}
}