import { Component, signal } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight, LucideUpload, LucideAlertTriangle, LucidePlus, LucideX } from '@lucide/angular';
import { Tags } from '../../shared/models/tags';

@Component({
  selector: 'app-create-project',
  imports: [
    LucideChevronLeft,
    LucideChevronRight,
    LucideUpload,
    LucideAlertTriangle,
    LucidePlus,
    LucideX
  ],
  templateUrl: './create-project.html',
  styleUrl: './create-project.css',
})
export class CreateProject {
  projectName = 'Autonomous VTOL UAV Flight Controller';

  fakeTags = [
    'STM32',
    'C++',
    'Python',
    'Computer Vision',
    'PCB Design',
    'Embedded Linux'
  ];

  descriptionPlaceholder = 'Building an autonomous VTOL UAV platform. The C++ flight controller on STM32 handles sensor fusion, while an onboard Raspberry Pi runs Python/OpenCV for visual target tracking.';

  hazards = [
    'The main circuit board operates on high voltage / high current',
    'Always wear eye protection when testing high-RPM carbon propellers',
    'Wear a hard hat when launching the UAV outdoors, as it might fall on your head'
  ];
}
