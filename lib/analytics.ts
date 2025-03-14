export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    // For Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, parameters);
    }
  
    // For Vercel Analytics
    if (window.va) {
      window.va('event', {
        name: eventName,
        ...parameters
      });
    }
  };