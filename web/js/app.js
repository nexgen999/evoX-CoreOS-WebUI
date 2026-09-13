document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            navButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const activeSection = document.getElementById(`tab-${targetTab}`);
            if (activeSection) {
                activeSection.classList.add('active');
            }

            // Chargement sécurisé du Pegasus Store
            if (targetTab === 'pegasus-store' && window.evoXPegasusStore) {
                window.evoXPegasusStore.init();
            }
        });
    });

    const copyBtn = document.getElementById('btn-copy-pldmgr');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const urlText = document.getElementById('pldmgr-url-display')?.innerText;
            if (urlText) {
                navigator.clipboard.writeText(urlText).then(() => {
                    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copié !';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copier';
                    }, 2000);
                });
            }
        });
    }

    const creditsList = document.getElementById('credits-list');
    if (creditsList) {
        const credits = [
            'nexgen999',
            'ItsPLK for PLDMGR',
            'Master, Mustafa, SeregonWar, maj0r, ArkSama',
            'aldostools, VoX DoN,BX-AM',
            'Pippo, Phoenixx, Pegasus Dev, DLPS Team',
            'All Scene Community'
        ];

        creditsList.innerHTML = credits.map(c => `
            <li><i class="fa-solid fa-check accent"></i> ${c}</li>
        `).join('');
    }
});
