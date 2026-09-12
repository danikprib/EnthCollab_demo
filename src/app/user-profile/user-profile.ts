import { Component } from '@angular/core';
import {
  LucideUser,
  LucideTriangle,
  LucideCircleCheckBig,
  LucideCirclePause,
  LucideSquareX
} from '@lucide/angular';
import { Project, ProjectStatus } from '../models/project';




@Component({
  selector: 'app-user-profile',
  imports: [
    LucideUser,
    LucideTriangle,
    LucideCircleCheckBig,
    LucideCirclePause,
    LucideSquareX,
    
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile {

  readonly ProjectStatus = ProjectStatus;

  activeTab = 'projects';

  readonly projects: Project[] = [
  {
    id: 1,
    name: 'Autonomous UGV',
    status: ProjectStatus.Finished,
    visibility: 'Public',
    description: 'its a ugv',
    tags: ['STM32', 'C++', 'Python']
  },
  {
    id: 2,
    name: 'ScienceCalc',
    status: ProjectStatus.WIP,
    visibility: 'Private',
    description: 'its a science application',
    tags: ['Angular', 'ASP.NET', 'PostgreSQL']
  }
];
}
