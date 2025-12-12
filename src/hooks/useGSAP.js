import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Scroll reveal animation hook
export const useScrollReveal = (options = {}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const defaults = {
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      start: 'top 85%',
      ...options
    };

    gsap.fromTo(element, 
      { y: defaults.y, opacity: defaults.opacity },
      {
        y: 0,
        opacity: 1,
        duration: defaults.duration,
        ease: defaults.ease,
        scrollTrigger: {
          trigger: element,
          start: defaults.start,
          toggleActions: 'play none none reverse'
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return elementRef;
};

// Stagger children animation hook
export const useStaggerReveal = (options = {}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = container.children;
    if (!children.length) return;

    const defaults = {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      start: 'top 80%',
      ...options
    };

    gsap.fromTo(children, 
      { y: defaults.y, opacity: defaults.opacity },
      {
        y: 0,
        opacity: 1,
        duration: defaults.duration,
        stagger: defaults.stagger,
        ease: defaults.ease,
        scrollTrigger: {
          trigger: container,
          start: defaults.start,
          toggleActions: 'play none none reverse'
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return containerRef;
};

// Page enter animation
export const usePageTransition = () => {
  const pageRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    gsap.fromTo(page,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  return pageRef;
};

// Counter animation hook
export const useCountUp = (endValue, duration = 1.5) => {
  const countRef = useRef(null);
  const valueRef = useRef({ value: 0 });

  useEffect(() => {
    const element = countRef.current;
    if (!element) return;

    gsap.to(valueRef.current, {
      value: endValue,
      duration: duration,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = Math.round(valueRef.current.value);
      },
      scrollTrigger: {
        trigger: element,
        start: 'top 90%',
        toggleActions: 'play none none none'
      }
    });
  }, [endValue, duration]);

  return countRef;
};

// Magnetic hover effect
export const useMagneticHover = (strength = 0.3) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(element, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return elementRef;
};

// Parallax effect hook
export const useParallax = (speed = 0.5) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    gsap.to(element, {
      yPercent: -30 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [speed]);

  return elementRef;
};

export default gsap;
