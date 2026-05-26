import type { Meta, StoryObj } from '@storybook/angular';
import { ChallengeActiveComponent } from './challenge-active.component';

const meta: Meta<ChallengeActiveComponent> = {
  title: 'Features/Challenge/ChallengeActive',
  component: ChallengeActiveComponent,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<ChallengeActiveComponent>;

const roundGames = [
  { gameId: 'g1', title: 'Hollow Knight', coverUrl: null },
  { gameId: 'g2', title: 'Hades', coverUrl: null },
  { gameId: 'g3', title: 'Celeste', coverUrl: null },
];

export const FirstRound: Story = {
  name: 'Round 1 of 5 — pre-selection',
  args: {
    payload: {
      rounds: [
        { roundNumber: 1, games: roundGames },
        { roundNumber: 2, games: [
          { gameId: 'g4', title: 'Dead Cells', coverUrl: null },
          { gameId: 'g5', title: 'Stardew Valley', coverUrl: null },
          { gameId: 'g6', title: 'Cuphead', coverUrl: null },
        ]},
        { roundNumber: 3, games: roundGames },
        { roundNumber: 4, games: roundGames },
        { roundNumber: 5, games: roundGames },
      ],
    },
  },
};

export const SingleRound: Story = {
  name: 'Single round challenge',
  args: {
    payload: {
      rounds: [
        { roundNumber: 1, games: roundGames },
      ],
    },
  },
};

export const ManyGamesPerRound: Story = {
  name: 'Four options per round',
  args: {
    payload: {
      rounds: [
        {
          roundNumber: 1,
          games: [
            { gameId: 'g1', title: 'Hollow Knight', coverUrl: null },
            { gameId: 'g2', title: 'Hades', coverUrl: null },
            { gameId: 'g3', title: 'Celeste', coverUrl: null },
            { gameId: 'g4', title: 'Dead Cells', coverUrl: null },
          ],
        },
      ],
    },
  },
};
