export class MobileControls {
  private container: HTMLDivElement;
  left = false;
  right = false;
  jump = false;
  attack = false;
  abilityQ = false;
  abilityE = false;
  enabled = false;

  constructor() {
    this.container = document.getElementById('controls') as HTMLDivElement;
    const left = document.getElementById('left') as HTMLDivElement;
    const jump = document.getElementById('jump') as HTMLDivElement;
    const attack = document.getElementById('attack') as HTMLDivElement;
    const abilityQ = document.getElementById('abilityQ') as HTMLDivElement;
    const abilityE = document.getElementById('abilityE') as HTMLDivElement;

    const hold = (el: HTMLElement, setter: (v: boolean) => void) => {
      const on = (e: Event) => { e.preventDefault(); setter(true); };
      const off = (e: Event) => { e.preventDefault(); setter(false); };
      el.addEventListener('pointerdown', on);
      el.addEventListener('pointerup', off);
      el.addEventListener('pointerleave', off);
      el.addEventListener('pointercancel', off);
    };

    hold(left, (v) => { this.left = v; this.right = false; });

    // Swipe to the right half toggles right
    left.addEventListener('pointermove', (e) => {
      if ((e as PointerEvent).pressures && (e as PointerEvent).pressure === 0) return;
      const rect = left.getBoundingClientRect();
      const x = (e as PointerEvent).clientX - rect.left;
      this.left = x < rect.width / 2;
      this.right = !this.left;
    });

    hold(jump, (v) => { this.jump = v; });
    hold(attack, (v) => { this.attack = v; });
    hold(abilityQ, (v) => { this.abilityQ = v; });
    hold(abilityE, (v) => { this.abilityE = v; });
  }

  show(): void {
    this.enabled = true;
    this.container.style.display = 'block';
  }

  hide(): void {
    this.enabled = false;
    this.container.style.display = 'none';
  }
}