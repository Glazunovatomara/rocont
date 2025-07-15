document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('track');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const sliderItems = document.querySelectorAll('.slider-gallery-item');
    const viewport = document.querySelector('.slider-gallery-viewport');

    let currentIndex = 0; 
    const totalItems = sliderItems.length; 

    let itemWidth = 0;      
    const gapWidth = 8;     
    let scrollStep = 0;    
    let visibleItemsCount = 0; 
    let maxScrollIndex = 0;    

    let touchStartX = 0;
    let touchCurrentX = 0;
    let isDragging = false; 
    const swipeThreshold = 50; 
    const elasticityFactor = 0.3; 

    function updateDynamicDimensions() {
        const currentItemWidth = sliderItems[0].offsetWidth;

        itemWidth = currentItemWidth;
        scrollStep = itemWidth + gapWidth;

        visibleItemsCount = calculateVisibleItemsCount();
        maxScrollIndex = calculateMaxScrollIndex();
    }

    function calculateVisibleItemsCount() {
        if (!viewport || viewport.clientWidth === 0 || scrollStep === 0) {
            return 1; 
        } return Math.max(1, Math.floor((viewport.clientWidth + gapWidth) / scrollStep));
    }

    function calculateMaxScrollIndex() {
        if (totalItems <= visibleItemsCount || scrollStep === 0) {
            return 0;
        } return totalItems - visibleItemsCount;
    }

    function updateSliderPosition() {
        if (!isDragging) {
            track.style.transition = 'transform 0.5s ease-in-out';
        }

        const offset = (scrollStep === 0) ? 0 : -currentIndex * scrollStep;
        track.style.transform = `translateX(${offset}px)`;

        updateButtonStates();
    }

    function updateButtonStates() {
        if (totalItems <= visibleItemsCount || scrollStep === 0) {
            if (prevButton) prevButton.disabled = true;
            if (nextButton) nextButton.disabled = true;
            return;
        }

        if (prevButton) {
            prevButton.disabled = currentIndex === 0;
        }
        if (nextButton) {
            nextButton.disabled = currentIndex >= maxScrollIndex;
        }
    }

    function goToNextSlide() {
        if (currentIndex < maxScrollIndex) {
            currentIndex++;
            updateSliderPosition();
        }
    }

    function goToPrevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSliderPosition();
        }
    }

    if (prevButton) {
        prevButton.addEventListener('click', goToPrevSlide);
    }
    if (nextButton) {
        nextButton.addEventListener('click', goToNextSlide);
    }

