import { Component } from '@angular/core';
import {
  LucideUser,
  LucideCircleUserRound,
  LucideTriangle,
  LucideCircleCheckBig,
  LucideCirclePause,
  LucideSquareX,
  LucideMail,
  LucideIdCard,
} from '@lucide/angular';
import { Project, ProjectStatus } from '../../shared/models/project';
import { RouterLink } from '@angular/router';




@Component({
  selector: 'app-profile',
  imports: [
    LucideUser,
    LucideCircleUserRound,
    LucideTriangle,
    LucideCircleCheckBig,
    LucideCirclePause,
    LucideSquareX,
    LucideMail,
    LucideIdCard,
    RouterLink
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  readonly ProjectStatus = ProjectStatus;

  activeTab = 'account';

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
