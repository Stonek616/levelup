package com.levelup.model.enums;

/*
 * What kind of recommendation the user wants.
 *
 * FAMILIAR — pick from games already in my library
 * NEW      — recommend something I don't own yet, based on my taste
 * SURPRISE — pick something random for me, biased toward my backlog
 */
public enum Mood {
  FAMILIAR,
  NEW,
  SURPRISE
}
