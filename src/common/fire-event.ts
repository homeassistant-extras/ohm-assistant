export interface HASSDomEvents {
  'config-changed': { config: any };
  'hass-more-info': { entityId: string };
}

export type ValidHassDomEvent = keyof HASSDomEvents;

export const fireEvent = <HassEvent extends ValidHassDomEvent>(
  element: HTMLElement | Window,
  type: HassEvent,
  detail?: HASSDomEvents[HassEvent],
): CustomEvent => {
  const event = new CustomEvent(type, {
    bubbles: true,
    composed: true,
    detail,
  });
  element.dispatchEvent(event);
  return event;
};
