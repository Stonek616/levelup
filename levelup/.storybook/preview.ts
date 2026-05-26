import type { Preview } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import docJson from '../documentation.json';

setCompodocJson(docJson);

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [provideRouter([]), provideHttpClient()],
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1c1917' },
        { name: 'light', value: '#faf7f2' },
      ],
    },
  },
};

export default preview;
