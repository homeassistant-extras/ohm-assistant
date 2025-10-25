import { expect } from 'chai';
import { describe, it } from 'mocha';
import { renderError } from '../../src/html/no-good';

describe('no-good', () => {
  describe('renderError', () => {
    it('should render error message with default title', () => {
      const errorMessage = 'Something went wrong';

      const result = renderError(errorMessage);

      expect(result).to.have.property('strings');
      expect(result).to.have.property('values');

      const template = result as any;
      const templateString = template.strings.join('');

      // Check that the error message is included in values
      expect(template.values).to.include(errorMessage);
      expect(templateString).to.include('Energy Consumption');
    });

    it('should render error with card structure', () => {
      const errorMessage = 'Test error';

      const result = renderError(errorMessage);

      expect(result).to.not.be.undefined;
      const template = result as any;
      const templateString = template.strings.join('');

      // Check for card structure elements
      expect(templateString).to.include('card-content');
      expect(templateString).to.include('card-header');
      expect(templateString).to.include('card-title');
      expect(templateString).to.include('error');
    });

    it('should handle empty error message', () => {
      const result = renderError('');
      const template = result as any;
      const templateString = template.strings.join('');

      expect(result).to.not.be.undefined;

      // Should still render the card structure
      expect(templateString).to.include('card-content');
      expect(templateString).to.include('Energy Consumption');
    });

    it('should handle long error messages', () => {
      const longErrorMessage =
        'This is a very long error message that might contain multiple lines and detailed information about what went wrong with the energy consumption card rendering process';

      const result = renderError(longErrorMessage);
      const template = result as any;

      expect(result).to.not.be.undefined;

      expect(template.values).to.include(longErrorMessage);
      expect(template.strings.join('')).to.include('Energy Consumption');
    });

    it('should handle error messages with special characters', () => {
      const specialErrorMessage =
        'Error: "Invalid JSON" & <script>alert("xss")</script>';

      const result = renderError(specialErrorMessage);
      const template = result as any;

      expect(result).to.not.be.undefined;

      expect(template.values).to.include(specialErrorMessage);
    });

    it('should handle error messages with HTML-like content', () => {
      const htmlErrorMessage = '<div>Error: Invalid configuration</div>';

      const result = renderError(htmlErrorMessage);
      const template = result as any;

      expect(result).to.not.be.undefined;

      expect(template.values).to.include(htmlErrorMessage);
    });

    it('should handle error messages with newlines', () => {
      const multilineErrorMessage =
        'Error occurred:\nLine 1: Invalid data\nLine 2: Missing configuration';

      const result = renderError(multilineErrorMessage);
      const template = result as any;

      expect(result).to.not.be.undefined;

      expect(template.values).to.include(multilineErrorMessage);
    });

    it('should always include the default title', () => {
      const errorMessages = [
        'Simple error',
        'Complex error with details',
        '',
        'Error with special chars: &<>"\'',
      ];

      errorMessages.forEach((message) => {
        const result = renderError(message);
        const template = result as any;
        const templateString = template.strings.join('');

        expect(result).to.not.be.undefined;

        expect(templateString).to.include('Energy Consumption');
      });
    });

    it('should return consistent template structure', () => {
      const errorMessage = 'Test error';

      const result1 = renderError(errorMessage);
      const result2 = renderError(errorMessage);

      // Both results should have the same structure
      expect(result1).to.have.property('strings');
      expect(result1).to.have.property('values');
      expect(result2).to.have.property('strings');
      expect(result2).to.have.property('values');

      const template1 = result1 as any;
      const template2 = result2 as any;

      expect(template1.strings).to.be.an('array');
      expect(template2.strings).to.be.an('array');
      expect(template1.strings.length).to.equal(template2.strings.length);
    });

    it('should handle different error types', () => {
      const errorTypes = [
        'Network error',
        'Configuration error',
        'Data parsing error',
        'Authentication error',
        'Permission denied',
        'Timeout error',
        'Unknown error',
      ];

      errorTypes.forEach((errorType) => {
        const result = renderError(errorType);
        const template = result as any;
        const templateString = template.strings.join('');

        expect(result).to.not.be.undefined;

        expect(template.values).to.include(errorType);
        expect(templateString).to.include('Energy Consumption');
      });
    });

    it('should maintain proper HTML structure', () => {
      const errorMessage = 'Test error';

      const result = renderError(errorMessage);
      const template = result as any;
      const templateString = template.strings.join('');

      expect(result).to.not.be.undefined;

      // Check for proper HTML structure
      expect(templateString).to.include('<div class="card-content">');
      expect(templateString).to.include('<div class="card-header">');
      expect(templateString).to.include('<h2 class="card-title">');
      expect(templateString).to.include('<div class="error">');
    });
  });
});
