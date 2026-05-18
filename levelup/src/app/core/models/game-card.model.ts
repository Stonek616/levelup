import { LibraryEntry } from "./library-entry.model";
import { GameSummary } from "./game.model";

export type GameCardInput = 
| {kind: 'entry'; data: LibraryEntry}
| { kind: 'game'; data: GameSummary };

export function isLibraryEntry(input: GameCardInput): input is { kind:
    'entry'; data: LibraryEntry } {
        return input.kind === 'entry';
    }