# Mobile Performance Optimization Techniques

## CSS Performance Optimizations

### GPU Acceleration
```css
transform: translateZ(0);  /* Forces GPU acceleration */
backfaceVisibility: hidden;  /* Prevents reverse-side rendering */
perspective: 1000px;  /* Enables 3D acceleration */
```

### Paint Optimization
```css
contain: layout style paint;  /* Limits paint to element boundaries */
will-change: transform, opacity;  /* Hints browser about upcoming changes */
```

## JavaScript Performance Patterns

### 1. Memoization Pattern
```javascript
// Prevents re-renders on unchanged props
export const Component = memo(function Component(props) {
  // component code
});
```

### 2. useCallback Pattern
```javascript
// Prevents function recreation on every render
const handleClick = useCallback(() => {
  // handler code
}, [dependencies]);
```

### 3. useMemo Pattern
```javascript
// Prevents expensive calculations on every render
const value = useMemo(() => {
  return computeExpensiveValue(input);
}, [input]);
```

### 4. Scroll Event Throttling
```javascript
let ticking = false;
const handleScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      // Perform scroll updates here
      ticking = false;
    });
    ticking = true;
  }
};
```

### 5. IntersectionObserver Optimization
```javascript
const observer = new IntersectionObserver(
  (entries) => {
    // Handle visibility changes
  },
  { 
    threshold: 0.1,  // Lower threshold for faster detection
    rootMargin: '0px'  // No margin for precision
  }
);
```

## Animation Performance

### Framer Motion Optimizations
```javascript
// Use transform and opacity only (GPU properties)
initial={{ opacity: 0, y: 10 }}  // Y uses transform
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}

// Batch animations with mode="wait"
<AnimatePresence mode="wait">
  {/* Only one element animates at a time */}
</AnimatePresence>
```

### Reduced Motion Support
```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Adjust animation durations based on user preference
```

## Memory Management

### Proper Cleanup
```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    // Do something
  }, delay);

  // Always cleanup
  return () => clearTimeout(timer);
}, [dependencies]);
```

### AbortController for Fetch
```javascript
const controller = new AbortController();
fetch('/api/endpoint', { signal: controller.signal })
  .catch(err => {
    if (err.name !== 'AbortError') {
      // Handle actual errors
    }
  });

// Cleanup
return () => controller.abort();
```

## Device Detection & Adaptation

### Network Detection
```javascript
// Adapt animations based on connection speed
const connection = navigator.connection;
const hasSlowConnection = connection?.effectiveType === '3g' || connection?.effectiveType === '4g';
```

### Device Memory
```javascript
// Reduce animations on low-memory devices
const deviceMemory = navigator.deviceMemory;
if (deviceMemory && deviceMemory < 4) {
  // Use simpler animations
}
```

## Specific Optimizations by Component

### MobileLayout
- Scroll event throttling with requestAnimationFrame
- Passive event listeners for scroll
- Fixed header positioning without transforms
- GPU-accelerated background layer

### LandingIntroSequence
- Memoized WordDisplay component
- Reduced animation timing (1200ms instead of 1500ms)
- GPU acceleration for text animations
- Backface visibility optimization

### LandingSlide
- Memoized CTA buttons
- useCallback for handlers
- useMemo for sequence keys and targets
- GPU-accelerated button animations

### MobileMenu
- AbortController for async operations
- Memoized link filtering
- Optimized overlay performance
- Loading state for async data

### MobileSlide
- Optimized IntersectionObserver (0.1 threshold)
- Reduced debounce delay (30ms)
- CSS containment for layout optimization
- Proper observer cleanup

### MobilePreloader
- Device-aware animation duration
- Reduced motion preference detection
- Proper timer cleanup
- GPU-accelerated container

## Testing & Validation

### Chrome DevTools Performance Testing
1. Open DevTools → Performance tab
2. Click record button
3. Perform interactions (scroll, click menu, wait for animations)
4. Stop recording and analyze:
   - Look for dropped frames (red bars in timeline)
   - Check Main thread blocking time
   - Monitor paint events
   - Check memory growth

### Lighthouse Audit
1. Open DevTools → Lighthouse tab
2. Run audit with "Mobile" setting
3. Check:
   - Performance score (target: 90+)
   - First Contentful Paint (target: <1.8s)
   - Largest Contentful Paint (target: <2.5s)
   - Cumulative Layout Shift (target: <0.1)

### Real Device Testing
- Use Chrome Remote Debugging to test on actual devices
- Monitor FPS with DevTools FPS meter
- Check thermal throttling on low-end devices
- Test battery impact over extended use

## Deployment Checklist
- [ ] Test animations on low-end Android devices
- [ ] Test scroll performance on 3G connection
- [ ] Verify no memory leaks with extended scrolling
- [ ] Check Lighthouse scores
- [ ] Test on iOS devices (iPhone 6s+)
- [ ] Verify reduced motion preference is respected
- [ ] Test menu interactions under various conditions
- [ ] Validate performance metrics are maintained
