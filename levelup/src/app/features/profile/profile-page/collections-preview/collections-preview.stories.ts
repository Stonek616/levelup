import type { Meta, StoryObj } from '@storybook/angular';
import { CollectionsPreviewComponent } from './collections-preview.component';

const meta: Meta<CollectionsPreviewComponent> = {
  title: 'Pages/Profile/CollectionsPreview',
  component: CollectionsPreviewComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<CollectionsPreviewComponent>;

export const OtherUser: Story = {
  args: { username: 'player1', isOwnProfile: false },
};

export const OwnProfile: Story = {
  args: { username: 'player1', isOwnProfile: true },
};
