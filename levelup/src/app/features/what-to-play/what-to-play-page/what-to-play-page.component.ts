import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WhatToPlayService } from '../../../core/services/what-to-play.service';
import {
  GameSuggestion,
  Mood,
  SuggestionSource,
} from '../../../core/models/what-to-play.model';

@Component({
  selector: 'app-what-to-play-page',
  imports: [RouterLink, FormsModule],
  templateUrl: './what-to-play-page.component.html',
  styleUrl: './what-to-play-page.component.scss',
})
export class WhatToPlayPageComponent {
  private readonly whatToPlayService = inject(WhatToPlayService);

  mood = signal<Mood>('FAMILIAR');
  platform = signal<string>('ANY');
  multiplayer = signal(false);
  includeAlreadyPlayed = signal(false);

  suggestions = signal<GameSuggestion[]>([]);
  loading = signal(false);
  error = signal(false);
  hasFetched = signal(false);

  readonly moodOptions: { value: Mood; label: string; description: string }[] = [
    { value: 'FAMILIAR', label: 'Familiar', description: "From games I own" },
    { value: 'NEW', label: 'New', description: "Something I haven't played" },
    { value: 'SURPRISE', label: 'Surprise me', description: 'Just pick one' },
  ];

  readonly platformGroups: { label: string | null; options: { value: string; label: string }[] }[] = [
    {
      label: null,
      options: [{ value: 'ANY', label: 'Any platform' }],
    },
    {
      label: 'Modern',
      options: [
        { value: 'PC_MICROSOFT_WINDOWS', label: 'PC (Windows)' },
        { value: 'PLAYSTATION_5',        label: 'PlayStation 5' },
        { value: 'PLAYSTATION_4',        label: 'PlayStation 4' },
        { value: 'XBOX_SERIES_X_S',      label: 'Xbox Series X|S' },
        { value: 'XBOX_ONE',             label: 'Xbox One' },
        { value: 'NINTENDO_SWITCH_2',    label: 'Nintendo Switch 2' },
        { value: 'NINTENDO_SWITCH',      label: 'Nintendo Switch' },
        { value: 'IOS',                  label: 'iOS' },
        { value: 'ANDROID',              label: 'Android' },
        { value: 'MAC',                  label: 'Mac' },
        { value: 'LINUX',                label: 'Linux' },
        { value: 'AMAZON_FIRE_TV',       label: 'Amazon Fire TV' },
        { value: 'WEB_BROWSER',          label: 'Web browser' },
        { value: 'GOOGLE_STADIA',        label: 'Google Stadia' },
      ],
    },
    {
      label: 'Virtual Reality',
      options: [
        { value: 'META_QUEST_3',         label: 'Meta Quest 3' },
        { value: 'META_QUEST_2',         label: 'Meta Quest 2' },
        { value: 'PLAYSTATION_VR2',      label: 'PlayStation VR2' },
        { value: 'PLAYSTATION_VR',       label: 'PlayStation VR' },
        { value: 'OCULUS_QUEST',         label: 'Oculus Quest' },
        { value: 'OCULUS_RIFT',          label: 'Oculus Rift' },
        { value: 'OCULUS_VR',            label: 'Oculus VR' },
        { value: 'STEAM_VR',             label: 'SteamVR' },
        { value: 'WINDOWS_MIXED_REALITY',label: 'Windows Mixed Reality' },
        { value: 'DAYDREAM',             label: 'Daydream' },
        { value: 'GEAR_VR',              label: 'Gear VR' },
        { value: 'VISION_OS',            label: 'visionOS' },
      ],
    },
    {
      label: 'PlayStation',
      options: [
        { value: 'PLAYSTATION_3',        label: 'PlayStation 3' },
        { value: 'PLAYSTATION_2',        label: 'PlayStation 2' },
        { value: 'PLAYSTATION',          label: 'PlayStation (PS1)' },
        { value: 'PLAYSTATION_PORTABLE', label: 'PlayStation Portable' },
        { value: 'PLAYSTATION_VITA',     label: 'PlayStation Vita' },
      ],
    },
    {
      label: 'Xbox',
      options: [
        { value: 'XBOX_360', label: 'Xbox 360' },
        { value: 'XBOX',     label: 'Xbox (Original)' },
      ],
    },
    {
      label: 'Nintendo',
      options: [
        { value: 'WII_U',                              label: 'Wii U' },
        { value: 'WII',                                label: 'Wii' },
        { value: 'NINTENDO_GAMECUBE',                  label: 'GameCube' },
        { value: 'NINTENDO_64',                        label: 'Nintendo 64' },
        { value: 'SUPER_NINTENDO_ENTERTAINMENT_SYSTEM',label: 'Super Nintendo (SNES)' },
        { value: 'NINTENDO_ENTERTAINMENT_SYSTEM',      label: 'Nintendo Entertainment System' },
        { value: 'NEW_NINTENDO_3DS',                   label: 'New Nintendo 3DS' },
        { value: 'NINTENDO_3DS',                       label: 'Nintendo 3DS' },
        { value: 'NINTENDO_DSI',                       label: 'Nintendo DSi' },
        { value: 'NINTENDO_DS',                        label: 'Nintendo DS' },
        { value: 'GAME_BOY_ADVANCE',                   label: 'Game Boy Advance' },
        { value: 'GAME_BOY_COLOR',                     label: 'Game Boy Color' },
        { value: 'GAME_BOY',                           label: 'Game Boy' },
        { value: 'SUPER_FAMICOM',                      label: 'Super Famicom' },
        { value: 'FAMILY_COMPUTER_DISK_SYSTEM',        label: 'Family Computer Disk System' },
        { value: 'FAMILY_COMPUTER',                    label: 'Family Computer (Famicom)' },
        { value: 'SATELLAVIEW',                        label: 'Satellaview' },
        { value: 'SUPER_NES_CD_ROM_SYSTEM',            label: 'Super NES CD-ROM System' },
      ],
    },
    {
      label: 'Sega',
      options: [
        { value: 'DREAMCAST',                label: 'Dreamcast' },
        { value: 'SEGA_SATURN',              label: 'Sega Saturn' },
        { value: 'SEGA_MEGA_DRIVE_GENESIS',  label: 'Mega Drive / Genesis' },
        { value: 'SEGA_MASTER_SYSTEM_MARK_III', label: 'Master System / Mark III' },
        { value: 'SEGA_GAME_GEAR',           label: 'Sega Game Gear' },
        { value: 'SEGA_CD',                  label: 'Sega CD' },
        { value: 'SEGA_32X',                 label: 'Sega 32X' },
        { value: 'SG_1000',                  label: 'SG-1000' },
      ],
    },
    {
      label: 'Arcade & PC Classics',
      options: [
        { value: 'ARCADE',               label: 'Arcade' },
        { value: 'DOS',                  label: 'DOS' },
        { value: 'AMIGA',                label: 'Amiga' },
        { value: 'AMIGA_CD32',           label: 'Amiga CD32' },
        { value: 'AMSTRAD_CPC',          label: 'Amstrad CPC' },
        { value: 'AMSTRAD_PCW',          label: 'Amstrad PCW' },
        { value: 'APPLE_II',             label: 'Apple II' },
        { value: 'APPLE_IIGS',           label: 'Apple IIGS' },
        { value: 'ACORN_ARCHIMEDES',     label: 'Acorn Archimedes' },
        { value: 'ACORN_ELECTRON',       label: 'Acorn Electron' },
        { value: 'ATARI_ST_STE',         label: 'Atari ST/STE' },
        { value: 'ATARI_8_BIT',          label: 'Atari 8-bit' },
        { value: 'BBC_MICROCOMPUTER_SYSTEM', label: 'BBC Micro' },
        { value: 'COMMODORE_C64_128_MAX',label: 'Commodore 64/128' },
        { value: 'COMMODORE_CDTV',       label: 'Commodore CDTV' },
        { value: 'COMMODORE_PLUS_4',     label: 'Commodore Plus/4' },
        { value: 'COMMODORE_VIC_20',     label: 'Commodore VIC-20' },
        { value: 'COMMODORE_16',         label: 'Commodore 16' },
        { value: 'FM_7',                 label: 'FM-7' },
        { value: 'FM_TOWNS',             label: 'FM Towns' },
        { value: 'MSX',                  label: 'MSX' },
        { value: 'MSX2',                 label: 'MSX2' },
        { value: 'NEC_PC_6000_SERIES',   label: 'NEC PC-6000 Series' },
        { value: 'PC_8800_SERIES',       label: 'PC-8800 Series' },
        { value: 'PC_9800_SERIES',       label: 'PC-9800 Series' },
        { value: 'PC_ENGINE_SUPERGRAFX', label: 'PC Engine SuperGrafx' },
        { value: 'SHARP_MZ_2200',        label: 'Sharp MZ-2200' },
        { value: 'SHARP_X1',             label: 'Sharp X1' },
        { value: 'SHARP_X68000',         label: 'Sharp X68000' },
        { value: 'TEXAS_INSTRUMENTS_TI_99', label: 'TI-99' },
        { value: 'TRS_80',               label: 'TRS-80' },
        { value: 'TRS_80_COLOR_COMPUTER',label: 'TRS-80 Color Computer' },
        { value: 'ZX_SPECTRUM',          label: 'ZX Spectrum' },
      ],
    },
    {
      label: 'Legacy & Other',
      options: [
        { value: 'THREE_DO_INTERACTIVE_MULTIPLAYER', label: '3DO Interactive Multiplayer' },
        { value: 'SIXTY_FOUR_DD',           label: '64DD' },
        { value: 'ATARI_2600',              label: 'Atari 2600' },
        { value: 'ATARI_5200',              label: 'Atari 5200' },
        { value: 'ATARI_7800',              label: 'Atari 7800' },
        { value: 'ATARI_JAGUAR',            label: 'Atari Jaguar' },
        { value: 'ATARI_JAGUAR_CD',         label: 'Atari Jaguar CD' },
        { value: 'ATARI_LYNX',              label: 'Atari Lynx' },
        { value: 'AY_3_8606',               label: 'AY-3-8606' },
        { value: 'BLACKBERRY_OS',           label: 'BlackBerry OS' },
        { value: 'BLU_RAY_PLAYER',          label: 'Blu-ray Player' },
        { value: 'CDC_CYBER_70',            label: 'CDC Cyber 70' },
        { value: 'COLECOVISION',            label: 'ColecoVision' },
        { value: 'DIGIBLAST',               label: 'Digiblast' },
        { value: 'DVD_PLAYER',              label: 'DVD Player' },
        { value: 'HANDHELD_ELECTRONIC_LCD', label: 'Handheld Electronic LCD' },
        { value: 'HP_2100',                 label: 'HP 2100' },
        { value: 'INTELLIVISION',           label: 'Intellivision' },
        { value: 'LASER_ACTIVE',            label: 'LaserActive' },
        { value: 'LEAPSTER_EXPLORER_LEADPAD_EXPLORER', label: 'Leapster / LeadPad Explorer' },
        { value: 'LEGACY_COMPUTER',         label: 'Legacy Computer' },
        { value: 'LEGACY_MOBILE_DEVICE',    label: 'Legacy Mobile Device' },
        { value: 'N_GAGE',                  label: 'N-Gage' },
        { value: 'NEO_GEO_AES',             label: 'Neo Geo AES' },
        { value: 'NEO_GEO_CD',              label: 'Neo Geo CD' },
        { value: 'NEO_GEO_MVS',             label: 'Neo Geo MVS' },
        { value: 'ONLIVE_GAME_SYSTEM',      label: 'OnLive Game System' },
        { value: 'OOPARTS',                 label: 'OOParts' },
        { value: 'OUYA',                    label: 'Ouya' },
        { value: 'PALM_OS',                 label: 'Palm OS' },
        { value: 'PANASONIC_M2',            label: 'Panasonic M2' },
        { value: 'PDP_10',                  label: 'PDP-10' },
        { value: 'PDP_11',                  label: 'PDP-11' },
        { value: 'PHILIPS_CD_I',            label: 'Philips CD-i' },
        { value: 'PLUG_AND_PLAY',           label: 'Plug & Play' },
        { value: 'TAPWAVE_ZODIAC',          label: 'Tapwave Zodiac' },
        { value: 'TATUNG_EINSTEIN',         label: 'Tatung Einstein' },
        { value: 'TURBOGRAFX_16_PC_ENGINE', label: 'TurboGrafx-16 / PC Engine' },
        { value: 'TURBOGRAFX_16_PC_ENGINE_CD', label: 'TurboGrafx-16 / PC Engine CD' },
        { value: 'VECTREX',                 label: 'Vectrex' },
        { value: 'WINDOWS_MOBILE',          label: 'Windows Mobile' },
        { value: 'WINDOWS_PHONE',           label: 'Windows Phone' },
        { value: 'WONDERSWAN',              label: 'WonderSwan' },
        { value: 'WONDERSWAN_COLOR',        label: 'WonderSwan Color' },
        { value: 'ZEEBO',                   label: 'Zeebo' },
      ],
    },
  ];

