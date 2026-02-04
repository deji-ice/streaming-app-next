import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * GSAP Configuration and Animation Utilities
 * Awwwards-level animations with optimal performance
 */

// Default easing curves
export const easings = {
    smooth: 'power2.out',
    snappy: 'power3.out',
    elastic: 'elastic.out(1, 0.5)',
    bounce: 'bounce.out',
    inOut: 'power2.inOut',
} as const;

// Animation durations (in seconds)
export const durations = {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    verySlow: 0.8,
} as const;

/**
 * Fade in animation with optional slide
 */
export const fadeIn = (
    element: gsap.TweenTarget,
    options: {
        duration?: number;
        delay?: number;
        y?: number;
        x?: number;
        ease?: string;
        onComplete?: () => void;
    } = {}
) => {
    return gsap.from(element, {
        opacity: 0,
        y: options.y || 0,
        x: options.x || 0,
        duration: options.duration || durations.normal,
        delay: options.delay || 0,
        ease: options.ease || easings.smooth,
        onComplete: options.onComplete,
    });
};

/**
 * Stagger animation for lists
 */
export const staggerIn = (
    elements: gsap.TweenTarget,
    options: {
        duration?: number;
        stagger?: number;
        y?: number;
        ease?: string;
    } = {}
) => {
    return gsap.from(elements, {
        opacity: 0,
        y: options.y || 20,
        duration: options.duration || durations.normal,
        stagger: options.stagger || 0.05,
        ease: options.ease || easings.smooth,
    });
};

/**
 * Scale animation (pop effect)
 */
export const scaleIn = (
    element: gsap.TweenTarget,
    options: {
        duration?: number;
        delay?: number;
        scale?: number;
        ease?: string;
    } = {}
) => {
    return gsap.from(element, {
        opacity: 0,
        scale: options.scale || 0.9,
        duration: options.duration || durations.fast,
        delay: options.delay || 0,
        ease: options.ease || easings.snappy,
    });
};

/**
 * Hover lift effect
 */
export const hoverLift = (element: HTMLElement) => {
    const onEnter = () => {
        gsap.to(element, {
            y: -8,
            scale: 1.02,
            duration: durations.fast,
            ease: easings.snappy,
        });
    };

    const onLeave = () => {
        gsap.to(element, {
            y: 0,
            scale: 1,
            duration: durations.fast,
            ease: easings.smooth,
        });
    };

    return { onEnter, onLeave };
};

/**
 * Magnetic button effect (cursor attraction)
 */
export const magneticEffect = (
    element: HTMLElement,
    options: { strength?: number } = {}
) => {
    const strength = options.strength || 0.3;
    const rect = element.getBoundingClientRect();

    const onMove = (e: MouseEvent) => {
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(element, {
            x: x * strength,
            y: y * strength,
            duration: durations.fast,
            ease: easings.smooth,
        });
    };

    const onLeave = () => {
        gsap.to(element, {
            x: 0,
            y: 0,
            duration: durations.normal,
            ease: easings.elastic,
        });
    };

    return { onMove, onLeave };
};

/**
 * Scroll-triggered animation
 */
export const scrollTriggerAnimation = (
    element: gsap.DOMTarget,
    options: {
        start?: string;
        end?: string;
        scrub?: boolean | number;
        animation: gsap.TweenVars;
    }
) => {
    return gsap.from(element, {
        ...options.animation,
        scrollTrigger: {
            trigger: element,
            start: options.start || 'top 85%',
            end: options.end || 'bottom 15%',
            scrub: options.scrub || false,
        },
    });
};

/**
 * Shimmer loading animation
 */
export const shimmer = (element: gsap.TweenTarget) => {
    return gsap.to(element, {
        backgroundPosition: '200% center',
        duration: 1.5,
        ease: 'none',
        repeat: -1,
    });
};

// Export GSAP and plugins
export { gsap, ScrollTrigger };
