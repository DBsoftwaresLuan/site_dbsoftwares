/**
 * Hero Carousel - Controle de slides com navegação suave
 * DB Softwares - index.html
 */

class HeroCarousel {
  constructor() {
    this.currentSlide = 1;
    this.totalSlides = 3;
    this.autoplayInterval = null;
    this.autoplayDuration = 8000; // 8 segundos entre slides
    this.isTransitioning = false;
    
    this.init();
  }

  init() {
    this.cacheDOM();
    if (!this.carousel) return; // Se não encontrar o carrossel, sair
    this.bindEvents();
    this.startAutoplay();
    
    // Armazenar instância globalmente para debug
    window.heroCarousel = this;
  }

  cacheDOM() {
    this.carousel = document.querySelector('.hero-carousel');
    this.slides = document.querySelectorAll('.hero-slide');
    this.prevBtn = document.querySelector('.hero-carousel__btn--prev');
    this.nextBtn = document.querySelector('.hero-carousel__btn--next');
    this.dots = document.querySelectorAll('.hero-carousel__dot');
    this.progressBar = document.querySelector('.hero-carousel__progress-bar');
  }

  bindEvents() {
    // Navegação por clique nas setas
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prevSlide());
    }
    
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextSlide());
    }

    // Navegação por clique nos dots
    this.dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const slideNumber = parseInt(e.target.getAttribute('data-slide'));
        this.goToSlide(slideNumber);
      });
    });

    // Parar autoplay ao interagir
    this.carousel.addEventListener('mouseenter', () => this.stopAutoplay());
    this.carousel.addEventListener('mouseleave', () => this.startAutoplay());

    // Pausa ao tocar em dispositivos móveis
    this.carousel.addEventListener('touchstart', () => this.stopAutoplay());
    this.carousel.addEventListener('touchend', () => this.startAutoplay());

    // Teclas de seta do teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });
  }

  goToSlide(slideNumber) {
    if (this.isTransitioning || slideNumber === this.currentSlide) return;
    
    const direction = slideNumber > this.currentSlide ? 'next' : 'prev';
    this.isTransitioning = true;

    // Remover classes do slide anterior
    const prevSlide = document.querySelector(`[data-slide="${this.currentSlide}"]`);
    if (prevSlide) {
      prevSlide.classList.remove('hero-slide--active');
      if (direction === 'next') {
        prevSlide.classList.add('hero-slide--prev');
      } else {
        prevSlide.classList.remove('hero-slide--prev');
      }
    }

    // Atualizar slide atual
    this.currentSlide = slideNumber;
    const activeSlide = document.querySelector(`[data-slide="${this.currentSlide}"]`);
    
    if (activeSlide) {
      activeSlide.classList.remove('hero-slide--prev');
      activeSlide.classList.add('hero-slide--active');
      
      // Resetar animações reveal
      this.resetRevealAnimations(activeSlide);
    }

    // Atualizar dots
    this.updateDots();

    // Permitir próxima transição após conclusão da animação
    setTimeout(() => {
      this.isTransitioning = false;
    }, 800); // Match com a duração da transição CSS

    // Resetar autoplay e progress
    this.stopAutoplay();
    this.startAutoplay();
  }

  nextSlide() {
    const nextSlideNumber = this.currentSlide === this.totalSlides ? 1 : this.currentSlide + 1;
    this.goToSlide(nextSlideNumber);
  }

  prevSlide() {
    const prevSlideNumber = this.currentSlide === 1 ? this.totalSlides : this.currentSlide - 1;
    this.goToSlide(prevSlideNumber);
  }

  updateDots() {
    this.dots.forEach(dot => {
      const dotSlide = parseInt(dot.getAttribute('data-slide'));
      if (dotSlide === this.currentSlide) {
        dot.classList.add('hero-carousel__dot--active');
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.classList.remove('hero-carousel__dot--active');
        dot.setAttribute('aria-current', 'false');
      }
    });
  }

  resetRevealAnimations(slide) {
    const revealElements = slide.querySelectorAll('.reveal');
    revealElements.forEach(element => {
      // Remover e readicionar classe para triggerar animação
      element.classList.remove('is-visible');
      
      // Forçar reflow
      void element.offsetWidth;
      
      // Re-trigger animation
      requestAnimationFrame(() => {
        element.classList.add('is-visible');
      });
    });
  }

  startAutoplay() {
    // Iniciar barra de progresso
    this.progressStartTime = Date.now();
    this.updateProgressBar();
    
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoplayDuration);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
    if (this.progressAnimationFrame) {
      cancelAnimationFrame(this.progressAnimationFrame);
    }
    // Resetar barra de progresso
    if (this.progressBar) {
      this.progressBar.style.width = '0%';
    }
  }
  
  updateProgressBar() {
    if (!this.progressBar || !this.autoplayInterval) return;
    
    const elapsed = Date.now() - this.progressStartTime;
    const progress = Math.min((elapsed / this.autoplayDuration) * 100, 100);
    
    this.progressBar.style.width = progress + '%';
    
    if (progress < 100) {
      this.progressAnimationFrame = requestAnimationFrame(() => this.updateProgressBar());
    }
  }
  
  resetProgress() {
    this.progressStartTime = Date.now();
    if (this.progressBar) {
      this.progressBar.style.width = '0%';
    }
    this.updateProgressBar();
  }

  destroy() {
    this.stopAutoplay();
    if (this.prevBtn) {
      this.prevBtn.removeEventListener('click', () => this.prevSlide());
    }
    if (this.nextBtn) {
      this.nextBtn.removeEventListener('click', () => this.nextSlide());
    }
  }
}

// Inicializar carrossel quando o documento estiver pronto
function startCarousel() {
  if (document.querySelector('.hero-carousel')) {
    new HeroCarousel();
  }
}

// Tentar inicializar imediatamente se DOM já está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startCarousel);
} else {
  // DOM já está carregado
  setTimeout(startCarousel, 0);
}
