import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    darkMode = signal(false);


    constructor() {
        effect(() => {
            document.documentElement.classList.toggle(
                'dark',
                this.darkMode()
            );
        });
    }


    toggle() {
        this.darkMode.update(value => !value);
    }
}