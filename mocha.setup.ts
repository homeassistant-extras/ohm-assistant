import { JSDOM } from 'jsdom';

declare global {
  interface Window {
    customCards: Array<Object>;
    matchMedia: (query: string) => MediaQueryList;
  }
}

// Mock chartjs-adapter-date-fns to prevent date-fns dependency issues in tests
const mockAdapter = {
  _date: () => new Date(),
  _adapter: {
    override: () => {},
  },
};

// Mock the module before any imports
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id: string) {
  if (id === 'chartjs-adapter-date-fns') {
    return mockAdapter;
  }
  return originalRequire.apply(this, arguments);
};

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

// Mock getComputedStyle to support CSS variable resolution in tests
global.getComputedStyle = (element: Element): CSSStyleDeclaration => {
  const mockStyle = {
    getPropertyValue: (property: string): string => {
      // Check element's inline styles first
      if (element instanceof HTMLElement && element.style.getPropertyValue(property)) {
        return element.style.getPropertyValue(property);
      }
      // Fall back to document root CSS variables
      return dom.window.document.documentElement.style.getPropertyValue(property) || '';
    },
  } as CSSStyleDeclaration;
  return mockStyle;
};
