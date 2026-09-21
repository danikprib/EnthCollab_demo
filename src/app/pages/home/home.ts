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
    {
      id: 1,
      title: 'What is EnthCollab?',
      content: [
        'EnthCollab is a platform connecting developers, hardware engineers, and creators to build real-world software and hardware projects together to build portfolio-ready applications.'
      ]
    },
    {
      id: 2,
      title: 'Who owns the Intellectual Property (IP) created in projects?',
      content: [
        'All IP created during collaboration belongs to the project team members according to the open-source or custom license defined by the project creator.'
      ]
    },
    {
      id: 3,
      title: 'Is EnthCollab completely free to use?',
      content: [
        'Yes, EnthCollab is 100% free for individual developers, hardware hobbyists, and open-source project creators looking to build teams.'
      ]
    },
    {
      id: 4,
      title: 'How do project applications work?',
      content: [
        'Project owners post open positions with required tech stacks (e.g., C++, STM32, Angular). You apply directly with your profile, and the project lead reviews and accepts candidates.'
      ]
    },
    {
      id: 5,
      title: 'What hardware/UAV safety guidelines should projects follow?',
      content: [
        'Hardware and drone/UAV projects must clearly document physical safety hazards, operating voltages, and propeller warnings in the project outline.'
      ]
    }
  ];
}
