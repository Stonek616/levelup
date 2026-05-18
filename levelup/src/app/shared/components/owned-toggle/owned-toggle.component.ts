import { Component, Input, Output, EventEmitter, signal } from '@angular/core';

const PLATFORM_LABELS: Record<string, string> = {
  // PC / Desktop
  'PC (Microsoft Windows)': 'PC',
  'Mac': 'Mac',
  'Linux': 'Linux',
  'DOS': 'DOS',
  'Web browser': 'Browser',
  'Legacy Computer': 'Legacy PC',

  // PlayStation
  'PlayStation 5': 'PS5',
  'PlayStation 4': 'PS4',
  'PlayStation 3': 'PS3',
  'PlayStation 2': 'PS2',
  'PlayStation': 'PS1',
  'PlayStation Portable': 'PSP',
  'PlayStation Vita': 'PS Vita',
  'PlayStation VR': 'PSVR',
  'PlayStation VR2': 'PSVR2',

  // Xbox
  'Xbox Series X|S': 'Xbox Series X|S',
  'Xbox One': 'Xbox One',
  'Xbox 360': 'Xbox 360',
  'Xbox': 'Xbox',

  // Nintendo
  'Nintendo Switch 2': 'Switch 2',
  'Nintendo Switch': 'Switch',
  'Wii U': 'Wii U',
  'Wii': 'Wii',
  'Nintendo GameCube': 'GameCube',
  'Nintendo 64': 'N64',
  'Super Nintendo Entertainment System': 'SNES',
  'Super Famicom': 'Super Famicom',
  'Nintendo Entertainment System': 'NES',
  'Family Computer': 'Famicom',
  'Family Computer Disk System': 'Famicom Disk',
  'Satellaview': 'Satellaview',
  '64DD': '64DD',
  'Super NES CD-ROM System': 'SNES CD-ROM',
  'New Nintendo 3DS': 'New 3DS',
  'Nintendo 3DS': '3DS',
  'Nintendo DSi': 'DSi',
  'Nintendo DS': 'DS',
  'Game Boy Advance': 'GBA',
  'Game Boy Color': 'GBC',
  'Game Boy': 'Game Boy',

  // Sega
  'Sega Mega Drive/Genesis': 'Mega Drive/Genesis',
  'Sega Saturn': 'Saturn',
  'Dreamcast': 'Dreamcast',
  'Sega CD': 'Sega CD',
  'Sega 32X': 'Sega 32X',
  'Sega Master System/Mark III': 'Master System',
  'Sega Game Gear': 'Game Gear',
  'SG-1000': 'SG-1000',

  // Mobile
  'iOS': 'iOS',
  'Android': 'Android',
  'Windows Phone': 'Windows Phone',
  'Windows Mobile': 'Windows Mobile',
  'BlackBerry OS': 'BlackBerry',
  'Palm OS': 'Palm OS',
  'N-Gage': 'N-Gage',
  'Legacy Mobile Device': 'Legacy Mobile',
  'Amazon Fire TV': 'Fire TV',

  // VR / AR
  'SteamVR': 'SteamVR',
  'Meta Quest 3': 'Quest 3',
  'Meta Quest 2': 'Quest 2',
  'Oculus Quest': 'Oculus Quest',
  'Oculus Rift': 'Oculus Rift',
  'Oculus VR': 'Oculus VR',
  'Windows Mixed Reality': 'Windows MR',
  'Daydream': 'Daydream',
  'Gear VR': 'Gear VR',
  'visionOS': 'visionOS',

  // Streaming / Cloud
  'Google Stadia': 'Stadia',
  'OnLive Game System': 'OnLive',

  // Atari
  'Atari ST/STE': 'Atari ST',
  'Atari 8-bit': 'Atari 8-bit',
  'Atari 2600': 'Atari 2600',
  'Atari 5200': 'Atari 5200',
  'Atari 7800': 'Atari 7800',
  'Atari Lynx': 'Atari Lynx',
  'Atari Jaguar': 'Atari Jaguar',
  'Atari Jaguar CD': 'Jaguar CD',

  // Commodore / Amiga
  'Amiga': 'Amiga',
  'Amiga CD32': 'Amiga CD32',
  'Commodore C64/128/MAX': 'C64',
  'Commodore VIC-20': 'VIC-20',
  'Commodore 16': 'C16',
  'Commodore Plus/4': 'Plus/4',
  'Commodore CDTV': 'CDTV',

  // NEC / PC Engine
  'TurboGrafx-16/PC Engine': 'PC Engine',
  'Turbografx-16/PC Engine CD': 'PC Engine CD',
  'PC Engine SuperGrafx': 'SuperGrafx',
  'PC-9800 Series': 'PC-98',
  'PC-8800 Series': 'PC-88',
  'NEC PC-6000 Series': 'PC-6000',

  // SNK
  'Neo Geo AES': 'Neo Geo AES',
  'Neo Geo CD': 'Neo Geo CD',
  'Neo Geo MVS': 'Neo Geo MVS',

  // Japanese home computers
  'FM Towns': 'FM Towns',
  'FM-7': 'FM-7',
  'Sharp X68000': 'X68000',
  'Sharp X1': 'Sharp X1',
  'Sharp MZ-2200': 'MZ-2200',
  'MSX': 'MSX',
  'MSX2': 'MSX2',

  // UK home computers
  'ZX Spectrum': 'ZX Spectrum',
  'Amstrad CPC': 'Amstrad CPC',
  'Amstrad PCW': 'Amstrad PCW',
  'BBC Microcomputer System': 'BBC Micro',
  'Acorn Archimedes': 'Archimedes',
  'Acorn Electron': 'Acorn Electron',

  // Apple vintage
  'Apple II': 'Apple II',
  'Apple IIGS': 'Apple IIGS',

  // Other vintage
  'TRS-80 Color Computer': 'TRS-80 CoCo',
  'TRS-80': 'TRS-80',
  'Texas Instruments TI-99': 'TI-99',
  '3DO Interactive Multiplayer': '3DO',
  'Philips CD-i': 'CD-i',
  'ColecoVision': 'ColecoVision',
  'Intellivision': 'Intellivision',
  'Vectrex': 'Vectrex',
  'WonderSwan': 'WonderSwan',
  'WonderSwan Color': 'WonderSwan Color',

  // Misc
  'Arcade': 'Arcade',
  'Ouya': 'Ouya',
  'Zeebo': 'Zeebo',
  'Tapwave Zodiac': 'Zodiac',
  'Panasonic M2': 'M2',
  'Leapster Explorer/LeadPad Explorer': 'Leapster',
  'Handheld Electronic LCD': 'LCD Handheld',
  'Plug & Play': 'Plug & Play',
  'LaserActive': 'LaserActive',
  'OOParts': 'OOParts',
  'Digiblast': 'Digiblast',
  'Blu-ray Player': 'Blu-ray',
  'DVD Player': 'DVD',
  'PDP-11': 'PDP-11',
  'PDP-10': 'PDP-10',
  'HP 2100': 'HP 2100',
  'CDC Cyber 70': 'CDC Cyber 70',
  'AY-3-8606': 'AY-3-8606',
};

