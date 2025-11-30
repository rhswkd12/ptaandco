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
    // const reasonCarouselTrack = document.getElementById('reason-carousel-track');
    // const prevBtn = document.getElementById('prev-btn');
    // const nextBtn = document.getElementById('next-btn');
    // const togglePlayBtn = document.getElementById('toggle-play-btn');
    // const indicatorsContainer = document.getElementById('carousel-indicators');
    // const carouselItems = reasonCarouselTrack ? reasonCarouselTrack.querySelectorAll('.carousel-item') : [];
    // const totalSlides = carouselItems.length;

    // let currentSlide = 0;
    // let autoSlideInterval;
    // let isPlaying = true; // 모드가 고정되므로 기본적으로 재생


    /**
     * 스크롤 위치에 따라 섹션 가시성을 확인하고 이벤트(타이핑, 카운트업)를 트리거합니다.
     */
    function handleSectionVisibility() {
        // 모드가 interaction-off로 고정되었으므로 별도의 모드 확인 불필요
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight;
        
        // 네비게이션 활성 상태 업데이트
        updateActiveNavLink(scrollTop, viewportHeight); 
        
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
    
    // --- 네비게이션 활성 링크 업데이트 ---
    function updateActiveNavLink(scrollTop, viewportHeight) {
        const navLinks = document.querySelectorAll('#nav-links .nav-link');
        const sections = [
            { id: 'section-logo', link: null },
            { id: 'section-intro', link: document.querySelector('a[href="#section-intro"]') },
            { id: 'section-achievements', link: document.querySelector('a[href="#section-achievements"]') },
            { id: 'section-service-showcase', link: document.querySelector('a[href="#section-service-showcase"]') },
            { id: 'section-service-subject', link: document.querySelector('a[href="#section-service-subject"]') },
            { id: 'section-chairman', link: document.querySelector('a[href="#section-chairman"]') },
            { id: 'section-dept', link: document.querySelector('a[href="#section-dept"]') },
            { id: 'poster-area', link: document.querySelector('a[href="#poster-area"]') }
        ];
        
        // 모든 링크에서 active 클래스 제거
        navLinks.forEach(link => link.classList.remove('active'));
        
        // 현재 보이는 섹션 찾기
        let currentSection = null;
        const scrollOffset = viewportHeight * 0.3; // 섹션이 화면 상단 30% 지점에 도달하면 활성화
        
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i].id);
            if (section && sections[i].link) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= scrollOffset) {
                    currentSection = sections[i];
                    break;
                }
            }
        }
        
        // 첫 번째 섹션(section-logo)이 화면에 보이면 아무 링크도 활성화하지 않음
        const logoSection = document.getElementById('section-logo');
        if (logoSection) {
            const logoRect = logoSection.getBoundingClientRect();
            if (logoRect.top >= 0 && logoRect.bottom > viewportHeight * 0.5) {
                return; // 첫 번째 섹션이 보이면 활성 링크 없음
            }
        }
        
        // 현재 섹션에 해당하는 링크 활성화
        if (currentSection && currentSection.link) {
            currentSection.link.classList.add('active');
        }
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
    
    // Research card carousel functionality
    const carouselContainer = document.querySelector('.service-subject-research-carousel');
    if (carouselContainer) {
        const slides = carouselContainer.querySelectorAll('.carousel-slide');
        const prevButton = carouselContainer.querySelector('.carousel-arrow-prev');
        const nextButton = carouselContainer.querySelector('.carousel-arrow-next');
        let currentSlide = 0;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                if (i === index) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            // Show/hide navigation arrows
            if (prevButton) {
                prevButton.style.display = index === 0 ? 'none' : 'flex';
            }
            if (nextButton) {
                nextButton.style.display = index === slides.length - 1 ? 'none' : 'flex';
            }
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (currentSlide > 0) {
                    currentSlide--;
                    showSlide(currentSlide);
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (currentSlide < slides.length - 1) {
                    currentSlide++;
                    showSlide(currentSlide);
                }
            });
        }

        // Initialize
        showSlide(0);
    }

    // 텍스트 색상 관리 (헤더 대비) - Tailwind 클래스 직접 조작
    const titleElements = document.querySelectorAll('.body-title, .data-color-target');
    titleElements.forEach(el => {
        // 헤더 배경이 흰색이므로, 텍스트는 어두운 색으로 고정
        el.classList.add('text-gray-800'); 
    });

    // Chairman history tabs functionality
    const historyTabs = document.querySelectorAll('.history-tab');
    const historyContentItems = document.querySelectorAll('.history-content-item');

    historyTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const year = tab.getAttribute('data-year');

            // Remove active class from all tabs and content items
            historyTabs.forEach(t => t.classList.remove('active'));
            historyContentItems.forEach(item => item.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetContent = document.querySelector(`.history-content-item[data-year="${year}"]`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // Department modal functionality
    const deptSections = document.querySelectorAll('.dept-section');
    const deptModal = document.getElementById('dept-modal');
    const deptModalClose = document.querySelector('.dept-modal-close');
    const deptModalImage = document.querySelector('.dept-modal-image');

    const deptImages = {
        data: 'images/subbg01.png',
        algo: 'images/subbg02.png',
        ui: 'images/subbg03.png',
        ux: 'images/subbg04.png'
    };

    deptSections.forEach(section => {
        section.addEventListener('click', () => {
            const deptType = section.getAttribute('data-dept');
            const imagePath = deptImages[deptType];
            
            if (imagePath) {
                deptModalImage.src = imagePath;
                deptModalImage.alt = section.querySelector('.dept-name').textContent;
                deptModal.classList.add('active');
            }
        });
    });

    if (deptModalClose) {
        deptModalClose.addEventListener('click', () => {
            deptModal.classList.remove('active');
        });
    }

    if (deptModal) {
        deptModal.addEventListener('click', (e) => {
            if (e.target === deptModal) {
                deptModal.classList.remove('active');
            }
        });
    }

    // Poster data modal functionality
    const posterSideImages = document.querySelectorAll('.poster-side-image');
    const posterDataModal = document.getElementById('poster-data-modal');
    const posterDataModalClose = document.querySelector('.poster-data-modal-close');
    const posterDataImage = document.querySelector('.poster-data-image');
    const posterSubdataImage = document.querySelector('.poster-subdata-image');
    const hoverAreas = document.querySelectorAll('.hover-area');

    const posterDataImages = {
        'poster02.png': 'images/visdata01.png',
        'poster03.png': 'images/visdata02.png',
        'poster04.png': 'images/visdata03.png',
        'poster05.png': 'images/visdata04.png'
    };

    // Visdata02 zoom functionality
    let isVisdata02ZoomActive = false;
    const posterDataImageWrapper = document.querySelector('.poster-data-image-wrapper');
    const posterZoomToggle = document.querySelector('.poster-zoom-toggle');

    function handleVisdata02Zoom(e) {
        if (!posterDataImage || !posterDataImageWrapper) return;
        
        const currentImageSrc = posterDataImage.src || '';
        if (!currentImageSrc.includes('visdata02')) return;

        const rect = posterDataImageWrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        posterDataImage.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        if (!isVisdata02ZoomActive) {
            posterDataImage.style.transform = 'scale(2)';
            isVisdata02ZoomActive = true;
        }
    }

    function disableVisdata02Zoom() {
        if (!posterDataImage) return;
        posterDataImage.style.transform = 'scale(1)';
        posterDataImage.style.transformOrigin = 'center center';
        isVisdata02ZoomActive = false;
        if (posterDataImageWrapper) {
            posterDataImageWrapper.removeEventListener('mousemove', handleVisdata02Zoom);
        }
        if (posterZoomToggle) {
            posterZoomToggle.classList.remove('active');
        }
    }

    function enableVisdata02ZoomStart() {
        if (!posterDataImage || !posterDataImageWrapper) return;
        const currentImageSrc = posterDataImage.src || '';
        if (currentImageSrc.includes('visdata02')) {
            posterDataImageWrapper.addEventListener('mousemove', handleVisdata02Zoom);
            if (posterZoomToggle) {
                posterZoomToggle.classList.add('active');
            }
        }
    }

    posterSideImages.forEach((img, index) => {
        img.addEventListener('click', () => {
            const imageKey = `poster0${index + 2}.png`;
            const dataImagePath = posterDataImages[imageKey];
            
            if (dataImagePath) {
                // 기존 줌 비활성화
                disableVisdata02Zoom();
                
                posterDataImage.src = dataImagePath;
                posterDataImage.alt = `데이터 이미지 ${index + 1}`;
                posterDataModal.classList.add('active');
                
            // visdata01.png일 때만 호버 영역 활성화
            if (dataImagePath.includes('visdata01.png')) {
                hoverAreas.forEach(area => {
                    area.style.pointerEvents = 'auto';
                    area.style.display = 'block';
                });
                console.log('Hover areas enabled for visdata01');
            } else {
                hoverAreas.forEach(area => {
                    area.style.pointerEvents = 'none';
                    area.style.display = 'none';
                });
                if (posterSubdataImage) {
                    posterSubdataImage.style.display = 'none';
                }
            }

            // visdata02.png일 때만 줌 버튼 표시
            if (dataImagePath.includes('visdata02.png')) {
                if (posterZoomToggle) {
                    posterZoomToggle.style.display = 'flex';
                }
            } else {
                if (posterZoomToggle) {
                    posterZoomToggle.style.display = 'none';
                }
                disableVisdata02Zoom();
            }
            }
        });
    });

    if (posterDataModalClose) {
        posterDataModalClose.addEventListener('click', () => {
            posterDataModal.classList.remove('active');
            disableVisdata02Zoom();
        });
    }

    if (posterDataModal) {
        posterDataModal.addEventListener('click', (e) => {
            if (e.target === posterDataModal) {
                posterDataModal.classList.remove('active');
                disableVisdata02Zoom();
            }
        });
    }

    // Visdata hover functionality - visdata01.png일 때만 작동
    if (hoverAreas && hoverAreas.length > 0 && posterSubdataImage && posterDataImage) {
        // 초기에는 호버 영역 비활성화
        hoverAreas.forEach(area => {
            area.style.pointerEvents = 'none';
            area.style.display = 'none';
        });
        
        hoverAreas.forEach(area => {
            area.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                const subdataPath = area.getAttribute('data-subdata');
                const currentImageSrc = posterDataImage.src || '';
                
                // visdata01.png가 표시되어 있을 때만 작동
                if (subdataPath && currentImageSrc.includes('visdata01')) {
                    const fullPath = `images/${subdataPath}`;
                    posterSubdataImage.src = fullPath;
                    posterSubdataImage.style.display = 'block';
                    console.log('Hover activated, showing:', fullPath);
                }
            });

            area.addEventListener('mouseleave', () => {
                if (posterSubdataImage) {
                    posterSubdataImage.style.display = 'none';
                }
            });
        });
    }

    // Visdata02 zoom toggle button functionality
    if (posterZoomToggle && posterDataImageWrapper) {
        posterZoomToggle.addEventListener('click', () => {
            const currentImageSrc = posterDataImage.src || '';
            if (!currentImageSrc.includes('visdata02')) return;

            if (isVisdata02ZoomActive) {
                disableVisdata02Zoom();
            } else {
                enableVisdata02ZoomStart();
            }
        });
    }

    console.log(`모드가 "interaction-off"로 고정되었습니다.`);
});