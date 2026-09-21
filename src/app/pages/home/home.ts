import { Component } from '@angular/core';
import { Accordion, FaqItem } from '../../shared/components/accordion/accordion';

@Component({
  selector: 'app-home',
  imports: [
    Accordion,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  homeFaqList: FaqItem[] = [
    { id: 1, title: 'What is EnthCollab?', content: ['A platform for enthusiasts.'] },
    { id: 2, title: 'How to use?', content: ['Build projects, find teams.'] }
  ];
}
