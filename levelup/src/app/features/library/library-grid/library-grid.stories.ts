import type { Meta, StoryObj } from '@storybook/angular';
import { LibraryGridComponent } from './library-grid.component';
import { LibraryStatus } from '../../../core/models/enums';
import { LibraryEntry } from '../../../core/models/library-entry.model';

const meta: Meta<LibraryGridComponent> = {
  title: 'Pages/Library/LibraryGrid',
  component: LibraryGridComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<LibraryGridComponent>;

const mockGame = (id: string, title: string, coverId: string | null) => ({
  id,
  igdbId: Number(id),
  slug: title.toLowerCase().replace(/\s+/g, '-'),
  title,
  coverImageId: coverId,
  releaseYear: 2022,
  platforms: ['PC', 'PS5'],
});

const mockEntries: LibraryEntry[] = [
  {
    id: 'e1',
    game: mockGame('1', 'Elden Ring', 'co4jni'),
    status: LibraryStatus.Playing,
    ownership: 'OWNED',
    platforms: ['PC (Microsoft Windows)', 'PlayStation 5'],
    rating: 9,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'e2',
    game: mockGame('2', 'Hades', 'cob9kr'),
    status: LibraryStatus.Completed,
    ownership: 'OWNED',
    platforms: ['PC (Microsoft Windows)'],
    rating: 10,
    createdAt: '2023-08-10T00:00:00Z',
    updatedAt: '2023-09-01T00:00:00Z',
  },
  {
    id: 'e3',
    game: mockGame('3', 'Hollow Knight', null),
    status: LibraryStatus.Backlog,
    ownership: 'NONE',
    platforms: [],
    rating: null,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'e4',
    game: mockGame('4', 'Celeste', 'cob9dh'),
    status: LibraryStatus.Finished,
    ownership: 'OWNED',
    platforms: ['PC'],
    rating: 8,
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'e5',
    game: mockGame('5', 'God of War', 'cobkt6'),
    status: LibraryStatus.Finished,
    ownership: 'OWNED',
    platforms: ['PC'],
    rating: 8,
    createdAt: '2023-12-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
  },{
    id: 'e6',
    game: mockGame('6', 'Dark Souls', 'co1x78'),
    status: LibraryStatus.Finished,
    ownership: 'OWNED',
    platforms: ['PC'],
    rating: 8,
    createdAt: '2021-12-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },{
    id: 'e7',
    game: mockGame('7', 'Portal', 'coay61'),
    status: LibraryStatus.Finished,
    ownership: 'OWNED',
    platforms: ['PC'],
    rating: 8,
    createdAt: '2023-12-09T00:00:00Z',
    updatedAt: '2024-01-09T00:00:00Z',
  },{
    id: 'e8',
    game: mockGame('8', 'Bioshock', 'co2mli'),
    status: LibraryStatus.Finished,
    ownership: 'OWNED',
    platforms: ['PC'],
    rating: 8,
    createdAt: '2023-12-11T00:00:00Z',
    updatedAt: '2024-01-11T00:00:00Z',
  },{
    id: 'e9',
    game: mockGame('9', 'Firewatch', 'cob1ts'),
    status: LibraryStatus.Finished,
    ownership: 'OWNED',
    platforms: ['PC'],
    rating: 8,
    createdAt: '2023-12-12T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
  },{
    id: 'e10',
    game: mockGame('10', 'Helldivers 2', 'coabbf'),
    status: LibraryStatus.Finished,
    ownership: 'OWNED',
    platforms: ['PC'],
    rating: 8,
    createdAt: '2023-12-13T00:00:00Z',
    updatedAt: '2024-01-14T00:00:00Z',
  },{
    id: 'e11',
    game: mockGame('11', 'Doom', 'co5rav'),
    status: LibraryStatus.Finished,
    ownership: 'OWNED',
    platforms: ['PC'],
    rating: 8,
    createdAt: '2023-11-21T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },{
    id: 'e12',
    game: mockGame('12', 'Stardew Valley', 'coa93h'),
    status: LibraryStatus.Finished,
    ownership: 'OWNED',
    platforms: ['PC'],
    rating: 8,
    createdAt: '2023-10-01T00:00:00Z',
    updatedAt: '2024-11-05T00:00:00Z',
  },
];

export const WithEntries: Story = {
  args: { entries: mockEntries },
};

export const Empty: Story = {
  args: { entries: [] },
};

export const SingleEntry: Story = {
  args: { entries: [mockEntries[0]] },
};