  // Show "Include already played" toggle only when mood = FAMILIAR
  showAlreadyPlayedToggle = computed(() => this.mood() === 'FAMILIAR');

  // For SURPRISE mode, button reads differently to set expectation (single result)
  primaryActionLabel = computed(() => {
    if (this.loading()) return 'Picking...';
    return this.mood() === 'SURPRISE' ? 'Pick one for me' : 'Show me';
  });

  selectMood(m: Mood): void {
    this.mood.set(m);
    // Clear results when mood changes — different mood, different vibe
    this.suggestions.set([]);
    this.hasFetched.set(false);
  }

  findGames(): void {
    this.loading.set(true);
    this.error.set(false);

    this.whatToPlayService.getSuggestions({
      mood: this.mood(),
      platform: this.platform(),
      multiplayer: this.multiplayer(),
      includeAlreadyPlayed: this.includeAlreadyPlayed(),
      timeAvailable: 'SHORT',
      includeNewSuggestions: false
    }).subscribe({
      next: (res) => {
        this.suggestions.set(res.suggestions);
        this.loading.set(false);
        this.hasFetched.set(true);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
        this.hasFetched.set(true);
      },
    });
  }

  sourceLabel(source: SuggestionSource): string {
    return ({
      BACKLOG: 'Backlog',
      OWNED: 'Owned',
      ALREADY_PLAYED: 'Replay',
      NEW_SUGGESTION: 'New',
    } as Record<SuggestionSource, string>)[source];
  }
}