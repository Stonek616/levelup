import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <div class="not-found">

      <!-- Caught-off-guard face built from brackets, eyebrows, and eyes -->
      <h1 class="not-found__errorcode">404</h1>

      <svg
        class="not-found__face"
        viewBox="0 0 240 180"
        aria-hidden="true">

        <!-- Left bracket -->
        <path
          d="M 60 30 L 36 30 L 36 150 L 60 150"
          fill="none"
          stroke="currentColor"
          stroke-width="6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Right bracket -->
        <path
          d="M 180 30 L 204 30 L 204 150 L 180 150"
          fill="none"
          stroke="currentColor"
          stroke-width="6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Left eyebrow -->
        <path
          d="M 76 70 L 108 70"
          stroke="currentColor"
          stroke-width="5"
          stroke-linecap="round"
        />

        <!-- Right eyebrow (raised — the surprised eyebrow) -->
        <path
          class="not-found__eyebrow-right"
          d="M 138 62 L 170 62"
          stroke="currentColor"
          stroke-width="5"
          stroke-linecap="round"
        />

        <!-- Left eye -->
        <ellipse
          class="not-found__eye"
          cx="92"
          cy="100"
          rx="14"
          ry="20"
          fill="var(--color-text-secondary)"
        />

        <!-- Right eye (slightly bigger — caught off guard) -->
        <ellipse
          class="not-found__eye not-found__eye--alert"
          cx="154"
          cy="100"
          rx="16"
          ry="24"
          fill="var(--color-text-secondary)"
        />

        <!-- Small surprised mouth -->
        <ellipse
          cx="123"
          cy="138"
          rx="5"
          ry="4"
          fill="currentColor"
          stroke="currentColor"
          stroke-width="3"
        />

      </svg>
      <h1 class="not-found__title">How did you get here?</h1>

      <p class="not-found__message">
        We weren't expecting visitors. This page doesn't exist — or maybe it never did.
      </p>

      <div class="not-found__actions">
        <a routerLink="/" class="not-found__btn not-found__btn--primary">
          Go home
        </a>
        <a routerLink="/feed" class="not-found__btn not-found__btn--ghost">
          Find a game
        </a>
      </div>

    </div>
  `,
  styles: [`
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 70vh;
      text-align: center;
      padding: 3rem 1.5rem;
      max-width: 600px;
      margin: 0 auto;

      &__face {
        width: min(360px, 80vw);
        color: var(--color-text-primary);
        margin-bottom: 2rem;
        animation: faceIn 600ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      // Slow, infrequent blink — keeps the face feeling alive
      &__eye {
        transform-origin: center;
        transform-box: fill-box;
        animation: blink 6s ease-in-out 2s infinite;
      }

      &__eye--alert {
        // Right eye blinks slightly later, asymmetric and natural
        animation-delay: 2.1s;
      }

      // Subtle wiggle on the surprised eyebrow every blink cycle
      &__eyebrow-right {
        transform-origin: 154px 62px;
        animation: eyebrowTwitch 6s ease-in-out 1.8s infinite;
      }

      &__title {
        font-family: var(--font-serif);
        font-size: 2rem;
        font-weight: 500;
        color: var(--color-text-primary);
        margin: 0 0 0.85rem;
        line-height: 1.2;
        letter-spacing: -0.01em;
      }
      &__errorcode {
        font-family: var(--font-mono);
        font-size: clamp(6rem, 18vw, 10rem);
        font-weight: 700;
        color: var(--color-accent);
        margin: 0 0 1.5rem;
        line-height: 1;
        letter-spacing: -0.02em;
        text-shadow:
          0 0 20px var(--color-accent-glow),
          0 0 40px var(--color-accent-glow),
          0 0 80px var(--color-accent-glow);
        animation: glowPulse 3s ease-in-out infinite;
      }

      &__message {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
        line-height: 1.55;
        margin: 0 0 2rem;
        max-width: 360px;
      }

      &__actions {
        display: flex;
        gap: 0.6rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      &__btn {
        padding: 0.6rem 1.4rem;
        border-radius: var(--radius-pill);
        font-family: inherit;
        font-size: 0.9rem;
        font-weight: 600;
        text-decoration: none;
        transition: background 0.15s, border-color 0.15s, color 0.15s;
        border: 1px solid transparent;

        &--primary {
          background: var(--color-accent);
          color: var(--color-text-inverse);
          box-shadow: 0 0 12px var(--color-accent-glow);

          &:hover {
            background: var(--color-accent-hover);
            text-decoration: none;
          }
        }

        &--ghost {
          background: transparent;
          color: var(--color-text-secondary);
          border-color: var(--color-border-strong);
          font-weight: 500;

          &:hover {
            color: var(--color-text-primary);
            border-color: var(--color-text-muted);
            text-decoration: none;
          }
        }
      }
    }

    // Entrance animation: face appears with a small bounce
    @keyframes faceIn {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    // Subtle blink — eyes squish vertically for a quick moment
    @keyframes blink {
      0%, 92%, 100% {
        transform: scaleY(1);
      }
      94%, 98% {
        transform: scaleY(0.1);
      }
    }

    // Tiny "did I just see that?" eyebrow twitch
    @keyframes eyebrowTwitch {
      0%, 90%, 100% {
        transform: translateY(0);
      }
      95% {
        transform: translateY(-2px);
      }
    }

    @keyframes glowPulse {
      0%, 100% {
        text-shadow:
          0 0 20px var(--color-accent-glow),
          0 0 40px var(--color-accent-glow),
          0 0 80px var(--color-accent-glow);
      }
      50% {
        text-shadow:
          0 0 10px var(--color-accent-glow),
          0 0 20px var(--color-accent-glow),
          0 0 40px var(--color-accent-glow);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .not-found__face,
      .not-found__eye,
      .not-found__eyebrow-right,
      .not-found__errorcode {
        animation: none;
      }
    }
  `],
})
export class NotFoundPageComponent {}