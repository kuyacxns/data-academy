    // Global scroll-reveal observer (for non-React static elements)
    (function() {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

      // Re-observe on DOM mutations (React renders new content)
      const mutObs = new MutationObserver(() => {
        document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
      });
      mutObs.observe(document.body, { childList: true, subtree: true });

      // Initial sweep
      document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
      });
    })();

    // Parallax tilt on lang-cards (subtle)
    document.addEventListener('mousemove', (e) => {
      const cards = document.querySelectorAll('.lang-card');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / rect.width;
        const dy = (e.clientY - cy) / rect.height;
        // Only apply if mouse is near the card
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 1.5) {
          card.style.transform = `translateY(-10px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg)`;
          card.style.transformStyle = 'preserve-3d';
        }
      });
    });
