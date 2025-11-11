document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const toggleInput = document.getElementById('version-toggle');
    
    // 포스터 관련 DOM 요소
    const posterGroup = document.getElementById('poster-group');
    const posterImg = document.getElementById('poster-img');
    
    // 스크롤 관련 DOM 요소
    const scrollContainer = document.getElementById('infographic-content');
    const scrollIndicator = document.getElementById('scroll-indicator');
    
    // 타이핑 관련 DOM 요소
    const typewriterElement = document.getElementById('typewriter-text');
    const introSection = document.getElementById('section-intro');
    const introText = typewriterElement ? typewriterElement.getAttribute('data-text') : '';
    
    // *** 애니메이션 제어 플래그 ***
    let isTyping = false;
    let hasTypedIntro = false; 
    let isZoomActive = false; 
    let hasCounted = false; 
    // ************************

    // *** 3D 카드 및 CEO 이미지 관련 DOM 요소 ***
    const cards = document.querySelectorAll('#section-achievements .card-item, #section-achievements-2 .card-item');
    const chairmanPhoto = document.querySelector('#section-chairman .chairman-photo img');


    // *** 캐러셀 관련 DOM 요소 및 변수 ***
    const reasonCarouselTrack = document.getElementById('reason-carousel-track');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const togglePlayBtn = document.getElementById('toggle-play-btn');
    const indicatorsContainer = document.getElementById('carousel-indicators');
    const carouselItems = reasonCarouselTrack ? reasonCarouselTrack.querySelectorAll('.carousel-item') : [];
    const totalSlides = carouselItems.length;

    let currentSlide = 0;
    let autoSlideInterval;
    let isPlaying = true;


    /**
     * 스크롤 위치에 따라 섹션 가시성을 확인하고 이벤트(타이핑, 카운트업)를 트리거합니다.
     */
    function handleSectionVisibility() {
        if (body.getAttribute('data-version') !== 'interaction-off') return;

        const scrollTop = scrollContainer.scrollTop;
        const viewportHeight = scrollContainer.clientHeight; 
        
        // 1. 스크롤 인디케이터 숨김 로직
        const firstSectionHeight = document.getElementById('section-logo').offsetHeight;
        if (scrollTop >= firstSectionHeight - viewportHeight * 0.5) { 
            scrollIndicator.classList.add('hidden-scroll');
        } else {
            scrollIndicator.classList.remove('hidden-scroll');
        }
        
        // 2. 타이핑 애니메이션 제어 로직 (한 번만 실행)
        if (introSection) {
            const introRect = introSection.getBoundingClientRect();
            
            const isVisible = (introRect.top < viewportHeight) && (introRect.bottom > viewportHeight * 0.2);

            if (isVisible && !isTyping && !hasTypedIntro) {
                startTypewriterEffect();
            }
        }

        // 3. 카운트업 애니메이션 제어 로직 (한 번만 실행)
        const achievementsSection = document.getElementById('section-achievements');
        if (achievementsSection && !hasCounted) {
            const achieveRect = achievementsSection.getBoundingClientRect();
            
            const isAchieveVisible = achieveRect.top < (viewportHeight * 0.66) && achieveRect.bottom > viewportHeight * 0.2;

            if (isAchieveVisible) {
                startCountUp();
                hasCounted = true; 
            }
        }
    }

    // --- 카운트업 애니메이션 로직 (jQuery 사용) ---
    function startCountUp() {
        $('.counting').each(function() {
            var $this = $(this),
                countTo = $this.attr('data-count');
            
            $this.text('0%'); 

            $({ countNum: 0 }).animate({
                countNum: countTo
            },
            {
                duration: 3000,
                easing:'linear',
                step: function() {
                    $this.text(Math.floor(this.countNum) + '%'); 
                },
                complete: function() {
                    $this.text(this.countNum + '%'); 
                }
            });  
        });
    }

    // --- 3D 카드 회전 및 확대 로직 (공통 함수 재사용) ---
    let threshold = 20;

    function getCenter(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    function rotate(cursorPosition, centerPosition, threshold = 20) {
        if (cursorPosition - centerPosition >= 0) {
            return (cursorPosition - centerPosition) >= threshold ? threshold : (cursorPosition - centerPosition);
        } else {
            return (cursorPosition - centerPosition) <= -threshold ? -threshold : (cursorPosition - centerPosition);
        }
    }

    function brightness(cursorPositionY, centerPositionY, strength = 50) {
        return 1 - rotate(cursorPositionY, centerPositionY) / strength;
    }

    // --- 카드에 3D 로직 적용 ---
    cards.forEach(card => {
        
        card.addEventListener("mousemove", function (event) {
            if (body.getAttribute('data-version') !== 'interaction-off') return;
            
            const center = getCenter(card);
            
            const rotationY = rotate(event.clientY, center.y); 
            const rotationX = rotate(event.clientX, center.x); 

            card.style.transform = `perspective(1000px)
                rotateY(${rotationX}deg)
                rotateX(${-rotationY}deg) 
                scale(1.05)`; 

            card.style.filter = `brightness(${brightness(event.clientY, center.y)})`;
            card.style.boxShadow = `${-rotationX * 0.5}px ${-rotationY * 0.5}px 30px 0px rgba(0, 0, 0, 0.7)`;
        });

        card.addEventListener("mouseleave", function () {
            card.style.transform = `perspective(1000px)`;
            card.style.filter = `brightness(1)`;
            card.style.boxShadow = `0 0 0 0 rgba(0, 0, 0, 0.5)`;
        });
    });

    // --- CEO 이미지에 3D 로직 적용 ---
    if (chairmanPhoto) {
        chairmanPhoto.addEventListener("mousemove", function (event) {
            if (body.getAttribute('data-version') !== 'interaction-off') return;

            const center = getCenter(chairmanPhoto);
            
            const rotationY = rotate(event.clientY, center.y); 
            const rotationX = rotate(event.clientX, center.x); 

            chairmanPhoto.style.transform = `perspective(1000px)
                rotateY(${rotationX}deg)
                rotateX(${-rotationY}deg) 
                scale(1.03)`;

            chairmanPhoto.style.filter = `brightness(${brightness(event.clientY, center.y)})`;
            chairmanPhoto.style.boxShadow = `${-rotationX}px ${-rotationY}px 40px 0px rgba(47, 77, 197, 0.6)`;
        });

        chairmanPhoto.addEventListener("mouseleave", function () {
            chairmanPhoto.style.transform = `perspective(1000px)`;
            chairmanPhoto.style.filter = `brightness(1)`;
            chairmanPhoto.style.boxShadow = `0 5px 15px rgba(0, 0, 0, 0.5)`; 
        });
    }

    // --- 기존 Zoom-on-Hover 로직 (포스터) ---
    
    function handleZoom(e) { 
        if (body.getAttribute('data-version') !== 'interaction-off') return;
        const rect = posterGroup.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        posterImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        if (!isZoomActive) {
            posterImg.style.transform = 'scale(2)';
            isZoomActive = true;
        }
    }

    function disableZoom() {
        posterImg.style.transform = 'scale(1)'; 
        posterImg.style.transformOrigin = 'center center'; 
        isZoomActive = false;
        posterGroup.removeEventListener('mousemove', handleZoom);
    }
    
    function enableZoomStart() {
        if (body.getAttribute('data-version') === 'interaction-off') {
            posterGroup.addEventListener('mousemove', handleZoom);
        }
    }
    
    // --- 타이핑 애니메이션 로직 ---
    let typingTimeout;

    function startTypewriterEffect() {
        if (!typewriterElement || isTyping || hasTypedIntro) return;
        
        isTyping = true;
        let charIndex = 0;
        typewriterElement.innerHTML = ''; 

        function type() {
            if (!isTyping) return;
            
            if (charIndex < introText.length) {
                let char = introText.charAt(charIndex);
                if (char === '\n') { 
                    typewriterElement.innerHTML += '<br>';
                } else {
                    typewriterElement.innerHTML += char;
                }
                charIndex++;
                typingTimeout = setTimeout(type, 80); 
            } else {
                isTyping = false;
                hasTypedIntro = true; 
            }
        }
        
        type();
    }
    
    function stopTypewriterEffect() {
        clearTimeout(typingTimeout);
        isTyping = false;
        if (!hasTypedIntro) {
            typewriterElement.innerHTML = ''; 
        }
    }


    // --- 캐러셀 로직 ---

    /** 인디케이터 생성 */
    function createIndicators() {
        if (!indicatorsContainer) return;
        indicatorsContainer.innerHTML = ''; 
        carouselItems.forEach((_, i) => {
            const button = document.createElement('button');
            button.setAttribute('data-slide', i);
            button.classList.add('indicator-button');
            button.addEventListener('click', () => {
                stopAutoSlide(); 
                moveToSlide(i);
                isPlaying = false; 
                togglePlayBtn.textContent = '재생';
            });
            indicatorsContainer.appendChild(button);
        });
    }
    
    /** 슬라이드 이동 및 UI 업데이트 */
    function moveToSlide(index) {
        if (!reasonCarouselTrack || totalSlides === 0) return;

        if (index >= totalSlides) {
            index = 0;
        } else if (index < 0) {
            index = totalSlides - 1;
        }
        
        currentSlide = index;

        // CSS transform을 사용하여 슬라이드 이동
        const offset = -currentSlide * 100;
        reasonCarouselTrack.style.transform = `translateX(${offset}%)`;

        // 인디케이터 활성화
        if (indicatorsContainer) {
            indicatorsContainer.querySelectorAll('.indicator-button').forEach((btn, i) => {
                btn.classList.toggle('active', i === currentSlide);
            });
        }
    }

    /** 자동 슬라이드 시작/재시작 */
    function startAutoSlide() {
        if (!isPlaying || !togglePlayBtn) return;
        stopAutoSlide(); 
        autoSlideInterval = setInterval(() => {
            moveToSlide(currentSlide + 1);
        }, 5000); // 5초 간격
        togglePlayBtn.textContent = '멈춤';
    }

    /** 자동 슬라이드 멈춤 */
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }
    
    /** 캐러셀 버튼 이벤트 부착 */
    function attachCarouselEvents() {
        if (totalSlides === 0 || !prevBtn || !nextBtn || !togglePlayBtn) return;
        
        createIndicators();
        moveToSlide(currentSlide); 
        startAutoSlide(); 

        prevBtn.onclick = () => {
            stopAutoSlide();
            moveToSlide(currentSlide - 1);
            if (isPlaying) startAutoSlide();
        };
        
        nextBtn.onclick = () => {
            stopAutoSlide();
            moveToSlide(currentSlide + 1);
            if (isPlaying) startAutoSlide();
        };
        
        togglePlayBtn.onclick = () => {
            if (isPlaying) {
                stopAutoSlide();
                isPlaying = false;
                togglePlayBtn.textContent = '재생';
            } else {
                isPlaying = true;
                startAutoSlide();
            }
        };
    }
    
    /** 캐러셀 초기화/제거 */
    function destroyCarousel() {
        stopAutoSlide();
    }
    
    // --- 모드 전환 및 초기화 로직 ---

    /**
     * 모드 전환 로직
     */
    function switchMode(mode) {
        body.setAttribute('data-version', mode);

        if (mode === 'interaction-off') {
            // 정보 모드 (Scroll Snap + Zoom + Typing)
            scrollContainer.addEventListener('scroll', handleSectionVisibility);
            
            posterGroup.addEventListener('mouseenter', enableZoomStart);
            posterGroup.addEventListener('mouseleave', disableZoom);
            
            handleSectionVisibility(); 
            scrollContainer.style.overflowY = 'scroll'; 
            
            // *** 캐러셀 활성화 ***
            attachCarouselEvents(); 

        } else {
            // 게임 모드 (단일 화면)
            scrollContainer.removeEventListener('scroll', handleSectionVisibility);
            stopTypewriterEffect(); 
            
            posterGroup.removeEventListener('mouseenter', enableZoomStart);
            posterGroup.removeEventListener('mouseleave', disableZoom);
            disableZoom(); 
            
            // *** 캐러셀 비활성화 ***
            destroyCarousel();
            
            // 스크롤 위치 초기화 
            scrollContainer.scrollTop = 0; 
            scrollContainer.style.overflowY = 'hidden'; 
            
            if (hasTypedIntro) {
                 typewriterElement.innerHTML = introText.replace(/\n/g, '<br>');
            } else {
                 typewriterElement.innerHTML = '';
            }
        }

        // 텍스트 색상 관리 (기존 로직 유지)
        const titleElements = document.querySelectorAll('.body-title');
        
        if (mode === 'interaction-on') {
            titleElements.forEach(h2 => {
                 h2.classList.remove('text-gray-800'); 
                 h2.classList.add('text-white');
            });
        } else {
             titleElements.forEach(h2 => {
                 h2.classList.remove('text-white');
                 h2.classList.add('text-gray-800');
            });
        }

        console.log(`모드가 "${mode}"으로 전환되었습니다.`);
    }

    // 토글 스위치 변경 이벤트 리스너
    toggleInput.addEventListener('change', (e) => {
        const newMode = e.target.checked ? 'interaction-off' : 'interaction-on';
        switchMode(newMode);
    });

    // 페이지 로드 시 초기 상태 설정
    switchMode(toggleInput.checked ? 'interaction-off' : 'interaction-on');
});