@Component({
  selector: 'app-owned-toggle',
  imports: [],
  templateUrl: './owned-toggle.component.html',
  styleUrl: './owned-toggle.component.scss'
})
export class OwnedToggleComponent {
  @Input() isOwned = false;
  @Input() ownedPlatforms: string[] = [];
  @Input() availablePlatforms: string[] = [];
  @Output() ownedChange = new EventEmitter<{ isOwned: boolean; platforms: string[] }>();

  showPicker = signal(false);
  selected = signal<string[]>([]);

  label(platform: string): string {
    return PLATFORM_LABELS[platform] ?? platform;
  }

  get platformsLabel(): string {
    if (!this.ownedPlatforms.length) return '';
    const names = this.ownedPlatforms.map(p => this.label(p));
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
  }

  open() {
    this.selected.set([...this.ownedPlatforms]);
    this.showPicker.set(true);
  }

  close() {
    this.showPicker.set(false);
  }

  togglePlatform(platform: string) {
    const cur = this.selected();
    this.selected.set(
      cur.includes(platform) ? cur.filter(p => p !== platform) : [...cur, platform]
    );
  }

  save() {
    this.ownedChange.emit({ isOwned: true, platforms: this.selected() });
    this.showPicker.set(false);
  }

  unmark() {
    this.ownedChange.emit({ isOwned: false, platforms: [] });
    this.showPicker.set(false);
  }
}
