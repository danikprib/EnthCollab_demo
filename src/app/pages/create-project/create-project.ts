import { Component, HostListener, signal } from '@angular/core';
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideUpload,
  LucideAlertTriangle,
  LucidePlus,
  LucideX
} from '@lucide/angular';


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
  readonly images = [
    'https://picsum.photos/id/10/1200/700',
    'https://picsum.photos/id/20/1200/700',
    'https://picsum.photos/id/30/1200/700',
    'https://picsum.photos/id/40/1200/700',
    'https://picsum.photos/id/50/1200/700'
  ];

  readonly currentImageIndex = signal(0);
  readonly isImageFullscreen = signal(false);

  readonly tags = ['C++', 'STM32', 'Computer Vision'];

  readonly descriptionPlaceholder =
    'This is the project description placeholder.';

  get currentImage(): string {
    return this.images[this.currentImageIndex()];
  }

  previousImage(): void {
    this.currentImageIndex.update(index =>
      index === 0 ? this.images.length - 1 : index - 1
    );
  }

  nextImage(): void {
    this.currentImageIndex.update(index =>
      index === this.images.length - 1 ? 0 : index + 1
    );
  }

  selectImage(index: number): void {
    this.currentImageIndex.set(index);
  }

  openImageFullscreen(): void {
    this.isImageFullscreen.set(true);
  }

  closeImageFullscreen(): void {
    this.isImageFullscreen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isImageFullscreen()) {
      this.closeImageFullscreen();
    }
  }
}
