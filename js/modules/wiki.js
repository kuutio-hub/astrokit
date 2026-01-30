
export function initWiki() {
    const accordions = document.querySelectorAll('#wiki .accordion-header');

    accordions.forEach(accordion => {
        accordion.addEventListener('click', () => {
            const content = accordion.nextElementSibling;
            const isActive = accordion.classList.contains('active');
            
            // Close all accordions first
            accordions.forEach(acc => {
                acc.classList.remove('active');
                const cont = acc.nextElementSibling;
                cont.classList.remove('active');
                cont.style.maxHeight = null;
                cont.style.padding = '0 1.5rem';
            });
            
            // If the clicked one was not active, open it
            if (!isActive) {
                accordion.classList.add('active');
                content.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
                content.style.padding = '1.5rem';
            }
        });
    });
}
