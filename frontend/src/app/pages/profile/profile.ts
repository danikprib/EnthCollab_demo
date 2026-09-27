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
  LucideThumbsUp,
  LucideHeart,
  LucideMessagesSquare,
  LucideCalendar,
  LucideHammer,
  LucideCirclePlus
} from '@lucide/angular';
import { Project, ProjectStatus } from '../../shared/models/project';
import { Tags } from '../../shared/models/tags';
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
    LucideThumbsUp,
    LucideHeart,
    LucideMessagesSquare,
    LucideCalendar,
    LucideHammer,
    LucideCirclePlus,
    RouterLink
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  readonly ProjectStatus = ProjectStatus;

  activeTab = 'projects';

  readonly projects: Project[] = [
    {
      id: 1,
      name: 'Autonomous UGV Target Tracker',
      status: ProjectStatus.WIP,
      visibility: 'Public',
      description: 'STM32-based ground rover with real-time motor control and serial interface. Needs an engineer to write the higher-level Python OpenCV object tracking pipeline.',
      tags: [Tags.STM32, Tags.CPP, Tags.Python, Tags.ComputerVision]
    },
    {
      id: 2,
      name: 'Edge AI Wildlife Detection Unit',
      status: ProjectStatus.Cancelled,
      visibility: 'Public',
      description: 'Solar-powered remote camera trap. PyTorch model is trained, but needs low-level C++ optimization for deployment on Jetson/Cortex-M microcontrollers.',
      tags: [Tags.AI, Tags.ML, Tags.CPP, Tags.Python]
    },
    {
      id: 3,
      name: 'CAN Bus Telemetry Dashboard',
      status: ProjectStatus.WIP,
      visibility: 'Public',
      description: 'Web dashboard for parsing vehicle sensor metrics over OBD-II/CAN bus. Embedded C side reads frames; Angular/ASP.NET side stores and renders telemetry streams.',
      tags: [Tags.C, Tags.ASPNET, Tags.Angular, Tags.PostgreSQL]
    },
    {
      id: 4,
      name: 'SDR RF Spectrum Analyzer',
      status: ProjectStatus.Frozen,
      visibility: 'Public',
      description: 'Web-based real-time RF waterfall graph renderer. C++ engine captures raw USB I/Q samples, ASP.NET backend streams data over WebSockets to an Angular front-end.',
      tags: [Tags.CPP, Tags.ASPNET, Tags.Angular, Tags.Documentation]
    }
  ];
}
