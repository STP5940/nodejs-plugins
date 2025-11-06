let Gblanguage = [];

// Function to perform AJAX request
function ajaxRequest(url, method, callback, errorCallback) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                callback(xhr.responseText);
            } else {
                errorCallback(xhr.status, xhr.statusText);
            }
        }
    };
    xhr.send();
}

// Function to load translations based on selected language
function loadTranslations(language) {
    return new Promise((resolve, reject) => {
        const rootPath = window.location.origin;
        ajaxRequest(
            `${rootPath}/user/language/${language}/show`,
            'GET',
            response => {
                Gblanguage = JSON.parse(response);
                resolve(JSON.parse(response));
            },
            (status, statusText) => {
                reject(new Error(`Failed to load translations: ${status} ${statusText}`));
            }
        );
    });
}

function rewriteTranslations(languageKeys = []) {
    const selectors = languageKeys.map(languageKey => `[data-language="${languageKey}"]`).join(',');
    document.querySelectorAll(selectors || "[data-language]").forEach(element => {
        const key = element.getAttribute('data-language');
        const dataString = element.getAttribute('data-string');
        if (Gblanguage[key]) {
            element.innerHTML = Gblanguage[key].replace("@string", dataString);
        }
    });
}

// Function to update UI with translations
function updateTranslations() {
    // Update elements with data-language attribute
    document.querySelectorAll('[data-language]').forEach(element => {
        const key = element.getAttribute('data-language');
        const dataString = element.getAttribute('data-string');
        if (Gblanguage[key]) {
            element.innerHTML = Gblanguage[key].replace("@string", dataString);
        }
    });
}

function rewriteTranslations_placeholder(languageKeys = []) {
    const selectors = languageKeys.map(languageKey => `[data-language-placeholder="${languageKey}"]`).join(',');
    document.querySelectorAll(selectors || "[data-language-placeholder]").forEach(element => {
        const key = element.getAttribute('data-language-placeholder');
        if (Gblanguage[key]) {
            element.placeholder = Gblanguage[key];
        }
    });
}

function updateTranslations_placeholder() {
    // Update elements with data-language attributes
    document.querySelectorAll('[data-language-placeholder]').forEach(element => {
        const key = element.getAttribute('data-language-placeholder');
        if (Gblanguage[key]) {
            element.placeholder = Gblanguage[key];
        }
    });
}

function Setlanguage(language) {
    const rootPath = window.location.origin;
    ajaxRequest(
        `${rootPath}/user/language/${language}`,
        'GET',
        () => {
            loadTranslations(language || 'th').then(() => {
                updateTranslations();
                updateTranslations_placeholder();
                $('.selected-language').attr('data-language-select', language);
                console.log('Language set successfully');

                // เปลี่ยนภาษา (locale) ของ calendar โดยไม่ reload ใหม่
                if (window.calendar) {
                    window.calendar.setOption('locale', language);
                    window.calendar.setOption('buttonText', BUTTONTEXT[language]);
                    window.calendar.setOption('allDayText', ALLDAYTEXT[language]);
                } else {
                    // console.warn('❌ calendar ยังไม่ถูกสร้าง');
                }
            });
        },
        error => {
            console.error('Error setting language:', error);
        }
    );
}

// Initialize translations based on default language
document.addEventListener("DOMContentLoaded", function () {
    // โหลดซ้ำหลังจากโหลด DOM เสร็จ
    rewriteTranslations();
    rewriteTranslations_placeholder();
});

const BUTTONTEXT = {
    th: { today: 'วันนี้', month: 'เดือน', week: 'สัปดาห์', day: 'วัน', list: 'รายการ' },
    en: { today: 'Today', month: 'Month', week: 'Week', day: 'Day', list: 'List' }
};

const ALLDAYTEXT = {
    en: 'All-Day',
    th: 'ตลอดวัน'
};

// Calendar เปลี่ยนภาษา
window.calendarLanguage = {
    BUTTONTEXT,
    ALLDAYTEXT,
};