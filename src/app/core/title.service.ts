import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class TitleService {

  private title = inject(Title);

  private baseTitle = 'TaskPad';

  setTitle(pageTitle: string) {
    this.title.setTitle(`${pageTitle} | ${this.baseTitle}`);
  }

  setDefaultTitle() {
    this.title.setTitle(this.baseTitle);
  }
}
