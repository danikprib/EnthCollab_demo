import { Component, input, signal } from '@angular/core';
import { LucideChevronUp, LucideChevronDown } from '@lucide/angular';

export interface FaqItem {
  id: number;
  title: string;
  content: string[];
}

@Component({
  selector: 'app-accordion',
  imports: [
    LucideChevronUp,
     LucideChevronDown
    ],
  templateUrl: './accordion.html',
  styleUrl: './accordion.css',
})
export class Accordion {

  items = input.required<FaqItem[]>();

  expandedIds = signal<Set<number>>(new Set());

  toggleItem(id: number): void {
    this.expandedIds.update(set => {
      const updated = new Set(set);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  }

  isOpen(id: number): boolean {
    return this.expandedIds().has(id);
  }
}
