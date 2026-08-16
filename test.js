    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const toggleBtn = document.getElementById('ai-chat-toggle');
            const closeBtn = document.getElementById('ai-chat-close');
            const chatWindow = document.getElementById('ai-chat-window');
            const chatForm = document.getElementById('ai-chat-form');
            const chatInput = document.getElementById('ai-chat-input');
            const messagesContainer = document.getElementById('ai-chat-messages');
            const submitBtn = document.getElementById('ai-chat-submit');
            
            // NOTE: URL should be updated when deployed to the real backend
            const API_URL = "https://chat.nutrition-fit.com/api/chat";
            
            let messages = [];

            const toggleChat = () => {
                if (chatWindow.style.display === 'none') {
                    chatWindow.style.display = 'flex';
                    // Trigger reflow for transition
                    chatWindow.offsetHeight; 
                    chatWindow.classList.remove('opacity-0', 'translate-y-10');
                    chatWindow.classList.add('opacity-100', 'translate-y-0');
                    chatInput.focus();
                } else {
                    chatWindow.classList.remove('opacity-100', 'translate-y-0');
                    chatWindow.classList.add('opacity-0', 'translate-y-10');
                    setTimeout(() => {
                        chatWindow.style.display = 'none';
                    }, 300);
                }
            };

            toggleBtn.addEventListener('click', toggleChat);
            closeBtn.addEventListener('click', toggleChat);

            const appendMessage = (role, text) => {
                const msgDiv = document.createElement('div');
                msgDiv.className = `flex flex-col ${role === 'user' ? 'items-end' : 'items-start'} max-w-[85%] ${role === 'user' ? 'self-end' : ''}`;
                
                const bubble = document.createElement('div');
                
                if (role === 'user') {
                    bubble.className = "px-4 py-2.5 rounded-2xl rounded-tr-sm bg-slate-900 text-white text-sm shadow-sm leading-relaxed";
                } else if (role === 'assistant') {
                    bubble.className = "px-4 py-2.5 rounded-2xl rounded-tl-sm bg-white border border-slate-200 text-sm text-slate-700 shadow-sm leading-relaxed markdown-content";
                    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    text = text.replace(/\n/g, '<br/>');
                } else {
                    bubble.className = "px-4 py-2.5 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-600 shadow-sm leading-relaxed";
                }
                
                bubble.innerHTML = text;
                msgDiv.appendChild(bubble);
                messagesContainer.appendChild(msgDiv);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            };

            const setTypingIndicator = (show) => {
                if (show) {
                    const typingDiv = document.createElement('div');
                    typingDiv.id = 'ai-typing-indicator';
                    typingDiv.className = 'flex flex-col items-start max-w-[85%]';
                    typingDiv.innerHTML = `
                        <div class="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-slate-200 text-sm shadow-sm flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                            <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
                        </div>
                    `;
                    messagesContainer.appendChild(typingDiv);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                } else {
                    const indicator = document.getElementById('ai-typing-indicator');
                    if (indicator) indicator.remove();
                }
            };

            chatForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const text = chatInput.value.trim();
                if (!text) return;
                
                appendMessage('user', text);
                messages.push({ role: 'user', content: text });
                
                chatInput.value = '';
                chatInput.disabled = true;
                submitBtn.disabled = true;
                setTypingIndicator(true);
                
                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ messages: messages })
                    });
                    
                    if (!response.ok) throw new Error('Netzwerk-Fehler');
                    
                    const data = await response.json();
                    setTypingIndicator(false);
                    
                    if (data.response) {
                        appendMessage('assistant', data.response);
                        messages.push({ role: 'assistant', content: data.response });
                    }
                } catch (error) {
                    setTypingIndicator(false);
                    console.error("API Error:", error);
                    appendMessage('error', 'Entschuldigung, die AI API ist gerade nicht erreichbar. Bitte kontaktieren Sie Alexander direkt über das Formular.');
                } finally {
                    chatInput.disabled = false;
                    submitBtn.disabled = false;
                    chatInput.focus();
                }
            });
        });
    </script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const header = document.getElementById('nav-header');
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileMenuIcon = document.getElementById('mobile-menu-icon');

            // 1. Navbar Scroll Style Adjustment
            const handleScroll = () => {
                if (window.scrollY > 20) {
                    header.classList.add('bg-white/80', 'shadow-sm');
                    header.classList.remove('bg-white/60');
                } else {
                    header.classList.remove('bg-white/80', 'shadow-sm');
                    header.classList.add('bg-white/60');
                }
            };
            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll();

            // 2. Mobile Menu Toggle
            const toggleMobileMenu = () => {
                if (mobileMenu) {
                    const isHidden = mobileMenu.classList.contains('hidden');
                    if (isHidden) {
                        mobileMenu.classList.remove('hidden');
                        mobileMenuIcon.classList.remove('fa-bars');
                        mobileMenuIcon.classList.add('fa-xmark');
                        mobileMenuBtn.setAttribute('aria-expanded', 'true');
                        mobileMenuBtn.setAttribute('aria-label', 'Menü schließen');
                    } else {
                        mobileMenu.classList.add('hidden');
                        mobileMenuIcon.classList.remove('fa-xmark');
                        mobileMenuIcon.classList.add('fa-bars');
                        mobileMenuBtn.setAttribute('aria-expanded', 'false');
                        mobileMenuBtn.setAttribute('aria-label', 'Menü öffnen');
                    }
                }
            };

            if (mobileMenuBtn) {
                mobileMenuBtn.addEventListener('click', toggleMobileMenu);
            }

            window.toggleMobileMenu = () => {
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    toggleMobileMenu();
                }
            };

            // 3. Navigation Highlighting on Scroll
            const sections = document.querySelectorAll('section[id]');
            const navLinks = {
                'home': document.getElementById('link-home'),
                'philosophie': document.getElementById('link-philosophie'),
                'expertise': document.getElementById('link-expertise'),
                'werdegang': document.getElementById('link-werdegang'),
                'projekte': document.getElementById('link-projekte'),
                'kontakt': document.getElementById('link-kontakt')
            };

            const highlightNavigation = () => {
                let currentActiveSectionId = '';
                const scrollPosition = window.scrollY + 140;

                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        currentActiveSectionId = section.getAttribute('id');
                    }
                });

                Object.keys(navLinks).forEach(id => {
                    const link = navLinks[id];
                    if (link) {
                        if (id === currentActiveSectionId) {
                            link.classList.remove('text-slate-500');
                            link.classList.add('text-blue-600', 'font-semibold');
                        } else {
                            link.classList.remove('text-blue-600', 'font-semibold');
                            link.classList.add('text-slate-500');
                        }
                    }
                });
            };

            window.addEventListener('scroll', highlightNavigation, { passive: true });
            highlightNavigation();
        });
    </script>
    <script>
        let currentLightboxImages = [];
        let currentImageIndex = 0;

        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxPrev = document.getElementById('lightbox-prev');
        const lightboxNext = document.getElementById('lightbox-next');
        const lightboxCounter = document.getElementById('lightbox-counter');

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

        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('hidden')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || (e.target.parentElement === lightbox && e.target !== lightboxImg && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'I')) {
                closeLightbox();
            }
        });
    </script>
