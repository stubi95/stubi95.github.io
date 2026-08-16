        let currentLightboxImages = [];
        let currentImageIndex = 0;

        const lightbox = {};
        const lightboxImg = {};
        const lightboxPrev = {};
        const lightboxNext = {};
        const lightboxCounter = {};

        window = {};

        window.openLightbox = function(imagesArray) {
            currentLightboxImages = imagesArray;
            currentImageIndex = 0;
            
            updateLightboxUI();
            
            lightbox.classList.remove('hidden');
            setTimeout(() => {
                lightbox.classList.add('flex');
                lightbox.classList.remove('opacity-0');
                lightbox.classList.add('opacity-100');
            }, 10);
            
            document.body.style.overflow = 'hidden';
        }

        window.closeLightbox = function() {
            lightbox.classList.remove('opacity-100');
            lightbox.classList.add('opacity-0');
            
            setTimeout(() => {
                lightbox.classList.add('hidden');
                lightbox.classList.remove('flex');
                document.body.style.overflow = '';
            }, 300);
        }

        window.nextSlide = function() {
            if (currentImageIndex < currentLightboxImages.length - 1) {
                currentImageIndex++;
                updateLightboxUI();
            }
        }

        window.prevSlide = function() {
            if (currentImageIndex > 0) {
                currentImageIndex--;
                updateLightboxUI();
            }
        }

        function updateLightboxUI() {
            lightboxImg.src = currentLightboxImages[currentImageIndex];
            lightboxCounter.textContent = `${currentImageIndex + 1} / ${currentLightboxImages.length}`;

            if (currentLightboxImages.length > 1) {
                lightboxPrev.classList.remove('hidden');
                lightboxNext.classList.remove('hidden');
                
                lightboxPrev.style.opacity = currentImageIndex === 0 ? '0.2' : '1';
                lightboxPrev.style.cursor = currentImageIndex === 0 ? 'default' : 'pointer';
                
                lightboxNext.style.opacity = currentImageIndex === currentLightboxImages.length - 1 ? '0.2' : '1';
                lightboxNext.style.cursor = currentImageIndex === currentLightboxImages.length - 1 ? 'default' : 'pointer';
            } else {
                lightboxPrev.classList.add('hidden');
                lightboxNext.classList.add('hidden');
            }
        }
