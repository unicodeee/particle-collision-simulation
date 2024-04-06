// TypeScript code
window.addEventListener('DOMContentLoaded', () => {
    const leftSection = document.getElementById('left-section')!;
    const centerSection = document.getElementById('center-section')!;
    const rightSection = document.getElementById('right-section')!;

    function adjustLayout() {
        const screenWidth = window.innerWidth;
        // const screenHeight = window.innerHeight;

        // Check if screen size is small
        if (screenWidth <= 768) {
            leftSection.classList.remove('side-section');
            centerSection.classList.add('full-width');
            if (rightSection) {
                rightSection.classList.remove('side-section');
            }
        } else {
            leftSection.classList.add('side-section');
            centerSection.classList.remove('full-width');
            if (rightSection) {
                rightSection.classList.add('side-section');
            }
        }
    }

    window.addEventListener('resize', adjustLayout);
    adjustLayout();
});
