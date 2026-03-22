import { S } from './state.js';

export const SIZES = [4, 8, 12, 16, 20, 24, 28, 32];

export function buildDivideGrid() {
    const grid = document.getElementById('divideGrid');
    SIZES.forEach(n => {
        const btn = document.createElement('button');
        btn.className   = 'opt-btn' + (n === 16 ? ' active' : '');
        btn.textContent = n;
        btn.dataset.n   = n;
        btn.onclick = () => {
            S.divide = n;
            grid.querySelectorAll('.opt-btn')
                .forEach(b => b.classList.toggle('active', +b.dataset.n === n));
        };
        grid.appendChild(btn);
    });
}
