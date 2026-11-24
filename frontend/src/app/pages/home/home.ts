import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideBot,
  LucideFolderKanban,
  LucideCheckSquare,
  LucideSparkles,
  LucideCompass,
  LucideArrowRight,
  LucideShieldAlert,
} from '@lucide/angular';
import { Accordion, FaqItem } from '../../shared/components/accordion/accordion';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    Accordion,
    LucideBot,
    LucideFolderKanban,
    LucideCheckSquare,
    LucideSparkles,
    LucideCompass,
    LucideArrowRight,
    LucideShieldAlert,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  scrollToSection(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  homeFaqList: FaqItem[] = [
    {
      id: 1,
      title: 'Who owns the Intellectual Property (IP) created in projects?',
      content: [
        'All Intellectual Property (IP) created during collaboration belongs to the project team members according to the open-source or custom license defined by the project creator.'
      ]
    },
    {
      id: 2,
      title: 'Is EnthCollab completely free to use?',
      content: [
        'Yes, EnthCollab is 100% free for individual developers, hardware hobbyists, and open-source project creators looking to build teams. There is no payment system.'
      ]
    },
  ];
}