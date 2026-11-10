import { Component,  AfterViewInit,  inject, computed,  signal, viewChild, ElementRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

type Modo = 'login' | 'registro';
type CampoFormulario = 'nombre' | 'email' | 'password' | 'confirmar';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login  implements AfterViewInit
{

     private readonly router = inject(Router);

     private readonly fb = inject(FormBuilder);

     protected readonly modo = signal<Modo>('login');

     private readonly emailInput = viewChild<ElementRef<HTMLInputElement>>('emailInput');

     protected readonly esRegistro = computed(() => this.modo() === 'registro');

     protected readonly cargando = signal(false);

     protected readonly error = signal('');

     protected readonly erroresCampo = signal<Record<string, string[]>>({});

     protected readonly verPassword = signal(false);

     protected readonly titulo = computed(() =>

      this.esRegistro() ? 'Crea tu cuenta' : 'Bienvenido de nuevo',
    );

     protected readonly subtitulo = computed(() =>
     this.esRegistro()
      ? 'Regístrate una vez y empieza a gestionar el inventario.'
      : 'Inicia sesión para acceder al CRUD de productos.',
    );



    protected readonly form = this.fb.nonNullable.group({
        nombre: [''],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
        confirmar: [''],
   });

   ngAfterViewInit(): void {
     this.emailInput()?.nativeElement.focus();
  }

   protected cambiarModo(modo: Modo): void {
    if (this.cargando() || modo === this.modo()) return;

    this.modo.set(modo);
    this.error.set('');
    this.erroresCampo.set({});
    this.form.patchValue({ password: '', confirmar: '' });
  }

    public send():void
    {
        const esRegistro = this.esRegistro();
        const clavesDistintas =
        esRegistro && this.form.controls.password.value !== this.form.controls.confirmar.value;

        if (this.form.invalid || clavesDistintas) {
          this.form.markAllAsTouched();
          this.error.set('Revisa los campos marcados antes de continuar.');
          return;
        }

        const valores = this.form.getRawValue();
        this.cargando.set(true);
        this.error.set('');
        this.erroresCampo.set({});


    }


    protected mensajeCampo(campo: CampoFormulario): string
    {

          return '';

     }

   protected mensajeConfirmar(): string {
    if (!this.esRegistro()) return '';

    const confirmar = this.form.controls.confirmar;
    if (!confirmar.touched && !confirmar.dirty) return '';

    return this.form.controls.password.value === confirmar.value
      ? ''
      : 'Las contraseñas no coinciden.';
  }

}
