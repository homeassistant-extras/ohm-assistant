import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});

global.window = dom.window as any;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;
global.CustomEvent = dom.window.CustomEvent;

global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return setTimeout(callback, 0) as any;
};

global.cancelAnimationFrame = (id: number): void => {
  clearTimeout(id);
};

global.window.matchMedia = (): MediaQueryList => {
  return {
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  } as MediaQueryList;
};
