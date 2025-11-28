document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    // const toggleInput = document.getElementById('version-toggle'); <--- 제거됨
    // aa
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
    
    // Mission 텍스트 관련 DOM 요소
    const missionTextContainer = document.querySelector('.mission-text');
    const missionTextParagraphs = missionTextContainer ? missionTextContainer.querySelectorAll('p') : [];
    
    // *** 애니메이션 제어 플래그 ***
    let isTyping = false;
    let hasTypedIntro = false; 
    let isZoomActive = false; 
    let hasCounted = false;
    let hasTypedMission = false;
    let isTypingMission = false;
    // ************************

    // *** 3D 카드 및 CEO 이미지 관련 DOM 요소 ***
    const cards = document.querySelectorAll('#section-achievements .card-item');
    const chairmanPhoto = document.querySelector('#section-chairman .chairman-photo img');
    const serviceCardToggles = document.querySelectorAll('.service-card-toggle');


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
    let isPlaying = true; // 모드가 고정되므로 기본적으로 재생


    /**
     * 스크롤 위치에 따라 섹션 가시성을 확인하고 이벤트(타이핑, 카운트업)를 트리거합니다.
     */
    function handleSectionVisibility() {
        // 모드가 interaction-off로 고정되었으므로 별도의 모드 확인 불필요
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight; 
        
        // 1. 스크롤 인디케이터 숨김 로직
        if (scrollIndicator) {
            const firstSectionHeight = document.getElementById('section-logo').offsetHeight;
            if (scrollTop >= firstSectionHeight - viewportHeight * 0.5) { 
                scrollIndicator.classList.add('hidden-scroll');
            } else {
                scrollIndicator.classList.remove('hidden-scroll');
            }
        }
        
        // Mission 텍스트 타이핑 효과
        const logoSection = document.getElementById('section-logo');
        if (logoSection && missionTextContainer && !hasTypedMission && !isTypingMission) {
            const logoRect = logoSection.getBoundingClientRect();
            const isLogoVisible = (logoRect.top < viewportHeight) && (logoRect.bottom > viewportHeight * 0.2);
            
            if (isLogoVisible) {
                startMissionTypewriterEffect();
            }
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

    // --- 3D 카드 회전 및 확대 로직 ---
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

    cards.forEach(card => {
        
        card.addEventListener("mousemove", function (event) {
            // 모드 확인 불필요 (항상 interaction-off)
            
            const center = getCenter(card);
            
            const rotationY = rotate(event.clientY, center.y); 
            const rotationX = rotate(event.clientX, center.x); 

            card.style.transform = `perspective(1000px)
                rotateY(${rotationX}deg)
                rotateX(${-rotationY}deg) 
                scale(1.15)`; 

            card.style.filter = `brightness(${brightness(event.clientY, center.y)})`;
            card.style.boxShadow = `${-rotationX * 0.5}px ${-rotationY * 0.5}px 30px 0px rgba(0, 0, 0, 0.7)`;
        });

        card.addEventListener("mouseleave", function () {
            card.style.transform = `perspective(1000px)`;
            card.style.filter = `brightness(1)`;
            card.style.boxShadow = `0 0 0 0 rgba(0, 0, 0, 0.5)`;
        });
    });

    // --- 서비스 카드 토글 ---
    serviceCardToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const card = toggle.closest('.service-card');
            const details = card.querySelector('.service-card-details');
            const isOpen = card.classList.toggle('open');

            if (!details) return;

            if (isOpen) {
                details.style.maxHeight = `${details.scrollHeight}px`;
            } else {
                details.style.maxHeight = '0px';
            }
        });
    });

    // --- CEO 이미지에 3D 로직 적용 ---
    if (chairmanPhoto) {
        chairmanPhoto.addEventListener("mousemove", function (event) {
            // 모드 확인 불필요 (항상 interaction-off)

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
        // 모드 확인 불필요 (항상 interaction-off)
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
        // 모드 확인 불필요 (항상 interaction-off)
        posterGroup.addEventListener('mousemove', handleZoom);
    }
    
    // --- 타이핑 애니메이션 로직 ---
    let typingTimeout;
    let missionTypingTimeout;

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
    
    // --- Mission 텍스트 타이핑 애니메이션 로직 ---
    function startMissionTypewriterEffect() {
        if (!missionTextContainer || isTypingMission || hasTypedMission || missionTextParagraphs.length === 0) return;
        
        isTypingMission = true;
        hasTypedMission = true;
        
        // 각 p 태그의 원본 텍스트 저장
        const originalTexts = Array.from(missionTextParagraphs).map(p => p.textContent.trim());
        
        // 모든 p 태그 비우기
        missionTextParagraphs.forEach(p => {
            p.textContent = '';
        });
        
        let currentParagraphIndex = 0;
        let currentCharIndex = 0;
        
        function typeMission() {
            if (!isTypingMission) return;
            
            if (currentParagraphIndex < missionTextParagraphs.length) {
                const currentParagraph = missionTextParagraphs[currentParagraphIndex];
                const currentText = originalTexts[currentParagraphIndex];
                
                if (currentCharIndex < currentText.length) {
                    currentParagraph.textContent += currentText.charAt(currentCharIndex);
                    currentCharIndex++;
                    missionTypingTimeout = setTimeout(typeMission, 50); // 50ms 간격
                } else {
                    // 현재 문단 완료, 다음 문단으로
                    currentParagraphIndex++;
                    currentCharIndex = 0;
                    if (currentParagraphIndex < missionTextParagraphs.length) {
                        // 다음 문단 시작 전 약간의 딜레이
                        missionTypingTimeout = setTimeout(typeMission, 300);
                    } else {
                        // 모든 문단 완료
                        isTypingMission = false;
                    }
                }
            } else {
                isTypingMission = false;
            }
        }
        
        // 약간의 딜레이 후 시작
        missionTypingTimeout = setTimeout(typeMission, 500);
    }
    
    // --- 캐러셀 로직 (버튼 핸들러 함수들만 유지) ---
    function createIndicators() { /* ... 유지 ... */ }
    function moveToSlide(index) { /* ... 유지 ... */ }
    function startAutoSlide() { /* ... 유지 ... */ }
    function stopAutoSlide() { /* ... 유지 ... */ }
    function attachCarouselEvents() { /* ... 유지 ... */ }
    
    
    // -----------------------------------------------------
    // *** 페이지 로드 시, 'interaction-off' 모드 활성화 로직 실행 ***
    // -----------------------------------------------------

    // 1. 정보 모드 (Scroll + Zoom + Typing) 활성화
    window.addEventListener('scroll', handleSectionVisibility, { passive: true });
    
    // 포스터 줌 활성화
    if (posterGroup) {
        posterGroup.addEventListener('mouseenter', enableZoomStart);
        posterGroup.addEventListener('mouseleave', disableZoom);
    }
    
    // 초기 상태 설정 및 스크롤 이벤트 트리거
    handleSectionVisibility(); 
    scrollContainer.style.overflowY = 'visible'; 
    
    // 캐러셀 활성화
    attachCarouselEvents(); 
    
    // 텍스트 색상 관리 (헤더 대비) - Tailwind 클래스 직접 조작
    const titleElements = document.querySelectorAll('.body-title, .data-color-target');
    titleElements.forEach(el => {
        // 헤더 배경이 흰색이므로, 텍스트는 어두운 색으로 고정
        el.classList.add('text-gray-800'); 
    });

    console.log(`모드가 "interaction-off"로 고정되었습니다.`);
});