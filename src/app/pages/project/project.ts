import { Component } from '@angular/core';
import {
  LucideHammer,
  LucideCircleCheckBig,
  LucideDoorOpen,
  LucideDoorClosed,
  LucideTrash
} from '@lucide/angular';
import { Ticket, TicketDifficulty, TicketStatus } from '../../shared/models/ticket';
import { Tags } from '../../shared/models/tags';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-project',
  imports: [
    LucideHammer,
    LucideCircleCheckBig,
    LucideDoorOpen,
    LucideDoorClosed,
    LucideTrash,
    RouterLink
  ],
  templateUrl: './project.html',
  styleUrl: './project.css',
})
export class Project {

  activeTab = 'tickets'; // details | tickets | settings (visible only to owner)

  readonly TicketStatus = TicketStatus;
  readonly TicketDifficulty = TicketDifficulty;

  readonly tickets: Ticket[] = [
    {
      id: 1,
      name: 'Implement STM32 FreeRTOS Motor Control Loop',
      status: TicketStatus.Done,
      difficulty: TicketDifficulty.Hard,
      description: 'Write C/C++ firmware using FreeRTOS tasks to control twin DC motors with dual quadrature encoder feedback via TIM peripheral.',
      tags: [Tags.C, Tags.CPP, Tags.STM32]
    },
    {
      id: 2,
      name: 'Build Python OpenCV Target Tracking Pipeline',
      status: TicketStatus.Taken,
      difficulty: TicketDifficulty.Medium,
      description: 'Develop a Python script using OpenCV to capture camera feeds, isolate target color/shapes, and send bounding box coordinates via UART.',
      tags: [Tags.Python, Tags.ComputerVision, Tags.AI]
    },
    {
      id: 3,
      name: 'Port PyTorch Model to TensorRT C++ Executable',
      status: TicketStatus.Open,
      difficulty: TicketDifficulty.Hard,
      description: 'Convert trained PyTorch object detection model weights into an ONNX/TensorRT pipeline to achieve >30 FPS on edge hardware.',
      tags: [Tags.CPP, Tags.AI, Tags.ML]
    },
    {
      id: 4,
      name: 'Design Telemetry REST API & PostgreSQL Schema',
      status: TicketStatus.Open,
      difficulty: TicketDifficulty.Medium,
      description: 'Create ASP.NET Core endpoints to receive, validate, and store sensor data streams into PostgreSQL with time-series indexing.',
      tags: [Tags.ASPNET, Tags.PostgreSQL, Tags.CSharp]
    },
    {
      id: 5,
      name: 'Build Angular Dashboard for Telemetry Stream',
      status: TicketStatus.Open,
      difficulty: TicketDifficulty.Medium,
      description: 'Develop responsive Angular components with chart integration to visualize real-time motor speed, temperature, and battery telemetry.',
      tags: [Tags.Angular, Tags.ASPNET]
    },
    {
      id: 6,
      name: 'Document UART Data Packet Protocol Spec',
      status: TicketStatus.Open,
      difficulty: TicketDifficulty.Easy,
      description: 'Write full technical specification for the custom UART packet frame structure (Header, Payload, CRC16 Checksum) in Markdown format.',
      tags: [Tags.Documentation]
    }

  ]

}