track.addEventListener('touchstart', (e) => {
        if (totalItems <= visibleItemsCount || scrollStep === 0 || e.touches.length > 1) return;

        touchStartX = e.touches[0].clientX;
        touchCurrentX = touchStartX;
        isDragging = false; 
        track.style.transition = 'none'; 
    }, { passive: true }); 

    track.addEventListener('touchmove', (e) => {
        if (totalItems <= visibleItemsCount || scrollStep === 0 || e.touches.length > 1) return;

        touchCurrentX = e.touches[0].clientX;
        const deltaX = touchCurrentX - touchStartX; 

        let newOffset = -currentIndex * scrollStep + deltaX;

        const currentMinTrackOffset = -(maxScrollIndex) * scrollStep;
        const currentMaxTrackOffset = 0;

        if (newOffset > currentMaxTrackOffset) {
            newOffset = currentMaxTrackOffset + (newOffset - currentMaxTrackOffset) * elasticityFactor;
        } else if (newOffset < currentMinTrackOffset) {
            newOffset = currentMinTrackOffset + (newOffset - currentMinTrackOffset) * elasticityFactor;
        }

        track.style.transform = `translateX(${newOffset}px)`;

        if (Math.abs(deltaX) > 10) {
            isDragging = true;
            e.preventDefault(); 
        }
    }, { passive: false }); 

    track.addEventListener('touchend', () => {
        if (totalItems <= visibleItemsCount || scrollStep === 0) return;

        const deltaX = touchCurrentX - touchStartX;
        track.style.transition = 'transform 0.5s ease-in-out';

        if (isDragging) {
            if (deltaX > swipeThreshold) { 
                goToPrevSlide();
            } else if (deltaX < -swipeThreshold) { 
                goToNextSlide();
            } else {
                updateSliderPosition();
            }
        } else {
            updateSliderPosition();
        }

        touchStartX = 0;
        touchCurrentX = 0;
        isDragging = false;
    }, { passive: true });

    function initializeSlider() {
        updateDynamicDimensions(); 
        
        if (currentIndex > maxScrollIndex) {
            currentIndex = maxScrollIndex;
        }
        if (currentIndex < 0) {
            currentIndex = 0;
        }

        updateSliderPosition(); 
    }

    initializeSlider();

    let resizeTimeout;
    window.addEventListener('resize', () => {
        cancelAnimationFrame(resizeTimeout);
        resizeTimeout = requestAnimationFrame(initializeSlider);
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('mainForm');
    const nameInput = document.getElementById('userName');
    const phoneInput = document.getElementById('userPhone');
    const consentCheckbox = document.getElementById('userConsent');
    const errorContainer = document.querySelector('.FormSection-form-errors');
    const successContainer = document.querySelector('.FormSection-form-success');

    function displayError(message) {
        const errorP = document.createElement('p');
        errorP.textContent = message;
        errorContainer.appendChild(errorP);
    }

    function clearMessages() {
        errorContainer.innerHTML = '';
        successContainer.innerHTML = '';
    }

    function clearInvalidStyles() {
        nameInput.classList.remove('is-invalid');
        phoneInput.classList.remove('is-invalid');
        consentCheckbox.classList.remove('is-invalid');
    }

    function validateForm() {
        let isValid = true; 

        clearMessages();  
        clearInvalidStyles();  

        if (nameInput.value.trim() === '') {
            displayError('Пожалуйста, введите ваше имя.');
            nameInput.classList.add('is-invalid');
            isValid = false;
        }

        const phoneValue = phoneInput.value.trim();
        const phoneRegex = /^[\d\s\(\)\-+]+$/; 
        const digitsOnlyPhone = phoneValue.replace(/\D/g, ''); 

        if (phoneValue === '') {
            displayError('Пожалуйста, введите ваш телефон.');
            phoneInput.classList.add('is-invalid');
            isValid = false;
        } else if (!phoneRegex.test(phoneValue)) {
            displayError('Телефон содержит недопустимые символы. Используйте только цифры, +, -, (, ).');
            phoneInput.classList.add('is-invalid');
            isValid = false;
        } else if (digitsOnlyPhone.length < 7) { 
            displayError('Телефон должен содержать не менее 7 цифр.');
            phoneInput.classList.add('is-invalid');
            isValid = false;
        }

        // 3. Валидация чекбокса согласия
        if (!consentCheckbox.checked) {
            displayError('Вы должны согласиться на обработку данных.');
            consentCheckbox.classList.add('is-invalid'); 
            isValid = false;
        }

        return isValid;
    }

    // Обработчик события отправки формы
    form.addEventListener('submit', (event) => {
        event.preventDefault(); 

        if (validateForm()) {
            const formData = {
                name: nameInput.value.trim(),
                phone: phoneInput.value.trim(),
                consent: consentCheckbox.checked
            };

            console.log('Форма успешно отправлена:', formData);

            // Отображаем сообщение об успехе
            successContainer.textContent = 'Спасибо! Ваша заявка успешно отправлена.';

            // очищаем поля 
            nameInput.value = '';
            phoneInput.value = '';
            consentCheckbox.checked = false;

        } else {
            console.log('Форма не прошла валидацию. Исправьте ошибки.');
        }
    });

    nameInput.addEventListener('input', () => {
        if (nameInput.value.trim() !== '') {
            nameInput.classList.remove('is-invalid');
        }
    });

    phoneInput.addEventListener('input', () => {
        const phoneRegex = /^[\d\s\(\)\-+]*$/;
        if (phoneRegex.test(phoneInput.value)) {
            phoneInput.classList.remove('is-invalid');
        }
    });

    consentCheckbox.addEventListener('change', () => {
        if (consentCheckbox.checked) {
            consentCheckbox.classList.remove('is-invalid');
        }
    });
});

const checkbox = document.querySelector(".header-menu-checkbox");
const burger = document.querySelector(".header-nav");
const itemsBurger = document.querySelectorAll(".nav-item-link");

function closeBurger(event) {
    let index = Array.from(itemsBurger).indexOf(event.target);
    let num = itemsBurger.length - 1;
    if (index <= num && index != -1) {
      checkbox.checked = false;
    }
  }
  burger.addEventListener("click", closeBurger);